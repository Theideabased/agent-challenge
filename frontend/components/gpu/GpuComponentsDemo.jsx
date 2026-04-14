'use client';

import React, { useState } from 'react';
import GpuToggle from '@/components/gpu/GpuToggle';
import GpuSettingsModal from '@/components/gpu/GpuSettingsModal';
import GpuProgressMonitor from '@/components/gpu/GpuProgressMonitor';
import GpuStatusDashboard from '@/components/gpu/GpuStatusDashboard';
import GpuCompletionCard from '@/components/gpu/GpuCompletionCard';
import GpuErrorFallback from '@/components/gpu/GpuErrorFallback';

/**
 * DEMO: GPU Components Integration
 * 
 * This file demonstrates how all 6 GPU components work together
 * in a complete workflow with state management.
 * 
 * Flow:
 * 1. User toggles GPU mode → GpuToggle
 * 2. Click Settings → GpuSettingsModal
 * 3. Start rendering → GpuProgressMonitor shows progress
 * 4. Job completes → GpuCompletionCard displays results
 * 5. If error → GpuErrorFallback handles fallback
 * 
 * Sidebar always shows → GpuStatusDashboard
 */

export default function GpuComponentsDemo() {
  // Main state management
  const [isGpuEnabled, setIsGpuEnabled] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [renderingState, setRenderingState] = useState('idle'); // 'idle', 'rendering', 'completed', 'error'
  const [gpuStatus, setGpuStatus] = useState('idle'); // 'idle', 'checking', 'connected', 'error'
  const [credits, setCredits] = useState(1250.0);
  const [gpuMarket, setGpuMarket] = useState('RTX 4090');
  const [apiKeyValid, setApiKeyValid] = useState(false);

  // Simulate rendering progress
  const [progress, setProgress] = useState(0);
  const [renderingElapsedTime, setRenderingElapsedTime] = useState(0);

  // Handle GPU toggle
  const handleGpuToggle = (enabled) => {
    if (!apiKeyValid && enabled) {
      setGpuStatus('error');
      return;
    }
    setIsGpuEnabled(enabled);
    setGpuStatus(enabled ? 'connected' : 'idle');
  };

  // Handle settings save
  const handleSettingsSave = (settings) => {
    console.log('Settings saved:', settings);
    setGpuMarket(settings.market);
    setApiKeyValid(true);
    setGpuStatus('connected');
    setIsGpuEnabled(true);
  };

  // Simulate rendering start
  const handleStartRendering = () => {
    setRenderingState('rendering');
    setProgress(0);
    setRenderingElapsedTime(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Simulate completion after a bit
          setTimeout(() => {
            setRenderingState('completed');
          }, 1500);
          return 100;
        }
        return prev + Math.random() * 20;
      });

      setRenderingElapsedTime((prev) => prev + 1);
    }, 500);
  };

  // Simulate error
  const handleSimulateError = () => {
    setRenderingState('error');
  };

  // Reset to idle
  const handleReset = () => {
    setRenderingState('idle');
    setProgress(0);
    setRenderingElapsedTime(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🎮 GPU Components Demo</h1>
        <p className="text-gray-600 text-lg">
          Complete workflow showing all 6 components in action
        </p>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Dashboard */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <GpuStatusDashboard
              credits={credits}
              apiKeyValid={apiKeyValid}
              lastUpdated={Date.now()}
              usage7Days={{
                totalJobs: 12,
                totalTimeSeconds: 2144,
                totalSpend: 4.56,
                successRate: 100,
                avgTimeSeconds: 178.67,
                avgSpend: 0.38,
                speedupVsCpu: 2.1,
              }}
              onRefresh={() => {
                console.log('Refreshing dashboard...');
              }}
            />
          </div>
        </div>

        {/* Right Content Area - Main Components */}
        <div className="lg:col-span-3 space-y-6">
          {/* Control Panel */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🎛️ Demo Control Panel</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={handleStartRendering}
                disabled={renderingState !== 'idle' || !isGpuEnabled}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors"
              >
                ▶️ Start Rendering
              </button>

              <button
                onClick={handleSimulateError}
                disabled={renderingState !== 'rendering'}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors"
              >
                ❌ Simulate Error
              </button>

              <button
                onClick={handleReset}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                🔄 Reset
              </button>

              <div className="text-right pt-2">
                <span className="text-sm font-bold text-gray-700">
                  State: <span className="text-purple-600">{renderingState}</span>
                </span>
              </div>
            </div>
          </div>

          {/* GPU Toggle */}
          <GpuToggle
            isGpuEnabled={isGpuEnabled}
            onToggle={handleGpuToggle}
            onSettingsClick={() => setSettingsModalOpen(true)}
            gpuStatus={gpuStatus}
            credits={credits}
            gpuMarket={gpuMarket}
            estimatedCost={0.45}
            estimatedDuration={3}
          />

          {/* Conditional Rendering based on State */}

          {/* IDLE State */}
          {renderingState === 'idle' && (
            <div className="bg-blue-50 rounded-xl border-2 border-blue-300 p-6">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  👋 Welcome to GPU Rendering Demo
                </p>
                <p className="text-gray-700 mb-4">
                  {!isGpuEnabled
                    ? 'Enable GPU mode to get started'
                    : 'Click "Start Rendering" in the control panel above'}
                </p>

                {!isGpuEnabled && (
                  <button
                    onClick={() => handleGpuToggle(true)}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg inline-block"
                  >
                    🎮 Enable GPU Mode
                  </button>
                )}
              </div>
            </div>
          )}

          {/* RENDERING State */}
          {renderingState === 'rendering' && (
            <GpuProgressMonitor
              jobStatus="running"
              jobId="dep_demo_12345xyz"
              gpuType={gpuMarket}
              marketName="mainnet-gpu-001"
              progress={{
                overall: Math.min(Math.round(progress), 99),
                stage: 'Video Encoding',
                elapsedSeconds: renderingElapsedTime,
                estimatedTotalSeconds: 188,
              }}
              stages={[
                { name: 'Asset Upload', status: 'completed', duration: 18 },
                { name: 'Scene Preparation', status: 'completed', duration: 12 },
                {
                  name: 'Video Encoding',
                  status: progress < 100 ? 'in-progress' : 'completed',
                  duration: renderingElapsedTime,
                },
                {
                  name: 'Post-Processing',
                  status: progress < 100 ? 'pending' : 'completed',
                  duration: null,
                },
              ]}
              resourceUsage={{
                gpuMemory: { used: 8.5, total: 24 },
                gpuCompute: 87,
                gpuTemp: 68,
                cpuUsage: 45,
                networkDown: 125,
                networkUp: 45,
                throughput: 150,
              }}
              costTracking={{
                elapsedMinutes: renderingElapsedTime / 60,
                costPerMin: 0.15,
                accrued: (renderingElapsedTime / 60) * 0.15,
                estimated: 0.46,
                budgetRemaining: 1.25 - (renderingElapsedTime / 60) * 0.15,
                budgetTotal: 1.25,
              }}
              onCancel={handleReset}
            />
          )}

          {/* COMPLETED State */}
          {renderingState === 'completed' && (
            <GpuCompletionCard
              videoTitle="Demo Rendered Video"
              thumbnailUrl="https://images.unsplash.com/photo-1611339555312-e607c25352d5?w=400&h=225&fit=crop"
              renderingMethod={`Nosana GPU (${gpuMarket})`}
              totalTime={{
                totalSeconds: renderingElapsedTime || 188,
                gpuTimeSeconds: renderingElapsedTime || 175,
              }}
              finalCost={(renderingElapsedTime / 60) * 0.15 || 0.44}
              costPerMinute={0.141}
              quality="Full HD 1080p (1920x1080)"
              fileSize={142.5}
              gpuStats={{
                estimatedCpuTimeSeconds: 340,
                timeSaved: 152,
                cpuCost: 'FREE',
                timeSavedPercent: 45,
              }}
              outputFiles={[
                { name: 'final-1.mp4', size: 142, format: 'Your rendered video' },
                { name: 'combined-1.mp4', size: 138, format: 'Raw composite' },
                { name: 'subtitle.srt', size: 0.045, format: 'Subtitle file' },
                { name: 'audio.mp3', size: 3.2, format: 'Audio track' },
              ]}
              accountUpdate={{
                creditsBefore: 1250.0,
                costDeducted: (renderingElapsedTime / 60) * 0.15 || 0.44,
                creditsAfter: 1250.0 - ((renderingElapsedTime / 60) * 0.15 || 0.44),
              }}
              onDownload={() => console.log('Download clicked')}
              onShare={() => console.log('Share clicked')}
              onRegenerate={handleReset}
              onViewDetails={() => console.log('View details clicked')}
            />
          )}

          {/* ERROR State */}
          {renderingState === 'error' && (
            <GpuErrorFallback
              errorType="timeout"
              reason="Job exceeded 10 minute limit"
              jobId="dep_demo_12345xyz"
              gpuType={gpuMarket}
              failedAt={new Date().toLocaleTimeString()}
              initialCharge={(renderingElapsedTime / 60) * 0.15 || 0.54}
              refundStatus="processing"
              fallbackStatus={{
                started: true,
                elapsedSeconds: 15,
                estimatedTotalSeconds: 270,
                progress: 8,
              }}
              onRetryGpu={handleReset}
              onUseCpu={handleReset}
              onContactSupport={() => console.log('Contact support clicked')}
            />
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <GpuSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onSave={handleSettingsSave}
      />

      {/* Footer - Documentation */}
      <div className="mt-12 p-6 bg-gray-100 rounded-xl border-2 border-gray-300">
        <h3 className="text-lg font-bold text-gray-900 mb-3">📚 Component Usage Guide</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-bold text-purple-700 mb-2">1️⃣ GpuToggle</h4>
            <p className="text-gray-700">
              Toggle between CPU/GPU rendering. Shows status, credits, and estimated cost.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-purple-700 mb-2">2️⃣ GpuSettingsModal</h4>
            <p className="text-gray-700">
              Modal for API key input, GPU market selection, and budget configuration.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-purple-700 mb-2">3️⃣ GpuProgressMonitor</h4>
            <p className="text-gray-700">
              Real-time progress tracking with logs, resource usage, and cost tracking.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-purple-700 mb-2">4️⃣ GpuStatusDashboard</h4>
            <p className="text-gray-700">
              Sidebar dashboard showing account status, pricing, and usage statistics.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-purple-700 mb-2">5️⃣ GpuCompletionCard</h4>
            <p className="text-gray-700">
              Success screen with video preview, download, and GPU vs CPU comparison.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-purple-700 mb-2">6️⃣ GpuErrorFallback</h4>
            <p className="text-gray-700">
              Error handling with auto-CPU fallback and credit refund tracking.
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-green-100 rounded-lg border-l-4 border-green-600">
          <p className="text-sm text-green-900 font-semibold">
            ✅ All 6 components are production-ready! Update VideoGeneratorHomepage to integrate
            them with your actual rendering workflow.
          </p>
        </div>
      </div>
    </div>
  );
}
