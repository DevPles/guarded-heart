import { useState, useEffect } from 'react';
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
  const [animPhase, setAnimPhase] = useState<'idle' | 'pulling' | 'done'>('idle');
  const { signIn } = useAuth();
  const { toast } = useToast();

  // Entrance animation: character "pulls" the form out of briefcase
  useEffect(() => {
    const t1 = setTimeout(() => setAnimPhase('pulling'), 400);
    const t2 = setTimeout(() => setAnimPhase('done'), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Re-trigger animation on toggle
  const handleToggle = (signUp: boolean) => {
    setAnimPhase('idle');
    setTimeout(() => setAnimPhase('pulling'), 100);
    setTimeout(() => {
      setAnimPhase('done');
      setIsSignUp(signUp);
    }, 500);
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
    toast({
      title: 'Acesso por convite',
      description: 'O cadastro é feito pelo administrador do sistema.',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(220,25%,8%)] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-[hsl(var(--primary)/0.08)] blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-[hsl(var(--accent)/0.06)] blur-[150px] animate-pulse" style={{ animationDelay: '1.5s' }} />

      <style>{`
        @keyframes characterBounce {
          0% { transform: translateY(80px) scale(0.8); opacity: 0; }
          50% { transform: translateY(-10px) scale(1.05); opacity: 1; }
          70% { transform: translateY(5px) scale(0.98); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes characterPull {
          0% { transform: translateY(0) rotate(0deg); }
          30% { transform: translateY(-15px) rotate(-8deg); }
          60% { transform: translateY(-5px) rotate(3deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        @keyframes formSlideFromBriefcase {
          0% { 
            transform: translateY(120px) scale(0.3) rotateX(40deg); 
            opacity: 0; 
            filter: blur(8px);
          }
          40% {
            transform: translateY(40px) scale(0.7) rotateX(15deg);
            opacity: 0.6;
            filter: blur(3px);
          }
          70% {
            transform: translateY(-10px) scale(1.02) rotateX(-3deg);
            opacity: 1;
            filter: blur(0);
          }
          100% { 
            transform: translateY(0) scale(1) rotateX(0deg); 
            opacity: 1; 
            filter: blur(0);
          }
        }
        @keyframes formHideIntoBriefcase {
          0% { 
            transform: translateY(0) scale(1) rotateX(0deg); 
            opacity: 1; 
          }
          100% { 
            transform: translateY(120px) scale(0.3) rotateX(40deg); 
            opacity: 0;
            filter: blur(8px);
          }
        }
        @keyframes briefcaseGlow {
          0% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0); }
          50% { box-shadow: 0 0 40px 10px hsl(var(--primary) / 0.3); }
          100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0); }
        }
        @keyframes characterIdle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .character-entrance {
          animation: characterBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .character-pull {
          animation: characterPull 0.6s ease-in-out;
        }
        .character-idle {
          animation: characterIdle 3s ease-in-out infinite;
        }
        .form-appear {
          animation: formSlideFromBriefcase 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .form-hide {
          animation: formHideIntoBriefcase 0.4s ease-in forwards;
        }
        .briefcase-glow {
          animation: briefcaseGlow 1s ease-out;
        }
      `}</style>

      <div className="relative z-10 flex flex-col items-center gap-0">
        {/* Character area */}
        <div className="relative z-20 mb-[-40px]">
          {/* Glow behind briefcase */}
          <div
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-8 rounded-full ${
              animPhase === 'pulling' ? 'briefcase-glow' : ''
            }`}
            style={{ background: 'radial-gradient(ellipse, hsl(var(--primary) / 0.2), transparent)' }}
          />
          <img
            src={loginCharacter}
            alt=""
            className={`w-44 h-44 object-contain drop-shadow-2xl ${
              animPhase === 'idle'
                ? 'character-entrance'
                : animPhase === 'pulling'
                ? 'character-pull'
                : 'character-idle'
            }`}
            style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}
          />
        </div>

        {/* Form card — animated as if pulled from briefcase */}
        <div
          className={`relative z-10 w-[420px] max-w-[90vw] rounded-2xl overflow-hidden ${
            animPhase === 'idle'
              ? 'opacity-0'
              : animPhase === 'pulling'
              ? 'form-appear'
              : ''
          }`}
          style={{
            perspective: '800px',
            background: 'linear-gradient(180deg, hsl(220 20% 14% / 0.95), hsl(220 20% 10% / 0.95))',
            backdropFilter: 'blur(40px)',
            border: '1px solid hsl(var(--primary) / 0.15)',
            boxShadow: '0 25px 80px -20px hsl(var(--primary) / 0.25), 0 0 0 1px hsl(0 0% 100% / 0.03)',
            opacity: animPhase === 'done' ? 1 : undefined,
          }}
        >
          {/* Tab switcher */}
          <div className="flex border-b border-white/5">
            <button
              onClick={() => !isSignUp || handleToggle(false)}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-300 ${
                !isSignUp
                  ? 'text-white border-b-2 border-[hsl(var(--primary))] bg-white/5'
                  : 'text-white/30 hover:text-white/50'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => isSignUp || handleToggle(true)}
              className={`flex-1 py-3 text-sm font-medium transition-all duration-300 ${
                isSignUp
                  ? 'text-white border-b-2 border-[hsl(var(--accent))] bg-white/5'
                  : 'text-white/30 hover:text-white/50'
              }`}
            >
              Criar Conta
            </button>
          </div>

          <div className="p-8">
            <div className="text-center mb-6">
              <img src={logoErgon} alt="Ergon" className="h-8 mx-auto mb-4 brightness-0 invert opacity-70" />
            </div>

            {!isSignUp ? (
              <form onSubmit={handleSignIn} className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-widest mb-2 block">E-mail</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                    className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary)/0.2)]"
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-widest mb-2 block">Senha</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary)/0.2)]"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 rounded-xl text-sm font-semibold mt-2"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                    boxShadow: '0 8px 32px -8px hsl(var(--primary) / 0.5)',
                  }}
                >
                  {submitting ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-widest mb-2 block">Nome</label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Seu nome completo"
                    className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-[hsl(var(--accent))] focus:ring-[hsl(var(--accent)/0.2)]"
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-widest mb-2 block">E-mail</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                    className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-[hsl(var(--accent))] focus:ring-[hsl(var(--accent)/0.2)]"
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-widest mb-2 block">Senha</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-11 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-[hsl(var(--accent))] focus:ring-[hsl(var(--accent)/0.2)]"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl text-sm font-semibold mt-2"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))',
                    boxShadow: '0 8px 32px -8px hsl(var(--accent) / 0.5)',
                  }}
                >
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
