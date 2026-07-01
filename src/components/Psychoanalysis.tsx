import { useEffect, useRef } from 'react';

const concepts = [
  {
    number: '01',
    title: 'A Escuta',
    body: 'Na psicanálise, ouvir é um ato técnico e ético. Uma escuta que não julga, não dirige, não apresura — mas que cria as condições para que o sujeito possa dizer o que ainda não sabia que tinha a dizer.',
  },
  {
    number: '02',
    title: 'O Inconsciente',
    body: 'Freud nos revelou que somos habitados por forças que desconhecemos. O inconsciente não é uma metáfora — é a dimensão mais viva de nossa existência, que se manifesta nos lapsos, nos sonhos, nos sintomas e nos modos de amar.',
  },
  {
    number: '03',
    title: 'O Processo Analítico',
    body: 'A análise não segue um protocolo de cura. É um processo singular, construído à medida do sujeito. A repetição de padrões, quando nomeada e elaborada, perde sua força compulsiva e abre caminho para novas formas de existir.',
  },
  {
    number: '04',
    title: 'A Transformação',
    body: 'A mudança que a psicanálise propõe não é de comportamento, mas de posição. Não se trata de ser diferente — mas de se apropriar, com mais liberdade, de quem se é. Um processo que, uma vez iniciado, transforma de dentro.',
  },
];

export default function Psychoanalysis() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.12 }
    );
    refs.current.forEach(r => r && observer.observe(r));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="psicanalise"
      className="py-28 px-6"
      style={{ background: 'linear-gradient(180deg, #EDE5D5 0%, #F4EFE5 100%)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div
          ref={el => { refs.current[0] = el; }}
          className="fade-in text-center mb-20"
        >
          <p
            className="font-sans text-xs tracking-[0.25em] uppercase mb-4"
            style={{ color: 'var(--color-gold)' }}
          >
            Fundamentos
          </p>
          <h2
            className="section-title mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
          >
            O que é Psicanálise
          </h2>
          <div className="gold-divider-lg mx-auto mb-6" />
          <p
            className="font-sans mx-auto"
            style={{
              color: 'var(--color-text)',
              fontWeight: 300,
              fontSize: '0.93rem',
              lineHeight: 1.85,
              maxWidth: '560px',
              opacity: 0.8,
            }}
          >
            Mais do que uma técnica terapêutica, a psicanálise é uma forma de relação com o saber — um convite para que o sujeito se torne, pouco a pouco, interlocutor de sua própria história.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {concepts.map((c, i) => (
            <div
              key={c.number}
              ref={el => { refs.current[i + 1] = el; }}
              className="fade-in card-elegant p-10"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-start gap-6">
                <span
                  className="font-serif text-5xl leading-none flex-shrink-0"
                  style={{ color: 'rgba(184,149,42,0.3)', fontWeight: 300 }}
                >
                  {c.number}
                </span>
                <div>
                  <h3
                    className="font-serif text-xl mb-4"
                    style={{ color: 'var(--color-moss)', fontWeight: 500 }}
                  >
                    {c.title}
                  </h3>
                  <p
                    className="font-sans"
                    style={{
                      color: 'var(--color-text)',
                      fontWeight: 300,
                      fontSize: '0.9rem',
                      lineHeight: 1.9,
                      opacity: 0.85,
                    }}
                  >
                    {c.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
