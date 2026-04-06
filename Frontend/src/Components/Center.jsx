import React, { useState, useRef, useCallback } from 'react'
import Camera from './Camera'
import Divider from './Divider'
import TranslationText from './TranslationText'
import { useHandPose } from '../ML/useHandPose'
import { useISLClassifier } from '../ML/useISLClassifier'
import { normalizeLandmarks } from '../ML/islLabels'

/**
 * Center
 *
 * Orchestrates the full ML pipeline:
 *   Camera → MainCamera (video) → useHandPose (landmarks) →
 *   normalizeLandmarks → useISLClassifier (prediction) → TranslationText
 */
const Center = ({ isDark }) => {
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)

  // Ref to the <video> element inside MainCamera
  const videoRef = useRef(null)

  // ML hooks
  const { landmarks, isModelReady: handModelReady, error: handError } = useHandPose(videoRef, isTranslating)
  const { classify, modelStatus, trainingProgress } = useISLClassifier()

  // Compute prediction from landmarks
  const prediction = useCallback(() => {
    if (!landmarks || !isTranslating) return null
    const normalized = normalizeLandmarks(landmarks)
    if (!normalized) return null
    return classify(normalized)
  }, [landmarks, isTranslating, classify])()

  const handleToggle = () => {
    const next = !isTranslating
    setIsTranslating(next)
    setIsCameraOn(next)
  }

  // Status summary for display
  const pipelineStatus = () => {
    if (handError) return `Hand model error: ${handError}`
    if (!handModelReady) return 'Loading hand detector...'
    if (modelStatus === 'loading') return 'Loading classifier...'
    if (modelStatus === 'error') return 'Classifier error'
    if (modelStatus === 'untrained') return 'Classifier untrained'
    return 'Ready'
  }

  return (
    <div className='flex flex-col items-center justify-center w-full flex-1 gap-12 mt-30'>

      {/* Status bar */}
      <div style={{
        fontSize: '0.75rem',
        color: isDark ? '#6b7280' : '#9ca3af',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
      }}>
        <span style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: handModelReady && modelStatus === 'ready'
            ? '#4ECDC4'
            : modelStatus === 'untrained'
            ? '#FFEAA7'
            : '#FF6B6B',
        }} />
        {pipelineStatus()}
        {trainingProgress && (
          <span>
            Training: epoch {trainingProgress.epoch}/{trainingProgress.totalEpochs}
            — acc {trainingProgress.accuracy}%
          </span>
        )}
      </div>

      {/* Main row */}
      <div className='flex items-center justify-center w-full gap-16'>
        <div className='flex items-center justify-center'>
          {/* Camera passes videoRef down to MainCamera */}
          <Camera
            isDark={isDark}
            isCameraOn={isCameraOn}
            landmarks={landmarks}
            videoRef={videoRef}
          />
        </div>
        <div className='flex items-center justify-center'>
          <Divider isDark={isDark} />
        </div>
        <div className='flex items-center justify-center'>
          <TranslationText
            isDark={isDark}
            isTranslating={isTranslating}
            prediction={prediction}
            modelStatus={modelStatus}
          />
        </div>
      </div>

      {/* Buttons row */}
      <div className='flex items-center justify-center gap-6'>
        <button
          onClick={handleToggle}
          className="px-10 py-3 rounded-full text-lg tracking-wide border hover:scale-105 transition-transform duration-300 ease-out active:scale-95"
          style={{
            background: isTranslating
              ? 'rgba(255, 107, 107, 0.15)'
              : isDark
              ? 'rgba(255,255,255,0.08)'
              : '#000000',
            color: '#ffffff',
            border: isTranslating
              ? '1px solid rgba(255,107,107,0.5)'
              : isDark
              ? '1px solid rgba(255,255,255,0.25)'
              : '1px solid rgba(0,0,0,0.85)',
            boxShadow: isDark
              ? `0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.35)`
              : `0 6px 18px rgba(0,0,0,0.25)`,
            backdropFilter: isDark ? 'blur(25px)' : 'none',
            WebkitBackdropFilter: isDark ? 'blur(25px)' : 'none',
            fontFamily: 'Playfair Display, serif',
            minWidth: '180px',
            cursor: 'pointer',
          }}
        >
          {isTranslating ? 'Stop Translation' : 'Start Translation'}
        </button>
      </div>

      {/* Model untrained hint */}
      {modelStatus === 'untrained' && (
        <div style={{
          fontSize: '0.8rem',
          color: '#FFEAA7',
          textAlign: 'center',
          maxWidth: '500px',
          lineHeight: 1.5,
          opacity: 0.8,
        }}>
          No trained model found. Visit <strong>/train</strong> to collect hand samples and train the classifier.
          The pipeline is fully functional — only the classifier weights are missing.
        </div>
      )}

    </div>
  )
}

export default Center