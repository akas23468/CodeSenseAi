import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { ArrowDown, ArrowUp, CheckCircle2, FileCode2, FileText, ListChecks, Play, ShieldAlert, TriangleAlert } from 'lucide-react'
import { repos, runs } from '../data/demoData'
import { SEV_ORDER, useFindings, type SortKey } from '../hooks/useFindings'
import { useApp } from '../state'
import { EmptyState, SeverityBadge, SourceBadge, Tip, sevColor, useToast } from '../components/ui'
import type { CheckStatus } from '../types'

const fmt = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
const CHECK: Record<CheckStatus, { label: string; c: string }> = {
  passed: { label: 'Passed', c: 'text-ok' }, findings: { label: 'Findings reported', c: 'text-warn' }, failed: { label: 'Execution failed', c: 'text-err' },
  skipped: { label: 'Skipped', c: 'text-mute' }, 'not-run': { label: 'Not run', c: 'text-mute' },
}

export default function OverviewPage() {
  const { repoId, setRepoId, openFinding, setAnalyseOpen } = useApp()
  const toast = useToast()
  const repo = repos.find(r => r.id === repoId) ?? repos[0]
  const fx = useFindings(repo.id)
  const open = fx.all.filter(x => x.status === 'open')
  const highRisk = open.filter(x => x.severity === 'critical' || x.severity === 'high').length
  const passed = repo.checks.filter(c => c.status === 'passed').length
  const metrics = [
    { label: 'Open findings', value: open.length, Icon: ListChecks, note: `${fx.all.length - open.length} resolved`, tip: 'Findings for this repository with status open.' },
    { label: 'High-risk findings', value: highRisk, Icon: ShieldAlert, note: 'Critical or high, still open', tip: 'Open findings classified as critical or high.' },
    { label: 'Files analysed', value: repo.files, Icon: FileCode2, note: `${repo.language}, branch ${repo.branch}`, tip: 'Files discovered by repository parsing in the last run.' },
    { label: 'Checks passed', value: `${passed}/${repo.checks.length}`, Icon: CheckCircle2, note: 'Checks that ran with no issues', tip: 'Checks that completed and reported no findings or errors. Not the number of resolved findings.' },
  ]
  const th = (k: SortKey, label: string) => <th scope="col" aria-sort={fx.sort.key === k ? (fx.sort.dir === 1 ? 'ascending' : 'descending') : 'none'} className="px-3 py-2 text-left font-medium">
    <button className="inline-flex items-center gap-1 hover:text-ink" onClick={() => fx.toggleSort(k)}>{label}{fx.sort.key === k && (fx.sort.dir === 1 ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</button></th>

  return <div className="mx-auto max-w-[1280px] space-y-5">
    <section className="flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-xl font-semibold">Repository Intelligence</h1>
        <p className="text-sub">Understand your codebase. Investigate risks. Validate every fix.</p></div>
      <div className="flex gap-2">
        <button className="btn" onClick={() => toast('Reports are not built yet.')}><FileText size={14} aria-hidden />View Reports</button>
        <button className="btn btn-primary" onClick={() => setAnalyseOpen(true)}><Play size={14} aria-hidden />Analyse Repository</button></div>
    </section>

    <section aria-label="Repository context" className="card flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
      <label className="flex items-center gap-2"><span className="text-mute">Repository</span>
        <select className="mono rounded border border-line bg-elev px-2 py-1" value={repo.id} onChange={e => setRepoId(e.target.value)}>
          {repos.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
      <span><span className="text-mute">Language </span>{repo.language}</span>
      <span><span className="text-mute">Files </span>{repo.files}</span>
      <span><span className="text-mute">Branch </span><span className="mono">{repo.branch}</span></span>
      <span><span className="text-mute">Last analysis </span>{fmt(repo.lastAnalysis)}</span>
      <span><span className="text-mute">Status </span>{repo.status}</span>
      <span className="text-xs text-warn">Demonstration data</span>
    </section>

    <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metrics.map(m => <div key={m.label} className="card flex min-h-[104px] flex-col justify-between p-3">
        <div className="flex items-center justify-between text-sub"><Tip text={m.tip}><button className="underline decoration-dotted underline-offset-4">{m.label}</button></Tip><m.Icon size={16} aria-hidden /></div>
        <div className="text-3xl font-semibold tabular-nums">{m.value}</div><div className="text-xs text-mute">{m.note}</div></div>)}
    </section>

    <div className="grid gap-4 lg:grid-cols-2">
      <section className="card p-4" aria-labelledby="dist">
        <h2 id="dist" className="font-semibold">Finding Distribution</h2>
        <p className="text-xs text-mute">Open findings by severity. Select a bar to filter the table.</p>
        {open.length === 0 ? <EmptyState title="No open findings" /> : <>
          <div className="h-36" role="img" aria-label={fx.counts.map(c => `${c.severity} ${c.count}`).join(', ')}>
            <ResponsiveContainer><BarChart data={fx.counts} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" hide allowDecimals={false} /><YAxis type="category" dataKey="severity" width={64} stroke="#9AA4B2" tickLine={false} axisLine={false} />
              <Bar dataKey="count" barSize={14} radius={2} label={{ position: 'right', fill: '#F1F5F9', fontSize: 12 }} onClick={(d: { severity: never }) => fx.setSev(fx.sev === d.severity ? null : d.severity)} cursor="pointer" isAnimationActive={false}>
                {fx.counts.map(c => <Cell key={c.severity} fill={sevColor[c.severity]} opacity={fx.sev && fx.sev !== c.severity ? 0.35 : 1} />)}</Bar>
            </BarChart></ResponsiveContainer></div>
          <div className="flex flex-wrap gap-2">{fx.counts.map(c => <button key={c.severity} aria-pressed={fx.sev === c.severity} onClick={() => fx.setSev(fx.sev === c.severity ? null : c.severity)}
            className={`btn !py-0.5 text-xs capitalize ${fx.sev === c.severity ? '!border-accent' : ''}`}>{c.severity}: {c.count}</button>)}</div></>}
      </section>
      <section className="card p-4" aria-labelledby="cov">
        <h2 id="cov" className="font-semibold">Analysis Coverage <span className="text-xs font-normal text-warn">demonstration</span></h2>
        <p className="text-xs text-mute">“Findings reported” means the tool ran successfully and found issues. “Execution failed” means the tool itself errored.</p>
        <ul className="mt-2 divide-y divide-line">{repo.checks.map(c => <li key={c.id} className="flex items-center gap-3 py-2">
          <div className="flex-1"><div className="font-medium">{c.name} <span className="font-normal text-sub">{c.description}</span></div>
            <div className="text-xs text-mute">{c.ranAt ? fmt(c.ranAt) : 'Not run'}{c.durationSec != null && ` · ${c.durationSec}s`}</div></div>
          <span className={`text-xs font-medium ${CHECK[c.status].c}`}>{CHECK[c.status].label}</span></li>)}</ul>
      </section>
    </div>

    <section className="card" aria-labelledby="pf">
      <div className="flex flex-wrap items-end justify-between gap-2 p-4 pb-2">
        <div><h2 id="pf" className="text-base font-semibold">Priority Findings</h2><p className="text-sub">The issues that deserve attention first.</p></div>
        <div className="flex flex-wrap gap-2">
          <input aria-label="Search findings" placeholder="Filter by title, file or rule" value={fx.q} onChange={e => fx.setQ(e.target.value)} className="rounded border border-line bg-elev px-2 py-1" />
          <select aria-label="Filter by severity" className="rounded border border-line bg-elev px-2 py-1" value={fx.sev ?? ''} onChange={e => fx.setSev((e.target.value || null) as typeof fx.sev)}>
            <option value="">All severities</option>{SEV_ORDER.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
      </div>
      {fx.rows.length === 0 ? <EmptyState title="No findings match" hint="Clear the filters to see all findings." /> :
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm">
          <thead className="border-y border-line text-mute"><tr>{th('severity', 'Severity')}{th('title', 'Finding')}{th('filePath', 'File and line')}
            <th scope="col" className="px-3 py-2 text-left font-medium">Source</th>{th('status', 'Status')}<th scope="col" className="px-3 py-2 text-left font-medium">Action</th></tr></thead>
          <tbody className="divide-y divide-line">{fx.visible.map(f => <tr key={f.id} className="hover:bg-elev">
            <td className="px-3 py-2"><SeverityBadge severity={f.severity} /></td>
            <td className="px-3 py-2">{f.title}</td>
            <td className="mono px-3 py-2 text-xs text-sub">{f.filePath}:{f.lineNumber}</td>
            <td className="px-3 py-2"><SourceBadge source={f.source} tool={f.tool} /></td>
            <td className="px-3 py-2 capitalize">{f.status}{f.verification === 'awaiting-verification' && <span className="block text-xs text-accent">Awaiting verification</span>}</td>
            <td className="px-3 py-2"><button className="btn !py-0.5 text-xs" onClick={() => openFinding(f.id)}>Review<span className="sr-only"> {f.title}</span></button></td></tr>)}</tbody>
        </table></div>}
      {fx.rows.length > fx.visible.length && <div className="p-3 text-center"><button className="btn" onClick={fx.more}>Show more ({fx.rows.length - fx.visible.length})</button></div>}
    </section>

    <section className="card" aria-labelledby="ra">
      <h2 id="ra" className="p-4 pb-2 font-semibold">Recent Analyses <span className="text-xs font-normal text-warn">demonstration</span></h2>
      <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm">
        <thead className="border-y border-line text-mute"><tr>{['Repository', 'Analysis time', 'Files scanned', 'Findings', 'Status'].map(h => <th key={h} scope="col" className="px-3 py-2 text-left font-medium">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-line">{runs.map(r => <tr key={r.id} className="cursor-pointer hover:bg-elev" tabIndex={0}
          onClick={() => toast(`Run ${r.id} is demonstration data. Run detail pages need the backend.`)} onKeyDown={e => e.key === 'Enter' && toast(`Run ${r.id} is demonstration data. Run detail pages need the backend.`)}>
          <td className="mono px-3 py-2">{repos.find(x => x.id === r.repoId)?.name}</td><td className="px-3 py-2">{fmt(r.time)}</td>
          <td className="px-3 py-2">{r.files}</td><td className="px-3 py-2">{r.findings}</td>
          <td className="px-3 py-2">{r.status === 'failed' ? <span className="inline-flex items-center gap-1 text-err"><TriangleAlert size={12} aria-hidden />Failed</span> : 'Completed with findings'}</td></tr>)}</tbody>
      </table></div>
    </section>
  </div>
}
