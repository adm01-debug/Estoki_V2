import { useState, useRef, useCallback } from 'react';
export function useAudio(src: string) {
  const audioRef = useRef(new Audio(src));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const play = useCallback(() => { audioRef.current.play(); setIsPlaying(true); }, []);
  const pause = useCallback(() => { audioRef.current.pause(); setIsPlaying(false); }, []);
  const toggle = useCallback(() => isPlaying ? pause() : play(), [isPlaying, play, pause]);
  const seek = useCallback((time: number) => { audioRef.current.currentTime = time; setCurrentTime(time); }, []);
  return { play, pause, toggle, seek, isPlaying, currentTime, duration: audioRef.current.duration };
}
