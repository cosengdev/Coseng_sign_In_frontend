import styles from './Field.module.css'

export function Field({ label, children }) {
  return (
    <div className={styles.field}>
      {label && <label className={styles.label}>{label}</label>}
      {children}
    </div>
  )
}

export function Input({ readOnly, ...props }) {
  return (
    <input
      className={`${styles.input} ${readOnly ? styles.readonly : ''}`}
      readOnly={readOnly}
      {...props}
    />
  )
}

export function Select({ children, ...props }) {
  return (
    <select className={styles.select} {...props}>
      {children}
    </select>
  )
}

export function FieldRow({ children }) {
  return <div className={styles.row}>{children}</div>
}
