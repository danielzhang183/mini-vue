import type { ComponentInternalInstance } from './component'

export interface SchedulerJob extends Function {
  id?: number
  pre?: boolean
  active?: boolean
  computed?: boolean
  allowRecurse?: boolean
  ownerInstance?: ComponentInternalInstance
}

export type SchedulerJobs = SchedulerJob | SchedulerJob[]

let isFlushing = false
let isFlushPending = false

const queue: SchedulerJob[] = []
let flushIndex = 0

const resolvedPromise = Promise.resolve() as Promise<any>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let currentFlushPromise: Promise<void> | null = null

type CountMap = Map<SchedulerJob, number>

export function queueJob(job: SchedulerJob) {
  if (
    !queue.length
    || !queue.includes(
      job,
      isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex,
    )
  ) {
    if (job.id == null)
      queue.push(job)
    else
      queue.splice(findInsertionIndex(job.id), 0, job)

    queueFlush()
  }
}

function findInsertionIndex(id: number) {
  let start = flushIndex + 1
  let end = queue.length

  while (start < end) {
    const middle = (start + end) >>> 1
    const middleJobId = getId(queue[middle])
    middleJobId < id ? (start = middle + 1) : (end = middle)
  }

  return start
}

// export function flushPostFlushCbs(seen?: CountMap) {
//   if ()
// }

function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}

const getId = (job: SchedulerJob): number =>
  job.id == null ? Infinity : job.id

const comparator = (a: SchedulerJob, b: SchedulerJob): number => {
  const diff = getId(a) - getId(b)
  if (diff === 0) {
    if (a.pre && !b.pre)
      return -1
    if (b.pre && !a.pre)
      return 1
  }
  return diff
}

function flushJobs(seen?: CountMap) {
  isFlushPending = false
  isFlushing = true

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  seen = seen || new Map()
  queue.sort(comparator)

  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex]
      if (job && job.active !== false) {
        // run
      }
    }
  }
  finally {
    flushIndex = 0
    queue.length = 0

    // flushPostFlushCbs(seen)

    isFlushing = false
    currentFlushPromise = null
  }
}
