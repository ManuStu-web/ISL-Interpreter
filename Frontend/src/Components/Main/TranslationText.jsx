import React, { useState } from 'react'

const TranslationText = ({ isDark, isTranslating, sentence, setSentence, currentWord, setCurrentWord }) => {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const textColor = isDark ? '#ffffff' : '#2d2d2d'
  const mutedColor = isDark ? '#6b7280' : '#9ca3af'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'

  const fullSentenceText = [...sentence, currentWord].join(' ').trim()

  const speak = () => {
    if (!fullSentenceText || isSpeaking) return
    const utterance = new SpeechSynthesisUtterance(fullSentenceText)
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const clearAll = () => {
    setSentence([])
    setCurrentWord('')
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const removeLastWord = () => {
    if (currentWord.length > 0) setCurrentWord('')
    else setSentence(prev => prev.slice(0, -1))
  }

  const statusText = (() => {
    if (!isTranslating) return 'Press Start Translation\nto begin.'
    return null
  })()

  return (
    <div style={{ width: '340px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Main display card */}
      <div style={{
        borderRadius: '16px',
        padding: '28px 24px',
        textAlign: 'center',
        minHeight: '160px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
      }}>
        {statusText ? (
          <p style={{
            color: mutedColor,
            fontFamily: 'Playfair Display, serif',
            fontSize: '1.5rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
          }}>
            {statusText}
          </p>
        ) : (
          <>
            {/* Sentence display */}
            <div style={{
              fontSize: fullSentenceText.length > 40 ? '1.1rem' : fullSentenceText.length > 20 ? '1.4rem' : '2rem',
              fontWeight: '600',
              color: textColor,
              fontFamily: 'Playfair Display, serif',
              lineHeight: 1.4,
              wordBreak: 'break-word',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {fullSentenceText || (
                <span style={{ color: mutedColor, fontSize: '1rem' }}>
                  Show your hand to the camera
                </span>
              )}
            </div>

            {/* Current word indicator */}
            {currentWord && (
              <div style={{
                fontSize: '0.75rem',
                color: mutedColor,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                borderTop: `1px solid ${borderColor}`,
                paddingTop: '8px',
                width: '100%',
              }}>
                typing: <span style={{ color: textColor, fontFamily: 'Playfair Display, serif', textTransform: 'none', letterSpacing: '0.2em' }}>{currentWord}</span>
              </div>
            )}
          </>
        )}
      </div>


    </div>
  )
}

export default TranslationText