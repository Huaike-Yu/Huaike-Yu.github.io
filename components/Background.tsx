import React, { useEffect, useRef } from 'react';

interface BackgroundProps {
  theme: 'light' | 'dark';
}

const Background: React.FC<BackgroundProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const shapes: Shape[] = [];
    const numShapes = 30;

    class Shape {
      x: number;
      y: number;
      z: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      type: 'circle' | 'square' | 'triangle';

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 2 + 1; // Depth factor
        this.size = Math.random() * 20 + 10;
        this.color = this.getColor();
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        const types: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
        this.type = types[Math.floor(Math.random() * types.length)];
      }

      getColor() {
        if (theme === 'light') {
          const colors = ['rgba(255, 209, 220, 0.4)', 'rgba(180, 228, 255, 0.4)', 'rgba(253, 253, 150, 0.4)', 'rgba(230, 206, 250, 0.4)'];
          return colors[Math.floor(Math.random() * colors.length)];
        } else {
          // Galaxy Theme Colors
          const colors = [
            'rgba(255, 255, 255, 0.8)',   // Stars
            'rgba(147, 51, 234, 0.3)',    // Purple Haze
            'rgba(79, 70, 229, 0.3)',     // Indigo Haze
            'rgba(236, 72, 153, 0.3)'     // Pink Nebula
          ];
          return colors[Math.floor(Math.random() * colors.length)];
        }
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        // Boundary wrap
        if (this.x < -50) this.x = width + 50;
        if (this.x > width + 50) this.x = -50;
        if (this.y < -50) this.y = height + 50;
        if (this.y > height + 50) this.y = -50;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        // Simple 3D parallax effect by scaling based on Z
        const scale = 1 / this.z;
        ctx.scale(scale, scale);
        
        ctx.fillStyle = this.color;
        
        // Add a blur for depth of field feel
        ctx.shadowBlur = theme === 'dark' ? 15 : 0;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        if (this.type === 'circle') {
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        } else if (this.type === 'square') {
          ctx.rect(-this.size/2, -this.size/2, this.size, this.size);
        } else if (this.type === 'triangle') {
          ctx.moveTo(0, -this.size);
          ctx.lineTo(this.size, this.size);
          ctx.lineTo(-this.size, this.size);
          ctx.closePath();
        }
        ctx.fill();
        ctx.restore();
      }
    }

    // Initialize shapes
    for (let i = 0; i < numShapes; i++) {
      shapes.push(new Shape());
    }

    let animationFrameId: number;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      // Clear with slight fade for trail effect if desired, but here we just clear
      ctx.clearRect(0, 0, width, height);
      
      // Draw background gradient based on theme
      if (theme === 'light') {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#fbfaf9'); // stone-50
        gradient.addColorStop(1, '#f5f5f4'); // stone-100
        ctx.fillStyle = gradient;
      } else {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#020617'); // slate-950 (Deep Space)
        gradient.addColorStop(1, '#1e1b4b'); // indigo-950
        ctx.fillStyle = gradient;
      }
      ctx.fillRect(0, 0, width, height);

      shapes.forEach(shape => {
        if (!reducedMotion) shape.update();
        shape.draw();
      });

      if (!reducedMotion) animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      if (reducedMotion) render();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
};

export default Background;
