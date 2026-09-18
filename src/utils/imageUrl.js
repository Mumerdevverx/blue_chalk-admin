const configuredApiUrl = import.meta.env.VITE_API_URL || 'https://blue-chalk-backend.vercel.app/api'

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

  if (value.startsWith('http://localhost:5000') || value.startsWith('http://127.0.0.1:5000')) {
    const legacyPath = value.replace(/^https?:\/\/[^/]+/, '')
    return `${backendOrigin}${legacyPath.replace(/^\/api(?=\/uploads(?:\/|$))/, '')}`
  }

  if (/^https?:\/\//i.test(value)) return value

  const path = value.startsWith('/') ? value : `/${value}`
  return `${backendOrigin}${path.replace(/^\/api(?=\/uploads(?:\/|$))/, '')}`
}

export default getImageUrl