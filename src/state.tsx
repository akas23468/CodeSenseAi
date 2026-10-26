import { createContext, useContext, useState, type ReactNode } from 'react'
import { repos } from './data/demoData'

interface Ctx {
  repoId: string; setRepoId: (id: string) => void
  findingId: string | null; openFinding: (id: string | null, repoId?: string) => void
  searchOpen: boolean; setSearchOpen: (b: boolean) => void
  analyseOpen: boolean; setAnalyseOpen: (b: boolean) => void
}
const AppCtx = createContext<Ctx | null>(null)
export const useApp = () => { const c = useContext(AppCtx); if (!c) throw new Error('useApp outside provider'); return c }

export function AppProvider({ children }: { children: ReactNode }) {
  const [repoId, setRepoId] = useState(repos[0].id)
  const [findingId, setFindingId] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [analyseOpen, setAnalyseOpen] = useState(false)
  const openFinding = (id: string | null, r?: string) => { if (r) setRepoId(r); setFindingId(id) }
  return <AppCtx.Provider value={{ repoId, setRepoId, findingId, openFinding, searchOpen, setSearchOpen, analyseOpen, setAnalyseOpen }}>{children}</AppCtx.Provider>
}
