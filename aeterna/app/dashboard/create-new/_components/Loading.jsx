import React from 'react'
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { XCircle } from 'lucide-react'

function CustomLoading({loading, onCancel}) {
  return (
    <AlertDialog open={loading}>
        <AlertDialogTitle>
        <AlertDialogContent className='bg-white'>
           <div className='bg-white flex flex-col items-center my-10 justify-center'>
            <Image src='/soon.gif' width={100} height={100} alt='loading' />
            <h2 className='mt-4 text-center'>
                Generating your Video...Keep Calm
            </h2>
            <p className='text-sm text-gray-500 mt-2 text-center'>
              This may take a few minutes
            </p>
            {onCancel && (
              <Button 
                onClick={onCancel}
                variant="destructive"
                className='mt-6'
              >
                <XCircle className='w-4 h-4 mr-2' />
                Cancel Generation
              </Button>
            )}
           </div>
        </AlertDialogContent>
        </AlertDialogTitle>
    </AlertDialog>

  )
}

export default CustomLoading