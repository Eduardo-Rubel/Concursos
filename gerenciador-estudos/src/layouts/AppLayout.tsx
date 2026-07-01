import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarDays, 
  Timer, 
  History, 
  BarChart3,
  RefreshCcw,
  FileQuestion,
  Settings,
  Library
} from 'lucide-react';
import { cn } from '../utils/cn';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/materias', label: 'Matérias', icon: BookOpen },
  { path: '/cronograma', label: 'Cronograma', icon: CalendarDays },
  { path: '/sessao', label: 'Estudar (Pomodoro)', icon: Timer },
  { path: '/revisoes', label: 'Revisões', icon: RefreshCcw },
  { path: '/questoes', label: 'Questões / Simulados', icon: FileQuestion },
  { path: '/resumos', label: 'Base de Conhecimento', icon: Library },
  { path: '/historico', label: 'Histórico', icon: History },
  { path: '/estatisticas', label: 'Estatísticas', icon: BarChart3 },
  { path: '/configuracoes', label: 'Configurações', icon: Settings },
];

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground selection:bg-primary/30">
      
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-surface flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight">
            <Timer className="w-6 h-6" />
            <span>StudyManager</span>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted hover:text-foreground hover:bg-surface-hover"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              ED
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Eduardo</span>
              <span className="text-xs text-muted">Plano Pro</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar (Mobile) */}
        <header className="h-14 border-b border-border bg-surface flex items-center px-4 md:hidden">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Timer className="w-5 h-5" />
            <span>StudyManager</span>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

    </div>
  );
}
