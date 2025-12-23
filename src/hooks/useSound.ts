import { useCallback, useRef } from 'react';

const sounds = {
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  notification: '/sounds/notification.mp3',
  scan: '/sounds/scan.mp3',
};

export function useSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback((sound: keyof typeof sounds, volume = 0.5) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(sounds[sound]);
      audioRef.current.volume = volume;
      audioRef.current.play().catch(() => {});
    } catch {}
  }, []);

  const playSuccess = useCallback(() => play('success'), [play]);
  const playError = useCallback(() => play('error'), [play]);
  const playNotification = useCallback(() => play('notification'), [play]);
  const playScan = useCallback(() => play('scan'), [play]);

  return { play, playSuccess, playError, playNotification, playScan };
}

export default useSound;
