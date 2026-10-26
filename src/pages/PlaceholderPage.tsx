import { Construction } from 'lucide-react'
import { Link } from 'react-router-dom'
export default function PlaceholderPage({ title }: { title: string }) {
  return <div className="card mx-auto mt-10 max-w-lg p-8 text-center">
    <Construction className="mx-auto text-mute" aria-hidden />
    <h1 className="mt-3 text-lg font-semibold">{title}</h1>
    <p className="mt-1 text-sub">This section is not built yet. Nothing here is connected to a backend.</p>
    <Link to="/" className="btn mt-4">Back to Overview</Link>
  </div>
}
