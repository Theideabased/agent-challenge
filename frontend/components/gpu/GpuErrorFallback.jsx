'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader } from 'lucide-react';

export default function GpuErrorFallback({
  errorType = 'timeout', // 'timeout', 'out-of-memory', 'network', 'insufficient-credits'
  reason = 'Job exceeded 10 minute limit',
  jobId = 'dep_abc123xyz',
  gpuType = 'RTX 4090',
  failedAt = new Date(Date.now() - 30000).toLocaleTimeString(),
  initialCharge = 0.54,
  refundStatus = 'processing', // 'pending', 'processing', 'completed', 'failed'
  fallbackStatus = {
    started: true,
    elapsedSeconds: 15,
    estimatedTotalSeconds: 270,
    progress: 8,
  },
  onRetryGpu = () => {},
  onUseCpu = () => {},
  onContactSupport = () => {},
}) {
  const [isAutoFallback, setIsAutoFallback] = useState(fallbackStatus.started);
  const [fallbackProgress, setFallbackProgress] = useState(fallbackStatus.progress);

  // Simulate CPU fallback progress
  useEffect(() => {
    if (!isAutoFallback || fallbackProgress >= 100) return;

    const interval = setInterval(() => {
      setFallbackProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 15;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isAutoFallback, fallbackProgress]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const estimatedRemainingSeconds =
    fallbackStatus.estimatedTotalSeconds - fallbackStatus.elapsedSeconds;
  const eta = new Date(Date.now() + estimatedRemainingSeconds * 1000).toLocaleTimeString();

  const getErrorIcon = () => {
    switch (errorType) {
      case 'timeout':
        return '⏱️';
      case 'out-of-memory':
        return '💾';
      case 'network':
        return '🌐';
      case 'insufficient-credits':
        return '💰';
      default:
        return '❌';
    }
  };

  const getErrorTitle = () => {
    switch (errorType) {
      case 'timeout':
        return 'GPU Job Timeout';
      case 'out-of-memory':
        return 'Out of GPU Memory';
      case 'network':
        return 'Network Error';
      case 'insufficient-credits':
        return 'Insufficient Credits';
      default:
        return 'GPU Job Failed';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Error Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl border-2 border-red-400 p-6 shadow-lg text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{getErrorIcon()}</span>
          <div>
            <h2 className="text-2xl font-bold">⚠️ GPU JOB FAILED</h2>
            <p className="text-red-100">Auto-fallback to CPU initiated automatically</p>
          </div>
        </div>
      </div>

      {/* Error Details */}
      <div className="bg-white rounded-xl border-2 border-red-200 p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          ❌ GPU Error Details
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-sm text-gray-600 font-semibold mb-1">Error Type</div>
            <div className="text-lg font-bold text-red-700">{getErrorTitle()}</div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-sm text-gray-600 font-semibold mb-1">Reason</div>
            <div className="text-sm font-bold text-red-700">{reason}</div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-sm text-gray-600 font-semibold mb-1">Job ID</div>
            <div className="text-xs font-mono font-bold text-red-700 break-all">{jobId}</div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-sm text-gray-600 font-semibold mb-1">GPU Type</div>
            <div className="text-sm font-bold text-red-700">{gpuType}</div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg border border-red-200 col-span-2">
            <div className="text-sm text-gray-600 font-semibold mb-1">Failed At</div>
            <div className="text-sm font-bold text-red-700">{failedAt}</div>
          </div>
        </div>
      </div>

      {/* Credit Handling */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-300 p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Credit Handling</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200">
            <span className="text-sm font-semibold text-gray-700">Initial Charge</span>
            <span className="text-lg font-bold text-red-600">${initialCharge.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200">
            <span className="text-sm font-semibold text-gray-700">Refund Requested</span>
            <span
              className={`text-lg font-bold ${
                refundStatus === 'completed'
                  ? 'text-green-600'
                  : refundStatus === 'failed'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}
            >
              {refundStatus === 'completed' ? '✅' : refundStatus === 'failed' ? '❌' : '🔄'}{' '}
              ${initialCharge.toFixed(2)}
            </span>
          </div>

          <div className="p-3 bg-blue-100 rounded-lg border border-blue-300 text-sm text-blue-900">
            <span className="font-semibold">
              Status: Refund {refundStatus} (24-48 hrs for completion)
            </span>
          </div>
        </div>
      </div>

      {/* CPU Fallback Status */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          🔄 CPU Fallback Status
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-white rounded-lg border border-green-200">
            <div className="text-xs text-gray-600 font-semibold">Status</div>
            <div className="text-sm font-bold text-green-700 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
              {isAutoFallback ? 'Running' : 'Pending'}
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-green-200">
            <div className="text-xs text-gray-600 font-semibold">Method</div>
            <div className="text-sm font-bold text-green-700 mt-1">Local CPU</div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-green-200">
            <div className="text-xs text-gray-600 font-semibold">Cost</div>
            <div className="text-sm font-bold text-green-700 mt-1">FREE</div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-green-200">
            <div className="text-xs text-gray-600 font-semibold">Est. Time</div>
            <div className="text-sm font-bold text-green-700 mt-1">
              {formatTime(fallbackStatus.estimatedTotalSeconds)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Rendering Progress</span>
            <span className="text-sm font-bold text-gray-900">{Math.round(fallbackProgress)}%</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-full transition-all duration-500 flex items-center justify-center"
              style={{ width: `${Math.min(fallbackProgress, 100)}%` }}
            >
              {fallbackProgress > 10 && (
                <span className="text-xs font-bold text-white">{Math.round(fallbackProgress)}%</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Progress: {formatTime(fallbackStatus.elapsedSeconds)} elapsed</span>
            <span>ETA: {eta} (+{formatTime(estimatedRemainingSeconds)})</span>
          </div>
        </div>
      </div>

      {/* What Happened */}
      <div className="bg-blue-50 rounded-xl border-2 border-blue-300 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">⚙️ What Happened?</h3>

        <ul className="space-y-2 text-sm text-gray-800">
          <li className="flex items-start gap-2">
            <span className="text-lg mt-0.5">▸</span>
            <span>
              {errorType === 'timeout' &&
                'GPU job was too complex and exceeded the 10 minute timeout limit'}
              {errorType === 'out-of-memory' &&
                'The GPU ran out of available memory during rendering'}
              {errorType === 'network' &&
                'Network connection was lost during GPU rendering'}
              {errorType === 'insufficient-credits' &&
                'Your account ran out of credits mid-rendering'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lg mt-0.5">▸</span>
            <span>System automatically initiated fallback to CPU rendering</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lg mt-0.5">▸</span>
            <span>You'll get your video (in CPU time, which is free)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lg mt-0.5">▸</span>
            <span>No additional charges will be applied</span>
          </li>
        </ul>
      </div>

      {/* Suggestions */}
      <div className="bg-purple-50 rounded-xl border-2 border-purple-300 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Suggestions</h3>

        <ul className="space-y-2 text-sm text-gray-800">
          <li className="flex items-start gap-2">
            <span className="text-lg mt-0.5">→</span>
            <span>Try with simpler settings next time (lower resolution, fewer effects)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lg mt-0.5">→</span>
            <span>Enable GPU logging for more detailed error information</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lg mt-0.5">→</span>
            <span>Check GPU market documentation for complexity limits</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lg mt-0.5">→</span>
            <span>Contact support if this error repeats consistently</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onRetryGpu}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
        >
          🔄 Retry with GPU
        </button>

        <button
          onClick={onUseCpu}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          💻 Continue with CPU
        </button>

        <button
          onClick={onContactSupport}
          className="px-6 py-3 col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
        >
          📞 Contact Support
        </button>
      </div>

      {/* Resources Links */}
      <div className="p-4 bg-gray-100 rounded-lg border border-gray-300 text-center">
        <p className="text-sm text-gray-700 mb-2 font-semibold">Need help?</p>
        <div className="flex gap-2 justify-center flex-wrap">
          <a
            href="#"
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            [View Full GPU Logs]
          </a>
          <span className="text-gray-400">•</span>
          <a
            href="#"
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            [GPU Documentation]
          </a>
          <span className="text-gray-400">•</span>
          <a
            href="#"
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            [FAQ]
          </a>
        </div>
      </div>
    </div>
  );
}
