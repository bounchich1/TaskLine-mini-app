const NOTES = [880, 1320];
const NOTE_SECONDS = 0.12;

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

export function playChime(): void {
    try {
        const Context = (window as AudioWindow).webkitAudioContext ?? AudioContext;
        const audio = new Context();

        NOTES.forEach((frequency, index) => {
            const oscillator = audio.createOscillator();
            const gain = audio.createGain();
            const start = audio.currentTime + index * NOTE_SECONDS;

            oscillator.frequency.value = frequency;
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(0.15, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + NOTE_SECONDS);
            oscillator.connect(gain).connect(audio.destination);
            oscillator.start(start);
            oscillator.stop(start + NOTE_SECONDS);
        });

        setTimeout(() => void audio.close(), 1000);
    } catch {
        return;
    }
}
