import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ISL_LABELS } from '../ML/islLabels'

const HOLD_DURATION_MS = 1000
const CONFIDENCE_THRESHOLD = 0.65

/**
 * TranslationText
 * Props: isDark, isTranslating, prediction, modelStatus
 *
 * Features: live letter + confidence + 1s-hold debounce + sentence builder + TTS
 */
const TranslationText = ({ isDark, isTranslating, prediction, modelStatus }) => {
  const [sentence, setSentence] = useState([])
  const [currentWord, setCurrentWord] = useState('')
  const [holdProgress, setHoldProgress] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const holdTimerRef = useRef(null)
  const holdStartRef = useRef(null)
  const progressRafRef = useRef(null)
  const lastLabelRef = useRef(null)
  // Stable ref so timer callbacks can read latest currentWord without stale closure
  const currentWordRef = useRef('')
  useEffect(() => { currentWordRef.current = currentWord }, [currentWord])

  const textColor = isDark ? '#ffffff' : '#2d2d2d'
  const mutedColor = isDark ? '#6b7280' : '#9ca3af'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'

  // --- Hold logic (all state updates happen inside timers/RAF, not effect body) ---

  const stopProgressAnimation = useCallback(() => {
    cancelAnimationFrame(progressRafRef.current)
    progressRafRef.current = null
  }, [])

  const startProgressAnimation = useCallback(() => {
    stopProgressAnimation()
    function tick() {
      if (!holdStartRef.current) return
      const elapsed = Date.now() - holdStartRef.current
      const progress = Math.min((elapsed / HOLD_DURATION_MS) * 100, 100)
      setHoldProgress(progress)
      if (progress < 100) { progressRafRef.current = requestAnimationFrame(tick) }
    }
    progressRafRef.current = requestAnimationFrame(tick)
  }, [stopProgressAnimation])

  const cancelHold = useCallback(() => {
    clearTimeout(holdTimerRef.current)
    holdTimerRef.current = null
    stopProgressAnimation()
    holdStartRef.current = null
    lastLabelRef.current = null
    // Schedule state reset outside the effect body (setTimeout makes it async)
    setTimeout(() => setHoldProgress(0), 0)
  }, [stopProgressAnimation])

  const acceptLetter = useCallback((label) => {
    if (label === 'SPACE') {
      const word = currentWordRef.current
      if (word.length > 0) setSentence(prev => [...prev, word])
      setCurrentWord('')
    } else if (label === 'DEL') {
      setCurrentWord(prev => prev.slice(0, -1))
    } else {
      setCurrentWord(prev => prev + label)
    }
    setTimeout(() => setHoldProgress(0), 0)
  }, [])

  const startHold = useCallback((label) => {
    clearTimeout(holdTimerRef.current)
    stopProgressAnimation()
    lastLabelRef.current = label
    holdStartRef.current = Date.now()
    startProgressAnimation()
    holdTimerRef.current = setTimeout(() => { acceptLetter(label) }, HOLD_DURATION_MS)
  }, [acceptLetter, startProgressAnimation, stopProgressAnimation])

  // Sync prediction → hold state.  No setState calls here — all via cancelHold/startHold
  // which schedule state updates in timers/RAF.
  useEffect(() => {
    const active = isTranslating && prediction && prediction.confidence >= CONFIDENCE_THRESHOLD
    if (!active) {
      cancelHold()
      return
    }
    if (prediction.label !== lastLabelRef.current) {
      startHold(prediction.label)
    }
  }, [prediction, isTranslating, startHold, cancelHold])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(holdTimerRef.current)
      cancelAnimationFrame(progressRafRef.current)
    }
  }, [])

  // --- UI ---

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
    setSentence([]); setCurrentWord(''); setHoldProgress(0)
    cancelHold(); window.speechSynthesis.cancel(); setIsSpeaking(false)
  }

  const removeLastWord = () => {
    if (currentWord.length > 0) setCurrentWord('')
    else setSentence(prev => prev.slice(0, -1))
  }

  const statusText = (() => {
    if (modelStatus === 'loading') return 'Loading model...'
    if (modelStatus === 'untrained') return 'Model untrained — visit /train first'
    if (modelStatus === 'error') return 'Model error'
    if (!isTranslating) return 'Press Start Translation to begin.'
    if (!prediction) return 'Show your hand to the camera'
    return null
  })()

  return (
    <div style={{ width: '340px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Current letter card */}
      <div style={{
        background: cardBg, border: `1px solid ${borderColor}`, borderRadius: '16px',
        padding: '20px', textAlign: 'center', minHeight: '140px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
      }}>
        {statusText ? (
          <p style={{ color: mutedColor, fontFamily: 'Playfair Display, serif', fontSize: '0.95rem', lineHeight: 1.5 }}>
            {statusText}
          </p>
        ) : (
          <>
            <div style={{
              fontSize: '4rem', fontWeight: '700', color: textColor,
              fontFamily: 'Playfair Display, serif', lineHeight: 1,
            }}>
              {prediction?.label || '—'}
            </div>

            <div style={{ color: mutedColor, fontSize: '0.8rem' }}>
              {prediction ? `${(prediction.confidence * 100).toFixed(0)}% confidence` : ''}
            </div>

            {/* Hold progress bar */}
            <div style={{
              width: '100%', height: '4px',
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              borderRadius: '2px', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${holdProgress}%`,
                background: holdProgress >= 100 ? '#4ECDC4' : '#45B7D1',
                borderRadius: '2px', transition: 'background 0.2s ease',
              }} />
            </div>

            {/* Top-5 confidence bars */}
            {prediction?.allScores && (
              <div style={{ display: 'flex', gap: '3px', width: '100%', marginTop: '4px' }}>
                {prediction.allScores
                  .map((score, i) => ({ score, label: ISL_LABELS[i] }))
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 5)
                  .map(({ score, label }) => (
                    <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{
                        height: '20px',
                        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                        borderRadius: '2px', position: 'relative', overflow: 'hidden',
                      }}>
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          height: `${score * 100}%`,
                          background: label === prediction.label ? '#4ECDC4' : 'rgba(255,255,255,0.2)',
                        }} />
                      </div>
                      <div style={{ fontSize: '0.65rem', color: mutedColor, marginTop: '2px' }}>{label}</div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Current word */}
      <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '12px 16px', minHeight: '48px' }}>
        <div style={{ fontSize: '0.7rem', color: mutedColor, marginBottom: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Current word</div>
        <div style={{ fontSize: '1.5rem', color: textColor, fontFamily: 'Playfair Display, serif', letterSpacing: '0.1em', minHeight: '32px', display: 'flex', alignItems: 'center' }}>
          {currentWord || <span style={{ color: mutedColor, fontSize: '0.9rem' }}>spelling...</span>}
        </div>
      </div>

      {/* Sentence */}
      <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '12px 16px', minHeight: '64px' }}>
        <div style={{ fontSize: '0.7rem', color: mutedColor, marginBottom: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Sentence</div>
        <div style={{ fontSize: '1.05rem', color: textColor, fontFamily: 'Playfair Display, serif', lineHeight: 1.5, wordBreak: 'break-word', minHeight: '28px' }}>
          {fullSentenceText || <span style={{ color: mutedColor, fontSize: '0.85rem' }}>sentence appears here...</span>}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={speak} disabled={!fullSentenceText || isSpeaking}
          style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${borderColor}`, background: isSpeaking ? '#4ECDC4' : cardBg, color: isSpeaking ? '#000' : textColor, cursor: fullSentenceText && !isSpeaking ? 'pointer' : 'not-allowed', fontSize: '0.85rem', fontFamily: 'Playfair Display, serif', transition: 'all 0.2s ease', opacity: !fullSentenceText ? 0.4 : 1 }}>
          {isSpeaking ? '🔊 Speaking...' : '🔊 Speak'}
        </button>
        <button onClick={removeLastWord} disabled={!fullSentenceText}
          style={{ padding: '10px 14px', borderRadius: '10px', border: `1px solid ${borderColor}`, background: cardBg, color: textColor, cursor: fullSentenceText ? 'pointer' : 'not-allowed', fontSize: '0.85rem', opacity: !fullSentenceText ? 0.4 : 1 }}>
          ⌫
        </button>
        <button onClick={clearAll} disabled={!fullSentenceText}
          style={{ padding: '10px 14px', borderRadius: '10px', border: `1px solid ${borderColor}`, background: cardBg, color: '#FF6B6B', cursor: fullSentenceText ? 'pointer' : 'not-allowed', fontSize: '0.85rem', opacity: !fullSentenceText ? 0.4 : 1 }}>
          ✕
        </button>
      </div>

      <div style={{ fontSize: '0.72rem', color: mutedColor, lineHeight: 1.5, textAlign: 'center' }}>
        Hold a gesture for 1 second to accept · Open palm = space
      </div>
    </div>
  )
}

export default TranslationText