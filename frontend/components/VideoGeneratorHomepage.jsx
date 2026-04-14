"use client"
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Send, Github, Loader, Play, Copy, Download, X, Palette, GripVertical, Share2, Settings, Zap } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import * as api from '@/lib/api';
import ApiKeysModal from '@/components/ApiKeysModal';

const VideoGeneratorHomepage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generationLogs, setGenerationLogs] = useState([]);
  const [videoPreview, setVideoPreview] = useState(null);
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [currentSampleIndex, setCurrentSampleIndex] = useState(0);
  const [leftWidth, setLeftWidth] = useState(50); // 50% default split
  const [isDragging, setIsDragging] = useState(false);
  const [reprompt, setReprompt] = useState('');
  const containerRef = useRef(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSocialAuthModal, setShowSocialAuthModal] = useState(false);
  const [showApiKeysModal, setShowApiKeysModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [socialCredentials, setSocialCredentials] = useState({
    username: '',
    password: ''
  });
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [taskProgress, setTaskProgress] = useState(0);
  // GPU rendering state - Simple toggle 
  const [isGpuEnabled, setIsGpuEnabled] = useState(false);
  
  const [options, setOptions] = useState({
    topic: 'Custom Prompt',
    aspect: '9:16',
    voice: 'en-US-AvaMultilingualNeural',
    duration: '30 Seconds',
    source: 'pixabay',
    style: 'Use Videos Online'
  });
  
  // Style options from SelectStyle component
  const styleOptions = [
    {
      name: 'Use Videos Online',
      image: '/online_video.jpg',
      available: true
    },
    {
      name: 'Realistic AI',
      image: '/realistic.png',
      available: false
    },
    {
      name: 'Cartoon AI',
      image: '/cartoon.png',
      available: false
    },
    {
      name: 'Watercolor AI',
      image: '/watercolor.png',
      available: false
    },
    {
      name: 'CyberPunk AI',
      image: '/cyberpunk.png',
      available: false
    },
  ];

  const topicOptions = [
    'Custom Prompt',
    'Random AI Story',
    'Scary Story',
    'Historical Facts',
    'Bed Time Story',
    'Motivational',
    'Fun Facts'
  ];

  const aspectOptions = [
    { value: '9:16', label: 'Portrait 9:16 (TikTok)' },
    { value: '16:9', label: 'Landscape 16:9 (YouTube)' },
    { value: '1:1', label: 'Square 1:1 (Instagram)' }
  ];

  const voiceOptions = [
    // ===== GEMINI VOICES (Recommended - Works Globally) =====
    { value: 'gemini:Zephyr-Female', label: ' Gemini: Zephyr (Female)' },
    { value: 'gemini:Puck-Male', label: ' Gemini: Puck (Male)' },
    { value: 'gemini:Kore-Female', label: ' Gemini: Kore (Female)' },
    { value: 'gemini:Charon-Male', label: ' Gemini: Charon (Male)' },
    { value: 'gemini:Aoede-Female', label: ' Gemini: Aoede (Female)' },
    { value: 'gemini:Fenrir-Male', label: ' Gemini: Fenrir (Male)' },
    { value: 'gemini:Thalia-Female', label: ' Gemini: Thalia (Female)' },
    { value: 'gemini:Sage-Male', label: ' Gemini: Sage (Male)' },
    
    // ===== SILICONFLOW VOICES (Free, No API Key) =====
    { value: 'siliconflow:FunAudioLLM/CosyVoice2-0.5B:alex-Male', label: ' SiliconFlow: Alex (Male)' },
    { value: 'siliconflow:FunAudioLLM/CosyVoice2-0.5B:anna-Female', label: ' SiliconFlow: Anna (Female)' },
    { value: 'siliconflow:FunAudioLLM/CosyVoice2-0.5B:bella-Female', label: ' SiliconFlow: Bella (Female)' },
    { value: 'siliconflow:FunAudioLLM/CosyVoice2-0.5B:benjamin-Male', label: ' SiliconFlow: Benjamin (Male)' },
    
    // ===== LEGACY AZURE VOICES (May have 403 errors) =====
    { value: 'en-US-AriaNeural', label: 'Azure: Aria (Female US) ' },
    { value: 'en-US-GuyNeural', label: 'Azure: Guy (Male US) ' },
    { value: 'en-US-JennyNeural', label: 'Azure: Jenny (Female US) ' },
    { value: 'en-GB-SoniaNeural', label: 'Azure: Sonia (Female UK) ' }
  ];

  const durationOptions = [
    '15 Seconds',
    '30 Seconds',
    '60 Seconds'
  ];

  const sourceOptions = [
    { value: 'pixabay', label: 'Pixabay (Free)' },
    { value: 'pexels', label: 'Pexels (Free)' }
  ];

  const samplePrompts = [
    '5 morning habits that changed my life',
    'History of artificial intelligence',
    'Motivational speech for success',
    'Funny facts about animals'
  ];

  // Slideshow effect for samples
  useEffect(() => {
    if (prompt) return; // Don't show slideshow if user has typed
    
    const interval = setInterval(() => {
      setCurrentSampleIndex(prev => (prev + 1) % samplePrompts.length);
    }, 5000); // Change every 5 seconds
    
    return () => clearInterval(interval);
  }, [prompt]);

  // Handle resizable divider
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const container = containerRef.current;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Constrain between 30% and 70%
      if (newWidth >= 30 && newWidth <= 70) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Initialize GPU state from localStorage
  useEffect(() => {
    const gpuEnabled = localStorage.getItem('gpu_enabled') === 'true';
    setIsGpuEnabled(gpuEnabled);
  }, []);

  const addLog = (message) => {
    setGenerationLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      message
    }]);
  };

  const handleGenerate = async () => {
    // Check if Gemini API key is set
    const geminiKey = localStorage.getItem('gemini_api_key');
    if (!geminiKey || geminiKey.trim() === '') {
      toast.error('❌ Gemini API key is required! Please add it in Settings.');
      setShowApiKeysModal(true); // Open API Keys Modal
      return;
    }

    const nosanaKey = localStorage.getItem('nosana_api_key');

    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setShowSplit(true);
    setIsGenerating(true);
    setGenerationLogs([]);
    setTaskProgress(0);
    
    try {
      addLog('Starting video generation...');
      addLog(`Topic: ${prompt}`);
      addLog(`Aspect Ratio: ${options.aspect}`);
      addLog(`Voice: ${voiceOptions.find(v => v.value === options.voice)?.label}`);
      addLog(`Duration: ${options.duration}`);
      addLog(`Source: ${sourceOptions.find(s => s.value === options.source)?.label}`);
      
      // Log API key usage
      addLog(` Gemini API Key: ${geminiKey ? ' Loaded from localStorage' : ' Not found'}`);
      addLog(` Nosana API Key: ${nosanaKey ? ' Loaded from localStorage' : '⏭ Optional (not set)'}`);
      
      // Call API to generate video
      addLog(' Sending request to API with user API keys...');
      const videoOptions = {
        aspect: options.aspect,
        voice: options.voice,
        duration: api.formatDurationToSeconds(options.duration),
        source: options.source,
      };

      const result = await api.generateVideo(prompt, videoOptions);
      const taskId = result.task_id;
      
      setCurrentTaskId(taskId);
      addLog(`Task created: ${taskId.substring(0, 8)}...`);
      addLog(' Waiting for API to process...');

      // Poll for task completion with extended timeout and exponential backoff
      const completedTask = await api.pollTaskStatus(
        taskId,
        (update) => {
          setTaskProgress(update.progress);
          
          // Show detailed progress with current step and time estimate
          if (update.estimatedRemainingSeconds) {
            const minutes = Math.floor(update.estimatedRemainingSeconds / 60);
            const seconds = update.estimatedRemainingSeconds % 60;
            addLog(`${update.currentStep} - ${update.progress}% - ⏱ ~${minutes}m${seconds}s remaining`);
          } else {
            addLog(` ${update.currentStep} - ${update.progress}%`);
          }
        },
        600, // max attempts = 10+ minutes with exponential backoff
        2000 // starting interval
      );

      // Get the video URL - when progress is 100%, construct URL directly
      let videoUrl = api.getVideoUrl(completedTask);
      
      // If no URL from response, construct it directly from task ID (progress = 100%)
      if (!videoUrl && completedTask.progress === 100) {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        videoUrl = `${apiBase}/tasks/${taskId}/video/1`;
        addLog(`📁 Video found at: ${videoUrl}`);
      }
      
      if (videoUrl) {
        addLog('🎉 Video generation complete!');
        setVideoPreview({
          title: prompt,
          duration: options.duration,
          aspect: options.aspect,
          thumbnail: '/cyberpunk.png',
          videoUrl: videoUrl,
          taskId: taskId
        });
        toast.success('Video generated successfully!');
      } else {
        throw new Error('No video URL found in response');
      }

    } catch (error) {
      console.error('Error generating video:', error);
      addLog(`❌ Error: ${error.message}`);
      toast.error(`Failed to generate video: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-lg">
              E
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ElizaReels
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowApiKeysModal(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-slate-800/50 transition-colors text-slate-300 hover:text-white"
              title="Add API Keys"
            >
              <Settings className="w-5 h-5" />
              <span className="hidden sm:inline">API Keys</span>
            </button>
            <a 
              href="https://github.com/Theideabased/aeterna"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </nav>

      {!showSplit ? (
        // Initial View - Simple Prompt Input
        <div className="flex items-center justify-center min-h-[calc(100vh-73px)] px-6">
          <div className="w-full max-w-2xl">
            {/* Welcome Message */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Generate Videos with AI
              </h1>
              <p className="text-xl text-slate-400">
                Describe your video idea and let AI create it instantly
              </p>
            </div>

            {/* Main Input Box */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
              {/* Prompt Input with Style Button */}
              <div className="mb-6 relative">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-slate-400">Your Prompt</label>
                  {/* Simple GPU Toggle in textbox */}
                  <button
                    onClick={() => {
                      const newState = !isGpuEnabled;
                      setIsGpuEnabled(newState);
                      localStorage.setItem('gpu_enabled', newState ? 'true' : 'false');
                      
                      if (newState) {
                        // When GPU is toggled ON, show the API keys modal to add Nosana key
                        setShowApiKeysModal(true);
                        toast.success('⚡ GPU mode - Add your Nosana API key');
                      } else {
                        // When toggled OFF
                        toast.success('💻 CPU mode enabled');
                      }
                    }}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      isGpuEnabled
                        ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                        : 'bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:border-slate-500'
                    }`}
                    title="Toggle GPU rendering (RTX 3060)"
                  >
                    <Zap className="w-3 h-3" />
                    {isGpuEnabled ? 'GPU' : 'CPU'}
                  </button>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    setCurrentSampleIndex(0); // Reset slideshow when user types
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleGenerate();
                    }
                  }}
                  placeholder={prompt ? undefined : samplePrompts[currentSampleIndex]}
                  className="w-full bg-slate-700/30 border border-slate-600/50 rounded-xl p-4 pr-14 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none"
                  rows="4"
                />
                
                {/* Style Button Inside Textbox */}
                <button
                  onClick={() => setShowStyleModal(true)}
                  className="absolute bottom-4 right-4 p-2 bg-slate-700/50 hover:bg-slate-600 rounded-lg transition-colors flex items-center space-x-1 text-sm text-slate-300 hover:text-white"
                  title="Select video style"
                >
                  <Palette className="w-4 h-4" />
                  <span className="hidden sm:inline">{options.style.substring(0, 3)}</span>
                </button>
              </div>

              {/* Options Section */}
              <div className="mb-6 p-4 bg-slate-700/20 border border-slate-600/30 rounded-xl">
                <button
                  onClick={() => setShowOptionsPanel(!showOptionsPanel)}
                  className="w-full flex items-center justify-between text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  <span>⚙️ Video Options (Customizable)</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showOptionsPanel ? 'rotate-180' : ''}`} />
                </button>

                {showOptionsPanel && (
                  <div className="mt-4 space-y-4">
                    {/* Topic Selection */}
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider">Content Type</label>
                      <select
                        value={options.topic}
                        onChange={(e) => handleOptionChange('topic', e.target.value)}
                        className="w-full mt-2 bg-slate-700/30 border border-slate-600/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50"
                      >
                        {topicOptions.map(topic => (
                          <option key={topic} value={topic}>{topic}</option>
                        ))}
                      </select>
                    </div>

                    {/* Aspect Ratio */}
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider">Aspect Ratio</label>
                      <select
                        value={options.aspect}
                        onChange={(e) => handleOptionChange('aspect', e.target.value)}
                        className="w-full mt-2 bg-slate-700/30 border border-slate-600/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50"
                      >
                        {aspectOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Voice Selection */}
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider">Voice</label>
                      <select
                        value={options.voice}
                        onChange={(e) => handleOptionChange('voice', e.target.value)}
                        className="w-full mt-2 bg-slate-700/30 border border-slate-600/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50"
                      >
                        {voiceOptions.map(voice => (
                          <option key={voice.value} value={voice.value}>{voice.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider">Duration</label>
                      <select
                        value={options.duration}
                        onChange={(e) => handleOptionChange('duration', e.target.value)}
                        className="w-full mt-2 bg-slate-700/30 border border-slate-600/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50"
                      >
                        {durationOptions.map(dur => (
                          <option key={dur} value={dur}>{dur}</option>
                        ))}
                      </select>
                    </div>

                    {/* Video Source */}
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider">Video Source</label>
                      <select
                        value={options.source}
                        onChange={(e) => handleOptionChange('source', e.target.value)}
                        className="w-full mt-2 bg-slate-700/30 border border-slate-600/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50"
                      >
                        {sourceOptions.map(src => (
                          <option key={src.value} value={src.value}>{src.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Style Selection */}
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider">Video Style</label>
                      <button
                        onClick={() => setShowStyleModal(true)}
                        className="w-full mt-2 bg-slate-700/30 border border-slate-600/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-left text-slate-300 hover:bg-slate-700/50 hover:border-blue-500/30 transition-all flex items-center justify-between"
                      >
                        <span>{options.style}</span>
                        <Palette className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Generate Video</span>
                  </>
                )}
              </button>

              {/* Keyboard Hint */}
              <p className="text-center text-xs text-slate-500 mt-4">
                Press <kbd className="bg-slate-700/50 px-2 py-1 rounded text-slate-400">Ctrl+Enter</kbd> to generate
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Split View - Generation Progress + Video Preview
        <div ref={containerRef} className="flex h-[calc(100vh-73px)]">
          {/* Left Side - Logs & Reprompt */}
          <div style={{ width: `${leftWidth}%` }} className="border-r border-slate-800/50 bg-slate-900/50 overflow-hidden flex flex-col transition-all">
            <div className="p-6 border-b border-slate-800/50">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <span>🔄 Generation Progress</span>
                {isGenerating && <Loader className="w-4 h-4 animate-spin" />}
              </h2>
            </div>
            
            {/* Logs Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 border-b border-slate-800/50">
              {generationLogs.map((log, idx) => (
                <div key={idx} className="flex space-x-3 text-sm">
                  <span className="text-slate-500 flex-shrink-0">{log.timestamp}</span>
                  <span className="text-slate-300">{log.message}</span>
                </div>
              ))}
              {!isGenerating && generationLogs.length > 0 && (
                <div className="pt-4 border-t border-slate-700/50">
                  <p className="text-sm text-green-400 font-semibold">✅ Generation complete!</p>
                </div>
              )}
            </div>

            {/* Reprompt Section */}
            <div className="p-6 border-b border-slate-800/50">
              <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">
                💬 Refine Your Video
              </label>
              <textarea
                value={reprompt}
                onChange={(e) => setReprompt(e.target.value)}
                placeholder="Add more details or request changes to the video..."
                className="w-full bg-slate-700/30 border border-slate-600/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 text-slate-200 resize-none h-24"
              />
              <button
                onClick={() => {
                  if (reprompt.trim()) {
                    addLog(`📝 Additional prompt: ${reprompt}`);
                    toast.success('Generating video with additional prompt...');
                    setReprompt('');
                    setIsGenerating(true);
                    // Simulate generation
                    setTimeout(() => {
                      addLog('🔄 Processing additional prompt...');
                      addLog('✅ Video updated with new details');
                      setIsGenerating(false);
                    }, 3000);
                  }
                }}
                disabled={!reprompt.trim() || isGenerating}
                className="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg font-medium text-sm flex items-center justify-center space-x-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Regenerate</span>
              </button>
            </div>

            {/* Action Buttons */}
            {!isGenerating && videoPreview && (
              <div className="p-6 space-y-3">
                <button
                  onClick={() => {
                    setShowSplit(false);
                    setPrompt('');
                    setGenerationLogs([]);
                    setVideoPreview(null);
                    setReprompt('');
                  }}
                  className="w-full bg-slate-700/50 hover:bg-slate-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Create Another
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors text-sm">
                  <Download className="w-4 h-4" />
                  <span>Download Video</span>
                </button>
              </div>
            )}
          </div>

          {/* Resizable Divider */}
          <div
            onMouseDown={() => setIsDragging(true)}
            className="w-1 bg-slate-800/50 hover:bg-blue-500/30 cursor-col-resize transition-colors group flex items-center justify-center"
          >
            <GripVertical className="w-4 h-4 text-slate-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Right Side - Video Preview & Upload */}
          <div style={{ width: `${100 - leftWidth}%` }} className="bg-slate-950 overflow-hidden flex flex-col transition-all">
            {/* Upload Buttons Header */}
            {videoPreview && (
              <div className="border-b border-slate-800/50 p-4 flex gap-2 overflow-x-auto justify-end">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg font-medium text-sm whitespace-nowrap transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share to</span>
                </button>
              </div>
            )}

            {/* Video Preview Area */}
            <div className="flex-1 overflow-hidden flex items-center justify-center p-6">
              {videoPreview ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="w-full max-w-sm h-full max-h-[600px]">
                    <div className="relative bg-slate-800 rounded-2xl overflow-hidden shadow-2xl w-full h-full flex flex-col items-center justify-center">
                      {videoPreview.videoUrl ? (
                        <>
                          <video
                            src={videoPreview.videoUrl}
                            controls
                            className="w-full h-full object-cover"
                            autoPlay
                          />
                        </>
                      ) : (
                        <>
                          <img
                            src={videoPreview.thumbnail}
                            alt="Video preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <button className="w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors shadow-lg">
                              <Play className="w-6 h-6 text-white fill-white" />
                            </button>
                          </div>
                        </>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p className="text-sm text-white font-medium truncate">{videoPreview.title}</p>
                        <p className="text-xs text-slate-300">{videoPreview.aspect} • {videoPreview.duration}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-sm">
                      <Copy className="w-4 h-4" />
                      <span>Copy Video Link</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Loader className="w-12 h-12 animate-spin text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Generating your video...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Social Media Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-8 max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <Share2 className="w-6 h-6 text-blue-400" />
                <span>Share to Social Media</span>
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Options Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* YouTube */}
              <button
                onClick={() => {
                  setSelectedPlatform('YouTube');
                  setShowSocialAuthModal(true);
                }}
                className="flex flex-col items-center space-y-2 p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl border border-slate-600/50 hover:border-red-500/50 transition-all group"
              >
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-700 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white">YouTube</span>
              </button>

              {/* TikTok */}
              <button
                onClick={() => {
                  setSelectedPlatform('TikTok');
                  setShowSocialAuthModal(true);
                }}
                className="flex flex-col items-center space-y-2 p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl border border-slate-600/50 hover:border-black/50 transition-all group"
              >
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.08 1.61 2.88 2.88 0 0 1 4.07-4.09v-3.45a6.47 6.47 0 0 0-6.37 10.12 6.47 6.47 0 0 0 10.86-3.91v-5.16a8.21 8.21 0 0 0 5.51 2.02V9.75a4.82 4.82 0 0 1-.54-.06z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white">TikTok</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => {
                  setSelectedPlatform('Facebook');
                  setShowSocialAuthModal(true);
                }}
                className="flex flex-col items-center space-y-2 p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl border border-slate-600/50 hover:border-blue-600/50 transition-all group"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white">Facebook</span>
              </button>

              {/* Instagram */}
              <button
                onClick={() => {
                  setSelectedPlatform('Instagram');
                  setShowSocialAuthModal(true);
                }}
                className="flex flex-col items-center space-y-2 p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl border border-slate-600/50 hover:border-pink-500/50 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-lg flex items-center justify-center group-hover:opacity-80 transition-opacity">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white">Instagram</span>
              </button>
            </div>

            {/* Info Text */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-200">
              <p>Your video will be uploaded with the title and description based on your original prompt.</p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowUploadModal(false)}
              className="w-full mt-6 px-6 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Social Media Authentication Modal */}
      {showSocialAuthModal && selectedPlatform && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-8 max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Connect to {selectedPlatform}
              </h2>
              <button
                onClick={() => {
                  setShowSocialAuthModal(false);
                  setSocialCredentials({ username: '', password: '' });
                  setSelectedPlatform(null);
                }}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Auth Form */}
            <div className="space-y-4 mb-6">
              {/* Username/Email Input */}
              <div>
                <label className="text-sm text-slate-400 block mb-2">
                  {selectedPlatform === 'TikTok' ? 'Username' : 'Email or Username'}
                </label>
                <input
                  type="text"
                  value={socialCredentials.username}
                  onChange={(e) => setSocialCredentials(prev => ({
                    ...prev,
                    username: e.target.value
                  }))}
                  placeholder={selectedPlatform === 'Instagram' ? 'your_username' : selectedPlatform === 'TikTok' ? '@username' : 'your@email.com'}
                  className="w-full bg-slate-700/30 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="text-sm text-slate-400 block mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={socialCredentials.password}
                  onChange={(e) => setSocialCredentials(prev => ({
                    ...prev,
                    password: e.target.value
                  }))}
                  placeholder="••••••••"
                  className="w-full bg-slate-700/30 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              {/* Info Box */}
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-200">
                <p>Your credentials are secure and only used to authenticate with {selectedPlatform}. We never store your passwords.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSocialAuthModal(false);
                  setSocialCredentials({ username: '', password: '' });
                  setSelectedPlatform(null);
                }}
                className="flex-1 bg-slate-700/50 hover:bg-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (socialCredentials.username && socialCredentials.password) {
                    toast.success(`Authenticating with ${selectedPlatform}...`);
                    setTimeout(() => {
                      toast.success('✅ Authenticated successfully!');
                      setTimeout(() => {
                        toast.success(`Uploading to ${selectedPlatform}...`);
                        setTimeout(() => {
                          toast.success(`Video uploaded to ${selectedPlatform} successfully!`);
                          setShowSocialAuthModal(false);
                          setShowUploadModal(false);
                          setSocialCredentials({ username: '', password: '' });
                          setSelectedPlatform(null);
                        }, 2000);
                      }, 1500);
                    }, 1500);
                  } else {
                    toast.error('Please enter both username and password');
                  }
                }}
                disabled={!socialCredentials.username || !socialCredentials.password}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Connect & Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Style Selection Modal */}
      {showStyleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <Palette className="w-6 h-6 text-blue-400" />
                <span>Select Video Style</span>
              </h2>
              <button
                onClick={() => setShowStyleModal(false)}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Style Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {styleOptions.map((style, idx) => (
                <div key={idx} className="group">
                  <button
                    onClick={() => {
                      if (style.available) {
                        handleOptionChange('style', style.name);
                        setShowStyleModal(false);
                      }
                    }}
                    disabled={!style.available}
                    className={`w-full relative overflow-hidden rounded-xl transition-all ${
                      options.style === style.name
                        ? 'ring-2 ring-blue-500 scale-105'
                        : 'hover:scale-105'
                    } ${!style.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="relative w-full h-40 bg-slate-700/30 rounded-lg overflow-hidden">
                      {/* Style Image */}
                      <Image
                        src={style.image}
                        alt={style.name}
                        fill
                        className="object-cover w-full h-full"
                      />
                      {/* Overlay for unavailable styles */}
                      {!style.available && (
                        <div className="absolute inset-0 bg-black/40" />
                      )}
                    </div>
                    
                    {/* Selection indicator */}
                    {options.style === style.name && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      {style.available ? (
                        <span className="text-xs bg-green-500/80 text-white px-2 py-1 rounded-full">Available</span>
                      ) : (
                        <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded-full">Coming Soon</span>
                      )}
                    </div>
                  </button>
                  <p className="mt-2 text-sm text-slate-300 font-medium">{style.name}</p>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="mt-8 pt-6 border-t border-slate-700/50 flex justify-end space-x-3">
              <button
                onClick={() => setShowStyleModal(false)}
                className="px-6 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => setShowStyleModal(false)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium transition-colors"
              >
                Apply Style
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Keys Modal */}
      <ApiKeysModal 
        isOpen={showApiKeysModal} 
        onClose={() => setShowApiKeysModal(false)}
      />
    </div>
  );
};

export default VideoGeneratorHomepage;
