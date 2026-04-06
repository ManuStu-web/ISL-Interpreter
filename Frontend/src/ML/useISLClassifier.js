/**
 * useISLClassifier.js
 *
 * React hook that manages the TF.js MLP classifier for ISL gestures.
 *
 * Architecture:  Input(63) → Dense(128,relu) → Dropout(0.3) →
 *                Dense(64,relu) → Dropout(0.2) → Dense(26,softmax)
 *
 * Model lifecycle:
 *   1. Try to load a saved model from IndexedDB ('indexeddb://isl-model')
 *   2. If not found, creates an untrained model (predictions will be random
 *      until the user trains via ISLModelTrainer)
 *
 * Returns:
 *   classify(normalizedVector)  → { label, confidence, allScores }
 *   modelStatus                 → 'loading' | 'untrained' | 'ready' | 'error'
 *   trainModel(samples)         → trains the model with collected samples
 *   saveModel()                 → persists model to IndexedDB
 *   clearModel()                → deletes saved model + resets
 *   trainingProgress            → { epoch, loss, accuracy } | null
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { ISL_LABELS, NUM_CLASSES, INPUT_SIZE } from './islLabels';

const MODEL_KEY = 'indexeddb://isl-model';

function buildModel() {
  const model = tf.sequential();
  model.add(tf.layers.dense({
    inputShape: [INPUT_SIZE],
    units: 128,
    activation: 'relu',
    kernelInitializer: 'heNormal',
  }));
  model.add(tf.layers.dropout({ rate: 0.3 }));
  model.add(tf.layers.dense({
    units: 64,
    activation: 'relu',
    kernelInitializer: 'heNormal',
  }));
  model.add(tf.layers.dropout({ rate: 0.2 }));
  model.add(tf.layers.dense({
    units: NUM_CLASSES,
    activation: 'softmax',
  }));

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  return model;
}

export function useISLClassifier() {
  const [modelStatus, setModelStatus] = useState('loading');
  const [trainingProgress, setTrainingProgress] = useState(null);
  const modelRef = useRef(null);

  // Load or build model on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await tf.ready();
        // Try loading saved model first
        try {
          const saved = await tf.loadLayersModel(MODEL_KEY);
          if (!cancelled) {
            modelRef.current = saved;
            // Re-compile (needed after loading)
            modelRef.current.compile({
              optimizer: tf.train.adam(0.001),
              loss: 'categoricalCrossentropy',
              metrics: ['accuracy'],
            });
            setModelStatus('ready');
          }
        } catch {
          // No saved model — build a fresh untrained one
          if (!cancelled) {
            modelRef.current = buildModel();
            setModelStatus('untrained');
          }
        }
      } catch (err) {
        console.error('[useISLClassifier] init error:', err);
        if (!cancelled) setModelStatus('error');
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  /**
   * classify(normalizedVector: number[63]) → { label, confidence, allScores }
   * Returns null if model not ready or input invalid.
   */
  const classify = useCallback((normalizedVector) => {
    if (!modelRef.current || modelStatus === 'loading' || modelStatus === 'error') return null;
    if (!normalizedVector || normalizedVector.length !== INPUT_SIZE) return null;

    return tf.tidy(() => {
      const input = tf.tensor2d([normalizedVector], [1, INPUT_SIZE]);
      const scores = modelRef.current.predict(input);
      const scoresArr = scores.dataSync();
      const maxIdx = scoresArr.indexOf(Math.max(...scoresArr));
      return {
        label: ISL_LABELS[maxIdx],
        confidence: scoresArr[maxIdx],
        allScores: Array.from(scoresArr),
      };
    });
  }, [modelStatus]);

  /**
   * trainModel(samples: Array<{ vector: number[], labelIndex: number }>)
   * Trains the model in-browser. Fires trainingProgress callbacks.
   */
  const trainModel = useCallback(async (samples) => {
    if (!samples || samples.length === 0) return;

    setModelStatus('training');
    setTrainingProgress({ epoch: 0, loss: null, accuracy: null });

    // Ensure fresh model for training (avoid contamination)
    if (modelRef.current) {
      modelRef.current.dispose();
    }
    modelRef.current = buildModel();

    // Build tensors
    const xs = tf.tensor2d(samples.map(s => s.vector), [samples.length, INPUT_SIZE]);
    const ysOneHot = tf.oneHot(
      tf.tensor1d(samples.map(s => s.labelIndex), 'int32'),
      NUM_CLASSES
    ).cast('float32');

    const EPOCHS = 50;

    await modelRef.current.fit(xs, ysOneHot, {
      epochs: EPOCHS,
      batchSize: 32,
      validationSplit: 0.15,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          setTrainingProgress({
            epoch: epoch + 1,
            totalEpochs: EPOCHS,
            loss: logs.loss?.toFixed(4),
            accuracy: ((logs.acc || logs.accuracy || 0) * 100).toFixed(1),
            valAccuracy: ((logs.val_acc || logs.val_accuracy || 0) * 100).toFixed(1),
          });
        },
      },
    });

    xs.dispose();
    ysOneHot.dispose();

    setModelStatus('ready');
    setTrainingProgress(null);
  }, []);

  /**
   * saveModel() → saves to IndexedDB so it persists across page reloads
   */
  const saveModel = useCallback(async () => {
    if (!modelRef.current) return;
    try {
      await modelRef.current.save(MODEL_KEY);
      return true;
    } catch (err) {
      console.error('[useISLClassifier] save error:', err);
      return false;
    }
  }, []);

  /**
   * clearModel() → deletes saved model, resets to untrained
   */
  const clearModel = useCallback(async () => {
    try {
      await tf.io.removeModel(MODEL_KEY);
    } catch { /* ok if not found */ }
    if (modelRef.current) {
      modelRef.current.dispose();
    }
    modelRef.current = buildModel();
    setModelStatus('untrained');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (modelRef.current) {
        modelRef.current.dispose();
      }
    };
  }, []);

  return { classify, modelStatus, trainModel, saveModel, clearModel, trainingProgress };
}