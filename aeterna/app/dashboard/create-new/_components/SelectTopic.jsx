"use client"
import React,{useState} from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

function SelectTopic({onUserSelect}) {
    const options=[
        'Custom Prompt',
        'Random AI Story',
        'Scary Story',
        'Historical Facts',
        'Bed Time Story',
        'Motivational',
        'Fun Facts'
    ]

    const [selectedOption, setSelectedOption] = useState()

  return (
    <div>
        <h2 className='font-bold text-xl text-primary'>
            Content
        </h2>
        <p className='text-gray-500'>
            Select the topic of your Content
        </p>

        <Select onValueChange={(value)=>
            {
                setSelectedOption(value)
                if (value != 'Custom Prompt') {
                    onUserSelect('video_subject', value)
                    onUserSelect('topic', value)
                }
            }
        }>
            <SelectTrigger className="w-full mt-5 p-6 text-sm">
            <SelectValue placeholder="Content Type"/>
            </SelectTrigger>
            <SelectContent>
                {options.map((item,index)=>(
                    <SelectItem key={index} value={item}>{item}</SelectItem>
                ))}
             
            </SelectContent>
        </Select>

        {
            selectedOption=='Custom Prompt' &&
            <div className='mt-5 space-y-4'>
                {/* Video Subject/Topic */}
                <div className='space-y-2'>
                    <h3 className='text-sm font-medium'>
                        Video Topic / Title <span className='text-red-500'>*</span>
                    </h3>
                    <Textarea 
                        className="w-full min-h-[80px]"
                        onChange={(e)=>{
                            onUserSelect('video_subject', e.target.value)
                            onUserSelect('topic', e.target.value)
                        }}
                        placeholder="e.g., '5 Morning Habits That Changed My Life' or 'The History of Ancient Rome'"
                    />
                    <p className='text-xs text-gray-400'>Enter your video topic or title</p>
                </div>

                {/* Video Script */}
                <div className='space-y-2'>
                    <h3 className='text-sm font-medium'>
                        Custom Script (Optional)
                    </h3>
                    <Textarea 
                        className="w-full min-h-[150px]"
                        onChange={(e)=>{
                            onUserSelect('video_script', e.target.value)
                        }}
                        placeholder="Write your own script here... Leave empty to auto-generate from topic."
                    />
                    <p className='text-xs text-gray-400'>
                        💡 Leave empty to let AI generate script, or write your own for full control
                    </p>
                </div>
            </div>
        }
    </div>
  )
}

export default SelectTopic