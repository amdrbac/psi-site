import { useEffect, useRef } from 'react';
import { ArrowDown } from 'lucide-react';

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const timer = setTimeout(() => el.classList.add('visible'), 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToContact = () => {
    document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #F4EFE5 0%, #EDE5D5 30%, #D4DFD0 60%, #9DB59A 100%)',
      }}
    >
      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 80% 20%, rgba(184,149,42,0.08) 0%, transparent 50%),
                            radial-gradient(circle at 20% 80%, rgba(58,82,50,0.12) 0%, transparent 50%)`,
        }}
      />

      {/* Decorative line top-right */}
      <div
        className="absolute top-1/4 right-16 hidden lg:block"
        style={{
          width: '1px',
          height: '120px',
          background: 'linear-gradient(180deg, transparent, rgba(184,149,42,0.5), transparent)',
        }}
      />
      <div
        className="absolute bottom-1/4 left-16 hidden lg:block"
        style={{
          width: '1px',
          height: '80px',
          background: 'linear-gradient(180deg, transparent, rgba(58,82,50,0.4), transparent)',
        }}
      />

      {/* Content */}
      <div
        ref={ref}
        className="fade-in relative z-10 text-center max-w-4xl mx-auto px-6"
      >
        <p
          className="font-sans text-xs tracking-[0.25em] uppercase mb-6"
          style={{ color: 'var(--color-gold)' }}
        >
          Psicanálise &nbsp;·&nbsp; Clínica Online
        </p>

        <h1
          className="font-serif mb-6 leading-tight"
          style={{
            fontSize: 'clamp(2.8rem, 7vw, 5rem)',
            color: 'var(--color-moss)',
            fontWeight: 400,
            lineHeight: 1.1,
          }}
        >
          Um espaço seguro
          <br />
          <em style={{ fontStyle: 'italic', fontWeight: 300 }}>para se encontrar</em>
        </h1>

        <div className="gold-divider-lg mx-auto mb-8" />

        <p
          className="font-sans mb-12 mx-auto"
          style={{
            color: 'var(--color-text)',
            fontWeight: 300,
            fontSize: '1rem',
            lineHeight: '1.8',
            maxWidth: '540px',
            opacity: 0.85,
          }}
        >
          A psicanálise não oferece respostas prontas — ela abre espaço para que você encontre as suas. Um convite ao encontro com sua própria história, em profundidade.
        </p>

        <button onClick={scrollToContact} className="btn-moss">
          Agende sua consulta
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span
          className="font-sans text-xs tracking-widest uppercase"
          style={{ color: 'var(--color-text-muted)', fontSize: '0.65rem' }}
        >
          Rolar
        </span>
        <ArrowDown size={14} style={{ color: 'var(--color-gold)' }} />
      </div>
    </section>
  );
}
