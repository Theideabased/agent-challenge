'use client';

import React, { useState, useEffect } from 'react';
import { Monitor, Zap, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function GpuToggle({
  isGpuEnabled = false,
  onToggle = () => {},
  onSettingsClick = () => {},
  gpuStatus = 'idle', // 'idle', 'checking', 'connected', 'error'
  credits = 0,
  gpuMarket = 'RTX 4090',
  estimatedCost = 0,
  estimatedDuration = 3, // minutes
}) {
  const [hoveredButton, setHoveredButton] = useState(null);

  // Calculate cost based on duration and market rate
  const getCostPerMin = (market) => {
    const rates = {
      'RTX 4090': 0.15,
      'A100': 0.20,
      'L40': 0.10,
      'T4': 0.04,
    };
    return rates[market] || 0.15;
  };

  const costPerMin = getCostPerMin(gpuMarket);
  const calculatedCost = (costPerMin * estimatedDuration).toFixed(2);

  // Determine GPU status icon and color
  const getStatusIcon = () => {
    switch (gpuStatus) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'checking':
        return <Loader className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (gpuStatus) {
      case 'connected':
        return '✅ Connected';
      case 'checking':
        return '🔄 Checking...';
      case 'error':
        return '❌ Error';
      default:
        return '⚠️ Not Set Up';
    }
  };

  const getStatusColor = () => {
    switch (gpuStatus) {
      case 'connected':
        return 'from-purple-100 to-purple-50 border-purple-200';
      case 'error':
        return 'from-red-100 to-red-50 border-red-200';
      case 'checking':
        return 'from-yellow-100 to-yellow-50 border-yellow-200';
      default:
        return 'from-gray-100 to-gray-50 border-gray-200';
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl border-2 border-slate-700 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">🎬 Rendering Mode</h3>
        </div>
      </div>

      {/* Toggle Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-1 mb-6">
        <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
          {/* CPU Button */}
          <button
            onClick={() => onToggle(false)}
            onMouseEnter={() => setHoveredButton('cpu')}
            onMouseLeave={() => setHoveredButton(null)}
            className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              !isGpuEnabled
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            <Monitor className="w-4 h-4" />
            💻 CPU
          </button>

          {/* GPU Button */}
          <button
            onClick={() => {
              if (gpuStatus === 'error') {
                onSettingsClick();
              } else {
                onToggle(true);
              }
            }}
            onMouseEnter={() => setHoveredButton('gpu')}
            onMouseLeave={() => setHoveredButton(null)}
            className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              isGpuEnabled && gpuStatus !== 'error'
                ? 'bg-purple-600 text-white shadow-lg scale-105'
                : gpuStatus === 'error'
                ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
            disabled={gpuStatus === 'checking'}
          >
            <Zap className="w-4 h-4" />
            🎮 GPU
            {gpuStatus === 'checking' && <Loader className="w-3 h-3 animate-spin" />}
          </button>
        </div>
      </div>

      {/* Status Text */}
      <p className="text-sm text-gray-300 text-center mb-6 font-medium">
        {isGpuEnabled ? (
          <>
            <span className="text-purple-300">Nosana GPU</span> {' '}
            <span className="text-gray-400">Rendering</span>
          </>
        ) : (
          <>
            <span className="text-blue-300">Local</span> {' '}
            <span className="text-gray-400">CPU Rendering</span>
          </>
        )}
      </p>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-6" />

      {/* GPU Status Section (only show if GPU is enabled or available) */}
      {(isGpuEnabled || gpuStatus !== 'idle') && (
        <div className={`rounded-xl border-2 p-4 mb-6 bg-gradient-to-br ${getStatusColor()}`}>
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            📊 GPU Status
            {getStatusIcon()}
          </h4>

          <div className="space-y-2 text-sm">
            {/* API Status */}
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">API:</span>
              <span className="font-semibold">
                {gpuStatus === 'connected' ? (
                  <span className="text-green-600">✅ Connected</span>
                ) : gpuStatus === 'error' ? (
                  <span className="text-red-600">❌ Disconnected</span>
                ) : (
                  <span className="text-yellow-600">⚠️ Not Verified</span>
                )}
              </span>
            </div>

            {/* Credits */}
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Credits:</span>
              <span className={`font-semibold ${credits > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {credits.toFixed(2)} NOS
              </span>
            </div>

            {/* Market */}
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Market:</span>
              <span className="font-semibold text-purple-700">
                {gpuMarket} (${costPerMin}/min)
              </span>
            </div>

            {/* Estimated Cost */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-300">
              <span className="text-gray-700 font-bold">Est. Cost:</span>
              <span className="font-bold text-lg text-purple-700">
                ${calculatedCost} for ~{estimatedDuration}min
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onSettingsClick}
          className="flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 text-white bg-slate-700 hover:bg-slate-600 active:scale-95 flex items-center justify-center gap-2"
        >
          ⚙️ Settings
        </button>
        <button
          onClick={() => {}} // Info button - can be implemented later
          className="flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 text-white bg-slate-700 hover:bg-slate-600 active:scale-95 flex items-center justify-center gap-2"
        >
          ℹ️ Details
        </button>
      </div>

      {/* Warning Message if Error */}
      {gpuStatus === 'error' && (
        <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-600 rounded">
          <p className="text-sm text-red-800 font-semibold">
            ⚠️ GPU Setup Error: Click Settings to add your Nosana API key
          </p>
        </div>
      )}

      {/* Info Message if Not Set Up */}
      {!isGpuEnabled && gpuStatus === 'idle' && (
        <div className="mt-4 p-3 bg-blue-100 border-l-4 border-blue-600 rounded">
          <p className="text-sm text-blue-800 font-semibold">
            💡 Tip: Enable GPU rendering for 2-3x faster video generation!
          </p>
        </div>
      )}
    </div>
  );
}
