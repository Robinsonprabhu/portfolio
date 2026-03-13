/* ============================================================
   ALEX CHEN — PORTFOLIO JAVASCRIPT
   Features:
     - Custom cursor tracking
     - Sticky nav with scroll detection
     - Mobile hamburger menu
     - Hero typing animation
     - Scroll-reveal animations (IntersectionObserver)
     - Animated skill bars on enter
     - Contact form validation
     - Smooth internal anchor scrolling
   ============================================================ */

'use strict';

/* ─── UTILITY: Query helpers ─────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─── WAIT FOR DOM ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  initCursor();
  initNav();
  initTypingAnimation();
  initScrollReveal();
  initSkillBars();
  initContactForm();
  initSmoothScroll();
  initActiveNavHighlight();

});

/* ============================================================
   1. CUSTOM CURSOR
   ============================================================ */
function initCursor() {
  const cursor   = $('#cursor');
  const follower = $('#cursor-follower');

  if (!cursor || !follower) return;
  if (window.matchMedia('(pointer: coarse)').matches) {
    // Touch device — hide custom cursor, restore default
    cursor.style.display   = 'none';
    follower.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  let mx = 0, my = 0;      // mouse position
  let fx = 0, fy = 0;      // follower position
  let rafId;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  // Smooth follower animation via rAF
  function animateFollower() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    rafId = requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Cursor state on hoverable elements
  const hoverTargets = 'a, button, .project-card, .skill-category, .tag, input, textarea';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      cursor.classList.add('cursor--link');
      follower.classList.add('cursor-follower--link');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      cursor.classList.remove('cursor--link');
      follower.classList.remove('cursor-follower--link');
    }
  });
}

/* ============================================================
   2. STICKY NAV + HAMBURGER MENU
   ============================================================ */
function initNav() {
  const nav       = $('#nav');
  const hamburger = $('#hamburger');
  const navLinks  = $('#nav-links');

  if (!nav) return;

  /* Scroll class */
  function handleScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run once

  /* Hamburger toggle */
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      navLinks.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close on nav link click (mobile)
    $$('.nav__link', navLinks).forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && navLinks.classList.contains('open')) {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
}

/* ============================================================
   3. HERO TYPING ANIMATION
   ============================================================ */
function initTypingAnimation() {
  const el = $('#typed-text');
  if (!el) return;

  const phrases = [
    'scalable APIs.',
    'beautiful UIs.',
    'fast products.',
    'clean code.',
    'great software.',
  ];

  let phraseIdx = 0;
  let charIdx   = 0;
  let isDeleting = false;
  let timeoutId;

  const TYPING_SPEED   = 80;   // ms per char when typing
  const DELETING_SPEED = 45;   // ms per char when deleting
  const PAUSE_END      = 1800; // pause at end of phrase
  const PAUSE_START    = 300;  // pause before next phrase

  function tick() {
    const phrase = phrases[phraseIdx];

    if (isDeleting) {
      charIdx--;
      el.textContent = phrase.slice(0, charIdx);
      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx  = (phraseIdx + 1) % phrases.length;
        timeoutId  = setTimeout(tick, PAUSE_START);
        return;
      }
      timeoutId = setTimeout(tick, DELETING_SPEED);
    } else {
      charIdx++;
      el.textContent = phrase.slice(0, charIdx);
      if (charIdx === phrase.length) {
        isDeleting = true;
        timeoutId  = setTimeout(tick, PAUSE_END);
        return;
      }
      timeoutId = setTimeout(tick, TYPING_SPEED);
    }
  }

  // Small initial delay so it doesn't fire immediately on load
  timeoutId = setTimeout(tick, 700);
}

/* ============================================================
   4. SCROLL REVEAL (IntersectionObserver)
   ============================================================ */
function initScrollReveal() {
  const targets = $$('.reveal-up, .reveal-right');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px',
  });

  targets.forEach(el => observer.observe(el));
}

/* ============================================================
   5. ANIMATED SKILL BARS
   Fires when the skills section enters the viewport
   ============================================================ */
function initSkillBars() {
  const bars = $$('.skill-bar');
  if (!bars.length) return;

  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        bars.forEach(bar => {
          const pct  = bar.dataset.pct || '0';
          const fill = bar.querySelector('.skill-bar__fill');
          if (fill) {
            // Small stagger per bar based on its index
            const idx = bars.indexOf(bar);
            setTimeout(() => {
              fill.style.width = pct + '%';
            }, idx * 80);
          }
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const skillsSection = $('#skills');
  if (skillsSection) observer.observe(skillsSection);
}

/* ============================================================
   6. CONTACT FORM VALIDATION
   ============================================================ */
function initContactForm() {
  const form      = $('#contact-form');
  if (!form) return;

  const submitBtn  = $('#submit-btn');
  const submitText = $('#submit-text');
  const submitIcon = $('#submit-icon');
  const successEl  = $('#form-success');

  /* Field refs */
  const fields = {
    name:    { input: $('#name'),    error: $('#error-name'),    group: $('#group-name') },
    email:   { input: $('#email'),   error: $('#error-email'),   group: $('#group-email') },
    subject: { input: $('#subject'), error: $('#error-subject'), group: $('#group-subject') },
    message: { input: $('#message'), error: $('#error-message'), group: $('#group-message') },
  };

  /* Validators */
  const validators = {
    name:    v => v.trim().length >= 2 ? '' : 'Please enter your name (min 2 characters).',
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
    subject: v => v.trim().length >= 4 ? '' : 'Subject must be at least 4 characters.',
    message: v => v.trim().length >= 20 ? '' : 'Message must be at least 20 characters.',
  };

  /* Show / clear single field error */
  function setError(key, msg) {
    const { error, group } = fields[key];
    if (msg) {
      error.textContent = msg;
      group.classList.add('has-error');
    } else {
      error.textContent = '';
      group.classList.remove('has-error');
    }
  }

  /* Live validation on blur */
  Object.keys(fields).forEach(key => {
    const { input } = fields[key];
    if (input) {
      input.addEventListener('blur', () => {
        setError(key, validators[key](input.value));
      });
      input.addEventListener('input', () => {
        // Clear error while user is typing if it was previously shown
        if (fields[key].group.classList.contains('has-error')) {
          setError(key, validators[key](input.value));
        }
      });
    }
  });

  /* Submit */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    Object.keys(fields).forEach(key => {
      const { input } = fields[key];
      const msg = validators[key](input ? input.value : '');
      setError(key, msg);
      if (msg) isValid = false;
    });

    if (!isValid) return;

    /* Simulate async send */
    submitBtn.disabled = true;
    submitText.textContent = 'Sending…';
    submitIcon.style.display = 'none';

    setTimeout(() => {
      // Reset button
      submitBtn.disabled = false;
      submitText.textContent = 'Send Message';
      submitIcon.style.display = '';

      // Show success
      successEl.classList.add('show');
      form.reset();

      // Hide success after a while
      setTimeout(() => successEl.classList.remove('show'), 6000);
    }, 1600);
  });
}

/* ============================================================
   7. SMOOTH SCROLL (for browsers that don't support CSS scroll-behavior)
   ============================================================ */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ============================================================
   8. ACTIVE NAV HIGHLIGHT (scroll spy)
   ============================================================ */
function initActiveNavHighlight() {
  const sections  = $$('section[id]');
  const navLinks  = $$('.nav__link');
  if (!sections.length || !navLinks.length) return;

  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70;

  function updateActive() {
    let current = '';
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= navH + 40) current = sec.id;
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${current}`);
      if (href === `#${current}`) {
        link.style.color = 'var(--accent)';
      } else {
        link.style.color = '';
      }
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
}

/* ============================================================
   9. RESUME BUTTON (generates a placeholder download)
   ============================================================ */
(function setupResumeBtn() {
  const btn = $('#resume-btn');
  if (!btn) return;
  // Prevent default & show a friendly notice since this is a demo
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    alert('📄 In a real portfolio, this would download your resume PDF. Add your resume file and update the href attribute!');
  });
})();
