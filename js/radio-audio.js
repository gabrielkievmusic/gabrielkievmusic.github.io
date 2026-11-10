/* Imports */
import { getAudioContext, getMasterBus } from './audio.js';

/* --- RADIO STATIONS --- */
/* Station mapping */
const stationConfigs = [
    {
        id: 'fm-98',
        freq: 98,
        tracks: [
            './audio/stations/fm-98/Anomnia - I Dont Wanna Be.mp3',
            './audio/stations/fm-98/Anomnia - Bodies.mp3',
            './audio/stations/fm-98/Anomnia - Wont You Say Anything.mp3'
        ]
    },
    {
        id: 'fm-107',
        freq: 107,
        tracks: [
            './audio/stations/fm-107/1 - dorian.mp3',
            './audio/stations/fm-107/2 - lydian.mp3',
            //'./audio/stations/fm-107/3 - aeolian.mp3',
            './audio/stations/fm-107/4 - locrian.mp3',
            './audio/stations/fm-107/5 - phrygian.mp3',
            //'./audio/stations/fm-107/6 - mixolydian.mp3',
            './audio/stations/fm-107/7 - ionian.mp3',
        ]
    }
];

/* Station class */
class RadioStation {
    constructor(config) {
        this.freq = config.freq;
        this.id = config.id;
        this.tracks = config.tracks;

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
    playRandomTrack() {
        // Route audio to mixer
        if (!this.isRoutedToMixer) {
            const ctx = getAudioContext();
            const trackSource = ctx.createMediaElementSource(this.audio);
            trackSource.connect(getMasterBus());
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
        this.audio.src = this.tracks[randomIndex];
        this.audio.play();
    }

    /* Function to pause audio and store the currently playing track's time */
    pauseAndStoreTime() {
        this.audio.pause();
        this.lastPauseTime = Date.now();
        this.isPlaying = false;
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
    }

    /* Function to sync station volume and play/pause status to tuned freq */
    updateTuning(currentFreq, masterVolume) {
        // Tuning window width
        const tuningWindow = 2;
        const distance = Math.abs(currentFreq - this.freq);

        if (distance <= tuningWindow && masterVolume > 0) {
            /* Inside station window */
            const tuneFactor = Math.pow(1 - (distance / tuningWindow), 2);
            this.audio.volume = masterVolume * tuneFactor;

            if (!this.isPlaying) {
                this.resumeSimulatedBroadcast();
            }
        } else {
            /* Outside station window */
            if (this.isPlaying) {
                this.pauseAndStoreTime();
            }
        }
    }

}


/* --- AUDIO PLAYER --- */
const stations = stationConfigs.map(config => new RadioStation(config));

let currentMasterVolume = 0;
let currentFrequency = 90;
let isRadioPowered = false;

export const RadioAudio = {
    play: () => {
        isRadioPowered = true;
        RadioAudio.updateAllStations();
        console.log('Radio playing')
    },

    pause: () => {
        isRadioPowered = false;
        // Pause all stations
        stations.forEach(station => {
            if (station.isPlaying) station.pauseAndStoreTime();
        });
        console.log('All stations paused')
    },
    
    setVolume: (val) => {
        currentMasterVolume = Math.max(0, Math.min(1, val));
        RadioAudio.updateAllStations();
    },

    setFrequency: (freq) => {
        currentFrequency = freq;
        RadioAudio.updateAllStations();
    },

    /* Function to link the volume and frequency changes into all stations */
    updateAllStations: () => {
        if (!isRadioPowered) return;

        stations.forEach(station => {
            station.updateTuning(currentFrequency, currentMasterVolume);
        });

        console.log(`All stations updated: freq='${currentFrequency}', vol='${currentMasterVolume}'`)
    }
};
