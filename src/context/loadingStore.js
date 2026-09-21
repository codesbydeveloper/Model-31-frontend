let count = 0
const listeners = new Set()

function emit() {
  listeners.forEach((listener) => listener())
}

export function startLoading() {
  count += 1
  emit()
}

export function stopLoading() {
  count = Math.max(0, count - 1)
  emit()
}

export function getLoadingCount() {
  return count
}

export function subscribeLoading(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export async function withLoading(task) {
  startLoading()
  try {
    return await task()
  } finally {
    stopLoading()
  }
}
