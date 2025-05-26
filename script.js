// id muzyczki dodajesz
const YOUTUBE_VIDEO_IDS = [
    '1DUNj_CdqC0', 
    'OX3FtEB4kXw',
    'B0B_mQZfeiY'

];

let player;
let isMuted = false;
let currentVideoIndex = 0;

const volumeSlider = document.getElementById("volume-slider");
const songTitleDisplay = document.getElementById("current-song-title");
const songThumbnailDisplay = document.getElementById("song-thumbnail");
const volumeMuteButton = document.getElementById("volume-mute-btn");
const youtubeBackgroundPlayerElement = document.getElementById("youtube-background-player");
const backgroundOverlay = document.querySelector(".background-overlay");
const loadingWordContainer = document.querySelector(".loading-word-container");

const prevSongBtn = document.getElementById("prev-song-btn");
const nextSongBtn = document.getElementById("next-song-btn");

window.onYouTubeIframeAPIReady = function() {
    player = new YT.Player('youtube-background-player', {
        videoId: YOUTUBE_VIDEO_IDS[currentVideoIndex],
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'loop': 1,
            'playlist': YOUTUBE_VIDEO_IDS.join(','),
            'modestbranding': 1,
            'fs': 0,
            'iv_load_policy': 3,
            'disablekb': 1,
            'rel': 0,
            'showinfo': 0,
            'mute': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
};

function onPlayerReady(event) {
    player.unMute();
    isMuted = false;
    volumeMuteButton.textContent = '🔊';
    player.setVolume(parseFloat(volumeSlider.value) * 100);
    player.playVideo();

    updateSongTitle();
    document.body.classList.add('loaded');
    animateLoadingText();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        playNextVideo();
    } else if (event.data === YT.PlayerState.PLAYING) {
        updateSongTitle();
        if (!isMuted) {
            player.setVolume(parseFloat(volumeSlider.value) * 100);
        }
    }
}

function onPlayerError(event) {
    console.error("Błąd odtwarzania wideo YouTube:", event.data);
    songTitleDisplay.textContent = "Błąd ładowania muzyki.";
    if(songThumbnailDisplay) songThumbnailDisplay.style.display = 'none';

    if (youtubeBackgroundPlayerElement) {
        youtubeBackgroundPlayerElement.style.backgroundImage = 'url(assets/fallback-background.jpg)';
        youtubeBackgroundPlayerElement.style.backgroundSize = 'cover';
        youtubeBackgroundPlayerElement.style.backgroundPosition = 'center';
        youtubeBackgroundPlayerElement.style.filter = 'none';
    }
    if (backgroundOverlay) {
        backgroundOverlay.style.background = 'rgba(0, 0, 0, 0.85)';
        backgroundOverlay.style.backdropFilter = 'none';
    }

    document.querySelector('.music-player-panel .player-controls').style.display = 'none';
}

function updateSongTitle() {
    if (player && typeof player.getVideoData === 'function') {
        const videoData = player.getVideoData();
        if (videoData && videoData.title) {
            let title = videoData.title;
            const maxLength = 28;
            if (title.length > maxLength) {
                title = title.substring(0, maxLength) + "...";
            }
            songTitleDisplay.textContent = title;

            if (songThumbnailDisplay) {
                const videoId = videoData.video_id || YOUTUBE_VIDEO_IDS[currentVideoIndex];
                if (videoId) {
                    songThumbnailDisplay.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
                    songThumbnailDisplay.style.display = 'inline-block';
                } else {
                    songThumbnailDisplay.style.display = 'none';
                }
            }

        } else {
            songTitleDisplay.textContent = `Wczytywanie...`;
            if (songThumbnailDisplay) songThumbnailDisplay.style.display = 'none';
        }
    }
}


function playNextVideo() {
    if (YOUTUBE_VIDEO_IDS.length === 0) return;
    currentVideoIndex = (currentVideoIndex + 1) % YOUTUBE_VIDEO_IDS.length;
    player.loadVideoById(YOUTUBE_VIDEO_IDS[currentVideoIndex]);
}

function playPreviousVideo() {
    if (YOUTUBE_VIDEO_IDS.length === 0) return;
    currentVideoIndex = (currentVideoIndex - 1 + YOUTUBE_VIDEO_IDS.length) % YOUTUBE_VIDEO_IDS.length;
    player.loadVideoById(YOUTUBE_VIDEO_IDS[currentVideoIndex]);
}

function animateLoadingText() {
    const text = loadingWordContainer.textContent;
    loadingWordContainer.innerHTML = '';
    text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.animationDelay = `${index * 0.05}s`;
        loadingWordContainer.appendChild(span);
    });
}

volumeSlider.addEventListener("input", () => {
    if (player && typeof player.setVolume === 'function') {
        const newVolume = parseFloat(volumeSlider.value);
        player.setVolume(newVolume * 100);

        if (newVolume > 0 && isMuted) {
            player.unMute();
            isMuted = false;
            volumeMuteButton.textContent = '🔊';
        } else if (newVolume === 0 && !isMuted) {
            player.mute();
            isMuted = true;
            volumeMuteButton.textContent = '🔇';
        }
    }
});

function toggleMute() {
    if (player) {
        if (isMuted) {
            player.unMute();
            if (parseFloat(volumeSlider.value) === 0) {
                volumeSlider.value = 0.3;
                player.setVolume(30);
            } else {
                 player.setVolume(parseFloat(volumeSlider.value) * 100);
            }
            volumeMuteButton.textContent = '🔊';
        } else {
            player.mute();
            volumeMuteButton.textContent = '🔇';
        }
        isMuted = !isMuted;
    }
}
volumeMuteButton.addEventListener("click", toggleMute);

prevSongBtn.addEventListener("click", playPreviousVideo);
nextSongBtn.addEventListener("click", playNextVideo);

document.addEventListener('mousemove', (e) => {
    const youtubePlayerIframe = document.querySelector('#youtube-background-player iframe');
    if (youtubePlayerIframe && document.body.classList.contains('loaded')) {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        const moveX = (clientX / innerWidth - 0.5) * 15;
        const moveY = (clientY / innerHeight - 0.5) * 10;

        youtubePlayerIframe.style.transform = `scale(1.1) translate(${moveX}px, ${moveY}px)`;
    }
});

document.addEventListener('click', function onFirstUserClick() {
    if (player && player.getPlayerState && player.getPlayerState() !== YT.PlayerState.PLAYING) {
        if (player.isMuted()) {
             player.unMute();
             isMuted = false;
             volumeMuteButton.textContent = '🔊';
             const currentSliderVolume = parseFloat(volumeSlider.value);
             player.setVolume(currentSliderVolume > 0 ? currentSliderVolume * 100 : 30);
             if(currentSliderVolume === 0) volumeSlider.value = 0.3;
        }
        player.playVideo();
        console.log("Próba wznowienia odtwarzania po kliknięciu użytkownika.");
    }
    document.removeEventListener('click', onFirstUserClick);
}, { once: true });

window.onload = function() {

};