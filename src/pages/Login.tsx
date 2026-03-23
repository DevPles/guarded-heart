import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import logoErgon from '@/assets/logo-ergon.png';
import CursorTrail from '@/components/CursorTrail';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Acesso por convite',
      description: 'O cadastro é feito pelo administrador do sistema. Solicite um convite ao seu gestor.',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[hsl(220,25%,8%)]">
      <CursorTrail />
      {/* Animated background blobs */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-[hsl(var(--primary)/0.08)] blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-[hsl(var(--accent)/0.06)] blur-[150px] animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[hsl(var(--primary)/0.05)] blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="relative z-10 w-full max-w-4xl h-[540px] rounded-3xl overflow-hidden shadow-2xl bg-card">
        
        {/* ===== SIGN IN FORM (left side) ===== */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center p-8 sm:p-12 transition-all duration-700 ease-in-out ${
            isSignUp ? 'opacity-0 pointer-events-none -translate-x-10' : 'opacity-100 translate-x-0'
          }`}
        >
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: 'Space Grotesk' }}>
              Entrar
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
              Acesse sua conta
            </p>
            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm font-medium text-foreground">E-mail</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="h-12 rounded-xl bg-muted/50 border-border/60 focus:border-primary focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-sm font-medium text-foreground">Senha</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-12 rounded-xl bg-muted/50 border-border/60 focus:border-primary focus:ring-primary/20 transition-all"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base" disabled={submitting}>
                {submitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </div>
        </div>

        {/* ===== SIGN UP FORM (right side) ===== */}
        <div
          className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center p-8 sm:p-12 transition-all duration-700 ease-in-out ${
            isSignUp ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none translate-x-10'
          }`}
        >
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: 'Space Grotesk' }}>
              Criar Conta
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
              Solicite acesso ao sistema
            </p>
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-sm font-medium text-foreground">Nome</Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Seu nome completo"
                  className="h-12 rounded-xl bg-muted/50 border-border/60 focus:border-primary focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-sm font-medium text-foreground">E-mail</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="h-12 rounded-xl bg-muted/50 border-border/60 focus:border-primary focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-sm font-medium text-foreground">Senha</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-12 rounded-xl bg-muted/50 border-border/60 focus:border-primary focus:ring-primary/20 transition-all"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base" disabled={submitting}>
                Solicitar Acesso
              </Button>
            </form>
          </div>
        </div>

        {/* ===== SLIDING OVERLAY ===== */}
        <div
          className={`absolute top-0 w-1/2 h-full transition-transform duration-700 ease-in-out z-20 ${
            isSignUp ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ left: 0 }}
        >
          <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex flex-col items-center justify-start pt-10 p-12 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/5" />
            <div className="absolute -bottom-32 -right-20 w-80 h-80 rounded-full bg-white/5" />
            <div className="absolute top-1/4 right-8 w-32 h-32 rounded-full bg-white/5" />

            <div className="relative z-10 text-center">
              <img src={logoErgon} alt="Ergon" className="h-36 mx-auto mb-8 brightness-0 invert" />

              {!isSignUp ? (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'Space Grotesk' }}>
                    O 1º ecossistema completo de Saúde Ocupacional com evidências
                  </h2>
                  <p className="text-white/80 text-sm leading-relaxed max-w-xs mx-auto mb-3">
                    Coleta estruturada. Análise inteligente de risco.
                  </p>
                  <p className="text-white/80 text-sm leading-relaxed max-w-xs mx-auto mb-3">
                    Monitoramento contínuo. Rastreabilidade total.
                  </p>
                  <p className="text-white/60 text-xs leading-relaxed max-w-xs mx-auto mb-8">
                    AEP, AET, riscos psicossociais, PCMSO, atestados, checklists e planos de ação em uma única plataforma.
                  </p>
                  <Button
                    variant="outline"
                    className="rounded-full border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white h-12 px-8 text-base"
                    onClick={() => setIsSignUp(true)}
                  >
                    Cadastrar
                  </Button>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'Space Grotesk' }}>
                    Proteção jurídica real começa com evidências reais
                  </h2>
                  <p className="text-white/80 text-sm leading-relaxed max-w-xs mx-auto mb-3">
                    Documentação auditável. Decisões baseadas em dados.
                  </p>
                  <p className="text-white/60 text-xs leading-relaxed max-w-xs mx-auto mb-8">
                    Gerencie ergonomia, saúde e segurança do trabalho com controle total sobre cada registro.
                  </p>
                  <Button
                    variant="outline"
                    className="rounded-full border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white h-12 px-8 text-base"
                    onClick={() => setIsSignUp(false)}
                  >
                    Entrar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== MOBILE FALLBACK ===== */}
        <div className="md:hidden absolute inset-0 flex flex-col items-center justify-center p-6 bg-card z-30">
          <img src={logoErgon} alt="Ergon" className="h-12 mx-auto mb-6" />

          {!isSignUp ? (
            <div className="w-full max-w-sm animate-fade-in">
              <h2 className="text-2xl font-bold text-foreground mb-1 text-center" style={{ fontFamily: 'Space Grotesk' }}>Entrar</h2>
              <p className="text-muted-foreground text-sm mb-6 text-center">Acesse sua conta</p>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="m-email">E-mail</Label>
                  <Input id="m-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" className="h-12 rounded-xl bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m-password">Senha</Label>
                  <Input id="m-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="h-12 rounded-xl bg-muted/50" />
                </div>
                <Button type="submit" className="w-full h-12 text-base" disabled={submitting}>
                  {submitting ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
              <button onClick={() => setIsSignUp(true)} className="w-full text-center mt-6 text-sm text-primary font-medium hover:underline transition-colors">
                Não tem conta? Cadastrar
              </button>
            </div>
          ) : (
            <div className="w-full max-w-sm animate-fade-in">
              <h2 className="text-2xl font-bold text-foreground mb-1 text-center" style={{ fontFamily: 'Space Grotesk' }}>Criar Conta</h2>
              <p className="text-muted-foreground text-sm mb-6 text-center">Solicite acesso ao sistema</p>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="m-name">Nome</Label>
                  <Input id="m-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Seu nome" className="h-12 rounded-xl bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m-email2">E-mail</Label>
                  <Input id="m-email2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" className="h-12 rounded-xl bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m-pass2">Senha</Label>
                  <Input id="m-pass2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="h-12 rounded-xl bg-muted/50" />
                </div>
                <Button type="submit" className="w-full h-12 text-base">Solicitar Acesso</Button>
              </form>
              <button onClick={() => setIsSignUp(false)} className="w-full text-center mt-6 text-sm text-primary font-medium hover:underline transition-colors">
                Já tem conta? Entrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
