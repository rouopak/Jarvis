import { Canvas } from "@react-three/fiber";
import Particles from "../components/models/about/Particles";

const About = () => {
    return (
        <section id="about" className="relative overflow-hidden">
            <div className="absolute top-0 left-0 z-10">
                <img src="/images/bg.png" alt="" />
            </div>

            <div className="hero-layout">
                {/* LEFT: Hero Content */}
                <header className="flex flex-col justify-center md:w-full w-screen md:px-20 px-5">
                    <div className="flex flex-col gap-7">
                        <div className="hero-text">
                            <h1>
                                About Jarvis A.I
                            </h1>
                        </div>

                        <p className="text-white-50 md:text-xl relative z-10 pointer-events-none">
                            Jarvis A.I is a voice-controlled desktop assistant built in Python as a college project. You speak a command, it listens via Google Speech Recognition, processes it, and talks back using Google Text-to-Speech (gTTS). For general queries and conversations, it uses the Mistral AI API (mistral-small-latest) — replacing an earlier local Llama 2 7B implementation that was too heavy to run reliably. The core stack is Python, SpeechRecognition, gTTS, and Mistral AI, with built-in support for browser control, Windows file system navigation, and live Wikipedia lookups.
                        </p>

                    </div>
                </header>

                {/* RIGHT: 3D Model or Visual */}
                <figure>
                    <div className="hero-3d-layout" >
                        <Canvas>
                            <Particles />
                        </Canvas>
                    </div>

                </figure>

            </div>
        </section>
    );
};

export default About;
