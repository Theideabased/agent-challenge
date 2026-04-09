import React, { useEffect, useState } from 'react';
import {Player} from '@remotion/player';

import {
    Dialog,
    DialogContent,
    DialogTitle,

  } from "@/components/ui/dialog"
  
import RemotionVideo from './RemotionVideo';
import { Button } from '@/components/ui/button';
import { db } from '@/configs/db';
import { VideoData } from '@/configs/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'next/navigation';

  
function PlayerDialog({playVideo,videoid}) {
    const [openDialog,setOpenDialog]=useState(true);
    const [videoData,setVideoData]=useState();
    const [durationinFrames,setDurationinFrames]=useState(100);
    const router = useRouter();

    useEffect(() => {
        setOpenDialog(!openDialog)
        videoid&&GetVideoData();

    },[playVideo])

    const GetVideoData = async ()=>{
        // Get video from localStorage instead of database
        const videos = JSON.parse(localStorage.getItem('videos') || '[]');
        const video = videos.find(v => v.id === videoid);
        
        if (video && video.videos && video.videos.length > 0) {
            // Use the video URL directly
            setVideoData({
                videoUrl: video.videos[0], // First video URL from API
                taskId: video.taskId,
                subject: video.subject,
                createdAt: video.createdAt
            });
        }
    }
  return (
    <Dialog open={openDialog}>

  <DialogContent className="bg-white flex flex-col items-center">

      <DialogTitle className="text-3xl font-bold my-5">Your Video is Generated</DialogTitle>
      
      {videoData?.videoUrl ? (
        <video 
          src={videoData.videoUrl} 
          controls 
          className="w-full max-w-md rounded-lg"
          style={{maxHeight: '500px'}}
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="w-full max-w-md h-64 flex items-center justify-center bg-gray-100 rounded-lg">
          <p>Loading video...</p>
        </div>
      )}
      
    <div className='flex gap-10 mt-7'>
        <Button variant="ghost" onClick={()=>{router.replace('/dashboard');setOpenDialog(false)}}>
            Cancel
        </Button>
        <Button onClick={()=>videoData?.videoUrl && window.open(videoData.videoUrl, '_blank')}>
            Download Video
        </Button>
    </div>
  </DialogContent>
</Dialog>

  )
}

export default PlayerDialog