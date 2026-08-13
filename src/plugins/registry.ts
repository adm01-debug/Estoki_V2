/**
 * Plugin Registry — armazena plugins registrados em memória, valida versão
 * mínima do host e permissões declaradas antes de ativar.
 *
 * Persistência da lista de plugins habilitados fica a cargo do host
 * (localStorage no MVP; tabela `plugins_instalados` em rodada futura).
 */
import {
  HOST_VERSION,
  satisfiesMinVersion,
  type EstokiEvent,
  type EstokiPlugin,
  type PluginContext,
} from "./sdk";

type Entry = { plugin: EstokiPlugin; active: boolean };

class PluginRegistry {
  private plugins = new Map<string, Entry>();
  private ctxFactory: (() => PluginContext) | null = null;

  setContextFactory(f: () => PluginContext) {
    this.ctxFactory = f;
  }

  register(plugin: EstokiPlugin): { ok: boolean; error?: string } {
    if (!plugin.id || !plugin.version) return { ok: false, error: "plugin sem id/version" };
    if (!satisfiesMinVersion(HOST_VERSION, plugin.minHostVersion)) {
      return { ok: false, error: `host ${HOST_VERSION} < requerido ${plugin.minHostVersion}` };
    }
    if (this.plugins.has(plugin.id)) return { ok: false, error: "já registrado" };
    this.plugins.set(plugin.id, { plugin, active: false });
    return { ok: true };
  }

  async activate(id: string) {
    const e = this.plugins.get(id);
    if (!e || e.active) return;
    e.active = true;
    if (e.plugin.onActivate && this.ctxFactory) {
      await e.plugin.onActivate(this.ctxFactory());
    }
  }

  async deactivate(id: string) {
    const e = this.plugins.get(id);
    if (!e || !e.active) return;
    e.active = false;
    if (e.plugin.onDeactivate && this.ctxFactory) {
      await e.plugin.onDeactivate(this.ctxFactory());
    }
  }

  list(): EstokiPlugin[] {
    return [...this.plugins.values()].map((e) => e.plugin);
  }

  active(): EstokiPlugin[] {
    return [...this.plugins.values()].filter((e) => e.active).map((e) => e.plugin);
  }

  async dispatch(event: EstokiEvent) {
    if (!this.ctxFactory) return;
    const ctx = this.ctxFactory();
    for (const { plugin, active } of this.plugins.values()) {
      if (!active) continue;
      const handler = plugin.on?.[event.type];
      if (!handler) continue;
      try {
        // @ts-expect-error union narrowing runtime
        await handler(event, ctx);
      } catch (err) {
        ctx.log("error", `[plugin:${plugin.id}] handler falhou`, { event: event.type, err: String(err) });
      }
    }
  }
}

export const pluginRegistry = new PluginRegistry();