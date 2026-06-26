import React, { useState, useEffect } from 'react'
import ChatBox from '../components/ChatBox'

const Hero = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [messages, setMessages] = useState([]);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 768px)");
        setIsMobile(mediaQuery.matches);
        const handleMediaQueryChange = (event) => setIsMobile(event.matches);
        mediaQuery.addEventListener("change", handleMediaQueryChange);
        return () => mediaQuery.removeEventListener("change", handleMediaQueryChange);
    }, []);

    const glowRef = React.useRef(null);

    useEffect(() => {
        // Initial setup for transform string performance
        let currentX = window.innerWidth / 2;
        let currentY = window.innerHeight / 2;
        let animationFrameId;

        if (glowRef.current) {
            glowRef.current.style.transform = `translate3d(calc(${currentX}px - 50%), calc(${currentY}px - 50%), 0)`;
        }

        const handleMouseMove = (e) => {
            currentX = e.clientX;
            currentY = e.clientY;

            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(() => {
                    if (glowRef.current) {
                        glowRef.current.style.transform = `translate3d(calc(${currentX}px - 50%), calc(${currentY}px - 50%), 0)`;
                    }
                    animationFrameId = null;
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const recognitionRef = React.useRef(null);

    const startListening = () => {
        // Unlock SpeechSynthesis for mobile browsers on user gesture
        if ('speechSynthesis' in window) {
            try {
                const silentUtterance = new SpeechSynthesisUtterance(' ');
                silentUtterance.volume = 0;
                window.speechSynthesis.speak(silentUtterance);
            } catch (e) {
                console.warn("Speech synthesis unlock failed:", e);
            }
        }

        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setStatusText("Browser not supported. Try Chrome or Edge.");
            return;
        }

        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            return;
        }

        const startRecognitionOnly = () => {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;

            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setIsListening(true);
                setStatusText("Listening...");
            };

            recognition.onresult = async (event) => {
                const transcript = event.results[0][0].transcript;

                try {
                    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

                    setStatusText("Thinking...");
                    const response = await fetch(`${backendUrl}/api/query`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: transcript })
                    });

                    const data = await response.json();
                    if (data.response) {
                        setMessages(prev => [...prev, { role: 'user', content: transcript }, { role: 'ai', content: data.response }]);
                        setStatusText("");
                        speakResponse(data.response);
                    } else {
                        setStatusText("Error getting response from Jarvis.");
                    }
                } catch (error) {
                    console.error("Backend error:", error);
                    setStatusText("Backend network error.");
                }
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                if (event.error === 'network') {
                    setStatusText("Network error. (Brave blocks this API. Please try Chrome!)");
                } else {
                    setStatusText(`Error: ${event.error}`);
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
                if (statusText === "Listening...") {
                    setStatusText("Tap to speak");
                }
            };

            recognition.start();
        };

        if (!showChat) {
            setShowChat(true);
            const greeting = "Hello i am Jarvis, give me sometime to connect to my Brain, till then bet your house on stake";
            setMessages([{ role: 'ai', content: greeting }]);
            setStatusText("Speaking...");
            speakResponse(greeting, () => {
                startRecognitionOnly();
            });
        } else {
            startRecognitionOnly();
        }
    };

    const speakResponse = (text, onEndCallback) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any current speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            // Try to find a good English voice
            const voices = window.speechSynthesis.getVoices();
            const englishVoice = voices.find(v => v.lang.startsWith('en-') && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('en-'));
            if (englishVoice) {
                utterance.voice = englishVoice;
            }
            if (onEndCallback) {
                utterance.onend = onEndCallback;
                utterance.onerror = onEndCallback; // fallback in case of synthesis block/error
            }
            window.speechSynthesis.speak(utterance);
        } else if (onEndCallback) {
            onEndCallback();
        }
    };

    const clearAndCloseChat = () => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { }
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setMessages([]);
        setShowChat(false);
        setStatusText("");
        setIsListening(false);
    };

    return (
        <section id="hero" className="relative w-full h-screen bg-[#0e0e11] overflow-hidden flex flex-col items-center justify-center font-inter">
            {/* Ambient Background Blur */}
            <div
                ref={glowRef}
                className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-500/40 rounded-full blur-[100px] opacity-65 pointer-events-none will-change-transform"
                style={{
                    transform: 'translate3d(calc(50vw - 50%), calc(50vh - 50%), 0)',
                }}
            />

            {/* Main Content Area */}
            <div className={`relative z-10 w-full max-w-6xl mx-auto px-4 flex items-center justify-center transition-all duration-700 ease-in-out ${showChat ? 'flex-col md:flex-row gap-8 md:gap-12' : 'flex-col'}`}>

                {!showChat && (
                    <div className="max-w-2xl w-full mx-auto mb-8 px-4 z-50">
                        <h6 className="bg-[#18181c]/90 text-white/80 text-sm font-medium px-6 py-4 rounded-2xl border border-white/10 shadow-lg text-center backdrop-blur-md leading-relaxed">
                            {isMobile
                                ? "Note: For the best experience on mobile, please use Safari (iOS) or Chrome (Android) and ensure microphone access is allowed."
                                : "Note: This site has some restrictions on speech recognition. Use Chrome or Edge for the best experience. Also, on first use, the AI response may take 50+ seconds as the backend wakes up."
                            }
                        </h6>
                    </div>
                )}

                {/* Text Elements (Hides when chat is active) */}
                <div className={`text-center w-full transition-all duration-500 pointer-events-none ${showChat ? 'opacity-0 h-0 overflow-hidden scale-95 absolute' : 'opacity-100 h-auto scale-100 mb-8 md:mb-16 relative'}`}>
                    <h1 className="text-[36px] md:text-[44px] font-semibold text-white tracking-tight">Tap to speak</h1>
                    <p className="mt-3 md:mt-5 text-[10px] md:text-[11px] font-bold text-gray-400 tracking-[0.3em] uppercase">
                        The Quiet Intelligence
                    </p>
                </div>

                {/* Microphone Button */}
                <div className={`flex justify-center transition-all duration-700 flex-shrink-0 z-20 ${showChat ? 'order-first' : ''}`}>
                    <button
                        onClick={startListening}
                        className={`relative flex items-center justify-center bg-[#25252b] rounded-full transition-all duration-500 shadow-[0_0_40px_rgba(0,0,0,0.5)] group cursor-pointer ${isListening ? 'scale-110 shadow-[0_0_60px_rgba(99,102,241,0.6)] border-2 border-indigo-500' : 'hover:bg-[#2c2c34]'} ${showChat ? 'w-24 h-24 md:w-40 md:h-40' : 'w-32 h-32 md:w-36 md:h-36'}`}
                    >
                        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <svg width={showChat ? (isMobile ? "36" : "48") : "40"} height={showChat ? (isMobile ? "36" : "48") : "40"} viewBox="0 0 24 24" fill="none" stroke={isListening ? "#ffffff" : "#a79fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`relative z-10 transition-all duration-500 ${isListening ? 'animate-pulse' : ''}`}>
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" x2="12" y1="19" y2="22" />
                        </svg>
                    </button>
                </div>

                {/* ChatBox (Only shows when active) */}
                <div className={`w-full md:flex-1 transition-all duration-700 ease-in-out z-10 ${showChat ? 'opacity-100 h-[50vh] md:h-[70vh] relative' : 'opacity-0 h-0 w-0 overflow-hidden absolute pointer-events-none'}`}>
                    <div className="w-full h-full">
                        <ChatBox messages={messages} statusText={statusText} onClose={clearAndCloseChat} />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero