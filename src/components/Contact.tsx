import { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, Send } from 'lucide-react';

interface FormData {
  name: string;
  phone: string;
  city: string;
  message: string;
}

const WHATSAPP_NUMBER = '5522981235857';

function buildWhatsAppURL(data: FormData): string {
  const text = `Olá, Victória! Meu nome é ${data.name}.

📱 Meu número: ${data.phone}
📍 Cidade/Estado: ${data.city}

💬 ${data.message}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

const inputClass = `w-full bg-white border font-sans text-sm py-3 px-4 rounded-none transition-all duration-200`;
const inputStyle = {
  borderColor: '#D4DFD0',
  color: 'var(--color-text)',
  fontWeight: 300,
  outline: 'none',
};

export default function Contact() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({ name: '', phone: '', city: '', message: '' });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const validateStep1 = () => {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = 'Por favor, informe seu nome.';
    if (!form.phone.trim()) e.phone = 'Por favor, informe seu WhatsApp.';
    if (!form.city.trim()) e.city = 'Por favor, informe sua cidade.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Partial<FormData> = {};
    if (!form.message.trim()) e.message = 'Por favor, escreva uma breve mensagem.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) {
      setStep(3);
      window.open(buildWhatsAppURL(form), '_blank', 'noopener,noreferrer');
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep(s => s - 1);
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
  };

  const stepLabel = ['Seus dados', 'Sua mensagem', 'Confirmação'];

  return (
    <section
      id="contato"
      className="py-28 px-6"
      style={{ background: 'linear-gradient(180deg, #F4EFE5 0%, #EDE5D5 100%)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div ref={sectionRef} className="fade-in">
          {/* Header */}
          <div className="text-center mb-16">
            <p
              className="font-sans text-xs tracking-[0.25em] uppercase mb-4"
              style={{ color: 'var(--color-gold)' }}
            >
              Contato
            </p>
            <h2
              className="section-title mb-4"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
            >
              Agende sua Consulta
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
                opacity: 0.75,
              }}
            >
              Preencha o formulário abaixo e Victória entrará em contato para agendar sua sessão inicial.
            </p>
          </div>

          <div className="max-w-xl mx-auto">
            {/* Step indicators */}
            <div className="flex items-center justify-center gap-4 mb-10">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300"
                      style={{
                        background: step >= s ? 'var(--color-moss)' : 'transparent',
                        border: `1px solid ${step >= s ? 'var(--color-moss)' : 'rgba(58,82,50,0.3)'}`,
                      }}
                    >
                      {step > s ? (
                        <CheckCircle size={14} style={{ color: '#F4EFE5' }} />
                      ) : (
                        <span
                          className="font-sans text-xs"
                          style={{
                            color: step === s ? '#F4EFE5' : 'rgba(58,82,50,0.4)',
                            fontWeight: 500,
                          }}
                        >
                          {s}
                        </span>
                      )}
                    </div>
                    <span
                      className="font-sans text-xs tracking-wide"
                      style={{
                        color: step === s ? 'var(--color-moss)' : 'rgba(58,82,50,0.4)',
                        fontWeight: step === s ? 500 : 300,
                        fontSize: '0.65rem',
                      }}
                    >
                      {stepLabel[s - 1]}
                    </span>
                  </div>
                  {s < 3 && (
                    <div
                      className="w-12 mb-4"
                      style={{ height: '1px', background: step > s ? 'var(--color-moss)' : 'rgba(58,82,50,0.2)' }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Form card */}
            <div
              className="p-10"
              style={{
                background: '#FDFCF9',
                border: '1px solid rgba(58,82,50,0.12)',
                boxShadow: '0 4px 40px rgba(58,82,50,0.06)',
              }}
            >
              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-5">
                  <h3
                    className="font-serif text-xl mb-6"
                    style={{ color: 'var(--color-moss)', fontWeight: 500 }}
                  >
                    Conte-nos sobre você
                  </h3>

                  <div>
                    <label
                      className="font-sans text-xs tracking-widest uppercase block mb-2"
                      style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}
                    >
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="Seu nome completo"
                      className={inputClass}
                      style={inputStyle}
                    />
                    {errors.name && (
                      <p className="font-sans text-xs mt-1" style={{ color: '#C0392B' }}>{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      className="font-sans text-xs tracking-widest uppercase block mb-2"
                      style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}
                    >
                      WhatsApp *
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                      placeholder="(DD) 9 0000-0000"
                      className={inputClass}
                      style={inputStyle}
                    />
                    {errors.phone && (
                      <p className="font-sans text-xs mt-1" style={{ color: '#C0392B' }}>{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label
                      className="font-sans text-xs tracking-widest uppercase block mb-2"
                      style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}
                    >
                      Cidade / Estado *
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={e => handleChange('city', e.target.value)}
                      placeholder="Ex: Rio de Janeiro / RJ"
                      className={inputClass}
                      style={inputStyle}
                    />
                    {errors.city && (
                      <p className="font-sans text-xs mt-1" style={{ color: '#C0392B' }}>{errors.city}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div>
                  <h3
                    className="font-serif text-xl mb-2"
                    style={{ color: 'var(--color-moss)', fontWeight: 500 }}
                  >
                    O que te trouxe até aqui?
                  </h3>
                  <p
                    className="font-sans text-sm mb-6"
                    style={{ color: 'var(--color-text-muted)', fontWeight: 300 }}
                  >
                    Compartilhe brevemente o que te motivou a buscar atendimento. Não precisa ser longo.
                  </p>
                  <textarea
                    value={form.message}
                    onChange={e => handleChange('message', e.target.value)}
                    placeholder="Escreva livremente..."
                    rows={6}
                    className={inputClass}
                    style={{ ...inputStyle, resize: 'none' }}
                  />
                  {errors.message && (
                    <p className="font-sans text-xs mt-1" style={{ color: '#C0392B' }}>{errors.message}</p>
                  )}
                </div>
              )}

              {/* Step 3 — Confirmation */}
              {step === 3 && (
                <div className="text-center py-6">
                  <div
                    className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-6"
                    style={{ background: 'rgba(58,82,50,0.08)' }}
                  >
                    <CheckCircle size={32} style={{ color: 'var(--color-moss)' }} />
                  </div>
                  <h3
                    className="font-serif text-2xl mb-4"
                    style={{ color: 'var(--color-moss)', fontWeight: 400 }}
                  >
                    Mensagem enviada!
                  </h3>
                  <div className="gold-divider mx-auto mb-6" />
                  <p
                    className="font-sans mb-8"
                    style={{
                      color: 'var(--color-text)',
                      fontWeight: 300,
                      fontSize: '0.93rem',
                      lineHeight: 1.85,
                      opacity: 0.8,
                    }}
                  >
                    Em breve Victória entrará em contato com você.
                  </p>
                  <p
                    className="font-sans text-sm mb-8"
                    style={{ color: 'var(--color-text-muted)', fontWeight: 300, lineHeight: 1.7 }}
                  >
                    Seu WhatsApp foi aberto com a mensagem já formatada. Caso não tenha aberto,{' '}
                    <a
                      href={buildWhatsAppURL(form)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-moss)', textDecoration: 'underline' }}
                    >
                      clique aqui
                    </a>.
                  </p>
                  <button
                    onClick={() => { setStep(1); setForm({ name: '', phone: '', city: '', message: '' }); }}
                    className="font-sans text-xs tracking-widest uppercase"
                    style={{ color: 'var(--color-text-muted)', fontWeight: 500, textDecoration: 'underline' }}
                  >
                    Enviar outro contato
                  </button>
                </div>
              )}

              {/* Navigation buttons */}
              {step < 3 && (
                <div className={`flex mt-8 ${step === 1 ? 'justify-end' : 'justify-between'}`}>
                  {step > 1 && (
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-2 font-sans text-xs tracking-widest uppercase"
                      style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}
                    >
                      <ChevronLeft size={14} />
                      Voltar
                    </button>
                  )}
                  <button onClick={handleNext} className="btn-moss flex items-center gap-2">
                    {step === 2 ? (
                      <>
                        <Send size={13} />
                        Enviar via WhatsApp
                      </>
                    ) : (
                      <>
                        Continuar
                        <ChevronRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
