"use client"

import { CircleUser, FileVideo, PanelsTopLeft, ShieldPlus, Video, Zap } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

function SideNav() {

    const MenuOption=[
       {
        id:1,
        name:'Dashboard',
        path:'/dashboard',
        icon:PanelsTopLeft
       } ,
       {
        id:2,
        name:'Create New',
        path:'/dashboard/create-new',
        icon:FileVideo
       } ,
       {
        id:3,
        name:'My Videos',
        path:'/dashboard/videos',
        icon:Video
       } ,
       {
        id:4,
        name:'Automation',
        path:'/dashboard/automation',
        icon:Zap
       } ,
       {
        id:5,
        name:'Sponsor Us',
        path:'/dashboard/sponsor',
        icon:ShieldPlus
       } ,
       {
        id:6,
        name:'Account',
        path:'/',
        icon:CircleUser
       } 
    ]
    const path=usePathname();
  return (
    <div className='w-64 h-screen shadow-md p-5 '>
        <div className='grid gap-3'>
            {MenuOption.map((item,index)=>(
                <Link href={item.path} key={index}>
                <div className={`flex items-center gap-3 p-3 
                color:bg-primary
                hover:bg-primary hover:text-white 
                rounded-xl cursor-pointer
                ${path==item.path&&'bg-primary text-white'}
                `}>
                    <item.icon/>
                    <h2>{item.name}</h2>
                </div>
                </Link>
            ))}

        </div>
        
        </div>
  )
}

export default SideNav