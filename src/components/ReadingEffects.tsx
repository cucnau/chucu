import React from 'react';

interface ReadingEffectsProps {
  effect?: 'none' | 'rain' | 'snow' | 'glitch' | 'star' | 'leaf' | 'ginkgo' | 'cherry_blossom' | 'firefly' | 'soap_bubble' | 'fireworks' | 'fire_sparks' | 'sci_fi_hud' | 'fruits' | 'ocean' | 'butterflies' | 'feathers' | 'lightning' | 'fog';
  effectColor?: string;
  isDarkTheme: boolean;
}

const hexToRgb = (hex?: string) => {
  let c = hex ? hex.replace('#', '').trim() : '00f0ff';
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  if (c.length !== 6) c = '00f0ff';
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 0, g: 240, b: 255 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
};

export const ReadingEffects: React.FC<ReadingEffectsProps> = ({ effect = 'none', effectColor = '#00f0ff', isDarkTheme }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (effect === 'none' || !effect) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle system containers
    let particles: any[] = [];
    const maxParticles = 
      effect === 'rain' ? 75 : 
      effect === 'snow' ? 50 : 
      effect === 'star' ? 45 : 
      effect === 'leaf' ? 18 : 
      effect === 'ginkgo' ? 18 :
      effect === 'cherry_blossom' ? 8 : 
      effect === 'firefly' ? 28 : 
      effect === 'soap_bubble' ? 18 :
      effect === 'fire_sparks' ? 20 :
      effect === 'fruits' ? 6 :
      effect === 'ocean' ? 0 :
      effect === 'butterflies' ? 4 :
      effect === 'feathers' ? 4 :
      effect === 'lightning' ? 1 :
      effect === 'fog' ? 20 :
      effect === 'sci_fi_hud' ? 6 :
      effect === 'fireworks' ? 0 :
      0;

    class RainParticle {
      x: number = Math.random() * width;
      y: number = Math.random() * height - height;
      vy: number = 8 + Math.random() * 8;
      len: number = 14 + Math.random() * 18;
      opacity: number = 0.25 + Math.random() * 0.3;

      update() {
        this.y += this.vy;
        if (this.y > height) {
          this.y = -20;
          this.x = Math.random() * width;
          this.vy = 8 + Math.random() * 8;
        }
      }

      draw(c?: CanvasRenderingContext2D, rgb?: { r: number; g: number; b: number }) {
        ctx.beginPath();
        if (rgb) {
          ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.opacity + (isDarkTheme ? 0.2 : 0.45)})`;
          ctx.lineWidth = isDarkTheme ? 1.3 : 1.8;
        } else if (isDarkTheme) {
          ctx.strokeStyle = `rgba(186, 230, 253, ${this.opacity})`; // Sky blue silver on dark
          ctx.lineWidth = 1.1;
        } else {
          ctx.strokeStyle = `rgba(15, 23, 42, ${this.opacity + 0.45})`; // Deep navy blue on light themes
          ctx.lineWidth = 1.6;
        }
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.len);
        ctx.stroke();
      }
    }

    class SnowParticle {
      x: number = Math.random() * width;
      y: number = Math.random() * height;
      r: number = 1.8 + Math.random() * 2.5;
      vy: number = 0.5 + Math.random() * 0.8;
      opacity: number = 0.3 + Math.random() * 0.4;
      swing: number = Math.random() * 100;

      update() {
        this.y += this.vy;
        this.x += Math.sin((this.y + this.swing) / 30) * 0.5;
        if (this.y > height) {
          this.y = -10;
          this.x = Math.random() * width;
        }
      }

      draw(c?: CanvasRenderingContext2D, rgb?: { r: number; g: number; b: number }) {
        ctx.beginPath();
        if (rgb) {
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.opacity + (isDarkTheme ? 0.2 : 0.45)})`;
          ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
          ctx.fill();
        } else if (isDarkTheme) {
          ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
          ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
          ctx.fill();
        } else {
          // Sharp slate snowflake with subtle contrast outline on light background
          ctx.fillStyle = `rgba(30, 41, 59, ${this.opacity + 0.45})`;
          ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
          ctx.fill();
          ctx.strokeStyle = `rgba(255, 255, 255, 0.6)`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    class StarParticle {
      x: number = Math.random() * width;
      y: number = Math.random() * height;
      r: number = 0.6 + Math.random() * 1.0;
      alpha: number = Math.random();
      speed: number = 0.003 + Math.random() * 0.008;
      isSparkle: boolean = Math.random() > 0.75;

      update() {
        this.alpha += this.speed;
        if (this.alpha > 0.95 || this.alpha < 0.05) {
          this.speed = -this.speed;
        }
      }

      draw(c?: CanvasRenderingContext2D, rgb?: { r: number; g: number; b: number }) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        const opacityVal = isDarkTheme 
          ? Math.max(0.2, this.alpha * 0.8) 
          : Math.max(0.35, this.alpha * 0.9);
          
        if (rgb) {
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacityVal})`;
        } else if (isDarkTheme) {
          ctx.fillStyle = `rgba(254, 240, 138, ${opacityVal})`; // Warm soft gold on dark
        } else {
          ctx.fillStyle = `rgba(180, 83, 9, ${opacityVal})`; // Rich amber bronze on light
        }
          
        if (this.isSparkle) {
          const size = this.r * 2.2;
          ctx.beginPath();
          ctx.moveTo(0, -size);
          ctx.quadraticCurveTo(0, 0, size, 0);
          ctx.quadraticCurveTo(0, 0, 0, size);
          ctx.quadraticCurveTo(0, 0, -size, 0);
          ctx.quadraticCurveTo(0, 0, 0, -size);
          ctx.closePath();
          ctx.fill();
          if (!isDarkTheme) {
            ctx.strokeStyle = `rgba(254, 243, 199, 0.8)`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, this.r, 0, Math.PI * 2, true);
          ctx.fill();
        }
        
        ctx.restore();
      }
    }

    class LeafParticle {
      x: number = Math.random() * width;
      y: number = Math.random() * height - 30;
      r: number = 9 + Math.random() * 7; // Size of maple leaf
      angle: number = Math.random() * Math.PI * 2;
      rotationSpeed: number = (Math.random() - 0.5) * 0.012;
      vy: number = 0.25 + Math.random() * 0.35; // Rơi rất chậm rãi
      vx: number = -0.3 + Math.random() * 0.3;
      opacity: number = 0.18 + Math.random() * 0.2; // Mờ dịu mắt hơn

      update() {
        this.y += this.vy;
        this.x += this.vx + Math.sin(this.y / 40) * 0.5;
        this.angle += this.rotationSpeed;
        if (this.y > height + 25) {
          this.y = -25;
          this.x = Math.random() * width;
        }
      }

      draw(c?: CanvasRenderingContext2D, rgb?: { r: number; g: number; b: number }) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        const r = this.r;
        // Drawing classic 5-lobed serrated maple leaf path:
        ctx.beginPath();
        // Central top tip
        ctx.moveTo(0, -r);
        // Right central lobe notches
        ctx.lineTo(r * 0.22, -r * 0.65);
        ctx.lineTo(r * 0.35, -r * 0.75);
        ctx.lineTo(r * 0.3, -r * 0.45);
        // Right upper lobe
        ctx.lineTo(r * 0.85, -r * 0.35);
        ctx.lineTo(r * 0.65, -r * 0.1);
        ctx.lineTo(r * 0.9, 0.1 * r);
        ctx.lineTo(r * 0.55, 0.25 * r);
        // Right lower lobe
        ctx.lineTo(r * 0.65, 0.55 * r);
        ctx.lineTo(r * 0.35, 0.5 * r);
        ctx.lineTo(r * 0.2, 0.65 * r);
        // Base notch
        ctx.lineTo(r * 0.1, 0.4 * r);
        ctx.lineTo(0, 0.45 * r);
        // Left lower lobe
        ctx.lineTo(-r * 0.1, 0.4 * r);
        ctx.lineTo(-r * 0.2, 0.65 * r);
        ctx.lineTo(-r * 0.35, 0.5 * r);
        ctx.lineTo(-r * 0.65, 0.55 * r);
        // Left upper lobe
        ctx.lineTo(-r * 0.55, 0.25 * r);
        ctx.lineTo(-r * 0.9, 0.1 * r);
        ctx.lineTo(-r * 0.65, -r * 0.1);
        ctx.lineTo(-r * 0.85, -r * 0.35);
        // Left central lobe notches
        ctx.lineTo(-r * 0.3, -r * 0.45);
        ctx.lineTo(-r * 0.35, -r * 0.75);
        ctx.lineTo(-r * 0.22, -r * 0.65);
        ctx.closePath();

        if (rgb) {
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.opacity + (isDarkTheme ? 0.25 : 0.4)})`;
        } else if (isDarkTheme) {
          ctx.fillStyle = `rgba(239, 68, 68, ${this.opacity})`; // Soft maple red on dark
        } else {
          ctx.fillStyle = `rgba(185, 28, 28, ${this.opacity + 0.12})`; // Soft crimson maple on light
        }
        ctx.fill();

        // Main leaf veins
        ctx.beginPath();
        if (rgb) {
          ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.opacity * 0.7})`;
        } else {
          ctx.strokeStyle = isDarkTheme 
            ? `rgba(254, 202, 202, ${this.opacity * 0.5})` 
            : `rgba(69, 10, 10, ${this.opacity * 0.6})`;
        }
        ctx.lineWidth = 0.8;
        // Main stem
        ctx.moveTo(0, 0.45 * r);
        ctx.lineTo(0, r * 1.15);
        // Central vein
        ctx.moveTo(0, 0.45 * r);
        ctx.lineTo(0, -r * 0.8);
        // Side veins to main lobes
        ctx.moveTo(0, 0.2 * r);
        ctx.lineTo(r * 0.65, -r * 0.25);
        ctx.moveTo(0, 0.2 * r);
        ctx.lineTo(-r * 0.65, -r * 0.25);
        ctx.moveTo(0, 0.3 * r);
        ctx.lineTo(r * 0.45, 0.45 * r);
        ctx.moveTo(0, 0.3 * r);
        ctx.lineTo(-r * 0.45, 0.45 * r);
        ctx.stroke();

        ctx.restore();
      }
    }

    class GinkgoParticle {
      x: number = Math.random() * width;
      y: number = Math.random() * height - 30;
      r: number = 8 + Math.random() * 6;
      angle: number = Math.random() * Math.PI * 2;
      rotationSpeed: number = (Math.random() - 0.5) * 0.01;
      vy: number = 0.22 + Math.random() * 0.32; // Rơi rất chậm
      vx: number = -0.25 + Math.random() * 0.25;
      opacity: number = 0.18 + Math.random() * 0.22; // Mờ dịu mắt hơn
      swing: number = Math.random() * 100;

      update() {
        this.y += this.vy;
        this.x += this.vx + Math.sin((this.y + this.swing) / 45) * 0.6;
        this.angle += this.rotationSpeed;
        if (this.y > height + 25) {
          this.y = -25;
          this.x = Math.random() * width;
        }
      }

      draw(c?: CanvasRenderingContext2D, rgb?: { r: number; g: number; b: number }) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        const r = this.r;

        // Fan-shaped ginkgo leaf path
        ctx.beginPath();
        ctx.moveTo(0, r * 0.3);
        ctx.bezierCurveTo(-r * 0.5, r * 0.1, -r * 1.2, -r * 0.4, -r * 1.15, -r * 0.75);
        ctx.bezierCurveTo(-r * 0.6, -r * 1.1, -r * 0.2, -r * 0.85, 0, -r * 0.72); // Top middle notch
        ctx.bezierCurveTo(r * 0.2, -r * 0.85, r * 0.6, -r * 1.1, r * 1.15, -r * 0.75);
        ctx.bezierCurveTo(r * 1.2, -r * 0.4, r * 0.5, r * 0.1, 0, r * 0.3);
        ctx.closePath();

        if (rgb) {
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.opacity + (isDarkTheme ? 0.25 : 0.4)})`;
        } else if (isDarkTheme) {
          ctx.fillStyle = `rgba(250, 204, 21, ${this.opacity})`; // Soft golden ginkgo on dark
        } else {
          ctx.fillStyle = `rgba(217, 119, 6, ${this.opacity + 0.12})`; // Soft amber ginkgo on light
        }
        ctx.fill();

        // Radiating fan veins from base
        ctx.beginPath();
        if (rgb) {
          ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.opacity * 0.7})`;
        } else {
          ctx.strokeStyle = isDarkTheme 
            ? `rgba(254, 240, 138, ${this.opacity * 0.5})` 
            : `rgba(120, 53, 15, ${this.opacity * 0.6})`;
        }
        ctx.lineWidth = 0.7;

        ctx.moveTo(0, r * 0.3);
        ctx.lineTo(-r * 0.8, -r * 0.6);
        ctx.moveTo(0, r * 0.3);
        ctx.lineTo(-r * 0.4, -r * 0.7);
        ctx.moveTo(0, r * 0.3);
        ctx.lineTo(0, -r * 0.7);
        ctx.moveTo(0, r * 0.3);
        ctx.lineTo(r * 0.4, -r * 0.7);
        ctx.moveTo(0, r * 0.3);
        ctx.lineTo(r * 0.8, -r * 0.6);

        // Slender stem
        ctx.moveTo(0, r * 0.3);
        ctx.lineTo(0, r * 1.25);
        ctx.stroke();

        ctx.restore();
      }
    }

    class CherryBlossomParticle {
      x: number = 0;
      y: number = 0;
      r: number = 0;
      angle: number = 0;
      rotationSpeed: number = 0;
      vy: number = 0;
      vx: number = 0;
      opacity: number = 0;
      swayPhase: number = 0;
      swaySpeed: number = 0;
      swayAmp: number = 0;
      flipAngle: number = 0;
      flipSpeed: number = 0;

      constructor() {
        this.reset(true);
      }

      reset(isInitial = false) {
        this.x = Math.random() * width;
        // Rải rác độ cao ban đầu; khi reset thì xuất phát rải rác rất sâu phía trên màn hình để tuyệt đối không bị dồn hàng
        this.y = isInitial ? Math.random() * height : -30 - Math.random() * (height * 0.7);
        this.r = 4.5 + Math.random() * 3.5;
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.015;
        this.vy = 0.18 + Math.random() * 0.22; // Rơi rất chậm và thong thả (0.18 - 0.40 px/frame)
        this.vx = (Math.random() - 0.5) * 0.2; // Trôi dạt tự nhiên
        this.swayPhase = Math.random() * Math.PI * 2; // Nhịp lắc riêng rẽ cho từng cánh
        this.swaySpeed = 0.006 + Math.random() * 0.012;
        this.swayAmp = 0.3 + Math.random() * 0.5;
        this.flipAngle = Math.random() * Math.PI * 2;
        this.flipSpeed = 0.008 + Math.random() * 0.014;
        this.opacity = 0.45 + Math.random() * 0.4;
      }

      update() {
        this.y += this.vy;
        this.swayPhase += this.swaySpeed;
        this.flipAngle += this.flipSpeed;
        this.x += this.vx + Math.sin(this.swayPhase) * this.swayAmp;
        this.angle += this.rotationSpeed;

        if (this.y > height + 30) {
          this.reset(false);
        }
      }

      draw(c?: CanvasRenderingContext2D, rgb?: { r: number; g: number; b: number }) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Hiệu ứng lật cánh 3D nhẹ nhàng chao lượn
        const flip = Math.cos(this.flipAngle);
        ctx.scale(flip, 1);

        ctx.beginPath();
        ctx.moveTo(0, -this.r);
        ctx.bezierCurveTo(-this.r * 1.2, -this.r * 0.4, -this.r * 0.7, this.r * 0.7, 0, this.r);
        ctx.bezierCurveTo(this.r * 0.7, this.r * 0.7, this.r * 1.2, -this.r * 0.4, 0, -this.r);

        if (rgb) {
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.opacity + (isDarkTheme ? 0.25 : 0.4)})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        } else if (isDarkTheme) {
          ctx.fillStyle = `rgba(244, 143, 177, ${this.opacity})`;
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(236, 72, 153, ${this.opacity + 0.15})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(190, 24, 93, 0.35)`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    class FireflyParticle {
      x: number = Math.random() * width;
      y: number = Math.random() * height;
      r: number = 0.8 + Math.random() * 1.2;
      
      angle: number = Math.random() * Math.PI * 2;
      baseSpeed: number = 0.08 + Math.random() * 0.12;
      
      timer: number = Math.floor(Math.random() * 300);
      flashDuration: number = 60 + Math.floor(Math.random() * 40);
      darkDuration: number = 120 + Math.floor(Math.random() * 180);
      alpha: number = 0;

      update() {
        this.angle += (Math.random() - 0.5) * 0.18;
        const speedSurge = 1.0 + this.alpha * 1.8;
        const currentSpeed = this.baseSpeed * speedSurge;
        
        this.x += Math.cos(this.angle) * currentSpeed;
        this.y += Math.sin(this.angle) * currentSpeed - 0.03 - (this.alpha * 0.15);

        this.timer++;
        const cycleLength = this.flashDuration + this.darkDuration;
        const currentCycleTime = this.timer % cycleLength;

        if (currentCycleTime < this.flashDuration) {
          const progress = currentCycleTime / this.flashDuration;
          const attackPhase = 0.22;
          
          if (progress < attackPhase) {
            this.alpha = Math.sin((progress / attackPhase) * Math.PI / 2);
          } else {
            const decayProgress = (progress - attackPhase) / (1 - attackPhase);
            this.alpha = Math.pow(1 - decayProgress, 2.2); 
          }
        } else {
          this.alpha = 0;
        }

        if (this.x < -30) this.x = width + 20;
        if (this.x > width + 30) this.x = -20;
        if (this.y < -30) this.y = height + 20;
        if (this.y > height + 30) {
          this.y = -20;
          this.x = Math.random() * width;
        }
      }

      draw(c?: CanvasRenderingContext2D, rgb?: { r: number; g: number; b: number }) {
        if (this.alpha <= 0.01) return;

        ctx.save();
        
        if (isDarkTheme) {
          ctx.globalCompositeOperation = 'screen';
        }

        const pulseAlpha = this.alpha;
        const glowRadius = this.r * (3.5 + pulseAlpha * 7.0);

        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRadius);
        
        if (rgb) {
          grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${pulseAlpha * 0.95})`);
          grad.addColorStop(0.3, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${pulseAlpha * 0.5})`);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else if (isDarkTheme) {
          grad.addColorStop(0, `rgba(254, 240, 138, ${pulseAlpha * 0.95})`);
          grad.addColorStop(0.2, `rgba(245, 158, 11, ${pulseAlpha * 0.65})`);
          grad.addColorStop(0.5, `rgba(217, 119, 6, ${pulseAlpha * 0.2})`);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          grad.addColorStop(0, `rgba(217, 119, 6, ${pulseAlpha * 0.9})`);
          grad.addColorStop(0.3, `rgba(180, 83, 9, ${pulseAlpha * 0.5})`);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }

        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        if (rgb) {
          ctx.fillStyle = `rgba(${Math.min(255, rgb.r + 50)}, ${Math.min(255, rgb.g + 50)}, ${Math.min(255, rgb.b + 50)}, ${pulseAlpha * 0.95})`;
        } else if (isDarkTheme) {
          ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha * 0.95})`;
        } else {
          ctx.fillStyle = `rgba(120, 53, 15, ${pulseAlpha * 0.9})`; // Dark amber core on light
        }
        ctx.arc(this.x, this.y, this.r * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    class SoapBubbleParticle {
      x: number = Math.random() * width;
      y: number = height + 20 + Math.random() * 100;
      r: number = 9 + Math.random() * 15;
      vx: number = (Math.random() - 0.5) * 0.3;
      vy: number = -(0.5 + Math.random() * 0.7);
      opacity: number = 0.4 + Math.random() * 0.35;
      wobbleSpeed: number = 0.01 + Math.random() * 0.02;
      wobble: number = Math.random() * Math.PI * 2;
      hueOffset: number = Math.random() * 360;

      update() {
        this.y += this.vy;
        this.wobble += this.wobbleSpeed;
        this.x += this.vx + Math.sin(this.wobble) * 0.25;

        if (this.y < -this.r * 2 || this.x < -this.r * 2 || this.x > width + this.r * 2) {
          this.y = height + 20 + Math.random() * 80;
          this.x = Math.random() * width;
          this.r = 9 + Math.random() * 15;
          this.vy = -(0.5 + Math.random() * 0.7);
        }
      }

      draw(c?: CanvasRenderingContext2D, rgb?: { r: number; g: number; b: number }) {
        ctx.save();
        ctx.globalAlpha = this.opacity;

        const bubbleGrad = ctx.createRadialGradient(
          this.x - this.r * 0.15, 
          this.y - this.r * 0.15, 
          this.r * 0.5, 
          this.x, 
          this.y, 
          this.r
        );
        
        if (rgb) {
          bubbleGrad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`);
          bubbleGrad.addColorStop(0.7, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`);
          bubbleGrad.addColorStop(0.9, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.45)`);
          bubbleGrad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.65)`);
        } else {
          const hue1 = (this.hueOffset + this.y * 0.08) % 360;
          const hue2 = (hue1 + 120) % 360;
          const hue3 = (hue1 + 240) % 360;

          bubbleGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
          bubbleGrad.addColorStop(0.7, `hsla(${hue1}, 80%, 70%, 0.2)`);
          bubbleGrad.addColorStop(0.9, `hsla(${hue2}, 85%, 65%, 0.4)`);
          bubbleGrad.addColorStop(1, `hsla(${hue3}, 90%, 60%, 0.65)`);
        }

        ctx.beginPath();
        ctx.fillStyle = bubbleGrad;
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        if (rgb) {
          ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`;
        } else {
          const hue1 = (this.hueOffset + this.y * 0.08) % 360;
          ctx.strokeStyle = isDarkTheme 
            ? `hsla(${hue1}, 80%, 70%, 0.6)` 
            : `rgba(30, 27, 75, 0.5)`;
        }
        ctx.lineWidth = 1.0;
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.arc(this.x - this.r * 0.35, this.y - this.r * 0.35, this.r * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    class FruitParticle {
      x: number = 0; y: number = 0; size: number = 0; vy: number = 0; vx: number = 0; rot: number = 0; vRot: number = 0;
      type: 'kiwi' | 'grapes' | 'banana' | 'blueberry' | 'green_apple' | 'watermelon' | 'orange' | 'strawberry' | 'peach' | 'lemon' | 'cherry' = 'kiwi';
      opacity: number = 1; swayPhase: number = 0; swaySpeed: number = 0; swayAmp: number = 0;

      constructor() { this.reset(true); }

      reset(isInitial = false) {
        this.x = Math.random() * width;
        this.y = isInitial ? Math.random() * height : -50 - Math.random() * (height * 0.6);
        this.size = 20 + Math.random() * 10;
        this.vy = 0.2 + Math.random() * 0.25;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.rot = Math.random() * Math.PI * 2;
        this.vRot = (Math.random() - 0.5) * 0.01;
        this.swayPhase = Math.random() * Math.PI * 2;
        this.swaySpeed = 0.008 + Math.random() * 0.012;
        this.swayAmp = 0.3 + Math.random() * 0.4;
        this.opacity = 0.88 + Math.random() * 0.12;
        const types: ('kiwi' | 'grapes' | 'banana' | 'blueberry' | 'green_apple' | 'watermelon' | 'orange' | 'strawberry' | 'peach' | 'lemon' | 'cherry')[] = [
          'kiwi', 'grapes', 'banana', 'blueberry', 'green_apple', 'watermelon', 'orange', 'strawberry', 'peach', 'lemon', 'cherry'
        ];
        this.type = types[Math.floor(Math.random() * types.length)];
      }

      update() {
        this.y += this.vy;
        this.swayPhase += this.swaySpeed;
        this.x += this.vx + Math.sin(this.swayPhase) * this.swayAmp;
        this.rot += this.vRot;
        if (this.y > height + 45) this.reset(false);
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.globalAlpha = this.opacity;
        const s = this.size;

        if (this.type === 'kiwi') {
          // Lát Kiwi
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.48, 0, Math.PI * 2);
          ctx.fillStyle = '#78350f';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.42, 0, Math.PI * 2);
          ctx.fillStyle = '#22c55e';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.15, 0, Math.PI * 2);
          ctx.fillStyle = '#fef9c3';
          ctx.fill();
          ctx.fillStyle = '#18181b';
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            ctx.beginPath();
            ctx.arc(Math.cos(a) * s * 0.26, Math.sin(a) * s * 0.26, s * 0.035, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (this.type === 'grapes') {
          // Chùm Nho
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.2);
          ctx.lineTo(0, -s * 0.5);
          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = s * 0.08;
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(s * 0.12, -s * 0.4, s * 0.14, s * 0.08, -Math.PI / 4, 0, Math.PI * 2);
          ctx.fillStyle = '#22c55e';
          ctx.fill();

          const grapeCoords = [
            [-s * 0.18, -s * 0.18], [0, -s * 0.22], [s * 0.18, -s * 0.18],
            [-s * 0.25, 0], [0, -s * 0.02], [s * 0.25, 0],
            [-s * 0.14, s * 0.18], [s * 0.14, s * 0.18],
            [0, s * 0.35]
          ];
          grapeCoords.forEach(([gx, gy]) => {
            ctx.beginPath();
            ctx.arc(gx, gy, s * 0.14, 0, Math.PI * 2);
            ctx.fillStyle = '#8b5cf6';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(gx - s * 0.04, gy - s * 0.04, s * 0.04, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fill();
          });
        } else if (this.type === 'banana') {
          // Trái Chuối (Banana) - Thân uốn cong mềm mại, có sống, cuống xanh & rốn nâu
          ctx.save();
          ctx.rotate(-Math.PI / 8);

          ctx.beginPath();
          ctx.moveTo(-s * 0.42, -s * 0.15);
          ctx.bezierCurveTo(-s * 0.1, s * 0.42, s * 0.32, s * 0.28, s * 0.44, -s * 0.12);
          ctx.bezierCurveTo(s * 0.22, s * 0.14, -s * 0.05, 0.2, -s * 0.36, -s * 0.1);
          ctx.closePath();
          ctx.fillStyle = '#fde047';
          ctx.fill();

          // Sống lưng bóng sáng
          ctx.beginPath();
          ctx.moveTo(-s * 0.36, -s * 0.1);
          ctx.bezierCurveTo(-s * 0.08, s * 0.25, s * 0.25, s * 0.15, s * 0.42, -s * 0.1);
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = s * 0.06;
          ctx.stroke();

          // Đường sống tối tạo khối 3D
          ctx.beginPath();
          ctx.moveTo(-s * 0.38, -s * 0.12);
          ctx.bezierCurveTo(-s * 0.08, s * 0.35, s * 0.28, s * 0.22, s * 0.43, -s * 0.11);
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = s * 0.035;
          ctx.stroke();

          // Cuống chuối xanh
          ctx.beginPath();
          ctx.moveTo(-s * 0.36, -s * 0.1);
          ctx.lineTo(-s * 0.45, -s * 0.22);
          ctx.strokeStyle = '#65a30d';
          ctx.lineWidth = s * 0.08;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Rốn chuối nâu đen
          ctx.beginPath();
          ctx.arc(s * 0.44, -s * 0.12, s * 0.04, 0, Math.PI * 2);
          ctx.fillStyle = '#451a03';
          ctx.fill();

          ctx.restore();
        } else if (this.type === 'blueberry') {
          // Trái Việt Quất
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.44, 0, Math.PI * 2);
          ctx.fillStyle = '#1d4ed8';
          ctx.fill();

          const grad = ctx.createRadialGradient(-s * 0.1, -s * 0.1, s * 0.05, 0, 0, s * 0.44);
          grad.addColorStop(0, 'rgba(147, 197, 253, 0.6)');
          grad.addColorStop(1, 'rgba(29, 78, 216, 0)');
          ctx.fillStyle = grad;
          ctx.fill();

          ctx.fillStyle = '#1e3a8a';
          for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * s * 0.1, -s * 0.2 + Math.sin(angle) * s * 0.1, s * 0.05, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (this.type === 'green_apple') {
          // Trái Táo Xanh (Green Apple) - Thân quả tròn mọng đầy đặn, bóng sáng 3D, cuống nâu & lá xanh
          // 1. Quả táo tròn đầy mọng nước
          ctx.beginPath();
          ctx.arc(-s * 0.09, 0, s * 0.34, 0, Math.PI * 2);
          ctx.arc(s * 0.09, 0, s * 0.34, 0, Math.PI * 2);
          ctx.fillStyle = '#4ade80';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(0, s * 0.06, s * 0.36, 0, Math.PI * 2);
          ctx.fillStyle = '#22c55e';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(0, -s * 0.04, s * 0.34, 0, Math.PI * 2);
          ctx.fillStyle = '#4ade80';
          ctx.fill();

          // 2. Độ bóng sáng mọng 3D
          ctx.beginPath();
          ctx.ellipse(-s * 0.12, -s * 0.12, s * 0.12, s * 0.06, -Math.PI / 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.fill();

          // 3. Cuống táo uốn cong màu nâu
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.25);
          ctx.quadraticCurveTo(-s * 0.08, -s * 0.38, -s * 0.04, -s * 0.48);
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = s * 0.06;
          ctx.lineCap = 'round';
          ctx.stroke();

          // 4. Lá táo xanh đậm
          ctx.beginPath();
          ctx.ellipse(-s * 0.12, -s * 0.42, s * 0.14, s * 0.07, -Math.PI / 4, 0, Math.PI * 2);
          ctx.fillStyle = '#15803d';
          ctx.fill();
        } else if (this.type === 'watermelon') {
          // Miếng Dưa Hấu
          ctx.beginPath();
          ctx.moveTo(-s * 0.48, -s * 0.2);
          ctx.quadraticCurveTo(0, s * 0.52, s * 0.48, -s * 0.2);
          ctx.lineTo(s * 0.42, -s * 0.2);
          ctx.quadraticCurveTo(0, s * 0.44, -s * 0.42, -s * 0.2);
          ctx.closePath();
          ctx.fillStyle = '#15803d';
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(-s * 0.42, -s * 0.2);
          ctx.quadraticCurveTo(0, s * 0.44, s * 0.42, -s * 0.2);
          ctx.lineTo(s * 0.38, -s * 0.2);
          ctx.quadraticCurveTo(0, s * 0.38, -s * 0.38, -s * 0.2);
          ctx.closePath();
          ctx.fillStyle = '#dcfce7';
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(0, -s * 0.42);
          ctx.lineTo(s * 0.38, -s * 0.2);
          ctx.quadraticCurveTo(0, s * 0.38, -s * 0.38, -s * 0.2);
          ctx.closePath();
          ctx.fillStyle = '#ef4444';
          ctx.fill();

          ctx.fillStyle = '#18181b';
          [[-s * 0.12, -s * 0.05], [0, -s * 0.18], [s * 0.12, -s * 0.05], [0, s * 0.1]].forEach(([wx, wy]) => {
            ctx.beginPath();
            ctx.ellipse(wx, wy, s * 0.025, s * 0.04, 0, 0, Math.PI * 2);
            ctx.fill();
          });
        } else if (this.type === 'peach') {
          // Trái Đào
          ctx.beginPath();
          ctx.arc(-s * 0.1, 0, s * 0.38, 0, Math.PI * 2);
          ctx.arc(s * 0.1, 0, s * 0.38, 0, Math.PI * 2);
          ctx.fillStyle = '#fb7185';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(0, s * 0.05, s * 0.34, 0, Math.PI * 2);
          ctx.fillStyle = '#fde047';
          ctx.globalAlpha = this.opacity * 0.4;
          ctx.fill();
          ctx.globalAlpha = this.opacity;

          ctx.beginPath();
          ctx.moveTo(0, -s * 0.38);
          ctx.quadraticCurveTo(-s * 0.08, 0, 0, s * 0.38);
          ctx.strokeStyle = '#e11d48';
          ctx.lineWidth = s * 0.04;
          ctx.stroke();

          ctx.beginPath();
          ctx.ellipse(s * 0.1, -s * 0.38, s * 0.14, s * 0.06, -Math.PI / 6, 0, Math.PI * 2);
          ctx.fillStyle = '#22c55e';
          ctx.fill();
        } else if (this.type === 'lemon') {
          // Trái Chanh Vàng (Lemon) - Thân bầu thoi, núm chanh 2 đầu rõ ràng & lá tươi
          ctx.save();
          ctx.rotate(-Math.PI / 8);

          // Thân chanh hình thoi bầu tròn 2 đầu núm
          ctx.beginPath();
          ctx.moveTo(-s * 0.48, 0);
          ctx.quadraticCurveTo(-s * 0.54, -s * 0.08, -s * 0.42, -s * 0.18);
          ctx.bezierCurveTo(-s * 0.22, -s * 0.44, s * 0.22, -s * 0.44, s * 0.42, -s * 0.18);
          ctx.quadraticCurveTo(s * 0.54, -s * 0.08, s * 0.48, 0);
          ctx.quadraticCurveTo(s * 0.54, s * 0.08, s * 0.42, s * 0.18);
          ctx.bezierCurveTo(s * 0.22, s * 0.44, -s * 0.22, s * 0.44, -s * 0.42, s * 0.18);
          ctx.quadraticCurveTo(-s * 0.54, s * 0.08, -s * 0.48, 0);
          ctx.closePath();
          ctx.fillStyle = '#fde047';
          ctx.fill();

          // Hai núm chanh 2 đầu
          ctx.beginPath();
          ctx.arc(-s * 0.46, 0, s * 0.05, 0, Math.PI * 2);
          ctx.arc(s * 0.46, 0, s * 0.05, 0, Math.PI * 2);
          ctx.fillStyle = '#eab308';
          ctx.fill();

          // Bóng mọng 3D tỏa phản quang
          const lemonShine = ctx.createRadialGradient(-s * 0.1, -s * 0.12, s * 0.04, 0, 0, s * 0.42);
          lemonShine.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
          lemonShine.addColorStop(0.7, 'rgba(253, 224, 71, 0)');
          ctx.fillStyle = lemonShine;
          ctx.fill();

          // Lá xanh nhỏ xinh ở núm chanh
          ctx.beginPath();
          ctx.ellipse(-s * 0.42, -s * 0.12, s * 0.13, s * 0.06, -Math.PI / 3, 0, Math.PI * 2);
          ctx.fillStyle = '#65a30d';
          ctx.fill();

          ctx.restore();
        } else if (this.type === 'cherry') {
          // Cặp Cherry
          ctx.beginPath();
          ctx.arc(-s * 0.22, s * 0.12, s * 0.22, 0, Math.PI * 2);
          ctx.fillStyle = '#dc2626';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(-s * 0.26, s * 0.06, s * 0.06, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(s * 0.2, s * 0.18, s * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = '#b91c1c';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(s * 0.16, s * 0.12, s * 0.05, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(-s * 0.22, -s * 0.08);
          ctx.quadraticCurveTo(0, -s * 0.32, 0, -s * 0.48);
          ctx.moveTo(s * 0.2, -s * 0.02);
          ctx.quadraticCurveTo(0, -s * 0.32, 0, -s * 0.48);
          ctx.strokeStyle = '#65a30d';
          ctx.lineWidth = s * 0.05;
          ctx.stroke();

          ctx.beginPath();
          ctx.ellipse(s * 0.08, -s * 0.44, s * 0.12, s * 0.06, -Math.PI / 4, 0, Math.PI * 2);
          ctx.fillStyle = '#84cc16';
          ctx.fill();
        } else if (this.type === 'orange') {
          // Lát Cam Tươi
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = '#f97316';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffedd5';
          ctx.fill();

          const segments = 8;
          for (let i = 0; i < segments; i++) {
            const startAngle = (i * Math.PI * 2) / segments + 0.08;
            const endAngle = ((i + 1) * Math.PI * 2) / segments - 0.08;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, s * 0.36, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = '#fb923c';
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(0, 0, s * 0.06, 0, Math.PI * 2);
          ctx.fillStyle = '#ffedd5';
          ctx.fill();
        } else {
          // Trái Dâu Tây
          ctx.beginPath();
          ctx.moveTo(0, s * 0.48);
          ctx.bezierCurveTo(-s * 0.52, s * 0.1, -s * 0.42, -s * 0.3, 0, -s * 0.28);
          ctx.bezierCurveTo(s * 0.42, -s * 0.3, s * 0.52, s * 0.1, 0, s * 0.48);
          ctx.closePath();
          ctx.fillStyle = '#ef4444';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(-s * 0.16, 0, s * 0.08, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fill();

          ctx.fillStyle = '#fef08a';
          [
            [-s * 0.15, -s * 0.1], [0, -s * 0.15], [s * 0.15, -s * 0.1],
            [-s * 0.2, 0.08], [0, 0.05], [s * 0.2, 0.08],
            [-s * 0.1, 0.25], [s * 0.1, 0.25]
          ].forEach(([sx, sy]) => {
            ctx.beginPath();
            ctx.ellipse(sx, sy, s * 0.02, s * 0.03, 0, 0, Math.PI * 2);
            ctx.fill();
          });

          ctx.fillStyle = '#16a34a';
          for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            ctx.beginPath();
            ctx.ellipse(Math.cos(angle) * s * 0.15, -s * 0.28 + Math.sin(angle) * s * 0.08, s * 0.14, s * 0.06, angle, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }
    }

    class OceanParticle {
      x: number = 0; y: number = 0; size: number = 0; vy: number = 0; vx: number = 0; phase: number = 0; opacity: number = 1;
      type: 'caustic' | 'bubble' = 'caustic';

      constructor() { this.reset(true); }

      reset(isInitial = false) {
        this.x = Math.random() * width;
        this.y = isInitial ? Math.random() * height : height + 30 + Math.random() * (height * 0.3);
        this.type = Math.random() < 0.4 ? 'caustic' : 'bubble';
        this.size = this.type === 'caustic' ? 35 + Math.random() * 45 : 6 + Math.random() * 16;
        this.vy = -(0.25 + Math.random() * 0.35);
        this.vx = (Math.random() - 0.5) * 0.25;
        this.phase = Math.random() * Math.PI * 2;
        this.opacity = this.type === 'caustic' ? 0.25 + Math.random() * 0.25 : 0.4 + Math.random() * 0.4;
      }

      update() {
        this.y += this.vy;
        this.phase += 0.02;
        this.x += this.vx + Math.sin(this.phase) * 0.5;
        if (this.y < -60) this.reset(false);
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = this.opacity;
        const s = this.size;

        if (this.type === 'caustic') {
          const grad = ctx.createRadialGradient(0, 0, s * 0.1, 0, 0, s);
          grad.addColorStop(0, 'rgba(224, 242, 254, 0.7)');
          grad.addColorStop(0.35, 'rgba(125, 211, 252, 0.35)');
          grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.15)');
          grad.addColorStop(1, 'rgba(14, 165, 233, 0)');

          ctx.beginPath();
          ctx.ellipse(0, 0, s * (1 + Math.sin(this.phase) * 0.15), s * 0.7, this.phase * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        } else {
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
          grad.addColorStop(0, 'rgba(224, 242, 254, 0.6)');
          grad.addColorStop(0.7, 'rgba(186, 230, 253, 0.25)');
          grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

          ctx.beginPath();
          ctx.arc(0, 0, s, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(0, 0, s, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(186, 230, 253, 0.6)';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(-s * 0.35, -s * 0.35, s * 0.22, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.fill();
        }

        ctx.restore();
      }
    }

    class ButterflyParticle {
      x: number = 0; y: number = 0; scale: number = 0; vx: number = 0; vy: number = 0; wingAngle: number = 0; wingSpeed: number = 0;
      opacity: number = 1; swayPhase: number = 0; tiltAngle: number = 0;

      constructor() { this.reset(true); }

      reset(isInitial = false) {
        this.x = Math.random() * width;
        this.y = isInitial ? Math.random() * height : height + 30 + Math.random() * (height * 0.3);
        this.scale = 5.5 + Math.random() * 3;
        this.vy = -(0.25 + Math.random() * 0.3);
        this.vx = (Math.random() - 0.5) * 0.35;
        this.wingAngle = Math.random() * Math.PI * 2;
        this.wingSpeed = 0.045 + Math.random() * 0.025;
        this.swayPhase = Math.random() * Math.PI * 2;
        this.tiltAngle = (Math.random() - 0.5) * 0.4;
        this.opacity = 0.85 + Math.random() * 0.15;
      }

      update() {
        this.y += this.vy;
        this.swayPhase += 0.025;
        this.x += this.vx + Math.sin(this.swayPhase) * 0.7;
        this.wingAngle += this.wingSpeed;
        if (this.y < -50) this.reset(false);
      }

      drawWing(s: number) {
        // 1. Quầng sáng thủy tinh phát sáng mềm xung quanh cánh
        ctx.beginPath();
        ctx.ellipse(-s * 0.75, -s * 0.2, s * 1.1, s * 0.9, -Math.PI / 6, 0, Math.PI * 2);
        const glowGrad = ctx.createRadialGradient(-s * 0.75, -s * 0.2, s * 0.2, -s * 0.75, -s * 0.2, s * 1.3);
        glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
        glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fill();

        // 2. Cánh trên (Forewing) - Cánh thủy tinh xếp nếp tinh xảo có gợn sóng mượt
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-s * 0.45, -s * 0.85, -s * 1.25, -s * 1.45, -s * 1.55, -s * 0.85);
        // Gợn sóng lượn viền cánh ngoài
        ctx.bezierCurveTo(-s * 1.6, -s * 0.6, -s * 1.45, -s * 0.4, -s * 1.5, -s * 0.22);
        ctx.bezierCurveTo(-s * 1.4, -s * 0.05, -s * 1.1, s * 0.2, -s * 0.2, s * 0.08);
        ctx.closePath();

        const gradFore = ctx.createRadialGradient(-s * 0.2, -s * 0.1, s * 0.05, -s * 0.8, -s * 0.6, s * 1.3);
        gradFore.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        gradFore.addColorStop(0.35, 'rgba(255, 255, 255, 0.75)');
        gradFore.addColorStop(0.75, 'rgba(240, 249, 255, 0.42)');
        gradFore.addColorStop(1, 'rgba(255, 255, 255, 0.18)');
        ctx.fillStyle = gradFore;
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 1.3;
        ctx.stroke();

        // Gân cánh trên tinh xảo (Delicate forewing veins)
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 0.8;

        // Gân chính 1
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-s * 0.6, -s * 0.7, -s * 1.35, -s * 1.1);
        ctx.stroke();

        // Gân chính 2 & nhánh phụ
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-s * 0.7, -s * 0.4, -s * 1.42, -s * 0.55);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-s * 0.45, -s * 0.3);
        ctx.quadraticCurveTo(-s * 0.9, -s * 0.2, -s * 1.3, -s * 0.18);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-s * 0.4, -s * 0.5);
        ctx.quadraticCurveTo(-s * 0.8, -s * 0.85, -s * 1.2, -s * 0.82);
        ctx.stroke();

        // Lớp nếp nhung thủy tinh bên trong
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-s * 0.35, -s * 0.7, -s * 0.95, -s * 0.9, -s * 0.88, -s * 0.42);
        ctx.bezierCurveTo(-s * 0.8, -s * 0.1, -s * 0.5, s * 0.08, -s * 0.1, 0.04);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
        ctx.fill();
        ctx.restore();

        // 3. Cánh dưới (Hindwing) - Dáng bo tròn có viền nếp gợn sóng & đuôi đuôi cá mảnh
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-s * 0.85, s * 0.15, -s * 1.2, s * 0.85, -s * 0.8, s * 1.3);
        // Đuôi cánh uốn điệu đà
        ctx.quadraticCurveTo(-s * 0.65, s * 1.5, -s * 0.5, s * 1.25);
        ctx.bezierCurveTo(-s * 0.25, s * 1.3, -s * 0.1, s * 0.6, -s * 0.05, s * 0.1);
        ctx.closePath();

        const gradHind = ctx.createRadialGradient(-s * 0.1, s * 0.2, s * 0.05, -s * 0.5, s * 0.7, s * 1.05);
        gradHind.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
        gradHind.addColorStop(0.45, 'rgba(255, 255, 255, 0.55)');
        gradHind.addColorStop(0.85, 'rgba(240, 249, 255, 0.25)');
        gradHind.addColorStop(1, 'rgba(255, 255, 255, 0.12)');
        ctx.fillStyle = gradHind;
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.lineWidth = 1.1;
        ctx.stroke();

        // Gân cánh dưới (Hindwing veins)
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 0.75;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-s * 0.4, s * 0.5, -s * 0.75, s * 1.15);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-s * 0.55, s * 0.35, -s * 0.95, s * 0.75);
        ctx.stroke();

        ctx.restore();
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.tiltAngle + Math.sin(this.swayPhase) * 0.15);
        ctx.globalAlpha = this.opacity;

        const wScale = Math.abs(Math.sin(this.wingAngle)) * 0.8 + 0.2;
        const s = this.scale;

        // Cánh bên trái
        ctx.save();
        ctx.scale(wScale, 1);
        this.drawWing(s);
        ctx.restore();

        // Cánh bên phải
        ctx.save();
        ctx.scale(-wScale, 1);
        this.drawWing(s);
        ctx.restore();

        // Thân bướm trắng phát sáng kiêu sa
        ctx.beginPath();
        ctx.ellipse(0, s * 0.05, s * 0.06, s * 0.42, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fill();

        // Đầu bướm
        ctx.beginPath();
        ctx.arc(0, -s * 0.42, s * 0.07, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.fill();

        // Râu bướm uốn cong mảnh mai
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.45);
        ctx.quadraticCurveTo(-s * 0.2, -s * 0.85, -s * 0.35, -s * 0.9);
        ctx.moveTo(0, -s * 0.45);
        ctx.quadraticCurveTo(s * 0.2, -s * 0.85, s * 0.35, -s * 0.9);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // Chấm râu tròn nhỏ
        ctx.beginPath();
        ctx.arc(-s * 0.35, -s * 0.9, s * 0.035, 0, Math.PI * 2);
        ctx.arc(s * 0.35, -s * 0.9, s * 0.035, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.fill();

        // Bụi phấn sáng lấp lánh (Sparkle Fairy Dust)
        const sparkles = 4;
        for (let k = 0; k < sparkles; k++) {
          const spAngle = this.swayPhase * 2 + k * (Math.PI * 2 / sparkles);
          const spDist = s * (0.8 + Math.sin(spAngle) * 0.4);
          const spX = Math.cos(spAngle) * spDist;
          const spY = Math.sin(spAngle) * spDist + s * 0.2;
          const spAlpha = 0.3 + Math.sin(spAngle * 2) * 0.3;

          ctx.beginPath();
          ctx.arc(spX, spY, s * 0.04, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, spAlpha)})`;
          ctx.fill();
        }

        ctx.restore();
      }
    }

    class FeatherParticle {
      x: number = 0; y: number = 0; length: number = 0; vy: number = 0; vx: number = 0;
      rot: number = 0; vRot: number = 0; swayPhase: number = 0; swaySpeed: number = 0; swayAmp: number = 0;
      rockAngle: number = 0; rockSpeed: number = 0; opacity: number = 1; curve: number = 0; color: string = '#ffffff';

      constructor() { this.reset(true); }

      reset(isInitial = false) {
        this.x = Math.random() * width;
        this.y = isInitial ? Math.random() * height - height * 0.2 : -50 - Math.random() * (height * 0.7);
        this.length = 20 + Math.random() * 10; // Nhỏ nhắn, thanh thoát (20px - 30px)
        this.vy = 0.15 + Math.random() * 0.28; // Tốc độ rơi tản rộng (0.15 - 0.43)
        this.vx = (Math.random() - 0.5) * 0.18;
        this.rot = (Math.random() - 0.5) * 0.8;
        this.vRot = (Math.random() - 0.5) * 0.006;
        this.swayPhase = Math.random() * Math.PI * 2;
        this.swaySpeed = 0.008 + Math.random() * 0.014; // Nhịp lướt riêng cho từng chiếc
        this.swayAmp = 0.4 + Math.random() * 0.6; // Biên độ lắc riêng
        this.rockAngle = Math.random() * Math.PI * 2;
        this.rockSpeed = 0.012 + Math.random() * 0.016;
        this.opacity = 0.5 + Math.random() * 0.4;
        this.curve = (Math.random() - 0.5) * 0.22;
        const colors = ['#ffffff', '#fdf4ff', '#f0f9ff', '#fefce8'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.y += this.vy;
        this.swayPhase += this.swaySpeed;
        this.rockAngle += this.rockSpeed;
        this.x += this.vx + Math.sin(this.swayPhase) * this.swayAmp;
        this.rot += this.vRot + Math.sin(this.swayPhase) * 0.005;
        if (this.y > height + 60) this.reset(false);
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot + Math.sin(this.swayPhase) * 0.15);
        const flipScale = Math.cos(this.rockAngle);
        ctx.scale(flipScale, 1);
        ctx.globalAlpha = this.opacity;

        const len = this.length;
        const halfLen = len / 2;
        const bend = this.curve * len;

        ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 4;

        // 1. Thân lông vũ (Quill / Spine)
        ctx.beginPath();
        ctx.moveTo(0, halfLen + 3);
        ctx.quadraticCurveTo(bend, 0, bend * 0.5, -halfLen);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.9;
        ctx.stroke();

        // 2. Phiến lông tơ mềm mại (Feather Plume)
        const steps = 14;
        ctx.beginPath();
        ctx.moveTo(bend * 0.5, -halfLen); // Đỉnh lông

        // Cạnh trái
        for (let i = steps; i >= 1; i--) {
          const t = i / steps;
          const py = (0.5 - t) * len;
          const px = bend * Math.sin(t * Math.PI);
          const w = Math.sin(Math.pow(t, 0.6) * Math.PI) * (len * 0.18);
          ctx.lineTo(px - w, py);
        }

        // Gốc lông
        ctx.lineTo(0, halfLen);

        // Cạnh phải
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const py = (0.5 - t) * len;
          const px = bend * Math.sin(t * Math.PI);
          const w = Math.sin(Math.pow(t, 0.6) * Math.PI) * (len * 0.16);
          ctx.lineTo(px + w, py);
        }

        ctx.closePath();

        const plumeGrad = ctx.createLinearGradient(0, -halfLen, 0, halfLen);
        plumeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        plumeGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
        plumeGrad.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
        ctx.fillStyle = plumeGrad;
        ctx.fill();

        // 3. Các sợi tơ mảnh (Fine Barb Details)
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 0.55;
        const barbCount = 12;
        for (let i = 2; i < barbCount; i++) {
          const t = i / barbCount;
          const py = (0.5 - t) * len;
          const px = bend * Math.sin(t * Math.PI);
          const w = Math.sin(Math.pow(t, 0.6) * Math.PI) * (len * 0.17);

          // Tơ bên trái
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.quadraticCurveTo(px - w * 0.5, py - 1.5, px - w, py - 3);
          ctx.stroke();

          // Tơ bên phải
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.quadraticCurveTo(px + w * 0.5, py - 1.5, px + w, py - 3);
          ctx.stroke();
        }

        // 4. Lông tơ mềm mịn xoè nhẹ ở gốc (Fluffy Down Base)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 0.5;
        for (let d = 0; d < 5; d++) {
          const dy = halfLen - d * 1.5;
          ctx.beginPath();
          ctx.moveTo(0, dy);
          ctx.lineTo(-3 - d * 0.5, dy + 2);
          ctx.moveTo(0, dy);
          ctx.lineTo(3 + d * 0.5, dy + 2);
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    class LightningParticle {
      strikeTimer: number = 20; // Khởi đầu bằng một phát sét đánh nhanh
      flashAlpha: number = 0;
      boltSegments: { x1: number; y1: number; x2: number; y2: number }[] = [];
      branches: { x1: number; y1: number; x2: number; y2: number }[] = [];
      flickerActive: boolean = false;
      flickerTimer: number = 0;

      constructor() {
        this.reset();
        // Sét đánh cực nhanh ngay khi vừa kích hoạt hiệu ứng
        this.strikeTimer = 10 + Math.random() * 20;
      }

      reset() {
        // Tần suất sét đánh ngẫu nhiên thưa hơn, tự nhiên hơn (từ 3 đến 6 giây)
        this.strikeTimer = 180 + Math.random() * 200;
        this.flashAlpha = 0;
        this.boltSegments = [];
        this.branches = [];
        this.flickerActive = false;
      }

      update() {
        if (this.strikeTimer > 0) {
          this.strikeTimer--;
          if (this.strikeTimer <= 0) {
            this.triggerStrike();
          }
        }

        // Giảm dần độ sáng của luồng chớp nền nhanh hơn
        if (this.flashAlpha > 0) {
          this.flashAlpha -= 0.08;
          if (this.flashAlpha < 0) this.flashAlpha = 0;
        }

        // Quản lý thời gian nhấp nháy (flicker) của tia sét
        if (this.flickerActive) {
          this.flickerTimer--;
          if (this.flickerTimer <= 0) {
            this.flickerActive = false;
            this.boltSegments = [];
            this.branches = [];
            
            // 30% cơ hội đánh bồi thêm phát sét thứ hai liên tiếp (double flash) rất nhanh
            if (Math.random() < 0.3) {
              this.strikeTimer = 4 + Math.random() * 8;
            } else {
              this.reset();
            }
          }
        }
      }

      triggerStrike() {
        // Độ chói chớp sáng nền ngẫu nhiên
        this.flashAlpha = 0.2 + Math.random() * 0.3;
        this.flickerActive = true;
        this.flickerTimer = 3 + Math.floor(Math.random() * 4); // Chớp rất nhanh

        this.boltSegments = [];
        this.branches = [];

        // Điểm bắt đầu của sét ở cạnh trên màn hình
        let startX = Math.random() * width;
        let startY = 0;
        let currentX = startX;
        let currentY = startY;

        // Tăng số lượng phân đoạn để tia sét có đường nét sắc và thật hơn
        const segmentCount = 25 + Math.floor(Math.random() * 15);
        const segmentHeight = height / segmentCount;

        for (let i = 0; i < segmentCount; i++) {
          // Độ lệch ngẫu nhiên trục X hẹp lại để tia sét đi thẳng đứng và thực tế hơn
          let nextX = currentX + (Math.random() - 0.5) * (width * 0.05);
          // Giới hạn trong màn hình
          nextX = Math.max(0, Math.min(width, nextX));
          let nextY = currentY + segmentHeight;

          this.boltSegments.push({ x1: currentX, y1: currentY, x2: nextX, y2: nextY });

          // Ít nhánh phụ hơn, mỏng và thực tế hơn
          if (Math.random() < 0.15) {
            let bX = currentX;
            let bY = currentY;
            const branchLength = 3 + Math.floor(Math.random() * 5);
            for (let j = 0; j < branchLength; j++) {
              let nbX = bX + (Math.random() - 0.5) * (width * 0.04);
              let nbY = bY + segmentHeight * 0.8;
              this.branches.push({ x1: bX, y1: bY, x2: nbX, y2: nbY });
              bX = nbX;
              bY = nbY;
            }
          }

          currentX = nextX;
          currentY = nextY;
        }
      }

      draw() {
        // 1. Chớp sáng nền toàn cảnh
        if (this.flashAlpha > 0) {
          ctx.save();
          // Chớp nền màu xanh tím dịu mờ mờ ảo
          ctx.fillStyle = `rgba(224, 231, 255, ${this.flashAlpha})`;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }

        // 2. Vẽ tia sét với hiệu ứng hào quang phát sáng (glow)
        if (this.flickerActive && this.boltSegments.length > 0 && Math.random() > 0.1) {
          ctx.save();

          // Hào quang xanh/tím phát ra từ sét
          ctx.shadowBlur = 15;
          ctx.shadowColor = 'rgba(129, 140, 248, 0.7)';
          ctx.strokeStyle = '#e0e7ff';
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          // Vẽ luồng sáng lớn phát sáng bên ngoài
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          this.boltSegments.forEach((seg, idx) => {
            if (idx === 0) ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
          });
          ctx.stroke();

          // Vẽ các nhánh phụ phát sáng
          ctx.lineWidth = 0.8;
          this.branches.forEach((seg) => {
            ctx.beginPath();
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
            ctx.stroke();
          });

          // Vẽ lõi sét trắng tinh cực sáng ở giữa đè lên
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          this.boltSegments.forEach((seg, idx) => {
            if (idx === 0) ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
          });
          ctx.stroke();

          ctx.restore();
        }
      }
    }

    class FogParticle {
      x: number = 0;
      y: number = 0;
      size: number = 0;
      vx: number = 0;
      vy: number = 0;
      alpha: number = 1;
      baseAlpha: number = 1;

      constructor() {
        this.reset(true);
      }

      reset(isInitial = false) {
        this.x = Math.random() * width;
        this.y = isInitial ? Math.random() * height : height + 50;
        this.size = 120 + Math.random() * 250;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = -(0.1 + Math.random() * 0.3);
        this.baseAlpha = 0.02 + Math.random() * 0.04;
        this.alpha = this.baseAlpha;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y < -250) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        const colorVal = isDarkTheme ? '220, 225, 235' : '130, 140, 150';
        grad.addColorStop(0, `rgba(${colorVal}, ${this.alpha})`);
        grad.addColorStop(1, `rgba(${colorVal}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class FireSparkParticle {
      x: number = 0;
      y: number = 0;
      size: number = 0;
      aspectRatio: number = 0;
      curvature: number = 0;
      vx: number = 0;
      vy: number = 0;
      baseAlpha: number = 1;
      alpha: number = 1;
      wobble: number = 0;
      wobbleSpeed: number = 0;
      wobbleAmp: number = 0;
      sparkType: 'crescent' | 'streak' | 'dot' = 'crescent';
      angle: number = 0;
      rotationSpeed: number = 0;
      coreColor: string = '';
      glowColor: string = '';
      edgeColor: string = '';
      emberColor: string = '';
      flickerOffset: number = 0;

      constructor() {
        this.reset(true);
      }

      reset(isInitial = false, spawnPos: 'bottom' | 'top' | 'random' = 'bottom') {
        this.x = Math.random() * width;
        if (isInitial || spawnPos === 'random') {
          this.y = Math.random() * height;
        } else if (spawnPos === 'top') {
          this.y = -10 - Math.random() * 40;
        } else {
          this.y = height + 10 + Math.random() * 60;
        }

        const randType = Math.random();
        if (randType < 0.65) {
          this.sparkType = 'crescent';
          this.size = 5 + Math.random() * 8; // Chiều dài mảnh tàn thanh thoát
          this.aspectRatio = 0.08 + Math.random() * 0.05; // Mảnh mai tự nhiên
          this.curvature = (Math.random() < 0.5 ? 1 : -1) * (0.28 + Math.random() * 0.4);
        } else if (randType < 0.85) {
          this.sparkType = 'streak';
          this.size = 3.5 + Math.random() * 6;
          this.aspectRatio = 0.06 + Math.random() * 0.04;
          this.curvature = 0.12 + Math.random() * 0.2;
        } else {
          this.sparkType = 'dot';
          this.size = 0.35 + Math.random() * 0.45; // Hạt than li ti siêu nhỏ (chỉ 0.35 - 0.8px)
          this.aspectRatio = 1;
          this.curvature = 0;
        }

        // Tốc độ bay cực kỳ chậm rãi, thư thái bốc lên nhịp nhàng
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = -(0.18 + Math.random() * 0.42); // Bay chậm lững lờ
        this.baseAlpha = 0.5 + Math.random() * 0.5;
        this.alpha = this.baseAlpha;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.008 + Math.random() * 0.016;
        this.wobbleAmp = 0.2 + Math.random() * 0.35;
        this.angle = (Math.random() - 0.5) * Math.PI * 0.8;
        this.rotationSpeed = (Math.random() - 0.5) * 0.012; // Xoay chầm chậm
        this.flickerOffset = Math.random() * Math.PI * 2;

        // Bảng màu tàn lửa than hồng thực tế (Lõi trắng vàng nhiệt độ cao -> Cam rực -> Đỏ than -> Tro ấm)
        const palettes = [
          { core: '#fffbe6', glow: '#ffb703', edge: '#fb8500', ember: '#d00000' }, // Than hồng rực lửa
          { core: '#fff3b0', glow: '#ffaa00', edge: '#e85d04', ember: '#9d0208' }, // Tro than ấm
          { core: '#ffffff', glow: '#ffd166', edge: '#f77f00', ember: '#dc2f02' }, // Lửa sáng phát quang
          { core: '#fffae0', glow: '#ff9e00', edge: '#d62828', ember: '#6a040f' }, // Than củi đỏ rực
          { core: '#fff8cc', glow: '#f77f00', edge: '#d62828', ember: '#780000' }, // Tàn lửa cháy âm ỉ
        ];
        const p = palettes[Math.floor(Math.random() * palettes.length)];
        this.coreColor = p.core;
        this.glowColor = p.glow;
        this.edgeColor = p.edge;
        this.emberColor = p.ember;
      }

      update() {
        this.y += this.vy;
        this.wobble += this.wobbleSpeed;
        this.x += this.vx + Math.sin(this.wobble) * this.wobbleAmp;
        this.angle += this.rotationSpeed;

        const flicker = Math.sin(this.wobble * 2.5 + this.flickerOffset) * 0.15;
        const topFade = Math.min(1, Math.max(0, (this.y + 25) / 50));
        const bottomFade = Math.min(1, Math.max(0, (height + 25 - this.y) / 45));

        this.alpha = Math.max(0, Math.min(1, (this.baseAlpha + flicker) * topFade * bottomFade));

        if (this.y < -35) {
          this.reset(false);
        }
      }

      draw() {
        if (this.alpha <= 0.02) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.globalAlpha = this.alpha;

        if (this.sparkType === 'crescent' || this.sparkType === 'streak') {
          const len = this.size;
          const thick = Math.max(0.7, len * this.aspectRatio);
          const curve = len * 0.32 * this.curvature;

          // Vẽ mảnh tàn lửa cong thanh thoát
          ctx.beginPath();
          ctx.moveTo(0, -len / 2);
          ctx.quadraticCurveTo(curve + thick * 1.6, 0, 0, len / 2);
          ctx.quadraticCurveTo(curve - thick * 0.25, 0, 0, -len / 2);
          ctx.closePath();

          const grad = ctx.createLinearGradient(-thick, -len / 2, thick + Math.abs(curve), len / 2);
          grad.addColorStop(0, this.emberColor);
          grad.addColorStop(0.25, this.edgeColor);
          grad.addColorStop(0.55, this.glowColor);
          grad.addColorStop(0.8, this.coreColor);
          grad.addColorStop(1, this.edgeColor);

          ctx.fillStyle = grad;
          ctx.shadowColor = this.glowColor;
          ctx.shadowBlur = isDarkTheme ? 4 : 2;
          ctx.fill();

          if (len > 8) {
            ctx.strokeStyle = this.coreColor;
            ctx.lineWidth = 0.35;
            ctx.stroke();
          }
        } else {
          // Hạt than hồng li ti tinh tế
          const r = this.size;
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.6);
          grad.addColorStop(0, this.coreColor);
          grad.addColorStop(0.5, this.glowColor);
          grad.addColorStop(0.85, this.edgeColor);
          grad.addColorStop(1, 'rgba(157, 2, 8, 0)');

          ctx.shadowColor = this.glowColor;
          ctx.shadowBlur = isDarkTheme ? 3 : 1.5;

          ctx.beginPath();
          ctx.fillStyle = grad;
          ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.fillStyle = '#ffffff';
          ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Helper palette generator cho hiệu ứng Fireworks với màu sắc tùy chỉnh
    const getFireworkPalette = (hex?: string) => {
      const rgb = hexToRgb(hex || '#ffd700');
      const r = rgb.r, g = rgb.g, b = rgb.b;
      const cWhite = `rgba(255, 255, 255`;
      const cLight = `rgba(${Math.min(255, Math.round(r * 0.4 + 255 * 0.6))}, ${Math.min(255, Math.round(g * 0.4 + 255 * 0.6))}, ${Math.min(255, Math.round(b * 0.4 + 255 * 0.6))}`;
      const cVivid = `rgba(${r}, ${g}, ${b}`;
      const cDark = `rgba(${Math.round(r * 0.75)}, ${Math.round(g * 0.75)}, ${Math.round(b * 0.75)}`;
      return {
        r, g, b,
        cWhite,
        cLight,
        cVivid,
        cDark,
        glow: `rgba(${r}, ${g}, ${b}, 0.9)`,
        trailColors: [
          cWhite,
          cLight,
          cVivid,
          cDark,
        ],
      };
    };

    const currentFwPalette = getFireworkPalette(effectColor);

    // Radial Starburst Firework Classes hỗ trợ tùy chỉnh màu sắc effectColor
    class GoldenFireworkRay {
      x: number;
      y: number;
      vx: number;
      vy: number;
      trail: { x: number; y: number }[] = [];
      maxTrailLength: number;
      alpha: number = 1;
      decay: number;
      gravity: number = 0.025;
      drag: number = 0.968;
      color: string;
      sparkleSize: number;
      twinklePhase: number;

      constructor(x: number, y: number, angle: number, speed: number) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.maxTrailLength = 10 + Math.floor(Math.random() * 8);
        this.decay = 0.007 + Math.random() * 0.01;
        this.sparkleSize = 1.0 + Math.random() * 2.2;
        this.twinklePhase = Math.random() * Math.PI * 2;

        const colors = currentFwPalette.trailColors;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
          this.trail.shift();
        }

        this.vx *= this.drag;
        this.vy *= this.drag;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        this.twinklePhase += 0.25;
      }

      draw() {
        if (this.alpha <= 0 || this.trail.length === 0) return;
        ctx.save();

        // Glow
        ctx.shadowColor = currentFwPalette.glow;
        ctx.shadowBlur = 6;

        // Draw radial trail line
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < this.trail.length; i++) {
          ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        ctx.lineTo(this.x, this.y);

        ctx.strokeStyle = `${this.color}, ${Math.max(0, this.alpha * 0.85)})`;
        ctx.lineWidth = Math.max(0.6, 1.4 * this.alpha);
        ctx.stroke();

        // Draw glowing tip/sparkle
        const twinkleAlpha = Math.max(0, this.alpha * (0.6 + Math.sin(this.twinklePhase) * 0.4));
        ctx.fillStyle = `${currentFwPalette.cWhite}, ${twinkleAlpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.sparkleSize * (0.5 + this.alpha * 0.5), 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    class GoldenGlitterDot {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      decay: number;
      size: number;
      twinkleSpeed: number;
      twinkleVal: number;

      constructor(x: number, y: number) {
        this.x = x + (Math.random() - 0.5) * 12;
        this.y = y + (Math.random() - 0.5) * 12;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = 0.1 + Math.random() * 0.4;
        this.alpha = 0.8 + Math.random() * 0.2;
        this.decay = 0.006 + Math.random() * 0.012;
        this.size = 0.8 + Math.random() * 1.8;
        this.twinkleSpeed = 0.15 + Math.random() * 0.25;
        this.twinkleVal = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        this.twinkleVal += this.twinkleSpeed;
      }

      draw() {
        if (this.alpha <= 0) return;
        ctx.save();
        const curAlpha = Math.max(0, this.alpha * (0.4 + Math.sin(this.twinkleVal) * 0.6));
        ctx.fillStyle = `${currentFwPalette.cLight}, ${curAlpha})`;
        ctx.shadowColor = currentFwPalette.glow;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class GoldenFireworkCore {
      x: number;
      y: number;
      radius: number = 0;
      maxRadius: number;
      alpha: number = 1;
      decay: number = 0.045;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.maxRadius = 35 + Math.random() * 25;
      }

      update() {
        if (this.radius < this.maxRadius) {
          this.radius += (this.maxRadius - this.radius) * 0.25;
        }
        this.alpha -= this.decay;
      }

      draw() {
        if (this.alpha <= 0) return;
        ctx.save();
        const grad = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, Math.max(1, this.radius)
        );
        grad.addColorStop(0, `${currentFwPalette.cWhite}, ${this.alpha * 0.95})`);
        grad.addColorStop(0.25, `${currentFwPalette.cLight}, ${this.alpha * 0.8})`);
        grad.addColorStop(0.55, `${currentFwPalette.cVivid}, ${this.alpha * 0.4})`);
        grad.addColorStop(1, `${currentFwPalette.cDark}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(1, this.radius), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.shadowColor = currentFwPalette.glow;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3.5 + this.alpha * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    class GoldenFireworkRocket {
      x: number;
      y: number;
      targetY: number;
      vy: number;
      exploded: boolean = false;
      sparkTrail: { x: number; y: number; alpha: number }[] = [];

      constructor() {
        this.x = 80 + Math.random() * (width - 160);
        this.y = height + 10;
        this.targetY = 60 + Math.random() * (height * 0.45);
        this.vy = -(6 + Math.random() * 3.5);
      }

      update(spawnBurst: (x: number, y: number) => void) {
        this.sparkTrail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.sparkTrail.length > 10) this.sparkTrail.shift();
        this.sparkTrail.forEach((t) => (t.alpha -= 0.1));

        this.y += this.vy;

        if (this.vy < 0 && this.y <= this.targetY) {
          this.exploded = true;
          spawnBurst(this.x, this.y);
        }
      }

      draw() {
        if (this.exploded) return;
        ctx.save();
        ctx.shadowColor = currentFwPalette.glow;
        ctx.shadowBlur = 8;
        ctx.fillStyle = `${currentFwPalette.cWhite}, 1)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.2, 0, Math.PI * 2);
        ctx.fill();

        this.sparkTrail.forEach((t) => {
          if (t.alpha > 0) {
            ctx.fillStyle = `${currentFwPalette.cLight}, ${t.alpha * 0.7})`;
            ctx.beginPath();
            ctx.arc(t.x + (Math.random() - 0.5) * 2, t.y, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        ctx.restore();
      }
    }

    class SciFiHudElement {
      slotIndex: number;
      x: number = 0;
      y: number = 0;
      radius: number = 0;
      scale: number = 1;
      type: number = 0;
      rotation: number = 0;
      rotSpeed: number = 0;
      innerRot: number = 0;
      innerRotSpeed: number = 0;
      alpha: number = 0;
      maxAlpha: number = 0.65;
      state: 'fade_in' | 'active' | 'fade_out' = 'fade_in';
      fadeInSpeed: number = 0.0015;
      fadeOutSpeed: number = 0.0015;
      activeTimer: number = 400;
      pulseTimer: number = 0;
      sweepAngle: number = 0;

      constructor(slotIndex: number, isInitial: boolean = false, allParticles?: any[]) {
        this.slotIndex = slotIndex;
        this.reset(isInitial, undefined, allParticles);
      }

      reset(isInitial: boolean = false, spawnPosition?: 'top' | 'bottom', allParticles?: any[]) {
        const otherElements = (allParticles || []).filter(
          (p) => p !== this && p instanceof SciFiHudElement
        );
        const minDistance = 210; // Minimum 2D Euclidean distance to prevent overlapping

        let bestX = 0;
        let bestY = 0;
        let foundSafe = false;

        for (let attempt = 0; attempt < 25; attempt++) {
          // Scatter across the width of the story page (with padding)
          const margin = Math.min(60, width * 0.08);
          let candX = margin + Math.random() * (width - margin * 2);

          let candY = 0;
          if (spawnPosition === 'bottom') {
            candY = height + 90 + Math.random() * 250;
          } else if (spawnPosition === 'top') {
            candY = -90 - Math.random() * 250;
          } else {
            // Initial scatter across page height
            candY = Math.random() * (height - 100) + 50;
          }

          // Check 2D distance against all existing SciFi HUD elements
          const hasConflict = otherElements.some((other) => {
            const dx = other.x - candX;
            const dy = other.y - candY;
            return Math.hypot(dx, dy) < minDistance;
          });

          if (!hasConflict) {
            bestX = candX;
            bestY = candY;
            foundSafe = true;
            break;
          }
        }

        if (!foundSafe) {
          // Fallback if safe candidate wasn't found in 25 tries
          const margin = Math.min(60, width * 0.08);
          bestX = margin + Math.random() * (width - margin * 2);
          if (spawnPosition === 'bottom') {
            let maxOtherY = height + 100;
            otherElements.forEach((o) => { if (o.y > maxOtherY) maxOtherY = o.y; });
            bestY = maxOtherY + minDistance;
          } else if (spawnPosition === 'top') {
            let minOtherY = -100;
            otherElements.forEach((o) => { if (o.y < minOtherY) minOtherY = o.y; });
            bestY = minOtherY - minDistance;
          } else {
            bestY = (this.slotIndex * (height / 6)) + 60;
          }
        }

        this.x = bestX;
        this.y = bestY;

        this.radius = 24 + Math.random() * 16;
        this.scale = 0.45 + Math.random() * 0.3;
        this.type = Math.floor(Math.random() * 5);
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.005;
        if (Math.abs(this.rotSpeed) < 0.0015) this.rotSpeed = 0.002;
        this.innerRot = Math.random() * Math.PI * 2;
        this.innerRotSpeed = -this.rotSpeed * 1.5;

        this.maxAlpha = 0.16 + Math.random() * 0.14;
        this.fadeInSpeed = 0.001 + Math.random() * 0.001;
        this.fadeOutSpeed = 0.001 + Math.random() * 0.001;
        this.activeTimer = 350 + Math.floor(Math.random() * 300);
        this.pulseTimer = Math.random() * Math.PI * 2;
        this.sweepAngle = Math.random() * Math.PI * 2;

        if (isInitial && Math.random() < 0.5) {
          this.state = 'active';
          this.alpha = this.maxAlpha * (0.3 + Math.random() * 0.7);
        } else {
          this.state = 'fade_in';
          this.alpha = 0;
        }
      }

      update(allParticles?: any[]) {
        this.rotation += this.rotSpeed;
        this.innerRot += this.innerRotSpeed;
        this.pulseTimer += 0.02;
        this.sweepAngle += 0.025;

        if (this.state === 'fade_in') {
          this.alpha += this.fadeInSpeed;
          if (this.alpha >= this.maxAlpha) {
            this.alpha = this.maxAlpha;
            this.state = 'active';
          }
        } else if (this.state === 'active') {
          this.activeTimer--;
          if (this.activeTimer <= 0) {
            this.state = 'fade_out';
          }
        } else if (this.state === 'fade_out') {
          this.alpha -= this.fadeOutSpeed;
          if (this.alpha <= 0) {
            this.alpha = 0;
            this.reset(false, undefined, allParticles);
          }
        }
      }

      draw(c: CanvasRenderingContext2D, rgb: { r: number; g: number; b: number }) {
        if (this.alpha <= 0.01) return;

        const pulse = Math.sin(this.pulseTimer) * 0.12;
        const alphaMultiplier = isDarkTheme ? 1.6 : 2.2;
        const currentAlpha = Math.max(0, Math.min(1, (this.alpha + pulse) * alphaMultiplier));
        const strokeColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.min(1, currentAlpha * (isDarkTheme ? 1.0 : 1.25))})`;
        const glowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${currentAlpha * (isDarkTheme ? 0.8 : 0.6)})`;
        const dimColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${currentAlpha * (isDarkTheme ? 0.45 : 0.6)})`;
        const fillColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${currentAlpha * (isDarkTheme ? 0.2 : 0.3)})`;

        c.save();
        c.translate(this.x, this.y);
        c.scale(this.scale, this.scale);

        c.shadowColor = glowColor;
        c.shadowBlur = isDarkTheme ? 8 : 4;
        c.strokeStyle = strokeColor;
        c.fillStyle = strokeColor;
        c.lineWidth = isDarkTheme ? 1.3 : 1.8;

        const r = this.radius;

        if (this.type === 0) {
          // TYPE 0: Ultra-Detailed Tactical Reticle & Compass
          // Outer degree tick marks
          c.save();
          c.strokeStyle = dimColor;
          c.lineWidth = 0.8;
          const ticks = 36;
          for (let i = 0; i < ticks; i++) {
            const angle = (Math.PI * 2 * i) / ticks;
            const isMajor = i % 9 === 0;
            const isMid = i % 3 === 0;
            const len = isMajor ? 8 : (isMid ? 5 : 3);
            c.beginPath();
            c.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
            c.lineTo(Math.cos(angle) * (r - len), Math.sin(angle) * (r - len));
            c.stroke();
          }
          c.restore();

          // Outer solid ring
          c.beginPath();
          c.arc(0, 0, r, 0, Math.PI * 2);
          c.stroke();

          // Counter-rotating dashed ring
          c.save();
          c.rotate(this.rotation);
          c.setLineDash([4, 6]);
          c.beginPath();
          c.arc(0, 0, r * 0.82, 0, Math.PI * 2);
          c.stroke();
          c.restore();

          // Inner rotating segmented ring with corner notches
          c.save();
          c.rotate(this.innerRot);
          c.lineWidth = 1.8;
          for (let i = 0; i < 4; i++) {
            const startA = (i * Math.PI) / 2 + 0.15;
            c.beginPath();
            c.arc(0, 0, r * 0.62, startA, startA + 0.7);
            c.stroke();
          }
          c.restore();

          // Center precision crosshair
          c.lineWidth = 1;
          c.beginPath();
          c.moveTo(-r * 0.45, 0); c.lineTo(-r * 0.15, 0);
          c.moveTo(r * 0.15, 0); c.lineTo(r * 0.45, 0);
          c.moveTo(0, -r * 0.45); c.lineTo(0, -r * 0.15);
          c.moveTo(0, r * 0.15); c.lineTo(0, r * 0.45);
          c.stroke();

          // Center micro target dot
          c.beginPath();
          c.arc(0, 0, 2.5, 0, Math.PI * 2);
          c.fill();

          // Telemetry micro label
          c.save();
          c.font = '8px monospace';
          c.fillStyle = strokeColor;
          c.fillText('SYS // 84.1°', -r * 0.6, r + 14);
          c.restore();

        } else if (this.type === 1) {
          // TYPE 1: Sci-Fi Corner Bracket & Digital Frequency Analyzer
          const boxSize = r * 0.9;
          const cornerLen = 16;
          c.lineWidth = 1.4;

          // Corner L-Brackets
          [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
            const cx = sx * boxSize;
            const cy = sy * boxSize;
            c.beginPath();
            c.moveTo(cx - sx * cornerLen, cy);
            c.lineTo(cx, cy);
            c.lineTo(cx, cy - sy * cornerLen);
            c.stroke();

            c.beginPath();
            c.arc(cx, cy, 2, 0, Math.PI * 2);
            c.fill();
          });

          // Inner boundary box (dim dashed)
          c.save();
          c.strokeStyle = dimColor;
          c.setLineDash([3, 3]);
          c.strokeRect(-boxSize + 4, -boxSize + 4, boxSize * 2 - 8, boxSize * 2 - 8);
          c.restore();

          // 5 Digital spectrum bars pulsing
          const barWidth = 6;
          const barGap = 4;
          const totalW = 5 * barWidth + 4 * barGap;
          const startX = -totalW / 2;
          for (let i = 0; i < 5; i++) {
            const barH = 8 + Math.sin(this.pulseTimer * 2 + i * 1.2) * 12 + (i % 2) * 6;
            const bx = startX + i * (barWidth + barGap);
            c.fillStyle = fillColor;
            c.fillRect(bx, -barH / 2, barWidth, barH);
            c.strokeStyle = strokeColor;
            c.strokeRect(bx, -barH / 2, barWidth, barH);
          }

          // Data stream label
          c.save();
          c.font = '8px monospace';
          c.fillStyle = strokeColor;
          c.fillText('DATA // 0x7F9B', -boxSize, boxSize + 14);
          c.restore();

        } else if (this.type === 2) {
          // TYPE 2: Cyber Circuit Diagram & Hex Core
          const hexR = r * 0.55;
          
          // Outer Hexagon
          c.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i + this.rotation * 0.3;
            const px = Math.cos(a) * hexR;
            const py = Math.sin(a) * hexR;
            if (i === 0) c.moveTo(px, py);
            else c.lineTo(px, py);
          }
          c.closePath();
          c.stroke();

          // Circuit Trace lines extending outwards
          const traceAngles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
          traceAngles.forEach((angle, idx) => {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const p1x = cos * hexR;
            const p1y = sin * hexR;
            const p2x = cos * (r * 1.15);
            const p2y = sin * (r * 1.15);
            const cornerDir = (idx % 2 === 0 ? 1 : -1) * 12;
            const p3x = p2x + (cos === 0 ? cornerDir : 0);
            const p3y = p2y + (sin === 0 ? cornerDir : 0);

            c.beginPath();
            c.moveTo(p1x, p1y);
            c.lineTo(p2x, p2y);
            c.lineTo(p3x, p3y);
            c.stroke();

            // Terminal node dot
            c.beginPath();
            c.arc(p3x, p3y, 2.8, 0, Math.PI * 2);
            c.fill();
          });

          // Inner Hexagon (pulse)
          c.save();
          c.rotate(-this.innerRot);
          c.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i;
            const px = Math.cos(a) * (hexR * 0.45);
            const py = Math.sin(a) * (hexR * 0.45);
            if (i === 0) c.moveTo(px, py);
            else c.lineTo(px, py);
          }
          c.closePath();
          c.fillStyle = fillColor;
          c.fill();
          c.stroke();
          c.restore();

          // Center core dot
          c.beginPath();
          c.arc(0, 0, 3, 0, Math.PI * 2);
          c.fill();

        } else if (this.type === 3) {
          // TYPE 3: Orbital Quantum Radar Scanner
          // 2 Concentric Radar circles
          c.beginPath();
          c.arc(0, 0, r, 0, Math.PI * 2);
          c.stroke();

          c.beginPath();
          c.arc(0, 0, r * 0.55, 0, Math.PI * 2);
          c.stroke();

          // Quadrant crosshair lines
          c.save();
          c.strokeStyle = dimColor;
          c.lineWidth = 0.8;
          c.beginPath();
          c.moveTo(-r, 0); c.lineTo(r, 0);
          c.moveTo(0, -r); c.lineTo(0, r);
          c.stroke();
          c.restore();

          // Rotating Radar Scanner Sweep Wedge
          c.save();
          const sweepGrad = c.createConicGradient(this.sweepAngle, 0, 0);
          sweepGrad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${currentAlpha * 0.4})`);
          sweepGrad.addColorStop(0.18, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.0)`);
          sweepGrad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.0)`);
          c.fillStyle = sweepGrad;
          c.beginPath();
          c.arc(0, 0, r, 0, Math.PI * 2);
          c.fill();

          // Sweep line
          c.strokeStyle = strokeColor;
          c.lineWidth = 1.6;
          c.beginPath();
          c.moveTo(0, 0);
          c.lineTo(Math.cos(this.sweepAngle) * r, Math.sin(this.sweepAngle) * r);
          c.stroke();
          c.restore();

          // 2 Micro Target Blips
          const blip1A = this.sweepAngle - 0.5;
          const blip1R = r * 0.7;
          c.beginPath();
          c.arc(Math.cos(blip1A) * blip1R, Math.sin(blip1A) * blip1R, 2.5, 0, Math.PI * 2);
          c.fill();

          c.save();
          c.font = '8px monospace';
          c.fillStyle = strokeColor;
          c.fillText('RADAR // 360°', -r * 0.5, r + 14);
          c.restore();

        } else {
          // TYPE 4: Dual Arc Target Reticle with Notch Teeth
          c.save();
          c.rotate(this.rotation);

          // Top & Bottom Heavy Arcs
          c.lineWidth = 2.4;
          c.beginPath();
          c.arc(0, 0, r, Math.PI * 0.1, Math.PI * 0.9);
          c.stroke();

          c.beginPath();
          c.arc(0, 0, r, Math.PI * 1.1, Math.PI * 1.9);
          c.stroke();

          // Left & Right Dash Arcs
          c.setLineDash([3, 4]);
          c.lineWidth = 1;
          c.beginPath();
          c.arc(0, 0, r * 0.75, Math.PI * 0.85, Math.PI * 1.15);
          c.stroke();
          c.beginPath();
          c.arc(0, 0, r * 0.75, -Math.PI * 0.15, Math.PI * 0.15);
          c.stroke();
          c.restore();

          // Inner rotating diamond target
          c.save();
          c.rotate(this.innerRot);
          c.lineWidth = 1.2;
          const dR = r * 0.38;
          c.beginPath();
          c.moveTo(0, -dR);
          c.lineTo(dR, 0);
          c.lineTo(0, dR);
          c.lineTo(-dR, 0);
          c.closePath();
          c.stroke();
          c.restore();

          // Center dot & crosshair
          c.beginPath();
          c.arc(0, 0, 2.5, 0, Math.PI * 2);
          c.fill();

          c.save();
          c.font = '8px monospace';
          c.fillStyle = strokeColor;
          c.fillText('TARGET // LOCK', -r * 0.6, r + 14);
          c.restore();
        }

        c.restore();
      }
    }

    let fireworkRockets: GoldenFireworkRocket[] = [];
    let fireworkRays: GoldenFireworkRay[] = [];
    let fireworkGlitter: GoldenGlitterDot[] = [];
    let fireworkCores: GoldenFireworkCore[] = [];
    let fireworkLaunchTimer = 0;

    const spawnGoldenStarburst = (cx: number, cy: number) => {
      fireworkCores.push(new GoldenFireworkCore(cx, cy));

      // 100 - 130 radial rays shooting 360 degrees out
      const numRays = 110 + Math.floor(Math.random() * 30);
      for (let i = 0; i < numRays; i++) {
        const angle = (Math.PI * 2 * i) / numRays + (Math.random() - 0.5) * 0.08;
        const speed = 1.6 + Math.random() * 4.2;
        fireworkRays.push(new GoldenFireworkRay(cx, cy, angle, speed));
      }

      const numGlitter = 50 + Math.floor(Math.random() * 30);
      for (let i = 0; i < numGlitter; i++) {
        fireworkGlitter.push(new GoldenGlitterDot(cx, cy));
      }
    };

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      if (effect === 'rain') {
        particles.push(new RainParticle());
      } else if (effect === 'snow') {
        particles.push(new SnowParticle());
      } else if (effect === 'star') {
        particles.push(new StarParticle());
      } else if (effect === 'leaf') {
        particles.push(new LeafParticle());
      } else if (effect === 'ginkgo') {
        particles.push(new GinkgoParticle());
      } else if (effect === 'cherry_blossom') {
        particles.push(new CherryBlossomParticle());
      } else if (effect === 'firefly') {
        particles.push(new FireflyParticle());
      } else if (effect === 'soap_bubble') {
        particles.push(new SoapBubbleParticle());
      } else if (effect === 'fruits') {
        particles.push(new FruitParticle());
      } else if (effect === 'ocean') {
        particles.push(new OceanParticle());
      } else if (effect === 'butterflies') {
        particles.push(new ButterflyParticle());
      } else if (effect === 'feathers') {
        particles.push(new FeatherParticle());
      } else if (effect === 'lightning') {
        particles.push(new LightningParticle());
      } else if (effect === 'fog') {
        particles.push(new FogParticle());
      } else if (effect === 'fire_sparks') {
        particles.push(new FireSparkParticle());
      } else if (effect === 'sci_fi_hud') {
        particles.push(new SciFiHudElement(i, true, particles));
      }
    }

    // Shooting star trigger state
    let shootingStar: { x: number; y: number; dx: number; dy: number; len: number; speed: number; opacity: number } | null = null;
    const triggerShootingStar = () => {
      shootingStar = {
        x: Math.random() * width * 0.8,
        y: 0,
        dx: 4 + Math.random() * 3,
        dy: 4 + Math.random() * 3,
        len: 40 + Math.random() * 50,
        speed: 9 + Math.random() * 7,
        opacity: 0.4 + Math.random() * 0.3,
      };
    };

    let glitchTimer = 0;
    let prevScrollY = window.scrollY;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Cho phép các hiệu ứng trôi theo trang khi người dùng cuộn (không bị cố định đơ cứng)
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - prevScrollY;
      prevScrollY = currentScrollY;

      if (scrollDelta !== 0) {
        if (effect === 'fireworks') {
          for (let i = 0; i < fireworkRockets.length; i++) {
            const r = fireworkRockets[i];
            r.y -= scrollDelta;
            r.targetY -= scrollDelta;
            if (r.sparkTrail) {
              r.sparkTrail.forEach((t) => (t.y -= scrollDelta));
            }
          }
          for (let i = 0; i < fireworkCores.length; i++) {
            fireworkCores[i].y -= scrollDelta;
          }
          for (let i = 0; i < fireworkRays.length; i++) {
            const ray = fireworkRays[i];
            ray.y -= scrollDelta;
            if (ray.trail) {
              ray.trail.forEach((t) => (t.y -= scrollDelta));
            }
          }
          for (let i = 0; i < fireworkGlitter.length; i++) {
            fireworkGlitter[i].y -= scrollDelta;
          }
        } else if (particles && particles.length > 0) {
          particles.forEach((p) => {
            if (p.y !== undefined) {
              p.y -= scrollDelta;

              // Khi cuộn làm hạt rơi ra ngoài phạm vi màn hình, tái sinh ngẫu nhiên trải đều không gian để không bao giờ bị dồn cục
              if (effect === 'fire_sparks' || effect === 'money_100k') {
                if (p.y < -40) {
                  // Văng lên trên -> tái sinh ở dưới đáy với độ cao ngẫu nhiên sâu phía dưới
                  p.y = height + 10 + Math.random() * (height * 0.7);
                  p.x = Math.random() * width;
                } else if (p.y > height + 40) {
                  // Văng xuống dưới -> tái sinh ở mép trên với độ cao ngẫu nhiên
                  p.y = -10 - Math.random() * (height * 0.5);
                  p.x = Math.random() * width;
                }
              } else if (effect === 'sci_fi_hud') {
                if (p.y < -160) {
                  p.reset(false, 'bottom', particles);
                } else if (p.y > height + 160) {
                  p.reset(false, 'top', particles);
                }
              } else {
                if (p.y < -50) {
                  p.y = height + 10 + Math.random() * 40;
                  if (p.x !== undefined) p.x = Math.random() * width;
                } else if (p.y > height + 50) {
                  p.y = -20 - Math.random() * 40;
                  if (p.x !== undefined) p.x = Math.random() * width;
                }
              }
            }
          });
        }
      }

      if (effect === 'glitch') {
        // CRT Scanlines
        ctx.beginPath();
        ctx.strokeStyle = isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';
        ctx.lineWidth = 1;
        for (let y = 0; y < height; y += 6) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();

        glitchTimer++;
        if (glitchTimer % 150 === 0 || Math.random() < 0.01) {
          const numGlitches = 1 + Math.floor(Math.random() * 2);
          for (let i = 0; i < numGlitches; i++) {
            const sliceY = Math.random() * height;
            const sliceHeight = 4 + Math.random() * 12;
            const shift = (Math.random() - 0.5) * 10;

            ctx.fillStyle = isDarkTheme ? 'rgba(6, 182, 212, 0.25)' : 'rgba(8, 145, 178, 0.2)';
            ctx.fillRect(shift, sliceY, width, sliceHeight);

            ctx.fillStyle = isDarkTheme ? 'rgba(236, 72, 153, 0.25)' : 'rgba(219, 39, 119, 0.2)';
            ctx.fillRect(-shift, sliceY + 1, width, sliceHeight);
          }
        }

        if (Math.random() < 0.05) {
          ctx.fillStyle = isDarkTheme ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.12)';
          const count = 1 + Math.floor(Math.random() * 2);
          for (let i = 0; i < count; i++) {
            ctx.fillRect(Math.random() * width, Math.random() * height, 12 + Math.random() * 35, 2);
          }
        }
      } else {
        if (effect === 'fireworks') {
          fireworkLaunchTimer++;
          // Launch rockets regularly or when screen is quiet
          if (
            fireworkLaunchTimer % 80 === 0 ||
            (fireworkRockets.length === 0 &&
              fireworkRays.length === 0 &&
              fireworkCores.length === 0 &&
              Math.random() < 0.05)
          ) {
            fireworkRockets.push(new GoldenFireworkRocket());
          }

          // Update & draw rockets
          for (let i = fireworkRockets.length - 1; i >= 0; i--) {
            const rocket = fireworkRockets[i];
            rocket.update((cx, cy) => {
              spawnGoldenStarburst(cx, cy);
            });
            if (rocket.exploded) {
              fireworkRockets.splice(i, 1);
            } else {
              rocket.draw();
            }
          }

          // Update & draw Golden Cores
          for (let i = fireworkCores.length - 1; i >= 0; i--) {
            const core = fireworkCores[i];
            core.update();
            if (core.alpha <= 0) {
              fireworkCores.splice(i, 1);
            } else {
              core.draw();
            }
          }

          // Update & draw Golden Radial Rays
          for (let i = fireworkRays.length - 1; i >= 0; i--) {
            const ray = fireworkRays[i];
            ray.update();
            if (ray.alpha <= 0) {
              fireworkRays.splice(i, 1);
            } else {
              ray.draw();
            }
          }

          // Update & draw Golden Glitter
          for (let i = fireworkGlitter.length - 1; i >= 0; i--) {
            const g = fireworkGlitter[i];
            g.update();
            if (g.alpha <= 0) {
              fireworkGlitter.splice(i, 1);
            } else {
              g.draw();
            }
          }
        } else if (effect === 'sci_fi_hud') {
          const rgb = hexToRgb(effectColor);
          particles.forEach((p) => {
            p.update(particles);
            p.draw(ctx, rgb);
          });
        } else {
          if (effect === 'ocean') {
            const oceanTime = glitchTimer * 0.01;

            ctx.save();

            // Hiệu ứng ẩn hiện nhịp nhàng (Breathing fade-in / fade-out effect)
            const pulseAlpha = 0.2 + 0.8 * (Math.sin(oceanTime * 0.7) * 0.5 + 0.5);
            ctx.globalAlpha = pulseAlpha;

            // 1. Phủ màu nền ánh sáng đại dương dịu mờ
            const oceanBgGrad = ctx.createLinearGradient(0, 0, 0, height);
            if (isDarkTheme) {
              oceanBgGrad.addColorStop(0, 'rgba(14, 116, 144, 0.16)');
              oceanBgGrad.addColorStop(0.5, 'rgba(8, 145, 178, 0.10)');
              oceanBgGrad.addColorStop(1, 'rgba(3, 105, 161, 0.12)');
            } else {
              oceanBgGrad.addColorStop(0, 'rgba(34, 211, 238, 0.14)');
              oceanBgGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.09)');
              oceanBgGrad.addColorStop(1, 'rgba(14, 165, 233, 0.11)');
            }
            ctx.fillStyle = oceanBgGrad;
            ctx.fillRect(0, 0, width, height);

            ctx.globalCompositeOperation = 'screen';

            // 2. Đốm quầng sáng nước trôi bồng bềnh mờ ảo (Soft Caustics Blobs)
            const numBlobs = 6;
            for (let i = 0; i < numBlobs; i++) {
              const bx = (width * ((i + 0.5) / numBlobs)) + Math.sin(oceanTime + i * 1.3) * (width * 0.08);
              const by = (height * (((i % 3) + 1) / 4)) + Math.cos(oceanTime * 0.8 + i) * (height * 0.08);
              const radius = Math.min(width, height) * (0.22 + Math.sin(oceanTime * 0.5 + i) * 0.06);

              const blobGrad = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
              const alpha = 0.04 + Math.sin(oceanTime * 0.7 + i * 2) * 0.02;

              blobGrad.addColorStop(0, `rgba(224, 242, 254, ${alpha * 1.4})`);
              blobGrad.addColorStop(0.5, `rgba(125, 211, 252, ${alpha * 0.8})`);
              blobGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

              ctx.fillStyle = blobGrad;
              ctx.beginPath();
              ctx.arc(bx, by, radius, 0, Math.PI * 2);
              ctx.fill();
            }

            ctx.restore();
            glitchTimer++;
          }
          // Render general particles
          const generalRgb = hexToRgb(effectColor);
          particles.forEach((p) => {
            p.update();
            p.draw(ctx, generalRgb);
          });
        }

        // Shooting Star
        if (effect === 'star') {
          if (!shootingStar && Math.random() < 0.01) {
            triggerShootingStar();
          }
          if (shootingStar) {
            shootingStar.x += shootingStar.dx;
            shootingStar.y += shootingStar.dy;
            
            ctx.beginPath();
            const grad = ctx.createLinearGradient(
              shootingStar.x, shootingStar.y, 
              shootingStar.x - shootingStar.len, shootingStar.y - shootingStar.len
            );
            grad.addColorStop(0, isDarkTheme ? `rgba(255, 220, 230, ${shootingStar.opacity})` : `rgba(180, 83, 9, ${shootingStar.opacity})`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.8;
            ctx.moveTo(shootingStar.x, shootingStar.y);
            ctx.lineTo(shootingStar.x - shootingStar.len, shootingStar.y - shootingStar.len);
            ctx.stroke();

            if (shootingStar.y > height || shootingStar.x > width) {
              shootingStar = null;
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [effect, effectColor, isDarkTheme]);

  if (effect === 'none' || !effect) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30"
      style={{ mixBlendMode: 'normal' }}
    />
  );
};
