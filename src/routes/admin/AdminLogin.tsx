import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { ADMIN_HOME_PATH } from '@/app/adminAuth'
import { useAdmin } from '@/app/useAdmin'
import { MockAuthNotice } from '@/components/admin/MockAuthNotice'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useT } from '@/lib/i18n'

interface LoginErrors {
  email?: string
  password?: string
  credential?: string
}

/** The location state RequireAdmin attaches when it bounces a deep link. */
interface FromState {
  from?: string
}

export default function AdminLogin() {
  const { isAdmin, signIn } = useAdmin()
  const navigate = useNavigate()
  const location = useLocation()
  const t = useT()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<LoginErrors>({})

  // Where the guard was trying to send them before the detour.
  const from = (location.state as FromState | null)?.from
  const destination = from ?? ADMIN_HOME_PATH

  // Already signed in: nothing to do here. `replace` so Back does not land on
  // a login screen that immediately redirects again.
  if (isAdmin) return <Navigate to={destination} replace />

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()

    // Empty fields are named individually - that is a typing mistake, not a
    // failed credential, and telling someone which box is blank helps them.
    const next: LoginErrors = {}
    if (!email.trim()) next.email = t('admin.auth.errorEmail')
    if (!password) next.password = t('admin.auth.errorPassword')

    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }

    if (!signIn(email, password)) {
      // One message for the pair, never "wrong password" - see the i18n note.
      setErrors({ credential: t('admin.auth.errorCredential') })
      return
    }

    void navigate(destination, { replace: true })
  }

  return (
    <Container className="flex justify-center py-16 sm:py-24">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl">{t('admin.auth.title')}</h1>
          <p className="text-sm text-muted">{t('admin.auth.intro')}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Input
            label={t('admin.auth.email')}
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            error={errors.email ?? ''}
            onChange={(e) => {
              setEmail(e.target.value)
              setErrors({})
            }}
          />

          <Input
            label={t('admin.auth.password')}
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            error={errors.password ?? ''}
            onChange={(e) => {
              setPassword(e.target.value)
              setErrors({})
            }}
          />

          {/*
            The credential failure belongs to the pair, so it sits below both
            fields rather than on either one. `alert` announces it without
            moving focus away from where the reader is typing.
          */}
          {errors.credential ? (
            <p role="alert" className="text-2xs text-ink">
              {errors.credential}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="w-full">
            {t('admin.auth.signIn')}
          </Button>
        </form>

        {/* The disclosure, directly under the form it describes (PRD 11.1). */}
        <MockAuthNotice />

        <Link to="/" className="text-2xs text-muted transition-colors hover:text-ink">
          {t('admin.nav.backToSite')}
        </Link>
      </div>
    </Container>
  )
}
