/**
 * useHandPose.js
 *
 * Loads MediaPipe Hands via @tensorflow-models/hand-pose-detection,
 * runs detection on every animation frame when `active` is true.
 *
 * Returns { landmarks, isModelReady, error }
 *   landmarks: Array<{x,y,z}> — 21 keypoints in video pixel space, or null
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection'
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'

const MODEL_CONFIG = {
  runtime: 'tfjs',
  // solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
  modelType: 'lite',
}

export function useHandPose(videoRef, active) {
  const [landmarks, setLandmarks] = useState(null)
  const [isModelReady, setIsModelReady] = useState(false)
  const [error, setError] = useState(null)

  const detectorRef = useRef(null)
  const rafRef = useRef(null)
  // Sync active into a ref via effect so the loop reads latest value
  const activeRef = useRef(active)
  useEffect(() => { activeRef.current = active }, [active])

  // Load detector once on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        await tf.ready()
        const model = handPoseDetection.SupportedModels.MediaPipeHands
        const detector = await handPoseDetection.createDetector(model, MODEL_CONFIG)
        if (cancelled) { detector.dispose(); return }
        detectorRef.current = detector
        setIsModelReady(true)
      } catch (err) {
        console.error('[useHandPose] load failed:', err)
        if (!cancelled) setError(err.message || 'Failed to load hand detector')
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Detection loop — stable callback; reads activeRef so it never goes stale
  const runLoop = useCallback(async function loop() {
    const video = videoRef.current
    const detector = detectorRef.current

    if (!activeRef.current || !video || !detector ||
        video.readyState < 2 || video.videoWidth === 0) {
      rafRef.current = requestAnimationFrame(loop)
      return
    }

    try {
      const hands = await detector.estimateHands(video, { flipHorizontal: true })
      if (hands && hands.length > 0) {
        setLandmarks(hands[0].keypoints3D || hands[0].keypoints)
      } else {
        setLandmarks(null)
      }
    } catch (err) {
      console.warn('[useHandPose] estimateHands:', err.message)
    }

    if (activeRef.current) {
      rafRef.current = requestAnimationFrame(loop)
    }
  }, [videoRef]) // videoRef is a ref object — stable identity

  // Start/stop loop when active or model readiness changes
  useEffect(() => {
    if (!isModelReady) return
    if (active) {
      rafRef.current = requestAnimationFrame(runLoop)
    } else {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      setLandmarks(null)
    }
    return () => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    }
  }, [active, isModelReady, runLoop])

  // Cleanup detector on unmount
  useEffect(() => {
    return () => {
      if (detectorRef.current) { detectorRef.current.dispose(); detectorRef.current = null }
    }
  }, [])

  return { landmarks, isModelReady, error }
}