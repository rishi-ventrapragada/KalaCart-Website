import { Link } from 'react-router-dom'

/** Increment 0 placeholder. Designed properly in Increment 16. */
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <div className="flex gap-4 text-sm underline underline-offset-4">
        <Link to="/">Home</Link>
        <Link to="/browse">Browse</Link>
      </div>
    </main>
  )
}
