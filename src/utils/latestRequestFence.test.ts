import { describe, expect, it } from 'vitest'
import { createLatestRequestFence } from './latestRequestFence'

interface Deferred<T> {
  promise: Promise<T>
  resolve(value: T): void
  reject(reason: unknown): void
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

describe('latest request fence', () => {
  it('prevents an older success or error from changing the newest form and loading state', async () => {
    const fence = createLatestRequestFence()
    const older = deferred<string>()
    const newer = deferred<string>()
    let formValue = ''
    let loading = false

    const consume = async (request: Deferred<string>, generation: number) => {
      try {
        const value = await request.promise
        if (fence.isCurrent(generation)) formValue = value
      } catch {
        if (fence.isCurrent(generation)) formValue = 'error'
      } finally {
        if (fence.isCurrent(generation)) loading = false
      }
    }

    loading = true
    const olderTask = consume(older, fence.begin())
    loading = true
    const newerTask = consume(newer, fence.begin())

    older.reject(new Error('stale request failed'))
    await olderTask
    expect(formValue).toBe('')
    expect(loading).toBe(true)

    newer.resolve('organization-2')
    await newerTask
    expect(formValue).toBe('organization-2')
    expect(loading).toBe(false)
  })

  it('invalidates an in-flight response when the dialog closes', async () => {
    const fence = createLatestRequestFence()
    const request = deferred<string>()
    let dialogVisible = true
    let formValue = ''
    let loading = true
    const generation = fence.begin()

    const task = request.promise.finally(() => {
      if (fence.isCurrent(generation)) {
        formValue = 'stale'
        dialogVisible = true
        loading = false
      }
    })

    fence.cancel()
    dialogVisible = false
    loading = false
    request.resolve('organization-1')
    await task

    expect(formValue).toBe('')
    expect(dialogVisible).toBe(false)
    expect(loading).toBe(false)
    expect(fence.isCurrent(generation)).toBe(false)
  })
})
