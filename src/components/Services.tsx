import { useEffect, useRef } from 'react';
import { Monitor, Clock, RefreshCw, Lock } from 'lucide-react';

const cards = [
  {
    icon: Monitor,
    title: 'Modalidade Online',
    body: 'As sessões são realizadas por videoconferência, garantindo acessibilidade, conforto e continuidade do processo analítico — de onde você estiver, com a mesma qualidade de presença.',
  },
  {
    icon: Clock,
    title: 'Duração das Sessões',
    body: 'Cada sessão tem duração aproximada de 50 minutos — tempo estruturado para que o encontro analítico possa se aprofundar com consistência e ritmo próprio.',
  },
  {
    icon: RefreshCw,
    title: 'Frequência',
    body: 'A frequência das sessões é definida conforme as necessidades e possibilidades de cada paciente, em diálogo com a analista. A regularidade é elemento fundamental do trabalho.',
  },
  {
    icon: Lock,
    title: 'Sigilo Profissional',
    body: 'O sigilo é um princípio ético inegociável. Tudo o que é compartilhado no espaço analítico permanece absolutamente confidencial, garantindo um ambiente de plena confiança.',
  },
];

export default function Services() {
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
    <section id="atendimento" className="py-28 px-6" style={{ background: 'var(--color-offwhite)' }}>
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
            Prática Clínica
          </p>
          <h2
            className="section-title mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
          >
            Atendimento
          </h2>
          <div className="gold-divider-lg mx-auto mb-6" />
          <p
            className="font-sans mx-auto"
            style={{
              color: 'var(--color-text)',
              fontWeight: 300,
              fontSize: '0.93rem',
              lineHeight: 1.85,
              maxWidth: '480px',
              opacity: 0.8,
            }}
          >
            Para saber sobre disponibilidade e honorários, entre em contato diretamente. O atendimento é personalizado e confidencial.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                ref={el => { refs.current[i + 1] = el; }}
                className="fade-in card-elegant p-8 flex flex-col"
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <div
                  className="mb-6 flex items-center justify-center w-12 h-12 rounded-full"
                  style={{ background: 'rgba(58,82,50,0.08)' }}
                >
                  <Icon size={20} style={{ color: 'var(--color-moss)' }} />
                </div>
                <h3
                  className="font-serif text-lg mb-4"
                  style={{ color: 'var(--color-moss)', fontWeight: 500 }}
                >
                  {card.title}
                </h3>
                <div
                  className="w-8 mb-4"
                  style={{ height: '1px', background: 'rgba(184,149,42,0.4)' }}
                />
                <p
                  className="font-sans text-sm flex-1"
                  style={{ color: 'var(--color-text)', fontWeight: 300, lineHeight: 1.85, opacity: 0.8 }}
                >
                  {card.body}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div
          ref={el => { refs.current[5] = el; }}
          className="fade-in text-center mt-16"
        >
          <button
            onClick={() => document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-elegant"
          >
            Agendar uma conversa
          </button>
        </div>
      </div>
    </section>
  );
}
