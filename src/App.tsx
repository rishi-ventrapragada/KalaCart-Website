import { BrowserRouter, Route, Routes } from 'react-router-dom'

import AppShell from '@/app/AppShell'
import ArtisanProfile from '@/routes/ArtisanProfile'
import Browse from '@/routes/Browse'
import Home from '@/routes/Home'
import NotFound from '@/routes/NotFound'
import ProductDetail from '@/routes/ProductDetail'

/** Router and providers only — kept thin per PRD 5.3. */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/artisan/:id" element={<ArtisanProfile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
