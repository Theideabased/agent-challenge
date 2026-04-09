"use client"
import React from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'

function SelectVoice({onUserSelect}) {
  const voices = [
    { value: 'en-US-AriaNeural', label: 'English (US) - Aria (Female)' },
    { value: 'en-US-GuyNeural', label: 'English (US) - Guy (Male)' },
    { value: 'en-US-JennyNeural', label: 'English (US) - Jenny (Female)' },
    { value: 'en-GB-SoniaNeural', label: 'English (UK) - Sonia (Female)' },
    { value: 'en-GB-RyanNeural', label: 'English (UK) - Ryan (Male)' },
    { value: 'en-AU-NatashaNeural', label: 'English (AU) - Natasha (Female)' },
    { value: 'en-IN-NeerjaNeural', label: 'English (India) - Neerja (Female)' },
  ];

  return (
    <div className='mt-7'>
        <h2 className='font-bold text-xl text-primary'>
            Voice
        </h2>
        <p className='text-gray-500'>
            Select the voice for your video narration
        </p>

        <Select onValueChange={(value)=>
            {
                onUserSelect('voice_name', value)
            }
        } defaultValue='en-US-AriaNeural'>
            <SelectTrigger className="w-full mt-5 p-6 text-sm">
            <SelectValue placeholder="Select Voice"/>
            </SelectTrigger>
            <SelectContent>
                {voices.map((voice, index) => (
                    <SelectItem key={index} value={voice.value}>
                        {voice.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
  )
}

export default SelectVoice
