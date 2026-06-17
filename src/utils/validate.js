// ── Frontend validation helpers ───────────────────────────
// These mirror the backend validation so errors show instantly
// without needing a round trip to the server

export function validateName(name) {
  if (!name || !name.trim()) return 'Name is required'
  if (name.trim().length < 2) return 'Name must be at least 2 characters'
  if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) return 'Name can only contain letters'
  return null
}

export function validatePhone(phone) {
  if (!phone || !phone.trim()) return 'Phone number is required'
  if (!/^[0-9+\s()-]{7,15}$/.test(phone.trim())) return 'Please enter a valid phone number'
  return null
}

export function validateBadge(badge) {
  if (!badge || !badge.trim()) return 'Badge number is required'
  if (!/^[A-Z0-9-]+$/.test(badge.trim())) return 'Badge number can only contain letters, numbers and hyphens'
  return null
}

export function validateReason(reason) {
  if (!reason || !reason.trim()) return 'Reason for visit is required'
  if (reason.trim().length < 3) return 'Please provide a more detailed reason'
  return null
}

export function validateHost(host) {
  if (!host || !host.trim()) return 'Please enter who you are visiting'
  return null
}
