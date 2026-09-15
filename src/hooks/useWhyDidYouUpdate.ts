import { useRef, useEffect } from "react";
import { logger } from "@/utils/logger";

export function useWhyDidYouUpdate(name: string, props: Record<string, unknown>) {
  const previousProps = useRef<Record<string, unknown>>({});
  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changes: Record<string, { from: unknown; to: unknown }> = {};
      allKeys.forEach((key) => {
        if (previousProps.current[key] !== props[key])
          changes[key] = { from: previousProps.current[key], to: props[key] };
      });
      if (Object.keys(changes).length && import.meta.env.DEV)
        logger.debug("Atualização de props detectada", { name, changes });
    }
    previousProps.current = props;
  });
}
