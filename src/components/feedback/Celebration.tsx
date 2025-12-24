import React from 'react';
import { Confetti } from './Confetti';
import { Fireworks } from './Fireworks';

interface CelebrationProps {
  type?: 'confetti' | 'fireworks' | 'both';
  active: boolean;
  duration?: number;
}

export function Celebration({ type = 'confetti', active, duration = 3000 }: CelebrationProps) {
  return (
    <>
      {(type === 'confetti' || type === 'both') && (
        <Confetti active={active} duration={duration} />
      )}
      {(type === 'fireworks' || type === 'both') && (
        <Fireworks active={active} duration={duration} />
      )}
    </>
  );
}
