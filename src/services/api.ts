// Placeholder for the FastAPI client. Nothing is connected yet.
export const BACKEND_CONNECTED = false
export const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
export async function uploadRepository(file: File): Promise<never> {
  throw new Error(`Backend not connected: ${file.name} was not uploaded or analysed.`)
}
