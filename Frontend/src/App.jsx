import React, { useState } from 'react'
import NavBar from './Components/NavBar'
import Center from './Components/Center'
import Footer from './Components/Footer'
const App = () => {
  const [isDark,setIsDark] = useState(false);
  return (
    <div className='min-h-screen flex flex-col justify-start' style={{
      backgroundColor: isDark ? '#1a2235' : '#F5F0E8',
      transition: 'all 0.4s ease'}}>
      <NavBar isDark={isDark} setIsDark={setIsDark} />
      <Center isDark={isDark} />
      <Footer isDark={isDark} />
    </div>
  )
}

export default App