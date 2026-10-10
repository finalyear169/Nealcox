// This catalog is the single source of truth for the featured release and archive.
const musicLibrary = [
  {
    title: 'Stone Over Water',
    artist: 'Neal Coxworth',
    year: '2026',
    releaseType: 'Cover',
    featured: true,
    artwork: 'https://i1.sndcdn.com/artworks-kwHzcPOoEqc5qgZz-cTUGCA-t500x500.jpg',
    soundcloud: 'https://soundcloud.com/anthony-neal-541671036/stone-over-water'
  },
  {
    title: 'Post War Cinematic Dead Mans Blues',
    artist: 'Neal Coxworth',
    year: '2026',
    releaseType: 'Cover',
    featured: false,
    artwork: 'https://i1.sndcdn.com/artworks-uOcyVU45nIiZ8atl-eqU2pw-t500x500.jpg',
    soundcloud: 'https://soundcloud.com/anthony-neal-541671036/post-war-cinematic-dead-mans'
  },
  {
    title: 'Southern Cross',
    artist: 'Neal Coxworth',
    year: '2026',
    releaseType: 'Cover',
    featured: false,
    artwork: 'https://i1.sndcdn.com/artworks-pfLadCzcGCHy566V-19dA1g-t500x500.jpg',
    soundcloud: 'https://soundcloud.com/anthony-neal-541671036/southern-cross'
  },
  {
    title: 'Cigarette Daydream',
    artist: 'Neal Coxworth',
    year: '2026',
    releaseType: 'Cover',
    featured: false,
    artwork: 'https://i1.sndcdn.com/artworks-eIdEvxGMZvq6E0gK-LUaEcg-t500x500.jpg',
    soundcloud: 'https://soundcloud.com/anthony-neal-541671036/cigarette-daydream'
  },
  {
    title: 'Early Morning Rain',
    artist: 'Neal Coxworth',
    year: '2026',
    releaseType: 'Cover',
    featured: false,
    artwork: 'https://i1.sndcdn.com/artworks-sYBXJLgrb3xSTJyC-bqgxOQ-t500x500.jpg',
    soundcloud: 'https://soundcloud.com/anthony-neal-541671036/early-morning-rain-1'
  },
  {
    title: 'Livin with the Law',
    artist: 'Neal Coxworth',
    year: '2026',
    releaseType: 'Cover',
    featured: false,
    artwork: 'https://i1.sndcdn.com/artworks-Z8dDqia6jlcPs1EQ-yUuijQ-t500x500.jpg',
    soundcloud: 'https://soundcloud.com/anthony-neal-541671036/livin-with-the-law'
  },
  {
    title: 'Beige to Beige',
    artist: 'Neal Coxworth',
    year: '2026',
    releaseType: 'Cover',
    featured: false,
    artwork: 'https://i1.sndcdn.com/artworks-fsoVXTAP6RBm6hHd-hTcYKQ-t500x500.jpg',
    soundcloud: 'https://soundcloud.com/anthony-neal-541671036/beige-to-beige'
  },
  {
    title: 'Laughing on the Inside',
    artist: 'Neal Coxworth',
    year: '2026',
    releaseType: 'Cover',
    featured: false,
    artwork: 'https://i1.sndcdn.com/artworks-qWSCdIoyM9UnoAAU-9T5XtA-t500x500.jpg',
    soundcloud: 'https://soundcloud.com/anthony-neal-541671036/laughing-on-the-inside'
  },
  {
    title: 'The Long Road',
    artist: 'Neal Coxworth',
    year: '2026',
    releaseType: 'Cover',
    featured: false,
    artwork: 'https://i1.sndcdn.com/artworks-oX6JnCykUdVE7cQr-2iz5ZQ-t500x500.jpg',
    soundcloud: 'https://soundcloud.com/anthony-neal-541671036/the-long-road-1'
  },
  {
    title: 'Raised By Wolves',
    artist: 'Neal Coxworth',
    year: '2026',
    releaseType: 'Cover',
    featured: false,
    artwork: 'https://i1.sndcdn.com/artworks-uYKImpAMfA9ycI25-bK7cqg-t500x500.jpg',
    soundcloud: 'https://soundcloud.com/anthony-neal-541671036/raised-by-wolves'
  },
  {
    title: 'Subway',
    artist: 'Neal Coxworth',
    year: '2025',
    releaseType: 'Cover',
    featured: false,
    artwork: 'https://i1.sndcdn.com/artworks-dEAW3zmYEnsi1frb-tkzQtg-t500x500.jpg',
    soundcloud: 'https://soundcloud.com/anthony-neal-541671036/subway'
  }
];

// Order newest releases first, breaking ties alphabetically by title.
const sortTracks = (trackA, trackB) => {
  const yearA = Number(trackA.year) || 0;
  const yearB = Number(trackB.year) || 0;

  if (yearA !== yearB) {
    return yearB - yearA;
  }

  return trackA.title.localeCompare(trackB.title);
};

const sortedMusicLibrary = [...musicLibrary].sort(sortTracks);

// Keep listening-platform links and their accessibility labels consistent.
const platformLinks = (track) => `
  <div class="music-card__actions" aria-label="Play on">
    <span class="play-on-label">Play on</span>
    <div class="platform-links">
      <a class="platform-link" href="${track.soundcloud}" target="_blank" rel="noreferrer" aria-label="${track.title} on SoundCloud" title="SoundCloud">
        <img src="https://cdn.simpleicons.org/soundcloud/ffffff" alt="SoundCloud" />
      </a>
      <a class="platform-link" href="https://open.spotify.com/artist/61lR58BBUwx0pgY3PwmAyM" target="_blank" rel="noreferrer" aria-label="${track.title} on Spotify" title="Spotify">
        <img src="https://cdn.simpleicons.org/spotify/ffffff" alt="Spotify" />
      </a>
      <a class="platform-link" href="https://music.apple.com/us/album/sons-and-daughters-single/1853195804" target="_blank" rel="noreferrer" aria-label="${track.title} on Apple Music" title="Apple Music">
        <img src="https://cdn.simpleicons.org/applemusic/ffffff" alt="Apple Music" />
      </a>
    </div>
  </div>
`;

const getFeaturedTrack = () => {
  return sortedMusicLibrary.find((track) => track.featured) || sortedMusicLibrary[0] || null;
};

const getLibraryTracks = () => {
  const featured = getFeaturedTrack();

  if (!featured) {
    return [];
  }

  return sortedMusicLibrary.filter((track) => track.title !== featured.title);
};

// Fill the empty mount points in music.html from the sorted catalog above.
const renderMusicPage = () => {
  const featuredContainer = document.getElementById('featured-track');
  const musicLibraryContainer = document.getElementById('music-library');

  if (!featuredContainer || !musicLibraryContainer) {
    return;
  }

  if (!sortedMusicLibrary.length) {
    featuredContainer.innerHTML = '<div class="music-empty-state">Music is currently unavailable.</div>';
    musicLibraryContainer.innerHTML = '<div class="music-empty-state">No public tracks are available right now.</div>';
    return;
  }

  const featuredTrack = getFeaturedTrack();
  const otherTracks = getLibraryTracks();

  featuredContainer.innerHTML = `
    <article class="featured-card">
      <div class="featured-card__art">
        <img src="${featuredTrack.artwork}" alt="Artwork for ${featuredTrack.title}" loading="eager" />
      </div>
      <div class="featured-card__info">
        <div class="featured-card__meta">
          <span class="meta-tag">${featuredTrack.releaseType}</span>
          <span class="meta-tag">${featuredTrack.year}</span>
        </div>
        <div>
          <p class="eyebrow">Latest release</p>
          <h3 class="featured-card__title">${featuredTrack.title}</h3>
          <p class="featured-card__artist">${featuredTrack.artist}</p>
        </div>
        ${platformLinks(featuredTrack)}
      </div>
    </article>
  `;

  if (!otherTracks.length) {
    musicLibraryContainer.innerHTML = '<div class="music-empty-state">No additional releases yet.</div>';
    return;
  }

  musicLibraryContainer.innerHTML = otherTracks.map((track) => `
    <article class="music-card">
      <div class="music-card__art">
        <img src="${track.artwork}" alt="Artwork for ${track.title}" loading="lazy" />
      </div>
      <div class="music-card__content">
        <div class="music-card__head">
          <h3>${track.title}</h3>
          <span class="meta-tag">${track.year}</span>
        </div>
        <div class="music-card__meta">
          <span>${track.releaseType}</span>
          <span>${track.artist}</span>
        </div>
        ${platformLinks(track)}
      </div>
    </article>
  `).join('');
};

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderMusicPage);
  } else {
    renderMusicPage();
  }
}

window.musicLibrary = sortedMusicLibrary;
