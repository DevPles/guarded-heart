import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import logoErgon from '@/assets/logo-ergon.png';
import loginCharacter from '@/assets/login-character.png';

const Login2 = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [characterReady, setCharacterReady] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Step 1: Character drops in
    const t1 = setTimeout(() => setCharacterReady(true), 300);
    // Step 2: Character pulls, form appears
    const t2 = setTimeout(() => setIsPulling(true), 1000);
    const t3 = setTimeout(() => setShowForm(true), 1300);
    const t4 = setTimeout(() => setIsPulling(false), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const handleToggle = (signUp: boolean) => {
    setShowForm(false);
    setIsPulling(true);
    setTimeout(() => {
      setIsSignUp(signUp);
      setShowForm(true);
    }, 500);
    setTimeout(() => setIsPulling(false), 800);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: 'Erro ao entrar', description: error.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Acesso por convite', description: 'Solicite um convite ao seu gestor.' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(220,25%,8%)] relative overflow-hidden">
      {/* BG blobs */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-[hsl(var(--primary)/0.08)] blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-[hsl(var(--accent)/0.06)] blur-[150px] animate-pulse" style={{ animationDelay: '1.5s' }} />

      <style>{`
        @keyframes dropIn {
          0%   { transform: translateY(-120px) rotate(-15deg) scale(0.5); opacity: 0; }
          60%  { transform: translateY(20px) rotate(5deg) scale(1.1); opacity: 1; }
          80%  { transform: translateY(-8px) rotate(-2deg) scale(0.97); }
          100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
        }
        @keyframes pullFromBag {
          0%   { transform: translateY(0) rotate(0deg) scale(1); }
          25%  { transform: translateY(10px) rotate(-12deg) scale(1.05); }
          50%  { transform: translateY(-20px) rotate(8deg) scale(1.1); }
          75%  { transform: translateY(-5px) rotate(-3deg) scale(1.02); }
          100% { transform: translateY(0) rotate(0deg) scale(1); }
        }
        @keyframes floatIdle {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes formFromBag {
          0%   { 
            transform: translateY(80px) scaleY(0.1) scaleX(0.6); 
            opacity: 0;
            clip-path: inset(80% 20% 0% 20% round 16px);
          }
          30%  {
            transform: translateY(40px) scaleY(0.5) scaleX(0.8);
            opacity: 0.5;
            clip-path: inset(40% 10% 0% 10% round 16px);
          }
          70%  {
            transform: translateY(-10px) scaleY(1.03) scaleX(1.01);
            opacity: 1;
            clip-path: inset(0% 0% 0% 0% round 16px);
          }
          100% { 
            transform: translateY(0) scaleY(1) scaleX(1); 
            opacity: 1;
            clip-path: inset(0% 0% 0% 0% round 16px);
          }
        }
        @keyframes formToBag {
          0%   { transform: translateY(0) scaleY(1) scaleX(1); opacity: 1; }
          100% { transform: translateY(80px) scaleY(0.1) scaleX(0.6); opacity: 0; }
        }
        @keyframes glowPulse {
          0%   { opacity: 0; transform: scale(0.8); }
          50%  { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(0.8); }
        }
      `}</style>

      <div className="relative z-10 flex flex-col items-center">
        {/* Character */}
        <div className="relative z-20 mb-[-30px]">
          {/* Glow under briefcase when pulling */}
          <div
            className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-40 h-12 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse, hsl(var(--primary) / 0.4), transparent 70%)',
              opacity: isPulling ? 1 : 0,
              transform: isPulling ? 'scale(1.3)' : 'scale(0.8)',
              transition: 'all 0.4s ease',
            }}
          />
          {/* Sparkles when pulling */}
          {isPulling && (
            <>
              <div className="absolute bottom-0 left-1/2 -translate-x-[30px] w-2 h-2 rounded-full bg-[hsl(var(--primary))]" style={{ animation: 'glowPulse 0.6s ease-out forwards' }} />
              <div className="absolute bottom-2 left-1/2 translate-x-[20px] w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))]" style={{ animation: 'glowPulse 0.6s 0.1s ease-out forwards' }} />
              <div className="absolute bottom-[-5px] left-1/2 -translate-x-[10px] w-1 h-1 rounded-full bg-white/60" style={{ animation: 'glowPulse 0.6s 0.2s ease-out forwards' }} />
            </>
          )}
          <img
            src={loginCharacter}
            alt=""
            className="w-48 h-48 object-contain"
            style={{
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))',
              animation: !characterReady
                ? 'none'
                : isPulling
                ? 'pullFromBag 0.7s ease-in-out'
                : 'dropIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, floatIdle 3s 1.5s ease-in-out infinite',
              opacity: characterReady ? 1 : 0,
            }}
          />
        </div>

        {/* Form card — slides out from behind character/briefcase */}
        <div
          className="relative z-10 w-[420px] max-w-[90vw] rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, hsl(220 20% 14% / 0.95), hsl(220 20% 10% / 0.95))',
            backdropFilter: 'blur(40px)',
            border: '1px solid hsl(var(--primary) / 0.12)',
            boxShadow: '0 25px 80px -20px hsl(var(--primary) / 0.2), 0 0 0 1px hsl(0 0% 100% / 0.03)',
            transformOrigin: 'top center',
            animation: showForm
              ? 'formFromBag 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              : 'formToBag 0.4s ease-in forwards',
            opacity: 0,
          }}
        >
          {/* Tab switcher */}
          <div className="flex border-b border-white/5">
            <button
              onClick={() => isSignUp && handleToggle(false)}
              className={`flex-1 py-3.5 text-sm font-medium transition-all duration-300 ${
                !isSignUp ? 'text-white border-b-2 border-[hsl(var(--primary))] bg-white/5' : 'text-white/30 hover:text-white/50'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => !isSignUp && handleToggle(true)}
              className={`flex-1 py-3.5 text-sm font-medium transition-all duration-300 ${
                isSignUp ? 'text-white border-b-2 border-[hsl(var(--accent))] bg-white/5' : 'text-white/30 hover:text-white/50'
              }`}
            >
              Criar Conta
            </button>
          </div>

          <div className="p-8">
            <div className="text-center mb-5">
              <img src={logoErgon} alt="Ergon" className="h-8 mx-auto mb-3 brightness-0 invert opacity-60" />
              <p className="text-white/30 text-xs">
                {!isSignUp ? 'Acesse o ecossistema de saúde ocupacional' : 'Solicite acesso ao sistema'}
              </p>
            </div>

            {!isSignUp ? (
              <form onSubmit={handleSignIn} className="space-y-4" key="login">
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-widest mb-2 block">E-mail</label>
                  <Input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    placeholder="seu@email.com"
                    className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary)/0.2)]"
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-widest mb-2 block">Senha</label>
                  <Input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                    placeholder="••••••••"
                    className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary)/0.2)]"
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full h-11 rounded-xl text-sm font-semibold mt-2"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))', boxShadow: '0 8px 32px -8px hsl(var(--primary) / 0.5)' }}>
                  {submitting ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4" key="signup">
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-widest mb-2 block">Nome</label>
                  <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Seu nome completo"
                    className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-[hsl(var(--accent))] focus:ring-[hsl(var(--accent)/0.2)]" />
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-widest mb-2 block">E-mail</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com"
                    className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-[hsl(var(--accent))] focus:ring-[hsl(var(--accent)/0.2)]" />
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-widest mb-2 block">Senha</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"
                    className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-[hsl(var(--accent))] focus:ring-[hsl(var(--accent)/0.2)]" />
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl text-sm font-semibold mt-2"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))', boxShadow: '0 8px 32px -8px hsl(var(--accent) / 0.5)' }}>
                  Solicitar Acesso
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login2;
