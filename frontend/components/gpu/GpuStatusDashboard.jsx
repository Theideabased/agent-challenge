'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';

export default function GpuStatusDashboard({
  credits = 1250.0,
  apiKeyValid = true,
  lastUpdated = Date.now(),
  usage7Days = {
    totalJobs: 12,
    totalTimeSeconds: 2144,
    totalSpend: 4.56,
    successRate: 100,
    avgTimeSeconds: 178.67,
    avgSpend: 0.38,
    speedupVsCpu: 2.1,
  },
  pricingGuide = [
    { name: 'RTX 4090', rate: 0.15, badge: '⚡', description: 'Best all-around' },
    { name: 'A100', rate: 0.2, badge: '🔥', description: 'Maximum performance' },
    { name: 'L40', rate: 0.1, badge: '💵', description: 'Good value' },
    { name: 'T4', rate: 0.04, badge: '🎯', description: 'Very affordable' },
  ],
  networkStatus = {
    apiOnline: true,
    gpuPoolHealth: 'healthy',
    queueTime: 15,
    currentLoad: 67,
  },
  onRefresh = () => {},
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatTimeAgo = (timestamp) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="w-full max-w-sm space-y-4 bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl border-2 border-slate-700 p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🎮 GPU Dashboard</span>
        </h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Account Status */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          💳 Account Status
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-200">API Key:</span>
            <span className={`font-bold ${apiKeyValid ? 'text-green-300' : 'text-red-300'}`}>
              {apiKeyValid ? '✅ Valid' : '❌ Invalid'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-200">Auth Status:</span>
            <span className="text-green-300 font-bold">Connected</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-200">Credits:</span>
            <span className="text-yellow-300 font-bold text-lg">{credits.toFixed(2)} NOS</span>
          </div>

          <div className="flex items-center justify-between text-sm pt-2 border-t border-purple-400">
            <span className="text-gray-200">Last Updated:</span>
            <span className="text-purple-200 text-xs">{formatTimeAgo(lastUpdated)}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />

      {/* GPU Pricing Guide */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          🎯 GPU Pricing Guide
        </h3>

        <div className="space-y-2">
          {pricingGuide.map((gpu, idx) => (
            <div
              key={idx}
              className="bg-slate-700 hover:bg-slate-600 rounded-lg p-3 transition-colors cursor-pointer border border-slate-600 hover:border-purple-500"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{gpu.badge}</span>
                  <div>
                    <div className="text-sm font-bold text-white">{gpu.name}</div>
                    <div className="text-xs text-gray-400">{gpu.description}</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-yellow-300">${gpu.rate}/min</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />

      {/* Usage Statistics */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3">📊 Usage (Last 7 Days)</h3>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
            <div className="text-xs text-gray-400 font-semibold">Total Jobs</div>
            <div className="text-xl font-bold text-white">{usage7Days.totalJobs}</div>
          </div>

          <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
            <div className="text-xs text-gray-400 font-semibold">Total Time</div>
            <div className="text-lg font-bold text-white">{formatTime(usage7Days.totalTimeSeconds)}</div>
          </div>

          <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
            <div className="text-xs text-gray-400 font-semibold">Total Spend</div>
            <div className="text-xl font-bold text-yellow-300">${usage7Days.totalSpend}</div>
          </div>

          <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
            <div className="text-xs text-gray-400 font-semibold">Success Rate</div>
            <div className="text-xl font-bold text-green-300">{usage7Days.successRate}% ✅</div>
          </div>

          <div className="bg-slate-700 rounded-lg p-3 border border-slate-600 col-span-2">
            <div className="text-xs text-gray-400 font-semibold mb-1">Avg Per Job</div>
            <div className="text-sm font-bold text-white">
              {formatTime(usage7Days.avgTimeSeconds)}, ${usage7Days.avgSpend}
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-3 border border-slate-600 col-span-2">
            <div className="text-xs text-gray-400 font-semibold mb-1">Speedup vs CPU</div>
            <div className="text-lg font-bold text-purple-300">
              ⚡ {usage7Days.speedupVsCpu}x faster
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />

      {/* Network Status */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          🌐 Network Status
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-slate-700 rounded-lg">
            <span className="text-sm text-gray-300">API:</span>
            <span className={`text-sm font-bold flex items-center gap-1 ${networkStatus.apiOnline ? 'text-green-300' : 'text-red-300'}`}>
              <span className="w-2 h-2 rounded-full bg-current" />
              {networkStatus.apiOnline ? 'Online' : 'Offline'} {networkStatus.apiOnline && '(0ms ping)'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-700 rounded-lg">
            <span className="text-sm text-gray-300">GPU Pool:</span>
            <span className={`text-sm font-bold flex items-center gap-1 ${networkStatus.gpuPoolHealth === 'healthy' ? 'text-green-300' : 'text-yellow-300'}`}>
              <span className="w-2 h-2 rounded-full bg-current" />
              {networkStatus.gpuPoolHealth === 'healthy' ? '🟢 Healthy' : '🟡 ' + networkStatus.gpuPoolHealth}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-700 rounded-lg">
            <span className="text-sm text-gray-300">Queue Time:</span>
            <span className="text-sm font-bold text-blue-300">~{networkStatus.queueTime}s</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-700 rounded-lg">
            <span className="text-sm text-gray-300">Current Load:</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-red-500"
                  style={{ width: `${networkStatus.currentLoad}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-300 min-w-max">{networkStatus.currentLoad}%</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-400 mt-2">
          Next Update: {Math.floor(Math.random() * 30) + 20}s
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />

      {/* Quick Links */}
      <div className="flex flex-wrap gap-2">
        <a
          href="https://deploy.nosana.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[120px] px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          Manage Account
        </a>
        <a
          href="https://learn.nosana.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[120px] px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          Docs
        </a>
        <button className="flex-1 min-w-[120px] px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors">
          Support
        </button>
      </div>
    </div>
  );
}
