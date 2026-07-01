import { useState } from 'react';
import { useStudyStore } from '../store/useStudyStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';

const DAYS_OF_WEEK = [
  'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
];

export function Cronograma() {
  const { schedules, subjects, addSchedule, deleteSchedule } = useStudyStore();
  const [activeTab, setActiveTab] = useState<number>(new Date().getDay());
  const [isAdding, setIsAdding] = useState(false);

  const [newSchedule, setNewSchedule] = useState({
    dayOfWeek: activeTab,
    startTime: '08:00',
    endTime: '09:00',
    subjectId: subjects[0]?.id || ''
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedule.subjectId) return alert("Selecione uma matéria!");
    if (newSchedule.startTime >= newSchedule.endTime) return alert("Horário inválido!");
    
    addSchedule({
      ...newSchedule,
      dayOfWeek: activeTab as any
    });
    
    setIsAdding(false);
  };

  const currentDaySchedules = schedules
    .filter(s => s.dayOfWeek === activeTab)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getSubject = (id: string) => subjects.find(s => s.id === id);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-lg">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cronograma</h1>
            <p className="text-muted mt-1">Planeje sua rotina de estudos semanal.</p>
          </div>
        </div>
        <Button onClick={() => { setIsAdding(!isAdding); setNewSchedule({...newSchedule, dayOfWeek: activeTab, subjectId: subjects[0]?.id || ''}); }} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Bloco
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
        {DAYS_OF_WEEK.map((day, index) => (
          <button
            key={day}
            onClick={() => { setActiveTab(index); setIsAdding(false); }}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === index 
                ? 'bg-primary text-white' 
                : 'bg-surface border border-border text-muted hover:text-foreground'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {isAdding && (
        <Card className="border-primary/50">
          <CardContent className="p-6">
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium">Matéria</label>
                <select 
                  value={newSchedule.subjectId}
                  onChange={e => setNewSchedule({...newSchedule, subjectId: e.target.value})}
                  className="w-full h-10 px-3 bg-surface border border-border rounded-lg"
                >
                  {subjects.length === 0 && <option value="">Nenhuma matéria cadastrada</option>}
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Início</label>
                <input 
                  type="time" 
                  value={newSchedule.startTime}
                  onChange={e => setNewSchedule({...newSchedule, startTime: e.target.value})}
                  className="w-full h-10 px-3 bg-surface border border-border rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Fim</label>
                <input 
                  type="time" 
                  value={newSchedule.endTime}
                  onChange={e => setNewSchedule({...newSchedule, endTime: e.target.value})}
                  className="w-full h-10 px-3 bg-surface border border-border rounded-lg"
                />
              </div>
              <Button type="submit" fullWidth className="md:col-span-4 mt-2">Salvar Horário</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Horários - {DAYS_OF_WEEK[activeTab]}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentDaySchedules.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted">Nenhum bloco de estudo planejado para este dia.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentDaySchedules.map(schedule => {
                const subject = getSubject(schedule.subjectId);
                return (
                  <div key={schedule.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-border/80 bg-surface transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-20 h-12 bg-surface-hover rounded-lg font-mono text-sm font-medium">
                        <span>{schedule.startTime}</span>
                        <span className="text-xs text-muted leading-tight">até {schedule.endTime}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject?.color || '#555' }} />
                        <span className="font-semibold text-lg">{subject?.name || 'Matéria Excluída'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteSchedule(schedule.id)}
                      className="p-2 text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-danger/10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
