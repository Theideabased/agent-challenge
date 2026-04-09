"use client"
import React, { useState } from 'react'
import { Outfit } from 'next/font/google'
import { Button } from '@/components/ui/button'
import { 
  Youtube, 
  Facebook, 
  Instagram, 
  Music2,
  CheckCircle2,
  XCircle,
  Settings,
  Calendar,
  Clock
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const outfit = Outfit({subsets: ["latin-ext"], weight: ["400", "600", "700"]});

function Automation() {
  const [connections, setConnections] = useState({
    youtube: false,
    tiktok: false,
    facebook: false,
    instagram: false
  });

  const [automationSettings, setAutomationSettings] = useState({
    frequency: 'daily',
    time: '09:00',
    autoPost: true
  });

  const socialPlatforms = [
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: 'Post videos to your YouTube channel'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: Music2,
      color: 'text-black',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      description: 'Share short videos on TikTok'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Post to your Facebook page'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      description: 'Share Reels on Instagram'
    }
  ];

  const handleConnect = (platformId) => {
    // Placeholder - will implement OAuth later
    setConnections(prev => ({
      ...prev,
      [platformId]: !prev[platformId]
    }));
  };

  return (
    <div className='p-6'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className={`text-4xl font-bold text-primary ${outfit.className}`}>
          Social Media Automation
        </h1>
        <p className='text-gray-500 mt-2'>
          Connect your social media accounts and automate video posting
        </p>
      </div>

      {/* Social Media Connections */}
      <div className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>Connected Accounts</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {socialPlatforms.map((platform) => (
            <div 
              key={platform.id}
              className={`border-2 ${platform.borderColor} ${platform.bgColor} rounded-lg p-6 transition-all hover:shadow-md`}
            >
              <div className='flex items-start justify-between'>
                <div className='flex items-start gap-4'>
                  <div className={`p-3 ${platform.bgColor} rounded-lg border ${platform.borderColor}`}>
                    <platform.icon className={`h-8 w-8 ${platform.color}`} />
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold flex items-center gap-2'>
                      {platform.name}
                      {connections[platform.id] && (
                        <CheckCircle2 className='h-5 w-5 text-green-600' />
                      )}
                    </h3>
                    <p className='text-sm text-gray-600 mt-1'>
                      {platform.description}
                    </p>
                    {connections[platform.id] && (
                      <p className='text-xs text-green-600 mt-2'>
                        ✓ Connected as @username
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => handleConnect(platform.id)}
                  variant={connections[platform.id] ? "outline" : "default"}
                  className={connections[platform.id] ? 'border-red-200 text-red-600 hover:bg-red-50' : ''}
                >
                  {connections[platform.id] ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automation Settings */}
      <div className='bg-white border-2 border-gray-200 rounded-lg p-6'>
        <div className='flex items-center gap-2 mb-4'>
          <Settings className='h-6 w-6 text-primary' />
          <h2 className='text-2xl font-semibold'>Automation Settings</h2>
        </div>

        <div className='space-y-6'>
          {/* Posting Frequency */}
          <div>
            <label className='flex items-center gap-2 text-sm font-medium mb-2'>
              <Calendar className='h-4 w-4' />
              Posting Frequency
            </label>
            <Select 
              value={automationSettings.frequency}
              onValueChange={(value) => setAutomationSettings(prev => ({...prev, frequency: value}))}
            >
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Every Hour</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="twice-daily">Twice Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="custom">Custom Schedule</SelectItem>
              </SelectContent>
            </Select>
            <p className='text-xs text-gray-500 mt-1'>
              How often should new videos be posted automatically?
            </p>
          </div>

          {/* Posting Time */}
          <div>
            <label className='flex items-center gap-2 text-sm font-medium mb-2'>
              <Clock className='h-4 w-4' />
              Preferred Posting Time
            </label>
            <input
              type="time"
              value={automationSettings.time}
              onChange={(e) => setAutomationSettings(prev => ({...prev, time: e.target.value}))}
              className='border-2 border-gray-200 rounded-md px-4 py-2 w-full md:w-[300px]'
            />
            <p className='text-xs text-gray-500 mt-1'>
              What time should videos be posted? (Your timezone)
            </p>
          </div>

          {/* Auto-Post Toggle */}
          <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200'>
            <div>
              <h3 className='font-semibold'>Enable Auto-Posting</h3>
              <p className='text-sm text-gray-600'>
                Automatically post generated videos to connected platforms
              </p>
            </div>
            <button
              onClick={() => setAutomationSettings(prev => ({...prev, autoPost: !prev.autoPost}))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                automationSettings.autoPost ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  automationSettings.autoPost ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Connected Platforms Summary */}
          <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
            <h3 className='font-semibold text-blue-900 mb-2'>Connected Platforms</h3>
            <div className='flex flex-wrap gap-2'>
              {Object.entries(connections).filter(([_, isConnected]) => isConnected).length > 0 ? (
                Object.entries(connections)
                  .filter(([_, isConnected]) => isConnected)
                  .map(([platform]) => (
                    <span key={platform} className='px-3 py-1 bg-white border border-blue-300 rounded-full text-sm font-medium capitalize'>
                      {platform}
                    </span>
                  ))
              ) : (
                <p className='text-sm text-blue-700'>No platforms connected yet</p>
              )}
            </div>
            <p className='text-xs text-blue-700 mt-2'>
              {automationSettings.autoPost && Object.values(connections).some(v => v)
                ? `Videos will be posted ${automationSettings.frequency} at ${automationSettings.time}`
                : 'Connect platforms and enable auto-posting to get started'}
            </p>
          </div>

          {/* Save Settings Button */}
          <div className='flex gap-3 pt-4'>
            <Button className='w-full md:w-auto'>
              Save Settings
            </Button>
            <Button variant="outline" className='w-full md:w-auto'>
              Test Connection
            </Button>
          </div>
        </div>
      </div>

      {/* Coming Soon Badge */}
      <div className='mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
        <p className='text-sm text-yellow-800'>
          <span className='font-semibold'>🚀 Coming Soon:</span> This feature is currently in development. 
          OAuth integration with social platforms will be available in the next update.
        </p>
      </div>
    </div>
  )
}

export default Automation
