import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './components/auth/login'
import Signup from './components/auth/Signup'
import { PublicOnlyRoute, ProtectedRoute } from './auth/RouteGuards'
import HomePage from './components/pages/HomePage'
import Contacts from './components/pages/Contacts'
import News from './components/pages/News'
import NewsDetail from './components/pages/NewsDetail'
import Work from './components/pages/Work'
import WorkDetail from './components/pages/WorkDetail'
import FooterSettings from './components/pages/FooterSettings'

// ✅ Correct imports (inside components/pages/about/)
import AboutContentManager from './components/pages/about/AboutContentManager'
import GalleryManager from './components/pages/about/GalleryManager'
import ClientsManager from './components/pages/about/ClientsManager'
import AwardsManager from './components/pages/about/AwardsManager'
import TeamManager from './components/pages/about/TeamManager'

export default function AllRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />

          {/* About Module Routes */}
          <Route path="about-content" element={<AboutContentManager />} />
          <Route path="gallery" element={<GalleryManager />} />
          <Route path="clients" element={<ClientsManager />} />
          <Route path="awards" element={<AwardsManager />} />
          <Route path="team" element={<TeamManager />} />

          {/* Other routes */}
          <Route path="contacts" element={<Contacts />} />
          <Route path="news" element={<News />} />
          <Route path="news/:slug" element={<NewsDetail />} />
          <Route path="work" element={<Work />} />
          <Route path="work/:slug" element={<WorkDetail />} />
          <Route path="footer" element={<FooterSettings />} />
        </Route>
      </Route>

      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}