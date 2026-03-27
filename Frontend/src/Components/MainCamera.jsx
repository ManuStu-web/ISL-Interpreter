import React, { useEffect, useRef } from 'react'

const MainCamera = ({ isDark, isCameraOn }) => {
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    if (isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          streamRef.current = stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch(err => console.error('Camera access denied:', err))
    } else {
      if (streamRef.current)   {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [isCameraOn])

  return (
    <div
      className='w-106 h-74 rounded-2xl overflow-hidden flex items-center justify-center'
      style={{
        backgroundColor: isDark ? '#1a2235' : '#e8e0d5',
        border: isDark ? '1px solid #3d5070' : '1px solid #c0b09a'
      }}
    >
      {isCameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className='w-full h-full object-cover'
        />
      ) : (
        <p style={{
          color: isDark ? '#4a6080' : '#a09080',
          fontFamily: 'Playfair Display, serif',
          fontSize: '0.9rem'
        }}>
          Camera is off
        </p>
      )}
    </div>
  )
}

export default MainCamera