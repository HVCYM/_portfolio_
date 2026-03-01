(function () {
  'use strict';

  // ----- Dynamic Particle Background -----
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    let mouse = { x: null, y: null, radius: 150 };

    function getParticleColor() {
      const theme = document.documentElement.getAttribute('data-theme');
      return theme === 'light' ? '0, 0, 0' : '255, 255, 255';
    }

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.baseX = this.x;
        this.baseY = this.y;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.density = Math.random() * 30 + 1;
      }

      update() {
        // Mouse interaction - particles move away from cursor
        if (mouse.x != null && mouse.y != null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const maxDistance = mouse.radius;
          const force = (maxDistance - distance) / maxDistance;
          const directionX = forceDirectionX * force * this.density;
          const directionY = forceDirectionY * force * this.density;

          if (distance < mouse.radius) {
            this.x -= directionX;
            this.y -= directionY;
          } else {
            if (this.x !== this.baseX) {
              const dx = this.x - this.baseX;
              this.x -= dx / 10;
            }
            if (this.y !== this.baseY) {
              const dy = this.y - this.baseY;
              this.y -= dy / 10;
            }
          }
        }

        // Normal movement
        this.baseX += this.speedX;
        this.baseY += this.speedY;

        if (this.baseX > canvas.width) this.baseX = 0;
        if (this.baseX < 0) this.baseX = canvas.width;
        if (this.baseY > canvas.height) this.baseY = 0;
        if (this.baseY < 0) this.baseY = canvas.height;
      }

      draw() {
        const color = getParticleColor();
        const theme = document.documentElement.getAttribute('data-theme');
        
        // Add glow effect in dark mode
        if (theme === 'dark') {
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgba(${color}, ${this.opacity * 0.5})`;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fillStyle = `rgba(${color}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
      }
    }

    function init() {
      resizeCanvas();
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 12000);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function connectParticles() {
      const color = getParticleColor();
      const theme = document.documentElement.getAttribute('data-theme');
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const opacity = (1 - distance / 120) * 0.2;
            
            // Add glow to lines in dark mode
            if (theme === 'dark') {
              ctx.shadowBlur = 5;
              ctx.shadowColor = `rgba(${color}, ${opacity * 0.3})`;
            }
            
            ctx.strokeStyle = `rgba(${color}, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            
            ctx.shadowBlur = 0;
          }
        }
      }

      // Connect particles to mouse
      if (mouse.x != null && mouse.y != null && theme === 'dark') {
        particles.forEach(particle => {
          const dx = mouse.x - particle.x;
          const dy = mouse.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            const opacity = (1 - distance / mouse.radius) * 0.3;
            ctx.shadowBlur = 8;
            ctx.shadowColor = `rgba(${color}, ${opacity})`;
            ctx.strokeStyle = `rgba(${color}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    }

    // Mouse move event
    canvas.addEventListener('mousemove', (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    });

    canvas.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    init();
    animate();

    window.addEventListener('resize', () => {
      cancelAnimationFrame(animationFrameId);
      init();
      animate();
    });

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      // Redraw on theme change
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  // ----- Theme toggle -----
  const themeToggle = document.querySelector('.theme-toggle');
  const html = document.documentElement;
  const profileImg = document.querySelector('.hero-profile-pic img');
  
  // Check for saved theme preference or default to 'dark'
  const currentTheme = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', currentTheme);

  // Function to update profile image based on theme
  function updateProfileImage(theme) {
    if (profileImg) {
      if (theme === 'light') {
        profileImg.src = '/_portfolio_/assets/pic.png';
      } else {
        profileImg.src = '/_portfolio_/assets/pic.jpg';
      }
    }
  }

  // Set initial profile image
  updateProfileImage(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Update profile image
      updateProfileImage(newTheme);
    });
  }

  // ----- Cursor bubble -----
  const bubble = document.querySelector('.cursor-bubble');
  if (bubble) {
    let mouseX = 0, mouseY = 0;
    let bubbleX = 0, bubbleY = 0;
    let rafId = null;

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function animate() {
      bubbleX = lerp(bubbleX, mouseX, 0.12);
      bubbleY = lerp(bubbleY, mouseY, 0.12);
      bubble.style.left = bubbleX + 'px';
      bubble.style.top = bubbleY + 'px';
      rafId = requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      bubble.classList.add('is-visible');
      if (!rafId) rafId = requestAnimationFrame(animate);
    });

    document.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('mouseenter', () => bubble.classList.add('is-active'));
      el.addEventListener('mouseleave', () => bubble.classList.remove('is-active'));
    });

    document.addEventListener('mouseleave', () => bubble.classList.remove('is-visible', 'is-active'));
  }

  // ----- Scroll reveal -----
  const revealEls = document.querySelectorAll(
    '.section-title, .about-card, .achievement-card, .timeline-item, .skills-group, .project-card, .contact-intro, .contact-links, .contact-coding-wrap'
  );

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, observerOptions);

  revealEls.forEach((el, index) => {
    el.classList.add('reveal');
    const delay = Math.min(index * 0.08, 0.6);
    el.style.transitionDelay = delay + 's';
    observer.observe(el);
  });

  // ----- Nav hide on scroll down, show on scroll up -----
  const nav = document.querySelector('.nav');
  let lastScrollY = window.scrollY;
  const scrollThreshold = 80;

  function onScroll() {
    const currentScrollY = window.scrollY;
    // Commented out to keep nav always visible
    // if (currentScrollY > scrollThreshold) {
    //   if (currentScrollY > lastScrollY) {
    //     nav.classList.add('nav-hidden');
    //   } else {
    //     nav.classList.remove('nav-hidden');
    //   }
    // } else {
    //   nav.classList.remove('nav-hidden');
    // }
    lastScrollY = currentScrollY;
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ----- Mobile nav toggle -----
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ----- Smooth scroll for anchor links (optional enhancement) -----
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ----- Contact: hover to reveal email / phone -----
  document.querySelectorAll('.contact-card-reveal').forEach((card) => {
    const revealed = card.querySelector('.contact-revealed');
    const email = card.getAttribute('data-email');
    const tel = card.getAttribute('data-tel');

    card.addEventListener('mouseenter', function () {
      card.classList.add('is-revealed');
      if (email) {
        revealed.textContent = email;
        card.href = 'mailto:' + email;
        card.setAttribute('aria-label', 'Send email to ' + email);
      } else if (tel) {
        revealed.textContent = tel;
        card.href = 'tel:' + tel;
        card.setAttribute('aria-label', 'Call ' + tel);
      }
    });

    card.addEventListener('mouseleave', function () {
      card.classList.remove('is-revealed');
    });
  });

  // ----- Typewriter effect -----
  const typewriterEl = document.getElementById('typewriter');
  if (typewriterEl) {
    const roles = ['Software Developer', 'Problem Solver', 'Competitive Programmer'];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
      const currentRole = roles[roleIndex];
      
      if (isDeleting) {
        typewriterEl.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
      } else {
        typewriterEl.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
      }

      if (!isDeleting && charIndex === currentRole.length) {
        typingSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 500;
      }

      setTimeout(type, typingSpeed);
    }

    type();
  }

  // ----- Resume Dropdown -----
  const resumeDropdown = document.querySelector('.resume-dropdown');
  const resumeButton = resumeDropdown?.querySelector('.btn-resume');

  if (resumeDropdown && resumeButton) {
    resumeButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      resumeDropdown.classList.toggle('is-open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!resumeDropdown.contains(e.target)) {
        resumeDropdown.classList.remove('is-open');
      }
    });

    // Prevent dropdown from closing when clicking inside menu
    const dropdownMenu = resumeDropdown.querySelector('.resume-dropdown-menu');
    if (dropdownMenu) {
      dropdownMenu.addEventListener('click', (e) => {
        // Allow links to work but close dropdown after click
        if (e.target.closest('.resume-dropdown-item')) {
          setTimeout(() => {
            resumeDropdown.classList.remove('is-open');
          }, 100);
        }
      });
    }

    // Close dropdown on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && resumeDropdown.classList.contains('is-open')) {
        resumeDropdown.classList.remove('is-open');
        resumeButton.focus();
      }
    });
  }
})();
