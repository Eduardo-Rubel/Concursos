import { useStudyStore } from '../store/useStudyStore';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { isBefore, parseISO, isToday, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Revisoes() {
  const { revisions, subjects, completeRevision } = useStudyStore();

  const now = new Date();
  
  // Pending revisions that are due today or overdue
  const pendingRevisions = revisions.filter(
    r => r.status === 'pending' && (isBefore(parseISO(r.revisionDate), now) || isToday(parseISO(r.revisionDate)))
  ).sort((a, b) => parseISO(a.revisionDate).getTime() - parseISO(b.revisionDate).getTime());

  const completedRevisions = revisions.filter(r => r.status === 'completed');

  const getSubject = (id: string) => subjects.find(s => s.id === id);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 text-primary rounded-lg">
          <RefreshCw className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revisões Inteligentes</h1>
          <p className="text-muted mt-1">
            Curva de Ebbinghaus (24h, 7d, 30d). Revise estes tópicos para não esquecer.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pendentes ({pendingRevisions.length})</h2>
        {pendingRevisions.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-border rounded-xl">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
            <p className="text-muted text-lg">Nenhuma revisão pendente para hoje. Bom trabalho!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRevisions.map(rev => {
              const subject = getSubject(rev.subjectId);
              return (
                <Card key={rev.id} className="group border-warning/30 hover:border-warning/60 transition-colors">
                  <CardContent className="p-5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-3 h-12 rounded-full" 
                        style={{ backgroundColor: subject?.color || '#555' }} 
                      />
                      <div>
                        <h3 className="font-bold text-lg">{subject?.name || 'Matéria Excluída'}</h3>
                        <p className="text-xs text-muted mt-1">
                          Revisão de <span className="font-semibold text-warning">{rev.type}</span> &bull; 
                          Agendada para {format(parseISO(rev.revisionDate), "dd 'de' MMM", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="primary" 
                      className="bg-success hover:bg-success/90"
                      onClick={() => completeRevision(rev.id)}
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Concluir
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {completedRevisions.length > 0 && (
        <div className="pt-8">
          <h2 className="text-lg font-semibold text-muted mb-4">Revisões Concluídas ({completedRevisions.length})</h2>
          <div className="opacity-60 grayscale">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {completedRevisions.slice(0, 6).map(rev => (
                <div key={rev.id} className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
                  <span className="text-sm font-medium">{getSubject(rev.subjectId)?.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-success/20 text-success">{rev.type} ✓</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
