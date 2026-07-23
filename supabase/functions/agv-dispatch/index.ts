import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";
import { getCorsHeaders } from "../_shared/cors.ts";
import { validateInput } from "../_shared/schemas.ts";
import { buildVda5050Order, dispatchOrder, type AgvProtocol } from "../_shared/agv.ts";

const ActionSchema = z.object({
  actionType: z.string().min(1),
  actionId: z.string().min(1),
  actionDescription: z.string().optional(),
  blockingType: z.enum(["NONE", "SOFT", "HARD"]).optional(),
  actionParameters: z.array(z.object({
    key: z.string(),
    value: z.union([z.string(), z.number(), z.boolean()]),
  })).optional(),
});

const BodySchema = z.object({
  device_id: z.string().uuid().optional(),   // se ausente, aloca AGV idle mais próximo
  mission_type: z.enum(["pickup", "dropoff", "transfer", "charge", "custom"]),
  origem: z.string().max(64).optional(),
  destino: z.string().min(1).max(64),
  order_id: z.string().uuid().optional(),
  prioridade: z.number().int().min(1).max(10).optional(),
  actions: z.array(ActionSchema).max(20).optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  const headers = { ...getCorsHeaders(req), "Content-Type": "application/json" };

  try {
    const raw = await req.json().catch(() => ({}));
    const v = validateInput(BodySchema, raw);
    if (!v.success) return new Response(JSON.stringify(v), { status: 400, headers });

    // JWT do usuário
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: userData } = jwt ? await supabase.auth.getUser(jwt) : { data: { user: null } };
    const userId = userData?.user?.id ?? null;
    if (!userId) return new Response(JSON.stringify({ error: "Autenticação obrigatória" }), { status: 401, headers });

    // Aloca AGV
    let deviceId = v.data.device_id ?? null;
    let device: {
      id: string; serial_number: string; manufacturer: string;
      protocol: AgvProtocol; endpoint: string | null;
      battery_pct: number | null; status: string;
    } | null = null;

    if (deviceId) {
      const { data } = await supabase.from("agv_devices")
        .select("id, serial_number, manufacturer, protocol, endpoint, battery_pct, status")
        .eq("id", deviceId).eq("ativo", true).maybeSingle();
      device = data as typeof device;
    } else {
      const { data } = await supabase.from("agv_devices")
        .select("id, serial_number, manufacturer, protocol, endpoint, battery_pct, status")
        .eq("ativo", true).eq("status", "idle")
        .order("battery_pct", { ascending: false, nullsFirst: false }).limit(1).maybeSingle();
      device = data as typeof device;
      deviceId = device?.id ?? null;
    }

    if (!device) {
      // Enfileirar sem AGV — será despachada quando um ficar livre
      const { data: queued, error } = await supabase.from("agv_missions").insert({
        mission_type: v.data.mission_type,
        origem: v.data.origem ?? null,
        destino: v.data.destino,
        order_id: v.data.order_id ?? null,
        prioridade: v.data.prioridade ?? 5,
        actions: v.data.actions ?? [],
        status: "queued",
        requested_by: userId,
      }).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({
        success: true, queued: true, mission: queued,
        message: "Nenhum AGV disponível — missão enfileirada",
      }), { headers });
    }

    // Cria missão persistida
    const { data: mission, error: mErr } = await supabase.from("agv_missions").insert({
      device_id: device.id,
      mission_type: v.data.mission_type,
      origem: v.data.origem ?? null,
      destino: v.data.destino,
      order_id: v.data.order_id ?? null,
      prioridade: v.data.prioridade ?? 5,
      actions: v.data.actions ?? [],
      status: "dispatched",
      requested_by: userId,
      dispatched_at: new Date().toISOString(),
    }).select().single();
    if (mErr) throw mErr;

    // Monta e despacha ordem VDA 5050
    const order = buildVda5050Order({
      manufacturer: device.manufacturer,
      serialNumber: device.serial_number,
      orderId: mission.id,
      origem: v.data.origem,
      destino: v.data.destino,
      actions: v.data.actions,
    });

    const dispatch = await dispatchOrder({
      protocol: device.protocol,
      endpoint: device.endpoint,
      order,
      timeoutMs: 8000,
    });

    // Atualiza status conforme resultado
    if (dispatch.success) {
      await supabase.from("agv_missions")
        .update({ status: "running", started_at: new Date().toISOString() })
        .eq("id", mission.id);
      await supabase.from("agv_devices")
        .update({ status: "busy" }).eq("id", device.id);
    } else {
      await supabase.from("agv_missions")
        .update({ status: "failed", error_message: dispatch.error ?? "Falha no despacho" })
        .eq("id", mission.id);
    }

    return new Response(JSON.stringify({
      success: dispatch.success,
      simulated: dispatch.simulated,
      mission_id: mission.id,
      device: { id: device.id, serial: device.serial_number, protocol: device.protocol },
      vda5050_order_id: order.orderId,
      dispatch: {
        http_status: dispatch.http_status ?? null,
        error: dispatch.error ?? null,
      },
    }), { status: dispatch.success ? 200 : 502, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400, headers });
  }
});
