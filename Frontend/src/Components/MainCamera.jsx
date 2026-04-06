import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { drawHandSkeleton } from '../ML/drawHandSkeleton'

/**
 * MainCamera
 *
 * Props:
 *  isDark       - theme
 *  isCameraOn   - controls webcam stream
 *  landmarks    - 21-point array from useHandPose (or null)
 *
 * Exposes via ref:
 *  videoRef     - the <video> DOM element (needed by useHandPose)
 */
const MainCamera = forwardRef(function MainCamera({ isDark, isCameraOn, landmarks }, ref) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  // Expose the video element to parent via ref
  useImperativeHandle(ref, () => videoRef.current, [])

  // Camera stream management
  useEffect(() => {
    if (isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })
        .then(stream => {
          console.log('[MainCamera] Stream obtained:', stream)
          streamRef.current = stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.onloadedmetadata = () => {
              console.log('[MainCamera] Playing video')
              videoRef.current.play()
            }
            videoRef.current.onplay = () => console.log('[MainCamera] Video started playing')
            videoRef.current.onerror = (e) => console.error('[MainCamera] Video error:', e)
          }
        })
        .catch(err => console.error('[MainCamera] Camera error:', err))
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [isCameraOn])

  // Draw skeleton on canvas whenever landmarks update
  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!canvas) return

    if (!landmarks || !isCameraOn) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
    }

    const ctx = canvas.getContext('2d')
    const videoW = video?.videoWidth || 640
    const videoH = video?.videoHeight || 480
    drawHandSkeleton(ctx, landmarks, videoW, videoH, canvas.width, canvas.height)
  }, [landmarks, isCameraOn])

  return (
    <div
      className='relative rounded-2xl overflow-hidden'
      style={{
        width: '424px',
        height: '296px',
        backgroundColor: isDark ? '#1a2235' : '#e8e0d5',
        border: isDark ? '1px solid #3d5070' : '1px solid #c0b09a',
      }}
    >
      {isCameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
          }}
        />
      ) : (
        <div className='w-full h-full flex items-center justify-center' style={{ position: 'absolute', inset: 0 }}>
          <p style={{
            color: isDark ? '#4a6080' : '#a09080',
            fontFamily: 'Playfair Display, serif',
            fontSize: '0.9rem',
          }}>
            Camera is off
          </p>
        </div>
      )}

      {/* Canvas overlay for skeleton */}
      <canvas
        ref={canvasRef}
        width={424}
        height={296}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />

      {/* Hand detected indicator */}
      {isCameraOn && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: landmarks ? '#4ECDC4' : '#FF6B6B',
          boxShadow: landmarks ? '0 0 8px #4ECDC4' : '0 0 8px #FF6B6B',
          transition: 'background-color 0.3s ease',
        }} />
      )}
    </div>
  )
})

export default MainCamera