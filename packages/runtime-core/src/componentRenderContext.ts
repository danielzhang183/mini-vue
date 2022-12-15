import type { ComponentInternalInstance } from './component'

export let currentRenderingInstance: ComponentInternalInstance | null = null
export let currentScopeId: string | null = null

export function setCurrentRenderingInstance(
  instance: ComponentInternalInstance | null,
) {
  const prev = currentRenderingInstance
  currentRenderingInstance = instance
  currentScopeId = (instance && instance.type.__scopeId) || null

  return prev
}
