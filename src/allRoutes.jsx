import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './components/pages/HomePage'
import About from './components/pages/About'
import Contact from './components/pages/Contact'
import News from './components/pages/News'
import Work from './components/pages/Work'

export default function AllRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="news" element={<News />} />
        <Route path="work" element={<Work />} />
      </Route>
    </Routes>
  )
}
