let audioContextInstance = null;

export const playAudioBeep = (freq = 520, duration = 0.12, volume = 0.05) => {
  try {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtxClass) return;

    if (!audioContextInstance) {
      audioContextInstance = new AudioCtxClass();
    }

    if (audioContextInstance.state === 'suspended') {
      audioContextInstance.resume();
    }

    const osc = audioContextInstance.createOscillator();
    const gain = audioContextInstance.createGain();

    osc.frequency.value = freq;
    gain.gain.value = volume;

    osc.connect(gain);
    gain.connect(audioContextInstance.destination);

    osc.start();
    osc.stop(audioContextInstance.currentTime + duration);
  } catch {}
};
