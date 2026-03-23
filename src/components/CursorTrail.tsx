import { useEffect, useRef } from 'react';

interface TrailPoint {
  x: number;
  y: number;
}

class Trail {
  points: TrailPoint[] = [];
  maxPoints = 50;
  hue: number;
  offset: number;

  constructor(hue: number, offset: number) {
    this.hue = hue;
    this.offset = offset;
  }

  addPoint(x: number, y: number) {
    // Add slight offset for tube effect
    const angle = this.offset * (Math.PI / 3);
    const radius = 8;
    this.points.push({
      x: x + Math.cos(angle + Date.now() * 0.003) * radius,
      y: y + Math.sin(angle + Date.now() * 0.003) * radius,
    });
    if (this.points.length > this.maxPoints) this.points.shift();
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 2) return;

    for (let i = 1; i < this.points.length; i++) {
      const life = i / this.points.length;
      const p = this.points[i];
      const prev = this.points[i - 1];

      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = `hsla(${this.hue + i * 1.5}, 80%, 60%, ${life * 0.7})`;
      ctx.lineWidth = life * 5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Glow layer
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = `hsla(${this.hue + i * 1.5}, 90%, 70%, ${life * 0.25})`;
      ctx.lineWidth = life * 14;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Bright tip
    const tip = this.points[this.points.length - 1];
    const grad = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 12);
    grad.addColorStop(0, `hsla(${this.hue}, 100%, 85%, 0.8)`);
    grad.addColorStop(1, `hsla(${this.hue}, 100%, 60%, 0)`);
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

const CursorTrail = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const trails = useRef<Trail[]>([]);
  const animId = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create multiple tube trails with different hue offsets
    trails.current = [
      new Trail(260, 0),   // purple
      new Trail(290, 1),   // pink-purple
      new Trail(230, 2),   // blue-purple
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove);

    const render = () => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = 'lighter';

      for (const trail of trails.current) {
        trail.addPoint(mouse.current.x, mouse.current.y);
        trail.draw(ctx);
      }

      animId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(animId.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};

export default CursorTrail;
