'use client';

import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Trash2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sonner } from '@/components/ui/sonner';
import { toast } from 'sonner';

export default function GpuSettingsModal({ isOpen, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('api-keys'); // 'api-keys', 'gpu-settings', 'advanced'
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState('RTX 4090');
  const [maxBudget, setMaxBudget] = useState('1.50');
  const [autoFallback, setAutoFallback] = useState(true);
  const [showResourceUsage, setShowResourceUsage] = useState(true);
  const [gpuAcceleration, setGpuAcceleration] = useState(true);
  const [validationError, setValidationError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Load saved settings from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      const savedApiKey = localStorage.getItem('nosana_api_key') || '';
      const savedMarket = localStorage.getItem('nosana_gpu_market') || 'RTX 4090';
      const savedBudget = localStorage.getItem('nosana_max_budget') || '1.50';
      const savedAutoFallback = localStorage.getItem('nosana_auto_fallback') !== 'false';
      const savedShowUsage = localStorage.getItem('nosana_show_resource_usage') !== 'false';
      const savedGpuAccel = localStorage.getItem('nosana_gpu_acceleration') !== 'false';

      setApiKey(savedApiKey);
      setSelectedMarket(savedMarket);
      setMaxBudget(savedBudget);
      setAutoFallback(savedAutoFallback);
      setShowResourceUsage(savedShowUsage);
      setGpuAcceleration(savedGpuAccel);
      setValidationError('');
    }
  }, [isOpen]);

  // Validate API Key format
  const validateApiKey = (key) => {
    if (!key || key.trim() === '') {
      return 'API key is required';
    }
    if (!key.startsWith('nos_')) {
      return 'API key must start with "nos_"';
    }
    if (key.length < 20) {
      return 'API key appears too short';
    }
    return '';
  };

  // Handle save
  const handleSaveSettings = async () => {
    // Validate API key if provided
    const error = validateApiKey(apiKey);
    if (error) {
      setValidationError(error);
      toast.error(error);
      return;
    }

    // Test connection
    setIsConnecting(true);
    try {
      // Simulate API connection test (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Save to localStorage
      localStorage.setItem('nosana_api_key', apiKey);
      localStorage.setItem('nosana_gpu_market', selectedMarket);
      localStorage.setItem('nosana_max_budget', maxBudget);
      localStorage.setItem('nosana_auto_fallback', autoFallback);
      localStorage.setItem('nosana_show_resource_usage', showResourceUsage);
      localStorage.setItem('nosana_gpu_acceleration', gpuAcceleration);

      toast.success('✅ GPU Settings saved successfully!');
      setValidationError('');
      setIsConnecting(false);

      // Call parent callback
      if (onSave) {
        onSave({
          apiKey,
          market: selectedMarket,
          maxBudget,
          autoFallback,
          showResourceUsage,
          gpuAcceleration,
        });
      }

      // Close modal after a short delay
      setTimeout(() => onClose(), 500);
    } catch (err) {
      setValidationError('Failed to connect to Nosana API');
      toast.error('Connection test failed');
      setIsConnecting(false);
    }
  };

  // Handle clear API key
  const handleClearApiKey = () => {
    setApiKey('');
    localStorage.removeItem('nosana_api_key');
    toast.info('API key cleared');
  };

  // Handle test connection
  const handleTestConnection = async () => {
    const error = validateApiKey(apiKey);
    if (error) {
      setValidationError(error);
      toast.error(error);
      return;
    }

    setIsConnecting(true);
    try {
      // Simulate connection test
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setValidationError('');
      toast.success('✅ Connected to Nosana GPU network!');
      setIsConnecting(false);
    } catch (err) {
      setValidationError('Connection failed - Check your API key');
      toast.error('Connection failed');
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Sonner />
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        {/* Modal Content */}
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-slate-900 to-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                <span className="text-xl">⚙️</span>
              </div>
              <h2 className="text-2xl font-bold text-white">GPU Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-gray-50 px-6">
            {['api-keys', 'gpu-settings', 'advanced'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'api-keys' && '🔑 API Keys'}
                {tab === 'gpu-settings' && '🎮 GPU Settings'}
                {tab === 'advanced' && '⚡ Advanced'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* API Keys Tab */}
            {activeTab === 'api-keys' && (
              <div className="space-y-6">
                {/* Nosana API Key */}
                <div>
                  <Label className="text-lg font-bold text-gray-900 mb-2 block">
                    🔑 Nosana API Key
                  </Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Get your API key from{' '}
                    <a
                      href="https://deploy.nosana.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      deploy.nosana.com
                    </a>
                  </p>

                  <div className="flex gap-2 mb-3">
                    <div className="flex-1 relative">
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          setValidationError('');
                        }}
                        placeholder="nos_xxxxxxxxxxxxxxxxxxxxxxxx"
                        className={`pr-12 ${
                          validationError ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showApiKey ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <button
                      onClick={handleClearApiKey}
                      className="px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-semibold transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear
                    </button>
                  </div>

                  {/* Validation Error */}
                  {validationError && (
                    <div className="p-3 bg-red-100 border border-red-300 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-red-800 font-medium">{validationError}</span>
                    </div>
                  )}

                  {/* Success Indicator */}
                  {apiKey && !validationError && (
                    <div className="p-3 bg-green-100 border border-green-300 rounded-lg flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-green-800 font-medium">API key format valid</span>
                    </div>
                  )}
                </div>

                {/* Test Connection Button */}
                <div>
                  <Button
                    onClick={handleTestConnection}
                    disabled={!apiKey || isConnecting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        🔗 Test Connection
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* GPU Settings Tab */}
            {activeTab === 'gpu-settings' && (
              <div className="space-y-6">
                {/* GPU Market Selection */}
                <div>
                  <Label className="text-lg font-bold text-gray-900 mb-4 block">
                    🎮 GPU Market Selection
                  </Label>
                  <div className="space-y-3">
                    {[
                      { name: 'RTX 4090', rate: 0.15, badge: 'Recommended' },
                      { name: 'A100', rate: 0.2, badge: 'High Perf' },
                      { name: 'L40', rate: 0.1, badge: 'Balanced' },
                      { name: 'T4', rate: 0.04, badge: 'Budget' },
                    ].map((market) => (
                      <label
                        key={market.name}
                        className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-purple-400 hover:bg-purple-50"
                        style={{
                          borderColor: selectedMarket === market.name ? '#9333ea' : '#e5e7eb',
                          backgroundColor: selectedMarket === market.name ? '#faf5ff' : '#ffffff',
                        }}
                      >
                        <input
                          type="radio"
                          name="gpu-market"
                          value={market.name}
                          checked={selectedMarket === market.name}
                          onChange={(e) => setSelectedMarket(e.target.value)}
                          className="w-4 h-4 text-purple-600 cursor-pointer"
                        />
                        <div className="ml-4 flex-1">
                          <div className="font-bold text-gray-900">{market.name}</div>
                          <div className="text-sm text-gray-500">${market.rate}/min</div>
                        </div>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                          {market.badge}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Max Budget */}
                <div>
                  <Label className="text-lg font-bold text-gray-900 mb-2 block">
                    💰 Max Budget Per Job
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900">$</span>
                    <Input
                      type="number"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      step="0.10"
                      min="0.10"
                      max="10.00"
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 whitespace-nowrap">/ job</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Spending limit: Won't render if estimated cost exceeds this amount
                  </p>
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-bold text-gray-900 mb-4 block">
                    ⚙️ Auto-Fallback Options
                  </Label>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={autoFallback}
                        onChange={(e) => setAutoFallback(e.target.checked)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="ml-3 text-sm text-gray-900 font-medium">
                        Fallback to CPU if GPU fails
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-bold text-gray-900 mb-4 block">
                    📊 Monitoring
                  </Label>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={showResourceUsage}
                        onChange={(e) => setShowResourceUsage(e.target.checked)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="ml-3 text-sm text-gray-900 font-medium">
                        Show GPU resource usage (memory, compute)
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-bold text-gray-900 mb-4 block">
                    🎯 Performance
                  </Label>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={gpuAcceleration}
                        onChange={(e) => setGpuAcceleration(e.target.checked)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="ml-3 text-sm text-gray-900 font-medium">
                        Use GPU-accelerated encoding (3-5x faster)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Action Buttons */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3 justify-end">
            <Button
              onClick={onClose}
              className="px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={!apiKey || validationError !== '' || isConnecting}
              className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold transition-colors flex items-center gap-2"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  ✅ Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
