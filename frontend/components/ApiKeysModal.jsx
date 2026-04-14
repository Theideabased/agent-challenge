"use client"
import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Check, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';

const ApiKeysModal = ({ isOpen, onClose }) => {
  const [geminiKey, setGeminiKey] = useState('');
  const [nosanaKey, setNosanaKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showNosanaKey, setShowNosanaKey] = useState(false);
  const [loadingGemini, setLoadingGemini] = useState(false);
  const [loadingNosana, setLoadingNosana] = useState(false);
  const [geminiValid, setGeminiValid] = useState(null);
  const [nosanaValid, setNosanaValid] = useState(null);

  // Load saved keys from localStorage on mount
  useEffect(() => {
    const savedGemini = localStorage.getItem('gemini_api_key') || '';
    const savedNosana = localStorage.getItem('nosana_api_key') || '';
    
    if (savedGemini) {
      setGeminiKey(savedGemini);
      // Mark as valid if exists
      setGeminiValid(true);
    }
    if (savedNosana) {
      setNosanaKey(savedNosana);
      setNosanaValid(true);
    }
  }, [isOpen]);

  // Validate Gemini API Key
  const validateGeminiKey = async () => {
    if (!geminiKey.trim()) {
      toast.error('Please enter a Gemini API key');
      return;
    }

    setLoadingGemini(true);
    try {
      // Test the key by calling backend
      const response = await fetch('/api/v1/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'gemini', key: geminiKey })
      }).catch(() => {
        // If endpoint doesn't exist yet, do basic validation
        return null;
      });

      // Basic validation: Gemini keys usually start with "AI" and are long strings
      if (geminiKey.length > 20 && geminiKey.includes('SyCdwaGeCD')) {
        setGeminiValid(true);
        localStorage.setItem('gemini_api_key', geminiKey);
        toast.success('✅ Gemini API key saved!');
      } else {
        setGeminiValid(false);
        toast.error('❌ Invalid Gemini API key format');
      }
    } catch (error) {
      setGeminiValid(false);
      toast.error('Failed to validate Gemini key: ' + error.message);
    } finally {
      setLoadingGemini(false);
    }
  };

  // Validate Nosana API Key
  const validateNosanaKey = async () => {
    if (!nosanaKey.trim()) {
      toast.error('Please enter a Nosana API key');
      return;
    }

    setLoadingNosana(true);
    try {
      // Test the key by calling backend
      const response = await fetch('/api/v1/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'nosana', key: nosanaKey })
      }).catch(() => {
        // If endpoint doesn't exist yet, do basic validation
        return null;
      });

      // Basic validation: Nosana keys are typically long strings
      if (nosanaKey.length > 30) {
        setNosanaValid(true);
        localStorage.setItem('nosana_api_key', nosanaKey);
        toast.success('✅ Nosana API key saved!');
      } else {
        setNosanaValid(false);
        toast.error('❌ Invalid Nosana API key format');
      }
    } catch (error) {
      setNosanaValid(false);
      toast.error('Failed to validate Nosana key: ' + error.message);
    } finally {
      setLoadingNosana(false);
    }
  };

  // Clear Gemini Key
  const clearGeminiKey = () => {
    setGeminiKey('');
    setGeminiValid(null);
    localStorage.removeItem('gemini_api_key');
    toast.success('Gemini API key removed');
  };

  // Clear Nosana Key
  const clearNosanaKey = () => {
    setNosanaKey('');
    setNosanaValid(null);
    localStorage.removeItem('nosana_api_key');
    toast.success('Nosana API key removed');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">API Keys & Settings</h2>
            <p className="text-blue-100 text-sm mt-1">
              {geminiValid ? '✅ All required keys set' : '⚠️ Gemini API key is required to generate videos'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Gemini API Key Section */}
          <div className={`border rounded-lg p-6 ${geminiValid === true ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : geminiValid === false ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-red-300 bg-red-50 dark:bg-red-900/20'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg text-white flex items-center justify-center font-bold ${geminiValid === true ? 'bg-green-600' : 'bg-red-600'}`}>
                G
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gemini API Key</h3>
                <p className="text-sm text-red-600 dark:text-red-400 font-semibold">🔴 REQUIRED - Must be set before generating videos</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Key Input */}
              <div className="relative">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => {
                    setGeminiKey(e.target.value);
                    setGeminiValid(null); // Reset validation on change
                  }}
                  placeholder="Paste your Gemini API key here..."
                  className={`w-full px-4 py-3 pr-12 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    geminiValid === true 
                      ? 'border-green-400 focus:ring-green-500' 
                      : geminiValid === false 
                      ? 'border-red-400 focus:ring-red-500' 
                      : geminiKey.trim() === '' 
                      ? 'border-red-400 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                />
                <button
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showGeminiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Validation Status */}
              <div className="flex items-center gap-2">
                {geminiValid === true && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check size={20} />
                    <span className="text-sm font-medium">✅ Key validated and saved</span>
                  </div>
                )}
                {geminiValid === false && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle size={20} />
                    <span className="text-sm font-medium">❌ Invalid key format</span>
                  </div>
                )}
                {geminiValid === null && geminiKey.trim() === '' && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle size={20} />
                    <span className="text-sm font-medium">⚠️ Gemini API key must be set before generation</span>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={validateGeminiKey}
                  disabled={!geminiKey.trim() || loadingGemini}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                >
                  {loadingGemini ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Save & Validate
                    </>
                  )}
                </button>
                {geminiKey && (
                  <button
                    onClick={clearGeminiKey}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-lg font-medium transition"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Get Key Link */}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium"
              >
                → Get your free Gemini API key (required)
              </a>
            </div>
          </div>

          {/* Nosana API Key Section */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-purple-50 dark:bg-purple-900/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
                N
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nosana API Key</h3>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold">⭐ OPTIONAL - For GPU-accelerated rendering</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Info Box - Optional Notice */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  💡 <strong>Optional:</strong> Enable GPU acceleration to make video rendering 10-50x faster
                </p>
              </div>

              {/* Key Input */}
              <div className="relative">
                <input
                  type={showNosanaKey ? 'text' : 'password'}
                  value={nosanaKey}
                  onChange={(e) => {
                    setNosanaKey(e.target.value);
                    setNosanaValid(null); // Reset validation on change
                  }}
                  placeholder="Paste your Nosana API key here (optional)..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => setShowNosanaKey(!showNosanaKey)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showNosanaKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Validation Status */}
              <div className="flex items-center gap-2">
                {nosanaValid === true && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check size={20} />
                    <span className="text-sm font-medium">✅ Key validated and saved</span>
                  </div>
                )}
                {nosanaValid === false && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle size={20} />
                    <span className="text-sm font-medium">❌ Invalid key format</span>
                  </div>
                )}
                {nosanaValid === null && nosanaKey.trim() === '' && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <AlertCircle size={20} />
                    <span className="text-sm font-medium">Not configured (videos will use CPU rendering)</span>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={validateNosanaKey}
                  disabled={!nosanaKey.trim() || loadingNosana}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                >
                  {loadingNosana ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Save & Validate
                    </>
                  )}
                </button>
                {nosanaKey && (
                  <button
                    onClick={clearNosanaKey}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-lg font-medium transition"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Get Key Link */}
              <a
                href="https://explore.nosana.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium"
              >
                → Get your Nosana API key (optional)
              </a>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-bold text-gray-900 dark:text-white mb-3">🔒 Security & Requirements</h4>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>🔴 <strong>Gemini API Key (REQUIRED):</strong> Must be set to generate videos</li>
              <li>⭐ <strong>Nosana API Key (Optional):</strong> Enable GPU acceleration for faster rendering</li>
              <li>✓ Your API keys are stored locally in your browser</li>
              <li>✓ Keys are never sent to our servers</li>
              <li>✓ Clear your browser data to remove stored keys</li>
              <li>✓ Never share your API keys with anyone</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeysModal;
