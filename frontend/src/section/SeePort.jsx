import React from 'react'

const SeePort = () => {
    return (
        <section id="work" className="w-full min-h-screen bg-[#0e0e11] py-20 flex flex-col items-center justify-center text-white">
            <div className="w-full max-w-5xl px-5 flex flex-col items-center text-center gap-8">
                {/* Badge and Title */}
                <div className="flex flex-col items-center gap-3">
                    <div className="bg-[#1a1a1a]/80 backdrop-blur-md px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 border border-white/10 text-white">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                        Featured Work
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mt-2">See My Portfolio Website</h2>
                </div>

                {/* Redirect Link & Image Container */}
                <a 
                    href="https://rupakportfolio-eight.vercel.app/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="group w-full block rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-indigo-500/40"
                >
                    <div className="relative aspect-[16/10] md:aspect-[16/9] w-full overflow-hidden bg-[#181818]">
                        <img 
                            src="/images/portfolioImg.png" 
                            alt="Portfolio Website Preview" 
                            className="w-full h-full object-cover filter saturate-30 group-hover:saturate-100 group-hover:scale-[1.03] transition-all duration-700 ease-in-out" 
                        />
                    </div>
                </a>

                {/* Description Text below the image */}
                <div className="max-w-3xl mt-4">
                    <p className="text-[#a0a0a0] text-sm md:text-base leading-relaxed">
                        "Check out my 3D interactive portfolio website, built with React, Three.js, and GSAP. It features real-time 3D models, smooth scroll animations, and a dynamic timeline showcasing my projects, hackathon wins, and professional journey."
                    </p>
                </div>
            </div>
        </section>
    )
}

export default SeePort;