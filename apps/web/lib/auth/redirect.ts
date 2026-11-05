/** Allow internal post-login destinations only. Prevent open redirects. */
export function safeNext(value: string | null | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/';
  const path = value.split(/[?#]/, 1)[0];
  return path === '/account' || path === '/' ? path : '/';
}
