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
    let centerUpdateFrame = 0;

    const updateCenteredCard = () => {
      centerUpdateFrame = 0;
      if (!homeHeroCards.length) return;

      const galleryCenter = homeHeroGallery.getBoundingClientRect().left + homeHeroGallery.clientWidth / 2;
      const centeredCard = homeHeroCards
        .map((card) => ({
          card,
          center: card.getBoundingClientRect().left + card.getBoundingClientRect().width / 2
        }))
        .reduce((closest, current) =>
          Math.abs(current.center - galleryCenter) < Math.abs(closest.center - galleryCenter) ? current : closest
        ).card;

      homeHeroCards.forEach((card) => {
        card.classList.toggle('is-centered', card === centeredCard);
      });
    };

    const scheduleCenterUpdate = () => {
      if (!centerUpdateFrame) {
        centerUpdateFrame = window.requestAnimationFrame(updateCenteredCard);
      }
    };

    const centerInitialArtwork = () => {
      if (!mobileHero.matches || !homeHeroCards.length) {
        homeHeroCards.forEach((card) => card.classList.remove('is-centered'));
        return;
      }

      const initialArtwork = homeHeroGallery.querySelector('.home-hero-card--nc') || homeHeroCards[0];
      homeHeroGallery.scrollLeft =
        initialArtwork.offsetLeft + initialArtwork.offsetWidth / 2 - homeHeroGallery.clientWidth / 2;
      updateCenteredCard();
    };

    homeHeroGallery.addEventListener('scroll', scheduleCenterUpdate, { passive: true });
    mobileHero.addEventListener('change', centerInitialArtwork);
    window.requestAnimationFrame(centerInitialArtwork);
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
