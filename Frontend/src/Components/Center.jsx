import React, { useState } from 'react'
import Camera from './Camera'
import Divider from './Divider'
import TranslationText from './TranslationText'

const Center = ({ isDark }) => {
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)

  return (
    <div className='flex flex-col items-center justify-center w-full mt-2 flex-1 gap-12'>

      {/* Main row */}
      <div className='flex items-center justify-center w-full gap-16'>
        <div className='flex items-center justify-center'>
          <Camera isDark={isDark} isCameraOn={isCameraOn} setIsCameraOn={setIsCameraOn} />
        </div>
        <div className='flex items-center justify-center'>
          <Divider isDark={isDark} />
        </div>
        <div className='flex items-center justify-center'>
          <TranslationText isDark={isDark} isTranslating={isTranslating} />
        </div>
      </div>

      {/* Buttons row — both aligned on same horizontal line */}
      <div className='flex items-center justify-center gap-6'>
        
        

        {/* Stop/Start Translation button */}
        <button
          onClick={() => setIsTranslating(!isTranslating)}
          className='px-10 hover:scale-95 py-3 rounded-full text-sm tracking-wide transition-all duration-300'
          style={{
            backgroundColor: isTranslating
              ? (isDark ? '#c9a96e' : '#111111')
              : 'transparent',
            color: isTranslating
              ? (isDark ? '#1a2235' : '#ffffff')
              : (isDark ? '#c9a96e' : '#111111'),
            border: `1px solid ${isDark ? '#c9a96e' : '#111111'}`,
            cursor: 'pointer',
            fontFamily: 'Playfair Display, serif',
            minWidth: '180px'
          }}
        >
          {isTranslating ? 'Stop Translation' : 'Start Translation'}
        </button>

      </div>

    </div>
  )
}

export default Center