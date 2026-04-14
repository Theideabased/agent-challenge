'use client';

import React, { useState } from 'react';
import { Download, Share2, Copy, MoreVertical } from 'lucide-react';

export default function GpuCompletionCard({
  videoTitle = 'My Awesome Video',
  thumbnailUrl = 'https://via.placeholder.com/400x225?text=Video+Thumbnail',
  renderingMethod = 'Nosana GPU (RTX 4090)',
  totalTime = {
    totalSeconds: 188,
    gpuTimeSeconds: 175,
  },
  finalCost = 0.44,
  costPerMinute = 0.141,
  quality = 'Full HD 1080p (1920x1080)',
  fileSize = 142.5, // MB
  gpuStats = {
    estimatedCpuTimeSeconds: 340,
    timeSaved: 152,
    cpuCost: 'FREE',
    timeSavedPercent: 45,
  },
  outputFiles = [
    { name: 'final-1.mp4', size: 142, format: 'Your rendered video' },
    { name: 'combined-1.mp4', size: 138, format: 'Raw composite' },
    { name: 'subtitle.srt', size: 0.045, format: 'Subtitle file' },
    { name: 'audio.mp3', size: 3.2, format: 'Audio track' },
  ],
  accountUpdate = {
    creditsBefore: 1250.0,
    costDeducted: 0.44,
    creditsAfter: 1249.56,
  },
  onDownload = () => {},
  onShare = () => {},
  onRegenerate = () => {},
  onViewDetails = () => {},
}) {
  const [copiedFile, setCopiedFile] = useState(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleCopyFileName = (fileName) => {
    navigator.clipboard.writeText(fileName);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Success Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl border-2 border-green-400 p-6 shadow-lg text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">✅</span>
          <div>
            <h2 className="text-2xl font-bold">VIDEO GENERATED ON GPU</h2>
            <p className="text-green-100">🎉 Success! Your video is ready</p>
          </div>
        </div>
      </div>

      {/* Video Preview */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-md">
        <div className="mb-4">
          <div className="relative bg-black rounded-lg overflow-hidden group cursor-pointer">
            <img
              src={thumbnailUrl}
              alt="Video Thumbnail"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
              <button className="text-4xl opacity-0 group-hover:opacity-100 transition-opacity">
                ▶
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 h-1 bg-gray-300 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-purple-600" />
          </div>
          <button className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold">
            Play ▶
          </button>
        </div>
      </div>

      {/* Rendering Summary */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Rendering Summary</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-l-4 border-purple-500">
            <div className="text-xs text-gray-600 font-semibold mb-1">Rendering Method</div>
            <div className="text-sm font-bold text-purple-700">{renderingMethod}</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-500">
            <div className="text-xs text-gray-600 font-semibold mb-1">Total Time</div>
            <div className="text-sm font-bold text-blue-700">{formatTime(totalTime.totalSeconds)}</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-l-4 border-green-500">
            <div className="text-xs text-gray-600 font-semibold mb-1">GPU Compute Time</div>
            <div className="text-sm font-bold text-green-700">{formatTime(totalTime.gpuTimeSeconds)}</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border-l-4 border-amber-500">
            <div className="text-xs text-gray-600 font-semibold mb-1">Final Cost</div>
            <div className="text-lg font-bold text-amber-700">${finalCost}</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border-l-4 border-indigo-500">
            <div className="text-xs text-gray-600 font-semibold mb-1">Cost per Minute</div>
            <div className="text-sm font-bold text-indigo-700">${costPerMinute}</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg border-l-4 border-pink-500">
            <div className="text-xs text-gray-600 font-semibold mb-1">Quality</div>
            <div className="text-sm font-bold text-pink-700">{quality}</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg border-l-4 border-cyan-500 col-span-2 md:col-span-1">
            <div className="text-xs text-gray-600 font-semibold mb-1">File Size</div>
            <div className="text-sm font-bold text-cyan-700">{fileSize.toFixed(1)} MB</div>
          </div>
        </div>
      </div>

      {/* GPU vs CPU Comparison */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border-2 border-purple-300 p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ GPU vs CPU Comparison</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-white rounded-lg border-2 border-purple-200">
            <div className="text-sm text-gray-600 font-semibold mb-2">GPU Time (Used)</div>
            <div className="text-2xl font-bold text-purple-600">{formatTime(totalTime.gpuTimeSeconds)}</div>
            <div className="text-xs text-gray-500 mt-1">✅ Actual rendering time</div>
          </div>

          <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
            <div className="text-sm text-gray-600 font-semibold mb-2">Est. CPU Time</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatTime(gpuStats.estimatedCpuTimeSeconds)}
            </div>
            <div className="text-xs text-gray-500 mt-1">📊 Estimated</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border-2 border-green-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-sm text-gray-600 font-semibold mb-1">Time Saved</div>
              <div className="text-2xl font-bold text-green-600">
                {formatTime(gpuStats.timeSaved)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{gpuStats.timeSavedPercent}%</div>
              <div className="text-xs text-gray-600">⏱️ faster</div>
            </div>
          </div>

          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-gradient-to-r from-green-500 to-green-600" />
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <span className="text-sm text-gray-700">Cost Comparison:</span>
            <div className="flex gap-4">
              <span className="text-sm font-bold">GPU: <span className="text-purple-600">${finalCost}</span></span>
              <span className="text-sm font-bold">CPU: <span className="text-gray-600">{gpuStats.cpuCost}</span></span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-100 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm text-blue-900 font-semibold">
            💡 Recommendation: ⚡ GPU was {gpuStats.timeSavedPercent}% faster! Perfect choice for this video.
          </p>
        </div>
      </div>

      {/* Output Files */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📁 Output Files</h3>

        <div className="space-y-3">
          {outputFiles.map((file, idx) => (
            <div
              key={idx}
              className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📄</span>
                    <div>
                      <div className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                        {file.name}
                      </div>
                      <div className="text-xs text-gray-600">{file.format}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <div className="text-sm font-bold text-gray-700">{file.size.toFixed(file.size > 1 ? 1 : 3)} {file.size > 1 ? 'MB' : 'MB'}</div>
                  </div>

                  <button
                    onClick={() => handleCopyFileName(file.name)}
                    className="p-2 rounded-lg bg-gray-200 group-hover:bg-purple-200 text-gray-700 group-hover:text-purple-700 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    {copiedFile === file.name ? '✅' : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={onDownload}
                    className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-700">
            💾 All files are stored in <code className="text-gray-900 font-mono">/tasks/task_abc123/</code>
          </p>
        </div>
      </div>

      {/* Storage & Sharing */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💾 Storage & Sharing</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="text-xs text-gray-600 font-semibold">Local Storage</div>
            <div className="text-sm font-bold text-green-700 mt-1">✅ Saved</div>
          </div>

          <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 cursor-pointer hover:shadow-md transition-all">
            <div className="text-xs text-gray-600 font-semibold">Cloud Backup</div>
            <div className="text-sm font-bold text-blue-700 mt-1">Available</div>
          </div>

          <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 cursor-pointer hover:shadow-md transition-all">
            <div className="text-xs text-gray-600 font-semibold">Public Link</div>
            <div className="text-sm font-bold text-purple-700 mt-1">[Get Link] 🔗</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
            [Copy URL]
          </button>
          <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4" />
            [Send Email]
          </button>
        </div>
      </div>

      {/* Account Update */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300 p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💳 Account Update</h3>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
            <div className="text-xs text-gray-600 font-semibold mb-1">Before</div>
            <div className="text-lg font-bold text-gray-900">{accountUpdate.creditsBefore.toFixed(2)} NOS</div>
          </div>

          <div className="flex items-center justify-center text-2xl font-bold text-amber-600">−</div>

          <div className="text-center p-3 bg-red-100 rounded-lg border border-red-300">
            <div className="text-xs text-gray-600 font-semibold mb-1">Deducted</div>
            <div className="text-lg font-bold text-red-700">{accountUpdate.costDeducted.toFixed(2)} NOS</div>
          </div>
        </div>

        <div className="text-center p-4 bg-green-100 rounded-lg border-2 border-green-300">
          <div className="text-xs text-gray-600 font-semibold mb-1">After</div>
          <div className="text-2xl font-bold text-green-700">{accountUpdate.creditsAfter.toFixed(2)} NOS</div>
          <div className="text-xs text-green-600 mt-1">✅ Sufficient credit</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onDownload}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download Video
        </button>

        <button
          onClick={onShare}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          Share
        </button>

        <button
          onClick={onRegenerate}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors"
        >
          🔄 Regenerate
        </button>

        <button
          onClick={onViewDetails}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
        >
          View More Details
        </button>
      </div>

      {/* Back Home Link */}
      <div className="text-center">
        <button className="text-purple-600 hover:text-purple-700 font-semibold underline">
          ← Back Home
        </button>
      </div>
    </div>
  );
}
