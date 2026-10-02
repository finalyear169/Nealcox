// Shared interactions for page navigation, date inputs, and homepage videos.
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const currentPage = document.body.dataset.page;

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  navLinks.forEach((link) => {
    const targetPage = link.dataset.page;
    if (currentPage && targetPage === currentPage) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      if (navMenu) {
        navMenu.classList.remove('is-open');
      }
      if (navToggle) {
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  const yearTarget = document.getElementById('year');
  if (yearTarget) {
    yearTarget.textContent = new Date().getFullYear();
  }

  const homeHeroGallery = document.querySelector('.home-hero-gallery');
  if (homeHeroGallery) {
    const homeHeroCards = Array.from(homeHeroGallery.querySelectorAll('.home-hero-card'));
    const mobileHero = window.matchMedia('(max-width: 799px)');
    let activeCardIndex = homeHeroCards.findIndex((card) => card.classList.contains('home-hero-card--nc'));
    let swipeStart = null;

    if (activeCardIndex < 0) activeCardIndex = 0;

    const clearMobileFanLayout = () => {
      homeHeroCards.forEach((card) => {
        card.classList.remove('is-centered');
        ['--mobile-fan-x', '--mobile-fan-y', '--mobile-fan-rotation', '--mobile-fan-scale', '--mobile-fan-brightness'].forEach((property) => {
          card.style.removeProperty(property);
        });
        card.style.removeProperty('z-index');
      });
    };

    const updateMobileFanLayout = () => {
      if (!mobileHero.matches || !homeHeroCards.length) return;

      homeHeroCards.forEach((card, index) => {
        const isActive = index === activeCardIndex;

        card.classList.toggle('is-centered', isActive);
        card.style.zIndex = isActive ? '30' : '';

        ['--mobile-fan-x', '--mobile-fan-y', '--mobile-fan-rotation', '--mobile-fan-scale', '--mobile-fan-brightness'].forEach((property) => {
          card.style.removeProperty(property);
        });

        if (isActive) {
          card.style.setProperty('--mobile-fan-x', '0%');
          card.style.setProperty('--mobile-fan-rotation', '0deg');
          card.style.setProperty('--mobile-fan-scale', '1');
          card.style.setProperty('--mobile-fan-brightness', '1.12');
        }
      });
    };

    const moveActiveCard = (direction) => {
      const nextIndex = Math.max(0, Math.min(homeHeroCards.length - 1, activeCardIndex + direction));
      if (nextIndex === activeCardIndex) return;
      activeCardIndex = nextIndex;
      updateMobileFanLayout();
    };

    const startSwipe = (x, y, pointerId) => {
      swipeStart = { x, y, pointerId, advanced: false };
    };

    const advanceSwipe = (x, y) => {
      if (!swipeStart || swipeStart.advanced) return;

      const deltaX = x - swipeStart.x;
      const deltaY = y - swipeStart.y;
      if (Math.abs(deltaX) <= 40 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return;

      swipeStart.advanced = true;
      moveActiveCard(deltaX < 0 ? 1 : -1);
    };

    const handlePointerDown = (event) => {
      if (!mobileHero.matches || event.pointerType === 'touch') return;
      startSwipe(event.clientX, event.clientY, event.pointerId);
      homeHeroGallery.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event) => {
      if (!swipeStart || swipeStart.pointerId !== event.pointerId) return;
      advanceSwipe(event.clientX, event.clientY);
    };

    const handlePointerUp = (event) => {
      if (!swipeStart || swipeStart.pointerId !== event.pointerId) return;
      swipeStart = null;
    };

    const handleTouchStart = (event) => {
      if (!mobileHero.matches || !event.changedTouches.length) return;
      const touch = event.changedTouches[0];
      startSwipe(touch.clientX, touch.clientY, null);
    };

    const handleTouchMove = (event) => {
      if (!swipeStart || swipeStart.pointerId !== null || !event.changedTouches.length) return;
      const touch = event.changedTouches[0];
      advanceSwipe(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = (event) => {
      if (!swipeStart || swipeStart.pointerId !== null || !event.changedTouches.length) return;
      swipeStart = null;
    };

    const handleKeyDown = (event) => {
      if (!mobileHero.matches) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        moveActiveCard(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        moveActiveCard(1);
      }
    };

    const setInitialMobileLayout = () => {
      swipeStart = null;
      if (mobileHero.matches) {
        activeCardIndex = Math.max(0, homeHeroCards.findIndex((card) => card.classList.contains('home-hero-card--nc')));
        updateMobileFanLayout();
      } else {
        clearMobileFanLayout();
      }
    };

    homeHeroGallery.addEventListener('pointerdown', handlePointerDown);
    homeHeroGallery.addEventListener('pointermove', handlePointerMove);
    homeHeroGallery.addEventListener('pointerup', handlePointerUp);
    homeHeroGallery.addEventListener('pointercancel', () => {
      if (swipeStart?.pointerId !== null) swipeStart = null;
    });
    homeHeroGallery.addEventListener('touchstart', handleTouchStart, { passive: true });
    homeHeroGallery.addEventListener('touchmove', handleTouchMove, { passive: true });
    homeHeroGallery.addEventListener('touchend', handleTouchEnd, { passive: true });
    homeHeroGallery.addEventListener('touchcancel', () => {
      if (swipeStart?.pointerId === null) swipeStart = null;
    }, { passive: true });
    homeHeroGallery.addEventListener('keydown', handleKeyDown);
    mobileHero.addEventListener('change', setInitialMobileLayout);
    setInitialMobileLayout();
  }

  // Use the native date picker when available, with a focus/click fallback.
  document.querySelectorAll('.date-picker-button').forEach((button) => {
    button.addEventListener('click', () => {
      const dateInput = button.previousElementSibling;
      if (!dateInput) return;

      if (typeof dateInput.showPicker === 'function') {
        dateInput.showPicker();
      } else {
        dateInput.focus();
        dateInput.click();
      }
    });
  });

  const videoFrames = document.querySelectorAll('.video-frame iframe');

  // Load YouTube's API only on pages that contain embedded watch videos.
  if (videoFrames.length && window.YT && window.YT.Player) {
    initializeVideoPlayback(videoFrames);
  } else if (videoFrames.length) {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      // Preserve any API-ready callback registered by another script.
      if (typeof previousReady === 'function') previousReady();
      initializeVideoPlayback(videoFrames);
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const youtubeApi = document.createElement('script');
      youtubeApi.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(youtubeApi);
    }
  }

});

// Coordinate playback so only one clip runs and off-screen clips stay paused.
function initializeVideoPlayback(videoFrames) {
  if (videoFrames[0].dataset.youtubeReady === 'true') return;

  const players = [];
  const playbackState = new WeakMap();

  videoFrames.forEach((frame) => {
    frame.dataset.youtubeReady = 'true';
    const state = { playing: false, resumeWhenVisible: false, pauseRequested: false };
    playbackState.set(frame, state);

    const player = new YT.Player(frame, {
      events: {
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) {
            // A manually started clip takes over; do not auto-resume paused peers.
            players.forEach((otherVideo) => {
              if (otherVideo.frame !== frame && otherVideo.state.playing) {
                otherVideo.state.resumeWhenVisible = false;
                otherVideo.state.pauseRequested = true;
                otherVideo.player.pauseVideo();
                otherVideo.state.playing = false;
              }
            });

            state.playing = true;
            state.resumeWhenVisible = true;
          }

          if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
            state.playing = false;
            if (event.data === YT.PlayerState.ENDED || !state.pauseRequested) {
              state.resumeWhenVisible = false;
            }
            state.pauseRequested = false;
          }
        }
      }
    });

    players.push({ frame, player, state });
  });

  // Pause current playback when the page is hidden or being left.
  const pausePlayers = () => {
    players.forEach(({ player, state }) => {
      if (state.playing) {
        state.resumeWhenVisible = true;
        state.pauseRequested = true;
        player.pauseVideo();
        state.playing = false;
      }
    });
  };

  // Resume a visibility-paused clip only after enough of it is back on screen.
  const resumeVisiblePlayer = (entry) => {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.2 && entry.target.dataset.youtubeReady === 'true') {
      const video = players.find(({ frame }) => frame === entry.target);
      if (video && video.state.resumeWhenVisible) {
        video.player.playVideo();
      }
    }
  };

  // Keep videos quiet while off-screen; the observer threshold is 20% visible.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.2) {
          const video = players.find(({ frame }) => frame === entry.target);
          if (video && video.state.playing) {
            video.state.resumeWhenVisible = true;
            video.state.pauseRequested = true;
            video.player.pauseVideo();
            video.state.playing = false;
          }
        } else {
          resumeVisiblePlayer(entry);
        }
      });
    }, { threshold: [0, 0.2] });

    videoFrames.forEach((frame) => observer.observe(frame));
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pausePlayers();
  });

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', pausePlayers, { once: true });
  });

  window.addEventListener('pagehide', pausePlayers, { once: true });
}
