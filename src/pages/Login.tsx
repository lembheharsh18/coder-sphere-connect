
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Github, Mail, Linkedin } from 'lucide-react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useAuth } from '@/contexts/AuthContext';
import { loginUser } from '@/api/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const codeSnippets = [
  'function login() {',
  'if (isValid(user)) {',
  'return true;',
  'console.log("Hello World");',
  '<div className="container">',
  '.element { color: #5ee7ff; }',
  'import React from "react";',
  'SELECT * FROM users;',
  'git commit -m "fix: login"',
  'sudo apt-get install',
  'npm install --save',
  'const router = express.Router();',
  '404 Not Found',
  '<header>CodersHub</header>',
  '/* TODO: Refactor */',
  '@media (max-width: 768px) {',
  'docker-compose up',
  '# Python comment',
  'class User extends Model {',
  'addEventListener("click",',
];

const Login = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const particlesContainerRef = useRef<HTMLDivElement>(null);
  const floatingElementsRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [isLoginForm, setIsLoginForm] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // THREE.js setup for 3D background
    const canvasContainer = canvasRef.current;
    
    if (!canvasContainer) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(renderer.domElement);
    
    // Create grid of cubes
    const cubes = [];
    const gridSize = 10;
    const spacing = 5;
    
    for (let x = -gridSize; x <= gridSize; x++) {
      for (let z = -gridSize; z <= gridSize; z++) {
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ color: 0x5ee7ff, transparent: true, opacity: 0.3 });
        const cube = new THREE.LineSegments(edges, material);
        
        cube.position.x = x * spacing;
        cube.position.z = z * spacing - 20;
        cube.position.y = -5;
        
        scene.add(cube);
        cubes.push({
          mesh: cube,
          baseY: -5,
          speed: 0.01 + Math.random() * 0.02,
          amplitude: 0.5 + Math.random() * 0.5
        });
      }
    }
    
    // Add particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 50;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      color: 0x5ee7ff,
      transparent: true,
      opacity: 0.8
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Add light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const spotLight = new THREE.SpotLight(0x5ee7ff, 1);
    spotLight.position.set(0, 10, 10);
    spotLight.lookAt(0, 0, 0);
    scene.add(spotLight);
    
    camera.position.z = 15;

    let mouseX = 0;
    let mouseY = 0;
    
    // Mouse movement tracking
    const onDocumentMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = (event.clientY / window.innerHeight) * 2 - 1;
    };
    
    document.addEventListener('mousemove', onDocumentMouseMove);
    
    // Animation
    function animate() {
      requestAnimationFrame(animate);
      
      // Rotate particle system
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.0005;
      
      // Animate cubes
      cubes.forEach((cube: any) => {
        cube.mesh.rotation.x += 0.01;
        cube.mesh.rotation.y += 0.01;
        cube.mesh.position.y = cube.baseY + Math.sin(Date.now() * cube.speed) * cube.amplitude;
      });
      
      // Move camera slightly with mouse
      camera.position.x += (mouseX * 0.02 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 0.02 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      
      renderer.render(scene, camera);
    }
    
    // Resize handler
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', onWindowResize);
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      document.removeEventListener('mousemove', onDocumentMouseMove);
      window.removeEventListener('resize', onWindowResize);
      canvasContainer.removeChild(renderer.domElement);
      
      // Dispose resources
      scene.clear();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      cubes.forEach((cube: any) => {
        cube.mesh.geometry.dispose();
        cube.mesh.material.dispose();
      });
    };
  }, []);
  
  // Form container 3D effect
  useEffect(() => {
    const formContainer = formContainerRef.current;
    
    if (!formContainer) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
      
      gsap.to(formContainer, {
        rotationY: xAxis,
        rotationX: yAxis,
        duration: 0.5,
        ease: 'power2.out'
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Floating code elements
  useEffect(() => {
    const floatingElements = floatingElementsRef.current;
    
    if (!floatingElements) return;
    
    const codeElements: HTMLDivElement[] = [];
    
    // Create floating code elements
    for (let i = 0; i < 20; i++) {
      const code = document.createElement('div');
      code.classList.add('floating-code');
      code.textContent = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
      code.style.top = `${Math.random() * 100}%`;
      code.style.left = `${Math.random() * 100}%`;
      code.style.fontSize = `${Math.random() * 8 + 10}px`;
      code.style.opacity = `${Math.random() * 0.3 + 0.1}`;
      code.style.transform = `rotate(${Math.random() * 360}deg)`;
      floatingElements.appendChild(code);
      codeElements.push(code);
      
      // Animate floating code
      gsap.to(code, {
        y: `${Math.random() * 200 - 100}`,
        x: `${Math.random() * 200 - 100}`,
        rotation: `${Math.random() * 360}`,
        opacity: Math.random() * 0.3 + 0.1,
        duration: Math.random() * 20 + 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
    
    // Cleanup
    return () => {
      codeElements.forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
    };
  }, []);

  // Create particles
  const createParticle = (x: number, y: number) => {
    const particlesContainer = particlesContainerRef.current;
    
    if (!particlesContainer) return;
    
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    const size = Math.random() * 8 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    
    particlesContainer.appendChild(particle);
    
    gsap.to(particle, {
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      opacity: 0,
      duration: Math.random() * 2 + 0.5,
      ease: 'power1.out',
      onComplete: () => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }
    });
  };
  
  const createParticleExplosion = () => {
    const formContainer = formContainerRef.current;
    
    if (!formContainer) return;
    
    const x = formContainer.offsetWidth / 2;
    const y = formContainer.offsetHeight / 2;
    
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        createParticle(x, y);
      }, i * 20);
    }
  };
  
  useEffect(() => {
    // Create initial particle explosion
    createParticleExplosion();
  }, []);

  const handleFormToggle = (isLogin: boolean) => {
    setIsLoginForm(isLogin);
    createParticleExplosion();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoginForm) {
      // Login form validation
      if (!formData.email || !formData.password) {
        toast.error("Please fill in all fields");
        return;
      }
      
      setIsLoading(true);
      
      try {
        const response = await loginUser({
          email: formData.email,
          password: formData.password
        });
        
        if (response.success && response.user) {
          if (response.token) {
            localStorage.setItem('authToken', response.token);
          }
          
          login(response.user);
          toast.success('Logged in successfully!');
          navigate('/');
        } else {
          toast.error(response.message || 'Login failed');
        }
      } catch (error) {
        console.error('Login failed:', error);
        toast.error('Login failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Sign up form validation
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        toast.error("Please fill in all fields");
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      
      // Redirect to register page with form data
      navigate('/register', { state: { formData } });
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      {/* Canvas container for THREE.js */}
      <div ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0"></div>
      
      <div className="container flex justify-center items-center min-h-screen perspective-1000">
        <div 
          ref={formContainerRef}
          className="w-full max-w-md bg-[rgba(15,15,20,0.7)] backdrop-blur-xl rounded-2xl shadow-[0_25px_45px_rgba(0,0,0,0.2)] border border-[rgba(100,100,255,0.3)] overflow-hidden p-10 relative transform-gpu preserve-3d"
        >
          <div ref={particlesContainerRef} className="absolute top-0 left-0 w-full h-full overflow-hidden"></div>
          
          <div className="logo text-center mb-8 preserve-3d relative">
            <div className="text-5xl mb-2 text-[#5ee7ff] animate-pulse">{'{ }'}</div>
            <h1 className="text-4xl font-bold text-[#5ee7ff] mb-1 transform-gpu translate-z-8 text-shadow-[0_0_15px_rgba(94,231,255,0.5)]">CoderSphere</h1>
            <p className="text-[#aaa] text-base transform-gpu translate-z-5">Where Code Meets Community</p>
          </div>
          
          <div className="tabs flex mb-8 relative z-10">
            <button 
              className={`flex-1 py-4 bg-transparent border-0 text-lg font-semibold cursor-pointer transition-all relative overflow-hidden ${isLoginForm ? 'text-[#5ee7ff] after:scale-x-100' : 'text-[#888] after:scale-x-0'} after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#5ee7ff] after:transition-transform`}
              onClick={() => handleFormToggle(true)}
            >
              Login
            </button>
            <button 
              className={`flex-1 py-4 bg-transparent border-0 text-lg font-semibold cursor-pointer transition-all relative overflow-hidden ${!isLoginForm ? 'text-[#5ee7ff] after:scale-x-100' : 'text-[#888] after:scale-x-0'} after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#5ee7ff] after:transition-transform`}
              onClick={() => handleFormToggle(false)}
            >
              Sign Up
            </button>
          </div>
          
          <form onSubmit={handleLogin} className={`transition-opacity duration-300 ease-in-out ${isLoginForm ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="form-group relative mb-6 preserve-3d">
              <input 
                type="email"
                name="email"
                ref={emailRef}
                className="w-full py-4 px-5 bg-[rgba(30,30,40,0.7)] border-2 border-[rgba(100,100,255,0.1)] rounded-xl text-white text-base transition-all focus:outline-none focus:border-[#5ee7ff] focus:shadow-[0_0_15px_rgba(94,231,255,0.3)] transform-gpu translate-z-3 placeholder:text-transparent"
                placeholder=" "
                value={formData.email}
                onChange={handleInputChange}
                onFocus={(e) => gsap.to(e.target, { z: 30, duration: 0.3, ease: 'power2.out' })}
                onBlur={(e) => gsap.to(e.target, { z: 10, duration: 0.3, ease: 'power2.out' })}
              />
              <label className="absolute left-5 top-[18px] text-[#888] text-base transition-all pointer-events-none transform-gpu translate-z-5">Email</label>
            </div>
            
            <div className="form-group relative mb-6 preserve-3d">
              <input 
                type="password"
                name="password"
                ref={passwordRef}
                className="w-full py-4 px-5 bg-[rgba(30,30,40,0.7)] border-2 border-[rgba(100,100,255,0.1)] rounded-xl text-white text-base transition-all focus:outline-none focus:border-[#5ee7ff] focus:shadow-[0_0_15px_rgba(94,231,255,0.3)] transform-gpu translate-z-3 placeholder:text-transparent"
                placeholder=" "
                value={formData.password}
                onChange={handleInputChange}
                onFocus={(e) => gsap.to(e.target, { z: 30, duration: 0.3, ease: 'power2.out' })}
                onBlur={(e) => gsap.to(e.target, { z: 10, duration: 0.3, ease: 'power2.out' })}
              />
              <label className="absolute left-5 top-[18px] text-[#888] text-base transition-all pointer-events-none transform-gpu translate-z-5">Password</label>
            </div>
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-5 border-0 rounded-xl bg-gradient-to-r from-[#42c3ff] to-[#615eff] text-white text-lg font-semibold cursor-pointer transition-all transform-gpu translate-z-4 relative overflow-hidden hover:shadow-[0_0_20px_rgba(94,231,255,0.5)] hover:translate-z-5 before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-[rgba(255,255,255,0.3)] before:to-transparent before:transition-all before:duration-500 hover:before:left-full"
              onMouseEnter={(e) => gsap.to(e.target, { z: 40, scale: 1.05, duration: 0.3, ease: 'power2.out' })}
              onMouseLeave={(e) => gsap.to(e.target, { z: 15, scale: 1, duration: 0.3, ease: 'power2.out' })}
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </button>
            
            <div className="divider flex items-center my-8 text-[#666]">
              <div className="flex-1 h-px bg-[#444]"></div>
              <span className="px-4 text-sm">OR</span>
              <div className="flex-1 h-px bg-[#444]"></div>
            </div>
            
            <div className="social-login flex justify-center gap-4 preserve-3d">
              <button 
                type="button"
                className="w-12 h-12 rounded-full flex items-center justify-center bg-[rgba(30,30,40,0.7)] border border-[rgba(100,100,255,0.2)] text-white text-xl cursor-pointer transition-all transform-gpu translate-z-5 hover:transform-gpu hover:translate-z-8 hover:scale-110 hover:bg-[#5ee7ff] hover:text-[#0a0a0a]"
                onMouseEnter={(e) => gsap.to(e.target, { z: 40, scale: 1.1, duration: 0.3, ease: 'power2.out' })}
                onMouseLeave={(e) => gsap.to(e.target, { z: 20, scale: 1, duration: 0.3, ease: 'power2.out' })}
              >
                G
              </button>
              <button 
                type="button" 
                className="w-12 h-12 rounded-full flex items-center justify-center bg-[rgba(30,30,40,0.7)] border border-[rgba(100,100,255,0.2)] text-white text-xl cursor-pointer transition-all transform-gpu translate-z-5 hover:transform-gpu hover:translate-z-8 hover:scale-110 hover:bg-[#5ee7ff] hover:text-[#0a0a0a]"
                onMouseEnter={(e) => gsap.to(e.target, { z: 40, scale: 1.1, duration: 0.3, ease: 'power2.out' })}
                onMouseLeave={(e) => gsap.to(e.target, { z: 20, scale: 1, duration: 0.3, ease: 'power2.out' })}
              >
                <Mail className="h-5 w-5" />
              </button>
              <button 
                type="button" 
                className="w-12 h-12 rounded-full flex items-center justify-center bg-[rgba(30,30,40,0.7)] border border-[rgba(100,100,255,0.2)] text-white text-xl cursor-pointer transition-all transform-gpu translate-z-5 hover:transform-gpu hover:translate-z-8 hover:scale-110 hover:bg-[#5ee7ff] hover:text-[#0a0a0a]"
                onMouseEnter={(e) => gsap.to(e.target, { z: 40, scale: 1.1, duration: 0.3, ease: 'power2.out' })}
                onMouseLeave={(e) => gsap.to(e.target, { z: 20, scale: 1, duration: 0.3, ease: 'power2.out' })}
              >
                <Linkedin className="h-5 w-5" />
              </button>
              <button 
                type="button" 
                className="w-12 h-12 rounded-full flex items-center justify-center bg-[rgba(30,30,40,0.7)] border border-[rgba(100,100,255,0.2)] text-white text-xl cursor-pointer transition-all transform-gpu translate-z-5 hover:transform-gpu hover:translate-z-8 hover:scale-110 hover:bg-[#5ee7ff] hover:text-[#0a0a0a]"
                onMouseEnter={(e) => gsap.to(e.target, { z: 40, scale: 1.1, duration: 0.3, ease: 'power2.out' })}
                onMouseLeave={(e) => gsap.to(e.target, { z: 20, scale: 1, duration: 0.3, ease: 'power2.out' })}
              >
                <Github className="h-5 w-5" />
              </button>
            </div>
            
            <p className="help-text text-[#777] mt-5 text-sm text-center">
              Forgot your password? <Link to="/forgot-password" className="text-[#5ee7ff] no-underline transition-all hover:text-shadow-[0_0_10px_rgba(94,231,255,0.5)]">Reset it</Link>
            </p>
          </form>
          
          <form onSubmit={handleLogin} className={`transition-opacity duration-300 ease-in-out ${!isLoginForm ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="form-group relative mb-6 preserve-3d">
              <input 
                type="text"
                name="name"
                className="w-full py-4 px-5 bg-[rgba(30,30,40,0.7)] border-2 border-[rgba(100,100,255,0.1)] rounded-xl text-white text-base transition-all focus:outline-none focus:border-[#5ee7ff] focus:shadow-[0_0_15px_rgba(94,231,255,0.3)] transform-gpu translate-z-3 placeholder:text-transparent"
                placeholder=" "
                value={formData.name}
                onChange={handleInputChange}
                onFocus={(e) => gsap.to(e.target, { z: 30, duration: 0.3, ease: 'power2.out' })}
                onBlur={(e) => gsap.to(e.target, { z: 10, duration: 0.3, ease: 'power2.out' })}
              />
              <label className="absolute left-5 top-[18px] text-[#888] text-base transition-all pointer-events-none transform-gpu translate-z-5">Username</label>
            </div>
            
            <div className="form-group relative mb-6 preserve-3d">
              <input 
                type="email"
                name="email"
                className="w-full py-4 px-5 bg-[rgba(30,30,40,0.7)] border-2 border-[rgba(100,100,255,0.1)] rounded-xl text-white text-base transition-all focus:outline-none focus:border-[#5ee7ff] focus:shadow-[0_0_15px_rgba(94,231,255,0.3)] transform-gpu translate-z-3 placeholder:text-transparent"
                placeholder=" "
                value={formData.email}
                onChange={handleInputChange}
                onFocus={(e) => gsap.to(e.target, { z: 30, duration: 0.3, ease: 'power2.out' })}
                onBlur={(e) => gsap.to(e.target, { z: 10, duration: 0.3, ease: 'power2.out' })}
              />
              <label className="absolute left-5 top-[18px] text-[#888] text-base transition-all pointer-events-none transform-gpu translate-z-5">Email</label>
            </div>
            
            <div className="form-group relative mb-6 preserve-3d">
              <input 
                type="password"
                name="password"
                className="w-full py-4 px-5 bg-[rgba(30,30,40,0.7)] border-2 border-[rgba(100,100,255,0.1)] rounded-xl text-white text-base transition-all focus:outline-none focus:border-[#5ee7ff] focus:shadow-[0_0_15px_rgba(94,231,255,0.3)] transform-gpu translate-z-3 placeholder:text-transparent"
                placeholder=" "
                value={formData.password}
                onChange={handleInputChange}
                onFocus={(e) => gsap.to(e.target, { z: 30, duration: 0.3, ease: 'power2.out' })}
                onBlur={(e) => gsap.to(e.target, { z: 10, duration: 0.3, ease: 'power2.out' })}
              />
              <label className="absolute left-5 top-[18px] text-[#888] text-base transition-all pointer-events-none transform-gpu translate-z-5">Password</label>
            </div>
            
            <div className="form-group relative mb-6 preserve-3d">
              <input 
                type="password"
                name="confirmPassword"
                className="w-full py-4 px-5 bg-[rgba(30,30,40,0.7)] border-2 border-[rgba(100,100,255,0.1)] rounded-xl text-white text-base transition-all focus:outline-none focus:border-[#5ee7ff] focus:shadow-[0_0_15px_rgba(94,231,255,0.3)] transform-gpu translate-z-3 placeholder:text-transparent"
                placeholder=" "
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onFocus={(e) => gsap.to(e.target, { z: 30, duration: 0.3, ease: 'power2.out' })}
                onBlur={(e) => gsap.to(e.target, { z: 10, duration: 0.3, ease: 'power2.out' })}
              />
              <label className="absolute left-5 top-[18px] text-[#888] text-base transition-all pointer-events-none transform-gpu translate-z-5">Confirm Password</label>
            </div>
            
            <button 
              type="submit"
              className="w-full py-4 px-5 border-0 rounded-xl bg-gradient-to-r from-[#42c3ff] to-[#615eff] text-white text-lg font-semibold cursor-pointer transition-all transform-gpu translate-z-4 relative overflow-hidden hover:shadow-[0_0_20px_rgba(94,231,255,0.5)] hover:translate-z-5 before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-[rgba(255,255,255,0.3)] before:to-transparent before:transition-all before:duration-500 hover:before:left-full"
              onMouseEnter={(e) => gsap.to(e.target, { z: 40, scale: 1.05, duration: 0.3, ease: 'power2.out' })}
              onMouseLeave={(e) => gsap.to(e.target, { z: 15, scale: 1, duration: 0.3, ease: 'power2.out' })}
            >
              Create Account
            </button>
            
            <div className="divider flex items-center my-8 text-[#666]">
              <div className="flex-1 h-px bg-[#444]"></div>
              <span className="px-4 text-sm">OR</span>
              <div className="flex-1 h-px bg-[#444]"></div>
            </div>
            
            <div className="social-login flex justify-center gap-4 preserve-3d">
              <button 
                type="button"
                className="w-12 h-12 rounded-full flex items-center justify-center bg-[rgba(30,30,40,0.7)] border border-[rgba(100,100,255,0.2)] text-white text-xl cursor-pointer transition-all transform-gpu translate-z-5 hover:transform-gpu hover:translate-z-8 hover:scale-110 hover:bg-[#5ee7ff] hover:text-[#0a0a0a]"
                onMouseEnter={(e) => gsap.to(e.target, { z: 40, scale: 1.1, duration: 0.3, ease: 'power2.out' })}
                onMouseLeave={(e) => gsap.to(e.target, { z: 20, scale: 1, duration: 0.3, ease: 'power2.out' })}
              >
                G
              </button>
              <button 
                type="button"
                className="w-12 h-12 rounded-full flex items-center justify-center bg-[rgba(30,30,40,0.7)] border border-[rgba(100,100,255,0.2)] text-white text-xl cursor-pointer transition-all transform-gpu translate-z-5 hover:transform-gpu hover:translate-z-8 hover:scale-110 hover:bg-[#5ee7ff] hover:text-[#0a0a0a]"
                onMouseEnter={(e) => gsap.to(e.target, { z: 40, scale: 1.1, duration: 0.3, ease: 'power2.out' })}
                onMouseLeave={(e) => gsap.to(e.target, { z: 20, scale: 1, duration: 0.3, ease: 'power2.out' })}
              >
                <Mail className="h-5 w-5" />
              </button>
              <button 
                type="button"
                className="w-12 h-12 rounded-full flex items-center justify-center bg-[rgba(30,30,40,0.7)] border border-[rgba(100,100,255,0.2)] text-white text-xl cursor-pointer transition-all transform-gpu translate-z-5 hover:transform-gpu hover:translate-z-8 hover:scale-110 hover:bg-[#5ee7ff] hover:text-[#0a0a0a]"
                onMouseEnter={(e) => gsap.to(e.target, { z: 40, scale: 1.1, duration: 0.3, ease: 'power2.out' })}
                onMouseLeave={(e) => gsap.to(e.target, { z: 20, scale: 1, duration: 0.3, ease: 'power2.out' })}
              >
                <Linkedin className="h-5 w-5" />
              </button>
              <button 
                type="button"
                className="w-12 h-12 rounded-full flex items-center justify-center bg-[rgba(30,30,40,0.7)] border border-[rgba(100,100,255,0.2)] text-white text-xl cursor-pointer transition-all transform-gpu translate-z-5 hover:transform-gpu hover:translate-z-8 hover:scale-110 hover:bg-[#5ee7ff] hover:text-[#0a0a0a]"
                onMouseEnter={(e) => gsap.to(e.target, { z: 40, scale: 1.1, duration: 0.3, ease: 'power2.out' })}
                onMouseLeave={(e) => gsap.to(e.target, { z: 20, scale: 1, duration: 0.3, ease: 'power2.out' })}
              >
                <Github className="h-5 w-5" />
              </button>
            </div>
            
            <p className="help-text text-[#777] mt-5 text-sm text-center">
              By signing up, you agree to our <Link to="#" className="text-[#5ee7ff] no-underline transition-all hover:text-shadow-[0_0_10px_rgba(94,231,255,0.5)]">Terms</Link> and <Link to="#" className="text-[#5ee7ff] no-underline transition-all hover:text-shadow-[0_0_10px_rgba(94,231,255,0.5)]">Privacy Policy</Link>
            </p>
          </form>
          
          <div ref={floatingElementsRef} className="floating-elements absolute top-0 left-0 w-full h-full z-[-1] overflow-hidden"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
