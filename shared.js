// ══════════════════════════════════════════════════════════════════
// shared.js — behavior for components used on more than one page
// (nav pill, footer). Loaded by every page after its nav/footer HTML
// and after GSAP + ScrollTrigger. Edit here once — it reflects
// everywhere it's linked.
// ══════════════════════════════════════════════════════════════════

// ── Nav: floating pill mobile menu ──
(function () {
  var nav    = document.getElementById('site-nav');
  var toggle = document.getElementById('pill-toggle');
  var panel  = document.getElementById('pill-panel');
  if (!nav || !toggle || !panel) return;

  var closeTimer = null;

  // ── Auto-cycling word/photo/accent (mobile full-screen menu only) ──
  // "Work" is active as soon as the menu opens; every CYCLE_MS it
  // advances to the next word and loops, forever, until the menu closes
  // or the user taps a word directly. Always restarts at "Work" on
  // reopen — index/timer are reset in openMenu(), never resumed from
  // where they left off (same restart-on-reopen rule as the hero's
  // rotating word).
  var CYCLE_WORDS = ['work', 'services', 'about'];
  var CYCLE_MS = 3500;
  var cycleTimer = null;
  var cycleIndex = 0;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var menuLinks  = panel.querySelectorAll('.pill-panel-link');
  var menuPhotos = panel.querySelectorAll('.menu-photo');
  var menuAccents = panel.querySelectorAll('.menu-accent');

  function setActiveWord(word) {
    menuLinks.forEach(function (el) { el.classList.toggle('is-active', el.dataset.word === word); });
    menuPhotos.forEach(function (el) { el.classList.toggle('is-active', el.dataset.word === word); });
    menuAccents.forEach(function (el) { el.classList.toggle('is-active', el.dataset.word === word); });
  }

  function stopCycle() {
    if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
  }

  function startCycle() {
    stopCycle();
    cycleIndex = 0;
    setActiveWord(CYCLE_WORDS[0]);
    // Respect reduced motion by just holding on "Work" rather than
    // forcing an auto-advancing slideshow on users who've asked to
    // avoid that kind of motion — same philosophy as the rest of the
    // site's prefers-reduced-motion handling (content still shows, it
    // just doesn't move on its own).
    if (reduceMotion) return;
    cycleTimer = setInterval(function () {
      cycleIndex = (cycleIndex + 1) % CYCLE_WORDS.length;
      setActiveWord(CYCLE_WORDS[cycleIndex]);
    }, CYCLE_MS);
  }

  // Manual tap is real intent — stop competing with it. The link itself
  // still navigates immediately (it's a plain <a href>); this only
  // silences the ambient timer so it can't advance during the brief
  // moment before the page unloads.
  menuLinks.forEach(function (link) {
    link.addEventListener('click', stopCycle);
  });

  // Two-step reveal: 'is-open' flips the pill shape + shows the panel
  // (display) immediately; 'panel-visible' is added a frame later so the
  // content's opacity/transform actually transitions instead of snapping.
  // Closing reverses the order — content fades out first, then the pill
  // shape reverts and the panel is hidden once that fade has finished.
  function openMenu() {
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
    startCycle();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        nav.classList.add('panel-visible');
      });
    });
  }

  function closeMenu() {
    nav.classList.remove('panel-visible');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
    stopCycle();
    closeTimer = setTimeout(function () {
      nav.classList.remove('is-open');
      closeTimer = null;
    }, 300);
  }

  toggle.addEventListener('click', function () {
    if (nav.classList.contains('is-open')) closeMenu(); else openMenu();
  });
  panel.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) closeMenu();
  });

  // Desktop: hide the pill while the hero's own CTA buttons are on
  // screen (reappears once they're out of view), and hide it for good
  // once the footer is reached — the footer has its own Work/Services/
  // About pill row at its top that takes over from here.
  //
  // Mobile (<=640px, matching the site's own mobile breakpoint): the
  // full pill competes with the hero's own copy for a small screen, so
  // it collapses to a small icon-only circle (top-right — see
  // .pill-nav--icon-only) for the whole hero and while scrolling down,
  // and only expands back to the full pill while actively scrolling up.
  // Reaching the footer still hides it entirely, same as desktop — the
  // footer has its own nav row.
  //
  // Driven by a rAF loop rather than a 'scroll' listener: the hero's
  // crescent-state class reacts to scroll too, and listener order isn't
  // guaranteed, so a scroll-event check can read one tick stale.
  // (On pages with no hero — e.g. About — heroBtns/heroPinWrap are just
  // null and isHeroCtaVisible()/isInHero() always return false, which is
  // exactly the right behavior there.)
  var heroBtns      = document.querySelector('.hero-btns');
  var heroPinWrap   = document.querySelector('.hero-pin-wrap');
  var footerCurtain = document.getElementById('footer-curtain');
  var mobileMq      = window.matchMedia('(max-width: 640px)');

  function isHeroCtaVisible() {
    // The hero's scroll progress clamps at 1 and never resets, so
    // .hero-btns keeps opacity:1 for the rest of the page even long
    // after the sticky hero has scrolled away — gate on the pin-wrap
    // (a normal-flow element, unlike the sticky hero) still overlapping
    // the viewport so this only fires while the hero is actually pinned.
    if (!heroBtns || !heroPinWrap) return false;
    if (heroPinWrap.getBoundingClientRect().bottom <= 0) return false;
    return parseFloat(getComputedStyle(heroBtns).opacity) > 0.15;
  }
  function isInHero() {
    if (!heroPinWrap) return false;
    return heroPinWrap.getBoundingClientRect().bottom > 0;
  }
  function hasReachedFooter() {
    // .site-footer is position:fixed, so its own getBoundingClientRect
    // is always viewport-sized regardless of the ancestor clip-path —
    // check the non-fixed .footer-curtain wrapper instead to know
    // whether the footer has actually scrolled into view.
    if (!footerCurtain) return false;
    return footerCurtain.getBoundingClientRect().top < window.innerHeight;
  }

  // Direction tracking for the mobile hide/reveal behavior. A small
  // threshold (rather than reacting to every 1px delta) filters out
  // sub-pixel scroll noise so the pill doesn't flicker mid-gesture.
  var lastScrollY  = window.scrollY;
  var scrollingDown = false;
  function updateScrollDirection() {
    var y = window.scrollY;
    var delta = y - lastScrollY;
    if (Math.abs(delta) > 4) {
      scrollingDown = delta > 0;
      lastScrollY = y;
    }
  }

  function updatePillVisibility() {
    updateScrollDirection();
    // Never hide (or collapse) the pill while the mobile menu itself is
    // open — the hero/footer/scroll-direction rules below are about the
    // collapsed pill competing with other content, which doesn't apply
    // once it's a full-screen takeover the user just asked to see.
    if (nav.classList.contains('is-open')) {
      nav.classList.remove('pill-nav--hidden', 'pill-nav--icon-only');
      return;
    }
    var reachedFooter = hasReachedFooter();
    if (mobileMq.matches) {
      nav.classList.toggle('pill-nav--hidden', reachedFooter);
      var iconOnly = !reachedFooter && (isInHero() || (scrollingDown && window.scrollY > 40));
      nav.classList.toggle('pill-nav--icon-only', iconOnly);
    } else {
      nav.classList.toggle('pill-nav--hidden', isHeroCtaVisible() || reachedFooter);
      nav.classList.remove('pill-nav--icon-only');
    }
  }

  (function loop() {
    updatePillVisibility();
    requestAnimationFrame(loop);
  })();
})();

// ── Footer: magnetic buttons + scroll-scrubbed reveal ──
(function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var curtain = document.getElementById('footer-curtain');
  if (!curtain || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  if (!reducedMotion) {
    // Giant wordmark: soft parallax rise + fade as the footer curtain reveals
    gsap.fromTo('.footer-giant',
      { y: '8vh', opacity: 0 },
      {
        y: '0vh', opacity: 1, ease: 'power1.out',
        scrollTrigger: { trigger: curtain, start: 'top bottom', end: 'top top', scrub: 0.6 },
      }
    );

    // Heading + CTA + links: staggered fade/rise as the footer settles into view
    gsap.fromTo(['#footer-heading', '#footer-btns', '#footer-links'],
      { y: 32, opacity: 0 },
      {
        y: 0, opacity: 1, stagger: 0.12, ease: 'power2.out',
        scrollTrigger: { trigger: curtain, start: 'top 70%', end: 'top 15%', scrub: 0.6 },
      }
    );
  }

  // Magnetic hover-follow — fine-pointer devices only, no bounce on release
  if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.footer-magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        gsap.to(el, {
          x: x * 0.35, y: y * 0.35,
          rotationX: -y * 0.12, rotationY: x * 0.12,
          scale: 1.04, ease: 'power2.out', duration: 0.4,
        });
      });
      el.addEventListener('mouseleave', function () {
        // power3.out — smooth settle, no elastic/spring overshoot
        gsap.to(el, {
          x: 0, y: 0, rotationX: 0, rotationY: 0, scale: 1,
          ease: 'power3.out', duration: 0.9,
        });
      });
    });
  }

  // Back to top
  var toTop = document.getElementById('footer-to-top');
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }
})();

// ── Section-load reveals: .fade-up / .fade-in (every page) ──
// Toggles .visible once an element actually scrolls into view; the actual
// motion is pure CSS (see shared.css) so this is just a trigger. No timed
// fallback here on purpose — a blanket "reveal everything after N seconds"
// used to run once on load and would mark every fade element on the page
// (including ones nowhere near the viewport yet) as already-revealed, so
// by the time you actually scrolled to a later section its animation had
// already silently fired off-screen. IntersectionObserver alone is enough.
(function () {
  var targets = document.querySelectorAll('.fade-up, .fade-in');
  if (!targets.length) return;

  var scrollObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      scrollObs.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  targets.forEach(function (el) { scrollObs.observe(el); });
})();
