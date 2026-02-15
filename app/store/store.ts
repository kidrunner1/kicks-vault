import { proxy, useSnapshot } from "valtio"

/**
 * Store type
 */
export interface StoreState {
  open: boolean
}

/**
 * Global mutable state (WRITE here)
 */
export const state = proxy<StoreState>({
  open: false,
})

/**
 * Hook to read state (READ only)
 */
export function useStore(): Readonly<StoreState> {
  return useSnapshot(state)
}
