import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Início', href: '#inicio' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Psicanálise', href: '#psicanalise' },
  { label: 'Atendimento', href: '#atendimento' },
  { label: 'Citações', href: '#citacoes' },
  { label: 'Contato', href: '#contato' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'navbar-glass py-3 shadow-sm' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo + Name */}
        <a
          href="#inicio"
          onClick={e => { e.preventDefault(); handleNavClick('#inicio'); }}
          className="flex items-center gap-4 group"
        >
          <img
            src="/images/logo.png"
            alt="Victória P. Paes — Logo"
            className="h-12 w-auto object-contain"
          />
          <div className="flex flex-col">
            <span
              className="font-serif text-2xl leading-tight tracking-wide"
              style={{ color: 'var(--color-moss)', fontWeight: 500 }}
            >
              Victória P. Paes
            </span>
            <span
              className="font-sans text-xs tracking-[0.2em] uppercase"
              style={{ color: 'var(--color-gold)', fontWeight: 400 }}
            >
              Psicanalista
            </span>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={e => { e.preventDefault(); handleNavClick(link.href); }}
              className="font-sans text-xs tracking-[0.12em] uppercase transition-colors duration-200 hover:text-gold-400"
              style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 transition-colors"
          style={{ color: 'var(--color-moss)' }}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-400 ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ background: 'rgba(249,246,240,0.97)', backdropFilter: 'blur(16px)' }}
      >
        <nav className="flex flex-col px-6 py-4 gap-5 border-t" style={{ borderColor: 'rgba(184,149,42,0.15)' }}>
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={e => { e.preventDefault(); handleNavClick(link.href); }}
              className="font-sans text-sm tracking-[0.12em] uppercase py-1"
              style={{ color: 'var(--color-moss)', fontWeight: 500 }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
