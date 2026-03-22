import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import logoErgon from '@/assets/logo-ergon.png';
import heroImg1 from '@/assets/landing-hero-1.jpg';
import heroImg2 from '@/assets/landing-hero-2.jpg';
import heroImg3 from '@/assets/landing-hero-3.jpg';

/* ── animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

function Section({ children, className = '', id = '' }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <section ref={ref} id={id} className={className}>
      <div style={{ opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.22,1,0.36,1)' }}>
        {children}
      </div>
    </section>
  );
}

/* ── data ── */
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
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  /* Simulator */
  const [colaboradores, setColaboradores] = useState(50);
  const recommendedPlan = planFromSlider(colaboradores);

  /* Contact form */
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
         SEÇÃO 1 — HERO (IMPACTO)
      ══════════════════════════════════════════════════════════════ */}
      <div ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <img src={heroImg1} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/40" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-teal-50 text-teal-700 border border-teal-200 mb-6">
                Saúde Ocupacional com Evidências
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-gray-900 mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Você não precisa de mais um sistema.
              <br />
              <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                Precisa de evidência.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-lg text-gray-500 max-w-lg leading-relaxed mb-10"
            >
              Sua empresa pode até fazer o certo. Mas sem prova, continua exposta.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href="#contato"
                className="px-8 py-4 rounded-full text-base font-semibold bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:from-teal-400 hover:to-blue-500 transition-all duration-500 shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40"
              >
                Solicitar demonstração
              </a>
              <a
                href="#solucao"
                className="px-8 py-4 rounded-full text-base font-semibold border-2 border-gray-200 text-gray-700 hover:border-teal-300 hover:text-teal-700 transition-all duration-300"
              >
                Como funciona
              </a>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-5 h-9 rounded-full border-2 border-gray-300 flex items-start justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-teal-500" />
        </motion.div>
      </div>

      {/* ── PAIN POINTS ── */}
      <Section id="problema" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-teal-600 font-semibold">O problema</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              O que acontece quando não há evidências?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {painPoints.map((item, i) => (
              <motion.div
                key={item.title} custom={i}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={fadeUp}
                className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-red-200 transition-all duration-500 group"
              >
                <div className="w-12 h-1 rounded-full bg-red-400 mb-6 group-hover:w-20 transition-all duration-500" />
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-red-600 transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
         SEÇÃO 2 — SOLUÇÃO
      ══════════════════════════════════════════════════════════════ */}
      <Section id="solucao" className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg2} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c1829]/90 to-[#0c1829]/95" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-xs uppercase tracking-widest text-teal-400 font-semibold">Como funciona</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 text-white leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Controle, monitoramento e evidência
              <br />
              <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                em um único sistema.
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {solutionSteps.map((step, i) => (
              <motion.div
                key={step.num} custom={i}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={fadeUp}
                className="p-8 rounded-2xl backdrop-blur-lg bg-white/5 border border-white/10 hover:border-teal-400/30 hover:bg-teal-400/5 transition-all duration-500 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-bold text-teal-400/30 group-hover:text-teal-400/60 transition-colors" style={{ fontFamily: "'Space Grotesk'" }}>
                    {step.num}
                  </span>
                  <h3 className="text-lg font-semibold text-white group-hover:text-teal-300 transition-colors" style={{ fontFamily: "'Space Grotesk'" }}>
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed pl-14">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
         SEÇÃO 3 — PLANOS + SIMULADOR
      ══════════════════════════════════════════════════════════════ */}
      <Section id="planos" className="py-32 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-widest text-teal-600 font-semibold">Planos</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 text-gray-900 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Mais que gestão.
              <br />
              <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                Proteção real.
              </span>
            </h2>
          </div>

          {/* Simulator */}
          <div className="max-w-xl mx-auto mb-20 p-8 rounded-2xl bg-white border border-gray-100 shadow-lg">
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

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name} custom={i}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={fadeUp}
                className={`relative p-8 rounded-2xl border transition-all duration-500 h-full flex flex-col ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-teal-50 to-blue-50 border-teal-300 shadow-xl shadow-teal-500/10'
                    : plan.name === recommendedPlan
                      ? 'bg-white border-teal-200 shadow-lg'
                      : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-gradient-to-r from-teal-500 to-blue-600 text-white">
                    Recomendado
                  </div>
                )}
                <h3 className="text-lg font-bold tracking-wider text-gray-900 mb-1" style={{ fontFamily: "'Space Grotesk'" }}>
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-500 mb-6">{plan.description}</p>
                <ul className="space-y-3 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="text-sm text-gray-600 flex items-start gap-3">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contato"
                  className={`mt-8 block w-full py-3.5 rounded-full text-sm font-semibold text-center transition-all duration-300 ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:from-teal-400 hover:to-blue-500 shadow-lg shadow-teal-500/20'
                      : 'bg-gray-100 text-gray-700 hover:bg-teal-50 hover:text-teal-700 border border-gray-200'
                  }`}
                >
                  Solicitar demonstração
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
         SEÇÃO 4 — CONTATO
      ══════════════════════════════════════════════════════════════ */}
      <Section id="contato" className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg3} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c1829]/90 to-[#0c1829]/95" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: CTA */}
            <div>
              <span className="text-xs uppercase tracking-widest text-teal-400 font-semibold">Contato</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 text-white leading-tight mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Pare de apenas fazer.
                <br />
                <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                  Comece a provar.
                </span>
              </h2>
              <p className="text-white/50 text-lg leading-relaxed">
                Preencha o formulário e nossa equipe entrará em contato para apresentar o ERGON de forma personalizada para sua empresa.
              </p>
            </div>

            {/* Right: Form */}
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
                    <input
                      type="text" required placeholder="Seu nome"
                      value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-teal-400/50 transition-colors"
                    />
                    <input
                      type="text" required placeholder="Nome da empresa"
                      value={form.empresa} onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-teal-400/50 transition-colors"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="email" required placeholder="E-mail"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-teal-400/50 transition-colors"
                    />
                    <input
                      type="tel" placeholder="Telefone"
                      value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-teal-400/50 transition-colors"
                    />
                  </div>
                  <textarea
                    placeholder="Sua mensagem (opcional)" rows={3}
                    value={form.mensagem} onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-teal-400/50 transition-colors resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-4 rounded-full text-base font-semibold bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:from-teal-400 hover:to-blue-500 transition-all duration-500 shadow-xl shadow-teal-500/20"
                  >
                    Solicitar demonstração
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </Section>

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
