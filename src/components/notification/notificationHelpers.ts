import { toast } from "sonner";

export const getTipoSeveridade = (tipo: string): "info" | "warning" | "critical" => {
  if (tipo.includes('divergencia')) return 'critical';
  if (tipo.includes('chegou')) return 'warning';
  return 'info';
};

export const mapSeveridade = (severidade: string): "info" | "warning" | "critical" => {
  switch (severidade) {
    case 'critico':
    case 'urgente':
      return 'critical';
    case 'aviso':
      return 'warning';
    case 'info':
    default:
      return 'info';
  }
};

export const playNotificationSound = (type: 'info' | 'warning' | 'critical' = 'info') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    const frequencies = {
      info: [523.25, 659.25],
      warning: [440, 554.37, 659.25],
      critical: [349.23, 440, 349.23, 440],
    };
    const freqs = frequencies[type];
    const duration = type === 'critical' ? 0.15 : 0.1;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    let time = audioContext.currentTime;
    freqs.forEach((freq, i) => { oscillator.frequency.setValueAtTime(freq, time + i * duration); });
    const totalDuration = freqs.length * duration;
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + totalDuration);
    oscillator.start(time);
    oscillator.stop(time + totalDuration + 0.05);
  } catch {
    if (import.meta.env.DEV) console.log('Audio not available');
  }
};

export const showNotificationToast = (notification: { title: string; message: string; type: string }) => {
  const severity = getTipoSeveridade(notification.type);
  if (severity === 'critical' || notification.type.includes('divergencia')) {
    toast.error(notification.title, { description: notification.message, duration: 8000, action: { label: "Ver", onClick: () => {} } });
  } else if (severity === 'warning' || notification.type.includes('chegou')) {
    toast.warning(notification.title, { description: notification.message, duration: 6000 });
  } else {
    toast.success(notification.title, { description: notification.message, duration: 5000 });
  }
};
