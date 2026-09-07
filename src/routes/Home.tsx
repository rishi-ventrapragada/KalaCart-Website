import { Link } from 'react-router-dom'

/** Increment 0 placeholder. The full motion system lands in Increments 7-8. */
export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 p-6">
      <h1 className="text-4xl font-semibold tracking-tight">KalaCart</h1>
      <p className="max-w-sm text-center text-sm text-muted">
        Handmade goods, direct from Indian artisans.
      </p>
      <div className="rounded-card border border-line bg-card px-6 py-4 text-sm text-muted">
        Scaffold only. Theme is live; data, copy and motion arrive in later increments.
      </div>
      <Link
        to="/browse"
        className="rounded-control border border-line-strong px-5 py-2 text-sm text-accent transition-colors duration-200 ease-site hover:border-accent"
      >
        Browse crafts
      </Link>
    </main>
  )
}
