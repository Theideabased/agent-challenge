"use client"
import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
// Temporarily disabled for frontend demo
// import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Wand2, Play, Sparkles, Zap, Share2, Layers, ArrowRight } from 'lucide-react';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import Spline from '@splinetool/react-spline';

export default function Home() {
  const router = useRouter();
  // Temporarily disabled for frontend demo
  // const { isSignedIn, isLoaded } = useAuth();
  const isSignedIn = false;
  const isLoaded = true;
  const [isPlaying, setIsPlaying] = useState(false);
  const videoUrl = "https://vimeo.com/1024767660";

  // Extract Vimeo video ID from the URL and generate embeddable URL
  const getVimeoEmbedUrl = (url) => {
    const videoId = url.split("vimeo.com/")[1];
    return `https://player.vimeo.com/video/${videoId}`;
  };

  const embedUrl = getVimeoEmbedUrl(videoUrl);
  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSignIn = () => {
    router.push('/dashboard');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <motion.div
          className="p-4 bg-white/10 rounded-full backdrop-blur-sm"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-black">
      {/* Spline background wrapper */}
      <div className="fixed inset-0 w-full h-full bg-black z-0">
        <div className="absolute inset-0 w-full h-full">
          <Spline scene="https://prod.spline.design/qwbQHXy5jgbQ354x/scene.splinecode" />
        </div>
        {/* Dark overlay - subtle to show Spline */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-gray-900/50 to-black/60" />
      </div>

      {/* Main content wrapper */}
      <div className="relative w-full min-h-screen z-10">
        <motion.nav 
          className="fixed top-0 left-0 right-0 z-50 bg-gray-800/90 backdrop-blur-lg border-b border-gray-600/40"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <Image 
                  src="/aeterna ai logo.png" 
                  alt="Aeterna AI Logo" 
                  width={40} 
                  height={40}
                  className="rounded-lg"
                />
                <span className="text-2xl font-bold text-white">Aeterna AI</span>
              </div>
              <div className="flex items-center space-x-6">
                <a href="https://github.com/Theideabased/aeterna" 
                   className="flex items-center space-x-2 text-gray-200 hover:text-white transition-colors">
                  <GitHubLogoIcon className="h-7 w-7" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </motion.nav>

        <main className="relative pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
            >
              <motion.div 
                className="inline-flex items-center space-x-2 bg-blue-500/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-blue-400/30"
                whileHover={{ scale: 1.1 }}
              >
                <Sparkles className="h-5 w-5 text-blue-300" />
                <span className="text-blue-100 font-medium">Automated Faceless Content Creation</span>
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-text-flow drop-shadow-lg">
                Create & Post Videos to Social Media Automatically
              </h1>
              <p className="text-xl text-gray-100 mb-8 drop-shadow-md leading-relaxed">
                You need content for YouTube, TikTok, Instagram, and Facebook. Creating videos takes too much time.
                <span className="text-white font-semibold"> Aeterna AI generates short videos and posts them for you hands-free.</span>
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  onClick={handleSignIn}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-xl text-lg flex items-center space-x-2 w-full sm:w-auto transition-all transform hover:scale-105"
                >
                  <span>Start Creating Videos</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button 
                  onClick={() => {
                    window.open("https://vimeo.com/1024793348?share=copy", "_blank");
                  }}
                  variant="outline"
                  className="border-blue-400 text-blue-400 hover:bg-blue-400/10 px-8 py-6 rounded-xl text-lg flex items-center space-x-2 w-full sm:w-auto transition-all transform hover:scale-105"
                >
                  <Play className="h-5 w-5" />
                  <span>See How It Works</span>
                </Button>
              </div>
            </motion.div>

            {/* Video Section */}
            <motion.div
              className="relative max-w-4xl mx-auto mb-32 rounded-2xl overflow-hidden shadow-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <div className="aspect-video bg-gray-800 rounded-2xl overflow-hidden relative">
                {isPlaying ? (
                  <iframe
                    className="w-full h-full"
                    src={embedUrl}
                    title="Vimeo video player"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <>
                    <Image src="/cyberpunk.png" width={1800} height={1800} alt="AI Video Generation" className="object-cover h-full w-full" />
                    <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-gray-900/95 via-gray-900/80 to-transparent">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors shadow-lg"
                            onClick={handlePlayClick}
                          >
                            <Play className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-white drop-shadow-md">Watch AI-Generated Videos in Action</p>
                            <p className="text-gray-200 drop-shadow-md">See how Aeterna creates and posts content automatically</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="text-white border-white/40 hover:bg-white/20 hover:border-white/60 transition-colors"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Features Section */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.3 } }
              }}
            >
              {[
                {
                  icon: <Zap className="h-8 w-8 text-blue-300" />,
                  title: "Generate Videos",
                  description: "AI creates short, engaging videos from your ideas in minutes—no filming, no editing skills needed"
                },
                {
                  icon: <Layers className="h-8 w-8 text-blue-300" />,
                  title: "Auto-Post Everywhere",
                  description: "Aeterna posts your videos to YouTube, TikTok, Instagram, and Facebook automatically"
                },
                {
                  icon: <Share2 className="h-8 w-8 text-blue-300" />,
                  title: "Grow Your Audience",
                  description: "Consistent content keeps your channels active and your audience engaged—without the work"
                }
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  className="p-8 bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-blue-500/30 hover:bg-slate-900/80 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="bg-blue-600/30 w-16 h-16 rounded-xl flex items-center justify-center mb-6 border border-blue-400/20">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-200">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats Section */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {[
                { number: "5 Min", label: "Average Video Creation" },
                { number: "4+", label: "Social Platforms" },
                { number: "100%", label: "Automated Posting" },
                { number: "24/7", label: "AI Working" }
              ].map((stat, index) => (
                <div key={index} className="text-center p-6 bg-slate-900/40 backdrop-blur-sm rounded-xl border border-blue-500/20">
                  <p className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                    {stat.number}
                  </p>
                  <p className="text-gray-200 font-medium">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* CTA Section */}
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white drop-shadow-lg">
                Stop Wasting Time. Start Growing Your Audience.
              </h2>
              <p className="text-gray-100 mb-8 text-lg drop-shadow-md">
                Your competitors are posting daily. You can too without lifting a finger.
                <span className="text-white font-semibold"> Let Aeterna AI handle your faceless content creation while you focus on what matters.</span>
              </p>
              <Button 
                onClick={handleSignIn}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-xl text-lg transform hover:scale-105 transition-all"
              >
                Get Started Now
              </Button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative border-t border-blue-500/20 py-12 mt-20 bg-slate-900/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <Image 
                  src="/aeterna ai logo.png" 
                  alt="Aeterna AI Logo" 
                  width={32} 
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold text-white">Aeterna AI</span>
              </div>
              <div className="flex space-x-6 text-gray-200">
                <a href="https://github.com/Theideabased/aeterna" 
                   className="flex items-center space-x-2 hover:text-white transition-colors">
                  <GitHubLogoIcon className="h-5 w-5" />
                  <span>GitHub</span>
                </a>
                <a href="#" 
                   className="hover:text-white transition-colors">
                  Terms
                </a>
                <a href="#" 
                   className="hover:text-white transition-colors">
                  Privacy
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
