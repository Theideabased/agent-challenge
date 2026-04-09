"use client"
import React from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'

function SelectVideoAspect({onUserSelect}) {
  return (
    <div className='mt-7'>
        <h2 className='font-bold text-xl text-primary'>
            Video Aspect Ratio
        </h2>
        <p className='text-gray-500'>
            Select the aspect ratio for your video
        </p>

        <Select onValueChange={(value)=>
            {
                onUserSelect('video_aspect', value)
            }
        }>
            <SelectTrigger className="w-full mt-5 p-6 text-sm">
            <SelectValue placeholder="Select Aspect Ratio"/>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value='9:16'>Portrait 9:16 (TikTok, Instagram Reels)</SelectItem>
                <SelectItem value='16:9'>Landscape 16:9 (YouTube)</SelectItem>
                <SelectItem value='1:1'>Square 1:1 (Instagram)</SelectItem>
            </SelectContent>
        </Select>
    </div>
  )
}

export default SelectVideoAspect
