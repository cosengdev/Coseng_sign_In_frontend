import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FormCard from '../../components/FormCard'
import { Field, Input } from '../../components/Field'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import { adminLogin } from '../../utils/api'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [badge, setBadge] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const badgeRef = useRef(null)

  useEffect(() => { badgeRef.current?.focus() }, [])

  async function handleLogin() {
    setError('')
    if (!badge.trim() || !pin.trim()) { setError('Please enter your badge number and PIN.'); return }
    setLoading(true)
    try {
      const res = await adminLogin(badge.trim().toUpperCase(), pin.trim())
      // Store admin session in sessionStorage (clears when browser tab closes)
      sessionStorage.setItem("adminSession", JSON.stringify(res.data))
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid badge number or PIN.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormCard title="Admin Login" subtitle="Enter your badge number and PIN" backTo="/staff">
      <Alert type="info">
        This area is restricted to authorised administrators only.
      </Alert>
      <Field label="Badge Number">
        <Input ref={badgeRef} type="text" placeholder="e.g. ADM-001" maxLength={15} autoComplete="off"
          value={badge} onChange={e => setBadge(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
      </Field>
      <Field label="Admin PIN">
        <Input type="password" placeholder="Enter your PIN" maxLength={10}
          value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
      </Field>
      {error && <Alert type="error">{error}</Alert>}
      <Button onClick={handleLogin} disabled={loading}>
        {loading ? 'Verifying...' : 'Login to Dashboard'}
      </Button>
    </FormCard>
  )
}
