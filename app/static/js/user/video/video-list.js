document.addEventListener('DOMContentLoaded', () => {
    // Initialize all Video.js players
    document.querySelectorAll('.video-js').forEach(videoElement => {
        const player = videojs(videoElement);

        // Play video on mouse enter
        videoElement.addEventListener('mouseenter', () => {
            player.muted(true); // Ensure video is muted
            player.play().catch(error => console.error("Playback error:", error));
        });

        // Pause video on mouse leave
        videoElement.addEventListener('mouseleave', () => {
            player.pause();
        });
    });
});
