import { useEffect, useRef } from 'react';

export default function About() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="sobre" className="py-28 px-6" style={{ background: 'var(--color-offwhite)' }}>
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className="fade-in grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Photo */}
          <div className="flex justify-center lg:justify-end">
            <div className="photo-frame relative" style={{ maxWidth: '380px', width: '100%' }}>
              <img
                src="/images/foto.jpg"
                alt="Victória P. Paes — Psicanalista"
                className="w-full object-cover"
                style={{
                  borderRadius: '2px',
                  filter: 'sepia(8%) contrast(1.02) brightness(0.98)',
                  aspectRatio: '3/4',
                  objectPosition: 'center top',
                }}
              />
              {/* Gold corner accent */}
              <div
                className="absolute -bottom-3 -right-3"
                style={{
                  width: '40px',
                  height: '40px',
                  borderBottom: '1px solid rgba(184,149,42,0.6)',
                  borderRight: '1px solid rgba(184,149,42,0.6)',
                }}
              />
              <div
                className="absolute -top-3 -left-3"
                style={{
                  width: '40px',
                  height: '40px',
                  borderTop: '1px solid rgba(58,82,50,0.4)',
                  borderLeft: '1px solid rgba(58,82,50,0.4)',
                }}
              />
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col">
            <p
              className="font-sans text-xs tracking-[0.25em] uppercase mb-4"
              style={{ color: 'var(--color-gold)' }}
            >
              Sobre
            </p>

            <h2
              className="section-title mb-2"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.15 }}
            >
              Victória P. Paes
            </h2>

            <div className="gold-divider mb-8" />

            <div
              className="font-sans space-y-5"
              style={{ color: 'var(--color-text)', fontWeight: 300, lineHeight: 1.9, fontSize: '0.93rem' }}
            >
              <p>
                Victória P. Paes é psicóloga clínica e psicanalista, com uma trajetória marcada pela profundidade do encontro humano. Antes de consolidar sua prática privada, atuou pelo Sistema Único de Saúde — experiência que moldou em sua escuta uma sensibilidade singular: a capacidade de estar presente com qualidade, independentemente do contexto, da história ou da origem de quem a procura.
              </p>
              <p>
                Pós-graduada em Clínica Psicanalítica e pós-graduanda em Psicanálise e Análise do Contemporâneo, Victória conduz sua clínica a partir de uma escuta rigorosa e acolhedora. Seu trabalho se orienta pela crença de que cada sujeito carrega em si a possibilidade de transformação — e de que a palavra, quando acolhida sem pressa, é capaz de produzir algo inédito.
              </p>
              <p>
                Sua formação contínua não é apenas acadêmica: é o reflexo de um compromisso ético com o ofício psicanalítico, com o rigor teórico e com a dimensão humana que todo processo analítico exige.
              </p>
            </div>

            {/* CRP */}
            <div className="mt-8 flex items-center gap-3">
              <div className="gold-divider" style={{ width: '32px' }} />
              <span
                className="font-sans text-xs tracking-[0.18em] uppercase"
                style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}
              >
                CRP 05/68654
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
