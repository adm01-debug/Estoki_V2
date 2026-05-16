import { useEffect, useRef, useCallback, useState } from "react";
import { toast } from "sonner";

interface KPIThreshold {
  metrica: string;
  nome: string;
  valorAtual: number;
  valorMeta: number;
  invertido?: boolean; // true if lower is better (e.g., tempo de triagem)
  unidade?: string;
}

interface UseKPIAlertsOptions {
  enabled?: boolean;
  soundEnabled?: boolean;
  checkInterval?: number; // ms
}

// Sound frequencies for different alert severities
const ALERT_SOUNDS = {
  warning: { frequency: 440, duration: 200, repeat: 2 }, // A4 note
  critical: { frequency: 880, duration: 150, repeat: 3 }, // A5 note
  success: { frequency: 523.25, duration: 300, repeat: 1 }, // C5 note
};

export function useKPIAlerts(options: UseKPIAlertsOptions = {}) {
  const { enabled = true, soundEnabled = true } = options;
  const audioContextRef = useRef<AudioContext | null>(null);
  const alertedKPIsRef = useRef<Set<string>>(new Set());
  const [criticalAlerts, setCriticalAlerts] = useState<string[]>([]);

  // Initialize AudioContext on user interaction
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play alert sound
  const playAlertSound = useCallback((type: "warning" | "critical" | "success") => {
    if (!soundEnabled) return;

    try {
      const audioContext = initAudioContext();
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const config = ALERT_SOUNDS[type];
      const gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);

      for (let i = 0; i < config.repeat; i++) {
        const oscillator = audioContext.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);
        oscillator.connect(gainNode);

        const startTime = audioContext.currentTime + i * 0.3;
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + config.duration / 1000);

        oscillator.start(startTime);
        oscillator.stop(startTime + config.duration / 1000);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.warn("[KPI Alerts] Could not play sound:", error);
    }
  }, [soundEnabled, initAudioContext]);

  // Check a single KPI against its threshold
  const checkKPI = useCallback((kpi: KPIThreshold): "ok" | "warning" | "critical" | null => {
    if (kpi.valorAtual === null || kpi.valorAtual === undefined) return null;
    if (kpi.valorMeta === 0) return null;

    const percentageDiff = kpi.invertido
      ? ((kpi.valorAtual - kpi.valorMeta) / kpi.valorMeta) * 100
      : ((kpi.valorMeta - kpi.valorAtual) / kpi.valorMeta) * 100;

    // Critical: more than 20% off target
    if (percentageDiff > 20) return "critical";
    // Warning: more than 10% off target
    if (percentageDiff > 10) return "warning";
    // OK
    if (percentageDiff <= 0) return "ok";
    return null;
  }, []);

  // Main check function
  const checkKPIs = useCallback((kpis: KPIThreshold[]) => {
    if (!enabled) return;

    const newCriticalAlerts: string[] = [];

    kpis.forEach((kpi) => {
      const status = checkKPI(kpi);
      const alertKey = `${kpi.metrica}-${status}`;

      if (status === "critical" || status === "warning") {
        newCriticalAlerts.push(kpi.metrica);

        // Only alert if we haven't alerted for this KPI recently
        if (!alertedKPIsRef.current.has(alertKey)) {
          alertedKPIsRef.current.add(alertKey);

          const isAbove = kpi.invertido
            ? kpi.valorAtual > kpi.valorMeta
            : kpi.valorAtual < kpi.valorMeta;

          const direction = kpi.invertido
            ? (isAbove ? "acima" : "abaixo")
            : (isAbove ? "abaixo" : "acima");

          const message = `${kpi.nome}: ${kpi.valorAtual.toFixed(1)}${kpi.unidade ?? ""} (${direction} da meta de ${kpi.valorMeta}${kpi.unidade ?? ""})`;

          if (status === "critical") {
            playAlertSound("critical");
            toast.error(`🚨 Alerta Crítico: ${kpi.nome}`, {
              description: message,
              duration: 10000,
            });
          } else {
            playAlertSound("warning");
            toast.warning(`⚠️ Atenção: ${kpi.nome}`, {
              description: message,
              duration: 7000,
            });
          }

          // Reset alert after 5 minutes to allow re-alerting
          setTimeout(() => {
            alertedKPIsRef.current.delete(alertKey);
          }, 5 * 60 * 1000);
        }
      } else if (status === "ok") {
        // KPI recovered - clear alerts for this metric
        const warningKey = `${kpi.metrica}-warning`;
        const criticalKey = `${kpi.metrica}-critical`;

        if (alertedKPIsRef.current.has(warningKey) || alertedKPIsRef.current.has(criticalKey)) {
          alertedKPIsRef.current.delete(warningKey);
          alertedKPIsRef.current.delete(criticalKey);
          playAlertSound("success");
          toast.success(`✅ ${kpi.nome} normalizado`, {
            description: `Valor atual: ${kpi.valorAtual.toFixed(1)}${kpi.unidade ?? ""}`,
            duration: 5000,
          });
        }
      }
    });

    setCriticalAlerts(newCriticalAlerts);
  }, [enabled, checkKPI, playAlertSound]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    checkKPIs,
    playAlertSound,
    criticalAlerts,
    hasCriticalAlerts: criticalAlerts.length > 0,
  };
}
