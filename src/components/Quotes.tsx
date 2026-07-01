import { useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';

// =============================================================
// CITAÇÕES AUTORAIS — Victória P. Paes
// Substitua os textos abaixo pelas citações reais quando disponíveis.
// Cada objeto tem: "quote" (texto da citação) e "excerpt" (descrição opcional do post).
// =============================================================
const quotes = [
  {
    quote: '[Citação autoral 1]',
    excerpt: 'Em breve',
    tag: 'Substack',
  },
  {
    quote: '[Citação autoral 2]',
    excerpt: 'Em breve',
    tag: 'Substack',
  },
  {
    quote: '[Citação autoral 3]',
    excerpt: 'Em breve',
    tag: 'Substack',
  },
];

export default function Quotes() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    refs.current.forEach(r => r && observer.observe(r));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="citacoes"
      className="py-28 px-6"
      style={{ background: 'linear-gradient(180deg, #3A5232 0%, #2D4027 100%)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div
          ref={el => { refs.current[0] = el; }}
          className="fade-in text-center mb-16"
        >
          <p
            className="font-sans text-xs tracking-[0.25em] uppercase mb-4"
            style={{ color: 'rgba(196,164,90,0.8)' }}
          >
            Escritos
          </p>
          <h2
            className="font-serif mb-4"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              color: '#F4EFE5',
              fontWeight: 400,
            }}
          >
            Citações & Reflexões
          </h2>
          <div
            className="mx-auto mb-6"
            style={{
              width: '80px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(196,164,90,0.6), transparent)',
            }}
          />
          <p
            className="font-sans mx-auto"
            style={{
              color: 'rgba(244,239,229,0.65)',
              fontWeight: 300,
              fontSize: '0.9rem',
              lineHeight: 1.85,
              maxWidth: '480px',
            }}
          >
            Pensamentos, reflexões e escritos publicados no Substack de Victória P. Paes.
          </p>
        </div>

        {/* Quote cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {quotes.map((q, i) => (
            <div
              key={i}
              ref={el => { refs.current[i + 1] = el; }}
              className="fade-in flex flex-col p-10 relative"
              style={{
                background: 'rgba(244,239,229,0.06)',
                border: '1px solid rgba(196,164,90,0.2)',
                borderRadius: '2px',
                transitionDelay: `${i * 0.1}s`,
                backdropFilter: 'blur(4px)',
              }}
            >
              {/* Large quote mark */}
              <span
                className="font-serif absolute top-4 left-8"
                style={{ fontSize: '5rem', color: 'rgba(196,164,90,0.15)', lineHeight: 1, fontWeight: 300 }}
              >
                "
              </span>

              <div className="relative z-10 flex-1 flex flex-col">
                <div
                  className="w-6 mb-6"
                  style={{ height: '1px', background: 'rgba(196,164,90,0.5)' }}
                />
                {/* Quote text — replace [Citação autoral N] with real quote */}
                <p
                  className="font-serif flex-1 mb-6"
                  style={{
                    color: q.quote.startsWith('[') ? 'rgba(244,239,229,0.3)' : 'rgba(244,239,229,0.9)',
                    fontWeight: 300,
                    fontSize: '1.1rem',
                    lineHeight: 1.75,
                    fontStyle: q.quote.startsWith('[') ? 'normal' : 'italic',
                  }}
                >
                  {q.quote.startsWith('[') ? 'Em breve...' : q.quote}
                </p>

                <div className="flex items-center justify-between">
                  <span
                    className="font-sans text-xs tracking-widest uppercase"
                    style={{ color: 'rgba(196,164,90,0.6)', fontWeight: 400 }}
                  >
                    {q.tag}
                  </span>
                  <span
                    className="font-serif text-xs italic"
                    style={{ color: 'rgba(244,239,229,0.35)' }}
                  >
                    Victória P. Paes
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Substack link */}
        <div
          ref={el => { refs.current[4] = el; }}
          className="fade-in text-center"
        >
          <a
            href="https://substack.com/@psivictoriapaes"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 font-sans text-xs tracking-[0.18em] uppercase py-3 px-8 transition-all duration-300"
            style={{
              color: 'rgba(196,164,90,0.9)',
              border: '1px solid rgba(196,164,90,0.35)',
              fontWeight: 500,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(196,164,90,0.12)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <ExternalLink size={13} />
            Ler no Substack
          </a>
        </div>
      </div>
    </section>
  );
}
