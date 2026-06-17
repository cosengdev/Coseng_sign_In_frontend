import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import FormCard from '../components/FormCard'
import { Field, Input, FieldRow } from '../components/Field'
import Button from '../components/Button'
import Alert from '../components/Alert'
import { signIn } from '../utils/api'
import styles from './ConfirmSignIn.module.css'

export default function ConfirmSignIn() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { badge, staff } = state || {}
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!staff) { navigate('/'); return null }

  async function handleConfirm() {
    setLoading(true); setError('')
    try {
      await signIn(badge)
      navigate('/success', { replace: true, state: { name: `${staff.firstName} ${staff.lastName}`, role: staff.role, badge, action: 'Signed in successfully' } })
    } catch (err) { setError(err.response?.data?.message || 'Sign in failed. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <FormCard title="Confirm & Sign In" subtitle="Verify your details are correct" backTo="/staff/badge">
      <Alert type="success">Profile found. Please confirm your details below.</Alert>
      <Field label="Badge Number"><Input value={badge} readOnly /></Field>
      <FieldRow>
        <Field label="First Name"><Input value={staff.firstName} readOnly /></Field>
        <Field label="Last Name"><Input value={staff.lastName} readOnly /></Field>
      </FieldRow>
      <Field label="Staff Role"><Input value={staff.role} readOnly /></Field>
      <Field label="Phone Number"><Input value={staff.phone} readOnly /></Field>
      <div className={styles.verified}>
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        Identity verified from records
      </div>
      <div className={styles.divider} />
      {error && <Alert type="error">{error}</Alert>}
      <Button onClick={handleConfirm} disabled={loading}>{loading ? 'Signing in...' : 'Confirm & Sign In'}</Button>
      <Button variant="outline" onClick={() => navigate('/')}>Cancel</Button>
    </FormCard>
  )
}
