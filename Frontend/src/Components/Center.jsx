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
  onClick={() => {
    const nextState = !isTranslating;
    setIsTranslating(nextState);
    setIsCameraOn(nextState);
  }}
  className="
    px-10 py-3
    rounded-full
    text-lg tracking-wide
    border
    hover:scale-105
    transition-transform duration-300 ease-out
    active:scale-95
  "
  style={{
    
    background: isDark
      ? "rgba(255,255,255,0.08)"
      : "#000000",

    color: "#ffffff",

    border: isDark
      ? "1px solid rgba(255,255,255,0.25)"
      : "1px solid rgba(0,0,0,0.85)",

    boxShadow: isDark
      ? `
        0 8px 32px rgba(0,0,0,0.25),
        inset 0 1px 0 rgba(255,255,255,0.35),
        inset 0 -1px 0 rgba(255,255,255,0.08)
      `
      : `
        0 6px 18px rgba(0,0,0,0.25)
      `,

    backdropFilter: isDark ? "blur(25px)" : "none",
    WebkitBackdropFilter: isDark ? "blur(25px)" : "none",

    fontFamily: "Playfair Display, serif",
    minWidth: "180px",
    cursor: "pointer"
  }}
>
  {isTranslating ? "Stop Translation" : "Start Translation"}
</button>

      </div>

    </div>
  )
}

export default Center
