import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStaffLogs, getVisitorLogs } from '../../utils/api'
import { formatTime, formatShortDate } from '../../utils/time'
import styles from './AdminDashboard.module.css'

// ── Download helpers ──────────────────────────────────────
function downloadCSV(data, filename) {
  if (!data.length) return
  const headers = Object.keys(data[0])
  const rows = data.map(row => headers.map(h => `"${(row[h] ?? '').toString().replace(/"/g, '""')}"`).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function downloadPDF(data, title) {
  if (!data.length) return
  const headers = Object.keys(data[0])
  const rows = data.map(row => `<tr>${headers.map(h => `<td>${row[h] ?? '—'}</td>`).join('')}</tr>`).join('')
  const html = `<!DOCTYPE html><html><head><title>${title}</title>
  <style>
    body{font-family:Arial,sans-serif;padding:32px;}
    h1{font-size:20px;margin-bottom:4px;color:#0a2540;}
    p{font-size:12px;color:#666;margin-bottom:20px;}
    table{width:100%;border-collapse:collapse;font-size:12px;}
    th{background:#0a2540;color:white;padding:8px 12px;text-align:left;}
    td{padding:8px 12px;border-bottom:1px solid #dce6f0;}
    tr:nth-child(even) td{background:#f4f8fd;}
  </style></head><body>
  <h1>COSENG Limited — ${title}</h1>
  <p>Generated: ${new Date().toLocaleString('en-GB')}</p>
  <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
  <tbody>${rows}</tbody></table>
  </body></html>`
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (win) { win.onload = () => { win.print(); URL.revokeObjectURL(url) } }
}

function formatLogsForExport(logs, type) {
  return logs.map(l => {
    if (type === 'staff') return {
      'Badge':    l.badgeNumber || '',
      'Name':     l.name || '',
      'Role':     l.role || '',
      'Sign In':  l.signIn  ? `${formatShortDate(l.signIn)}  ${formatTime(l.signIn)}`  : '—',
      'Sign Out': l.signOut ? `${formatShortDate(l.signOut)} ${formatTime(l.signOut)}` : '—',
    }
    return {
      'Name':             l.name   || '',
      'Phone':            l.phone  || '',
      'Visiting':         l.host   || '',
      'Reason for Visit': l.reason || '',
      'Sign In':  l.signIn  ? `${formatShortDate(l.signIn)}  ${formatTime(l.signIn)}`  : '—',
      'Sign Out': l.signOut ? `${formatShortDate(l.signOut)} ${formatTime(l.signOut)}` : '—',
    }
  })
}

// ── Search filter ─────────────────────────────────────────
function filterLogs(logs, query, dateFilter, type) {
  const q = query.toLowerCase().trim()
  return logs.filter(l => {
    // Text search — name, badge (staff), phone (visitor)
    const textMatch = !q || (
      l.name?.toLowerCase().includes(q) ||
      (type === 'staff'   && l.badgeNumber?.toLowerCase().includes(q)) ||
      (type === 'visitor' && l.phone?.includes(q)) ||
      l.role?.toLowerCase().includes(q) ||
      l.host?.toLowerCase().includes(q)
    )
    // Date filter
    const dateMatch = !dateFilter || (
      l.signIn && new Date(l.signIn).toISOString().slice(0, 10) === dateFilter
    )
    return textMatch && dateMatch
  })
}

// ── Stat cards (always based on today) ───────────────────
function todayOnly(logs) {
  const start = new Date(); start.setHours(0, 0, 0, 0)
  return logs.filter(l => l.signIn && new Date(l.signIn) >= start)
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tab, setTab]               = useState('staff')
  const [staffLogs, setStaffLogs]   = useState([])
  const [visitorLogs, setVisitorLogs] = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const admin = JSON.parse(sessionStorage.getItem('adminSession') || 'null')

  useEffect(() => {
    if (!admin) { navigate('/admin/login'); return }
    Promise.all([getStaffLogs(), getVisitorLogs()])
      .then(([s, v]) => { setStaffLogs(s.data); setVisitorLogs(v.data) })
      .finally(() => setLoading(false))
  }, [])

  // Reset search when switching tabs
  function switchTab(t) { setTab(t); setSearch(''); setDateFilter('') }

  function handleLogout() { sessionStorage.removeItem('adminSession'); navigate('/') }

  const rawLogs    = tab === 'staff' ? staffLogs : visitorLogs
  const filtered   = useMemo(() => filterLogs(rawLogs, search, dateFilter, tab), [rawLogs, search, dateFilter, tab])
  const exportData = formatLogsForExport(filtered, tab)
  const exportTitle = tab === 'staff' ? 'Staff Attendance Log' : 'Visitor Log'

  const todayStaff   = todayOnly(staffLogs)
  const todayVisitor = todayOnly(visitorLogs)

  return (
    <div className={styles.wrapper}>

      {/* Top bar */}
      <div className={styles.topBar}>
        <div>
          <div className={styles.topTitle}>Admin Dashboard</div>
          <div className={styles.topSub}>Welcome, {admin?.name || 'Administrator'}</div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Logout
        </button>
      </div>

      {/* Stats — always today's numbers */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{todayStaff.filter(l => !l.signOut).length}</div>
          <div className={styles.statLabel}>Staff Currently In</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{todayStaff.length}</div>
          <div className={styles.statLabel}>Staff Sign-ins Today</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{todayVisitor.filter(l => !l.signOut).length}</div>
          <div className={styles.statLabel}>Visitors Currently In</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{todayVisitor.length}</div>
          <div className={styles.statLabel}>Visitor Sign-ins Today</div>
        </div>
      </div>

      {/* Table card */}
      <div className={styles.tableCard}>

        {/* Toolbar row 1 — tabs + downloads */}
        <div className={styles.tableToolbar}>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${tab === 'staff'   ? styles.tabActive : ''}`} onClick={() => switchTab('staff')}>Staff Activity</button>
            <button className={`${styles.tab} ${tab === 'visitor' ? styles.tabActive : ''}`} onClick={() => switchTab('visitor')}>Visitor Activity</button>
          </div>
          <div className={styles.downloadBtns}>
            <button className={styles.dlBtn} onClick={() => downloadCSV(exportData, `${exportTitle}.csv`)} disabled={!filtered.length}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
              CSV
            </button>
            <button className={styles.dlBtn} onClick={() => downloadPDF(exportData, exportTitle)} disabled={!filtered.length}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
              PDF
            </button>
          </div>
        </div>

        {/* Toolbar row 2 — search + date filter */}
        <div className={styles.searchBar}>
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} fill="none" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z"/>
            </svg>
            <input
              className={styles.searchInput}
              type="text"
              placeholder={tab === 'staff' ? 'Search by name, badge or role…' : 'Search by name, phone or host…'}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          <div className={styles.dateWrap}>
            <svg className={styles.calIcon} fill="none" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
            </svg>
            <input
              className={styles.dateInput}
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <button className={styles.clearBtn} onClick={() => setDateFilter('')}>✕</button>
            )}
          </div>
        </div>

        {/* Results count */}
        {(search || dateFilter) && (
          <div className={styles.resultCount}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
            {dateFilter && ` for ${new Date(dateFilter + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className={styles.empty}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            {search || dateFilter ? 'No records match your search.' : `No ${tab} activity recorded yet.`}
          </div>
        ) : (
          <div className={styles.tableWrap}>
            {tab === 'staff' ? (
              <table className={styles.table}>
                <thead>
                  <tr><th>Name</th><th>Badge</th><th>Role</th><th>Date</th><th>Sign In</th><th>Sign Out</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {filtered.map((l, i) => (
                    <tr key={i}>
                      <td className={styles.nameCell}>{l.name}</td>
                      <td className={styles.mono}>{l.badgeNumber}</td>
                      <td className={styles.muted}>{l.role}</td>
                      <td className={styles.muted}>{l.signIn ? formatShortDate(l.signIn) : '—'}</td>
                      <td className={styles.timeIn}>{l.signIn ? formatTime(l.signIn) : '—'}</td>
                      <td className={l.signOut ? styles.timeOut : styles.timePending}>{l.signOut ? formatTime(l.signOut) : 'Active'}</td>
                      <td><span className={`${styles.pill} ${l.signOut ? styles.pillOut : styles.pillIn}`}>{l.signOut ? 'Signed Out' : 'In Building'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr><th>Name</th><th>Phone</th><th>Visiting</th><th>Reason</th><th>Date</th><th>Sign In</th><th>Sign Out</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {filtered.map((l, i) => (
                    <tr key={i}>
                      <td className={styles.nameCell}>{l.name}</td>
                      <td className={styles.muted}>{l.phone}</td>
                      <td className={styles.muted}>{l.host}</td>
                      <td className={styles.muted}>{l.reason}</td>
                      <td className={styles.muted}>{l.signIn ? formatShortDate(l.signIn) : '—'}</td>
                      <td className={styles.timeIn}>{l.signIn ? formatTime(l.signIn) : '—'}</td>
                      <td className={l.signOut ? styles.timeOut : styles.timePending}>{l.signOut ? formatTime(l.signOut) : 'Active'}</td>
                      <td><span className={`${styles.pill} ${l.signOut ? styles.pillOut : styles.pillIn}`}>{l.signOut ? 'Signed Out' : 'In Building'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
