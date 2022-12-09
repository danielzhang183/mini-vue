import { isPromise } from 'util/types'
import { EMPTY_OBJ, ShapeFlags } from '@mini-vue/shared'
import { TrackOpTypes, track } from '@mini-vue/reactivity'
import type { AppContext } from './apiCreateApp'
import type { EmitFn, EmitsOptions } from './componentEmits'
import { normalizeEmitsOptions } from './componentEmits'
import type { ComponentOptions } from './componentOptions'
import type { ComponentPropsOptions } from './componentProps'
import { initProps, normalizePropsOptions } from './componentProps'
import type { Slots } from './componentSlots'
import { ErrorCodes, callWithErrorHandling } from './errorHandling'
import type { VNode } from './vnode'

// use `E extends any` to force evaluating type to fix #2362
export type SetupContext<E = EmitsOptions> = E extends any
  ? {
      attrs: Data
      slots: Slots
      emit: EmitFn<E>
      // expose: (exposed?: Record<string, any>) => void
    }
  : never

export interface ComponentInternalOptions {
  /**
   * @internal
   */
  __scopeId?: string
  /**
   * @internal
   */
  __cssModules?: Data
  /**
   * @internal
   */
  __hmrId?: string
  /**
   * Compat build only, for bailing out of certain compatibility behavior
   */
  __isBuiltIn?: boolean
  /**
   * This one should be exposed so that devtools can make use of it
   */
  __file?: string
  /**
   * name inferred from filename
   */
  __name?: string
}

export interface FunctionalComponent<
  P = {},
  E extends EmitsOptions = {},
>
  extends ComponentInternalOptions {
  // use of any here is intentional so it can be a valid JSX Element constructor
  (props: P, ctx: Omit<SetupContext<E>, 'expose'>): any
  props?: ComponentPropsOptions<P>
  // emits?: E | (keyof E)[]
  inheritAttrs?: boolean
  displayName?: string
}

export type ConcreteComponent<
  Props = {},
  // RawBindings = any,
  // D = any,
  // C extends ComputedOptions = ComputedOptions,
  // M extends MethodOptions = MethodOptions,
> =
  // | ComponentOptions<Props, RawBindings, D, C, M>
  | FunctionalComponent<Props, any>

type LifecycleHook<TFn = Function> = TFn[] | null

export const enum LifecycleHooks {
  BEFORE_CREATE = 'bc',
  CREATED = 'c',
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',
  BEFORE_UPDATE = 'bu',
  UPDATED = 'u',
  BEFORE_UNMOUNT = 'bum',
  UNMOUNTED = 'um',
  DEACTIVATED = 'da',
  ACTIVATED = 'a',
  RENDER_TRIGGERED = 'rtg',
  RENDER_TRACKED = 'rtc',
  ERROR_CAPTURED = 'ec',
  SERVER_PREFETCH = 'sp',
}

export type Data = Record<string, unknown>

export interface ComponentInternalInstance {
  uid: number
  type: ConcreteComponent
  parent: ComponentInternalInstance | null
  root: ComponentInternalInstance
  appContext: AppContext
  /**
   * Vnode representing this component in its parent's vdom tree
   */
  vnode: VNode
  /**
   * The pending new vnode from parent updates
   * @internal
   */
  next: VNode | null

  subTree: VNode

  effect: ReactiveEffect

  update: SchedulerJob

  render: InternalRenderFunction | null

  scope: EffectScope

  renderCache: (Function | VNode)[]

  components: Record<string, ConcreateComponent> | null

  propsOptions: NormalizedPropsOptions

  emitsOptions: ObjectEmitsOptions | null

  proxy: ComponentPublicInstance | null

  ctx: Data

  // state
  data: Data
  props: Data
  attrs: Data
  slots: InternalSlots
  refs: Data
  emit: EmitFn

  setupState: Data

  /**
   * @internal
   */
  setupContext: SetupContext | null

  isMounted: boolean
  isUnmounted: boolean
  isDeactivated: boolean

  /**
   * @internal
   */
  [LifecycleHooks.BEFORE_CREATE]: LifecycleHook
  /**
    * @internal
    */
  [LifecycleHooks.CREATED]: LifecycleHook
  /**
    * @internal
    */
  [LifecycleHooks.BEFORE_MOUNT]: LifecycleHook
  /**
    * @internal
    */
  [LifecycleHooks.MOUNTED]: LifecycleHook
  /**
    * @internal
    */
  [LifecycleHooks.BEFORE_UPDATE]: LifecycleHook
  /**
    * @internal
    */
  [LifecycleHooks.UPDATED]: LifecycleHook
  /**
    * @internal
    */
  [LifecycleHooks.BEFORE_UNMOUNT]: LifecycleHook
  /**
    * @internal
    */
  [LifecycleHooks.UNMOUNTED]: LifecycleHook
  /**
    * @internal
    */
  [LifecycleHooks.RENDER_TRACKED]: LifecycleHook
  /**
    * @internal
    */
  [LifecycleHooks.RENDER_TRIGGERED]: LifecycleHook
  /**
    * @internal
    */
  [LifecycleHooks.ACTIVATED]: LifecycleHook
  /**
    * @internal
    */
  [LifecycleHooks.DEACTIVATED]: LifecycleHook
  /**
    * @internal
    */
  [LifecycleHooks.ERROR_CAPTURED]: LifecycleHook
  /**
    * @internal
    */
  [LifecycleHooks.SERVER_PREFETCH]: LifecycleHook<() => Promise<unknown>>
}

const emptyAppContext = createAppContext()

let uid = 0

export function createComponentInstance(
  vnode: VNode,
  parent: ComponentInternalInstance | null,
) {
  // unresolve: as any
  const type = vnode.type as any as ConcreteComponent
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext

  const instance: ComponentInternalInstance = {
    uid: uid++,
    vnode,
    type,
    parent,
    appContext,
    root: null!, // to be immediately set
    next: null,
    subTree: null!, // will be set synchronously right after creation
    effect: null!,
    update: null!, // will be set synchronously right after creation
    scope: new EffectScope(true /* detached */),
    render: null,
    proxy: null,
    // exposed: null,
    // exposeProxy: null,
    // withProxy: null,
    // provides: parent ? parent.provides : Object.create(appContext.provides),
    // accessCache: null!,
    renderCache: [],

    // local resolved assets
    components: null,
    // directives: null,

    // resolved props and emits options
    propsOptions: normalizePropsOptions(type, appContext),
    emitsOptions: normalizeEmitsOptions(type, appContext),

    // emit
    emit: null!, // to be set immediately
    // emitted: null,

    // props default value
    // propsDefaults: EMPTY_OBJ,

    // inheritAttrs
    // inheritAttrs: type.inheritAttrs,

    // state
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,

    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null,
  }

  instance.ctx = { _: instance }
  instance.root = parent ? parent.root : instance

  return instance
}

export function isStatefulComponent(instance: ComponentInternalInstance) {
  return instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
}

export function setupComponent(
  instance: ComponentInternalInstance,
) {
  const { props } = instance.vnode
  const isStateful = isStatefulComponent(instance)
  initProps(instance, props, isStateful)

  const setupResult = isStateful
    ? setupStatefulComponent(instance)
    : undefined

  return setupResult
}

function setupStatefulComponent(
  instance: ComponentInternalInstance,
) {
  const Component = instance.type as ComponentOptions

  const { setup } = Component
  if (setup) {
    const setupContext = (instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null)

    setCurrentInstance(instance)
    pauseTracking()
    const setupResult = callWithErrorHandling(
      setup,
      instance,
      ErrorCodes.SETUP_FUNCTION,
      [shallowReadonly(instance.props)],
    )
    resetTracking()
    unsetCurrentInstance()

    if (isPromise(setupResult))
      setupResult.then(unsetCurrentInstance, unsetCurrentInstance)
    else
      handleSetupResult(instance, setupResult)
  }
  else {
    finishComponentSetup(instance)
  }
}

export function createSetupContext(
  instance: ComponentInternalInstance,
): SetupContext {
  let attrs: Data
  return {
    get attrs() {
      return attrs || (attrs = createAttrsProxy(instance))
    },
    slots: instance.slots,
    emit: instance.emit,
  }
}

function createAttrsProxy(instance: ComponentInternalInstance): Data {
  return new Proxy(
    instance.attrs,
    {
      get(target, key: string) {
        track(instance, '$attrs')
        return target[key]
      },
    },
  )
}
