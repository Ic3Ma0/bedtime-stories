class SpeechManager {
  private synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  private utterance: SpeechSynthesisUtterance | null = null;
  public isSpeaking = false;
  public isPaused = false;
  private rate = 0.9;
  private onChange?: () => void;

  isSupported() {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  setOnChange(cb: () => void) {
    this.onChange = cb;
  }

  speak(text: string) {
    if (!this.isSupported()) {
      alert("当前浏览器不支持语音朗读功能");
      return;
    }
    if (this.isSpeaking) {
      this.stop();
    }
    this.synth?.cancel();

    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.lang = "zh-CN";
    this.utterance.rate = this.rate;
    this.utterance.pitch = 1.0;

    this.utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.onChange?.();
    };

    this.utterance.onerror = (e) => {
      if (e.error !== "canceled") {
        console.warn("语音朗读出错:", e.error);
      }
      this.isSpeaking = false;
      this.isPaused = false;
      this.onChange?.();
    };

    this.synth?.speak(this.utterance);
    this.isSpeaking = true;
    this.isPaused = false;
    this.onChange?.();
  }

  pause() {
    if (this.synth && this.isSpeaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.onChange?.();
    }
  }

  resume() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.onChange?.();
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
      this.onChange?.();
    }
  }

  setRate(newRate: number) {
    this.rate = Math.max(0.5, Math.min(2.0, newRate));
  }

  getRate() {
    return this.rate;
  }
}

export const speech = new SpeechManager();
