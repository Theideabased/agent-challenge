"use client"
import React from 'react'
import { Outfit } from 'next/font/google'
import { Button } from '@/components/ui/button'
import { 
  Heart, 
  Coffee,
  Github,
  Star,
  Sparkles,
  Rocket,
  Users,
  Code,
  Zap,
  Target
} from 'lucide-react'

const outfit = Outfit({subsets: ["latin-ext"], weight: ["400", "600", "700"]});

function Support() {
  const features = [
    {
      icon: Rocket,
      title: "Advanced Features",
      description: "Your support helps us build more AI models, video styles, and automation features"
    },
    {
      icon: Zap,
      title: "Faster Development",
      description: "Speed up development of new features and improvements you want to see"
    },
    {
      icon: Code,
      title: "Open Source",
      description: "Keep Aeterna free and open-source for everyone in the community"
    },
    {
      icon: Users,
      title: "Community Growth",
      description: "Help us grow the community and support more content creators"
    }
  ];

  const milestones = [
    {
      amount: "$100/month",
      goal: "🎨 Add Cartoon & Comic video styles",
      progress: 30
    },
    {
      amount: "$250/month",
      goal: "🤖 Multi-language voice support (10+ languages)",
      progress: 15
    },
    {
      amount: "$500/month",
      goal: "🚀 Full social media auto-posting (all platforms)",
      progress: 8
    },
    {
      amount: "$1000/month",
      goal: "⚡ Premium API access & Priority support",
      progress: 0
    }
  ];

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      {/* Header */}
      <div className='text-center mb-12'>
        <div className='inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 px-4 py-2 rounded-full mb-4'>
          <Sparkles className='h-5 w-5 text-purple-600' />
          <span className='text-sm font-semibold text-purple-700'>Support Open Source</span>
        </div>
        
        <h1 className={`text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 ${outfit.className}`}>
          Help Aeterna Grow
        </h1>
        
        <p className='text-xl text-gray-600 max-w-2xl mx-auto mb-8'>
          Aeterna is free and open-source. Your support helps us build amazing features 
          and keep this project alive for content creators worldwide.
        </p>

        {/* Primary CTA */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
          <Button 
            className='bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2'
            onClick={() => window.open('https://buymeacoffee.com/yourusername', '_blank')}
          >
            <Coffee className='h-6 w-6' />
            Buy Me a Coffee
          </Button>
          
          <Button 
            variant="outline"
            className='border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold text-lg px-8 py-6 rounded-full flex items-center gap-2'
            onClick={() => window.open('https://github.com/Theideabased/aeterna', '_blank')}
          >
            <Github className='h-5 w-5' />
            Star on GitHub
          </Button>
        </div>
      </div>

      {/* Why Support Section */}
      <div className='mb-12'>
        <h2 className='text-3xl font-bold text-center mb-8'>Why Your Support Matters</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {features.map((feature, index) => (
            <div 
              key={index}
              className='bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-lg transition-all'
            >
              <div className='flex items-start gap-4'>
                <div className='p-3 bg-purple-100 rounded-lg'>
                  <feature.icon className='h-6 w-6 text-purple-600' />
                </div>
                <div>
                  <h3 className='text-xl font-semibold mb-2'>{feature.title}</h3>
                  <p className='text-gray-600'>{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Funding Goals */}
      <div className='mb-12'>
        <div className='flex items-center justify-center gap-2 mb-6'>
          <Target className='h-6 w-6 text-purple-600' />
          <h2 className='text-3xl font-bold text-center'>Funding Goals</h2>
        </div>
        <div className='bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-8'>
          <div className='space-y-6'>
            {milestones.map((milestone, index) => (
              <div key={index} className='bg-white rounded-lg p-6 border border-purple-200'>
                <div className='flex items-center justify-between mb-3'>
                  <div>
                    <h3 className='font-bold text-lg'>{milestone.amount}</h3>
                    <p className='text-gray-700'>{milestone.goal}</p>
                  </div>
                  <span className='text-sm font-semibold text-purple-600'>
                    {milestone.progress}%
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-3 overflow-hidden'>
                  <div 
                    className='bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full transition-all duration-500'
                    style={{ width: `${milestone.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Support Tiers */}
      <div className='mb-12'>
        <h2 className='text-3xl font-bold text-center mb-8'>Ways to Support</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* One-Time */}
          <div className='bg-white border-2 border-gray-200 rounded-xl p-6 text-center hover:border-yellow-400 hover:shadow-xl transition-all'>
            <Coffee className='h-12 w-12 text-yellow-500 mx-auto mb-4' />
            <h3 className='text-2xl font-bold mb-2'>One-Time</h3>
            <p className='text-4xl font-bold text-yellow-600 mb-4'>$5</p>
            <p className='text-gray-600 mb-6'>
              Buy me a coffee to keep coding late nights ☕
            </p>
            <Button 
              className='w-full bg-yellow-500 hover:bg-yellow-600'
              onClick={() => window.open('https://buymeacoffee.com/yourusername', '_blank')}
            >
              Support Once
            </Button>
          </div>

          {/* Monthly */}
          <div className='bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-purple-600 rounded-xl p-6 text-center text-white shadow-xl transform scale-105 hover:scale-110 transition-all'>
            <div className='bg-yellow-400 text-purple-900 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4'>
              MOST POPULAR
            </div>
            <Heart className='h-12 w-12 mx-auto mb-4' />
            <h3 className='text-2xl font-bold mb-2'>Monthly Sponsor</h3>
            <p className='text-4xl font-bold mb-4'>$10/mo</p>
            <p className='mb-6 text-purple-100'>
              Become a monthly sponsor and get your name in our README ⭐
            </p>
            <Button 
              className='w-full bg-white text-purple-600 hover:bg-gray-100 font-bold'
              onClick={() => window.open('https://github.com/sponsors/Theideabased', '_blank')}
            >
              Sponsor Monthly
            </Button>
          </div>

          {/* Enterprise */}
          <div className='bg-white border-2 border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 hover:shadow-xl transition-all'>
            <Rocket className='h-12 w-12 text-blue-600 mx-auto mb-4' />
            <h3 className='text-2xl font-bold mb-2'>Enterprise</h3>
            <p className='text-4xl font-bold text-blue-600 mb-4'>$50+/mo</p>
            <p className='text-gray-600 mb-6'>
              Priority support, custom features, and company logo on our site 🏢
            </p>
            <Button 
              variant="outline"
              className='w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
              onClick={() => window.open('mailto:support@aeterna.ai', '_blank')}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>

      {/* Other Ways to Support */}
      <div className='bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-purple-200 rounded-xl p-8 text-center'>
        <h2 className='text-2xl font-bold mb-4'>Other Ways to Help</h2>
        <p className='text-gray-700 mb-6'>
          Can't contribute financially? No problem! Here are other ways to support Aeterna:
        </p>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='bg-white rounded-lg p-4 border border-purple-200'>
            <Star className='h-8 w-8 text-yellow-500 mx-auto mb-2' />
            <h3 className='font-semibold mb-1'>Star on GitHub</h3>
            <p className='text-sm text-gray-600'>Help us get discovered</p>
          </div>
          <div className='bg-white rounded-lg p-4 border border-purple-200'>
            <Users className='h-8 w-8 text-blue-500 mx-auto mb-2' />
            <h3 className='font-semibold mb-1'>Share with Friends</h3>
            <p className='text-sm text-gray-600'>Spread the word</p>
          </div>
          <div className='bg-white rounded-lg p-4 border border-purple-200'>
            <Code className='h-8 w-8 text-green-500 mx-auto mb-2' />
            <h3 className='font-semibold mb-1'>Contribute Code</h3>
            <p className='text-sm text-gray-600'>Submit pull requests</p>
          </div>
        </div>
      </div>

      {/* Thank You Message */}
      <div className='mt-12 text-center'>
        <p className='text-2xl font-semibold text-gray-800 mb-4'>
          Thank you for believing in Aeterna! 🙏
        </p>
        <p className='text-gray-600 max-w-2xl mx-auto'>
          Every contribution, no matter the size, makes a huge difference. 
          Together, we're building the future of AI-powered video creation for everyone.
        </p>
      </div>
    </div>
  )
}

export default Support
