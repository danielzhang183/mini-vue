import { ShapeFlags } from '@mini-vue/shared'
import type { ComponentInternalInstance, FunctionalComponent } from './component'
import { setCurrentRenderingInstance } from './componentRenderContext'
import type { VNode } from './vnode'
import { Comment, createVNode, normalizeVNode } from './vnode'

let accessedAttrs = false

export function renderComponentRoot(
  instance: ComponentInternalInstance,
): VNode {
  const {
    type: Component,
    vnode,
    proxy,
    props,
    propsOptions: [propsOptions],
    slots,
    attrs,
    emit,
    render,
    renderCache,
    data,
    setupState,
    ctx,
    inheritAttrs,
  } = instance

  let result
  let fallthroughAttrs
  const prev = setCurrentRenderingInstance(instance)
  accessedAttrs = false

  try {
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      const proxyToUse = proxy
      result = normalizeVNode(
        render!.call(
          proxyToUse,
          proxyToUse,
          renderCache,
          props,
          setupState,
          data,
          ctx,
        ),
      )
      fallthroughAttrs = attrs
    }
    else {
      const render = Component as FunctionalComponent
      result = normalizeVNode(
        render.length > 1
          ? render(

          )
          : render(props, null as any),
      )
      fallthroughAttrs = Component.props
        ? attrs
        : getFunctionalFallthrough(attrs)
    }
  }
  catch (err) {
    result = createVNode(Comment)
  }

  setCurrentRenderingInstance(prev)
  return result
}
