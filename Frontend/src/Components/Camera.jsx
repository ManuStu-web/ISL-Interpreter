import React, { useEffect, useState } from 'react'
import MainCamera from './MainCamera'

const blobShapes = [
  '60% 40% 55% 45% / 50% 60% 40% 50%',
  '45% 55% 40% 60% / 60% 40% 55% 45%',
  '55% 45% 65% 35% / 45% 55% 50% 50%',
  '40% 60% 50% 50% / 55% 45% 60% 40%',
  '65% 35% 45% 55% / 40% 60% 45% 55%',
  '50% 50% 60% 40% / 65% 35% 55% 45%',
]

const Camera = ({ isDark, isCameraOn }) => {
  const [shapeIndex, setShapeIndex] = useState(0)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const shapeInterval = setInterval(() => {
      setShapeIndex(prev => (prev + 1) % blobShapes.length)
    }, 2000)

    const scaleInterval = setInterval(() => {
      setScale(prev => prev === 1 ? 1.04 : 1)
    }, 1000)

    return () => {
      clearInterval(shapeInterval)
      clearInterval(scaleInterval)
    }
  }, [])

  return (
    <div className="relative flex justify-center items-center">
      
      {/* Animated blob */}
      <div
        className="absolute"
        style={{
          backgroundColor: isDark ? '#2d3f5e' : '#D4C4B0',
          borderRadius: blobShapes[shapeIndex],
          width: '520px',
          height: '420px',
          boxShadow: isDark
            ? 'inset 0 4px 20px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.4)'
            : 'inset 0 4px 10px rgba(0,0,0,0.1), 0 6px 24px rgba(0,0,0,0.08)',
          transform: `scale(${scale})`,
          transition: 'border-radius 2s ease-in-out, transform 1s ease-in-out, background-color 0.4s ease',
        }}
      />

      {/* Camera stays fixed */}
      <div className="relative z-10">
        <MainCamera isDark={isDark} isCameraOn={isCameraOn} />
      </div>

    </div>
  )
}

export default Camera