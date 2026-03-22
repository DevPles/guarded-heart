import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronRight } from 'lucide-react';
import logoErgon from '@/assets/logo-ergon.png';
import heroImg1 from '@/assets/landing-hero-1.jpg';
import heroImg2 from '@/assets/landing-hero-2.jpg';
import heroImg3 from '@/assets/landing-hero-3.jpg';

/* ── Animated text block ── */
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

/* ── Parallax background ── */
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

/* ══════════════════════════════════════════════════════════════
   QUOTE SIMULATOR DATA
   Base prices are internal — user never sees them.
   Display prices = base * 1.20 (20% margin)
══════════════════════════════════════════════════════════════ */
const MARKUP = 1.20;

interface ServiceOption {
  id: string;
  label: string;
  description: string;
  basePrice: number;
  category: 'essential' | 'advanced' | 'premium';
  /** Custo médio de processos/multas SEM o serviço */
  avgLawsuitCost: number;
  /** % de redução de risco com o serviço */
  riskReduction: number;
  /** Texto explicativo do risco */
  riskContext: string;
}

const services: ServiceOption[] = [
  { id: 'aep', label: 'Avaliação Ergonômica Preliminar (AEP)', description: 'Identificação inicial de riscos ergonômicos no ambiente de trabalho', basePrice: 800, category: 'essential', avgLawsuitCost: 60000, riskReduction: 0.60, riskContext: 'Condenações por LER/DORT no TST chegam a R$ 60 mil por caso, segundo decisões recentes.' },
  { id: 'aet', label: 'Análise Ergonômica do Trabalho (AET)', description: 'Análise aprofundada com recomendações técnicas detalhadas', basePrice: 1500, category: 'essential', avgLawsuitCost: 80000, riskReduction: 0.75, riskContext: 'Perícias trabalhistas sem laudo técnico geram condenações entre R$ 50 mil e R$ 100 mil.' },
  { id: 'pcmso', label: 'Gestão PCMSO Integrada', description: 'Controle de exames médicos, ASOs e cronogramas de saúde', basePrice: 1200, category: 'essential', avgLawsuitCost: 25000, riskReduction: 0.70, riskContext: 'Empresas autuadas por SST pagaram em média R$ 18,4 mil em multas em 2025, podendo dobrar em reincidência.' },
  { id: 'psicossocial', label: 'Avaliação de Riscos Psicossociais', description: 'Mapeamento de fatores como estresse, assédio e carga mental', basePrice: 2000, category: 'advanced', avgLawsuitCost: 100000, riskReduction: 0.65, riskContext: 'Ações por burnout cresceram 14,5% e somam R$ 3,75 bilhões em impacto. Indenizações por assédio moral variam de R$ 5 mil a R$ 50 mil+.' },
  { id: 'dashboard', label: 'Dashboard Executivo e Indicadores', description: 'Painel visual com KPIs, tendências e relatórios para gestão', basePrice: 900, category: 'advanced', avgLawsuitCost: 25000, riskReduction: 0.50, riskContext: 'Grandes empresas reincidentes pagam até R$ 25 mil por autuação. Sem indicadores, a reincidência é frequente.' },
  { id: 'alertas', label: 'Alertas e Notificações Inteligentes', description: 'Avisos automáticos de vencimentos, prazos e ações pendentes', basePrice: 600, category: 'advanced', avgLawsuitCost: 18000, riskReduction: 0.55, riskContext: 'Multas por documentos vencidos e PGR desatualizado chegam a R$ 12,6 mil para grandes empresas, dobrando em reincidência.' },
  { id: 'planos_acao', label: 'Planos de Ação Automatizados', description: 'Geração automática de planos corretivos com rastreabilidade', basePrice: 1100, category: 'premium', avgLawsuitCost: 50000, riskReduction: 0.70, riskContext: 'PGR sem plano de ação implementado gera multa de até R$ 12,6 mil, dobrando em reincidência. Fiscalização verifica evidências concretas.' },
  { id: 'multiempresa', label: 'Gestão Multi-empresa', description: 'Gerencie diversas empresas em um único painel centralizado', basePrice: 1800, category: 'premium', avgLawsuitCost: 80000, riskReduction: 0.60, riskContext: 'Cada filial é fiscalizada de forma independente. Multas são aplicadas por estabelecimento, multiplicando a exposição.' },
  { id: 'suporte', label: 'Suporte Prioritário e Personalização', description: 'Atendimento dedicado, treinamentos e configurações sob medida', basePrice: 1500, category: 'premium', avgLawsuitCost: 25000, riskReduction: 0.45, riskContext: 'Treinamentos obrigatórios não realizados geram autuações. Auditor verifica comprovantes de capacitação de todos os trabalhadores.' },
];

const categoryLabels: Record<string, { label: string; color: string }> = {
  essential: { label: 'Proteção Essencial', color: 'text-teal-600 bg-teal-50 border-teal-200' },
  advanced: { label: 'Monitoramento Avançado', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  premium: { label: 'Cobertura Total', color: 'text-violet-600 bg-violet-50 border-violet-200' },
};

const protectionBenefits = [
  'Proteção contra autuações do MTE e fiscalizações',
  'Redução de passivos trabalhistas com evidência contínua',
  'Conformidade total com NR-1, NR-7 e NR-17',
  'Rastreabilidade completa para auditorias e perícias',
];

/** Benefício exclusivo — só aparece quando serviços premium estão selecionados */
const premiumBenefit = 'Laudos com validade jurídica assinados pelo colaborador — a prova que seu advogado precisa para vencer processos trabalhistas';

const contractOptions = [
  { months: 6, discount: 0, label: 'Semestral', tag: '' },
  { months: 12, discount: 0.10, label: 'Anual', tag: 'Mais escolhido' },
  { months: 24, discount: 0.20, label: 'Bienal', tag: 'Melhor custo-benefício' },
];

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

/* ══════════════════════════════════════════════════════════════
   QUOTE MODAL
══════════════════════════════════════════════════════════════ */
function QuoteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [colaboradores, setColaboradores] = useState(50);
  const [selected, setSelected] = useState<Set<string>>(new Set(['aep', 'pcmso']));
  const [selectedContract, setSelectedContract] = useState(12);
  const [contactForm, setContactForm] = useState({ nome: '', empresa: '', email: '', telefone: '' });
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedServices = services.filter(s => selected.has(s.id));
  const baseTotal = selectedServices.reduce((sum, s) => sum + s.basePrice, 0);
  const contractOption = contractOptions.find(c => c.months === selectedContract) || contractOptions[1];
  const monthlyWithMarkup = Math.ceil(baseTotal * MARKUP);
  const monthlyWithDiscount = Math.ceil(monthlyWithMarkup * (1 - contractOption.discount));
  const totalContract = monthlyWithDiscount * contractOption.months;
  const savings = contractOption.discount > 0 ? (monthlyWithMarkup - monthlyWithDiscount) * contractOption.months : 0;

  // Cálculos de impacto — risco total e economia potencial
  const totalRiskExposure = selectedServices.reduce((sum, s) => sum + s.avgLawsuitCost, 0);
  const avgReduction = selectedServices.length > 0
    ? selectedServices.reduce((sum, s) => sum + s.riskReduction, 0) / selectedServices.length
    : 0;
  const potentialSavings = Math.round(totalRiskExposure * avgReduction);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const reset = () => {
    setStep(1);
    setSubmitted(false);
    setSelected(new Set(['aep', 'pcmso']));
    setContactForm({ nome: '', empresa: '', email: '', telefone: '' });
    setColaboradores(50);
    setSelectedContract(12);
    onClose();
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all bg-white";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={reset}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {step === 1 && 'Monte seu plano de proteção'}
                  {step === 2 && 'Escolha o período de contratação'}
                  {step === 3 && 'Finalizar contratação'}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {step === 1 && 'Selecione os serviços que sua empresa precisa'}
                  {step === 2 && 'Quanto maior o período, menor o investimento mensal'}
                  {step === 3 && 'Preencha seus dados para receber a proposta formal'}
                </p>
              </div>
              <button onClick={reset} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Steps indicator */}
            <div className="px-8 py-3 flex items-center gap-2 border-b border-gray-50">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step > s
                      ? 'bg-teal-500 text-white'
                      : step === s
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </div>
                  {s < 3 && <div className={`w-12 h-0.5 rounded-full transition-all duration-300 ${step > s ? 'bg-teal-400' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <AnimatePresence mode="wait">
                {/* STEP 1 — Select services */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-8 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">Nº de colaboradores</span>
                        <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk'" }}>
                          {colaboradores}
                        </span>
                      </div>
                      <input
                        type="range" min={1} max={500} value={colaboradores}
                        onChange={e => setColaboradores(Number(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none bg-gray-200 accent-teal-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>1</span><span>100</span><span>250</span><span>500</span>
                      </div>
                    </div>

                    {(['essential', 'advanced', 'premium'] as const).map(cat => (
                      <div key={cat} className="mb-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border mb-3 ${categoryLabels[cat].color}`}>
                          {categoryLabels[cat].label}
                        </span>
                        <div className="space-y-2">
                          {services.filter(s => s.category === cat).map(service => {
                            const isSelected = selected.has(service.id);
                            return (
                              <div key={service.id}>
                                <button
                                  onClick={() => toggle(service.id)}
                                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                                    isSelected
                                      ? 'border-teal-400 bg-teal-50/50'
                                      : 'border-gray-100 bg-white hover:border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                                        {service.label}
                                      </p>
                                      <p className="text-xs text-gray-400 mt-0.5">{service.description}</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                      isSelected ? 'border-teal-500 bg-teal-500' : 'border-gray-300'
                                    }`}>
                                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                  </div>
                                  {/* Risk impact — shown when selected */}
                                  <AnimatePresence>
                                    {isSelected && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="mt-3 pt-3 border-t border-teal-200/50">
                                          <p className="text-xs text-gray-500 mb-2">{service.riskContext}</p>
                                          <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Custo médio sem proteção</p>
                                              <p className="text-sm font-bold text-red-500">R$ {service.avgLawsuitCost.toLocaleString('pt-BR')}</p>
                                            </div>
                                            <div className="flex-1">
                                              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Redução com Ergon</p>
                                              <p className="text-sm font-bold text-teal-600">até {Math.round(service.riskReduction * 100)}%</p>
                                            </div>
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Resumo de impacto acumulado */}
                    {selectedServices.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-2xl bg-gray-900 text-white"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                          Impacto da sua proteção
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-400">Exposição total sem sistema</p>
                            <p className="text-xl font-bold text-red-400" style={{ fontFamily: "'Space Grotesk'" }}>
                              R$ {totalRiskExposure.toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Economia potencial com Ergon</p>
                            <p className="text-xl font-bold text-teal-400" style={{ fontFamily: "'Space Grotesk'" }}>
                              R$ {potentialSavings.toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <p className="text-xs text-gray-400">
                            Com {selectedServices.length} {selectedServices.length === 1 ? 'serviço selecionado' : 'serviços selecionados'}, sua empresa reduz em média {Math.round(avgReduction * 100)}% dos riscos trabalhistas mapeados.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* STEP 2 — Contract duration + pricing */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Resumo serviços */}
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        {selectedServices.length} serviços selecionados · {colaboradores} colaboradores
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedServices.map(s => (
                          <span key={s.id} className="px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-700">
                            {s.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Contract options */}
                    <p className="text-sm font-semibold text-gray-900 mb-4">Escolha o período de contratação</p>
                    <div className="space-y-3 mb-8">
                      {contractOptions.map(opt => {
                        const monthly = Math.ceil(monthlyWithMarkup * (1 - opt.discount));
                        const total = monthly * opt.months;
                        const isActive = selectedContract === opt.months;
                        return (
                          <button
                            key={opt.months}
                            onClick={() => setSelectedContract(opt.months)}
                            className={`w-full p-5 pl-14 rounded-2xl border-2 text-left transition-all duration-200 relative ${
                              isActive
                                ? 'border-teal-400 bg-teal-50/30'
                                : 'border-gray-100 bg-white hover:border-gray-200'
                            }`}
                          >
                            {opt.tag && (
                              <span className={`absolute -top-2.5 right-4 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                opt.months === 24 ? 'bg-teal-500 text-white' : 'bg-gray-900 text-white'
                              }`}>
                                {opt.tag}
                              </span>
                            )}
                            {/* Radio */}
                            <div className={`absolute top-5 left-5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isActive ? 'border-teal-500' : 'border-gray-300'
                            }`}>
                              {isActive && <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />}
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-base font-bold text-gray-900">{opt.label}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{opt.months} meses de contrato</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk'" }}>
                                  R$ {monthly.toLocaleString('pt-BR')}
                                  <span className="text-xs font-normal text-gray-400">/mês</span>
                                </p>
                                {opt.discount > 0 && (
                                  <p className="text-xs text-teal-600 font-semibold mt-0.5">
                                    Economia de R$ {((monthlyWithMarkup - monthly) * opt.months).toLocaleString('pt-BR')} no período
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                              <span>Total do contrato: R$ {total.toLocaleString('pt-BR')}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Benefits */}
                    <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
                        Sua empresa terá
                      </p>
                      <ul className="space-y-2">
                        {protectionBenefits.map(b => (
                          <li key={b} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-teal-500 font-bold mt-px">✓</span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {contractOption.months >= 12 && (
                      <div className="mt-4 p-4 rounded-xl bg-teal-50 border border-teal-100">
                        <p className="text-sm text-teal-800 font-medium">
                          {contractOption.months === 24
                            ? 'Contrato bienal garante o menor custo mensal e proteção contínua com atualizações incluídas durante todo o período.'
                            : 'Contrato anual oferece estabilidade de preço e suporte prioritário durante toda a vigência.'
                          }
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 3 — Contact form + final summary */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                  >
                    {submitted ? (
                      <div className="py-12">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                          className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center mx-auto mb-6"
                        >
                          <Check className="w-8 h-8 text-white" />
                        </motion.div>
                        <div className="text-center mb-8">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Space Grotesk'" }}>
                            Proposta enviada com sucesso
                          </h3>
                          <p className="text-gray-400 text-sm">
                            Nossa equipe entrará em contato em até 24h com o contrato formal.
                          </p>
                        </div>

                        {/* Resumo final */}
                        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 mb-6">
                          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                            <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wider">Plano contratado</p>
                              <p className="text-lg font-bold text-gray-900">{contractOption.label} — {contractOption.months} meses</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400">Investimento mensal</p>
                              <p className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk'" }}>
                                R$ {monthlyWithDiscount.toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-xs text-gray-400">Serviços</p>
                              <p className="text-lg font-bold text-gray-900">{selectedServices.length}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Colaboradores</p>
                              <p className="text-lg font-bold text-gray-900">{colaboradores}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Total do contrato</p>
                              <p className="text-lg font-bold text-gray-900">R$ {totalContract.toLocaleString('pt-BR')}</p>
                            </div>
                          </div>
                          {savings > 0 && (
                            <div className="mt-4 pt-3 border-t border-gray-200 text-center">
                              <p className="text-sm text-teal-600 font-semibold">
                                Você economiza R$ {savings.toLocaleString('pt-BR')} com o plano {contractOption.label.toLowerCase()}
                              </p>
                            </div>
                          )}
                        </div>

                        <button onClick={reset} className="w-full py-4 rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all">
                          Fechar
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between mb-2">
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Investimento</p>
                            <p className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk'" }}>
                              R$ {monthlyWithDiscount.toLocaleString('pt-BR')}/mês
                            </p>
                          </div>
                          <div className="text-right text-xs text-gray-400">
                            <p>{selectedServices.length} serviços · {colaboradores} colaboradores</p>
                            <p>{contractOption.label} ({contractOption.months} meses)</p>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Seu nome *</label>
                            <input type="text" required value={contactForm.nome} onChange={e => setContactForm(f => ({ ...f, nome: e.target.value }))}
                              className={inputClasses} placeholder="João Silva" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Empresa *</label>
                            <input type="text" required value={contactForm.empresa} onChange={e => setContactForm(f => ({ ...f, empresa: e.target.value }))}
                              className={inputClasses} placeholder="Nome da empresa" />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">E-mail *</label>
                            <input type="email" required value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                              className={inputClasses} placeholder="email@empresa.com" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Telefone</label>
                            <input type="tel" value={contactForm.telefone} onChange={e => setContactForm(f => ({ ...f, telefone: e.target.value }))}
                              className={inputClasses} placeholder="(11) 99999-9999" />
                          </div>
                        </div>

                        <button type="submit" className="w-full py-4 rounded-full text-base font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all">
                          Contratar plano {contractOption.label.toLowerCase()}
                        </button>
                        <p className="text-[11px] text-gray-400 text-center">
                          Ao enviar, você receberá a proposta formal por e-mail para assinatura.
                        </p>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer actions */}
            {!submitted && (
              <div className="px-8 py-4 border-t border-gray-100 flex items-center justify-between">
                {step > 1 ? (
                  <button onClick={() => setStep(s => s - 1)} className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                    ← Voltar
                  </button>
                ) : <div />}
                {step < 3 && (
                  <button
                    onClick={() => setStep(s => s + 1)}
                    disabled={selected.size === 0}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continuar <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroScroll, [0, 1], ['0%', '40%']);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);

  const [quoteOpen, setQuoteOpen] = useState(false);

  const [form, setForm] = useState({ nome: '', empresa: '', email: '', telefone: '', mensagem: '' });
  const [sent, setSent] = useState(false);
  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="bg-white text-gray-900 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} />

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuoteOpen(true)}
              className="px-5 py-2.5 rounded-full text-sm font-semibold border-2 border-teal-500 text-teal-600 hover:bg-teal-50 transition-all duration-300"
            >
              Simular orçamento
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:from-teal-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-teal-500/20"
            >
              Acessar plataforma
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div ref={heroRef} className="relative min-h-[110vh] flex items-center overflow-hidden">
        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0">
          <img src={heroImg1} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/30" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
          <div className="max-w-2xl">

            <ScrollText direction="up" delay={0.3}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-gray-900 mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
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
                <button
                  onClick={() => setQuoteOpen(true)}
                  className="px-8 py-4 rounded-full text-base font-semibold bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:from-teal-400 hover:to-blue-500 transition-all duration-500 shadow-xl shadow-teal-500/25"
                >
                  Simular orçamento
                </button>
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

      {/* PROBLEMA */}
      <section id="problema" className="py-32 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <ScrollText direction="up">
            <p className="text-xs uppercase tracking-widest text-teal-600 font-semibold text-center mb-3">O problema</p>
          </ScrollText>
          <ScrollText direction="up" delay={0.1}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-900 mb-24 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              O que acontece quando<br />não há evidências?
            </h2>
          </ScrollText>

          <div className="space-y-32">
            {painPoints.map((item, i) => (
              <ScrollText key={item.title} direction={i % 2 === 0 ? 'left' : 'right'} delay={0.1}>
                <div className={`max-w-xl ${i % 2 !== 0 ? 'ml-auto text-right' : ''}`}>
                  <div className={`w-16 h-1 rounded-full bg-red-400 mb-6 ${i % 2 !== 0 ? 'ml-auto' : ''}`} />
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {item.title}
                  </h3>
                  <p className="text-lg text-gray-500 leading-relaxed">{item.text}</p>
                </div>
              </ScrollText>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section id="solucao" className="relative py-40 overflow-hidden">
        <ParallaxBg src={heroImg2} speed={0.2} overlay="bg-gradient-to-b from-[#0c1829]/90 to-[#0c1829]/95" />

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <ScrollText direction="scale">
            <p className="text-xs uppercase tracking-widest text-teal-400 font-semibold text-center mb-4">Como funciona</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-white mb-6 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Controle, monitoramento e evidência
            </h2>
            <p className="text-center text-xl font-semibold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent mb-32" style={{ fontFamily: "'Space Grotesk'" }}>
              em um único sistema.
            </p>
          </ScrollText>

          <div className="space-y-40">
            {solutionSteps.map((s, i) => (
              <ScrollText key={s.num} direction={i % 2 === 0 ? 'left' : 'right'} delay={0.05}>
                <div className={`max-w-lg ${i % 2 !== 0 ? 'ml-auto text-right' : ''}`}>
                  <span className="text-6xl sm:text-7xl font-bold text-teal-400/15 block mb-2" style={{ fontFamily: "'Space Grotesk'" }}>
                    {s.num}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk'" }}>
                    {s.title}
                  </h3>
                  <p className="text-base text-white/50 leading-relaxed">{s.text}</p>
                </div>
              </ScrollText>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS — CTA para abrir simulador */}
      <section id="planos" className="py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollText direction="up">
            <p className="text-xs uppercase tracking-widest text-teal-600 font-semibold mb-3">Planos</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Mais que gestão.
            </h2>
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-8" style={{ fontFamily: "'Space Grotesk'" }}>
              Proteção real.
            </p>
          </ScrollText>

          <ScrollText direction="up" delay={0.15}>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
              Monte um plano sob medida para sua empresa. Escolha os serviços que precisa e veja instantaneamente o investimento necessário para proteger seus colaboradores e seu negócio.
            </p>
          </ScrollText>

          <ScrollText direction="scale" delay={0.3}>
            <button
              onClick={() => setQuoteOpen(true)}
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full text-lg font-bold bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:from-teal-400 hover:to-blue-500 transition-all duration-500 shadow-2xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-105"
            >
              Montar meu plano de proteção
            </button>
          </ScrollText>

          <ScrollText direction="up" delay={0.4}>
            <div className="flex flex-wrap justify-center gap-6 mt-16">
              {['NR-1 Compliant', 'NR-7 Integrado', 'NR-17 Documentado', 'Dados Criptografados'].map(badge => (
                <div key={badge} className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <span className="text-xs font-medium text-gray-600">{badge}</span>
                </div>
              ))}
            </div>
          </ScrollText>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" className="relative py-32 overflow-hidden">
        <ParallaxBg src={heroImg3} speed={0.15} overlay="bg-gradient-to-b from-[#0c1829]/90 to-[#0c1829]/95" />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <ScrollText direction="left">
                <p className="text-xs uppercase tracking-widest text-teal-400 font-semibold mb-4">Contato</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
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

      {/* Footer */}
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