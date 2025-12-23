import { useRef, useState, useCallback } from 'react';
export function useVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const play = useCallback(() => { videoRef.current?.play(); setIsPlaying(true); }, []);
  const pause = useCallback(() => { videoRef.current?.pause(); setIsPlaying(false); }, []);
  const toggle = useCallback(() => isPlaying ? pause() : play(), [isPlaying, play, pause]);
  const seek = useCallback((time: number) => { if (videoRef.current) videoRef.current.currentTime = time; }, []);
  return { videoRef, play, pause, toggle, seek, isPlaying };
}
