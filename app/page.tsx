import Link from 'next/link';
import { Play, Shield, Zap, RefreshCcw, ShieldCheck, EyeOff, Mic, Video } from 'lucide-react';
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
      {/* Section 3: Privacy & HD Calls */}
      <section className="w-full py-24 px-8 relative max-w-7xl mx-auto flex flex-col gap-32">
        {/* Privacy Row */}
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="w-full max-w-md aspect-[4/3] rounded-2xl bg-[#1F2C34]/30 border border-white/5 flex items-center justify-center">
              <Shield className="w-32 h-32 text-[#25D366]/20 stroke-[1]" />
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col items-start gap-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Privacy First, Always.</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Our proprietary encryption protocol ensures that your messages, files, and calls are visible only to you and your recipient. Not even ChatSphere can access your data.
            </p>
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#25D366]" />
                <span className="text-gray-200 font-medium">Zero-knowledge architecture</span>
              </div>
              <div className="flex items-center gap-3">
                <EyeOff className="w-5 h-5 text-[#25D366]" />
                <span className="text-gray-200 font-medium">Self-destructing messages</span>
              </div>
            </div>
          </div>
        </div>

        {/* HD Calls Row */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-16">
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="w-full max-w-md aspect-[4/3] rounded-2xl bg-[#1F2C34]/30 border border-white/5 flex items-center justify-center">
              {/* Custom SVG for waveform */}
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#25D366]/20 stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0s3 1.5 4.5 0" />
                <path d="M4 8c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0s3 1.5 4.5 0" />
                <path d="M4 16c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0s3 1.5 4.5 0" />
              </svg>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col items-start gap-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Crystal Clear HD Calls.</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Experience low-latency voice and video calls that feel like you're in the same room. Optimized for unstable networks so you never drop a beat.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1F2C34] border border-white/10">
                <Mic className="w-4 h-4 text-[#25D366]" />
                <span className="text-sm font-semibold text-gray-200 uppercase tracking-wide">High Audio</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1F2C34] border border-white/10">
                <Video className="w-4 h-4 text-[#25D366]" />
                <span className="text-sm font-semibold text-gray-200 uppercase tracking-wide">4K Video</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Section 4: Stats Banner & Testimonials */}
      <section className="w-full mt-12 flex flex-col">
        {/* Stats Banner */}
        <div className="w-full bg-[#25D366] py-16 px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            <div className="flex flex-col gap-2">
              <h4 className="text-4xl md:text-5xl font-black text-[#0B141A] tracking-tighter">10M+</h4>
              <p className="text-[#0B141A] font-semibold text-sm tracking-widest uppercase">Active Users</p>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-4xl md:text-5xl font-black text-[#0B141A] tracking-tighter">99.9%</h4>
              <p className="text-[#0B141A] font-semibold text-sm tracking-widest uppercase">Uptime</p>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-4xl md:text-5xl font-black text-[#0B141A] tracking-tighter">24/7</h4>
              <p className="text-[#0B141A] font-semibold text-sm tracking-widest uppercase">Global Support</p>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-4xl md:text-5xl font-black text-[#0B141A] tracking-tighter">190+</h4>
              <p className="text-[#0B141A] font-semibold text-sm tracking-widest uppercase">Countries</p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="w-full py-32 px-8 bg-gradient-to-b from-[#0B141A] to-[#111B21]">
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center">
              Trusted by teams everywhere.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {/* Testimonial 1 */}
              <div className="bg-[#1F2C34]/40 border border-white/5 p-8 rounded-2xl flex flex-col justify-between gap-8">
                <p className="text-lg text-gray-300 italic leading-relaxed">
                  "The fastest messaging app we've ever used. The sync between mobile and desktop is flawless."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-600"></div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white">Sarah Chen</span>
                    <span className="text-xs font-bold text-[#25D366] uppercase tracking-wider">CTO, AURORA TECH</span>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-[#1F2C34]/40 border border-white/5 p-8 rounded-2xl flex flex-col justify-between gap-8">
                <p className="text-lg text-gray-300 italic leading-relaxed">
                  "Security isn't just a feature here, it's the foundation. Our legal team trusts them at scale."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-600"></div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white">Marcus Thorne</span>
                    <span className="text-xs font-bold text-[#25D366] uppercase tracking-wider">DIRECTOR, VERTEX CORP</span>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-[#1F2C34]/40 border border-white/5 p-8 rounded-2xl flex flex-col justify-between gap-8">
                <p className="text-lg text-gray-300 italic leading-relaxed">
                  "Minimalist, powerful, and incredibly reliable. ChatSphere has replaced three other tools for us."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-600"></div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white">Elena Rodriguez</span>
                    <span className="text-xs font-bold text-[#25D366] uppercase tracking-wider">VP ENGINEERING, NEBULA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Section 5: Compliance, Bottom CTA & Footer */}
      <section className="w-full bg-[#0B141A] pt-16 flex flex-col items-center">
        {/* Compliance */}
        <div className="flex flex-col items-center gap-6 mb-32 w-full px-8">
          <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
            MEETS GLOBAL STANDARDS
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {['SOC2 TYPE II', 'GDPR READY', 'HIPAA', 'ISO 27001'].map((standard) => (
              <span key={standard} className="text-sm md:text-base font-bold tracking-widest text-gray-400">
                {standard}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="w-full max-w-5xl px-8 mb-32">
          <div className="w-full bg-[#1F2C34]/80 border border-white/5 rounded-[2.5rem] p-12 md:p-20 flex flex-col items-center text-center gap-8 relative overflow-hidden">
            {/* Background glowing effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[#25D366]/5 blur-[100px] pointer-events-none"></div>
            
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight z-10">
              Ready to join the sphere?
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl z-10">
              Join millions of users who trust ChatSphere for their most important conversations.
            </p>
            <Link href="/register" className="z-10 mt-4">
              <Button className="bg-[#25D366] hover:bg-[#1EBE58] text-black font-semibold rounded-full px-10 py-7 text-lg h-auto shadow-[0_0_30px_rgba(37,211,102,0.2)] transition-all hover:scale-105">
                Create Your Free Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full border-t border-white/10 pt-20 pb-8 px-8">
          <div className="max-w-7xl mx-auto flex flex-col gap-16">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 lg:gap-8">
              
              {/* Brand Col */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <span className="text-[#25D366] font-bold text-2xl tracking-tight">ChatSphere</span>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                  The global standard for secure, seamless communication for individuals and enterprises alike.
                </p>
                <div className="flex items-center gap-4 mt-2">
                  {/* Placeholder social icons */}
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer text-gray-400 hover:text-white">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer text-gray-400 hover:text-white">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer text-gray-400 hover:text-white">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  </div>
                </div>
              </div>

              {/* Link Cols */}
              <div className="flex flex-col gap-6">
                <h5 className="font-bold text-xs tracking-widest text-[#25D366] uppercase">PRODUCT</h5>
                <div className="flex flex-col gap-4 text-sm text-gray-400">
                  <Link href="#" className="hover:text-white transition-colors">Features</Link>
                  <Link href="#" className="hover:text-white transition-colors">Download</Link>
                  <Link href="#" className="hover:text-white transition-colors">Web App</Link>
                  <Link href="#" className="hover:text-white transition-colors">iOS / Android</Link>
                  <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <h5 className="font-bold text-xs tracking-widest text-[#25D366] uppercase">RESOURCES</h5>
                <div className="flex flex-col gap-4 text-sm text-gray-400">
                  <Link href="#" className="hover:text-white transition-colors">Help Center</Link>
                  <Link href="#" className="hover:text-white transition-colors">Community</Link>
                  <Link href="#" className="hover:text-white transition-colors">Blog</Link>
                  <Link href="#" className="hover:text-white transition-colors">Security Whitepaper</Link>
                  <Link href="#" className="hover:text-white transition-colors">Status</Link>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <h5 className="font-bold text-xs tracking-widest text-[#25D366] uppercase">COMPANY</h5>
                <div className="flex flex-col gap-4 text-sm text-gray-400">
                  <Link href="#" className="hover:text-white transition-colors">About Us</Link>
                  <Link href="#" className="hover:text-white transition-colors">Careers</Link>
                  <Link href="#" className="hover:text-white transition-colors">Press</Link>
                  <Link href="#" className="hover:text-white transition-colors">Contact</Link>
                </div>
              </div>

              <div className="lg:col-span-2 flex flex-col gap-6">
                <h5 className="font-bold text-xs tracking-widest text-[#25D366] uppercase">NEWSLETTER</h5>
                <p className="text-sm text-gray-400">
                  Stay updated on our latest releases.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <input 
                    type="email" 
                    placeholder="Email" 
                    className="bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#25D366]/50 focus:ring-1 focus:ring-[#25D366]/50 w-full transition-all"
                  />
                  <button className="bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center shrink-0 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5 text-xs text-gray-500">
              <p>© ChatSphere Inc. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <Link href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
                <Link href="#" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
                <Link href="#" className="hover:text-gray-300 transition-colors">AUP</Link>
              </div>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );  
}
