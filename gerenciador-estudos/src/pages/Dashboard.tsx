import { useEffect } from 'react';
import { useStudyStore } from '../store/useStudyStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { BookOpen, Timer, CheckCircle, Target } from 'lucide-react';
import { format, parseISO, isToday } from 'date-fns';

export function Dashboard() {
  const { settings, subjects, sessions, revisions, updateSettings } = useStudyStore();

  // Telegram Daily Alert Logic
  useEffect(() => {
    if (settings.enableTelegramAlerts && settings.telegramBotToken && settings.telegramChatId) {
      const today = new Date();
      const todayString = format(today, 'yyyy-MM-dd');
      
      if (settings.lastTelegramDailyAlertDate !== todayString) {
        // Find pending revisions up to today
        const pendingRevisions = revisions.filter(r => r.status === 'pending' && parseISO(r.revisionDate) <= today);
        
        if (pendingRevisions.length > 0) {
          import('../services/telegramService').then(async ({ sendTelegramMessage }) => {
            const msg = `📚 <b>Bom dia, Comandante!</b>\n\nVocê tem <b>${pendingRevisions.length}</b> revisões pendentes aguardando hoje.\n\nBora garantir a retenção de conteúdo! 🚀`;
            const success = await sendTelegramMessage(settings.telegramBotToken!, settings.telegramChatId!, msg);
            
            if (success) {
              updateSettings({ lastTelegramDailyAlertDate: todayString });
            }
          });
        } else {
          updateSettings({ lastTelegramDailyAlertDate: todayString });
        }
      }
    }
  }, [settings, revisions, updateSettings]);
  
  const todaySessions = sessions.filter(s => isToday(parseISO(s.date)));
  const minutesStudiedToday = todaySessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const hoursStudiedToday = (minutesStudiedToday / 60).toFixed(1);
  
  const progressPercentage = Math.min(100, (minutesStudiedToday / (settings.dailyGoalHours * 60)) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bom dia {settings.userName}</h1>
        <p className="text-muted mt-2">Hoje você possui <strong className="text-foreground">{settings.dailyGoalHours}h</strong> como meta de estudo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted font-medium">Estudado Hoje</p>
              <h3 className="text-2xl font-bold">{hoursStudiedToday}h</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-warning/10 text-warning rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted font-medium">Disciplinas Ativas</p>
              <h3 className="text-2xl font-bold">{subjects.filter(s => s.status === 'Ativo').length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-success/10 text-success rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted font-medium">Revisões Pendentes</p>
              <h3 className="text-2xl font-bold">0</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-danger/10 text-danger rounded-lg">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted font-medium">Próximo Simulado</p>
              <h3 className="text-2xl font-bold">Em 4 d</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meta Diária</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted">Progresso ({hoursStudiedToday}h de {settings.dailyGoalHours}h)</span>
            <span className="font-bold">{progressPercentage.toFixed(0)}%</span>
          </div>
          <ProgressBar value={progressPercentage} className="h-3" />
        </CardContent>
      </Card>
    </div>
  );
}
