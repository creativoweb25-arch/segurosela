"use client";

import { useSyncExternalStore } from "react";

/**
 * Returns `false` during SSR and the initial client render (hydration),
 * then `true` after hydration completes.
 *
 * Uses `useSyncExternalStore` (the React-recommended pattern) to avoid
 * hydration mismatches and cascading renders.
 *
 * Use this to gate animation `initial` props or any client-only logic
 * that would otherwise cause hydration mismatches.
 */
const emptySubscribe = () => () => {};

export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot
    () => false, // server snapshot
  );
}
