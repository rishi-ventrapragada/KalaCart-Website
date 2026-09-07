import { useT } from '@/lib/i18n'

/** Increment 0 placeholder. Built in Increment 9. */
export default function Browse() {
  const t = useT()

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <h1 className="text-2xl font-semibold">{t('browse.title')}</h1>
    </main>
  )
}
