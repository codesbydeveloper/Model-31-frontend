export function statusGuardMessage(err) {
  const code = err?.body?.code
  if (code !== 'STATUS_GUARD') return ''
  return err.body?.message || err.message || 'Status change blocked.'
}
