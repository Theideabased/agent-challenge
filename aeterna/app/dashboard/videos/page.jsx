'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Loader2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080'

function VideosPage() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingTasks, setCancellingTasks] = useState(new Set())

  useEffect(() => {
    fetchAllVideos()
    
    // Poll every 3 seconds to check for updates
    const interval = setInterval(() => {
      fetchAllVideos()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const fetchAllVideos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/tasks`)
      const tasks = response.data.data.tasks || []
      
      // Sort: Processing videos first (state !== 1), then by timestamp (newest first)
      const sortedTasks = tasks.sort((a, b) => {
        // Priority 1: Videos without timestamp come first (usually in-progress)
        const hasTimeA = !!a.created_at
        const hasTimeB = !!b.created_at
        
        if (!hasTimeA && hasTimeB) return -1  // a has no timestamp, show first
        if (hasTimeA && !hasTimeB) return 1   // b has no timestamp, show first
        
        // Priority 2: If one is processing and other is complete, processing comes first
        if (a.state !== 1 && b.state === 1) return -1
        if (a.state === 1 && b.state !== 1) return 1
        
        // Priority 3: If both have same state and both have timestamps, sort by timestamp (newest first)
        if (hasTimeA && hasTimeB) {
          return b.created_at.localeCompare(a.created_at)
        }
        
        return 0
      })
      
      setVideos(sortedTasks)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching videos:', error)
      setLoading(false)
    }
  }

  const cancelVideoGeneration = async (taskId) => {
    if (cancellingTasks.has(taskId)) return
    
    try {
      setCancellingTasks(prev => new Set(prev).add(taskId))
      
      // Call the API to cancel the task
      await axios.delete(`${API_BASE_URL}/api/v1/tasks/${taskId}`)
      
      toast.success('Video generation cancelled successfully')
      
      // Refresh the video list
      fetchAllVideos()
    } catch (error) {
      console.error('Error cancelling video:', error)
      toast.error('Failed to cancel video generation: ' + (error.response?.data?.message || error.message))
    } finally {
      setCancellingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }
  }

  const downloadVideo = (videoUrl) => {
    window.open(videoUrl, '_blank')
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown'
    try {
      const date = new Date(timestamp)
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl">Loading videos...</h2>
      </div>
    )
  }

  return (
    <div className="md:px-20 p-10">
      <h2 className="text-4xl text-primary mb-8">All Generated Videos</h2>
      
      {videos.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No videos found</p>
          <p className="text-gray-400 text-sm mt-2">Generate your first video to see it here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.task_id} className="border rounded-lg overflow-hidden shadow-lg bg-white">
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="font-semibold text-sm truncate mb-1">
                  {video.script?.substring(0, 60) || 'Untitled Video'}...
                </h3>
                {video.created_at && (
                  <p className="text-xs text-gray-500">
                    {formatTimestamp(video.created_at)}
                  </p>
                )}
              </div>
              <div className="p-4">
                {/* Show progress bar if video is in-progress */}
                {video.state !== 1 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Generating video...</span>
                        <span className="font-semibold text-primary">{video.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all duration-500 rounded-full flex items-center justify-end pr-1"
                          style={{width: `${video.progress || 0}%`}}
                        >
                          {video.progress > 10 && (
                            <span className="text-[10px] text-white font-bold">
                              {video.progress}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Cancel Button */}
                    <Button 
                      onClick={() => cancelVideoGeneration(video.task_id)}
                      disabled={cancellingTasks.has(video.task_id)}
                      variant="destructive"
                      className="w-full"
                    >
                      {cancellingTasks.has(video.task_id) ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel Generation
                        </>
                      )}
                    </Button>
                    
                    <div className="text-xs text-gray-500 mt-4 space-y-1">
                      <p className="truncate">Task ID: {video.task_id}</p>
                      <p>Status: <span className="text-yellow-600 font-semibold">Processing</span></p>
                      {video.created_at && (
                        <p>Created: {formatTimestamp(video.created_at)}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Show video player if completed */
                  video.videos && video.videos.length > 0 && (
                    <div className="space-y-4">
                      <video 
                        src={video.videos[0]} 
                        controls 
                        className="w-full rounded-lg"
                        style={{maxHeight: '300px'}}
                      >
                        Your browser does not support the video tag.
                      </video>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => downloadVideo(video.videos[0])}
                          className="w-full"
                        >
                          Download Final
                        </Button>
                        {video.combined_videos && video.combined_videos.length > 0 && (
                          <Button 
                            onClick={() => downloadVideo(video.combined_videos[0])}
                            variant="outline"
                            className="w-full"
                          >
                            Download Combined
                          </Button>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-2 space-y-1">
                        <p className="truncate">Task ID: {video.task_id}</p>
                        <p>Status: <span className="text-green-600 font-semibold">Complete</span></p>
                        <p>Progress: {video.progress}%</p>
                        {video.created_at && (
                          <p>Created: {formatTimestamp(video.created_at)}</p>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8">
        <Button onClick={fetchAllVideos} variant="outline">
          Refresh Videos
        </Button>
      </div>
    </div>
  )
}

export default VideosPage
