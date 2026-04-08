import React, { useState } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import NavBar from './Components/NavBar'
import Center from './Components/Center'
import Footer from './Components/Footer'
import About from './ComponetsAbout/About'
import ISLModelTrainer from './Components/ISLModelTrainer'
import Home from './pages/Home'
import 'remixicon/fonts/remixicon.css'
import Contact from './ComponetsAbout/Contact'

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
          <Route path="/" element={<Home />} />
          <Route
            path="/app"
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
              <Contact isDark={isDark} />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App