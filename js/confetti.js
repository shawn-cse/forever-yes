(() => {
  "use strict";

  class ConfettiCelebration {
    constructor(canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext("2d");
      this.particles = [];
      this.animationFrame = null;
      this.endTime = 0;
      this.colors = ["#b42360", "#f06292", "#f3b4c7", "#7f1d4e", "#f6c453", "#ffffff"];
      this.resize = this.resize.bind(this);
      window.addEventListener("resize", this.resize, { passive: true });
      this.resize();
    }

    resize() {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.floor(window.innerWidth * pixelRatio);
      this.canvas.height = Math.floor(window.innerHeight * pixelRatio);
      this.canvas.style.width = `${window.innerWidth}px`;
      this.canvas.style.height = `${window.innerHeight}px`;
      this.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    createParticle() {
      return {
        x: Math.random() * window.innerWidth,
        y: -24,
        size: 6 + Math.random() * 8,
        velocityX: -2.5 + Math.random() * 5,
        velocityY: 2.8 + Math.random() * 4.5,
        rotation: Math.random() * Math.PI,
        rotationSpeed: -0.15 + Math.random() * 0.3,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        shape: Math.random() > 0.32 ? "rectangle" : "circle",
        wobble: Math.random() * Math.PI * 2,
      };
    }

    start(duration = 4200) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      this.stop();
      this.endTime = performance.now() + duration;
      this.particles = Array.from({ length: 110 }, () => this.createParticle());
      this.animate();
    }

    stop() {
      if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
      this.particles = [];
      this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    animate() {
      const now = performance.now();
      const context = this.context;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (now < this.endTime && this.particles.length < 190) {
        this.particles.push(this.createParticle(), this.createParticle());
      }

      this.particles = this.particles.filter((particle) => {
        particle.x += particle.velocityX + Math.sin(particle.wobble) * 0.55;
        particle.y += particle.velocityY;
        particle.rotation += particle.rotationSpeed;
        particle.wobble += 0.08;

        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.fillStyle = particle.color;

        if (particle.shape === "circle") {
          context.beginPath();
          context.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
          context.fill();
        } else {
          context.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
        }

        context.restore();
        return particle.y < window.innerHeight + 40;
      });

      if (this.particles.length || now < this.endTime) {
        this.animationFrame = requestAnimationFrame(() => this.animate());
      } else {
        this.stop();
      }
    }
  }

  window.ConfettiCelebration = ConfettiCelebration;
})();
