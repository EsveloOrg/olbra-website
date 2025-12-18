// Olbra Website JavaScript

import { initLiquidGlassBubbles } from './liquidGlassBubbles.js';

// Utility: Throttle function to limit execution rate
const throttle = (fn, wait) => {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
};

// Language Preference Detection and Redirect (runs immediately)
const initLanguagePreference = () => {
  const currentPath = window.location.pathname;
  const isPolishPage = currentPath.startsWith('/pl/') || currentPath === '/pl';
  const savedLang = localStorage.getItem('olbra-lang');
  const browserLang = navigator.language.toLowerCase();

  // Detect preferred language (priority: saved > browser > default)
  let preferredLang = savedLang;
  if (!preferredLang) {
    preferredLang = browserLang.startsWith('pl') ? 'pl' : 'en';
  }

  // Save current language preference
  localStorage.setItem('olbra-lang', isPolishPage ? 'pl' : 'en');

  // Only redirect on first visit to root pages (not deep links)
  const isFirstVisit = !sessionStorage.getItem('olbra-visited');
  const isRootPage = currentPath === '/' || currentPath === '/pl/' || currentPath === '/pl' || currentPath === '/index.html';

  if (isFirstVisit && isRootPage && !savedLang) {
    sessionStorage.setItem('olbra-visited', 'true');

    if (preferredLang === 'pl' && !isPolishPage) {
      window.location.href = '/pl/';
    } else if (preferredLang === 'en' && isPolishPage) {
      window.location.href = '/';
    }
  }
};

// Run language detection immediately (before DOMContentLoaded)
initLanguagePreference();

// Language Switcher - Update links to current page equivalent
const initLanguageSwitcher = () => {
  const langSwitches = document.querySelectorAll('.lang-switch, .lang-switch-mobile');
  const currentPath = window.location.pathname;
  const isPolishPage = currentPath.startsWith('/pl/') || currentPath === '/pl';

  langSwitches.forEach(link => {
    const targetLang = link.dataset.lang;

    if (targetLang === 'pl') {
      if (isPolishPage) {
        // Already on Polish - stay on current page
        link.href = currentPath;
        link.classList.add('active');
      } else {
        // On English - link to Polish equivalent
        let polishPath;
        if (currentPath === '/' || currentPath === '/index.html') {
          polishPath = '/pl/';
        } else {
          polishPath = '/pl' + currentPath;
        }
        link.href = polishPath;
        link.classList.remove('active');
      }
    } else {
      // English link
      if (isPolishPage) {
        // On Polish - link to English equivalent
        let englishPath = currentPath.replace('/pl/', '/').replace('/pl', '/');
        if (englishPath === '' || englishPath === '/index.html') {
          englishPath = '/';
        }
        link.href = englishPath;
        link.classList.remove('active');
      } else {
        // Already on English - stay on current page
        link.href = currentPath === '/index.html' ? '/' : currentPath;
        link.classList.add('active');
      }
    }
  });
};

// Mobile Menu Toggle
const initMobileMenu = () => {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');

  if (!menuBtn || !mobileMenu) return;

  const toggleMenu = () => {
    mobileMenu.classList.toggle('open');
    document.body.classList.toggle('overflow-hidden');
  };

  menuBtn.addEventListener('click', toggleMenu);
  closeBtn?.addEventListener('click', toggleMenu);
};

// Scroll Reveal Animation - Enhanced
const initScrollReveal = () => {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
};

// Counter Animation
const initCounters = () => {
  const counters = document.querySelectorAll('[data-counter]');

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.counter);
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (target - start) * easeOutQuart);

      el.textContent = current.toLocaleString() + (el.dataset.suffix || '');

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
};

// FAQ Accordion
const initFAQ = () => {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');

    if (!question || !answer) return;

    // Set initial state
    answer.style.maxHeight = '0px';

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('open')) {
          otherItem.classList.remove('open');
          otherItem.querySelector('.faq-answer').style.maxHeight = '0px';
          otherItem.querySelector('.faq-icon')?.classList.remove('rotate-45');
        }
      });

      // Toggle current item
      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = '0px';
        icon?.classList.remove('rotate-45');
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        icon?.classList.add('rotate-45');
      }
    });
  });
};

// Sticky Header
const initStickyHeader = () => {
  const header = document.getElementById('header');
  if (!header) return;

  let lastScroll = 0;
  const scrollThreshold = 100;

  const handleScroll = throttle(() => {
    const currentScroll = window.pageYOffset;

    // Add/remove background on scroll
    if (currentScroll > 20) {
      header.classList.add('bg-white/95', 'backdrop-blur-lg', 'shadow-soft');
      header.classList.remove('bg-transparent');
    } else {
      header.classList.remove('bg-white/95', 'backdrop-blur-lg', 'shadow-soft');
      header.classList.add('bg-transparent');
    }

    // Hide/show on scroll direction
    if (currentScroll > scrollThreshold) {
      if (currentScroll > lastScroll) {
        header.classList.add('-translate-y-full');
      } else {
        header.classList.remove('-translate-y-full');
      }
    }

    lastScroll = currentScroll;
  }, 16); // ~60fps

  window.addEventListener('scroll', handleScroll, { passive: true });
};

// Smooth scroll for anchor links
const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
};

// Parallax effect for hero elements
const initParallax = () => {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  if (parallaxElements.length === 0) return;

  const handleScroll = throttle(() => {
    const scrolled = window.pageYOffset;

    parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.5;
      const yPos = -(scrolled * speed);
      el.style.transform = `translateY(${yPos}px)`;
    });
  }, 16); // ~60fps

  window.addEventListener('scroll', handleScroll, { passive: true });
};

// Video lazy loading
const initVideoLazyLoad = () => {
  const videos = document.querySelectorAll('video[data-src]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const video = entry.target;
        video.src = video.dataset.src;
        video.load();
        observer.unobserve(video);
      }
    });
  }, { rootMargin: '200px' });

  videos.forEach(video => observer.observe(video));
};

// Interactive Hero Liquid Glass Background
const initHeroInteraction = () => {
  const hero = document.querySelector('section.min-h-screen');
  const blobs = hero?.querySelectorAll('.hero-goo-blob');
  const glassAmbient = hero?.querySelector('.hero-glass-ambient');
  const glassSpecular = hero?.querySelector('.hero-glass-specular');
  const glassLight = document.getElementById('glass-light');

  if (!hero) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) {
    return; // Exit early, CSS handles static display
  }

  // Mouse position tracking
  let mouseX = 0;
  let mouseY = 0;
  let isHovering = false;

  // Cache hero rect
  let heroRect = null;

  const updateHeroRect = () => {
    heroRect = hero.getBoundingClientRect();
  };

  // Parallax effect for blobs on mouse move
  const applyBlobParallax = () => {
    if (!heroRect || !blobs) return;

    const centerX = heroRect.width / 2;
    const centerY = heroRect.height / 2;

    // Calculate offset from center (normalized -1 to 1)
    const offsetX = (mouseX - centerX) / centerX;
    const offsetY = (mouseY - centerY) / centerY;

    blobs.forEach((blob, index) => {
      // Different parallax speeds for each blob
      const speeds = [0.2, 0.25, 0.15, 0.22, 0.12];
      const speed = speeds[index] || 0.15;

      // Calculate additional transform offset
      const translateX = offsetX * 60 * speed;
      const translateY = offsetY * 50 * speed;

      // Apply via CSS custom properties (preserves animation)
      blob.style.setProperty('--parallax-x', `${translateX}px`);
      blob.style.setProperty('--parallax-y', `${translateY}px`);
    });
  };

  // Update glass effects based on mouse position
  const updateGlassEffects = () => {
    if (!heroRect) return;

    // Calculate mouse position as percentage
    const xPercent = (mouseX / heroRect.width) * 100;
    const yPercent = (mouseY / heroRect.height) * 100;

    // Update ambient light position (CSS custom properties)
    if (glassAmbient) {
      glassAmbient.style.setProperty('--mouse-x', `${xPercent}%`);
      glassAmbient.style.setProperty('--mouse-y', `${yPercent}%`);
    }

    // Update specular highlight position (moves inversely for realistic light reflection)
    if (glassSpecular) {
      const specX = 100 - xPercent * 0.35;
      const specY = 15 + yPercent * 0.2;
      glassSpecular.style.setProperty('--glass-light-x', `${specX}%`);
      glassSpecular.style.setProperty('--glass-light-y', `${specY}%`);
    }

    // Update SVG point light position (for filter-based specular)
    if (glassLight) {
      glassLight.setAttribute('x', mouseX);
      glassLight.setAttribute('y', mouseY);
    }
  };

  // Throttled mouse move handler
  const handleMouseMove = throttle((e) => {
    if (!heroRect) updateHeroRect();

    mouseX = e.clientX - heroRect.left;
    mouseY = e.clientY - heroRect.top;

    // Apply blob parallax
    applyBlobParallax();

    // Update glass effects
    updateGlassEffects();
  }, 16); // ~60fps

  // Event listeners
  hero.addEventListener('mouseenter', () => {
    isHovering = true;
    updateHeroRect();
    glassAmbient?.classList.add('active');
  });

  hero.addEventListener('mousemove', handleMouseMove, { passive: true });

  hero.addEventListener('mouseleave', () => {
    isHovering = false;
    glassAmbient?.classList.remove('active');
    heroRect = null;

    // Reset blob parallax
    blobs?.forEach(blob => {
      blob.style.setProperty('--parallax-x', '0px');
      blob.style.setProperty('--parallax-y', '0px');
    });

    // Reset specular to default position
    if (glassSpecular) {
      glassSpecular.style.setProperty('--glass-light-x', '65%');
      glassSpecular.style.setProperty('--glass-light-y', '25%');
    }
  });

  // Handle resize
  const handleResize = throttle(() => {
    updateHeroRect();
  }, 250);

  window.addEventListener('resize', handleResize, { passive: true });

  // Visibility observer for performance
  let isVisible = true;
  const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;

      if (!isVisible) {
        // Pause animations when off-screen
        blobs?.forEach(blob => {
          blob.style.animationPlayState = 'paused';
        });
      } else {
        // Resume animations when visible
        blobs?.forEach(blob => {
          blob.style.animationPlayState = 'running';
        });
      }
    });
  }, { threshold: 0 });

  visibilityObserver.observe(hero);

  // Cleanup
  window.addEventListener('beforeunload', () => {
    visibilityObserver.disconnect();
  });
};

// Europe Map Interactive Stablecoins
const initEuropeMap = async () => {
  const mapContainer = document.querySelector('.europe-map-container');
  if (!mapContainer) return;

  const tooltip = document.getElementById('map-tooltip');
  const tooltipTitle = tooltip?.querySelector('.map-tooltip-title');
  const tooltipList = tooltip?.querySelector('.map-tooltip-list');
  const mapWrapper = document.getElementById('europe-map-wrapper');

  if (!tooltip || !tooltipTitle || !tooltipList || !mapWrapper) return;

  // Countries with stablecoins (ISO codes)
  const targetCountries = ['PL', 'GB', 'UA', 'CZ', 'EE', 'RO', 'BG', 'AL'];

  // Stablecoin data for each country
  const stablecoinData = {
    PL: {
      title: "PLNY – Poland's Digital Anchor",
      points: [
        "Core pillar of Polish digital sovereignty.",
        "Designed for local fintechs, PSPs, and exchanges.",
        "Bridges PLN seamlessly to the global financial system."
      ]
    },
    GB: {
      title: "GBPY – UK's Digital Anchor",
      points: [
        "FCA-mandated 100% reserves with T+1 redemption.",
        "Integrates 4.9B Faster Payments for instant GBP flows.",
        "Bridges UK-Europe remittances via EUR/USD rails."
      ]
    },
    UA: {
      title: "UAHY – Ukraine's Digital Anchor",
      points: [
        "NBU-oversight with EU-aligned asset legalization.",
        "Powers 41% digital-only cards and 58% SMB transfers.",
        "Secures $5B remittances against UAH volatility."
      ]
    },
    CZ: {
      title: "CZKY – Czech Republic's Digital Anchor",
      points: [
        "CNB-licensed EMTs under full MiCA reserves.",
        "Drives 50% instant retail and 75% contactless POS.",
        "Tokenizes assets alongside BTC tax-exempt status."
      ]
    },
    AL: {
      title: "ALLY – Albania's Digital Anchor",
      points: [
        "BoA DLT Law enables VASP remittance corridors.",
        "Accelerates 42% POS growth toward 2033 cashless.",
        "Slashes 7% fees on $1B inflows for 80% inclusion."
      ]
    },
    EE: {
      title: "EURY – Estonia's Digital Anchor",
      points: [
        "FIU CASP license with EU sandbox passporting.",
        "Fuels 99% digital e-commerce via e-Residency.",
        "Optimizes 0% corp tax on reinvested stablecoin profits."
      ]
    },
    RO: {
      title: "RONY – Romania's Digital Anchor",
      points: [
        "ASF MiCA licensing with 16% gains tax compliance.",
        "Targets 31% unbanked through instant wallet rails.",
        "Streamlines high-remittance flows under strict KYC."
      ]
    },
    BG: {
      title: "BGNY – Bulgaria's Digital Anchor",
      points: [
        "FSC Crypto Assets Act with MiCA grandfathering.",
        "Boosts freelancer payments via 10% flat tax draw.",
        "Speeds $500M settlements in cards and wallets."
      ]
    }
  };

  let activeCountry = null;
  let hideTimeout = null;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // Update tooltip content and position
  const showTooltip = (countryCode, countryElement) => {
    const data = stablecoinData[countryCode];
    if (!data) return;

    // Clear any pending hide
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }

    // Update content
    tooltipTitle.textContent = data.title;
    tooltipList.innerHTML = data.points.map(point => `<li>${point}</li>`).join('');

    // Position tooltip
    if (!isMobile) {
      const containerRect = mapContainer.getBoundingClientRect();
      const countryRect = countryElement.getBoundingClientRect();

      // Calculate country center relative to container
      const countryCenterX = countryRect.left + countryRect.width / 2 - containerRect.left;
      const countryCenterY = countryRect.top + countryRect.height / 2 - containerRect.top;

      // Tooltip dimensions (approximate)
      const tooltipWidth = 300;
      const tooltipHeight = 150;

      // Position tooltip to the right of country, or left if too close to edge
      let tooltipX = countryCenterX + 20;
      let tooltipY = countryCenterY - tooltipHeight / 2;

      // Adjust if tooltip would go off right edge
      if (tooltipX + tooltipWidth > containerRect.width) {
        tooltipX = countryCenterX - tooltipWidth - 20;
      }

      // Adjust if tooltip would go off bottom
      if (tooltipY + tooltipHeight > containerRect.height) {
        tooltipY = containerRect.height - tooltipHeight - 10;
      }

      // Adjust if tooltip would go off top
      if (tooltipY < 10) {
        tooltipY = 10;
      }

      tooltip.style.left = `${tooltipX}px`;
      tooltip.style.top = `${tooltipY}px`;
    }

    // Show tooltip
    tooltip.classList.add('visible');

    // Mark country as active
    if (activeCountry && activeCountry !== countryElement) {
      activeCountry.classList.remove('active');
    }
    countryElement.classList.add('active');
    activeCountry = countryElement;
  };

  const hideTooltip = () => {
    hideTimeout = setTimeout(() => {
      tooltip.classList.remove('visible');
      if (activeCountry) {
        activeCountry.classList.remove('active');
        activeCountry = null;
      }
    }, 100);
  };

  // Setup event handlers for highlighted countries
  const setupEventHandlers = (highlightedCountries) => {
    // Desktop: hover events
    if (!isMobile) {
      highlightedCountries.forEach(country => {
        const countryCode = country.dataset.country || country.id;

        country.addEventListener('mouseenter', () => {
          showTooltip(countryCode, country);
        });

        country.addEventListener('mouseleave', () => {
          hideTooltip();
        });
      });

      // Keep tooltip visible when hovering over it
      tooltip.addEventListener('mouseenter', () => {
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          hideTimeout = null;
        }
      });

      tooltip.addEventListener('mouseleave', () => {
        hideTooltip();
      });
    }

    // Mobile: tap events
    if (isMobile) {
      highlightedCountries.forEach(country => {
        const countryCode = country.dataset.country || country.id;

        country.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (activeCountry === country) {
            // Tap same country - hide tooltip
            tooltip.classList.remove('visible');
            country.classList.remove('active');
            activeCountry = null;
          } else {
            // Tap different country - show tooltip
            showTooltip(countryCode, country);
          }
        });
      });

      // Close tooltip when tapping outside
      document.addEventListener('click', (e) => {
        if (!mapContainer.contains(e.target) && !tooltip.contains(e.target)) {
          tooltip.classList.remove('visible');
          if (activeCountry) {
            activeCountry.classList.remove('active');
            activeCountry = null;
          }
        }
      });
    }
  };

  // Fetch and inject SVG
  try {
    const response = await fetch('/europe.svg');
    if (!response.ok) throw new Error('Failed to load map');

    const svgText = await response.text();
    mapWrapper.innerHTML = svgText;

    const svgElement = mapWrapper.querySelector('svg');
    if (!svgElement) return;

    // Add class to SVG element
    svgElement.classList.add('europe-map');

    // Adjust viewBox to focus on Central Europe - keep wider area for mask fade
    // Original: 0 0 1000 684, new center on highlighted countries with extra padding for fade
    svgElement.setAttribute('viewBox', '100 200 800 500');

    // Apply elliptical vignette mask for smooth fade effect on all edges
    const maskGradient = 'radial-gradient(ellipse 70% 65% at 50% 50%, black 40%, rgba(0,0,0,0.8) 55%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.2) 85%, transparent 100%)';
    svgElement.style.maskImage = maskGradient;
    svgElement.style.webkitMaskImage = maskGradient;

    // Get all path elements
    const allPaths = svgElement.querySelectorAll('path');
    const highlightedCountries = [];

    allPaths.forEach(path => {
      const countryId = path.id;

      // Add base class to all paths
      path.classList.add('country-path');

      // Add highlighted class and data attribute to target countries
      if (targetCountries.includes(countryId)) {
        path.classList.add('highlighted');
        path.setAttribute('data-country', countryId);
        highlightedCountries.push(path);
      }
    });

    // Setup event handlers
    if (highlightedCountries.length > 0) {
      setupEventHandlers(highlightedCountries);
    }
  } catch (e) {
    console.warn('Could not initialize Europe map:', e);
  }
};

// Interactive Swap Widget
const initSwapWidget = () => {
  const fromInput = document.getElementById('swap-from-input');
  const toOutput = document.getElementById('swap-to-output');
  const switchBtn = document.getElementById('swap-switch-btn');
  const rateDisplay = document.getElementById('swap-rate-display');
  const fromSelector = document.getElementById('swap-from-selector');
  const toSelector = document.getElementById('swap-to-selector');
  const fromDropdown = document.getElementById('swap-from-dropdown');
  const toDropdown = document.getElementById('swap-to-dropdown');
  const fromIcon = document.getElementById('swap-from-icon');
  const fromLabel = document.getElementById('swap-from-label');
  const toIcon = document.getElementById('swap-to-icon');
  const toLabel = document.getElementById('swap-to-label');

  if (!fromInput) return; // Only run on pages with swap widget

  // State
  let fromToken = 'PLNY';
  let toToken = 'EURY';

  // Currency data
  const currencies = {
    PLNY: { icon: '/assets/coins2/plny.svg', label: 'PLNY' },
    EURY: { icon: '/assets/coins2/eury.svg', label: 'EURY' },
    USDY: { icon: '/assets/coins2/usdy.svg', label: 'USDY' }
  };

  // Exchange rates (approximate real rates)
  const rates = {
    'PLNY-EURY': 0.2315,
    'EURY-PLNY': 4.32,
    'PLNY-USDY': 0.25,
    'USDY-PLNY': 4.00,
    'EURY-USDY': 1.08,
    'USDY-EURY': 0.93
  };

  // Parse input value (handle both comma and period as decimal separators)
  const parseInput = (str) => {
    if (!str) return 0;
    // Remove spaces and replace comma with period
    const cleaned = str.replace(/\s/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  // Format output number
  const formatOutput = (num) => {
    if (num === 0) return '~0.00';
    return '~' + num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Get exchange rate for current pair
  const getRate = () => {
    const key = `${fromToken}-${toToken}`;
    return rates[key] || 1;
  };

  // Calculate output based on input and rate
  const calculateOutput = () => {
    const inputValue = parseInput(fromInput.value);
    const rate = getRate();
    const outputValue = inputValue * rate;
    toOutput.textContent = formatOutput(outputValue);
  };

  // Update rate display
  const updateRateDisplay = () => {
    const rate = getRate();
    rateDisplay.textContent = `1 ${fromToken} = ${rate.toFixed(4)} ${toToken}`;
  };

  // Update currency display (icon and label)
  const updateCurrencyDisplay = (type, token) => {
    const icon = type === 'from' ? fromIcon : toIcon;
    const label = type === 'from' ? fromLabel : toLabel;
    const currency = currencies[token];

    if (icon && currency) {
      icon.src = currency.icon;
      icon.alt = currency.label;
    }
    if (label && currency) {
      label.textContent = currency.label;
    }
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    fromDropdown?.classList.add('hidden');
    toDropdown?.classList.add('hidden');
  };

  // Toggle dropdown
  const toggleDropdown = (dropdown, otherDropdown) => {
    otherDropdown?.classList.add('hidden');
    dropdown?.classList.toggle('hidden');
  };

  // Handle currency selection
  const selectCurrency = (type, token) => {
    if (type === 'from') {
      // If selecting same as "to", swap them
      if (token === toToken) {
        toToken = fromToken;
        updateCurrencyDisplay('to', toToken);
      }
      fromToken = token;
      updateCurrencyDisplay('from', fromToken);
    } else {
      // If selecting same as "from", swap them
      if (token === fromToken) {
        fromToken = toToken;
        updateCurrencyDisplay('from', fromToken);
      }
      toToken = token;
      updateCurrencyDisplay('to', toToken);
    }

    closeAllDropdowns();
    updateRateDisplay();
    calculateOutput();
  };

  // Switch currencies
  const switchCurrencies = () => {
    const temp = fromToken;
    fromToken = toToken;
    toToken = temp;

    updateCurrencyDisplay('from', fromToken);
    updateCurrencyDisplay('to', toToken);
    updateRateDisplay();
    calculateOutput();
  };

  // Event listeners
  fromInput?.addEventListener('input', calculateOutput);

  switchBtn?.addEventListener('click', switchCurrencies);

  fromSelector?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown(fromDropdown, toDropdown);
  });

  toSelector?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown(toDropdown, fromDropdown);
  });

  // Currency option clicks
  fromDropdown?.querySelectorAll('.swap-currency-option').forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      const token = option.dataset.currency;
      selectCurrency('from', token);
    });
  });

  toDropdown?.querySelectorAll('.swap-currency-option').forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      const token = option.dataset.currency;
      selectCurrency('to', token);
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', closeAllDropdowns);

  // Initialize output calculation
  calculateOutput();
};

// 3D Tilt Effect on Cards
const initCardTilt = () => {
  const cards = document.querySelectorAll('.bento-item');

  cards.forEach(card => {
    // Cache rect on mouseenter instead of every mousemove
    let rect = null;

    card.addEventListener('mouseenter', () => {
      rect = card.getBoundingClientRect();
    });

    const handleMouseMove = throttle((e) => {
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    }, 16); // ~60fps

    card.addEventListener('mousemove', handleMouseMove, { passive: true });

    card.addEventListener('mouseleave', () => {
      rect = null;
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
  });
};

// Initialize all modules
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initLanguageSwitcher();
  initScrollReveal();
  initCounters();
  initFAQ();
  initStickyHeader();
  initSmoothScroll();
  initParallax();
  initVideoLazyLoad();
  initLiquidGlassBubbles(); // WebGL liquid glass bubbles effect
  initCardTilt();
  initEuropeMap();
  initSwapWidget();
});

// Export for potential module use
export {
  initMobileMenu,
  initLanguageSwitcher,
  initLanguagePreference,
  initScrollReveal,
  initCounters,
  initFAQ,
  initStickyHeader,
  initSmoothScroll,
  initParallax,
  initVideoLazyLoad,
  initLiquidGlassBubbles,
  initCardTilt,
  initEuropeMap,
  initSwapWidget
};
