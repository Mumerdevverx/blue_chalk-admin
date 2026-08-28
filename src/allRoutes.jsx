import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
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
        <Route path="/news/:slug" element={<NewsDetail />} />
        <Route path="/work" element={<Work />} />
        <Route path="/work/:slug" element={<WorkDetail />} />
        <Route path="footer" element={<FooterSettings />} />
      </Route>
    </Routes>
  )
}