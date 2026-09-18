const configuredApiUrl = import.meta.env.VITE_API_URL || 'https://blue-chalk-backend.vercel.app'

const getBackendOrigin = () => {
  try {
    return new URL(configuredApiUrl).origin
  } catch {
    return 'https://blue-chalk-backend.vercel.app'
  }
}

const backendOrigin = getBackendOrigin()

export const getImageUrl = (url) => {
  if (!url) return ''

  const value = String(url).trim()

  if (!value) return ''
  if (value.startsWith('data:') || value.startsWith('blob:')) return value

  if (/^https?:\/\//i.test(value)) {
    const parsedUrl = new URL(value)

    if (
      (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') &&
      parsedUrl.port === '5000'
    ) {
      return `${backendOrigin}${parsedUrl.pathname.replace(/^\/api(?=\/uploads(?:\/|$))/, '')}${parsedUrl.search}`
    }

    return value
  }

  const path = value.startsWith('/') ? value : `/${value}`
  return `${backendOrigin}${path.replace(/^\/api(?=\/uploads(?:\/|$))/, '')}`
}

export default getImageUrl