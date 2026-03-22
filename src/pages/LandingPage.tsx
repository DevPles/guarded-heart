import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import heroImg1 from '@/assets/landing-hero-1.jpg';
import heroImg2 from '@/assets/landing-hero-2.jpg';
import heroImg3 from '@/assets/landing-hero-3.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <div ref={ref} className={className}>
      {isInView ? children : <div style={{ opacity: 0 }}>{children}</div>}
    </div>
  );
}

const painPoints = [
  {
    title: 'Risco invisivel',
    text: 'Riscos ergonomicos e psicossociais que ninguem documenta — ate virar processo.',
  },
  {
    title: 'Falta de controle',
    text: 'Dados dispersos, planilhas desatualizadas, historico perdido entre trocas de equipe.',
  },
  {
    title: 'Exposicao juridica',
    text: 'Sem evidencia estruturada, qualquer fiscalizacao ou acao trabalhista encontra brecha.',
  },
];

const solutionBlocks = [
  {
    title: 'Coleta estruturada',
    text: 'AEP, AET, exames, checklists — dados organizados desde a origem, prontos para auditoria.',
  },
  {
    title: 'Processamento inteligente',
    text: 'Analise de risco automatica, score calculado, identificacao de falhas em tempo real.',
  },
  {
    title: 'Evidencia continua',
    text: 'Historico completo, rastreabilidade total, documentacao auditavel a qualquer momento.',
  },
  {
    title: 'Acao e prevencao',
    text: 'Planos de acao automaticos, alertas inteligentes, reavaliacao programada.',
  },
];

const plans = [
  {
    name: 'ESSENCIAL',
    description: 'Organizacao da saude ocupacional',
    features: [
      'Controle inicial de dados e registros',
      'Cadastro de empresas e colaboradores',
      'Avaliacoes AEP basicas',
      'Relatorios padrao',
    ],
    highlight: false,
  },
  {
    name: 'PROFISSIONAL',
    description: 'Gestao de risco e monitoramento continuo',
    features: [
      'Tudo do Essencial',
      'AET, ARP e checklists completos',
      'Indicadores e dashboard',
      'Alertas automaticos',
      'Planos de acao integrados',
    ],
    highlight: true,
  },
  {
    name: 'ENTERPRISE',
    description: 'Protecao juridica completa',
    features: [
      'Tudo do Profissional',
      'Evidencia continua e rastreabilidade total',
      'Gestao estrategica da saude ocupacional',
      'PCMSO integrado',
      'Suporte prioritario e personalizacao',
    ],
    highlight: false,
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0a0e17] text-white overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0e17]/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            ERGON
          </span>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-full text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-300"
          >
            Acessar plataforma
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════
         SECAO 1 — IMPACTO
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={heroImg1} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e17]/80 via-[#0a0e17]/70 to-[#0a0e17]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e17]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-xs uppercase tracking-[0.35em] text-cyan-400/80 mb-8"
          >
            O primeiro ecossistema de saude ocupacional com evidencias
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Voce nao precisa de
            <br />
            mais um sistema.
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Precisa de evidencia.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-12"
          >
            Sua empresa pode ate fazer o certo.
            <br />
            Mas sem prova, continua exposta.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
            onClick={() => navigate('/login')}
            className="px-10 py-4 rounded-full text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-500 shadow-[0_0_40px_rgba(34,211,238,0.2)] hover:shadow-[0_0_60px_rgba(34,211,238,0.35)]"
          >
            Solicitar demonstracao
          </motion.button>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 rounded-full bg-white/40" />
        </motion.div>
      </section>

      {/* Pain points */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="grid md:grid-cols-3 gap-6">
              {painPoints.map((item, i) => (
                <motion.div
                  key={item.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-60px' }}
                  variants={fadeUp}
                  className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-red-500/20 hover:bg-red-500/[0.03] transition-all duration-500 group"
                >
                  <h3
                    className="text-xl font-semibold mb-3 text-white/90 group-hover:text-red-400 transition-colors duration-300"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-white/40 leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
         SECAO 2 — SOLUCAO
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img src={heroImg2} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0a0e17]/85" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <AnimatedSection>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="text-center mb-20"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/60 mb-4">Como funciona</p>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight max-w-3xl mx-auto"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Controle, monitoramento e evidencia —{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  em um unico sistema.
                </span>
              </h2>
            </motion.div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6">
            {solutionBlocks.map((block, i) => (
              <AnimatedSection key={block.title}>
                <motion.div
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={fadeUp}
                  className="p-8 rounded-2xl backdrop-blur-lg bg-white/[0.04] border border-white/[0.08] hover:border-cyan-500/20 hover:bg-cyan-500/[0.04] transition-all duration-500 group h-full"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center text-sm font-bold text-cyan-400">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3
                      className="text-lg font-semibold text-white/90 group-hover:text-cyan-400 transition-colors"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {block.title}
                    </h3>
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed pl-14">{block.text}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
         SECAO 3 — DECISAO (PLANOS)
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg3} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0a0e17]/90" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <AnimatedSection>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="text-center mb-20"
            >
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Mais que gestao.
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Protecao real.
                </span>
              </h2>
            </motion.div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 mb-24">
            {plans.map((plan, i) => (
              <AnimatedSection key={plan.name}>
                <motion.div
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={scaleIn}
                  className={`relative p-8 rounded-2xl border transition-all duration-500 h-full flex flex-col ${
                    plan.highlight
                      ? 'bg-gradient-to-b from-cyan-500/[0.08] to-blue-600/[0.04] border-cyan-500/30 shadow-[0_0_60px_rgba(34,211,238,0.08)]'
                      : 'bg-white/[0.03] border-white/[0.06] hover:border-white/10'
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                      Recomendado
                    </div>
                  )}
                  <h3
                    className="text-lg font-bold tracking-wider mb-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-sm text-white/40 mb-6">{plan.description}</p>
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="text-sm text-white/50 flex items-start gap-3">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500/60 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate('/login')}
                    className={`mt-8 w-full py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_30px_rgba(34,211,238,0.15)]'
                        : 'bg-white/[0.06] hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    Solicitar demonstracao
                  </button>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>

          {/* CTA Final */}
          <AnimatedSection>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="text-center"
            >
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Pare de apenas fazer.
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Comece a provar.
                </span>
              </h2>
              <button
                onClick={() => navigate('/login')}
                className="px-12 py-4 rounded-full text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-500 shadow-[0_0_40px_rgba(34,211,238,0.2)] hover:shadow-[0_0_60px_rgba(34,211,238,0.35)]"
              >
                Solicitar demonstracao
              </button>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-white/30">ERGON — Saude Ocupacional com Evidencias</span>
          <span className="text-xs text-white/20">{new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
