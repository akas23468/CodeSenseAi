import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import { repos } from '../../data/demoData'
import { uploadRepository } from '../../services/api'
import { useApp } from '../../state'
import { useToast } from '../ui'

const MAX_MB = 50
export default function AnalyseDialog() {
  const { analyseOpen, setAnalyseOpen, repoId, setRepoId } = useApp()
  const toast = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [err, setErr] = useState('')
  if (!analyseOpen) return null
  const pick = (f?: File) => {
    setFile(null)
    if (!f) return setErr('')
    if (!f.name.toLowerCase().endsWith('.zip')) return setErr('Choose a .zip file.')
    if (f.size > MAX_MB * 1024 * 1024) return setErr(`File is larger than ${MAX_MB} MB.`)
    setErr(''); setFile(f)
  }
  const start = async () => {
    if (!file) return
    try { await uploadRepository(file) } catch (e) { toast(e instanceof Error ? e.message : 'Upload failed.', 'err') }
  }
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setAnalyseOpen(false)}>
    <div role="dialog" aria-modal="true" aria-labelledby="an-title" className="card w-full max-w-md p-4" onClick={e => e.stopPropagation()}>
      <div className="flex items-center"><h2 id="an-title" className="flex-1 font-semibold">Analyse repository</h2>
        <button className="icon-btn" aria-label="Close" autoFocus onClick={() => setAnalyseOpen(false)}><X size={16} /></button></div>
      <p className="mt-1 text-sub">Backend not connected. Uploads are not analysed yet; demonstration repositories load sample data.</p>
      <fieldset className="mt-4 space-y-1"><legend className="mb-1 font-medium">Demonstration repository</legend>
        {repos.map(r => <label key={r.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-elev">
          <input type="radio" name="repo" checked={repoId === r.id} onChange={() => setRepoId(r.id)} /><span className="mono">{r.name}</span></label>)}
      </fieldset>
      <div className="mt-4"><label className="font-medium" htmlFor="zip">Upload a ZIP (max {MAX_MB} MB)</label>
        <input id="zip" type="file" accept=".zip" className="mt-1 block w-full text-sub" onChange={e => pick(e.target.files?.[0])} />
        {err && <p role="alert" className="mt-1 text-err">{err}</p>}
        {file && <p className="mt-1 text-sub">Selected {file.name}. Client-side checks only; the backend will validate it again.</p>}</div>
      <div className="mt-5 flex justify-end gap-2">
        <button className="btn" onClick={() => setAnalyseOpen(false)}>Use demonstration repository</button>
        <button className="btn btn-primary disabled:opacity-50" disabled={!file} onClick={start}><Upload size={14} aria-hidden />Upload</button></div>
    </div></div>
}
