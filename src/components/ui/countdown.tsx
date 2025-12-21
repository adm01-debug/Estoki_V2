import { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: Date;
  onComplete?: () => void;
}

export function Countdown({ targetDate, onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const left = calculateTimeLeft();
      setTimeLeft(left);
      if (left.days + left.hours + left.minutes + left.seconds === 0) {
        clearInterval(timer);
        onComplete?.();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  return (
    <div className="flex gap-2 text-center">
      {Object.entries(timeLeft).map(([key, value]) => (
        <div key={key} className="bg-muted rounded p-2">
          <div className="text-2xl font-bold">{String(value).padStart(2, "0")}</div>
          <div className="text-xs text-muted-foreground">{key}</div>
        </div>
      ))}
    </div>
  );
}
