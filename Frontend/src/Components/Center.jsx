import React, { useState } from 'react'
import Camera from './Camera'
import Divider from './Divider'
import TranslationText from './TranslationText'

const Center = ({ isDark }) => {
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)

  return (
    <div className='flex flex-col items-center justify-center w-full flex-1 gap-12 mt-30'>

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
          className="
             px-10 py-3
              rounded-full
              text-sm tracking-wide
              backdrop-blur-2xl
             border
                transition-all duration-300"
          style={{
            background: "rgba(255,255,255,0.08)",

            border: "1px solid rgba(255,255,255,0.25)",

            boxShadow: `
      0 8px 32px rgba(0,0,0,0.25),
      inset 0 1px 0 rgba(255,255,255,0.35),
      inset 0 -1px 0 rgba(255,255,255,0.08)
    `,

            backdropFilter: "blur(25px)",
            WebkitBackdropFilter: "blur(25px)",

            color: isDark ? "#ffffff" : "#1a1a1a",

            fontFamily: "Playfair Display, serif",
            minWidth: "180px",
            cursor: "pointer",

            /* smooth animation for everything */
            transition: `
      transform 0.25s ease,
      background 0.4s ease,
      border 0.4s ease,
      box-shadow 0.4s ease,
      color 0.3s ease
    `
          }}

          onMouseEnter={(e) => {

            e.currentTarget.style.transform = "scale(1.05)"


            e.currentTarget.style.border = "1px solid rgba(120,160,255,0.55)"

            e.currentTarget.style.boxShadow = `
      0 0 25px rgba(120,160,255,0.35),
      0 12px 40px rgba(0,0,0,0.45),
      inset 0 1px 0 rgba(255,255,255,0.55),
      inset 0 -1px 0 rgba(0,0,0,0.3)
    `
          }}

          onMouseLeave={(e) => {

            e.currentTarget.style.transform = "scale(1)"

            e.currentTarget.style.background = "rgba(255,255,255,0.08)"

            e.currentTarget.style.border = "1px solid rgba(255,255,255,0.25)"

            e.currentTarget.style.boxShadow = `
      0 8px 32px rgba(0,0,0,0.25),
      inset 0 1px 0 rgba(255,255,255,0.35),
      inset 0 -1px 0 rgba(255,255,255,0.08)
    `
          }}
        >
          {isTranslating ? "Stop Translation" : "Start Translation"}
        </button>

      </div>

    </div>
  )
}

export default Center