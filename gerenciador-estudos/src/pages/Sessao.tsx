import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudyStore } from '../store/useStudyStore';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Play, Pause, Square } from 'lucide-react';

export function Sessao() {
  const navigate = useNavigate();
  const { subjects, settings, addSession } = useStudyStore();
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || '');
  
  const [timeLeft, setTimeLeft] = useState(settings.pomodoroWork * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  
  // Basic timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play sound alert here in the future
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const finishSession = () => {
    setIsActive(false);
    const durationStudied = settings.pomodoroWork * 60 - timeLeft;
    const minutes = Math.max(1, Math.floor(durationStudied / 60)); // Minimum 1 minute
    
    if (selectedSubject) {
      const sessionId = addSession({
        subjectId: selectedSubject,
        durationMinutes: minutes,
        date: new Date().toISOString(),
        notes: sessionNotes
      });
      
      // Enviar Telegram
      if (settings.enableTelegramAlerts && settings.telegramBotToken && settings.telegramChatId) {
        import('../services/telegramService').then(({ sendTelegramMessage }) => {
          const subject = subjects.find(s => s.id === selectedSubject);
          const msg = `🎯 <b>Sessão Finalizada!</b>\n\nMatéria: ${subject?.name || 'Não informada'}\nTempo: ${minutes} minutos\n\n<i>${sessionNotes || 'Bom trabalho!'}</i>`;
          sendTelegramMessage(settings.telegramBotToken!, settings.telegramChatId!, msg);
        });
      }

      // Reset
      setTimeLeft(settings.pomodoroWork * 60);
      setSessionNotes('');
      
      if (confirm(`Sessão de ${minutes} minutos finalizada!\nDeseja criar um resumo agora para fixar o conteúdo?`)) {
        navigate('/resumos/novo', { 
          state: { 
            subjectId: selectedSubject, 
            sessionId: sessionId,
            title: sessionNotes || '' 
          } 
        });
      }
    } else {
      alert('Selecione uma matéria primeiro.');
    }
  };

  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mb-4 text-muted">
          <Play className="w-8 h-8 ml-1" />
        </div>
        <h2 className="text-xl font-bold mb-2">Nenhuma matéria cadastrada</h2>
        <p className="text-muted max-w-md">Vá em "Matérias" e adicione disciplinas antes de iniciar uma sessão de estudos.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pt-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Foco Total</h1>
        <p className="text-muted mt-2">Escolha a matéria e inicie o timer Pomodoro.</p>
      </div>

      <Card className="border-t-4" style={{ 
        borderTopColor: subjects.find(s => s.id === selectedSubject)?.color || 'transparent' 
      }}>
        <CardContent className="p-8 flex flex-col items-center">
          
          <div className="w-full max-w-xs mb-8">
            <label className="block text-sm font-medium text-muted mb-2 text-center">Disciplina atual</label>
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full h-12 px-4 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary text-center font-medium"
              disabled={isActive}
            >
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>

          <div className="text-8xl font-black tracking-tighter tabular-nums mb-12 text-foreground">
            {formatTime(timeLeft)}
          </div>

          <div className="flex items-center gap-4">
            <Button 
              size="lg" 
              variant={isActive ? 'secondary' : 'primary'} 
              className="w-40 rounded-full gap-2 text-lg h-14"
              onClick={toggleTimer}
            >
              {isActive ? <><Pause className="w-5 h-5"/> Pausar</> : <><Play className="w-5 h-5"/> Iniciar</>}
            </Button>
            
            <Button 
              size="lg" 
              variant="danger" 
              className="w-40 rounded-full gap-2 text-lg h-14"
              onClick={finishSession}
              disabled={timeLeft === settings.pomodoroWork * 60}
            >
              <Square className="w-5 h-5"/> Finalizar
            </Button>
          </div>
          
        </CardContent>
      </Card>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted pl-1">Anotações da Sessão (opcional)</label>
        <textarea 
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder="O que você estudou neste ciclo? (ex: Teoria de Crase)"
          className="w-full h-24 p-4 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary resize-none"
        />
      </div>
      
    </div>
  );
}
