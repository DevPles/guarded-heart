import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import logoErgon from '@/assets/logo-ergon.png';

const Login2 = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: 'Erro ao entrar', description: error.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[hsl(220,25%,8%)]">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[hsl(var(--primary)/0.15)] blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-[hsl(var(--accent)/0.12)] blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[hsl(var(--primary)/0.08)] blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Glass grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)/0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Card with perspective flip */}
      <div className="relative z-10 w-full max-w-md mx-4" style={{ perspective: '1200px' }}>
        <div
          className="relative w-full transition-transform duration-700 ease-in-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* ===== FRONT: LOGIN ===== */}
          <div
            className="w-full rounded-3xl p-8 sm:p-10"
            style={{
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, hsl(220 20% 14% / 0.8), hsl(220 20% 10% / 0.6))',
              backdropFilter: 'blur(40px)',
              border: '1px solid hsl(var(--primary) / 0.15)',
              boxShadow: '0 0 80px -20px hsl(var(--primary) / 0.2), inset 0 1px 0 hsl(0 0% 100% / 0.05)',
            }}
          >
            <div className="text-center mb-8">
              <img src={logoErgon} alt="Ergon" className="h-14 mx-auto mb-6 brightness-0 invert opacity-90" />
              <h1
                className="text-3xl font-bold text-white mb-2"
                style={{ fontFamily: 'Space Grotesk' }}
              >
                Bem-vindo
              </h1>
              <p className="text-white/50 text-sm">
                Acesse o ecossistema de saúde ocupacional
              </p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="l2-email" className="text-white/70 text-xs uppercase tracking-wider">
                  E-mail
                </Label>
                <Input
                  id="l2-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary)/0.3)] transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="l2-pass" className="text-white/70 text-xs uppercase tracking-wider">
                  Senha
                </Label>
                <Input
                  id="l2-pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary)/0.3)] transition-all"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl text-base font-semibold relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                  boxShadow: '0 4px 30px -5px hsl(var(--primary) / 0.5)',
                }}
              >
                <span className="relative z-10">{submitting ? 'Entrando...' : 'Entrar'}</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsFlipped(true)}
                className="text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                Não tem conta? <span className="text-[hsl(var(--primary))] font-medium">Solicitar acesso</span>
              </button>
            </div>

            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-white/10 rounded-tl-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-white/10 rounded-br-3xl pointer-events-none" />
          </div>

          {/* ===== BACK: SIGNUP REQUEST ===== */}
          <div
            className="absolute inset-0 w-full rounded-3xl p-8 sm:p-10"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, hsl(220 20% 14% / 0.8), hsl(220 20% 10% / 0.6))',
              backdropFilter: 'blur(40px)',
              border: '1px solid hsl(var(--accent) / 0.15)',
              boxShadow: '0 0 80px -20px hsl(var(--accent) / 0.2), inset 0 1px 0 hsl(0 0% 100% / 0.05)',
            }}
          >
            <div className="text-center mb-8">
              <img src={logoErgon} alt="Ergon" className="h-14 mx-auto mb-6 brightness-0 invert opacity-90" />
              <h1
                className="text-3xl font-bold text-white mb-2"
                style={{ fontFamily: 'Space Grotesk' }}
              >
                Solicitar Acesso
              </h1>
              <p className="text-white/50 text-sm">
                O cadastro é feito pelo administrador
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast({
                  title: 'Acesso por convite',
                  description: 'Solicite um convite ao seu gestor.',
                });
              }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label className="text-white/70 text-xs uppercase tracking-wider">Nome</Label>
                <Input
                  type="text"
                  required
                  placeholder="Seu nome completo"
                  className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[hsl(var(--accent))] focus:ring-[hsl(var(--accent)/0.3)] transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-xs uppercase tracking-wider">E-mail</Label>
                <Input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[hsl(var(--accent))] focus:ring-[hsl(var(--accent)/0.3)] transition-all"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-semibold relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))',
                  boxShadow: '0 4px 30px -5px hsl(var(--accent) / 0.5)',
                }}
              >
                <span className="relative z-10">Solicitar Acesso</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsFlipped(false)}
                className="text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                Já tem conta? <span className="text-[hsl(var(--accent))] font-medium">Entrar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login2;
