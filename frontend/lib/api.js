/**
 * API Integration Service
 * Handles all backend API calls for video generation, task polling, and more
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Task States - MUST MATCH backend /api/app/models/const.py
 * TASK_STATE_FAILED = -1
 * TASK_STATE_COMPLETE = 1
 * TASK_STATE_PROCESSING = 4
 */
export const TaskState = {
  FAILED: -1,
  PENDING: 0,
  COMPLETED: 1,        // Matches backend TASK_STATE_COMPLETE
  PROCESSING: 4,       // Matches backend TASK_STATE_PROCESSING
};

/**
 * Generate a video by posting to the backend API
 * @param {string} videoSubject - The main topic/prompt for the video
 * @param {Object} options - Video generation options
 * @returns {Promise<{task_id: string}>} - Task ID for polling
 */
export async function generateVideo(videoSubject, options = {}) {
  try {
    // Retrieve API keys from localStorage
    const geminiApiKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : '';
    const nosanaApiKey = typeof window !== 'undefined' ? localStorage.getItem('nosana_api_key') : '';
    const gpuEnabled = typeof window !== 'undefined' ? localStorage.getItem('gpu_enabled') === 'true' : false;

    const requestBody = {
      video_subject: videoSubject,
      video_script: options.script || '',
      video_terms: options.terms || [],
      video_aspect: options.aspect || '9:16',
      video_concat_mode: 'random',
      video_transition_mode: null,
      video_clip_duration: parseInt(options.duration) || 30,
      video_count: 1,
      video_source: options.source || 'pixabay',
      video_language: 'en-US',
      voice_name: options.voice || 'en-US-AriaNeural',
      voice_volume: 1.0,
      voice_rate: 1.0,
      bgm_type: 'random',
      bgm_volume: 0.2,
      subtitle_enabled: true,
      subtitle_position: 'bottom',
      font_name: 'STHeitiMedium.ttc',
      text_fore_color: '#FFFFFF',
      text_background_color: true,
      font_size: 60,
      stroke_color: '#000000',
      stroke_width: 1.5,
      n_threads: 2,
      paragraph_number: 1,
      // Add user's API keys
      gemini_api_key: geminiApiKey || '',
      nosana_api_key: nosanaApiKey || '',
      // Add GPU rendering flag - CRITICAL for GPU routing ✅
      use_gpu: gpuEnabled && nosanaApiKey ? true : false,
      gpu_market: options.gpu_market || 'RTX 3060',  // Changed to RTX 3060
    };

    const headers = {
      'Content-Type': 'application/json',
    };

    // Also pass API keys as headers for backend security
    if (geminiApiKey) {
      headers['X-Gemini-API-Key'] = geminiApiKey;
    }
    if (nosanaApiKey) {
      headers['X-Nosana-API-Key'] = nosanaApiKey;
    }

    const response = await fetch(`${API_BASE_URL}/videos`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data.task_id) {
      throw new Error('No task ID received from API');
    }

    return data.data;
  } catch (error) {
    console.error('Error generating video:', error);
    throw error;
  }
}

/**
 * Poll task status until completion or error
 * @param {string} taskId - The task ID to poll
 * @param {Function} onUpdate - Callback called with progress updates
 * @param {number} maxAttempts - Maximum polling attempts
 * @param {number} interval - Polling interval in milliseconds
 * @returns {Promise<Object>} - Task data when complete
 */
export async function pollTaskStatus(
  taskId,
  onUpdate = null,
  maxAttempts = 600,  // 20+ minutes with dynamic intervals
  interval = 2000
) {
  let attempts = 0;
  let lastProgress = 0;
  const startTime = Date.now();
  
  // Exponential backoff: start at 2s, gradually increase to 10s
  const calculateInterval = (attempt) => {
    const baseInterval = 2000;
    const maxInterval = 10000;
    return Math.min(baseInterval + (attempt * 20), maxInterval);
  };

  while (attempts < maxAttempts) {
    try {
      const task = await getTaskStatus(taskId);
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

      // Calculate progress based on state and progress field
      const progress = task.progress || 0;
      
      // Estimate remaining time based on progress
      let estimatedRemainingSeconds = null;
      if (progress > 0 && progress < 100) {
        const estimatedTotal = (elapsedSeconds / progress) * 100;
        estimatedRemainingSeconds = Math.ceil(estimatedTotal - elapsedSeconds);
      }
      
      // Call update callback if progress changed or state changed
      if (onUpdate && (progress !== lastProgress || attempts === 0)) {
        onUpdate({
          progress,
          state: task.state,
          status: getTaskStatusText(task.state),
          currentStep: task.current_step || 'Processing...',
          elapsedSeconds,
          estimatedRemainingSeconds,
          task,
        });
        lastProgress = progress;
      }

      console.log(`Poll ${attempts}: Progress=${progress}%, State=${task.state}, TaskState.COMPLETED=${TaskState.COMPLETED}`);

      // Check if task is complete
      if (task.state === TaskState.COMPLETED) {
        console.log('✅ Task completed! State:', task.state);
        return task;
      }

      // If progress is 100%, task is definitely complete
      // The backend has finished generating the video
      if (progress >= 100) {
        console.log('✅ Progress 100% reached! Returning task. State:', task.state);
        return task;
      }

      // Check for errors
      if (task.state === TaskState.FAILED) {
        throw new Error(task.error_message || 'Video generation failed');
      }

      // Calculate dynamic interval for this attempt
      const nextInterval = calculateInterval(attempts);
      
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, nextInterval));
      attempts++;
    } catch (error) {
      console.error(`Poll attempt ${attempts + 1} failed:`, error);
      throw error;
    }
  }

  throw new Error('Task polling timeout - generation took too long (exceeded 20+ minutes)');
}

/**
 * Get current task status from API
 * @param {string} taskId - The task ID to query
 * @returns {Promise<Object>} - Task status data
 */
export async function getTaskStatus(taskId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get task status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data) {
      throw new Error('No data in task response');
    }

    return data.data;
  } catch (error) {
    console.error('Error getting task status:', error);
    throw error;
  }
}

/**
 * Generate video script using AI
 * @param {string} videoSubject - The topic for the script
 * @param {Object} options - Script generation options
 * @returns {Promise<string>} - Generated script
 */
export async function generateScript(videoSubject, options = {}) {
  try {
    const requestBody = {
      video_subject: videoSubject,
      video_language: options.language || 'en-US',
      paragraph_number: options.paragraphNumber || 1,
    };

    const response = await fetch(`${API_BASE_URL}/scripts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate script: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data.video_script) {
      throw new Error('No script in response');
    }

    return data.data.video_script;
  } catch (error) {
    console.error('Error generating script:', error);
    throw error;
  }
}

/**
 * Generate video terms/keywords for video search
 * @param {string} videoSubject - The topic
 * @param {string} videoScript - The script content
 * @param {Object} options - Generation options
 * @returns {Promise<Array>} - Array of keywords
 */
export async function generateTerms(videoSubject, videoScript, options = {}) {
  try {
    const requestBody = {
      video_subject: videoSubject,
      video_script: videoScript,
      amount: options.amount || 5,
    };

    const response = await fetch(`${API_BASE_URL}/terms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate terms: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data.video_terms) {
      throw new Error('No terms in response');
    }

    return Array.isArray(data.data.video_terms) 
      ? data.data.video_terms 
      : data.data.video_terms.split(',').map(t => t.trim());
  } catch (error) {
    console.error('Error generating terms:', error);
    throw error;
  }
}

/**
 * Delete a task and its generated files
 * @param {string} taskId - The task ID to delete
 * @returns {Promise<void>}
 */
export async function deleteTask(taskId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

/**
 * Get human-readable status text for a task state
 * @param {number} state - Task state constant
 * @returns {string} - Status text
 */
export function getTaskStatusText(state) {
  switch (state) {
    case TaskState.PENDING:
      return 'Pending';
    case TaskState.PROCESSING:
      return 'Processing';
    case TaskState.COMPLETED:
      return 'Completed';
    case TaskState.FAILED:
      return 'Failed';
    default:
      return 'Unknown';
  }
}

/**
 * Extract video URL from task response
 * @param {Object} task - Task data from API
 * @returns {string|null} - Video URL or null if not ready
 */
export function getVideoUrl(task) {
  if (task && task.videos && task.videos.length > 0) {
    return task.videos[0];
  }
  if (task && task.combined_videos && task.combined_videos.length > 0) {
    return task.combined_videos[0];
  }
  return null;
}

/**
 * Get all tasks with pagination
 * @param {number} page - Page number (1-indexed)
 * @param {number} pageSize - Number of items per page
 * @returns {Promise<Object>} - Task list and pagination info
 */
export async function getAllTasks(page = 1, pageSize = 10) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/tasks?page=${page}&page_size=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get tasks: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data) {
      throw new Error('No data in response');
    }

    return data.data;
  } catch (error) {
    console.error('Error getting all tasks:', error);
    throw error;
  }
}

/**
 * Format duration string to seconds
 * @param {string} duration - Duration like "30 Seconds"
 * @returns {number} - Duration in seconds
 */
export function formatDurationToSeconds(duration) {
  if (!duration) return 30;
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1]) : 30;
}

export default {
  generateVideo,
  pollTaskStatus,
  getTaskStatus,
  generateScript,
  generateTerms,
  deleteTask,
  getTaskStatusText,
  getVideoUrl,
  getAllTasks,
  formatDurationToSeconds,
  TaskState,
};
