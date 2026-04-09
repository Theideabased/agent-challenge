"use client"

import React, { useState, useEffect } from 'react'
import Header from './_components/Header'
import SideNav from './_components/SideNav'
import { VideoDataContext } from '../_context/VideoDataContext'
import { UserDetailContext } from '../_context/UserDetailContext'


function DashboardLayout({children}) {
  const [videoData,setVideoData] = useState([]);
  const [userDetail,setUserDetail] = useState({ credits: 100 }); // Default credits without auth

  // Load credits from localStorage on mount
  useEffect(() => {
    const savedCredits = localStorage.getItem('userCredits');
    if (savedCredits) {
      setUserDetail({ credits: parseInt(savedCredits) });
    }
  }, []);

  return (
    <UserDetailContext.Provider value={{userDetail,setUserDetail}}>
    <VideoDataContext.Provider value={{ videoData , setVideoData }}>
    <div >
        <div className='hidden md:block h-screen fixed mt-[110px] w-64'>
            <SideNav />
        </div>

        <div >
            <Header />
            <div className='md:ml-64 p-10'>
            {children}
            </div>
         
        </div>
    
    </div>
    </VideoDataContext.Provider>
    </UserDetailContext.Provider>
  )
}

export default DashboardLayout