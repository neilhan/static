export default class AudioEngine {
    private audioContext: AudioContext | null = null;
    private oscNode: OscillatorNode | null = null;
    private gainNode: GainNode | null = null;
    private frequency: number = 500;

    constructor(frequency: number = 500) {
        this.frequency = frequency;
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext || false);
        
        if (AudioContextClass) {
            this.audioContext = new AudioContextClass();
            if (this.audioContext) {
                this.oscNode = this.audioContext.createOscillator();
                this.oscNode.type = "sine";
                this.oscNode.frequency.value = this.frequency;
                
                this.gainNode = this.audioContext.createGain();
                this.gainNode.gain.setValueAtTime(0.0001, this.audioContext.currentTime); // OFF
    
                this.oscNode.connect(this.gainNode);
                this.gainNode.connect(this.audioContext.destination);
                
                this.oscNode.start();
            }
        } else {
            console.warn("Unable to create audio context");
        }
    }

    setFrequency(freq: number) {
        this.frequency = freq;
        if (this.oscNode) {
            this.oscNode.frequency.value = freq;
        }
    }

    unsuspend() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    getCurrentTime(): number {
        return this.audioContext ? this.audioContext.currentTime : 0;
    }

    scheduleTone(startTime: number, duration: number) {
        if (!this.gainNode) return;

        const RAMP = 0.005;
        const ON = 1.0;
        const OFF = 0.0001;

        this.gainNode.gain.setValueAtTime(OFF, startTime);
        this.gainNode.gain.exponentialRampToValueAtTime(ON, startTime + RAMP);
        this.gainNode.gain.setValueAtTime(ON, startTime + duration);
        this.gainNode.gain.exponentialRampToValueAtTime(OFF, startTime + duration + RAMP);
    }

    cancelScheduledValues(time: number) {
        if (this.gainNode) {
            this.gainNode.gain.cancelScheduledValues(time);
            this.gainNode.gain.setValueAtTime(0.0001, time);
        }
    }
}

