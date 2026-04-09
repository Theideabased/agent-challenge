"use client"
import Image from 'next/image'
import React, { useState } from 'react'

function SelectStyle({onUserSelect}) {

    const styleOptions = [
        {
            name:"Use Videos Online",
            image:'/online_video.jpg',
            available: true
        },
        {
            name:"Realistic AI",
            image:'/realistic.png',
            available: false
        },
        {
            name:"Cartoon AI",
            image:'/cartoon.png',
            available: false
        },
        {
            name:"Watercolor AI",
            image:'/watercolor.png',
            available: false
        },
        {
            name:"CyberPunk AI",
            image:'/cyberpunk.png',
            available: false
        },
    ]

    const [selectedStyle, setSelectedStyle] = useState('Use Videos Online')
    
    // Set default to Use Videos Online on mount
    React.useEffect(() => {
        onUserSelect('imageStyle', 'Use Videos Online')
    }, [])

  return (
    <div className='mt-7'>
        <h2 className='font-bold text-xl text-primary'>
            Styles
        </h2>
        <p className='text-gray-500'>
            Select the Style for your Video
        </p>

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
        gap-5 mt-3
        '>
            {styleOptions.map((item,index)=>(
                <div className=
                {`relative hover:scale-105 transition-all cursor-pointer
                rounded-xl
                ${selectedStyle == item.name ? 'border-4 border-primary' : ''}
                ${!item.available ? 'opacity-60 cursor-not-allowed' : ''}
                
                `} key={index}>
                    <Image src={item.image} 
                    width={1300} height={2300} 
                    alt={item.name}
                    className='h-full object-cover rounded-lg w-full'
                    
                    onClick={()=>
                        {
                            if (item.available) {
                                setSelectedStyle(item.name)
                                onUserSelect('imageStyle',item.name)
                            }
                        }
                    }
                    
                    />

                    <div className='absolute p-1 bg-black bottom-0 
                    text-white
                    text-center
                    rounded-b-lg
                    w-full
                    flex items-center justify-center gap-2'>
                        <span>{item.name}</span>
                        {!item.available && (
                            <span className="text-xs bg-gray-600 px-2 py-0.5 rounded-full">Coming Soon</span>
                        )}
                    </div>
                </div>
            ))} 
        </div>
    </div>
  )
}

export default SelectStyle