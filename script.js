/* ==========================================================================
   CURRENT AQUATICS ACADEMY — HOME PAGE INTERACTIONS
   Vanilla ES6. No external JS libraries.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------ */
  /* 0. PRELOADER                                                       */
  /* ------------------------------------------------------------------ */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader.classList.add('hidden'), 400);
  });
  // Fallback in case load event already fired
  setTimeout(() => preloader.classList.add('hidden'), 1800);

  /* ------------------------------------------------------------------ */
  /* 1. THEME TOGGLE (persists for the session)                         */
  /* ------------------------------------------------------------------ */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  const applyStoredTheme = () => {
    const stored = sessionStorage.getItem('academyTheme');
    if (stored === 'light') {
      root.classList.add('light');
      themeToggle.setAttribute('aria-pressed', 'true');
    }
  };
  try { applyStoredTheme(); } catch (e) { /* storage unavailable, ignore */ }

  themeToggle.addEventListener('click', () => {
    const isLight = root.classList.toggle('light');
    themeToggle.setAttribute('aria-pressed', String(isLight));
    try { sessionStorage.setItem('academyTheme', isLight ? 'light' : 'dark'); } catch (e) {}
  });

  /* ------------------------------------------------------------------ */
  /* 2. NAVBAR — blur/shrink on scroll + active link highlight          */
  /* ------------------------------------------------------------------ */
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('main section[id], main section');
  const navLinks = document.querySelectorAll('.nav-link');
  const backToTop = document.getElementById('backToTop');

  const onScroll = () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);

    // Back to top button visibility
    if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target.id) {
        navLinks.forEach((link) => {
          link.classList.toggle('active-link', link.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach((s) => { if (s.id) sectionObserver.observe(s); });

  /* ------------------------------------------------------------------ */
  /* 3. MOBILE MENU                                                      */
  /* ------------------------------------------------------------------ */
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  const closeMenu = () => {
    menuToggle.classList.remove('open');
    mobileMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    menuToggle.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  });

  document.querySelectorAll('.mobile-link, .mobile-menu .btn-enroll').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  /* ------------------------------------------------------------------ */
  /* 4. SCROLL-TRIGGERED FADE ANIMATIONS (Intersection Observer)         */
  /* ------------------------------------------------------------------ */
  const fadeEls = document.querySelectorAll('.fade-up, .fade-left, .fade-right');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  fadeEls.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 6, 5) * 70}ms`;
    fadeObserver.observe(el);
  });

  /* ------------------------------------------------------------------ */
  /* 5. ANIMATED COUNTERS (hero stats + highlights)                      */
  /* ------------------------------------------------------------------ */
  const counters = document.querySelectorAll('[data-count]');
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic for a natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach((c) => counterObserver.observe(c));

  /* ------------------------------------------------------------------ */
  /* 6. TILT EFFECT ON "WHY CHOOSE US" CARDS                             */
  /* ------------------------------------------------------------------ */
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateY(0)';
    });
  });

  /* ------------------------------------------------------------------ */
  /* 7. MAGNETIC BUTTON HOVER                                            */
  /* ------------------------------------------------------------------ */
  const magnets = document.querySelectorAll('.magnetic');
  magnets.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });

  /* ------------------------------------------------------------------ */
  /* 8. TESTIMONIAL CAROUSEL (auto-play + manual controls)               */
  /* ------------------------------------------------------------------ */
  const track = document.getElementById('testimonialTrack');
  const cards = track ? Array.from(track.children) : [];
  const dotsWrap = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  let current = 0;
  let autoplayId = null;

  if (track && cards.length) {
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    function update() {
      track.style.transform = `translateX(-${current * 100}%)`;
      dotsWrap.querySelectorAll('button').forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function goTo(index) {
      current = (index + cards.length) % cards.length;
      update();
    }

    function startAutoplay() {
      autoplayId = setInterval(() => goTo(current + 1), 5000);
    }
    function stopAutoplay() {
      clearInterval(autoplayId);
    }

    prevBtn.addEventListener('click', () => { goTo(current - 1); stopAutoplay(); startAutoplay(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); stopAutoplay(); startAutoplay(); });

    const carouselEl = document.getElementById('testimonialCarousel');
    carouselEl.addEventListener('mouseenter', stopAutoplay);
    carouselEl.addEventListener('mouseleave', startAutoplay);

    update();
    startAutoplay();
  }

  /* ------------------------------------------------------------------ */
  /* 9. BACK TO TOP                                                      */
  /* ------------------------------------------------------------------ */
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 10. FOOTER YEAR + NEWSLETTER FEEDBACK                               */
  /* ------------------------------------------------------------------ */
  document.getElementById('year').textContent = new Date().getFullYear();

  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      if (input.value) {
        input.value = '';
        input.placeholder = 'Subscribed! Thank you.';
        setTimeout(() => { input.placeholder = 'Your email'; }, 3000);
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* 11. HERO CANVAS — animated water ripples + bubbles + mouse parallax */
  /* ------------------------------------------------------------------ */
  const canvas = document.getElementById('waterCanvas');
  const heroSection = document.querySelector(
    '.home-hero, .about-hero, .programs-hero, .coaches-hero, .hero'
  );

  if (canvas && heroSection) {
  const ctx = canvas.getContext('2d');
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width, height;
  let bubbles = [];
  let ripples = [];
  let mouse = { x: 0.5, y: 0.5 };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resizeCanvas() {
    width = heroSection.offsetWidth;
    height = heroSection.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initBubbles() {
    bubbles = Array.from({ length: 34 }, () => ({
      x: Math.random() * width,
      y: height + Math.random() * height,
      r: 2 + Math.random() * 5,
      speed: 0.3 + Math.random() * 0.9,
      drift: (Math.random() - 0.5) * 0.4,
      opacity: 0.15 + Math.random() * 0.35,
    }));
  }

  function spawnRipple(x, y) {
    ripples.push({ x, y, r: 4, alpha: 0.5 });
  }

  function drawWaveLayer(offset, amplitude, speed, opacity, time) {
    ctx.beginPath();
    ctx.moveTo(0, height * 0.6);
    for (let x = 0; x <= width; x += 12) {
      const y = height * 0.6 + Math.sin((x * 0.008) + time * speed + offset) * amplitude
                + (mouse.y - 0.5) * 18;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, height * 0.5, 0, height);
    grad.addColorStop(0, `rgba(0, 212, 255, ${opacity})`);
    grad.addColorStop(1, `rgba(37, 99, 235, 0)`);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  let t = 0;
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Layered translucent waves — depth via parallax offset from mouse.x
    drawWaveLayer(0, 14, 0.6, 0.10, t + mouse.x * 2);
    drawWaveLayer(2, 20, 0.4, 0.07, t + mouse.x * 1.2);
    drawWaveLayer(4, 10, 0.8, 0.05, t);

    // Bubbles rising
    bubbles.forEach((b) => {
      b.y -= b.speed;
      b.x += b.drift + (mouse.x - 0.5) * 0.15;
      if (b.y < -10) { b.y = height + 10; b.x = Math.random() * width; }
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(184, 212, 240, ${b.opacity})`;
      ctx.fill();
    });

    // Ripples from clicks/moves
    ripples.forEach((r, i) => {
      r.r += 1.6;
      r.alpha -= 0.012;
      if (r.alpha <= 0) { ripples.splice(i, 1); return; }
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${r.alpha})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    });

    t += 0.01;
    if (!reduceMotion) requestAnimationFrame(animate);
  }

  resizeCanvas();
  initBubbles();
  animate();

  window.addEventListener('resize', () => {
    resizeCanvas();
    initBubbles();
  });

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) / rect.width;
    mouse.y = (e.clientY - rect.top) / rect.height;

    // Occasionally spawn a subtle ripple as the cursor moves
    if (Math.random() > 0.93) spawnRipple(e.clientX - rect.left, e.clientY - rect.top);

    // Parallax on floating cards
    const px = (mouse.x - 0.5) * 16;
    const py = (mouse.y - 0.5) * 16;
    document.querySelectorAll('.floating-card').forEach((card, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      card.style.transform = `translate(${px * dir}px, ${py * dir}px)`;
    });
  });

  heroSection.addEventListener('click', (e) => {
    const rect = heroSection.getBoundingClientRect();
    spawnRipple(e.clientX - rect.left, e.clientY - rect.top);
  });

  } // end hero canvas guard

  /* ------------------------------------------------------------------ */
  /* 12. CIRCULAR PROGRESS RINGS (About page — stats section)           */
  /* ------------------------------------------------------------------ */
  const progressCircles = document.querySelectorAll('.stat-circle');
  if (progressCircles.length) {
    const RADIUS = 52;
    const CIRC = 2 * Math.PI * RADIUS;

    progressCircles.forEach((c) => {
      const fill = c.querySelector('.circle-fill');
      fill.style.strokeDasharray = `${CIRC}`;
      fill.style.strokeDashoffset = `${CIRC}`;
    });

    const circleObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const percent = parseFloat(el.dataset.percent) || 0;
          const fill = el.querySelector('.circle-fill');
          const offset = CIRC - (percent / 100) * CIRC;
          requestAnimationFrame(() => {
            fill.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(0.22, 1, 0.36, 1)';
            fill.style.strokeDashoffset = `${offset}`;
          });
          circleObserver.unobserve(el);
        }
      });
    }, { threshold: 0.4 });

    progressCircles.forEach((c) => circleObserver.observe(c));
  }

  /* ------------------------------------------------------------------ */
  /* 13. TIMELINE SCROLL PROGRESS (About page — achievements timeline)  */
  /* ------------------------------------------------------------------ */
  const timelineTrack = document.querySelector('.timeline');
  if (timelineTrack) {
    const timelineItems = timelineTrack.querySelectorAll('.timeline-item');
    const timelineObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          timelineObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    timelineItems.forEach((item) => timelineObserver.observe(item));
  }

});

/* ==========================================================================
   PROGRAMS & BATCH TIMINGS PAGE INTERACTIONS
   All blocks below are guarded with existence checks, so this runs safely
   even on pages (index.html, about.html) that don't have these elements.
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------ */
  /* 1. BATCH TIMINGS — tabs + age/level filters                        */
  /* ------------------------------------------------------------------ */
  const batchTable = document.getElementById('batchTable');
  if (batchTable) {
    const rows = Array.from(batchTable.querySelectorAll('tbody tr'));
    const tabs = document.querySelectorAll('.batch-tab');
    const ageFilter = document.getElementById('ageFilter');
    const levelFilter = document.getElementById('levelFilter');
    const resultCount = document.getElementById('batchResultCount');
    const emptyState = document.getElementById('batchEmptyState');

    let activeSession = 'all';

    function applyFilters() {
      const age = ageFilter ? ageFilter.value : 'all';
      const level = levelFilter ? levelFilter.value : 'all';
      let visible = 0;

      rows.forEach((row) => {
        const rowSession = row.dataset.session;
        const rowAge = row.dataset.agegroup;
        const rowLevel = row.dataset.level;

        const sessionMatch = activeSession === 'all' || rowSession === activeSession;
        const ageMatch = age === 'all' || rowAge === age || rowAge === 'all';
        const levelMatch = level === 'all' || rowLevel === level || rowLevel === 'all';

        const match = sessionMatch && ageMatch && levelMatch;
        row.classList.toggle('row-hidden', !match);
        if (match) visible += 1;
      });

      if (resultCount) {
        resultCount.textContent = `Showing ${visible} of ${rows.length} batches`;
      }
      if (emptyState) {
        emptyState.hidden = visible !== 0;
        batchTable.style.display = visible === 0 ? 'none' : '';
      }
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        activeSession = tab.dataset.session;
        applyFilters();
      });
    });

    if (ageFilter) ageFilter.addEventListener('change', applyFilters);
    if (levelFilter) levelFilter.addEventListener('change', applyFilters);

    applyFilters();

    /* "Learn More" buttons on program cards jump to the table and
       pre-filter it to that program's level and age group. */
    document.querySelectorAll('.view-batches-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const level = btn.dataset.level || 'all';
        const ageGroup = btn.dataset.agegroup || 'all';

        tabs.forEach((t) => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        const allTab = document.querySelector('.batch-tab[data-session="all"]');
        if (allTab) { allTab.classList.add('active'); allTab.setAttribute('aria-selected', 'true'); }
        activeSession = 'all';

        if (levelFilter) levelFilter.value = level;
        if (ageFilter) ageFilter.value = ageGroup;
        applyFilters();

        document.getElementById('batch-timings').scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 2. PRICING — monthly / quarterly billing toggle                    */
  /* ------------------------------------------------------------------ */
  const billingToggle = document.getElementById('billingToggle');
  if (billingToggle) {
    const priceAmounts = document.querySelectorAll('.price-amount');
    const monthlyLabel = document.querySelector('[data-toggle-label="monthly"]');
    const quarterlyLabel = document.querySelector('[data-toggle-label="quarterly"]');

    billingToggle.addEventListener('click', () => {
      const isQuarterly = billingToggle.getAttribute('aria-checked') !== 'true';
      billingToggle.setAttribute('aria-checked', String(isQuarterly));

      if (monthlyLabel) monthlyLabel.classList.toggle('active', !isQuarterly);
      if (quarterlyLabel) quarterlyLabel.classList.toggle('active', isQuarterly);

      priceAmounts.forEach((el) => {
        el.textContent = isQuarterly ? el.dataset.quarterly : el.dataset.monthly;
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 3. FAQ ACCORDION — smooth expand, one open at a time                */
  /* ------------------------------------------------------------------ */
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length) {
    faqItems.forEach((item) => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        faqItems.forEach((other) => {
          other.classList.remove('open');
          other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-answer').style.maxHeight = null;
        });

        if (!isOpen) {
          item.classList.add('open');
          question.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = `${answer.scrollHeight}px`;
        }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4. TRAINING JOURNEY — animated connector line fill on scroll        */
  /* ------------------------------------------------------------------ */
  const journeyTrack = document.querySelector('.journey-track');
  if (journeyTrack) {
    const lineFill = journeyTrack.querySelector('.journey-line-fill');
    const journeyObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          journeyTrack.classList.add('in-view');
          if (lineFill) lineFill.style.width = '100%';
          journeyObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    journeyObserver.observe(journeyTrack);
  }

});
