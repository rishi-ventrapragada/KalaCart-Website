import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import AppShell from '@/app/AppShell'
import RootProviders from '@/app/RootProviders'
import AdminLayout from '@/routes/admin/AdminLayout'
import AdminLogin from '@/routes/admin/AdminLogin'
import { AdminPlaceholder } from '@/routes/admin/AdminPlaceholder'
import { RequireAdmin } from '@/routes/admin/RequireAdmin'
import ArtisanProfile from '@/routes/ArtisanProfile'
import Browse from '@/routes/Browse'
import Home from '@/routes/Home'
import KitchenSink from '@/routes/KitchenSink'
import NotFound from '@/routes/NotFound'
import ProductDetail from '@/routes/ProductDetail'

/** Router and providers only — kept thin per PRD 5.3. */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*
          Theme, toasts and the admin flag are shared. The chrome below them is
          not: buyer routes get the navbar, footer and Lenis; the admin desk
          gets its own frame and no motion system (PRD 10.8).
        */}
        <Route element={<RootProviders />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            {/* Development only; removed in the Increment 16 polish pass. */}
            <Route path="/kitchen-sink" element={<KitchenSink />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/artisan/:id" element={<ArtisanProfile />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/*
            Outside AppShell, so the login screen carries no admin chrome and
            no buyer chrome either - it is the doorway to neither yet.
          */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/queue" replace />} />
              <Route
                path="/admin/queue"
                element={
                  <AdminPlaceholder
                    titleKey="admin.placeholder.queueTitle"
                    bodyKey="admin.placeholder.queueBody"
                  />
                }
              />
              <Route
                path="/admin/artisans"
                element={
                  <AdminPlaceholder
                    titleKey="admin.placeholder.artisansTitle"
                    bodyKey="admin.placeholder.artisansBody"
                  />
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <AdminPlaceholder
                    titleKey="admin.placeholder.analyticsTitle"
                    bodyKey="admin.placeholder.analyticsBody"
                  />
                }
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
