import React from 'react'

const NavBar = ({ isDark, setIsDark }) => {
  return (
    <div className='flex justify-between items-center px-10 mt-3 h-20'>
      <div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: isDark ? '#ffffff' : '#1a1a1a' }} className='text-5xl px-10 mt-7'>Zen ISL Interpreter</h1>
        <p style={{ color: isDark ? '#a0aec0' : '#6b7280' }} className='text-base px-10 text-gray-600 tracking-widest uppercase'>Active Translation</p>
      </div>

      <button
        onClick={() => setIsDark(!isDark)}
        className='mt-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300'
        style={{
          backgroundColor: isDark ? '#c9a96e' : '#8A9E7A',
          color: '#ffffff',
          border: 'none',
          cursor: 'pointer'
        }}>
      
        {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

    </div>
  )
}

export default NavBar