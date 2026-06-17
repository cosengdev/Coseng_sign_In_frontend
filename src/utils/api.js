import axios from 'axios'

// ─────────────────────────────────────────────────────────
// MOCK MODE — set to false when backend is ready
// ─────────────────────────────────────────────────────────
const MOCK_MODE = true

// Safety check — warn in console if accidentally left on in production
if (!MOCK_MODE && import.meta.env.DEV) {
  console.warn('⚠️ MOCK_MODE is off — connecting to real backend')
}

// ── In-memory store ───────────────────────────────────────
const mockDB = {
  staff: {
    'EMP-001': { badgeNumber: 'EMP-001', firstName: 'Amina', lastName: 'Yusuf', role: 'Data and Research Analysts', phone: '08012345678' },
  },
  admins: {
    'ADM-001': { pin: '123456', name: 'Grace Mwanret' },
  },
  staffLogs: [
    { id: 1, badgeNumber: 'EMP-001', name: 'Amina Yusuf', role: 'Data and Research Analysts', signIn: new Date(Date.now() - 86400000).toISOString(), signOut: new Date(Date.now() - 82800000).toISOString() },
    { id: 2, badgeNumber: 'EMP-001', name: 'Amina Yusuf', role: 'Data and Research Analysts', signIn: new Date(Date.now() - 172800000).toISOString(), signOut: new Date(Date.now() - 169200000).toISOString() },
  ],
  visitorLogs: [],
}

function mockDelay(ms = 300) { return new Promise(r => setTimeout(r, ms)) }
function mockResponse(data) { return { data } }
function mockError(status, message) {
  const err = new Error(message)
  err.response = { status, data: { message } }
  return Promise.reject(err)
}
function getOpenStaffEntry(badgeNumber) {
  return [...mockDB.staffLogs].reverse().find(e => e.badgeNumber === badgeNumber && !e.signOut) || null
}
function getOpenVisitorEntry(name, phone) {
  return [...mockDB.visitorLogs].reverse().find(e =>
    e.name.toLowerCase() === name.toLowerCase() && e.phone === phone && !e.signOut
  ) || null
}

// Track recent submissions to prevent double-clicks (mock)
const recentSubmissions = new Set()
function isDuplicate(key) {
  if (recentSubmissions.has(key)) return true
  recentSubmissions.add(key)
  setTimeout(() => recentSubmissions.delete(key), 3000)
  return false
}

const mock = {
  lookupStaff: async (badgeNumber) => {
    await mockDelay()
    const staff = mockDB.staff[badgeNumber]
    if (!staff) return mockError(404, 'Staff not found')
    return mockResponse({ ...staff, isSignedInToday: !!getOpenStaffEntry(badgeNumber) })
  },
  registerStaff: async (data) => {
    await mockDelay()
    if (mockDB.staff[data.badgeNumber]) return mockError(409, 'Badge number already registered')
    mockDB.staff[data.badgeNumber] = data
    return mockResponse(data)
  },
  signIn: async (badgeNumber) => {
    await mockDelay()
    if (isDuplicate(`signin-${badgeNumber}`)) return mockResponse({ success: true })
    const staff = mockDB.staff[badgeNumber]
    if (!staff) return mockError(404, 'Staff not found')
    mockDB.staffLogs.push({ id: Date.now(), badgeNumber, name: `${staff.firstName} ${staff.lastName}`, role: staff.role, signIn: new Date().toISOString(), signOut: null })
    return mockResponse({ success: true })
  },
  signOut: async (badgeNumber, phone) => {
    await mockDelay()
    const staff = mockDB.staff[badgeNumber]
    if (!staff) return mockError(404, 'Staff not found')
    if (staff.phone && staff.phone !== phone) return mockError(401, 'Phone number does not match')
    const entry = getOpenStaffEntry(badgeNumber)
    if (entry) entry.signOut = new Date().toISOString()
    return mockResponse({ success: true })
  },
  adminLogin: async (badgeNumber, pin) => {
    await mockDelay()
    const admin = mockDB.admins[badgeNumber]
    if (!admin || admin.pin !== pin) return mockError(401, 'Invalid badge number or PIN')
    // Return a fake token so the frontend flow works identically
    return mockResponse({ token: 'mock-token-' + Date.now(), badgeNumber, name: admin.name, role: 'Administrator' })
  },
  visitorSignIn: async (data) => {
    await mockDelay()
    if (isDuplicate(`visitor-${data.phone}`)) return mockResponse({ success: true })
    mockDB.visitorLogs.push({ id: Date.now(), ...data, signIn: new Date().toISOString(), signOut: null })
    return mockResponse({ success: true })
  },
  visitorSignOut: async (name, phone) => {
    await mockDelay()
    const entry = getOpenVisitorEntry(name, phone)
    if (!entry) return mockError(404, 'No active visitor session found')
    entry.signOut = new Date().toISOString()
    return mockResponse({ success: true })
  },
  lookupVisitor: async (name, phone) => {
    await mockDelay()
    return mockResponse({ isSignedInToday: !!getOpenVisitorEntry(name, phone) })
  },
  getStaffLogs: async () => {
    await mockDelay(100)
    return mockResponse([...mockDB.staffLogs].reverse())
  },
  getVisitorLogs: async () => {
    await mockDelay(100)
    return mockResponse([...mockDB.visitorLogs].reverse())
  },
}

// ── Real Axios instance ───────────────────────────────────
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every real request automatically
api.interceptors.request.use(config => {
  const session = sessionStorage.getItem('adminSession')
  if (session) {
    const { token } = JSON.parse(session)
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If token expires mid-session, redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && window.location.pathname.includes('dashboard')) {
      sessionStorage.removeItem('adminSession')
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  }
)

// ── Exports ───────────────────────────────────────────────
export const lookupStaff    = (badge)        => MOCK_MODE ? mock.lookupStaff(badge)         : api.get(`/staff/${badge}`)
export const registerStaff  = (data)         => MOCK_MODE ? mock.registerStaff(data)         : api.post('/staff', data)
export const signIn         = (badge)        => MOCK_MODE ? mock.signIn(badge)               : api.post('/attendance/signin', { badgeNumber: badge })
export const signOut        = (badge, phone) => MOCK_MODE ? mock.signOut(badge, phone)       : api.post('/attendance/signout', { badgeNumber: badge, phone })
export const adminLogin     = (badge, pin)   => MOCK_MODE ? mock.adminLogin(badge, pin)      : api.post('/admin/login', { badgeNumber: badge, pin })
export const visitorSignIn  = (data)         => MOCK_MODE ? mock.visitorSignIn(data)         : api.post('/visitor/signin', data)
export const visitorSignOut = (name, phone)  => MOCK_MODE ? mock.visitorSignOut(name, phone) : api.post('/visitor/signout', { name, phone })
export const lookupVisitor  = (name, phone)  => MOCK_MODE ? mock.lookupVisitor(name, phone)  : api.get(`/visitor/lookup?name=${encodeURIComponent(name)}&phone=${phone}`)
export const getStaffLogs   = ()             => MOCK_MODE ? mock.getStaffLogs()              : api.get('/admin/logs/staff')
export const getVisitorLogs = ()             => MOCK_MODE ? mock.getVisitorLogs()            : api.get('/admin/logs/visitors')

export default api
