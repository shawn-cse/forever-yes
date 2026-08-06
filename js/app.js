(() => {
  "use strict";

  const SELECTORS = {
    slides: ".slide",
    nextButtons: ".next-button",
    progressBar: "#progressBar",
    progressTrack: ".progress-track",
    stepLabel: "#stepLabel",
    stepNumber: "#stepNumber",
    stepTotal: "#stepTotal",
    yesButton: "#yesButton",
    noButton: "#noButton",
    choiceArea: "#choiceArea",
    playfulMessage: "#playfulMessage",
    restartButton: "#restartButton",
    musicToggle: "#musicToggle",
    backgroundMusic: "#backgroundMusic",
    confettiCanvas: "#confettiCanvas",
    floatingHearts: ".floating-hearts",
  };

  class ForeverYesApp {
    constructor() {
      this.slides = [...document.querySelectorAll(SELECTORS.slides)];
      this.nextButtons = [...document.querySelectorAll(SELECTORS.nextButtons)];
      this.progressBar = document.querySelector(SELECTORS.progressBar);
      this.progressTrack = document.querySelector(SELECTORS.progressTrack);
      this.stepLabel = document.querySelector(SELECTORS.stepLabel);
      this.stepNumber = document.querySelector(SELECTORS.stepNumber);
      this.stepTotal = document.querySelector(SELECTORS.stepTotal);
      this.yesButton = document.querySelector(SELECTORS.yesButton);
      this.noButton = document.querySelector(SELECTORS.noButton);
      this.choiceArea = document.querySelector(SELECTORS.choiceArea);
      this.playfulMessage = document.querySelector(SELECTORS.playfulMessage);
      this.restartButton = document.querySelector(SELECTORS.restartButton);
      this.musicToggle = document.querySelector(SELECTORS.musicToggle);
      this.backgroundMusic = document.querySelector(SELECTORS.backgroundMusic);
      this.floatingHearts = document.querySelector(SELECTORS.floatingHearts);
      this.confetti = new window.ConfettiCelebration(document.querySelector(SELECTORS.confettiCanvas));

      this.currentSlide = 0;
      this.questionSlideIndex = this.slides.length - 2;
      this.successSlideIndex = this.slides.length - 1;
      this.noAttempts = 0;
      this.messages = [
        "That button is feeling shy.",
        "Nice try — it moved again.",
        "It really wants you to choose the other one.",
        "The heart knows what it wants.",
      ];
    }

    init() {
      this.stepTotal.textContent = String(this.questionSlideIndex + 1);
      this.nextButtons.forEach((button) => button.addEventListener("click", () => this.goTo(this.currentSlide + 1)));
      this.yesButton.addEventListener("click", () => this.acceptProposal());
      this.restartButton.addEventListener("click", () => this.restart());
      this.musicToggle.addEventListener("click", () => this.toggleMusic());

      ["pointerenter", "pointerdown"].forEach((eventName) => {
        this.noButton.addEventListener(eventName, (event) => this.handleNoAttempt(event));
      });

      this.noButton.addEventListener("click", (event) => {
        event.preventDefault();
        this.handleNoAttempt(event);
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight" && this.currentSlide < this.questionSlideIndex) {
          this.goTo(this.currentSlide + 1);
        }
      });

      this.createFloatingHearts();
      this.updateProgress();
    }

    goTo(index) {
      if (index < 0 || index >= this.slides.length) return;

      this.slides[this.currentSlide].classList.remove("is-active");
      this.slides[this.currentSlide].setAttribute("aria-hidden", "true");
      this.currentSlide = index;
      this.slides[this.currentSlide].classList.add("is-active");
      this.slides[this.currentSlide].setAttribute("aria-hidden", "false");
      this.updateProgress();

      const firstInteractive = this.slides[this.currentSlide].querySelector("button");
      window.setTimeout(() => firstInteractive?.focus({ preventScroll: true }), 350);
    }

    updateProgress() {
      const visibleStep = Math.min(this.currentSlide + 1, this.questionSlideIndex + 1);
      const totalSteps = this.questionSlideIndex + 1;
      const progress = (visibleStep / totalSteps) * 100;
      const label = this.slides[this.currentSlide].dataset.label;

      this.stepLabel.textContent = label;
      this.stepNumber.textContent = String(visibleStep);
      this.progressBar.style.width = `${progress}%`;
      this.progressTrack.setAttribute("aria-valuenow", String(visibleStep));

      if (this.currentSlide === this.successSlideIndex) {
        this.progressBar.style.width = "100%";
        this.progressTrack.setAttribute("aria-valuenow", String(totalSteps));
      }
    }

    handleNoAttempt(event) {
      if (this.currentSlide !== this.questionSlideIndex) return;
      if (event.type === "pointerdown") event.preventDefault();

      this.noAttempts += 1;
      const areaRect = this.choiceArea.getBoundingClientRect();
      const buttonRect = this.noButton.getBoundingClientRect();
      const maxX = Math.max(0, areaRect.width - buttonRect.width);
      const maxY = Math.max(0, areaRect.height - buttonRect.height);
      const nextX = Math.random() * maxX;
      const nextY = Math.random() * maxY;

      this.noButton.style.position = "absolute";
      this.noButton.style.left = `${nextX}px`;
      this.noButton.style.top = `${nextY}px`;
      this.playfulMessage.textContent = this.messages[(this.noAttempts - 1) % this.messages.length];

      const scale = Math.min(1.18, 1 + this.noAttempts * 0.035);
      this.yesButton.style.transform = `scale(${scale})`;
    }

    acceptProposal() {
      this.goTo(this.successSlideIndex);
      this.confetti.start();
      this.playMusic();
    }

    restart() {
      this.confetti.stop();
      this.noAttempts = 0;
      this.noButton.removeAttribute("style");
      this.yesButton.removeAttribute("style");
      this.playfulMessage.textContent = "";
      this.goTo(0);
    }

    async toggleMusic() {
      if (this.backgroundMusic.paused) {
        await this.playMusic();
      } else {
        this.backgroundMusic.pause();
        this.updateMusicButton(false);
      }
    }

    async playMusic() {
      try {
        await this.backgroundMusic.play();
        this.updateMusicButton(true);
      } catch {
        this.updateMusicButton(false);
      }
    }

    updateMusicButton(isPlaying) {
      this.musicToggle.setAttribute("aria-pressed", String(isPlaying));
      this.musicToggle.setAttribute("aria-label", isPlaying ? "Pause background music" : "Play background music");
      const label = this.musicToggle.querySelector(".music-label");
      if (label) label.textContent = isPlaying ? "Pause" : "Music";
    }

    createFloatingHearts() {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const fragment = document.createDocumentFragment();
      for (let index = 0; index < 12; index += 1) {
        const heart = document.createElement("span");
        heart.className = "floating-heart";
        heart.textContent = "♥";
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.setProperty("--size", `${12 + Math.random() * 18}px`);
        heart.style.setProperty("--duration", `${10 + Math.random() * 10}s`);
        heart.style.setProperty("--delay", `${-Math.random() * 18}s`);
        heart.style.setProperty("--drift", `${-40 + Math.random() * 80}px`);
        fragment.appendChild(heart);
      }
      this.floatingHearts.appendChild(fragment);
    }
  }

  document.addEventListener("DOMContentLoaded", () => new ForeverYesApp().init());
})();
