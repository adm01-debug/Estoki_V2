import { Profiler, ProfilerOnRenderCallback, useCallback, useState } from 'react';
interface ProfileData { id: string; phase: string; actualDuration: number; baseDuration: number; startTime: number; commitTime: number; }
export function useProfiler(id: string) {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const onRender: ProfilerOnRenderCallback = useCallback((id, phase, actualDuration, baseDuration, startTime, commitTime) => {
    setProfiles(p => [...p, { id, phase, actualDuration, baseDuration, startTime, commitTime }]);
  }, []);
  const clear = useCallback(() => setProfiles([]), []);
  const getAverage = useCallback(() => {
    if (profiles.length === 0) return 0;
    return profiles.reduce((sum, p) => sum + p.actualDuration, 0) / profiles.length;
  }, [profiles]);
  const ProfilerWrapper = useCallback(({ children }: { children: React.ReactNode }) => <Profiler id={id} onRender={onRender}>{children}</Profiler>, [id, onRender]);
  return { profiles, clear, getAverage, ProfilerWrapper };
}
