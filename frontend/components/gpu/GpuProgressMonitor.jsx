'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Copy, Download } from 'lucide-react';

export default function GpuProgressMonitor({
  jobStatus = 'running', // 'running', 'completed', 'failed'
  jobId = 'dep_abc123xyz',
  gpuType = 'RTX 4090',
  marketName = 'mainnet-gpu-001',
  progress = {
    overall: 45,
    stage: 'Video Encoding',
    elapsedSeconds: 83,
    estimatedTotalSeconds: 188,
  },
  stages = [
    { name: 'Asset Upload', status: 'completed', duration: 18 },
    { name: 'Scene Preparation', status: 'completed', duration: 12 },
    { name: 'Video Encoding', status: 'in-progress', duration: 53 },
    { name: 'Post-Processing', status: 'pending', duration: null },
  ],
  resourceUsage = {
    gpuMemory: { used: 8.5, total: 24 },
    gpuCompute: 87,
    gpuTemp: 68,
    cpuUsage: 45,
    networkDown: 125,
    networkUp: 45,
    throughput: 150,
  },
  costTracking = {
    elapsedMinutes: 1.38,
    costPerMin: 0.15,
    accrued: 0.21,
    estimated: 0.46,
    budgetRemaining: 0.79,
    budgetTotal: 1.25,
  },
  logs = [
    '[12:45:32] Starting render job',
    '[12:45:35] Loading scene assets',
    '[12:45:43] Scene ready, initializing GPU',
    '[12:45:48] GPU: NVIDIA RTX 4090 detected',
    '[12:45:50] GPU Memory Allocated: 8.5GB',
    '[12:46:05] Starting frame 1 (18 FPS)',
    '[12:46:23] Frame 1 complete, starting f2',
    '[12:46:41] Frame 2 complete, starting f3',
    '[12:46:59] Frame 3 complete, starting f4',
    '[12:47:12] Frames complete, encoding video',
  ],
  onCancel = () => {},
}) {
  const [expandedStages, setExpandedStages] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState(true);
  const [visibleLogs, setVisibleLogs] = useState(5);
  const [copiedLogIndex, setCopiedLogIndex] = useState(null);

  // Calculate ETA
  const eta = new Date(Date.now() + (progress.estimatedTotalSeconds - progress.elapsedSeconds) * 1000);
  const etaTime = eta.toLocaleTimeString();

  // Get status icon and color
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in-progress':
        return '🟡';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedLogIndex(index);
    setTimeout(() => setCopiedLogIndex(null), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl border-2 border-slate-700 p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-2">🎥 GPU Rendering Progress</h2>
        <p className="text-gray-300">
          Real-time monitoring • Job: <code className="text-purple-300">{jobId}</code>
        </p>
      </div>

      {/* Job Status */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          📊 Job Status
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-l-4 border-green-500">
            <div className="text-xs text-gray-600 font-semibold">State</div>
            <div className="text-lg font-bold text-green-700">🟢 RUNNING</div>
          </div>

          <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-l-4 border-purple-500">
            <div className="text-xs text-gray-600 font-semibold">GPU Type</div>
            <div className="text-sm font-bold text-purple-700">{gpuType}</div>
          </div>

          <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-500">
            <div className="text-xs text-gray-600 font-semibold">Connection</div>
            <div className="text-sm font-bold text-blue-700">✅ Connected</div>
          </div>

          <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border-l-4 border-indigo-500">
            <div className="text-xs text-gray-600 font-semibold">Job ID</div>
            <div className="text-xs font-bold text-indigo-700 truncate">{jobId}</div>
          </div>

          <div className="p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border-l-4 border-amber-500">
            <div className="text-xs text-gray-600 font-semibold">Market</div>
            <div className="text-sm font-bold text-amber-700">{marketName}</div>
          </div>
        </div>
      </div>

      {/* Timing Breakdown */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">⏱️ Timing Breakdown</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-600 font-semibold mb-1">Total Elapsed</div>
            <div className="text-2xl font-bold text-gray-900">{formatTime(progress.elapsedSeconds)}</div>
          </div>

          <div>
            <div className="text-xs text-gray-600 font-semibold mb-1">Est. Remaining</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(progress.estimatedTotalSeconds - progress.elapsedSeconds)}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-600 font-semibold mb-1">Estimated Total</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatTime(progress.estimatedTotalSeconds)}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-600 font-semibold mb-1">ETA</div>
            <div className="text-2xl font-bold text-purple-600">{etaTime}</div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full" />

      {/* Progress by Stage */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-md">
        <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setExpandedStages(!expandedStages)}>
          <h3 className="text-lg font-bold text-gray-900">📈 Progress by Stage</h3>
          {expandedStages ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>

        {expandedStages && (
          <div className="space-y-4">
            {stages.map((stage, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getStatusIcon(stage.status)}</span>
                    <span className="font-bold text-gray-900">{stage.name}</span>
                    {stage.status === 'completed' && (
                      <span className="text-xs text-gray-600">(completed)</span>
                    )}
                  </div>
                  {stage.duration && (
                    <span className="text-sm text-gray-600 font-semibold">
                      {stage.duration} {stage.status === 'completed' ? 'seconds' : 'seconds elapsed'}
                    </span>
                  )}
                </div>

                {stage.status === 'in-progress' && (
                  <>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                        style={{ width: `${progress.overall}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-1 text-right">{progress.overall}%</div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full" />

      {/* Resource Usage */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💾 Resource Usage</h3>

        <div className="space-y-4">
          {/* GPU Memory */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">GPU Memory</span>
              <span className="text-sm font-bold text-gray-900">
                {resourceUsage.gpuMemory.used} GB / {resourceUsage.gpuMemory.total} GB (
                {Math.round((resourceUsage.gpuMemory.used / resourceUsage.gpuMemory.total) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full"
                style={{
                  width: `${(resourceUsage.gpuMemory.used / resourceUsage.gpuMemory.total) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* GPU Compute */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">GPU Compute</span>
              <span className="text-sm font-bold text-gray-900">{resourceUsage.gpuCompute}% utilization</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-full"
                style={{ width: `${resourceUsage.gpuCompute}%` }}
              />
            </div>
          </div>

          {/* Grid for other stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 font-semibold">GPU Temp</div>
              <div className="text-lg font-bold text-gray-900">{resourceUsage.gpuTemp}°C</div>
              <div className="text-xs text-green-600">(normal)</div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 font-semibold">CPU Usage</div>
              <div className="text-lg font-bold text-gray-900">{resourceUsage.cpuUsage}%</div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 font-semibold">Throughput</div>
              <div className="text-lg font-bold text-gray-900">{resourceUsage.throughput} MB/s</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Tracking */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300 p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Cost Tracking</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-600 font-semibold">Elapsed Time</div>
            <div className="text-lg font-bold text-gray-900">
              {costTracking.elapsedMinutes.toFixed(2)}m @ ${costTracking.costPerMin}/min
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-600 font-semibold">Cost Accrued</div>
            <div className="text-2xl font-bold text-orange-600">${costTracking.accrued.toFixed(2)}</div>
          </div>

          <div>
            <div className="text-xs text-gray-600 font-semibold">Est. Final Cost</div>
            <div className="text-2xl font-bold text-gray-900">${costTracking.estimated.toFixed(2)}</div>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="pt-4 border-t border-amber-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Budget Remaining</span>
            <span className="text-sm font-bold text-gray-900">
              ${costTracking.budgetRemaining.toFixed(2)} / ${costTracking.budgetTotal.toFixed(2)}
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-500"
              style={{
                width: `${(costTracking.budgetRemaining / costTracking.budgetTotal) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* GPU Job Logs */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-md">
        <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setExpandedLogs(!expandedLogs)}>
          <h3 className="text-lg font-bold text-gray-900">📋 GPU Job Logs</h3>
          {expandedLogs ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>

        {expandedLogs && (
          <>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-gray-300 max-h-48 overflow-y-auto space-y-1 mb-4">
              {logs.slice(0, visibleLogs).map((log, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between hover:bg-slate-800 px-2 py-1 rounded transition-colors group"
                >
                  <span className="flex-1 break-all">{log}</span>
                  <button
                    onClick={() => copyToClipboard(log, idx)}
                    className="ml-2 text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedLogIndex === idx ? '✅' : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>

            {visibleLogs < logs.length && (
              <button
                onClick={() => setVisibleLogs(Math.min(visibleLogs + 5, logs.length))}
                className="text-sm text-purple-600 hover:text-purple-700 font-semibold mb-4"
              >
                [Show More Logs ↓]
              </button>
            )}

            <div className="flex gap-2 flex-wrap">
              <button className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                [View All]
              </button>
              <button className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                [Download]
              </button>
              <button className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                [Pause Logs]
              </button>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 px-6 py-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-bold transition-colors">
          ⏸️ Pause Job
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold transition-colors"
        >
          ❌ Cancel GPU Job
        </button>
        <button className="flex-1 px-6 py-3 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-bold transition-colors">
          ⚙️ Settings
        </button>
        <button className="flex-1 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors">
          ❓ Help
        </button>
      </div>
    </div>
  );
}
