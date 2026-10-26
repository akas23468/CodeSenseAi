import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, BookOpen, Bot, FileText, FolderGit2, GitCompare, LayoutDashboard, Menu, PanelLeftClose, PanelLeftOpen, ScanSearch, Search, Settings, X } from 'lucide-react'
import { findings, repos } from '../../data/demoData'
import { useApp } from '../../state'
import FindingDrawer from '../findings/FindingDrawer'
import AnalyseDialog from '../repositories/AnalyseDialog'
import { SeverityBadge, useToast } from '../ui'

const MAIN = [
  { to: '/', label: 'Overview', Icon: LayoutDashboard }, { to: '/repositories', label: 'Repositories', Icon: FolderGit2 },
  { to: '/code-review', label: 'Code Review', Icon: ScanSearch }, { to: '/assistant', label: 'AI Assistant', Icon: Bot },
  { to: '/change-review', label: 'Change Review', Icon: GitCompare }, { to: '/reports', label: 'Reports', Icon: FileText },
]
const LOWER = [{ to: '/settings', label: 'Settings', Icon: Settings }, { to: '/help', label: 'Help and documentation', Icon: BookOpen }]

function NavItem({ to, label, Icon, collapsed, onNav }: { to: string; label: string; Icon: typeof Bell; collapsed: boolean; onNav: () => void }) {
  return <NavLink to={to} end={to === '/'} onClick={onNav} title={collapsed ? label : undefined}
    className={({ isActive }) => `flex items-center gap-3 rounded-md border-l-2 px-3 py-2 transition-colors ${isActive ? 'border-accent bg-elev text-ink' : 'border-transparent text-sub hover:bg-surf hover:text-ink'}`}>
    <Icon size={16} aria-hidden />{!collapsed && <span>{label}</span>}</NavLink>
}

function Sidebar({ collapsed, onNav }: { collapsed: boolean; onNav: () => void }) {
  return <div className="flex h-full flex-col bg-side">
    <div className="flex items-center gap-2 px-4 py-4">
      <div className="mono grid h-8 w-8 shrink-0 place-items-center rounded-md border border-accent text-accent" aria-hidden>{'{}'}</div>
      {!collapsed && <div><div className="font-semibold leading-tight">CodeSense AI</div><div className="text-[11px] text-mute">Developer preview</div></div>}
    </div>
    <nav aria-label="Main" className="flex-1 space-y-1 px-2">{MAIN.map(n => <NavItem key={n.to} {...n} collapsed={collapsed} onNav={onNav} />)}</nav>
    <div className="space-y-1 border-t border-line px-2 py-3">
      {LOWER.map(n => <NavItem key={n.to} {...n} collapsed={collapsed} onNav={onNav} />)}
      <div className="flex items-center gap-3 px-3 py-2 text-sub">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-elev text-[11px] text-ink" aria-hidden>DV</span>
        {!collapsed && <span>Demo user</span>}</div>
    </div>
  </div>
}

function SearchOverlay() {
  const { searchOpen, setSearchOpen, openFinding, setRepoId } = useApp()
  const [q, setQ] = useState('')
  const nav = useNavigate()
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { if (searchOpen) { setQ(''); ref.current?.focus() } }, [searchOpen])
  const t = q.trim().toLowerCase()
  const rs = useMemo(() => t ? repos.filter(r => r.name.includes(t)) : [], [t])
  const fs = useMemo(() => t ? findings.filter(x => [x.title, x.filePath, x.ruleId ?? ''].some(v => v.toLowerCase().includes(t))).slice(0, 6) : [], [t])
  if (!searchOpen) return null
  const close = () => setSearchOpen(false)
  return <div className="fixed inset-0 z-50 grid place-items-start bg-black/60 p-4 pt-[12vh]" onMouseDown={close}>
    <div role="dialog" aria-modal="true" aria-label="Search" className="card mx-auto w-full max-w-xl bg-surf" onMouseDown={e => e.stopPropagation()}>
      <input ref={ref} value={q} onChange={e => setQ(e.target.value)} placeholder="Search demo repositories and findings"
        className="w-full rounded-t-md bg-transparent px-4 py-3 outline-none" aria-label="Search" />
      <div className="max-h-80 overflow-auto border-t border-line p-1">
        {!t && <p className="p-3 text-sub">Type to search local demonstration data.</p>}
        {t && !rs.length && !fs.length && <p className="p-3 text-sub">No matches for “{q}”.</p>}
        {rs.map(r => <button key={r.id} className="block w-full rounded px-3 py-2 text-left hover:bg-elev" onClick={() => { setRepoId(r.id); nav('/'); close() }}>
          <span className="mono">{r.name}</span> <span className="text-mute">repository</span></button>)}
        {fs.map(x => <button key={x.id} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-elev" onClick={() => { openFinding(x.id, x.repoId); nav('/'); close() }}>
          <SeverityBadge severity={x.severity} /><span className="flex-1 truncate">{x.title}</span><span className="mono text-xs text-mute">{x.filePath}</span></button>)}
      </div>
    </div></div>
}

export default function AppShell() {
  const { setSearchOpen, searchOpen, setAnalyseOpen } = useApp()
  const [collapsed, setCollapsed] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const loc = useLocation()
  const toast = useToast()
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true) }
      if (e.key === 'Escape') { setSearchOpen(false); setDrawer(false); setAnalyseOpen(false) }
    }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [setSearchOpen, setAnalyseOpen])
  const label = [...MAIN, ...LOWER].find(n => n.to === loc.pathname)?.label ?? 'Overview'
  return <div className="flex h-screen overflow-hidden">
    <aside className={`hidden shrink-0 border-r border-line transition-[width] md:block ${collapsed ? 'w-16' : 'w-60'}`}><Sidebar collapsed={collapsed} onNav={() => {}} /></aside>
    {drawer && <div className="fixed inset-0 z-40 md:hidden" onClick={() => setDrawer(false)}><div className="absolute inset-0 bg-black/60" />
      <aside role="dialog" aria-modal="true" aria-label="Navigation" className="relative h-full w-60 border-r border-line" onClick={e => e.stopPropagation()}>
        <button className="icon-btn absolute right-2 top-3" aria-label="Close navigation" onClick={() => setDrawer(false)}><X size={16} /></button>
        <Sidebar collapsed={false} onNav={() => setDrawer(false)} /></aside></div>}
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-line bg-side px-3">
        <button className="icon-btn md:hidden" aria-label="Open navigation" onClick={() => setDrawer(true)}><Menu size={18} /></button>
        <button className="icon-btn hidden md:grid" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapsed(c => !c)}>
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button>
        <nav aria-label="Breadcrumb" className="text-sub">Workspace <span className="text-mute">/</span> <span className="text-ink">{label}</span></nav>
        <span className="ml-2 hidden rounded border border-warn/40 px-2 py-0.5 text-xs text-warn sm:inline">Demonstration data</span>
        <div className="flex-1" />
        <button className="btn !py-1 text-sub" onClick={() => setSearchOpen(true)} aria-haspopup="dialog" aria-expanded={searchOpen}>
          <Search size={14} aria-hidden /><span className="hidden sm:inline">Search</span><kbd className="mono hidden rounded border border-line px-1 text-[11px] sm:inline">Ctrl K</kbd></button>
        <button className="icon-btn" aria-label="Notifications" onClick={() => toast('No notifications. GitHub is not connected.')}><Bell size={16} /></button>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-elev text-xs" aria-label="Demo user">DV</span>
      </header>
      <main className="flex-1 overflow-auto p-4 lg:p-6"><Outlet /></main>
    </div>
    <SearchOverlay /><FindingDrawer /><AnalyseDialog />
  </div>
}
