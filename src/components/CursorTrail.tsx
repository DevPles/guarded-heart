import { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  age: number;
}

const CursorTrail = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<Point[]>([]);
  const mouse = useRef({ x: 0, y: 0 });
  const animId = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      points.current.push({ x: e.clientX, y: e.clientY, age: 0 });
      if (points.current.length > 80) points.current.shift();
    };
    window.addEventListener('mousemove', onMove);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';

      const pts = points.current;
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i];
        const prev = pts[i - 1];
        const life = 1 - p.age / 60;
        if (life <= 0) continue;

        const hue = (200 + i * 2) % 360;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `hsla(${hue}, 70%, 55%, ${life * 0.8})`;
        ctx.lineWidth = life * 4;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, life * 6, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${life * 0.3})`;
        ctx.fill();
      }

      // Age out points
      for (const p of pts) p.age++;
      points.current = pts.filter(p => p.age < 60);

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
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default CursorTrail;
