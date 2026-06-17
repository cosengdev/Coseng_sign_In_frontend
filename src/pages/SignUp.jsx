import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import FormCard from '../components/FormCard'
import { Field, Input, Select, FieldRow } from '../components/Field'
import Button from '../components/Button'
import Alert from '../components/Alert'
import { registerStaff, signIn } from '../utils/api'
import { STAFF_ROLES } from '../utils/constants'
import { validateName, validatePhone } from '../utils/validate'

export default function SignUp() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const badge = state?.badge || ''
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', role: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })) }

  async function handleSubmit() {
    setError('')
    const { firstName, lastName, phone, role } = form

    // Frontend validation
    const firstErr = validateName(firstName)
    if (firstErr) { setError(firstErr); return }
    const lastErr = validateName(lastName)
    if (lastErr) { setError(lastErr); return }
    const phoneErr = validatePhone(phone)
    if (phoneErr) { setError(phoneErr); return }
    if (!role) { setError('Please select a role.'); return }

    setLoading(true)
    try {
      await registerStaff({ badgeNumber: badge, firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim(), role })
      await signIn(badge)
      navigate('/success', { state: { name: `${firstName.trim()} ${lastName.trim()}`, role, badge, action: 'Registered & signed in successfully' }, replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <FormCard title="New Staff Registration" subtitle="First-time sign in — complete your profile" backTo="/staff/badge">
      <Field label="Badge Number"><Input value={badge} readOnly /></Field>
      <FieldRow>
        <Field label="First Name"><Input placeholder="First name" value={form.firstName} onChange={update('firstName')} /></Field>
        <Field label="Last Name"><Input placeholder="Last name" value={form.lastName} onChange={update('lastName')} /></Field>
      </FieldRow>
      <Field label="Phone Number"><Input type="tel" placeholder="e.g. 08012345678" value={form.phone} onChange={update('phone')} /></Field>
      <Field label="Staff Role">
        <Select value={form.role} onChange={update('role')}>
          <option value="">Select role</option>
          {STAFF_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </Select>
      </Field>
      {error && <Alert type="error">{error}</Alert>}
      <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Registering...' : 'Complete Registration & Sign In'}</Button>
    </FormCard>
  )
}
