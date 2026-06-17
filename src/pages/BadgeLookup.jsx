import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FormCard from '../components/FormCard'
import { Field, Input } from '../components/Field'
import Button from '../components/Button'
import Alert from '../components/Alert'
import { lookupStaff } from '../utils/api'

export default function BadgeLookup() {
  const navigate = useNavigate()
  const [badge, setBadge] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  async function handleLookup() {
    const value = badge.trim().toUpperCase()
    setError('')
    if (!value) { setError('Please enter your badge number.'); return }
    setLoading(true)
    try {
      const res = await lookupStaff(value)
      const staff = res.data
      if (staff.isSignedInToday) {
        navigate('/staff/signout', { state: { badge: value, staff } })
      } else {
        navigate('/staff/confirm', { state: { badge: value, staff } })
      }
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/staff/register', { state: { badge: value } })
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally { setLoading(false) }
  }

  return (
    <FormCard title="Staff Access" subtitle="Enter your badge number to continue" backTo="/staff">
      <Alert type="info">Enter your badge number. New staff will be prompted to complete registration.</Alert>
      <Field label="Badge Number">
        <Input ref={inputRef} type="text" placeholder="e.g. EMP-1042" maxLength={15} autoComplete="off"
          value={badge} onChange={e => setBadge(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && handleLookup()} />
      </Field>
      {error && <Alert type="error">{error}</Alert>}
      <Button onClick={handleLookup} disabled={loading}>
        <svg viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" /></svg>
        {loading ? 'Looking up...' : 'Look Up Badge'}
      </Button>
    </FormCard>
  )
}
