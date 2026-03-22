import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import logoErgon from '@/assets/logo-ergon.png';
import heroImg1 from '@/assets/landing-hero-1.jpg';
import heroImg2 from '@/assets/landing-hero-2.jpg';
import heroImg3 from '@/assets/landing-hero-3.jpg';

/* ── Animated text block that moves on scroll ── */
function ScrollText({
  children,
  className = '',
  direction = 'up',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right' | 'scale';
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-120px' });

  const variants: Record<string, { hidden: object; visible: object }> = {
    up: {
      hidden: { opacity: 0, y: 80 },
      visible: { opacity: 1, y: 0 },
    },
    left: {
      hidden: { opacity: 0, x: -80 },
      visible: { opacity: 1, x: 0 },
    },
    right: {
      hidden: { opacity: 0, x: 80 },
      visible: { opacity: 1, x: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.85 },
      visible: { opacity: 1, scale: 1 },
    },
  };

  const v = variants[direction];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...(direction === 'up' ? { y: 80 } : direction === 'left' ? { x: -80 } : direction === 'right' ? { x: 80 } : { scale: 0.85 }) }}
      animate={inView
        ? { opacity: 1, y: 0, x: 0, scale: 1 }
        : { opacity: 0, ...(direction === 'up' ? { y: 80 } : direction === 'left' ? { x: -80 } : direction === 'right' ? { x: 80 } : { scale: 0.85 }) }
      }
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Parallax image background ── */
function ParallaxBg({ src, speed = 0.3, overlay }: { src: string; speed?: number; overlay: string }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${speed * 100}%`, `${speed * 100}%`]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.img src={src} alt="" style={{ y }} className="w-full h-[140%] object-cover absolute -top-[20%]" />
      <div className={`absolute inset-0 ${overlay}`} />
    </div>
  );
}

/* ── Data ── */
const painPoints = [
  { title: 'Risco invisível', text: 'Riscos ergonômicos e psicossociais que ninguém documenta. Até virar processo.' },
  { title: 'Falta de controle', text: 'Dados dispersos, planilhas desatualizadas, histórico perdido entre trocas de equipe.' },
  { title: 'Exposição jurídica', text: 'Sem evidência estruturada, qualquer fiscalização ou ação trabalhista encontra brecha.' },
];

const solutionSteps = [
  { num: '01', title: 'Coleta estruturada', text: 'AEP, AET, exames, checklists e dados organizados desde a origem, prontos para auditoria.' },
  { num: '02', title: 'Processamento inteligente', text: 'Análise de risco automática, score calculado, identificação de falhas em tempo real.' },
  { num: '03', title: 'Evidência contínua', text: 'Histórico completo, rastreabilidade total, documentação auditável a qualquer momento.' },
  { num: '04', title: 'Ação e prevenção', text: 'Planos de ação automáticos, alertas inteligentes, reavaliação programada.' },
];

const plans = [
  {
    name: 'ESSENCIAL', description: 'Organização da saúde ocupacional',
    features: ['Controle inicial de dados e registros', 'Cadastro de empresas e colaboradores', 'Avaliações AEP básicas', 'Relatórios padrão'],
    highlight: false,
  },
  {
    name: 'PROFISSIONAL', description: 'Gestão de risco e monitoramento contínuo',
    features: ['Tudo do Essencial', 'AET, ARP e checklists completos', 'Indicadores e dashboard', 'Alertas automáticos', 'Planos de ação integrados'],
    highlight: true,
  },
  {
    name: 'ENTERPRISE', description: 'Proteção jurídica completa',
    features: ['Tudo do Profissional', 'Evidência contínua e rastreabilidade total', 'Gestão estratégica da saúde ocupacional', 'PCMSO integrado', 'Suporte prioritário e personalização'],
    highlight: false,
  },
];

const planFromSlider = (v: number) => {
  if (v <= 50) return 'ESSENCIAL';
  if (v <= 200) return 'PROFISSIONAL';
  return 'ENTERPRISE';
};

const LandingPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroScroll, [0, 1], ['0%', '40%']);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);

  const [colaboradores, setColaboradores] = useState(50);
  const recommendedPlan = planFromSlider(colaboradores);

  const [form, setForm] = useState({ nome: '', empresa: '', email: '', telefone: '', mensagem: '' });
  const [sent, setSent] = useState(false);
  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="bg-white text-gray-900 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <img src={logoErgon} alt="Ergon" className="h-10" />
          <div className="hidden md:flex items-center gap-8">
            <a href="#problema" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">Problema</a>
            <a href="#solucao" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">Solução</a>
            <a href="#planos" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">Planos</a>
            <a href="#contato" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">Contato</a>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:from-teal-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-teal-500/20"
          >
            Acessar plataforma
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════
         HERO
      ══════════════════════════════════════════════════════════════ */}
      <div ref={heroRef} className="relative min-h-[110vh] flex items-center overflow-hidden">
        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0">
          <img src={heroImg1} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/30" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
          <div className="max-w-2xl">
            <ScrollText direction="left" delay={0.1}>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-teal-50 text-teal-700 border border-teal-200 mb-6">
                Saúde Ocupacional com Evidências
              </span>
            </ScrollText>

            <ScrollText direction="up" delay={0.3}>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-gray-900 mb-6"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Você não precisa de mais um sistema.
                <br />
                <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Precisa de evidência.
                </span>
              </h1>
            </ScrollText>

            <ScrollText direction="up" delay={0.5}>
              <p className="text-lg text-gray-500 max-w-lg leading-relaxed mb-10">
                Sua empresa pode até fazer o certo. Mas sem prova, continua exposta.
              </p>
            </ScrollText>

            <ScrollText direction="up" delay={0.7}>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#contato"
                  className="px-8 py-4 rounded-full text-base font-semibold bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:from-teal-400 hover:to-blue-500 transition-all duration-500 shadow-xl shadow-teal-500/25"
                >
                  Solicitar demonstração
                </a>
                <a
                  href="#solucao"
                  className="px-8 py-4 rounded-full text-base font-semibold border-2 border-gray-200 text-gray-700 hover:border-teal-300 hover:text-teal-700 transition-all duration-300"
                >
                  Como funciona
                </a>
              </div>
            </ScrollText>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-5 h-9 rounded-full border-2 border-gray-300 flex items-start justify-center pt-2 z-10"
        >
          <div className="w-1 h-2 rounded-full bg-teal-500" />
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
         PROBLEMA — texto flutuante sem cards
      ══════════════════════════════════════════════════════════════ */}
      <section id="problema" className="py-32 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <ScrollText direction="up">
            <p className="text-xs uppercase tracking-widest text-teal-600 font-semibold text-center mb-3">O problema</p>
          </ScrollText>
          <ScrollText direction="up" delay={0.1}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-900 mb-24 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              O que acontece quando
              <br />
              não há evidências?
            </h2>
          </ScrollText>

          <div className="space-y-32">
            {painPoints.map((item, i) => (
              <ScrollText
                key={item.title}
                direction={i % 2 === 0 ? 'left' : 'right'}
                delay={0.1}
              >
                <div className={`max-w-xl ${i % 2 !== 0 ? 'ml-auto text-right' : ''}`}>
                  <div className={`w-16 h-1 rounded-full bg-red-400 mb-6 ${i % 2 !== 0 ? 'ml-auto' : ''}`} />
                  <h3
                    className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-lg text-gray-500 leading-relaxed">{item.text}</p>
                </div>
              </ScrollText>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
         SOLUÇÃO — textos que deslizam sobre imagem parallax
      ══════════════════════════════════════════════════════════════ */}
      <section id="solucao" className="relative py-40 overflow-hidden">
        <ParallaxBg src={heroImg2} speed={0.2} overlay="bg-gradient-to-b from-[#0c1829]/90 to-[#0c1829]/95" />

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <ScrollText direction="scale">
            <p className="text-xs uppercase tracking-widest text-teal-400 font-semibold text-center mb-4">Como funciona</p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-white mb-6 leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Controle, monitoramento e evidência
            </h2>
            <p className="text-center text-xl font-semibold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent mb-32" style={{ fontFamily: "'Space Grotesk'" }}>
              em um único sistema.
            </p>
          </ScrollText>

          <div className="space-y-40">
            {solutionSteps.map((step, i) => (
              <ScrollText
                key={step.num}
                direction={i % 2 === 0 ? 'left' : 'right'}
                delay={0.05}
              >
                <div className={`max-w-lg ${i % 2 !== 0 ? 'ml-auto text-right' : ''}`}>
                  <span
                    className="text-6xl sm:text-7xl font-bold text-teal-400/15 block mb-2"
                    style={{ fontFamily: "'Space Grotesk'" }}
                  >
                    {step.num}
                  </span>
                  <h3
                    className="text-2xl sm:text-3xl font-bold text-white mb-4"
                    style={{ fontFamily: "'Space Grotesk'" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-base text-white/50 leading-relaxed">{step.text}</p>
                </div>
              </ScrollText>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
         PLANOS + SIMULADOR
      ══════════════════════════════════════════════════════════════ */}
      <section id="planos" className="py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollText direction="up">
            <p className="text-xs uppercase tracking-widest text-teal-600 font-semibold text-center mb-3">Planos</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-900 leading-tight mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Mais que gestão.
            </h2>
            <p className="text-center text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-6" style={{ fontFamily: "'Space Grotesk'" }}>
              Proteção real.
            </p>
          </ScrollText>

          {/* Simulator */}
          <ScrollText direction="scale" delay={0.2}>
            <div className="max-w-xl mx-auto mb-20 p-8 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2 text-center" style={{ fontFamily: "'Space Grotesk'" }}>
                Simulador de plano
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">Quantos colaboradores sua empresa possui?</p>
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="range" min={1} max={500} value={colaboradores}
                  onChange={e => setColaboradores(Number(e.target.value))}
                  className="flex-1 h-2 rounded-full appearance-none bg-gray-200 accent-teal-500 cursor-pointer"
                />
                <span className="text-2xl font-bold text-teal-600 min-w-[4rem] text-right" style={{ fontFamily: "'Space Grotesk'" }}>
                  {colaboradores}
                </span>
              </div>
              <p className="text-center text-sm text-gray-500">
                Plano recomendado:{' '}
                <span className="font-bold text-teal-700">{recommendedPlan}</span>
              </p>
            </div>
          </ScrollText>

          {/* Plans as flowing text blocks, not cards */}
          <div className="space-y-16 max-w-3xl mx-auto">
            {plans.map((plan, i) => (
              <ScrollText key={plan.name} direction={i % 2 === 0 ? 'left' : 'right'} delay={0.1}>
                <div className={`flex flex-col ${i % 2 !== 0 ? 'items-end text-right' : ''}`}>
                  {plan.highlight && (
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-gradient-to-r from-teal-500 to-blue-600 text-white mb-3 w-fit">
                      Recomendado
                    </span>
                  )}
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Space Grotesk'" }}>
                    {plan.name}
                  </h3>
                  <p className="text-base text-gray-500 mb-4">{plan.description}</p>
                  <ul className={`space-y-2 mb-6 ${i % 2 !== 0 ? 'text-right' : ''}`}>
                    {plan.features.map(f => (
                      <li key={f} className={`text-sm text-gray-600 flex items-center gap-3 ${i % 2 !== 0 ? 'flex-row-reverse' : ''}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contato"
                    className={`inline-block px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 w-fit ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg shadow-teal-500/20'
                        : 'bg-gray-100 text-gray-700 hover:bg-teal-50 hover:text-teal-700 border border-gray-200'
                    }`}
                  >
                    Solicitar demonstração
                  </a>
                  {i < plans.length - 1 && (
                    <div className={`mt-16 w-24 h-px bg-gray-200 ${i % 2 !== 0 ? 'ml-auto' : ''}`} />
                  )}
                </div>
              </ScrollText>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
         CONTATO
      ══════════════════════════════════════════════════════════════ */}
      <section id="contato" className="relative py-32 overflow-hidden">
        <ParallaxBg src={heroImg3} speed={0.15} overlay="bg-gradient-to-b from-[#0c1829]/90 to-[#0c1829]/95" />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <ScrollText direction="left">
                <p className="text-xs uppercase tracking-widest text-teal-400 font-semibold mb-4">Contato</p>
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-6"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Pare de apenas fazer.
                </h2>
              </ScrollText>
              <ScrollText direction="left" delay={0.15}>
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent mb-8" style={{ fontFamily: "'Space Grotesk'" }}>
                  Comece a provar.
                </p>
                <p className="text-white/50 text-lg leading-relaxed">
                  Preencha o formulário e nossa equipe entrará em contato para apresentar o ERGON de forma personalizada para sua empresa.
                </p>
              </ScrollText>
            </div>

            <ScrollText direction="right" delay={0.2}>
              <form onSubmit={handleContact} className="p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/10 space-y-5">
                {sent ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-4">
                      <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-lg font-bold">✓</div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk'" }}>Mensagem enviada!</h3>
                    <p className="text-white/50 text-sm">Entraremos em contato em breve.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <input type="text" required placeholder="Seu nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-teal-400/50 transition-colors" />
                      <input type="text" required placeholder="Nome da empresa" value={form.empresa} onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-teal-400/50 transition-colors" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <input type="email" required placeholder="E-mail" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-teal-400/50 transition-colors" />
                      <input type="tel" placeholder="Telefone" value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-teal-400/50 transition-colors" />
                    </div>
                    <textarea placeholder="Sua mensagem (opcional)" rows={3} value={form.mensagem} onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-teal-400/50 transition-colors resize-none" />
                    <button type="submit"
                      className="w-full py-4 rounded-full text-base font-semibold bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:from-teal-400 hover:to-blue-500 transition-all duration-500 shadow-xl shadow-teal-500/20">
                      Solicitar demonstração
                    </button>
                  </>
                )}
              </form>
            </ScrollText>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <img src={logoErgon} alt="Ergon" className="h-8 brightness-0 invert opacity-60" />
          <p className="text-sm text-gray-500">Saúde Ocupacional com Evidências</p>
          <span className="text-xs text-gray-600">{new Date().getFullYear()} Ergon. Todos os direitos reservados.</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
