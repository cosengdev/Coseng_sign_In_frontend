import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import FormCard from '../components/FormCard'
import { Field, Input } from '../components/Field'
import Button from '../components/Button'
import Alert from '../components/Alert'
import { signOut } from '../utils/api'

export default function SignOut() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { badge, staff } = state || {}
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!staff) { navigate('/'); return null }

  async function handleSignOut() {
    setError('')
    if (!phone.trim()) { setError('Please enter your phone number.'); return }
    setLoading(true)
    try {
      await signOut(badge, phone.trim())
      navigate('/success', { replace: true, state: { name: `${staff.firstName} ${staff.lastName}`, role: staff.role, badge, action: 'Signed out successfully' } })
    } catch (err) {
      if (err.response?.status === 401) { setError('Phone number does not match our records. Please try again.') }
      else { setError(err.response?.data?.message || 'Sign out failed. Please try again.') }
    } finally { setLoading(false) }
  }

  return (
    <FormCard title="Sign Out" subtitle="Enter your badge and phone number" backTo="/staff/badge">
      <Alert type="warning">You are currently signed in. Enter your phone number below to confirm sign out.</Alert>
      <Field label="Badge Number"><Input value={badge} readOnly /></Field>
      <Field label="Phone Number">
        <Input type="tel" placeholder="Enter your registered phone number" value={phone}
          onChange={e => setPhone(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSignOut()} autoFocus />
      </Field>
      {error && <Alert type="error">{error}</Alert>}
      <Button variant="danger" onClick={handleSignOut} disabled={loading}>
        <svg viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
        {loading ? 'Signing out...' : 'Confirm Sign Out'}
      </Button>
      <Button variant="outline" onClick={() => navigate('/')}>Cancel</Button>
    </FormCard>
  )
}
