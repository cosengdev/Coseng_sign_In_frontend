export function formatTime(date) {
  const d = date instanceof Date ? date : new Date(date)
  let h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m} ${ampm}`
}

export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatShortDate(date) {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
