import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollPath } from './components/ScrollPath';
import { AnimatedSection } from './components/AnimatedSection';

gsap.registerPlugin(ScrollTrigger);

// Twinling Stars Component
const StarBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let stars: {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      flashSpeed: number;
    }[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const starCount = Math.floor((width * height) / 8000);
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          alpha: Math.random(),
          flashSpeed: Math.random() * 0.015 + 0.005,
        });
      }
    };

    let animationFrameId: number;
    const animateStars = () => {
      ctx.clearRect(0, 0, width, height);
      stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        // Fast rectangular blit instead of arc path rendering
        const size = star.radius * 2;
        ctx.fillRect(star.x - star.radius, star.y - star.radius, size, size);

        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        star.alpha += star.flashSpeed;
        if (star.alpha > 1 || star.alpha < 0.2) {
          star.flashSpeed = -star.flashSpeed;
        }
      });
      animationFrameId = requestAnimationFrame(animateStars);
    };

    window.addEventListener('resize', resize);
    initStars();
    animateStars();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div id="star-container" className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [introFade, setIntroFade] = useState(false);
  const [activeNav, setActiveNav] = useState('hero');

  // Trigger intro fade-out sequence
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIntroFade(true);
      const removeTimer = setTimeout(() => {
        setShowIntro(false);
      }, 1000);
      return () => clearTimeout(removeTimer);
    }, 2000); // 2s display time

    return () => clearTimeout(fadeTimer);
  }, []);

  // Track active section for sidebar navbar highlights
  useEffect(() => {
    const triggers: ScrollTrigger[] = [];
    const sections = ['hero', 'about', 'skills', 'projects', 'experience', 'contact'];

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: self => {
          if (self.isActive) {
            setActiveNav(id);
          }
        },
      });
      triggers.push(st);
    });

    return () => {
      triggers.forEach(st => st.kill());
    };
  }, []);

  const handleNavClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const skillsList = [
    'Python', 'Java', 'JavaScript', 'React', 'React Native', 'Expo', 'Node.js',
    'Express', 'MySQL', 'PostgreSQL', 'FastAPI', 'Supabase', 'Firebase', 'Gemini AI',
    'Groq AI', 'LLMs', 'Prophet', 'scikit-learn', 'Whisper API', 'HTML/CSS', 'Git',
    'Linux', 'TensorFlow', 'Flask', 'OpenCV'
  ];

  const projectsList = [
    {
      title: 'ShopIQ',
      subtitle: 'AI-Powered Kirana Management System',
      tags: ['React Native', 'Expo', 'Supabase', 'FastAPI', 'Gemini AI', 'Prophet', 'Whisper API'],
      desc: 'Full-stack mobile app for Indian kirana stores — AI demand forecasting, WhatsApp automation, voice input in Hindi & Kannada, and profit analytics. Built at OkCredit Finternship.'
    },
    {
      title: 'PropagandaLens',
      subtitle: 'Multilingual Propaganda & Manipulation Detector',
      tags: ['Python', 'FastAPI', 'Groq AI', 'Helsinki-NLP', 'React'],
      desc: 'AI-powered tool detecting 8 rhetorical manipulation techniques in English & Hindi. Features temporal analysis, explainable AI chat, and PDF reports.',
      link: 'https://propaganda-lens.vercel.app/'
    },
    {
      title: 'UnMask',
      subtitle: 'AI Deepfake Detection System',
      tags: ['TensorFlow', 'EfficientNetB0', 'Flask', 'OpenCV', 'MTCNN'],
      desc: 'Real-time deepfake detection for images & videos using ensemble deep learning — built at FOOBAR 10.0 Hackathon (Cybersecurity Domain).',
      link: 'https://unmask-nan8.onrender.com/'
    },
    {
      title: 'KAPP - AI Career Map',
      subtitle: 'AI Career Navigator',
      tags: ['Python', 'Gemini 2.5', 'React', 'Agents'],
      desc: 'AI-powered career guidance platform using multi-agent architecture to analyze resumes and generate roadmaps.',
      link: 'https://kapp-rho.vercel.app/'
    },
    {
      title: 'Code Review Tool',
      subtitle: 'Static Analysis Web App',
      tags: ['Python', 'AST', 'JavaScript'],
      desc: 'Designed and built a static code analysis tool that detects unused variables and poor coding practices.',
      link: 'https://prash-2402.github.io/code-review-tool/'
    },
    {
      title: 'Fitness & TDEE Calc',
      subtitle: 'Health Utility Web App',
      tags: ['JavaScript', 'CSS', 'Health Logic'],
      desc: 'Interactive fitness calculator for TDEE, calorie deficit/surplus, and daily intake planning.',
      link: 'https://prash-2402.github.io/fitness-calculator/'
    }
  ];

  return (
    <div className="relative min-h-screen text-white font-outfit bg-[#050505] selection:bg-[#00ff9c]/30 selection:text-[#00ff9c]">
      <StarBackground />

      {/* Intro sequence overlay */}
      {showIntro && (
        <div
          id="intro-overlay"
          className="transition-opacity duration-1000 ease-in-out pointer-events-none"
          style={{ opacity: introFade ? 0 : 1 }}
        >
          <h1 className="intro-text select-none text-3xl md:text-5xl font-bold text-white leading-tight">
            Welcome to my Portfolio
          </h1>
          <p className="intro-sub select-none text-base md:text-xl font-light text-gray-400 mt-4">
            Initiating Launch Sequence...
          </p>
        </div>
      )}

      {/* Navigation sidebar */}
      <nav className="glass-panel backdrop-blur-xl border-r border-white/5 transition-all duration-300">
        <div
          className="logo cursor-pointer font-bold tracking-wider hover:opacity-80 transition-opacity"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Prajwal Hangaragi
        </div>
        <ul>
          <li>
            <a
              href="#about"
              className={activeNav === 'about' ? 'active-link' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('about');
              }}
            >
              About
            </a>
          </li>
          <li>
            <a
              href="#skills"
              className={activeNav === 'skills' ? 'active-link' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('skills');
              }}
            >
              Skills
            </a>
          </li>
          <li>
            <a
              href="#projects"
              className={activeNav === 'projects' ? 'active-link' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('projects');
              }}
            >
              Projects
            </a>
          </li>
          <li>
            <a
              href="#experience"
              className={activeNav === 'experience' ? 'active-link' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('experience');
              }}
            >
              Experience
            </a>
          </li>
          <li>
            <a
              href="#contact"
              className={activeNav === 'contact' ? 'active-link' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('contact');
              }}
            >
              Contact
            </a>
          </li>
        </ul>
      </nav>

      {/* Content pane offset on desktop for vertical nav */}
      <main className="md:ml-[180px] min-h-screen relative pb-[80px] md:pb-0 z-0">
        
        {/* Scroll Progress SVG Path Layer */}
        <ScrollPath />

        {/* Hero Section */}
        <AnimatedSection
          id="hero"
          className="container min-h-screen flex items-center justify-center text-center relative py-12"
        >
          <div className="hero-content max-w-4xl px-4 flex flex-col items-center">
            <div className="profile-container mb-8 relative inline-block group">
              <img
                src="docs/resumepic.png"
                alt="Prajwal S Hangaragi"
                className="profile-img w-36 h-36 md:w-44 md:h-44 object-cover rounded-full border-3 border-[#00ff9c] shadow-[0_0_20px_rgba(0,255,156,0.6)] transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(0,255,156,0.8),_0_0_60px_rgba(0,255,156,0.3)]"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight leading-tight select-none">
              Hi, I’m <span className="text-accent">Prajwal S Hangaragi</span>
            </h1>
            <p className="text-lg md:text-2xl font-light text-gray-400 mb-4 max-w-2xl select-none">
              Computer Science (AIML) Student | Cybersecurity Enthusiast
            </p>
            <p className="text-sm md:text-base text-gray-300 max-w-2xl mb-8 leading-relaxed font-light select-none">
              I build secure, clean, and efficient software systems with a focus on AI, Web Development, and Automation.
            </p>
            <div className="hero-btns flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => handleNavClick('projects')}
                className="btn btn-primary bg-[#00ff9c] hover:bg-white text-black px-8 py-3 rounded-full font-semibold transition-all hover:scale-105 shadow-[0_0_15px_rgba(0,255,156,0.6)] hover:shadow-[0_0_25px_rgba(255,255,255,0.8)]"
              >
                View Projects
              </button>
              <a
                href="docs/res_1702.pdf"
                target="_blank"
                rel="noreferrer"
                className="btn btn-glass bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-semibold border border-white/20 hover:border-white transition-all"
              >
                Download Resume
              </a>
            </div>
          </div>
        </AnimatedSection>

        {/* About Section */}
        <AnimatedSection id="about" className="container py-24 md:py-32">
          <h2 className="section-title text-3xl md:text-4xl text-center mb-12 font-bold tracking-tight">
            <span className="border-b-3 border-[#00ff9c] pb-1">About Me</span>
          </h2>
          <div className="max-w-3xl mx-auto px-4">
            <div className="glass-panel text-gray-300 space-y-6 leading-relaxed font-light text-base md:text-lg">
              <p>
                I am a Computer Science undergraduate specializing in **Artificial Intelligence and Machine Learning** at Christ University, Bangalore. With a minor honours specialization in **Cybersecurity**, my passion lies at the intersection of intelligence and security.
              </p>
              <p>
                I have hands-on experience building full-stack applications, intelligent code analysis assistants, automation pipelines, and robust database layers. My tech stack spans across Python, Java, JavaScript/TypeScript, React, React Native, Supabase, FastAPI, and TensorFlow.
              </p>
              <p>
                I thrive on translating complex mathematical models and algorithms into clean, production-grade applications that solve real-world problems. Whether designing multi-agent AI ecosystems or developing high-accuracy deepfake detectors, I prioritize writing secure, efficient, and scalable code.
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Skills Section */}
        <AnimatedSection id="skills" className="container py-24 md:py-32">
          <h2 className="section-title text-3xl md:text-4xl text-center mb-12 font-bold tracking-tight">
            <span className="border-b-3 border-[#00ff9c] pb-1">Skills</span>
          </h2>
          <div className="max-w-4xl mx-auto px-4">
            <div className="glass-panel p-8">
              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                {skillsList.map((skill, index) => (
                  <span
                    key={index}
                    className="tag bg-[#00ff9c]/10 text-[#00ff9c] border border-[#00ff9c]/20 px-4 py-2 rounded-full text-xs md:text-sm font-semibold tracking-wide hover:bg-[#00ff9c]/20 hover:border-[#00ff9c]/40 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Projects Section */}
        <AnimatedSection id="projects" className="container py-24 md:py-32">
          <h2 className="section-title text-3xl md:text-4xl text-center mb-12 font-bold tracking-tight">
            <span className="border-b-3 border-[#00ff9c] pb-1">Projects</span>
          </h2>
          <div className="projects-grid grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
            {projectsList.map((proj, idx) => (
              <div key={idx} className="glass-panel project-card flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-1 tracking-tight text-white select-none">
                    {proj.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400 font-medium mb-3">
                    {proj.subtitle}
                  </p>
                  <div className="project-tags flex flex-wrap gap-2 mb-4">
                    {proj.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="tag bg-[#00ff9c]/10 text-[#00ff9c] border border-[#00ff9c]/20 px-2 py-0.5 rounded-md text-[10px] md:text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6 font-light">
                    {proj.desc}
                  </p>
                </div>
                {proj.link && (
                  <a
                    href={proj.link}
                    target="_blank"
                    rel="noreferrer"
                    className="project-link inline-flex items-center text-[#00ff9c] hover:underline text-sm font-semibold mt-auto"
                  >
                    Live Demo
                    <i className="fas fa-external-link-alt ml-1.5 text-xs"></i>
                  </a>
                )}
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Experience Section */}
        <AnimatedSection id="experience" className="container py-24 md:py-32">
          <h2 className="section-title text-3xl md:text-4xl text-center mb-12 font-bold tracking-tight">
            <span className="border-b-3 border-[#00ff9c] pb-1">Experience & Education</span>
          </h2>
          <div className="max-w-4xl mx-auto px-4 space-y-8">
            {/* Experience Item - OkCredit */}
            <div className="glass-panel p-6 md:p-8 space-y-4">
              <div className="flex flex-col md:flex-row justify-between md:items-center">
                <h3 className="text-xl md:text-2xl font-bold text-white">OkCredit Finternship</h3>
                <span className="text-xs md:text-sm text-gray-400 font-light mt-1 md:mt-0">
                  8-Week FinTech Product Hackathon (2025)
                </span>
              </div>
              <p className="text-sm text-[#00ff9c] font-semibold">
                Project Lead — ShopIQ Kirana Application
              </p>
              <ul className="list-disc list-outside ml-5 text-gray-300 font-light text-sm md:text-base space-y-2">
                <li>Built a full-stack Kirana management mobile system supporting voice inventory updates (in Hindi & Kannada), profit analytics, and auto-udhar billing.</li>
                <li>Conducted customer research and validated merchant pain points at Bengaluru store fronts to refine user flows.</li>
                <li>Engineered time-series demand forecasting using Prophet to help store owners optimize inventory.</li>
              </ul>
            </div>

            {/* Experience Item - FOOBAR Hackathon */}
            <div className="glass-panel p-6 md:p-8 space-y-4">
              <div className="flex flex-col md:flex-row justify-between md:items-center">
                <h3 className="text-xl md:text-2xl font-bold text-white">FOOBAR 10.0 Hackathon</h3>
                <span className="text-xs md:text-sm text-gray-400 font-light mt-1 md:mt-0">
                  Cybersecurity Domain Winner (24 Hrs)
                </span>
              </div>
              <p className="text-sm text-[#00ff9c] font-semibold">
                Creator — UnMask AI Deepfake Detector
              </p>
              <ul className="list-disc list-outside ml-5 text-gray-300 font-light text-sm md:text-base space-y-2">
                <li>Designed an ensemble neural network (EfficientNetB0) deepfake classifier with MTCNN face extraction.</li>
                <li>Achieved 94–96% classification accuracy under intense 24-hour hackathon conditions.</li>
                <li>Shipped REST endpoints in Flask supporting high-throughput frame analysis for raw videos.</li>
              </ul>
            </div>

            {/* Education Item - Christ University */}
            <div className="glass-panel p-6 md:p-8 space-y-4">
              <div className="flex flex-col md:flex-row justify-between md:items-center">
                <h3 className="text-xl md:text-2xl font-bold text-white">B.Tech in Computer Science & Engineering (AI & ML)</h3>
                <span className="text-xs md:text-sm text-gray-400 font-light mt-1 md:mt-0">
                  Christ University, Bangalore | 2024 – 2028
                </span>
              </div>
              <p className="text-sm text-[#00ff9c] font-semibold">
                Specialization in AI & ML | Honours in Cybersecurity
              </p>
              <p className="text-gray-300 font-light text-sm md:text-base">
                Acquiring deep foundational and practical expertise in Artificial Intelligence models, deep learning networks, data engineering, static program analysis, secure system engineering, and cryptography.
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Contact Section */}
        <AnimatedSection id="contact" className="container py-24 md:py-32">
          <h2 className="section-title text-3xl md:text-4xl text-center mb-12 font-bold tracking-tight">
            <span className="border-b-3 border-[#00ff9c] pb-1">Contact Me</span>
          </h2>
          <div className="contact-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
            
            {/* Email Card */}
            <div className="glass-panel contact-card flex flex-col items-center justify-center p-6 text-center">
              <i className="fas fa-envelope contact-icon text-3xl text-[#00ff9c] mb-4"></i>
              <h3 className="font-semibold text-lg text-white mb-1">Email</h3>
              <p className="text-sm text-gray-400 font-light truncate w-full max-w-xs">
                prajwal.s.2h@gmail.com
              </p>
            </div>

            {/* GitHub Card */}
            <a
              href="https://github.com/Prash-2402"
              target="_blank"
              rel="noreferrer"
              className="glass-panel contact-card flex flex-col items-center justify-center p-6 text-center hover:border-[#00ff9c]/30 hover:scale-105 transition-all"
            >
              <i className="fab fa-github contact-icon text-3xl text-[#00ff9c] mb-4"></i>
              <h3 className="font-semibold text-lg text-white mb-1">GitHub</h3>
              <p className="text-sm text-gray-400 font-light truncate w-full max-w-xs">
                github.com/Prash-2402
              </p>
            </a>

            {/* LinkedIn Card */}
            <a
              href="https://www.linkedin.com/in/prajwal-s-hangaragi-578586315"
              target="_blank"
              rel="noreferrer"
              className="glass-panel contact-card flex flex-col items-center justify-center p-6 text-center hover:border-[#00ff9c]/30 hover:scale-105 transition-all"
            >
              <i className="fab fa-linkedin contact-icon text-3xl text-[#00ff9c] mb-4"></i>
              <h3 className="font-semibold text-lg text-white mb-1">LinkedIn</h3>
              <p className="text-sm text-gray-400 font-light">
                Connect with me
              </p>
            </a>

            {/* Phone Card */}
            <div className="glass-panel contact-card flex flex-col items-center justify-center p-6 text-center">
              <i className="fas fa-phone contact-icon text-3xl text-[#00ff9c] mb-4"></i>
              <h3 className="font-semibold text-lg text-white mb-1">Phone</h3>
              <p className="text-sm text-gray-400 font-light">
                +91 7204557247
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Footer */}
        <footer className="text-center py-12 text-gray-500 text-sm border-t border-white/5 select-none">
          <p>&copy; {new Date().getFullYear()} Prajwal S Hangaragi. All Rights Reserved.</p>
        </footer>
      </main>
    </div>
  );
}
