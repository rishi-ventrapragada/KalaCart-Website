import { Link } from 'react-router-dom'

/** Increment 0 placeholder. The full motion system lands in Increments 7-8. */
export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-4xl font-semibold tracking-tight">KalaCart</h1>
      <p className="text-sm text-neutral-500">
        Scaffold only — theme, data and motion arrive in later increments.
      </p>
      <Link to="/browse" className="text-sm underline underline-offset-4">
        Browse crafts
      </Link>
    </main>
  )
}
