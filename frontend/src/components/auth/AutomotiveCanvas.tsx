import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    z: number;
    speed: number;
    color: string;
    size: number;
}

export const AutomotiveCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
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

        // Particle System: Warp Speed Automotive Headlight & Taillight Streaks
        const particleCount = 120;
        const particles: Particle[] = [];
        const colors = ['#FEE500', '#FEE500', '#FFFFFF', '#FFD700', '#E5E7EB'];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: (Math.random() - 0.5) * width * 1.8,
                y: (Math.random() - 0.5) * height * 1.8,
                z: Math.random() * width,
                speed: 8 + Math.random() * 12,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 1 + Math.random() * 2.5,
            });
        }

        const render = () => {
            // Soft Trail Fade
            ctx.fillStyle = 'rgba(244, 245, 247, 0.4)';
            ctx.fillRect(0, 0, width, height);

            const cx = width / 2;
            const cy = height / 2;

            particles.forEach((p) => {
                // Previous Projected Position
                const prevZ = p.z;
                p.z -= p.speed;

                if (p.z <= 0) {
                    p.z = width;
                    p.x = (Math.random() - 0.5) * width * 1.8;
                    p.y = (Math.random() - 0.5) * height * 1.8;
                }

                const k = 250 / p.z;
                const px = p.x * k + cx;
                const py = p.y * k + cy;

                const prevK = 250 / prevZ;
                const oldX = p.x * prevK + cx;
                const oldY = p.y * prevK + cy;

                // Only draw if within viewport
                if (px >= 0 && px <= width && py >= 0 && py <= height) {
                    ctx.beginPath();
                    ctx.moveTo(oldX, oldY);
                    ctx.lineTo(px, py);
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = Math.max(0.8, (1 - p.z / width) * p.size * 2);
                    ctx.shadowBlur = p.color === '#FEE500' ? 8 : 4;
                    ctx.shadowColor = p.color;
                    ctx.stroke();
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0"
        />
    );
};

export default AutomotiveCanvas;
