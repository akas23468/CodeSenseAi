import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CircleAlert, Info, ShieldAlert, Sparkles, TriangleAlert, Wrench, X } from 'lucide-react'
import type { FindingSource, Severity } from '../types'

const SEV = {
  critical: { Icon: ShieldAlert, c: 'text-err border-err/40 bg-err/10', label: 'Critical' },
  high: { Icon: TriangleAlert, c: 'text-err border-err/30 bg-err/5', label: 'High' },
  medium: { Icon: CircleAlert, c: 'text-warn border-warn/30 bg-warn/10', label: 'Medium' },
  low: { Icon: Info, c: 'text-info border-info/30 bg-info/10', label: 'Low' },
} as const
export const sevColor: Record<Severity, string> = { critical: '#F87171', high: '#FB923C', medium: '#FBBF24', low: '#60A5FA' }

export function SeverityBadge({ severity }: { severity: Severity }) {
  const { Icon, c, label } = SEV[severity]
  return <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium ${c}`}><Icon size={12} aria-hidden />{label}</span>
}
export function SourceBadge({ source, tool }: { source: FindingSource; tool?: string }) {
  const ai = source === 'ai'
  return <span className={`inline-flex items-center gap-1 text-xs ${ai ? 'text-accent' : 'text-sub'}`}>
    {ai ? <Sparkles size={12} aria-hidden /> : <Wrench size={12} aria-hidden />}{ai ? 'AI suggestion' : (tool ?? 'Tool')}</span>
}
export function Tip({ text, children }: { text: string; children: ReactNode }) {
  return <span className="group relative inline-flex">{children}
    <span role="tooltip" className="pointer-events-none absolute left-0 top-full z-30 mt-1 hidden w-56 rounded border border-line bg-elev p-2 text-xs font-normal text-sub group-hover:block group-focus-within:block">{text}</span></span>
}
export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return <div className="p-8 text-center"><p className="font-medium">{title}</p>{hint && <p className="mt-1 text-sub">{hint}</p>}</div>
}
export function ErrorState({ message }: { message: string }) {
  return <div role="alert" className="flex items-center gap-2 p-4 text-err"><CircleAlert size={16} />{message}</div>
}
export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return <div role="status" className="p-6 text-sub">{label}…</div>
}

type ToastItem = { id: number; msg: string; tone: 'ok' | 'err' }
const ToastCtx = createContext<(msg: string, tone?: 'ok' | 'err') => void>(() => {})
export const useToast = () => useContext(ToastCtx)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const push = useCallback((msg: string, tone: 'ok' | 'err' = 'ok') => {
    const id = Date.now() + Math.random()
    setItems(i => [...i, { id, msg, tone }])
    setTimeout(() => setItems(i => i.filter(t => t.id !== id)), 4500)
  }, [])
  return <ToastCtx.Provider value={push}>{children}
    <div aria-live="polite" className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {items.map(t => <div key={t.id} className={`card flex max-w-sm items-start gap-2 px-3 py-2 ${t.tone === 'err' ? 'border-err/50' : ''}`}>
        <span className="flex-1">{t.msg}</span>
        <button className="text-mute" aria-label="Dismiss" onClick={() => setItems(i => i.filter(x => x.id !== t.id))}><X size={14} /></button></div>)}
    </div></ToastCtx.Provider>
}
