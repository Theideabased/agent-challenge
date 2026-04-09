"use client"
import { Button } from '@/components/ui/button'
import React,{useState} from 'react'
import { Open_Sans } from 'next/font/google'
import EmptyState from './_components/EmptyState';
import Link from 'next/link';
import VideoList from './_components/VideoList';

  
const open_sans = Open_Sans({subsets: ["latin-ext"],style:"normal",weight: "700"});

function Dashboard() {

  const [videoList,setVideoList] = useState([]);

  // For demo purposes - you can load videos from localStorage or API later
  // useEffect(()=>{
  //   // Load videos from your API here
  // },[])


  return (
    <div >
       <div className='flex justify-between items-center'>
        <h2 className={`font-extrabold text-4xl text-primary ${open_sans.className} `} >
          Dashboard
        </h2>
        <Link href={'/dashboard/create-new'}>
        <Button>Create New +</Button>
        </Link>
       </div>

       {/* Empty State */}
       {videoList?.length==0&&<div>
        <EmptyState/>
       </div>}
      
      {/* List of Videos */}
        <VideoList videoList={videoList}/>
    </div>
  )
}

export default Dashboard