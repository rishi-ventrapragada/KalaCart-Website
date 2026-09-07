import { useParams } from 'react-router-dom'

/** Increment 0 placeholder. Built in Increment 10. */
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <h1 className="text-2xl font-semibold">Product {id}</h1>
    </main>
  )
}
