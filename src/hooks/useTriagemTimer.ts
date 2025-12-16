import { useState, useEffect, useCallback, useRef } from "react";

interface UseTriagemTimerReturn {
  /** Tempo decorrido em segundos */
  elapsedSeconds: number;
  /** Tempo formatado como string (HH:MM:SS) */
  formattedTime: string;
  /** Se o timer está rodando */
  isRunning: boolean;
  /** Inicia o timer */
  start: () => void;
  /** Pausa o timer */
  pause: () => void;
  /** Para e reseta o timer */
  reset: () => void;
  /** Para o timer e retorna o tempo final */
  stop: () => number;
  /** Data/hora de início */
  startTime: Date | null;
}

export function useTriagemTimer(): UseTriagemTimerReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Formata o tempo em HH:MM:SS
  const formatTime = useCallback((totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Inicia o timer
  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      if (!startTime) {
        setStartTime(new Date());
      }
    }
  }, [isRunning, startTime]);

  // Pausa o timer
  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Reseta o timer
  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setStartTime(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Para o timer e retorna o tempo final em segundos
  const stop = useCallback((): number => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return elapsedSeconds;
  }, [elapsedSeconds]);

  // Effect para o intervalo do timer
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  return {
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    isRunning,
    start,
    pause,
    reset,
    stop,
    startTime,
  };
}
