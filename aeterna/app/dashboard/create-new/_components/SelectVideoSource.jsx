"use client"
import React from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'

function SelectVideoSource({onUserSelect}) {
  return (
    <div className='mt-7'>
        <h2 className='font-bold text-xl text-primary'>
            Video Source
        </h2>
        <p className='text-gray-500'>
            Select where to get video clips from
        </p>

        <Select onValueChange={(value)=>
            {
                onUserSelect('video_source', value)
            }
        } defaultValue='pixabay'>
            <SelectTrigger className="w-full mt-5 p-6 text-sm">
            <SelectValue placeholder="Select Video Source"/>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value='pixabay'>Pixabay (Free Stock Videos)</SelectItem>
                <SelectItem value='pexels'>Pexels (Free Stock Videos)</SelectItem>
            </SelectContent>
        </Select>
    </div>
  )
}

export default SelectVideoSource
