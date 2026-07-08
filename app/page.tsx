import Link from 'next/link';
import { Play, Shield, Zap, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B141A] text-white overflow-y-auto overflow-x-hidden w-full h-full absolute inset-0">
      {/* Navbar */}
      <nav className="w-full px-8 py-6 flex items-center justify-between z-50 relative max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-[#25D366] font-bold text-2xl tracking-tight">ChatSphere</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link href="#" className="hover:text-white transition-colors">Chats</Link>
          <Link href="#" className="hover:text-white transition-colors">Calls</Link>
          <Link href="#" className="hover:text-white transition-colors">Security</Link>
          <Link href="#" className="hover:text-white transition-colors">Enterprise</Link>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-gray-300 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          <Link href="/api/auth/login" className="text-sm font-medium hover:text-white transition-colors">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full pt-20 pb-32 px-8 relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between">
        
        {/* Left Content */}
        <div className="max-w-2xl z-10 flex flex-col items-start gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#25D366]">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
            VERSION 2.0 LIVE
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
            Connect with<br />
            the world in<br />
            real-time.
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-lg leading-relaxed mt-4">
            Experience the next evolution of communication. End-to-end encrypted, lightning fast, and seamlessly synced across all your devices.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
            <Link href="/chat">
              <Button className="bg-[#25D366] hover:bg-[#1EBE58] text-black font-semibold rounded-full px-8 py-6 text-lg h-auto shadow-[0_0_30px_rgba(37,211,102,0.3)] transition-all hover:scale-105">
                Get Started For Free
              </Button>
            </Link>
            <Button variant="ghost" className="text-white hover:bg-white/5 rounded-full px-6 py-6 text-lg h-auto gap-3">
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
                <Play className="w-4 h-4 fill-white" />
              </div>
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Right Image/Mockup */}
        <div className="w-full lg:w-1/2 mt-16 lg:mt-0 relative flex justify-end">
          {/* Decorative glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#25D366]/20 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
          
          <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-[#1F2C34]/50 backdrop-blur-sm shadow-2xl">
             {/* Mockup UI representing the chat app */}
             <div className="absolute inset-0 bg-gradient-to-tr from-[#0B141A] to-[#1F2C34] flex items-center justify-center">
                <div className="w-64 h-[400px] bg-[#111B21] rounded-3xl border-4 border-gray-800 shadow-2xl transform rotate-12 flex flex-col overflow-hidden relative">
                   <div className="p-4 border-b border-gray-800 flex items-center gap-3 bg-[#1F2C34]">
                      <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                      <div className="flex flex-col">
                        <div className="w-20 h-2 bg-gray-400 rounded"></div>
                        <div className="w-12 h-1.5 bg-[#25D366] rounded mt-1"></div>
                      </div>
                   </div>
                   <div className="flex-1 p-4 flex flex-col gap-3">
                      <div className="self-start w-3/4 h-12 bg-[#1F2C34] rounded-2xl rounded-bl-none"></div>
                      <div className="self-end w-2/3 h-12 bg-[#005C4B] rounded-2xl rounded-br-none"></div>
                      <div className="self-start w-1/2 h-10 bg-[#1F2C34] rounded-2xl rounded-bl-none"></div>
                   </div>
                   <div className="p-3 border-t border-gray-800 m-2 mt-auto bg-[#1F2C34] rounded-full"></div>
                </div>
             </div>
          </div>
        </div>
      </section>
      {/* Section 2: Trusted By & Features Grid */}
      <section className="w-full pt-12 pb-24 px-8 relative max-w-7xl mx-auto flex flex-col items-center">
        {/* Trusted By / Companies */}
        <div className="flex flex-col items-center gap-8 mb-24 w-full">
          <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
            JOIN 10K+ PROFESSIONALS WORLDWIDE
          </p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {['VOLT', 'AURORA', 'QUANTUM', 'NEBULA', 'VERTEX'].map((company) => (
              <span key={company} className="text-xl md:text-2xl font-bold tracking-wider text-gray-400">
                {company}
              </span>
            ))}
          </div>
        </div>

        {/* Features Header */}
        <div className="text-center max-w-3xl mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Built for the modern edge.
          </h2>
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
            Precision engineering meets minimalist design to provide the best secure chat experience on the planet.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Card 1 */}
          <div className="bg-[#1F2C34]/40 border border-white/5 p-8 rounded-2xl flex flex-col gap-4 hover:bg-[#1F2C34]/80 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] mb-2">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Unrivaled Security</h3>
            <p className="text-gray-400 leading-relaxed">
              Military-grade end-to-end encryption ensures your conversations stay yours. No backdoors, no compromises.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#1F2C34]/40 border border-white/5 p-8 rounded-2xl flex flex-col gap-4 hover:bg-[#1F2C34]/80 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] mb-2">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Blazing Speed</h3>
            <p className="text-gray-400 leading-relaxed">
              Optimized protocols deliver messages instantly, even on low-bandwidth connections across the globe.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#1F2C34]/40 border border-white/5 p-8 rounded-2xl flex flex-col gap-4 hover:bg-[#1F2C34]/80 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] mb-2">
              <RefreshCcw className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Universal Sync</h3>
            <p className="text-gray-400 leading-relaxed">
              Start a conversation on your phone and finish it on your desktop, seamlessly. Your data stays in sync.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
