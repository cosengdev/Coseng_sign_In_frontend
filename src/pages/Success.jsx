import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Button from '../components/Button'
import { formatTime, formatShortDate } from '../utils/time'
import styles from './Success.module.css'

export default function Success() {
  const navigate = useNavigate()
  const { state } = useLocation()
  useEffect(() => { if (!state) navigate('/') }, [state, navigate])
  if (!state) return null
  const { name, role, badge, action } = state
  const now = new Date()

  return (
    <div className={styles.card}>
      <div className={styles.body}>
        <div className={styles.iconWrap}>
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h2 className={styles.name}>{name}</h2>
        <p className={styles.action}>{action}</p>
        <div className={styles.grid}>
          <div className={styles.item}><div className={styles.lbl}>Badge / ID</div><div className={styles.val}>{badge}</div></div>
          <div className={styles.item}><div className={styles.lbl}>Role / Purpose</div><div className={styles.val}>{role}</div></div>
          <div className={styles.item}><div className={styles.lbl}>Time</div><div className={styles.val}>{formatTime(now)}</div></div>
          <div className={styles.item}><div className={styles.lbl}>Date</div><div className={styles.val}>{formatShortDate(now)}</div></div>
        </div>
        <Button onClick={() => navigate('/')}>Done</Button>
      </div>
    </div>
  )
}
