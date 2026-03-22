import { useAuth, AppRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import logoIcon from '@/assets/logo-ergon-icon.png';

const ROLE_LABELS: Record<AppRole, string> = {
  admin_master: 'Admin Master',
  consultor: 'Consultor',
  empresa_admin: 'Admin Empresa',
  empresa_gestor: 'Gestor',
  colaborador: 'Colaborador',
};

const TopNav = () => {
  const { user, profile, primaryRole, signOut } = useAuth();
  const navigate = useNavigate();

  const roleLabel = primaryRole ? ROLE_LABELS[primaryRole] : '';
  const homeRoute = primaryRole === 'colaborador' ? '/meu-painel' : '/';

  return (
    <header className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate(homeRoute)}
          >
            <img src={logoIcon} alt="Ergon" className="h-10 w-auto" />
          </div>

          <Button
            onClick={() => navigate(homeRoute)}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_4px_14px_0_hsl(var(--primary)/0.4)] hover:shadow-[0_6px_20px_0_hsl(var(--primary)/0.5)] hover:scale-105 hover:-translate-y-0.5 transition-all duration-200"
            size="sm"
          >
            Menu
          </Button>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{profile?.full_name || user?.email}</p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="rounded-full shadow-[0_4px_14px_0_hsl(var(--border)/0.4)] hover:scale-105 hover:-translate-y-0.5 transition-all duration-200"
            >
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
