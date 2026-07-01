// app.js - Portfolio UI & Animation Controller
import { initThreeScene, initAboutHologram } from './three-scene.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize the 3D Background and Hologram scenes
    try {
        initThreeScene();
        initAboutHologram();
    } catch (e) {
        console.error("Three.js initialization failed:", e);
    }

    // 2. Preloader & Intro Animation
    const preloader = document.getElementById('preloader');
    const progress = document.getElementById('preloader-bar');
    
    // Simulate loading progress
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            fadeOutPreloader();
        } else {
            width += Math.floor(Math.random() * 15) + 5;
            if (width > 100) width = 100;
            progress.style.width = width + '%';
        }
    }, 80);

    function fadeOutPreloader() {
        // Fade out preloader
        gsap.to(preloader, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
            onComplete: () => {
                preloader.style.visibility = 'hidden';
                preloader.setAttribute('aria-hidden', 'true');
                triggerHeroIntro();
            }
        });
    }

    // Hero Entry Animation Timeline
    function triggerHeroIntro() {
        const tl = gsap.timeline();
        
        // Ensure nav-links hover works post-intro
        tl.fromTo('header', 
            { y: -100, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
        )
        .fromTo('#hero-tagline-text', 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
            '-=0.6'
        )
        .fromTo('#hero-main-title', 
            { opacity: 0, y: 40 }, 
            { opacity: 1, y: 0, duration: 1, ease: 'power4.out' },
            '-=0.6'
        )
        .fromTo('#hero-desc-text', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
            '-=0.6'
        )
        .fromTo('#hero-btn-container', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
            '-=0.6'
        );
    }

    // 3. ScrollTrigger Animations for Page Content
    // Register GSAP ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // About Section Animation
    gsap.fromTo('.about-card', 
        { opacity: 0, x: -60 },
        { 
            opacity: 1, 
            x: 0, 
            duration: 1.2, 
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '#about',
                start: 'top 70%',
                toggleActions: 'play none none none'
            }
        }
    );

    gsap.fromTo('.about-visual', 
        { opacity: 0, scale: 0.8 },
        { 
            opacity: 1, 
            scale: 1, 
            duration: 1.5, 
            ease: 'elastic.out(1, 0.75)',
            scrollTrigger: {
                trigger: '#about',
                start: 'top 70%',
                toggleActions: 'play none none none'
            }
        }
    );

    // Skills Animations (Trigger bars filling up)
    const skillBars = document.querySelectorAll('.skill-bar-fill');
    
    gsap.to(skillBars, {
        scrollTrigger: {
            trigger: '#skills',
            start: 'top 70%',
            onEnter: () => {
                skillBars.forEach(bar => {
                    const progressVal = bar.getAttribute('data-progress');
                    bar.style.transform = `scaleX(${parseInt(progressVal) / 100})`;
                });
            }
        }
    });

    // Projects Grid Animation (Staggered fade/slide)
    gsap.fromTo('.project-card', 
        { opacity: 0, y: 50 },
        { 
            opacity: 1, 
            y: 0, 
            duration: 0.8, 
            stagger: 0.15, 
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '#projects',
                start: 'top 75%',
                toggleActions: 'play none none none'
            }
        }
    );

    // Contact Form Animation
    gsap.fromTo('.contact-info', 
        { opacity: 0, x: -40 },
        { 
            opacity: 1, 
            x: 0, 
            duration: 1, 
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '#contact',
                start: 'top 75%'
            }
        }
    );

    gsap.fromTo('.contact-form', 
        { opacity: 0, x: 40 },
        { 
            opacity: 1, 
            x: 0, 
            duration: 1, 
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '#contact',
                start: 'top 75%'
            }
        }
    );

    // 4. Navigation Link Active Tracker on Scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // 5. Contact Form Submission Handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Visual success feedback
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Sending...';
            submitBtn.style.opacity = '0.7';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.textContent = 'Message Sent Successfully!';
                submitBtn.style.background = 'linear-gradient(135deg, #00f2fe, #4facfe)';
                submitBtn.style.color = '#0b0b12';
                submitBtn.style.opacity = '1';
                
                // Clear input fields
                contactForm.reset();

                // Revert button state after 3 seconds
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.style.color = '';
                    submitBtn.disabled = false;
                }, 3000);
            }, 1200);
        });
    }

    // 6. Mobile Navigation Drawer Toggle
    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav');
    const navLinksList = document.querySelectorAll('.nav-link');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            const isOpen = mainNav.classList.toggle('active');
            navToggle.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isOpen);
        });

        // Close menu when clicking on any navigation link
        navLinksList.forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
});
