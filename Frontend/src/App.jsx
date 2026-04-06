import React, { useState } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import NavBar from './Components/NavBar'
import Center from './Components/Center'
import Footer from './Components/Footer'
import About from './ComponetsAbout/About'
import ISLModelTrainer from './Components/ISLModelTrainer'
import 'remixicon/fonts/remixicon.css'

const App = () => {
  const [isDark, setIsDark] = useState(true)

  return (
    <div style={{
      backgroundColor: isDark ? '#0E1334' : '#eeeded',
      transition: 'all 0.4s ease',
    }}>
      <div
        className='min-h-screen flex flex-col justify-start'
        style={{
          backgroundColor: isDark ? '#0E1334' : '#eeeded',
          transition: 'all 0.4s ease',
        }}
      >
        <Routes>
          <Route
            path="/"
            element={
              <>
                <NavBar isDark={isDark} setIsDark={setIsDark} />
                <Center isDark={isDark} />
                <Footer isDark={isDark} />
              </>
            }
          />
          <Route
            path="/about"
            element={<About isDark={isDark} setIsDark={setIsDark} />}
          />
          <Route
            path="/train"
            element={<ISLModelTrainer isDark={isDark} />}
          />
          <Route
            path="/contact"
            element={
              <div style={{ padding: '3rem', color: isDark ? '#fff' : '#1a1a1a' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Contact</h1>
                <p style={{ maxWidth: '36rem', lineHeight: 1.6 }}>
                  This page is not built yet. Use the home page to start translation.
                </p>
              </div>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App