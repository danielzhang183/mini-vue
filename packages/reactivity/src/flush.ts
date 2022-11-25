export const queue: Set<Function> = new Set()

const p = Promise.resolve()

let isFlushing = false

export function flushJob() {
  if (isFlushing)
    return

  isFlushing = true

  p.then(() => {
    queue.forEach(job => job())
  }).finally(() => {
    isFlushing = false
  })
}
