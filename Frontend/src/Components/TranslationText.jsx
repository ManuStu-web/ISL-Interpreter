import React from 'react'

const TranslationText = ({ isDark, isTranslating }) => {
  return (
    <div className='flex items-center justify-center w-96'>
      <div
        className='text-4xl text-center leading-snug'
        style={{
          fontFamily: 'Playfair Display, serif',
          color: isDark ? '#ffffff' : '#2d2d2d',
          opacity: isTranslating ? 1 : 0.4,
          transition: 'opacity 0.4s ease'
        }}
      >
        {isTranslating ? (
          <>
            Translating...<br />
            Good morning.<br />
            How can I help you today?
          </>
        ) : (
          <>
            Press Start<br />
            Translation<br />
            to begin.
          </>
        )}
      </div>
    </div>
  )
}

export default TranslationText