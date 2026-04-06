import React, { useState, useRef, useEffect } from 'react'
import { useHandPose } from '../ML/useHandPose'
import { useISLClassifier } from '../ML/useISLClassifier'
import { normalizeLandmarks, ISL_LABELS, NUM_CLASSES } from '../ML/islLabels'
import { drawHandSkeleton } from '../ML/drawHandSkeleton'

const SAMPLES_PER_CLASS = 30

/**
 * ISLModelTrainer
 *
 * Accessible at /train. Collects hand gesture samples per ISL letter,
 * trains the MLP in-browser, then saves to IndexedDB for use in Translator.
 */
const ISLModelTrainer = ({ isDark }) => {
  const [selectedLabel, setSelectedLabel] = useState(0)
  const [samples, setSamples] = useState({})
  const [isCollecting, setIsCollecting] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const { landmarks, isModelReady: handReady } = useHandPose(videoRef, isCameraOn)
  const { trainModel, saveModel, clearModel, modelStatus, trainingProgress } = useISLClassifier()

  // Draw skeleton on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas) return
    if (!landmarks || !isCameraOn) {
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      return
    }
    const vW = video?.videoWidth || 640
    const vH = video?.videoHeight || 480
    drawHandSkeleton(canvas.getContext('2d'), landmarks, vW, vH, canvas.width, canvas.height)
  }, [landmarks, isCameraOn])

  // Camera stream
  useEffect(() => {
    let stream = null
    if (isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })
        .then(s => {
          stream = s
          if (videoRef.current) videoRef.current.srcObject = s
        })
        .catch(err => console.error('[Trainer] camera:', err))
    } else {
      if (videoRef.current) videoRef.current.srcObject = null
    }
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()) }
  }, [isCameraOn])

  // Auto-collect: add a sample every time landmarks update while collecting
  useEffect(() => {
    if (!isCollecting || !landmarks) return
    const label = ISL_LABELS[selectedLabel]
    const vec = normalizeLandmarks(landmarks)
    if (!vec) return
    setSamples(prev => {
      const existing = prev[label] || []
      if (existing.length >= SAMPLES_PER_CLASS * 3) return prev
      return { ...prev, [label]: [...existing, vec] }
    })
  }, [landmarks, isCollecting, selectedLabel])

  const totalSamples = Object.values(samples).reduce((a, v) => a + v.length, 0)
  const coveredLabels = ISL_LABELS.filter(k => (samples[k]?.length || 0) >= SAMPLES_PER_CLASS)

  const handleTrain = async () => {
    const allSamples = []
    for (let i = 0; i < NUM_CLASSES; i++) {
      const label = ISL_LABELS[i]
      const vecs = samples[label] || []
      vecs.forEach(vector => allSamples.push({ vector, labelIndex: i }))
    }
    if (allSamples.length < 10) {
      alert('Collect samples for at least a few letters before training.')
      return
    }
    // Shuffle
    for (let i = allSamples.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[allSamples[i], allSamples[j]] = [allSamples[j], allSamples[i]]
    }
    await trainModel(allSamples)
  }

  const handleSave = async () => {
    const ok = await saveModel()
    setSaveMsg(ok ? '✓ Model saved to browser storage' : '✗ Save failed')
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const handleClearModel = async () => {
    if (!window.confirm('Delete saved model? You will need to retrain.')) return
    await clearModel()
    setSamples({})
    setSaveMsg('Model cleared.')
    setTimeout(() => setSaveMsg(''), 2000)
  }

  const bg = isDark ? '#0E1334' : '#eeeded'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const border = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
  const text = isDark ? '#ffffff' : '#1a1a1a'
  const muted = isDark ? '#6b7280' : '#9ca3af'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, padding: '40px 24px', color: text }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Header */}
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'Playfair Display, serif', marginBottom: '6px' }}>
            ISL Model Trainer
          </h1>
          <p style={{ color: muted, fontSize: '0.9rem', marginBottom: '8px' }}>
            Collect hand gesture samples for each ISL letter, then train the classifier in your browser.
          </p>
          <a href="/" style={{ color: '#4ECDC4', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← Back to Translator
          </a>
        </div>

        {/* Status bar */}
        <div style={{
          background: cardBg, border, borderRadius: '12px', padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
        }}>
          <span style={{
            display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: handReady ? '#4ECDC4' : '#FF6B6B',
          }} />
          <span style={{ fontSize: '0.85rem', color: muted }}>
            Hand detector: {handReady ? 'Ready' : 'Loading...'}
          </span>
          <span style={{ color: muted }}>·</span>
          <span style={{ fontSize: '0.85rem', color: muted }}>Classifier: {modelStatus}</span>
          <span style={{ color: muted }}>·</span>
          <span style={{ fontSize: '0.85rem', color: muted }}>Total samples: {totalSamples}</span>
          <span style={{ color: muted }}>·</span>
          <span style={{ fontSize: '0.85rem', color: '#4ECDC4' }}>
            Letters covered: {coveredLabels.length}/{NUM_CLASSES}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

          {/* Camera panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              position: 'relative', width: '320px', height: '240px',
              borderRadius: '16px', overflow: 'hidden',
              backgroundColor: isDark ? '#1a2235' : '#e8e0d5',
              border: isDark ? '1px solid #3d5070' : '1px solid #c0b09a',
            }}>
              <video
                ref={videoRef}
                autoPlay playsInline muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
              />
              <canvas
                ref={canvasRef}
                width={320} height={240}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
              />
              {isCollecting && (
                <div style={{
                  position: 'absolute', top: '10px', left: '10px',
                  background: 'rgba(78,205,196,0.2)', border: '1px solid #4ECDC4',
                  borderRadius: '6px', padding: '4px 10px',
                  fontSize: '0.7rem', color: '#4ECDC4', letterSpacing: '0.1em',
                }}>
                  ● COLLECTING
                </div>
              )}
              {landmarks && (
                <div style={{
                  position: 'absolute', bottom: '10px', right: '10px',
                  background: 'rgba(0,0,0,0.5)', borderRadius: '6px',
                  padding: '4px 8px', fontSize: '0.7rem', color: '#4ECDC4',
                }}>
                  Hand detected
                </div>
              )}
            </div>

            <button
              onClick={() => { setIsCameraOn(v => !v); setIsCollecting(false) }}
              style={{
                padding: '10px', borderRadius: '10px', border,
                background: isCameraOn ? 'rgba(255,107,107,0.15)' : cardBg,
                color: isCameraOn ? '#FF6B6B' : text,
                cursor: 'pointer', fontSize: '0.9rem',
              }}
            >
              {isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => isCollecting ? setIsCollecting(false) : (setIsCameraOn(true), setIsCollecting(true))}
                disabled={!handReady}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border,
                  background: isCollecting ? '#4ECDC4' : cardBg,
                  color: isCollecting ? '#000' : text,
                  cursor: handReady ? 'pointer' : 'not-allowed',
                  fontSize: '0.85rem', fontWeight: '500',
                  opacity: !handReady ? 0.5 : 1,
                }}
              >
                {isCollecting ? '⏹ Stop' : '⏺ Collect'}
              </button>
              <button
                onClick={() => setSamples(prev => { const n = { ...prev }; delete n[ISL_LABELS[selectedLabel]]; return n })}
                style={{
                  padding: '10px 14px', borderRadius: '10px', border,
                  background: cardBg, color: '#FF6B6B', cursor: 'pointer', fontSize: '0.85rem',
                }}
              >
                Clear
              </button>
            </div>

            {/* Sample count for selected letter */}
            <div style={{ background: cardBg, border, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                Samples for &ldquo;{ISL_LABELS[selectedLabel]}&rdquo;
              </div>
              <div style={{ fontSize: '2rem', fontFamily: 'Playfair Display, serif', color: text }}>
                {(samples[ISL_LABELS[selectedLabel]] || []).length}
              </div>
              <div style={{ fontSize: '0.75rem', color: muted }}>/ {SAMPLES_PER_CLASS} minimum</div>
              <div style={{
                marginTop: '8px', height: '4px',
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                borderRadius: '2px', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(((samples[ISL_LABELS[selectedLabel]] || []).length / SAMPLES_PER_CLASS) * 100, 100)}%`,
                  background: '#4ECDC4', borderRadius: '2px',
                }} />
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '280px' }}>

            {/* Letter grid */}
            <div style={{ background: cardBg, border, borderRadius: '16px', padding: '16px' }}>
              <div style={{ fontSize: '0.7rem', color: muted, marginBottom: '12px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Select letter to collect
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                {ISL_LABELS.map((label, i) => {
                  const count = (samples[label] || []).length
                  const done = count >= SAMPLES_PER_CLASS
                  const active = i === selectedLabel
                  return (
                    <button
                      key={label}
                      onClick={() => { setSelectedLabel(i); setIsCollecting(false) }}
                      style={{
                        padding: '8px 4px', borderRadius: '8px', position: 'relative',
                        border: active ? '2px solid #4ECDC4' : done ? '1px solid rgba(78,205,196,0.4)' : border,
                        background: active ? 'rgba(78,205,196,0.15)' : done ? 'rgba(78,205,196,0.06)' : cardBg,
                        color: active || done ? '#4ECDC4' : text,
                        cursor: 'pointer', fontSize: '0.85rem',
                        fontWeight: active ? '600' : '400',
                      }}
                    >
                      {label}
                      {done && (
                        <span style={{
                          position: 'absolute', top: '-4px', right: '-4px',
                          width: '8px', height: '8px', borderRadius: '50%', background: '#4ECDC4',
                        }} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Instructions */}
            <div style={{ background: cardBg, border, borderRadius: '12px', padding: '14px 16px' }}>
              <div style={{ fontSize: '0.7rem', color: muted, marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                How to collect
              </div>
              <ol style={{ color: muted, fontSize: '0.82rem', lineHeight: 1.8, paddingLeft: '16px', margin: 0 }}>
                <li>Select a letter from the grid</li>
                <li>Form that ISL hand shape in front of the camera</li>
                <li>Click <strong style={{ color: text }}>Collect</strong> — hold still for ~3 seconds</li>
                <li>Aim for {SAMPLES_PER_CLASS}+ samples per letter</li>
                <li>Repeat for each letter you want to recognise</li>
                <li>Click <strong style={{ color: text }}>Train Model</strong> when done</li>
              </ol>
            </div>

            {/* Training progress */}
            {trainingProgress && (
              <div style={{ background: cardBg, border, borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ fontSize: '0.7rem', color: muted, marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Training in progress
                </div>
                <div style={{ fontSize: '0.85rem', color: text, marginBottom: '8px' }}>
                  Epoch {trainingProgress.epoch}/{trainingProgress.totalEpochs}
                  &nbsp;·&nbsp;Loss: {trainingProgress.loss}
                  &nbsp;·&nbsp;Acc: {trainingProgress.accuracy}%
                  &nbsp;·&nbsp;Val: {trainingProgress.valAccuracy}%
                </div>
                <div style={{
                  height: '6px',
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  borderRadius: '3px', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${((trainingProgress.epoch || 0) / (trainingProgress.totalEpochs || 50)) * 100}%`,
                    background: 'linear-gradient(to right, #45B7D1, #4ECDC4)',
                    borderRadius: '3px', transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleTrain}
                disabled={modelStatus === 'training' || totalSamples < 10}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  border: '1px solid rgba(78,205,196,0.4)',
                  background: 'rgba(78,205,196,0.15)', color: '#4ECDC4',
                  cursor: modelStatus === 'training' || totalSamples < 10 ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem', fontWeight: '500',
                  opacity: totalSamples < 10 ? 0.5 : 1,
                }}
              >
                {modelStatus === 'training' ? '⏳ Training...' : '🧠 Train Model'}
              </button>

              <button
                onClick={handleSave}
                disabled={modelStatus !== 'ready'}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px', border,
                  background: cardBg, color: modelStatus === 'ready' ? text : muted,
                  cursor: modelStatus === 'ready' ? 'pointer' : 'not-allowed',
                  fontSize: '0.9rem', opacity: modelStatus !== 'ready' ? 0.5 : 1,
                }}
              >
                💾 Save Model
              </button>

              <button
                onClick={handleClearModel}
                style={{
                  padding: '12px 16px', borderRadius: '12px', border,
                  background: cardBg, color: '#FF6B6B', cursor: 'pointer', fontSize: '0.9rem',
                }}
              >
                🗑
              </button>
            </div>

            {saveMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: '10px',
                background: saveMsg.startsWith('✓') ? 'rgba(78,205,196,0.1)' : 'rgba(255,107,107,0.1)',
                border: `1px solid ${saveMsg.startsWith('✓') ? 'rgba(78,205,196,0.3)' : 'rgba(255,107,107,0.3)'}`,
                color: saveMsg.startsWith('✓') ? '#4ECDC4' : '#FF6B6B',
                fontSize: '0.85rem',
              }}>
                {saveMsg}
              </div>
            )}

            {/* Sample distribution */}
            {totalSamples > 0 && (
              <div style={{ background: cardBg, border, borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ fontSize: '0.7rem', color: muted, marginBottom: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Sample distribution
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {ISL_LABELS.map(label => {
                    const count = (samples[label] || []).length
                    if (count === 0) return null
                    return (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '16px', fontSize: '0.75rem', color: muted, textAlign: 'center' }}>{label}</span>
                        <div style={{
                          flex: 1, height: '6px',
                          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                          borderRadius: '3px', overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min((count / (SAMPLES_PER_CLASS * 2)) * 100, 100)}%`,
                            background: count >= SAMPLES_PER_CLASS ? '#4ECDC4' : '#45B7D1',
                            borderRadius: '3px',
                          }} />
                        </div>
                        <span style={{ width: '28px', fontSize: '0.72rem', color: muted, textAlign: 'right' }}>{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ISLModelTrainer