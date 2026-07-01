import { Instagram, MessageCircle } from 'lucide-react';

// Substack SVG icon
function SubstackIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
    </svg>
  );
}

const navLinks = [
  { label: 'Início', href: '#inicio' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Psicanálise', href: '#psicanalise' },
  { label: 'Atendimento', href: '#atendimento' },
  { label: 'Citações', href: '#citacoes' },
  { label: 'Contato', href: '#contato' },
];

const socials = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/psi.victoriapaes',
    icon: <Instagram size={18} />,
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/5522981235857',
    icon: <MessageCircle size={18} />,
  },
  {
    label: 'Substack',
    href: 'https://substack.com/@psivictoriapaes',
    icon: <SubstackIcon size={18} />,
  },
];

export default function Footer() {
  const handleNav = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer
      className="py-16 px-6"
      style={{ background: '#1F2E1B', borderTop: '1px solid rgba(196,164,90,0.15)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4 max-w-xs">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="Logo Victória P. Paes"
                className="h-10 w-auto object-contain"
                style={{ filter: 'brightness(0) invert(1) opacity(0.7)' }}
              />
              <div>
                <p
                  className="font-serif text-xl leading-tight"
                  style={{ color: '#EDE5D5', fontWeight: 400 }}
                >
                  Victória P. Paes
                </p>
                <p
                  className="font-sans text-xs tracking-[0.15em] uppercase"
                  style={{ color: 'rgba(196,164,90,0.7)', fontWeight: 400 }}
                >
                  Psicanalista
                </p>
              </div>
            </div>
            <p
              className="font-sans text-sm"
              style={{ color: 'rgba(237,229,213,0.5)', fontWeight: 300, lineHeight: 1.8 }}
            >
              Um espaço de escuta, profundidade e cuidado. Atendimento online.
            </p>
            <p
              className="font-sans text-xs tracking-[0.15em] uppercase"
              style={{ color: 'rgba(196,164,90,0.5)', fontWeight: 400 }}
            >
              CRP 05/68654
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p
              className="font-sans text-xs tracking-[0.2em] uppercase mb-5"
              style={{ color: 'rgba(196,164,90,0.6)', fontWeight: 500 }}
            >
              Navegação
            </p>
            <nav className="flex flex-col gap-3">
              {navLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={e => { e.preventDefault(); handleNav(link.href); }}
                  className="font-sans text-sm transition-colors duration-200"
                  style={{ color: 'rgba(237,229,213,0.55)', fontWeight: 300 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EDE5D5'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(237,229,213,0.55)'; }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Social */}
          <div>
            <p
              className="font-sans text-xs tracking-[0.2em] uppercase mb-5"
              style={{ color: 'rgba(196,164,90,0.6)', fontWeight: 500 }}
            >
              Redes Sociais
            </p>
            <div className="flex flex-col gap-4">
              {socials.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group transition-colors duration-200"
                  style={{ color: 'rgba(237,229,213,0.55)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(196,164,90,0.9)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(237,229,213,0.55)'; }}
                >
                  {s.icon}
                  <span className="font-sans text-sm" style={{ fontWeight: 300 }}>{s.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(196,164,90,0.2), transparent)',
            marginBottom: '24px',
          }}
        />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p
            className="font-sans text-xs"
            style={{ color: 'rgba(237,229,213,0.3)', fontWeight: 300 }}
          >
            © {new Date().getFullYear()} Victória P. Paes. Todos os direitos reservados.
          </p>
          <p
            className="font-sans text-xs tracking-wider"
            style={{ color: 'rgba(196,164,90,0.35)', fontWeight: 400 }}
          >
            CRP 05/68654
          </p>
        </div>
      </div>
    </footer>
  );
}
