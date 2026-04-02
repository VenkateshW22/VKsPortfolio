import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValue, MotionValue, useAnimationFrame } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, PerspectiveCamera, useTexture, Html, Stars } from '@react-three/drei';
import Tilt from 'react-parallax-tilt';
import confetti from 'canvas-confetti';
import { 
  Github, 
  Linkedin, 
  Mail, 
  MapPin, 
  Phone, 
  ExternalLink, 
  Code2, 
  Briefcase, 
  GraduationCap, 
  Trophy, 
  BookOpen,
  ChevronRight,
  Terminal,
  Cpu,
  Zap,
  Award,
  Send,
  ArrowRight,
  Layers,
  Database,
  Cloud,
  Monitor,
  Globe
} from 'lucide-react';
import { cn } from './lib/utils';

import { GoogleGenAI } from "@google/genai";
import { Howl } from 'howler';

// --- Sound FX Service ---
const sounds = {
  click: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'], volume: 0.2 }),
  hover: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'], volume: 0.1 }),
  glitch: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'], volume: 0.2 }),
  success: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3'], volume: 0.3 }),
  startup: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'], volume: 0.4 }),
};

const playSound = (name: keyof typeof sounds) => {
  try {
    sounds[name].play();
  } catch (e) {
    console.warn('Audio playback failed', e);
  }
};

// --- AI Service ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = "gemini-3-flash-preview";

const getAIResponse = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [{ text: `You are Venkatesh K's personal AI assistant. 
          Venkatesh is a Full Stack Software Engineer and Technical Trainer.
          He has worked at Oracle and is currently a Technical Trainer at Chandigarh University.
          He is an expert in Spring Boot, React, and Microservices.
          Keep your answers short, professional, and slightly futuristic/cyberpunk.
          Answer this question about him: ${prompt}` }]
        }
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 150,
      }
    });
    return response.text;
  } catch (error) {
    console.error('AI Error:', error);
    return "SYSTEM_ERROR: Connection to Neural Link failed. Please try again.";
  }
};

// --- Error Boundary ---
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
          <div className="glass-card p-10 rounded-[2rem] border-red-500/20 max-w-md">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Neural Link Severed</h2>
            <p className="text-slate-400 mb-6">A critical system error has occurred. The interface has been compromised.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500 transition-all"
            >
              Reboot System
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Components ---

const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 bg-cyan-500/30 rounded-full pointer-events-none z-[9999] backdrop-blur-sm border border-cyan-500/50"
      style={{
        translateX: cursorXSpring,
        translateY: cursorYSpring,
        x: '-50%',
        y: '-50%',
      }}
    />
  );
};

const TextReveal = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const InteractiveGrid = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const background = useTransform(
    [mouseX, mouseY],
    ([x, y]: any) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(6, 182, 212, 0.15), transparent 80%)`
  );

  return (
    <motion.div 
      ref={containerRef}
      className="absolute inset-0 z-0 pointer-events-none opacity-50"
      style={{ background }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
    </motion.div>
  );
};

const GlitchText = ({ text }: { text: string }) => {
  return (
    <div className="relative group cursor-default">
      <span className="relative z-10">{text}</span>
      <span className="absolute inset-0 text-cyan-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-75 mix-blend-screen">
        {text}
      </span>
      <span className="absolute inset-0 text-purple-500 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 group-hover:translate-y-1 transition-all duration-75 mix-blend-screen">
        {text}
      </span>
    </div>
  );
};

const MagneticSkill = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    
    x.set(distanceX * 0.3);
    y.set(distanceY * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:border-white/30 transition-colors cursor-default inline-block"
    >
      {children}
    </motion.span>
  );
};

const FloatingParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseX: number;
      baseY: number;
    }> = [];

    let mouse = { x: -1000, y: -1000 };
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const numParticles = Math.min(Math.floor(window.innerWidth * window.innerHeight / 15000), 100);
      for (let i = 0; i < numParticles; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach((p, i) => {
        // Normal movement
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Mouse repulsion physics
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          p.x -= (dx / distance) * force * 2;
          p.y -= (dy / distance) * force * 2;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)'; // Cyan-500 with opacity
        ctx.fill();

        // Draw connecting lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx2 = p.x - p2.x;
          const dy2 = p.y - p2.y;
          const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

          if (distance2 < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.15 * (1 - distance2 / 100)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1]"
    />
  );
};

const HUD = () => {
  const [uptime, setUptime] = useState(0);
  const [latency, setLatency] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(prev => prev + 1);
      setLatency(Math.floor(Math.random() * 20) + 5);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 p-6 hidden md:block">
      {/* Top Left: System Status */}
      <div className="absolute top-6 left-6 flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-500/50">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          SYSTEM_ONLINE_v4.2.0
        </div>
        <div className="text-[10px] font-mono text-slate-500">
          UPTIME: {Math.floor(uptime / 60)}m {uptime % 60}s
        </div>
      </div>

      {/* Top Right: Network Status */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-1">
        <div className="text-[10px] font-mono text-purple-500/50">
          LATENCY: {latency}ms
        </div>
        <div className="text-[10px] font-mono text-slate-500">
          LOC: 12.9716° N, 77.5946° E
        </div>
      </div>

      {/* Bottom Left: Tech Load */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-2">
        <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-cyan-500"
            animate={{ width: ["20%", "80%", "40%", "90%", "60%"] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>
        <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">
          Neural_Link_Load
        </div>
      </div>

      {/* Corners Visuals */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-cyan-500/20" />
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-cyan-500/20" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-cyan-500/20" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-cyan-500/20" />
    </div>
  );
};

const AITerminal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Venkatesh.OS AI Assistant initialized. How can I assist your query?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    playSound('click');

    const aiResponse = await getAIResponse(userMsg);
    setHistory(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setIsTyping(false);
    playSound('success');
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onMouseEnter={() => playSound('hover')}
        onClick={() => {
          setIsOpen(!isOpen);
          playSound('startup');
        }}
        aria-label="Open AI Terminal"
        className="fixed bottom-8 right-8 z-[100] w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/50 border border-cyan-400/50 group"
      >
        <Terminal size={28} className="group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-28 right-8 z-[100] w-[350px] md:w-[400px] h-[500px] glass-card rounded-[2rem] border-white/10 flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="font-mono text-xs font-bold tracking-widest text-cyan-400">VENKATESH_AI_v1.0</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <ChevronRight size={20} className="rotate-90" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-xs scrollbar-hide">
              {history.map((msg, i) => (
                <div key={i} className={cn(
                  "p-3 rounded-xl max-w-[85%]",
                  msg.role === 'user' ? "bg-cyan-500/10 text-cyan-400 ml-auto" : "bg-white/5 text-slate-300"
                )}>
                  <div className="text-[10px] opacity-50 mb-1 uppercase tracking-tighter">
                    {msg.role === 'user' ? 'QUERY' : 'RESPONSE'}
                  </div>
                  {msg.text}
                </div>
              ))}
              {isTyping && (
                <div className="bg-white/5 text-slate-300 p-3 rounded-xl w-fit animate-pulse">
                  SYSTEM: Processing neural data...
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 bg-white/5 border-t border-white/10">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about Venkatesh..."
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 pr-12 text-xs font-mono focus:border-cyan-500 outline-none transition-all"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-500 hover:text-cyan-400">
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- 3D Components ---
const CyberCore = () => {
  const coreRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  
  useFrame((state) => {
    if (coreRef.current) {
      // Base rotation
      coreRef.current.rotation.y += 0.005;
      coreRef.current.rotation.z += 0.002;

      // Mouse interaction
      targetRotation.current.x = (state.pointer.y * Math.PI) / 4;
      targetRotation.current.y = (state.pointer.x * Math.PI) / 4;

      // Smooth interpolation towards target rotation
      coreRef.current.rotation.x += (targetRotation.current.x - coreRef.current.rotation.x) * 0.1;
      coreRef.current.rotation.y += (targetRotation.current.y - coreRef.current.rotation.y) * 0.1;
    }
  });

  return (
    <group ref={coreRef}>
      {/* Inner Sphere */}
      <Sphere args={[1, 64, 64]} scale={1.2}>
        <MeshDistortMaterial
          color="#06b6d4"
          distort={0.4}
          speed={2}
          roughness={0}
          metalness={1}
          emissive="#06b6d4"
          emissiveIntensity={0.5}
        />
      </Sphere>

      {/* Rotating Rings */}
      {[...Array(3)].map((_, i) => (
        <mesh key={i} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
          <torusGeometry args={[1.8 + i * 0.3, 0.02, 16, 100]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} transparent opacity={0.3} />
        </mesh>
      ))}

      {/* Floating Nodes */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 2.5;
        return (
          <mesh key={`node-${i}`} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2} />
          </mesh>
        );
      })}
    </group>
  );
};

const Skills3DScene = () => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Generate random points in a sphere
  const particlesCount = 3000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for(let i = 0; i < particlesCount * 3; i+=3) {
      const r = 12 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i] = r * Math.sin(phi) * Math.cos(theta);
      pos[i+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i+2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  const colors = useMemo(() => {
    const col = new Float32Array(particlesCount * 3);
    for(let i = 0; i < particlesCount * 3; i+=3) {
      const isCyan = Math.random() > 0.5;
      col[i] = isCyan ? 0.02 : 0.66; // R
      col[i+1] = isCyan ? 0.71 : 0.33; // G
      col[i+2] = isCyan ? 0.83 : 0.97; // B
    }
    return col;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particlesCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.08} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
};

const Skills3DBackground = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <Skills3DScene />
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,1)_80%)]" />
    </div>
  );
};

// --- Tech Vortex Components ---

const TechNode = ({ position, name, icon, color }: { position: [number, number, number], name: string, icon: string, color: string }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.lookAt(state.camera.position);
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.005;
    }
  });

  const hexColor = color.replace('#', '');

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh 
          ref={meshRef}
          onPointerOver={() => { setHovered(true); playSound('hover'); }}
          onPointerOut={() => setHovered(false)}
        >
          <planeGeometry args={[1.2, 1.2]} />
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={0.1} 
            side={THREE.DoubleSide}
            metalness={1}
            roughness={0}
          />
          
          {/* Border mesh */}
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <ringGeometry args={[0.8, 0.85, 4]} />
            <meshBasicMaterial color={color} transparent opacity={hovered ? 0.8 : 0.2} />
          </mesh>

          <Html distanceFactor={10} center transform>
            <motion.div 
              animate={{ 
                scale: hovered ? 1.2 : 1,
                opacity: hovered ? 1 : 0.7
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border backdrop-blur-xl transition-all duration-500",
                hovered ? "bg-white/10 border-white/40 shadow-[0_0_30px_rgba(6,182,212,0.3)]" : "bg-black/40 border-white/5"
              )}
            >
              <img 
                src={`https://cdn.simpleicons.org/${icon}`} 
                alt={name}
                onError={(e) => {
                  e.currentTarget.src = `https://cdn.simpleicons.org/simpleicons/ffffff`;
                }}
                className="w-10 h-10 md:w-12 md:h-12 object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                referrerPolicy="no-referrer"
              />
              <div className="text-[8px] md:text-[10px] font-mono text-white font-black uppercase tracking-widest text-center">
                {name}
              </div>
            </motion.div>
          </Html>
        </mesh>
      </Float>
    </group>
  );
};

const TechVortex = ({ scrollProgress }: { scrollProgress: MotionValue<number> }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Faster movement through the vortex
  const zPos = useTransform(scrollProgress, [0, 1], [0, 200]);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.z = zPos.get();
      // Subtle rotation of the whole vortex
      groupRef.current.rotation.z += 0.001;
    }
  });

  const allSkills = useMemo(() => {
    const skills: any[] = [];
    SKILLS_BENTO.forEach((category) => {
      category.skills.forEach((skill) => {
        skills.push({
          ...skill,
          color: category.color === 'cyan' ? '#06b6d4' : category.color === 'purple' ? '#a855f7' : category.color === 'blue' ? '#3b82f6' : '#6366f1'
        });
      });
    });
    return skills;
  }, []);

  return (
    <group ref={groupRef}>
      {allSkills.map((skill, i) => {
        // Vortex / Tornado layout
        const angle = i * 0.5;
        const radius = 6 + Math.sin(i * 0.3) * 3;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = -i * 6;
        
        return (
          <TechNode 
            key={`${skill.name}-${i}`}
            position={[x, y, z]}
            name={skill.name}
            icon={skill.icon}
            color={skill.color}
          />
        );
      })}
      
      {/* Neural Pathways (Lines connecting nodes) */}
      {[...Array(allSkills.length - 1)].map((_, i) => {
        const angle1 = i * 0.5;
        const radius1 = 6 + Math.sin(i * 0.3) * 3;
        const z1 = -i * 6;
        
        const angle2 = (i + 1) * 0.5;
        const radius2 = 6 + Math.sin((i + 1) * 0.3) * 3;
        const z2 = -(i + 1) * 6;

        return (
          <mesh key={`line-${i}`} position={[0, 0, (z1 + z2) / 2]}>
            <cylinderGeometry args={[0.01, 0.01, 6, 8]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.05} />
          </mesh>
        );
      })}
    </group>
  );
};

const TechStackExperience = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-slate-950" id="techstack">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute top-12 left-0 w-full z-20 pointer-events-none">
          <TextReveal className="text-center">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              TECH VORTEX
            </h2>
          </TextReveal>
          <p className="text-center text-slate-500 mt-4 font-mono text-xs uppercase tracking-[0.5em]">
            Neural Network of Expertise
          </p>
        </div>
        
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <TechVortex scrollProgress={scrollYProgress} />
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={1} fade speed={2} />
        </Canvas>

        {/* HUD Overlay for Tech Stack */}
        <div className="absolute bottom-12 left-12 z-30 hidden lg:block">
          <div className="glass-card p-6 rounded-2xl border-cyan-500/20 max-w-xs bg-slate-950/50 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Neural_Map_v2.0</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore the clusters of technologies that power my engineering ecosystem. 
              Each node represents a verified skill in production environments.
            </p>
          </div>
        </div>

        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 pointer-events-none" />
      </div>
    </section>
  );
};

const DataStream = ({ count = 30 }: { count?: number }) => {
  const points = useMemo(() => {
    const p = [];
    for (let i = 0; i < count; i++) {
      p.push({
        x: (Math.random() - 0.5) * 25,
        y: (Math.random() - 0.5) * 25,
        z: -Math.random() * 200,
        speed: 0.8 + Math.random() * 2.5,
        length: 5 + Math.random() * 15
      });
    }
    return p;
  }, [count]);

  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        child.position.z += points[i].speed;
        if (child.position.z > 10) {
          child.position.z = -200;
        }
      });
    }
  });

  return (
    <group ref={ref}>
      {points.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <boxGeometry args={[0.03, 0.03, p.length]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#06b6d4" : "#a855f7"} transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
};

const Journey3DScene = ({ scrollProgress }: { scrollProgress: MotionValue<number> }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      // Smoothly interpolate the z position to fly through the tunnel
      groupRef.current.position.z = scrollProgress.get() * 120;
    }
  });

  return (
    <group ref={groupRef}>
      <DataStream />
      {/* Cyberpunk Tunnel Rings */}
      {[...Array(60)].map((_, i) => {
        const z = -i * 2;
        const scale = 1 + Math.sin(i * 0.5) * 0.2;
        return (
          <mesh key={`ring-${i}`} position={[0, 0, z]} scale={[scale, scale, 1]}>
            <torusGeometry args={[10, 0.02, 16, 100]} />
            <meshBasicMaterial 
              color={i % 3 === 0 ? "#a855f7" : "#06b6d4"} 
              transparent 
              opacity={0.1 + (Math.random() * 0.1)} 
            />
          </mesh>
        );
      })}

      {/* Experience Cards as 3D HTML overlays */}
      {EXPERIENCE.map((exp, idx) => {
        const zPos = -20 - idx * 35;
        const xPos = idx % 2 === 0 ? 5 : -5;
        const rotationY = idx % 2 === 0 ? -0.15 : 0.15;
        
        return (
          <group key={`exp-${idx}`} position={[xPos, 0, zPos]} rotation={[0, rotationY, 0]}>
            <Html transform distanceFactor={15} center>
              <div className="w-[90vw] max-w-[600px] glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border-cyan-500/40 hover:border-cyan-400 transition-all duration-500 shadow-[0_0_40px_rgba(6,182,212,0.2)] hover:shadow-[0_0_60px_rgba(6,182,212,0.4)] bg-slate-950/90 backdrop-blur-2xl">
                <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 text-6xl md:text-8xl font-black text-white/5 pointer-events-none">
                  0{idx + 1}
                </div>
                <div className="inline-block px-3 py-1 md:px-4 md:py-1.5 mb-4 md:mb-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[10px] md:text-sm">
                  {exp.period}
                </div>
                <h3 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">{exp.role}</h3>
                <p className="text-purple-400 font-bold text-lg md:text-xl mb-4 md:mb-8">{exp.company}</p>
                
                <div className="flex flex-wrap gap-2 mb-4 md:mb-8">
                  {exp.metrics.map(m => (
                    <span key={m} className="px-2 py-1 md:px-3 md:py-1.5 bg-white/5 text-slate-300 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider border border-white/10">
                      {m}
                    </span>
                  ))}
                </div>

                <ul className="space-y-2 md:space-y-4">
                  {exp.points.map((p, i) => (
                    <li key={i} className="flex gap-2 md:gap-4 text-slate-300 text-sm md:text-base leading-relaxed">
                      <ChevronRight size={16} className="mt-1 text-cyan-500 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

const ExperienceSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-slate-950" id="experience">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute top-12 left-0 w-full z-20 pointer-events-none">
          <TextReveal className="text-center">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              THE JOURNEY
            </h2>
          </TextReveal>
        </div>
        
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <Journey3DScene scrollProgress={scrollYProgress} />
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={1} fade speed={2} />
        </Canvas>

        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 pointer-events-none" />
      </div>
    </section>
  );
};

const ProjectVisual = ({ color }: { color: string }) => {
  const hexColor = color === 'cyan' ? '#06b6d4' : color === 'purple' ? '#a855f7' : color === 'blue' ? '#3b82f6' : '#6366f1';

  return (
    <div className="w-full h-full bg-slate-900/50">
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Float speed={3} rotationIntensity={1.5} floatIntensity={1.5}>
          <mesh>
            {color === 'cyan' ? <icosahedronGeometry args={[1.2, 2]} /> :
             color === 'purple' ? <torusKnotGeometry args={[0.8, 0.3, 128, 32]} /> :
             color === 'blue' ? <octahedronGeometry args={[1.2, 2]} /> :
             <dodecahedronGeometry args={[1.2, 2]} />}
            <MeshDistortMaterial 
              color={hexColor} 
              roughness={0.1} 
              metalness={0.8}
              emissive={hexColor}
              emissiveIntensity={0.5}
              distort={0.4}
              speed={2}
            />
          </mesh>
          {/* Add a wireframe layer for extra detail */}
          <mesh>
            {color === 'cyan' ? <icosahedronGeometry args={[1.25, 2]} /> :
             color === 'purple' ? <torusKnotGeometry args={[0.85, 0.35, 128, 32]} /> :
             color === 'blue' ? <octahedronGeometry args={[1.25, 2]} /> :
             <dodecahedronGeometry args={[1.25, 2]} />}
            <meshBasicMaterial 
              color={hexColor} 
              wireframe 
              transparent 
              opacity={0.1}
            />
          </mesh>
        </Float>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={4} />
      </Canvas>
    </div>
  );
};

const DetailedGlobe = () => {
  const [colorMap, normalMap, specularMap, cloudsMap] = useTexture([
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
  ]);

  const globeRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group scale={1.2}>
      {/* Atmosphere Glow */}
      <mesh>
        <sphereGeometry args={[2.1, 64, 64]} />
        <meshStandardMaterial
          color="#06b6d4"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          emissive="#06b6d4"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Earth Surface */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          roughnessMap={specularMap}
          metalness={0.4}
          roughness={0.7}
        />
      </mesh>

      {/* Clouds Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.02, 64, 64]} />
        <meshStandardMaterial
          alphaMap={cloudsMap}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Tech Grid Overlay */}
      <mesh>
        <sphereGeometry args={[2.05, 48, 48]} />
        <meshStandardMaterial 
          color="#06b6d4" 
          wireframe 
          transparent 
          opacity={0.1} 
          emissive="#06b6d4"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Data Points */}
      <points>
        <sphereGeometry args={[2.08, 64, 64]} />
        <pointsMaterial color="#06b6d4" size={0.02} transparent opacity={0.6} sizeAttenuation={true} />
      </points>
    </group>
  );
};

// --- Terminal Effect ---
const Typewriter = ({ text, delay = 100 }: { text: string; delay?: number }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return <span className="font-mono">{currentText}</span>;
};

// --- Data ---
const EXPERIENCE = [
  {
    role: "Software Engineer",
    company: "Oracle",
    location: "Bengaluru, India",
    period: "2022 – 2024",
    metrics: ["↓ 30% Cost Cut", "↑ 10% Faster API", "AWS RDS Migration"],
    points: [
      "Implemented Circuit Breaker pattern using Resilience4j for fault tolerance.",
      "Optimized API endpoints resulting in 10% improvement in response times.",
      "Directed end-to-end migration of AWS RDS clusters with zero downtime.",
      "Utilized JIRA for Agile project management and Splunk for monitoring."
    ]
  },
  {
    role: "Technical Trainer",
    company: "Chandigarh University (Full-time)",
    location: "Punjab, India",
    period: "Jan 2026 – Present",
    metrics: ["Advanced Java", "System Design", "Cloud Architecture"],
    points: [
      "Leading technical training programs for final year engineering students.",
      "Developing curriculum for high-scale distributed systems and microservices.",
      "Mentoring students on production-grade software engineering practices."
    ]
  },
  {
    role: "Technical Trainer",
    company: "Hitbullseye (Freelance)",
    location: "Punjab, India",
    period: "Jan 2024 – Dec 2025",
    metrics: ["1000+ Students", "Java Full Stack", "Spring Boot"],
    points: [
      "Delivered intensive training to engineering students at CHITKARA and LPU.",
      "Guided students in building secure RESTful web applications.",
      "Bridged the gap between academic learning and industry requirements."
    ]
  },
  {
    role: "Technical Trainer",
    company: "MyAnatomy Integration (Freelance)",
    location: "Noida (Remote)",
    period: "Jul 2025 – Oct 2025",
    metrics: ["Microservices", "DevOps", "Advanced DSA"],
    points: [
      "Taught complete Spring Ecosystem and Microservices Architecture.",
      "Established robust CI/CD and Containerization practices.",
      "Directed Capstone Project on Microservices E-commerce System."
    ]
  }
];

const PROJECTS = [
  {
    title: "TeamFlow",
    tech: "Spring Boot, Postgres, React Js",
    color: "cyan",
    description: "Enterprise-grade project and task management system with JWT authentication and real-time tracking."
  },
  {
    title: "PlacePrep",
    tech: "Spring Boot, Postgres, React Js",
    color: "purple",
    description: "Full-stack platform for sharing interview experiences with data-driven insights and role-based access."
  },
  {
    title: "Patient Assistance System",
    tech: "IoT, Java, Cloud",
    color: "blue",
    description: "IEEE published research project focusing on real-time patient monitoring and emergency alerts."
  },
  {
    title: "E-Commerce Microservices",
    tech: "Spring Boot, Docker, AWS",
    color: "indigo",
    description: "Highly scalable e-commerce backend built with microservices architecture and cloud-native tools."
  }
];

const SKILLS_BENTO = [
  { 
    title: "Backend", 
    icon: Database, 
    skills: [
      { name: "Spring Boot", icon: "springboot" },
      { name: "Java", icon: "openjdk" },
      { name: "Hibernate", icon: "hibernate" },
      { name: "Python", icon: "python" },
      { name: "PostgreSQL", icon: "postgresql" },
      { name: "Redis", icon: "redis" },
      { name: "Microservices", icon: "kubernetes" }
    ], 
    color: "cyan" 
  },
  { 
    title: "Frontend", 
    icon: Monitor, 
    skills: [
      { name: "React.js", icon: "react" },
      { name: "Tailwind CSS", icon: "tailwindcss" },
      { name: "Framer Motion", icon: "framer" },
      { name: "JavaScript", icon: "javascript" },
      { name: "TypeScript", icon: "typescript" },
      { name: "Next.js", icon: "nextdotjs" }
    ], 
    color: "purple" 
  },
  { 
    title: "Cloud & DevOps", 
    icon: Cloud, 
    skills: [
      { name: "AWS", icon: "amazonwebservices" },
      { name: "Docker", icon: "docker" },
      { name: "Kubernetes", icon: "kubernetes" },
      { name: "Jenkins", icon: "jenkins" },
      { name: "Git", icon: "git" },
      { name: "GitHub", icon: "github" },
      { name: "Splunk", icon: "splunk" },
      { name: "New Relic", icon: "newrelic" }
    ], 
    color: "blue" 
  },
  { 
    title: "Tools & Methods", 
    icon: Layers, 
    skills: [
      { name: "JIRA", icon: "jira" },
      { name: "Postman", icon: "postman" },
      { name: "IntelliJ IDEA", icon: "intellijidea" },
      { name: "VS Code", icon: "visualstudiocode" },
      { name: "Agile", icon: "trello" },
      { name: "System Design", icon: "diagrams" },
      { name: "DSA", icon: "leetcode" }
    ], 
    color: "indigo" 
  }
];

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const draw = () => {
      ctx.fillStyle = "rgba(2, 6, 23, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#06b6d4";
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[200] opacity-20 pointer-events-none" />;
};

// --- Main App ---
const Trophy3DScene = ({ scrollProgress }: { scrollProgress: MotionValue<number> }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Rotate the entire group based on scroll
      groupRef.current.rotation.y = scrollProgress.get() * Math.PI * 2;
      
      // Add a subtle continuous rotation
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Rockstar Award - Glowing Star Artifact */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2} position={[-4, 2, -2]}>
        <mesh>
          <icosahedronGeometry args={[1, 15]} />
          <meshStandardMaterial 
            color="#facc15" 
            emissive="#facc15" 
            emissiveIntensity={2} 
            toneMapped={false}
          />
        </mesh>
        <mesh scale={1.2}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#facc15" wireframe transparent opacity={0.3} />
        </mesh>
        <Html center position={[0, -1.8, 0]} className="pointer-events-none w-48 text-center">
          <div className="text-yellow-400 font-bold text-lg md:text-xl drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">Rockstar Award</div>
          <div className="text-slate-300 text-[10px] md:text-sm">Top performer recognition</div>
        </Html>
      </Float>

      {/* Operational Excellence - The Infinite Loop */}
      <Float speed={2.5} rotationIntensity={1.5} floatIntensity={1.5} position={[4, 1, -4]}>
        <mesh>
          <torusKnotGeometry args={[0.6, 0.2, 128, 32]} />
          <meshStandardMaterial 
            color="#22d3ee" 
            emissive="#22d3ee" 
            emissiveIntensity={1} 
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Orbiting particles */}
        {[...Array(3)].map((_, i) => (
          <group key={i} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
            <mesh position={[1.2, 0, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} />
            </mesh>
          </group>
        ))}
        <Html center position={[0, -1.8, 0]} className="pointer-events-none w-48 text-center">
          <div className="text-cyan-400 font-bold text-lg md:text-xl drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">Operational Excellence</div>
          <div className="text-slate-300 text-[10px] md:text-sm">Process optimization</div>
        </Html>
      </Float>

      {/* AWS Project Recognition - The Cloud Core */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={2} position={[-3, -2, -3]}>
        <group>
          {/* Central Cube */}
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.5} wireframe />
          </mesh>
          {/* Surrounding "Cloud" spheres */}
          <mesh position={[0.6, 0.4, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#c084fc" transparent opacity={0.4} />
          </mesh>
          <mesh position={[-0.5, -0.3, 0.4]}>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshStandardMaterial color="#c084fc" transparent opacity={0.4} />
          </mesh>
          <mesh position={[0, -0.5, -0.5]}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#c084fc" transparent opacity={0.4} />
          </mesh>
        </group>
        <Html center position={[0, -1.8, 0]} className="pointer-events-none w-48 text-center">
          <div className="text-purple-400 font-bold text-lg md:text-xl drop-shadow-[0_0_10px_rgba(192,132,252,0.5)]">AWS Recognition</div>
          <div className="text-slate-300 text-[10px] md:text-sm">Cloud transition success</div>
        </Html>
      </Float>

      {/* Leadership - The Monolith of Guidance */}
      <Float speed={2} rotationIntensity={0.8} floatIntensity={1.5} position={[3, -1.5, -1]}>
        <mesh>
          <boxGeometry args={[0.8, 2, 0.8]} />
          <meshStandardMaterial color="#f87171" emissive="#f87171" emissiveIntensity={0.2} metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Floating cap */}
        <mesh position={[0, 1.3, 0]}>
          <coneGeometry args={[0.6, 0.6, 4]} />
          <meshStandardMaterial color="#f87171" emissive="#f87171" emissiveIntensity={1} />
        </mesh>
        <Html center position={[0, -1.8, 0]} className="pointer-events-none w-64 text-center">
          <div className="text-red-400 font-bold text-lg md:text-xl drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]">Leadership</div>
          <div className="text-slate-300 text-[10px] md:text-sm">Team mentoring & management</div>
        </Html>
      </Float>
      
      {/* Central Core - The Neural Network */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5} position={[0, 0, 0]}>
        <mesh>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} wireframe />
        </mesh>
        <group>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2, 0.02, 16, 100]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} transparent opacity={0.3} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[2.5, 0.02, 16, 100]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} transparent opacity={0.3} />
          </mesh>
        </group>
      </Float>
    </group>
  );
};

const TrophyRoomSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-slate-950" id="trophies">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute top-12 left-0 w-full z-20 pointer-events-none">
          <TextReveal className="text-center">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              TROPHY ROOM
            </h2>
          </TextReveal>
          <p className="text-center text-slate-400 mt-4 text-xl max-w-2xl mx-auto">
            A collection of awards and research that define my professional standards.
          </p>
        </div>
        
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Trophy3DScene scrollProgress={scrollYProgress} />
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={1} fade speed={2} />
        </Canvas>

        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 pointer-events-none" />
      </div>
    </section>
  );
};

const Contact3DScene = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Parallax effect based on mouse
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, state.mouse.x * 2, 0.05);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, state.mouse.y * 2, 0.05);
      groupRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Abstract connection nodes */}
      {[...Array(15)].map((_, i) => {
        const position = [
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 10 - 5
        ] as [number, number, number];
        
        return (
          <Float key={i} speed={2} rotationIntensity={2} floatIntensity={2} position={position}>
            <mesh>
              <icosahedronGeometry args={[Math.random() * 0.5 + 0.2, 0]} />
              <meshStandardMaterial 
                color={i % 3 === 0 ? "#06b6d4" : i % 3 === 1 ? "#a855f7" : "#3b82f6"} 
                emissive={i % 3 === 0 ? "#06b6d4" : i % 3 === 1 ? "#a855f7" : "#3b82f6"} 
                emissiveIntensity={1} 
                wireframe={Math.random() > 0.5}
              />
            </mesh>
          </Float>
        );
      })}
      
      {/* Central Core */}
      <Sphere args={[2, 64, 64]} position={[0, 0, -5]}>
        <MeshDistortMaterial 
          color="#020617" 
          emissive="#06b6d4" 
          emissiveIntensity={0.2}
          distort={0.4} 
          speed={2} 
          roughness={0.2}
          metalness={0.8}
          wireframe
        />
      </Sphere>
    </group>
  );
};

const ContactSection = () => {
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#a855f7', '#ffffff']
    });
  };

  return (
    <section id="contact" className="relative min-h-screen py-40 px-6 overflow-hidden bg-slate-950">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Contact3DScene />
          <Stars radius={100} depth={50} count={2000} factor={4} saturation={1} fade speed={1} />
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)] pointer-events-none z-0" />
      
          <div className="max-w-6xl mx-auto relative z-10">
            <TextReveal className="text-center mb-12 md:mb-24">
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                INITIATE CONTACT
              </h2>
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
                Ready to build the future? Establish a secure connection and let's collaborate on your next breakthrough.
              </p>
            </TextReveal>

            <div className="grid lg:grid-cols-5 gap-8 md:gap-12 items-start">
              {/* Contact Info / Links */}
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                <motion.a 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, x: 10 }}
                  href="mailto:venkateshwork2212@gmail.com"
                  className="glass-card p-4 md:p-6 rounded-3xl flex items-center gap-4 md:gap-6 group border-cyan-500/20 hover:bg-cyan-500/10 transition-all"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Mail size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] md:text-sm text-slate-400 mb-1">Direct Line</div>
                    <div className="font-bold text-white truncate text-sm md:text-base">venkateshwork2212@gmail.com</div>
                  </div>
                </motion.a>

                <motion.a 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.05, x: 10 }}
                  href="https://github.com/venkateshwork2212" target="_blank" rel="noreferrer"
                  className="glass-card p-4 md:p-6 rounded-3xl flex items-center gap-4 md:gap-6 group border-purple-500/20 hover:bg-purple-500/10 transition-all"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <Github size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] md:text-sm text-slate-400 mb-1">Code Repository</div>
                    <div className="font-bold text-white truncate text-sm md:text-base">github.com/venkateshwork2212</div>
                  </div>
                </motion.a>

                <motion.a 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.05, x: 10 }}
                  href="https://www.linkedin.com/in/venkatesh-k-20b610109/" target="_blank" rel="noreferrer"
                  className="glass-card p-4 md:p-6 rounded-3xl flex items-center gap-4 md:gap-6 group border-blue-500/20 hover:bg-blue-500/10 transition-all"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <Linkedin size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] md:text-sm text-slate-400 mb-1">Professional Network</div>
                    <div className="font-bold text-white truncate text-sm md:text-base">linkedin.com/in/venkatesh-k-20b610109</div>
                  </div>
                </motion.a>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="glass-card p-4 md:p-6 rounded-3xl flex items-center gap-4 md:gap-6 group border-indigo-500/20 transition-all"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Phone size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] md:text-sm text-slate-400 mb-1">Voice Link</div>
                    <div className="font-bold text-white truncate text-sm md:text-base">+91 8660216971</div>
                  </div>
                </motion.div>
              </div>

              {/* Form */}
              <motion.form 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onSubmit={handleContactSubmit} 
                className="lg:col-span-3 glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-white/10 shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="grid sm:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 ml-1">Identifier</label>
                      <input type="text" className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-4 py-3 md:px-6 md:py-4 focus:border-cyan-500 focus:bg-white/5 outline-none transition-all text-white placeholder:text-slate-600 backdrop-blur-sm text-sm md:text-base" placeholder="Your Name" required />
                    </div>
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 ml-1">Comms Link</label>
                      <input type="email" className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-4 py-3 md:px-6 md:py-4 focus:border-cyan-500 focus:bg-white/5 outline-none transition-all text-white placeholder:text-slate-600 backdrop-blur-sm text-sm md:text-base" placeholder="your@email.com" required />
                    </div>
                  </div>
                  <div className="space-y-2 md:space-y-3 mb-8 md:mb-10">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 ml-1">Transmission Data</label>
                    <textarea rows={4} className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-4 py-3 md:px-6 md:py-4 focus:border-cyan-500 focus:bg-white/5 outline-none transition-all text-white placeholder:text-slate-600 resize-none backdrop-blur-sm text-sm md:text-base" placeholder="Describe your project or inquiry..." required />
                  </div>
                  <button type="submit" className="group/btn relative w-full py-4 md:py-5 bg-cyan-600 text-white rounded-2xl font-bold transition-all hover:bg-cyan-500 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] overflow-hidden">
                    <span className="relative z-10 flex items-center gap-3 text-base md:text-lg tracking-wide">
                      TRANSMIT <Send size={18} className="md:w-5 md:h-5 group-hover/btn:translate-x-2 group-hover/btn:-translate-y-2 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </button>
                </div>
              </motion.form>
            </div>
          </div>
    </section>
  );
};

const Navigation = () => {
  const navItems = [
    { name: 'Tech', id: 'techstack' },
    { name: 'Experience', id: 'experience' },
    { name: 'Projects', id: 'projects' },
    { name: 'Trophies', id: 'trophies' },
    { name: 'Contact', id: 'contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] p-6 flex justify-center">
      <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 flex gap-6 shadow-2xl">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-label={`Navigate to ${item.name} section`}
            className="text-xs font-mono font-bold text-slate-400 hover:text-cyan-400 transition-colors"
          >
            {item.name}
          </a>
        ))}
      </div>
    </nav>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'engineer' | 'trainer'>('engineer');
  const [isMatrixMode, setIsMatrixMode] = useState(false);
  const { scrollYProgress } = useScroll();
  const beamY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <ErrorBoundary>
      <div className={cn(
        "bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-cyan-500/30 selection:text-white transition-all duration-1000",
        isMatrixMode && "grayscale brightness-150 contrast-125"
      )}>
        <Navigation />
        <CustomCursor />
        <FloatingParticles />
        <HUD />
        <AITerminal />
        {isMatrixMode && <MatrixRain />}

        {/* Matrix Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onMouseEnter={() => playSound('hover')}
          onClick={() => {
            setIsMatrixMode(!isMatrixMode);
            playSound('glitch');
          }}
          className="fixed bottom-8 left-8 z-[100] w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-500 hover:text-cyan-400 transition-all backdrop-blur-md"
        >
          <Zap size={20} className={cn(isMatrixMode && "text-cyan-400 animate-pulse")} />
        </motion.button>
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-1000" />
        </div>

        {/* 1. Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <InteractiveGrid />
          <div className="absolute inset-0 z-0 opacity-60">
            <Canvas>
              <PerspectiveCamera makeDefault position={[0, 0, 8]} />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Suspense fallback={null}>
                <CyberCore />
              </Suspense>
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
          </div>

          <div className="relative z-10 text-center px-6 max-w-4xl">
            <TextReveal className="mb-6 inline-block">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-cyan-400 font-mono text-[10px] md:text-sm">
                <Terminal size={16} />
                <Typewriter text={"> System.out.println(\"Hello, I'm Venkatesh K\");"} delay={50} />
              </div>
            </TextReveal>

            <TextReveal className="mb-6">
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-none">
                <GlitchText text="Architecting" /> <span className="neon-text">Scalable</span><br />
                Empowering <span className="purple-text">Code</span>.
              </h1>
            </TextReveal>

            <TextReveal className="mb-10">
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Full Stack Software Engineer & Technical Trainer. 
                Specializing in <span className="text-white font-semibold">Spring Boot</span>, 
                <span className="text-white font-semibold">React</span>, and 
                <span className="text-white font-semibold">Microservices</span>.
              </p>
            </TextReveal>

            <TextReveal className="flex flex-wrap justify-center gap-4 md:gap-6">
              <a href="#projects" className="group relative px-6 py-3 md:px-8 md:py-4 bg-cyan-600 text-white rounded-2xl font-bold transition-all hover:bg-cyan-500 neon-glow overflow-hidden text-sm md:text-base">
                <span className="relative z-10 flex items-center gap-2">
                  View My Work <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <button className="px-6 py-3 md:px-8 md:py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all backdrop-blur-sm flex items-center gap-2 text-sm md:text-base">
                Resume <ChevronRight size={18} />
              </button>
            </TextReveal>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-slate-500">
            <ChevronRight size={32} className="rotate-90" />
          </div>
        </section>

        {/* 2. About Me (Duality) */}
        <section className="relative py-20 md:py-40 px-6 overflow-hidden">
          <InteractiveGrid />
          <div className="max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row gap-12 md:gap-20 items-center">
            <div className="w-full lg:w-1/2">
              <TextReveal>
                <h2 className="text-4xl md:text-5xl font-bold mb-8 md:mb-12 tracking-tight">The Duality</h2>
              </TextReveal>
              
              <div className="flex gap-2 md:gap-4 mb-8 md:mb-10 p-1.5 bg-white/5 rounded-2xl border border-white/10 w-fit">
                <button 
                  onClick={() => setActiveTab('engineer')}
                  className={cn(
                    "px-6 py-3 rounded-xl transition-all font-bold text-sm uppercase tracking-widest relative overflow-hidden",
                    activeTab === 'engineer' ? "text-white" : "text-slate-500 hover:text-white"
                  )}
                >
                  {activeTab === 'engineer' && (
                    <motion.div layoutId="duality-tab" className="absolute inset-0 bg-cyan-600 rounded-xl" />
                  )}
                  <span className="relative z-10">Engineer</span>
                </button>
                <button 
                  onClick={() => setActiveTab('trainer')}
                  className={cn(
                    "px-6 py-3 rounded-xl transition-all font-bold text-sm uppercase tracking-widest relative overflow-hidden",
                    activeTab === 'trainer' ? "text-white" : "text-slate-500 hover:text-white"
                  )}
                >
                  {activeTab === 'trainer' && (
                    <motion.div layoutId="duality-tab" className="absolute inset-0 bg-purple-600 rounded-xl" />
                  )}
                  <span className="relative z-10">Trainer</span>
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4 }}
                  className="glass-card p-8 md:p-12 rounded-[2.5rem] border-white/10 relative overflow-hidden"
                >
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    className="absolute top-0 right-0 p-8"
                  >
                    {activeTab === 'engineer' ? <Cpu size={160} /> : <BookOpen size={160} />}
                  </motion.div>
                  
                  <div className="relative z-10">
                    <motion.div 
                      key={activeTab + 'content'}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {activeTab === 'engineer' ? (
                        <>
                          <h3 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-6">Software Engineer @ Oracle</h3>
                          <p className="text-lg text-slate-400 leading-relaxed mb-8">
                            Building resilient microservices and optimizing cloud infrastructure. 
                            I specialize in high-performance Java systems and AWS migrations.
                          </p>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                              <p className="text-cyan-400 font-bold text-4xl mb-2">30%</p>
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Cost Efficiency</p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                              <p className="text-cyan-400 font-bold text-4xl mb-2">10%</p>
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">API Speed</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="text-3xl md:text-4xl font-bold text-purple-400 mb-6">Technical Trainer</h3>
                          <p className="text-lg text-slate-400 leading-relaxed mb-8">
                            Mentoring the next generation of engineers. I've trained 1000+ students 
                            in full-stack development and advanced system design.
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {["CHITKARA", "LPU", "NIET", "MyAnatomy"].map(tag => (
                              <span key={tag} className="px-5 py-2.5 bg-purple-500/10 text-purple-400 rounded-xl text-sm font-bold border border-purple-500/20">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="w-full lg:w-1/2 relative aspect-square group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-[60px] md:blur-[100px] group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative h-full w-full flex items-center justify-center cursor-grab active:cursor-grabbing">
                <Canvas>
                  <PerspectiveCamera makeDefault position={[0, 0, 6]} />
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} intensity={1} />
                  <Suspense fallback={null}>
                    <DetailedGlobe />
                  </Suspense>
                  <OrbitControls 
                    enableZoom={false} 
                    autoRotate 
                    autoRotateSpeed={1} 
                    makeDefault 
                    enableDamping={true}
                    dampingFactor={0.05}
                    rotateSpeed={0.5}
                  />
                </Canvas>
                <div className="absolute bottom-6 md:bottom-10 text-center pointer-events-none">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 md:mb-4">Fluent in:</p>
                  <motion.div 
                    className="grid grid-cols-2 md:grid-cols-3 gap-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                    }}
                  >
                    {["English", "Hindi", "Kannada", "Tamil", "Telugu", "Malayalam"].map(lang => (
                      <motion.div
                        key={lang}
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          visible: { opacity: 1, y: 0 }
                        }}
                        whileHover={{ scale: 1.05, borderColor: 'rgba(6, 182, 212, 0.5)', boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)' }}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] md:text-xs font-bold text-slate-300 flex items-center gap-2 cursor-default transition-colors"
                      >
                        <Globe size={12} className="text-cyan-400" />
                        {lang}
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* 3. Tech Galaxy (Interactive 3D Experience) */}
      <TechStackExperience />

      {/* 4. Experience (3D Tunnel Scroll) */}
      <ExperienceSection />

      {/* 5. Projects (3D Tilt) */}
      <section id="projects" className="relative py-40 px-6 overflow-hidden">
        <InteractiveGrid />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <TextReveal className="text-center mb-32">
          <h2 className="text-5xl font-bold tracking-tight">Personal Projects</h2>
        </TextReveal>
        
        <motion.div 
          className="grid md:grid-cols-2 gap-16"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {PROJECTS.map((project, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 50, scale: 0.9 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
              }}
            >
              <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.05} transitionSpeed={1000}>
                <div className="glass-card rounded-[3rem] overflow-hidden group border-white/10 hover:border-white/20 relative transition-all duration-500 hover:shadow-[0_0_50px_rgba(6,182,212,0.15)]">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none z-20" />
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <ProjectVisual color={project.color} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 pointer-events-none" />
                    <div className="absolute top-6 right-6 z-30">
                      <div className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-mono text-cyan-400 animate-pulse">
                        STATUS: STABLE_v2.0
                      </div>
                    </div>
                    <div className="absolute bottom-8 left-8 right-8 pointer-events-none">
                      <div className="flex justify-between items-end">
                        <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
                          <Code2 size={28} className="text-cyan-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-10">
                    <h3 className="text-3xl font-bold mb-3 group-hover:text-cyan-400 transition-colors">{project.title}</h3>
                    <p className="text-sm font-mono text-purple-400 mb-6 tracking-wider">{project.tech}</p>
                    <p className="text-slate-400 leading-relaxed mb-8 text-lg">
                      {project.description}
                    </p>
                    <div className="flex gap-6">
                      <motion.button 
                        whileHover={{ scale: 1.05, x: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors group/link"
                      >
                        <Github size={20} /> Source <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.05, x: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 text-sm font-bold text-white hover:text-cyan-400 transition-colors group/link"
                      >
                        <ExternalLink size={20} /> Live Demo <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </Tilt>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

      {/* 6. Achievements & Publications */}
      <TrophyRoomSection />

      {/* 7. Contact Section */}
      <ContactSection />

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800/50 bg-[#020617]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex gap-6">
              <a href="https://github.com/venkateshwork2212" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-cyan-400 transition-colors">
                <Github size={20} />
              </a>
              <a href="https://www.linkedin.com/in/venkatesh-k-20b610109/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-cyan-400 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="mailto:venkateshwork2212@gmail.com" className="text-slate-500 hover:text-cyan-400 transition-colors">
                <Mail size={20} />
              </a>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm font-mono mb-2">© {new Date().getFullYear()} Venkatesh K.</p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-700">System.exit(0);</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </ErrorBoundary>
);
}
