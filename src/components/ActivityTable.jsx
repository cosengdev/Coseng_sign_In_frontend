import { formatTime } from '../utils/time'
import styles from './ActivityTable.module.css'

export default function ActivityTable({ entries }) {
  if (!entries || entries.length === 0) return null

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>Today's Activity</div>
      <div className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Sign In</th>
                <th>Sign Out</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => {
                const isActive = entry.signIn && !entry.signOut
                return (
                  <tr key={i}>
                    <td className={styles.nameCell}>
                      <span className={`${styles.dot} ${isActive ? styles.dotActive : styles.dotDone}`} />
                      {entry.name}
                    </td>
                    <td className={styles.roleCell}>{entry.role}</td>
                    <td className={styles.timeIn}>
                      {entry.signIn ? formatTime(entry.signIn) : '—'}
                    </td>
                    <td className={entry.signOut ? styles.timeOut : styles.timePending}>
                      {entry.signOut ? formatTime(entry.signOut) : 'Active'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
