import { useEffect, useRef } from 'react';

function isInteractive(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('a, button, [role="button"]') !== null;
}

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  useEffect(() => {
    // Em telas touch não há cursor de mouse — não ativa nada, não marca o html.
    if (coarse) return;

    document.documentElement.classList.add('has-custom-cursor');

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let raf: number;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      raf = requestAnimationFrame(animate);
    };

    // Delegação no document: cobre links/botões adicionados depois do mount
    // (ex.: cards do Substack carregados via fetch), sem precisar re-consultar
    // o DOM a cada mudança.
    const onOver = (e: MouseEvent) => {
      if (isInteractive(e.target)) {
        dot.style.transform = 'translate(-50%, -50%) scale(2)';
        ring.style.width = '48px';
        ring.style.height = '48px';
        ring.style.opacity = '0.5';
      }
    };
    const onOut = (e: MouseEvent) => {
      if (isInteractive(e.target) && !isInteractive(e.relatedTarget)) {
        dot.style.transform = 'translate(-50%, -50%) scale(1)';
        ring.style.width = '30px';
        ring.style.height = '30px';
        ring.style.opacity = '1';
      }
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, [coarse]);

  if (coarse) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
