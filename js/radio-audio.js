/* Imports */
import { PinkNoise } from './random.js'
import { getAudioContext, getMasterBus } from './audio.js';

/* Function to create the radio static from pink noise */
function createStaticNoise(ctx) {
    // Pink noise generator
    const pinkGen = new PinkNoise();

    // 5 second audio buffer that will be looped
    const bufferSize = ctx.sampleRate * 5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    // Fill buffer
    for (let i = 0; i < bufferSize; i++) {
        output[i] = pinkGen.next();
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Gain control
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;
    /* Noise source -> Noise gain */
    noiseSource.connect(noiseGain);

    return { noiseSource, noiseGain };
}


/* --- RADIO STATIONS --- */
/* Station mapping */
const stationConfigs = [
    /* FM */
    {
        id: 'fm-98',
        freq: 98,
        isBanked: true,
        tracks: [
            {file: './audio/stations/fm-98/Anomnia - I Dont Wanna Be.mp3', link: 'https://linktr.ee/anomnia'},
            {file: './audio/stations/fm-98/Anomnia - Bodies.mp3', link: 'https://linktr.ee/anomnia'},
            {file: './audio/stations/fm-98/Anomnia - Wont You Say Anything.mp3', link: 'https://linktr.ee/anomnia'}
        ]
    },
    {
        id: 'fm-107',
        freq: 107,
        isBanked: true,
        tracks: [
            {file: './audio/stations/fm-107/1 - dorian.mp3', link: 'https://soundcloud.com/gabriel-kiev-375092820'},
            {file: './audio/stations/fm-107/2 - lydian.mp3', link: 'https://soundcloud.com/gabriel-kiev-375092820'},
            //'./audio/stations/fm-107/3 - aeolian.mp3',
            {file: './audio/stations/fm-107/4 - locrian.mp3', link: 'https://soundcloud.com/gabriel-kiev-375092820'},
            {file: './audio/stations/fm-107/5 - phrygian.mp3', link: 'https://soundcloud.com/gabriel-kiev-375092820'},
            //'./audio/stations/fm-107/6 - mixolydian.mp3',
            {file: './audio/stations/fm-107/7 - ionian.mp3', link: 'https://soundcloud.com/gabriel-kiev-375092820'}
        ]
    },
    /* AM */
    {
        id: 'am-75',
        freq: 75,
        isBanked: true,
        tracks: [
            {file: './audio/stations/am-75/ambient-test.mp3', link: null}
        ]
    }
];

/* Station class */
class RadioStation {
    constructor(config) {
        this.band = config.id.split('-')[0];
        this.freq = config.freq;
        this.id = config.id;
        this.tracks = config.tracks;
        this.isBanked = config.isBanked;

        this.audio = new Audio();
        this.audio.crossOrigin = "anonymous";
        this.isRoutedToMixer = false;

        this.isPlaying = false;
        this.isFirstPlay = true;
        this.currentTrackIndex = -1;

        this.audio.addEventListener('ended', () => this.playRandomTrack());
    }

    /* -- Auxiliary functions -- */
    /* Function to play a random track from the tracklist */
    /* Includes Audio Context and low-pass filter connections */
    playRandomTrack() {
        // Route audio to mixer
        if (!this.isRoutedToMixer) {
            const ctx = getAudioContext();
            const trackSource = ctx.createMediaElementSource(this.audio);

            // Low-pass filter
            this.filterNode = ctx.createBiquadFilter();
            this.filterNode.type = 'lowpass';

            // Audio -> Filter -> Mixer
            trackSource.connect(this.filterNode);
            this.filterNode.connect(getMasterBus());
            this.isRoutedToMixer = true;
        }

        let randomIndex;

        if(this.tracks.length > 1) {
            do {
                randomIndex = Math.floor(Math.random() * this.tracks.length);
            } while (randomIndex === this.currentTrackIndex);
        } else {
            randomIndex = 0;
        }

        this.currentTrackIndex = randomIndex;
        this.audio.src = this.tracks[randomIndex].file;
        this.audio.currentTime = 0;
        this.audio.play();
        notifyLinkStatus();
    }

    /* Function to pause audio and store the currently playing track's time */
    pauseAndStoreTime() {
        this.audio.pause();
        this.lastPauseTime = Date.now();
        this.isPlaying = false;
    }

    /* Function to get the current track's source link */
    getCurrentLink() {
        if (this.currentTrackIndex === -1) return null;
        return this.tracks[this.currentTrackIndex].link;
    }

    /* Function to play the simulated "broadcast" when tuning to radio */
    resumeSimulatedBroadcast() {
        if (this.isFirstPlay) {
            // If it's the first play on the station, play a random track...
            this.playRandomTrack();

            // ... at a random time
            this.audio.addEventListener('loadedmetadata', () => {
                if (this.isFirstPlay) {
                    this.audio.currentTime = Math.random() * (this.audio.duration || 0);
                    this.isFirstPlay = false;
                }
            }, {once: true});
        } else {
            // If station has been played before, simulate runtime to advance track
            const elapsedSeconds = (Date.now() - this.lastPauseTime) / 1000;
            const remainingTimeOnTrack = this.audio.duration - this.audio.currentTime;

            if (elapsedSeconds < remainingTimeOnTrack) {
                // Last music playing has not finished yet, continue it
                this.audio.currentTime += elapsedSeconds;
                this.audio.play();
            } else {
                // Last music playing has finished, get a new random track at a random time (in the first half of song)
                this.playRandomTrack();

                this.audio.addEventListener('loadedmetadata', () => {
                    this.audio.currentTime = Math.random() * (this.audio.duration*0.5 || 0);
                }, {once: true});
            }
        }

        this.isPlaying = true;
        notifyLinkStatus();
    }

    /* Function to sync station volume and play/pause status to tuned freq */
    updateTuning(currentFreq, masterVolume) {  // TODO: Add "hasBeenTunedTo" logic to AFC
        // Tuning window width
        const tuningWindow = 3;
        const distance = Math.abs(currentFreq - this.freq);

        let tuneFactor = 0;

        if (distance <= tuningWindow && masterVolume > 0) {
            /* Inside station window */
            tuneFactor = Math.pow(1 - (distance / tuningWindow), 2);
            this.audio.volume = masterVolume * tuneFactor;

            // Low-pass filter logic
            if (this.filterNode) {
                const ctx = getAudioContext();

                // Cutoff range
                const maxCutoff = this.band === 'am' ? 5000 : 15000;
                const minCutoff = 100;

                // Exponential curve
                const currentCutoff = minCutoff + (maxCutoff - minCutoff)*Math.pow(tuneFactor, 3);

                // Resonance
                const currentQ = 3.5 - (tuneFactor * 3.0);

                // Apply smoothly
                this.filterNode.frequency.setTargetAtTime(currentCutoff, ctx.currentTime, 0.05);
                this.filterNode.Q.setTargetAtTime(currentQ, ctx.currentTime, 0.05);
            }

            if (!this.isPlaying) {
                this.resumeSimulatedBroadcast();
            }
        } else {
            /* Outside station window */
            if (this.isPlaying) {
                this.pauseAndStoreTime();
            }
        }

        return tuneFactor;
    }

}


/* --- AUDIO PLAYER --- */
const stations = stationConfigs.map(config => new RadioStation(config));

let isRadioPowered = false;
let currentMasterVolume = 0;
let currentFrequency = 90;
let currentBand = 'fm';
let currentStation = null;

let staticSourceNode = null;
let staticGainNode = null;
let isStaticInitialized = false;

/* Function to tell the UI if the current track has a source link or not */
function notifyLinkStatus() {
    const link = RadioAudio.getTunedTrackLink();
    const hasLink = !!link;
    document.dispatchEvent(new CustomEvent('radio-link-update', { detail: hasLink }));
}

export const RadioAudio = {
    play: () => {
        isRadioPowered = true;

        // Initialize static noise
        if (!isStaticInitialized) {
            const ctx = getAudioContext();
            const { noiseSource, noiseGain } = createStaticNoise(ctx);
            staticSourceNode = noiseSource;
            staticGainNode = noiseGain;

            /* [Noise source -> Noise gain] -> Master Bus */
            staticGainNode.connect(getMasterBus());
            staticSourceNode.start();
            isStaticInitialized = true;
        }

        RadioAudio.updateAllStations();
        //console.log('Radio playing')
    },

    pause: () => {
        isRadioPowered = false;
        // Pause all stations
        stations.forEach(station => {
            if (station.isPlaying) station.pauseAndStoreTime();
        });
        //console.log('All stations paused')
    },
    
    setVolume: (val) => {
        currentMasterVolume = Math.max(0, Math.min(1, val));
        RadioAudio.updateAllStations();
    },

    setBand: (band) => {
        currentBand = band;
        RadioAudio.updateAllStations();
    },

    setFrequency: (freq) => {
        currentFrequency = freq;
        RadioAudio.updateAllStations();
    },

    /* Function to get the link from the current active station */
    getTunedTrackLink: () => {
        if (!isRadioPowered || !currentStation) return null;
        return currentStation.getCurrentLink();
    },

    /* Function to seek the closest banked station in the given direction */
    getNextBankedFrequency: (direction) => {
        // Filter through "isBanked=true" stations in the current frequency band
        const validStations = stations
            .filter(s => s.band === currentBand && s.isBanked)
            .map(s => s.freq)
            .sort((a, b) => a - b);

        if (validStations.length === 0) return null;

        if (direction === 1) { // To the right
            const nextFreq = validStations.find(f => f > currentFrequency + 0.1);
            return nextFreq !== undefined ? nextFreq : null; 
        } else { // Buscar para a Esquerda (Frequência Menor)
            const prevFreq = [...validStations].reverse().find(f => f < currentFrequency - 0.1);
            return prevFreq !== undefined ? prevFreq : null;
        }
    },


    /* Function to send the volume and frequency changes into all stations */
    updateAllStations: () => {
        if (!isRadioPowered) return;

        let maxTuneFactor = 0;
        currentStation = null;

        stations.forEach(station => {
            const effectiveFreq = (station.band === currentBand) ? currentFrequency : Infinity;
            const tuneFactor = station.updateTuning(effectiveFreq, currentMasterVolume);
            
            if (tuneFactor > maxTuneFactor) {
                maxTuneFactor = tuneFactor;
                if (tuneFactor > 0.5) {
                    currentStation = station;
                }
            }

        });
        
        // Static noise crossfade
        if (staticGainNode) {
            const ctx = getAudioContext();
            const staticPresence = 1.0 - maxTuneFactor;

            const targetStaticVolume = currentMasterVolume * Math.pow(staticPresence, 2) * 0.15;

            staticGainNode.gain.setTargetAtTime(targetStaticVolume, ctx.currentTime, 0.05);
        }
        
        document.dispatchEvent(new CustomEvent('radio-tuning', {detail: maxTuneFactor}));
        notifyLinkStatus();
    }

};
