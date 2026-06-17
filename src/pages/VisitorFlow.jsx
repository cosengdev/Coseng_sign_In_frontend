import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormCard from '../components/FormCard'
import { Field, Input } from '../components/Field'
import Button from '../components/Button'
import Alert from '../components/Alert'
import { visitorSignIn, visitorSignOut, lookupVisitor } from '../utils/api'
import { validateName, validatePhone, validateHost, validateReason } from '../utils/validate'

const STEPS = { LOOKUP: 'lookup', REGISTER: 'register', SIGNOUT: 'signout' }

export default function VisitorFlow() {
  const navigate = useNavigate()
  const [step, setStep] = useState(STEPS.LOOKUP)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lookup, setLookup] = useState({ name: '', phone: '' })
  const [form, setForm] = useState({ name: '', phone: '', host: '', reason: '' })

  function updateLookup(f) { return e => setLookup(v => ({ ...v, [f]: e.target.value })) }
  function updateForm(f)   { return e => setForm(v => ({ ...v, [f]: e.target.value })) }

  async function handleLookup() {
    setError('')
    const nameErr = validateName(lookup.name)
    if (nameErr) { setError(nameErr); return }
    const phoneErr = validatePhone(lookup.phone)
    if (phoneErr) { setError(phoneErr); return }

    setLoading(true)
    try {
      const res = await lookupVisitor(lookup.name.trim(), lookup.phone.trim())
      if (res.data.isSignedInToday) {
        setStep(STEPS.SIGNOUT)
      } else {
        setForm(f => ({ ...f, name: lookup.name.trim(), phone: lookup.phone.trim() }))
        setStep(STEPS.REGISTER)
      }
    } catch { setError('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  async function handleSignIn() {
    setError('')
    const hostErr = validateHost(form.host)
    if (hostErr) { setError(hostErr); return }
    const reasonErr = validateReason(form.reason)
    if (reasonErr) { setError(reasonErr); return }

    setLoading(true)
    try {
      await visitorSignIn({ name: form.name, phone: form.phone, host: form.host.trim(), reason: form.reason.trim() })
      navigate('/success', {
        state: { name: form.name, role: `Visiting: ${form.host}`, badge: form.phone, action: 'Signed in successfully' },
        replace: true,
      })
    } catch (err) { setError(err.response?.data?.message || 'Sign in failed. Please try again.') }
    finally { setLoading(false) }
  }

  async function handleSignOut() {
    setError('')
    setLoading(true)
    try {
      await visitorSignOut(lookup.name.trim(), lookup.phone.trim())
      navigate('/success', {
        state: { name: lookup.name.trim(), role: 'Visitor', badge: lookup.phone.trim(), action: 'Signed out successfully' },
        replace: true,
      })
    } catch (err) { setError(err.response?.data?.message || 'Sign out failed. Please try again.') }
    finally { setLoading(false) }
  }

  if (step === STEPS.LOOKUP) return (
    <FormCard title="Visitor Sign In" subtitle="Enter your name and phone number" backTo="/">
      <Alert type="info">New visitors will complete a short registration. Returning visitors can sign out directly.</Alert>
      <Field label="Full Name"><Input placeholder="Your full name" value={lookup.name} onChange={updateLookup('name')} /></Field>
      <Field label="Phone Number"><Input type="tel" placeholder="e.g. 08012345678" value={lookup.phone} onChange={updateLookup('phone')} onKeyDown={e => e.key === 'Enter' && handleLookup()} /></Field>
      {error && <Alert type="error">{error}</Alert>}
      <Button onClick={handleLookup} disabled={loading}>
        <svg viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" /></svg>
        {loading ? 'Checking...' : 'Continue'}
      </Button>
    </FormCard>
  )

  if (step === STEPS.REGISTER) return (
    <FormCard title="Visitor Registration" subtitle="Please complete the form below" backTo="/visitor">
      <Field label="Full Name"><Input value={form.name} readOnly /></Field>
      <Field label="Phone Number"><Input value={form.phone} readOnly /></Field>
      <Field label="Who are you visiting?">
        <Input placeholder="Name of staff member or department" value={form.host} onChange={updateForm('host')} />
      </Field>
      <Field label="Reason for Visit">
        <Input placeholder="e.g. Meeting, Delivery, Interview..." value={form.reason} onChange={updateForm('reason')} />
      </Field>
      {error && <Alert type="error">{error}</Alert>}
      <Button onClick={handleSignIn} disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
    </FormCard>
  )

  return (
    <FormCard title="Visitor Sign Out" subtitle="Confirm your details to sign out" backTo="/visitor">
      <Alert type="warning">You are currently signed in. Confirm below to sign out.</Alert>
      <Field label="Full Name"><Input value={lookup.name} readOnly /></Field>
      <Field label="Phone Number"><Input value={lookup.phone} readOnly /></Field>
      {error && <Alert type="error">{error}</Alert>}
      <Button variant="danger" onClick={handleSignOut} disabled={loading}>
        <svg viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
        {loading ? 'Signing out...' : 'Confirm Sign Out'}
      </Button>
      <Button variant="outline" onClick={() => navigate('/')}>Cancel</Button>
    </FormCard>
  )
}
