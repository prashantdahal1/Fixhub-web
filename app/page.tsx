import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Grid background pattern */}
      <div className="absolute inset-0 bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,transparent,black)]" style={{
        backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(148, 163, 184, .05) 25%, rgba(148, 163, 184, .05) 26%, transparent 27%, transparent 74%, rgba(148, 163, 184, .05) 75%, rgba(148, 163, 184, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(148, 163, 184, .05) 25%, rgba(148, 163, 184, .05) 26%, transparent 27%, transparent 74%, rgba(148, 163, 184, .05) 75%, rgba(148, 163, 184, .05) 76%, transparent 77%, transparent)',
        backgroundSize: '50px 50px'
      }}></div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="font-bold text-white text-lg">FixHub</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-gray-300 hover:text-white text-sm">Services</a>
          <a href="#" className="text-gray-300 hover:text-white text-sm">Pricing</a>
          <a href="#" className="text-gray-300 hover:text-white text-sm">Pros</a>
          <a href="#" className="text-gray-300 hover:text-white text-sm flex items-center gap-1">
            More 
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="px-6 py-2 border border-blue-500 text-blue-400 rounded-full hover:bg-blue-500/10 text-sm font-medium transition">
            Login
          </Link>
          <Link href="/register" className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 text-sm font-medium transition">
            Join FixHub
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-blue-300 text-sm font-medium">New: Verified Plumbing Experts Available</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Fix Smarter. <span className="text-blue-400">Live Better.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-gray-400 text-lg mb-8 max-w-xl">
              Experience the future of home service with instant bookings, certified pros, and upfront pricing—all in your pocket.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-semibold transition">
                Schedule a Repair
              </button>
              <button className="px-8 py-3 border border-gray-600 text-gray-300 rounded-full hover:border-gray-500 hover:text-white font-semibold transition">
                Explore Services
              </button>
            </div>
          </div>

          {/* Right Content - Mock UI Cards */}
          <div className="relative hidden lg:block">
            {/* Home Status Card - Top Left */}
            <div className="absolute -left-8 top-0 bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 w-48 shadow-2xl">
              <div className="text-white text-sm font-semibold mb-3">Home Status</div>
              <div className="bg-blue-500 text-white rounded-full px-4 py-2 text-center text-sm font-bold">
                Home Running 100%
              </div>
            </div>

            {/* Pro Response Time - Bottom Left */}
            <div className="absolute -left-20 bottom-12 bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 w-48 shadow-2xl">
              <div className="text-white text-sm font-semibold mb-2">Pro Response (Avg.)</div>
              <div className="text-3xl font-bold text-white">12 min</div>
              <div className="text-gray-400 text-xs">Swift & Certified</div>
            </div>

            {/* Fixes Made Card - Top Right */}
            <div className="absolute -right-20 top-12 bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 w-56 shadow-2xl">
              <div className="text-white text-sm font-semibold mb-2">Fixes Made (This Year)</div>
              <div className="text-5xl font-bold text-white">142</div>
              <div className="text-gray-400 text-xs mt-2">Worry-free home ✓</div>
            </div>

            {/* Main Service Card - Center Right */}
            <div className="relative bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur border border-blue-400/30 rounded-2xl p-6 shadow-2xl">
              <div className="text-white text-sm font-semibold mb-4">Service in Progress</div>
              
              <div className="space-y-4">
                {/* Service Time */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">9:27</span>
                  <div className="flex gap-2">
                    <span className="text-gray-300">📶</span>
                    <span className="text-gray-300">🔋</span>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">AS</div>
                  <div>
                    <div className="text-white font-semibold text-sm">Asrrael Islam</div>
                    <div className="text-gray-400 text-xs">+91-XXXXX XXXXX</div>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white text-sm font-semibold mb-2">Home Hub, Asraquil</div>
                  <div className="bg-gray-800 rounded-lg h-24 flex items-center justify-center text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 003 16.382V5.618a1 1 0 01.553-.894l5.447-2.724a2 2 0 011.894 0l5.447 2.724A1 1 0 0121 5.618v10.764a1 1 0 01-.553.894L15 20M9 9h6m-6 4h6m6-7v6m0 0v6m0-6h6m-6 0h-6" />
                    </svg>
                  </div>
                </div>

                {/* Service Selection */}
                <div className="space-y-2">
                  <div className="text-white text-xs font-semibold text-gray-300 uppercase">Quick Select Services</div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white/5 hover:bg-white/10 rounded-lg py-2 px-2 text-center text-gray-300 text-xs cursor-pointer transition">Electrician</div>
                    <div className="flex-1 bg-white/5 hover:bg-white/10 rounded-lg py-2 px-2 text-center text-gray-300 text-xs cursor-pointer transition">Plumber</div>
                    <div className="flex-1 bg-white/5 hover:bg-white/10 rounded-lg py-2 px-2 text-center text-gray-300 text-xs cursor-pointer transition">General Handyman</div>
                    <div className="flex-1 bg-white/5 hover:bg-white/10 rounded-lg py-2 px-2 text-center text-gray-300 text-xs cursor-pointer transition">More</div>
                  </div>
                </div>
              </div>

              {/* Plumber Arriving Badge */}
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/50 rounded-full">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-300 text-xs font-medium">Plumber Arriving</span>
              </div>
            </div>

            {/* ProPass Badge - Bottom Right */}
            <div className="absolute -right-8 bottom-0 bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 w-40 shadow-2xl">
              <div className="text-white font-bold text-lg">FixHub ProPass</div>
              <div className="text-3xl font-bold text-blue-400 mt-2">42</div>
              <div className="text-gray-400 text-xs mt-2">Support in Priority</div>
            </div>

            {/* Star decoration */}
            <div className="absolute -right-12 top-1/2 transform -translate-y-1/2">
              <svg className="w-24 h-24 text-blue-400/10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2l-2.81 6.63L2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

