import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import NavBar from './Components/NavBar'
import Center from './Components/Center'
import Footer from './Components/Footer'
import About from './ComponetsAbout/About'
import 'remixicon/fonts/remixicon.css';

const App = () => {
  const [isDark,setIsDark] = useState(true);
  return (
    <div style={{
      backgroundColor: isDark ? '#0E1334' : '#eeeded',
      transition: 'all 0.4s ease'}}>
      <div className='min-h-screen flex flex-col justify-start' style={{
        backgroundColor: isDark ? '#0E1334' : '#eeeded',
        transition: 'all 0.4s ease'}}>
          <NavBar isDark={isDark} setIsDark={setIsDark} />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Center isDark={isDark} />
                <Footer isDark={isDark} />
              </>
            }
          />
          <Route path="/about" element={<About isDark={isDark} />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
