export class AudioManager {
    private static _instance: AudioManager;

    private _bgm: HTMLAudioElement | null = null;
    private _isMuted = false;
    private _volume = 0.3; // default 30% volume

    private readonly STORAGE_KEY_MUTE = 'orlog_audio_muted';
    private readonly STORAGE_KEY_VOLUME = 'orlog_audio_volume';

    private constructor() {
        this.loadState();
    }

    static get instance() {
        if (!AudioManager._instance)
            AudioManager._instance = new AudioManager();
        return AudioManager._instance;
    }

    private saveState() {
        try {
            localStorage.setItem(this.STORAGE_KEY_MUTE, JSON.stringify(this._isMuted));
            localStorage.setItem(this.STORAGE_KEY_VOLUME, this._volume.toString());
        } catch (e) {
            console.warn("Could not save audio settings to localStorage", e);
        }
    }

    private loadState() {
        try {
            const storedMute = localStorage.getItem(this.STORAGE_KEY_MUTE);
            const storedVolume = localStorage.getItem(this.STORAGE_KEY_VOLUME);

            if (storedMute !== null)
                this._isMuted = JSON.parse(storedMute);

            if (storedVolume !== null) {
                const vol = Number.parseFloat(storedVolume);
                if (!Number.isNaN(vol) && vol >= 0 && vol <= 1) {
                    this._volume = vol;
                }
            }
        } catch (e) {
            console.warn("Could not load audio settings", e);
        }
    }

    // BACKGROUND MUSIC
    playBGM() {
        // stop previous
        if (this._bgm) {
            this._bgm.pause();
            this._bgm.currentTime = 0;
        }

        this._bgm = new Audio('/audio/bgm.mp3');
        this._bgm.loop = true;
        this._bgm.volume = this._isMuted ? 0 : this._volume;

        const promise = this._bgm.play();

        if (promise !== undefined) {
            promise.catch(() => {
                console.warn("Autoplay blocked. Waiting for user interaction...");
                this.addInteractionListener();
            });
        }
    }

    private addInteractionListener() {
        const resumeAudio = () => {
            if (this._bgm) {
                this._bgm.play().then(() => {
                    document.removeEventListener('click', resumeAudio);
                    document.removeEventListener('keydown', resumeAudio);
                })
                    .catch(e => console.error("Still blocked: ", e));
            }
        };

        document.addEventListener('click', resumeAudio);
        document.addEventListener('keydown', resumeAudio);
    }

    stopBGM() {
        if (this._bgm)
            this._bgm.pause();
    }

    playSFX(filename: string, volumeScale = 1) {
        if (this._isMuted) return;

        const sfx = new Audio('/audio/sfx/' + filename + '.wav');
        sfx.volume = Math.min(1, this._volume * volumeScale);

        sfx.play().catch(() => {});
    }

    // CONTROLS
    toggleMute() {
        this._isMuted = !this._isMuted;

        if (this._bgm)
            this._bgm.volume = this._isMuted ? 0 : this._volume;

        this.saveState();
        return this._isMuted;
    }

    setMasterVolume(volume: number) {
        this._volume = Math.max(0, Math.min(1, volume));
        this.updateBGMVolume();

        this.saveState();
    }

    private updateBGMVolume() {
        if (this._bgm)
            this._bgm.volume = this._isMuted ? 0 : this._volume;
    }

    public get volume(): number { return this._volume; }
    public get isMuted(): boolean { return this._isMuted; }
}

export const audioManager = AudioManager.instance;