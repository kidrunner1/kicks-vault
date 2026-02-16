"use client"

import { proxy, useSnapshot } from "valtio"

export const state = proxy({
  open: false,
})

export function useStore() {
  return useSnapshot(state)
}
