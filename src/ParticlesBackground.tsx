import React, { useEffect, useRef } from 'react';

const ParticlesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Star {
      x: number;
      y: number;
      size: number;
      opacity: number;
      fadeSpeed: number;
      speedX: number;
      speedY: number;
      blink: boolean;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * (canvas?.width || window.innerWidth);
        this.y = Math.random() * (canvas?.height || window.innerHeight);
        this.size = Math.random() * 1.5 + 0.2;
        this.opacity = Math.random();
        this.fadeSpeed = Math.random() * 0.01 + 0.005;
        this.speedX = (Math.random() * 0.1 - 0.05);
        this.speedY = (Math.random() * 0.1 - 0.05);
        this.blink = Math.random() > 0.8;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.blink) {
          this.opacity += this.fadeSpeed;
          if (this.opacity > 1 || this.opacity < 0.2) {
            this.fadeSpeed = -this.fadeSpeed;
          }
        }

        if (this.x > (canvas?.width || 0)) this.x = 0;
        else if (this.x < 0) this.x = canvas?.width || 0;

        if (this.y > (canvas?.height || 0)) this.y = 0;
        else if (this.y < 0) this.y = canvas?.height || 0;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.shadowBlur = this.blink ? 4 : 0;
        ctx.shadowColor = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const init = () => {
      stars = [];
      const numberOfStars = (canvas.width * canvas.height) / 8000;
      for (let i = 0; i < numberOfStars; i++) {
        stars.push(new Star());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw a subtle multi-layered gradient for deeper space look
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      );
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#020617');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < stars.length; i++) {
        stars[i].update();
        stars[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', () => {
      resize();
      init();
    });
    resize();
    init();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ParticlesBackground;
