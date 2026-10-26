import { useMemo, useState } from 'react'
import { findings } from '../data/demoData'
import type { Severity } from '../types'

export const SEV_ORDER: Severity[] = ['critical', 'high', 'medium', 'low']
export type SortKey = 'severity' | 'title' | 'filePath' | 'status'

export function useFindings(repoId: string) {
  const [sev, setSev] = useState<Severity | null>(null)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'severity', dir: 1 })
  const [limit, setLimit] = useState(5)
  const all = useMemo(() => findings.filter(x => x.repoId === repoId), [repoId])
  const counts = useMemo(() => SEV_ORDER.map(s => ({ severity: s, count: all.filter(x => x.severity === s && x.status === 'open').length })), [all])
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase()
    return all
      .filter(x => (!sev || x.severity === sev) && (!t || [x.title, x.filePath, x.ruleId ?? '', x.id].some(v => v.toLowerCase().includes(t))))
      .sort((a, b) => {
        const va = sort.key === 'severity' ? SEV_ORDER.indexOf(a.severity) : a[sort.key]
        const vb = sort.key === 'severity' ? SEV_ORDER.indexOf(b.severity) : b[sort.key]
        return (va < vb ? -1 : va > vb ? 1 : 0) * sort.dir
      })
  }, [all, sev, q, sort])
  const toggleSort = (key: SortKey) => setSort(s => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : 1 }))
  return { all, counts, rows, visible: rows.slice(0, limit), sev, setSev, q, setQ, sort, toggleSort, more: () => setLimit(l => l + 5) }
}
