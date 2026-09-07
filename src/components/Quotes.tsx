import { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';

const SUBSTACK_URL = 'https://psivictoriapaes.substack.com';

// Placeholders exibidos enquanto o feed carrega ou quando não há posts
// disponíveis (feed vazio/indisponível). Nunca inventamos conteúdo aqui.
const FALLBACK_QUOTES = [
  { quote: '[Citação autoral 1]', excerpt: 'Em breve', tag: 'Substack' },
  { quote: '[Citação autoral 2]', excerpt: 'Em breve', tag: 'Substack' },
  { quote: '[Citação autoral 3]', excerpt: 'Em breve', tag: 'Substack' },
];

interface SubstackPost {
  title: string;
  link: string;
  pubDate: string;
  excerpt: string;
  type?: 'post' | 'note';
}

function formatDate(pubDate: string): string {
  const date = new Date(pubDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

// Conteúdo interno do card, compartilhado entre o post real (link clicável)
// e o placeholder "Em breve" — mantém o visual original (aspas, cores, layout).
function QuoteCardBody({
  text,
  muted,
  rightLabel,
}: {
  text: string;
  muted: boolean;
  rightLabel: string;
}) {
  return (
    <>
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
        <p
          className="font-serif flex-1 mb-6"
          style={{
            color: muted ? 'rgba(244,239,229,0.3)' : 'rgba(244,239,229,0.9)',
            fontWeight: 300,
            fontSize: '1.1rem',
            lineHeight: 1.75,
            fontStyle: muted ? 'normal' : 'italic',
          }}
        >
          {text}
        </p>

        <div className="flex items-center justify-between">
          <span
            className="font-sans text-xs tracking-widest uppercase"
            style={{ color: 'rgba(196,164,90,0.6)', fontWeight: 400 }}
          >
            Substack
          </span>
          <span
            className="font-serif text-xs italic"
            style={{ color: 'rgba(244,239,229,0.35)' }}
          >
            {rightLabel}
          </span>
        </div>
      </div>
    </>
  );
}

export default function Quotes() {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [posts, setPosts] = useState<SubstackPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/substack')
      .then(res => res.json())
      .then((data: { posts?: SubstackPost[] }) => {
        if (!cancelled && Array.isArray(data.posts)) {
          setPosts(data.posts);
        }
      })
      .catch(() => {
        // Feed indisponível: mantém a lista vazia e cai no fallback "Em breve".
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    refs.current.forEach(r => r && observer.observe(r));
    return () => observer.disconnect();
  }, [posts]);

  const hasPosts = posts.length > 0;

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

        {/* Loading discreto */}
        {loading && (
          <p
            className="font-sans text-xs text-center mb-6"
            style={{ color: 'rgba(196,164,90,0.5)' }}
          >
            Carregando publicações…
          </p>
        )}

        {/* Quote cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {(hasPosts ? posts : FALLBACK_QUOTES).map((item, i) => {
            const cardStyle = {
              background: 'rgba(244,239,229,0.06)',
              border: '1px solid rgba(196,164,90,0.2)',
              borderRadius: '2px',
              transitionDelay: `${i * 0.1}s`,
              backdropFilter: 'blur(4px)',
            };

            if (hasPosts) {
              const post = item as SubstackPost;
              return (
                <a
                  key={post.link || i}
                  ref={el => { refs.current[i + 1] = el; }}
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fade-in flex flex-col p-10 relative cursor-pointer"
                  style={cardStyle}
                >
                  <QuoteCardBody
                    text={post.excerpt || post.title || 'Ler no Substack'}
                    muted={false}
                    rightLabel={formatDate(post.pubDate) || 'Victória P. Paes'}
                  />
                </a>
              );
            }

            return (
              <div
                key={i}
                ref={el => { refs.current[i + 1] = el; }}
                className="fade-in flex flex-col p-10 relative"
                style={cardStyle}
              >
                <QuoteCardBody text="Em breve..." muted rightLabel="Victória P. Paes" />
              </div>
            );
          })}
        </div>

        {/* Substack link */}
        <div
          ref={el => { refs.current[4] = el; }}
          className="fade-in text-center"
        >
          <a
            href={SUBSTACK_URL}
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
