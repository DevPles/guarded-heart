import { useState } from 'react';
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
    <div className="min-h-screen flex items-center justify-center bg-[hsl(220,25%,8%)] relative overflow-hidden">
      {/* Background animated blobs */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-[hsl(var(--primary)/0.08)] blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-[hsl(var(--accent)/0.06)] blur-[150px] animate-pulse" style={{ animationDelay: '1.5s' }} />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-[900px] mx-4 h-[540px] rounded-3xl overflow-hidden shadow-2xl flex">
        
        {/* LEFT: Blue creative panel */}
        <div
          className={`relative w-1/2 flex flex-col items-center justify-center transition-all duration-700 ease-in-out overflow-hidden ${
            isSignUp ? 'translate-x-full' : 'translate-x-0'
          }`}
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(210 80% 55%), hsl(var(--accent)))',
            zIndex: 20,
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
          }}
        >
          {/* Decorative shapes */}
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full border-2 border-white/10 animate-pulse" />
          <div className="absolute bottom-20 right-8 w-32 h-32 rounded-full border border-white/5" />
          <div className="absolute top-1/3 right-4 w-12 h-12 rounded-lg bg-white/5 rotate-45" />

          <div className="relative z-10 text-center px-8">
            <img src={logoErgon} alt="Ergon" className="h-12 mx-auto mb-6 brightness-0 invert" />
            
            {!isSignUp ? (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: 'Space Grotesk' }}>
                  Saúde Ocupacional<br />com Evidências
                </h2>
                <p className="text-white/70 text-sm mb-6 max-w-[260px] mx-auto">
                  O ecossistema completo para gestão de ergonomia e saúde do trabalho.
                </p>
                {/* 3D Character */}
                <img
                  src={loginCharacter}
                  alt=""
                  className="w-40 h-40 mx-auto mb-6 object-contain drop-shadow-2xl"
                  style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' }}
                />
                <Button
                  variant="outline"
                  className="rounded-full border-white/30 text-white bg-white/10 hover:bg-white/20 hover:text-white h-11 px-8 text-sm backdrop-blur-sm"
                  onClick={() => setIsSignUp(true)}
                >
                  Criar Conta
                </Button>
              </div>
            ) : (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: 'Space Grotesk' }}>
                  Já tem acesso?
                </h2>
                <p className="text-white/70 text-sm mb-6 max-w-[260px] mx-auto">
                  Entre com suas credenciais e retome o controle da sua gestão.
                </p>
                <img
                  src={loginCharacter}
                  alt=""
                  className="w-40 h-40 mx-auto mb-6 object-contain drop-shadow-2xl"
                  style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' }}
                />
                <Button
                  variant="outline"
                  className="rounded-full border-white/30 text-white bg-white/10 hover:bg-white/20 hover:text-white h-11 px-8 text-sm backdrop-blur-sm"
                  onClick={() => setIsSignUp(false)}
                >
                  Entrar
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Sign In Form */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center p-10 transition-all duration-700 ease-in-out ${
            isSignUp ? 'opacity-0 pointer-events-none -translate-x-8' : 'opacity-100 translate-x-0'
          }`}
          style={{
            marginLeft: '50%',
            background: 'linear-gradient(180deg, hsl(220 20% 12%), hsl(220 20% 9%))',
          }}
        >
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk' }}>
              Entrar
            </h2>
            <p className="text-white/40 text-sm mb-8">Acesse sua conta</p>

            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <label className="text-white/50 text-xs uppercase tracking-widest mb-2 block">E-mail</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary)/0.2)]"
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
                  className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-[hsl(var(--primary))] focus:ring-[hsl(var(--primary)/0.2)]"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl text-base font-semibold"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                  boxShadow: '0 8px 32px -8px hsl(var(--primary) / 0.5)',
                }}
              >
                {submitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </div>
        </div>

        {/* LEFT SIDE: Sign Up Form */}
        <div
          className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center p-10 transition-all duration-700 ease-in-out ${
            isSignUp ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none translate-x-8'
          }`}
          style={{
            marginRight: '50%',
            left: 0,
            background: 'linear-gradient(180deg, hsl(220 20% 12%), hsl(220 20% 9%))',
          }}
        >
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk' }}>
              Criar Conta
            </h2>
            <p className="text-white/40 text-sm mb-8">Solicite acesso ao sistema</p>

            <form onSubmit={handleSignUp} className="space-y-5">
              <div>
                <label className="text-white/50 text-xs uppercase tracking-widest mb-2 block">Nome</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Seu nome completo"
                  className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-[hsl(var(--accent))] focus:ring-[hsl(var(--accent)/0.2)]"
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
                  className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-[hsl(var(--accent))] focus:ring-[hsl(var(--accent)/0.2)]"
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
                  className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-[hsl(var(--accent))] focus:ring-[hsl(var(--accent)/0.2)]"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-semibold"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))',
                  boxShadow: '0 8px 32px -8px hsl(var(--accent) / 0.5)',
                }}
              >
                Solicitar Acesso
              </Button>
            </form>
          </div>
        </div>

        {/* Mobile fallback */}
        <div className="md:hidden absolute inset-0 flex flex-col items-center justify-center p-6 z-30"
          style={{ background: 'linear-gradient(180deg, hsl(220 20% 12%), hsl(220 20% 9%))' }}
        >
          <img src={logoErgon} alt="Ergon" className="h-10 mx-auto mb-6 brightness-0 invert" />
          {!isSignUp ? (
            <div className="w-full max-w-sm animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-1 text-center" style={{ fontFamily: 'Space Grotesk' }}>Entrar</h2>
              <p className="text-white/40 text-sm mb-6 text-center">Acesse sua conta</p>
              <form onSubmit={handleSignIn} className="space-y-4">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="E-mail" className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25" />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Senha" className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25" />
                <Button type="submit" className="w-full h-12" disabled={submitting} style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}>
                  {submitting ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
              <button onClick={() => setIsSignUp(true)} className="w-full text-center mt-6 text-sm text-[hsl(var(--primary))] font-medium">
                Não tem conta? Cadastrar
              </button>
            </div>
          ) : (
            <div className="w-full max-w-sm animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-1 text-center" style={{ fontFamily: 'Space Grotesk' }}>Criar Conta</h2>
              <p className="text-white/40 text-sm mb-6 text-center">Solicite acesso</p>
              <form onSubmit={handleSignUp} className="space-y-4">
                <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nome" className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="E-mail" className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25" />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Senha" className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/25" />
                <Button type="submit" className="w-full h-12" style={{ background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))' }}>
                  Solicitar Acesso
                </Button>
              </form>
              <button onClick={() => setIsSignUp(false)} className="w-full text-center mt-6 text-sm text-[hsl(var(--accent))] font-medium">
                Já tem conta? Entrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login2;
