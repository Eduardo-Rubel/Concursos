import { useStudyStore } from '../store/useStudyStore';
import { Card, CardContent } from '../components/ui/Card';
import { BookOpen, FileText, Star, BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ResumosDashboard() {
  const { notes, subjects } = useStudyStore();
  
  const getSubject = (id: string) => subjects.find(s => s.id === id);

  const favoriteNotes = notes.filter(n => n.isFavorite).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const recentNotes = notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
  
  // By Subject
  const notesBySubject: Record<string, number> = {};
  notes.forEach(n => {
    notesBySubject[n.subjectId] = (notesBySubject[n.subjectId] || 0) + 1;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Base de Conhecimento</h1>
            <p className="text-muted mt-1">Sua biblioteca pessoal de resumos e anotações.</p>
          </div>
        </div>
        <Link 
          to="/resumos/novo" 
          className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Novo Resumo
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted font-medium">Total de Resumos</p>
              <h3 className="text-2xl font-bold">{notes.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-warning/10 text-warning rounded-lg">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted font-medium">Resumos Favoritos</p>
              <h3 className="text-2xl font-bold">{favoriteNotes.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-success/10 text-success rounded-lg">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted font-medium">Conhecimento (Média)</p>
              <h3 className="text-2xl font-bold">
                {notes.length > 0 ? Math.round(notes.reduce((acc, n) => acc + n.comprehensionLevel, 0) / notes.length) : 0}%
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Editados Recentemente</h3>
            <Link to="/resumos/lista" className="text-sm text-primary hover:underline">Ver todos</Link>
          </div>
          
          {recentNotes.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-border rounded-xl text-muted">
              Você ainda não criou nenhum resumo.
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotes.map(note => {
                const subject = getSubject(note.subjectId);
                return (
                  <Link key={note.id} to={`/resumos/${note.id}`}>
                    <Card className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-10 rounded-full" style={{ backgroundColor: subject?.color || '#555' }} />
                          <div>
                            <h4 className="font-bold text-base flex items-center gap-2">
                              {note.title || 'Sem título'}
                              {note.isFavorite && <Star className="w-4 h-4 text-warning fill-warning" />}
                            </h4>
                            <p className="text-xs text-muted">
                              {subject?.name} &bull; Editado em {format(parseISO(note.updatedAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full border ${
                            note.status === 'Completo' ? 'bg-success/10 text-success border-success/20' : 
                            note.status === 'Revisar' ? 'bg-warning/10 text-warning border-warning/20' : 
                            'bg-surface-hover text-muted border-border'
                          }`}>
                            {note.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Resumos por Matéria</h3>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {Object.entries(notesBySubject).sort((a, b) => b[1] - a[1]).map(([subjectId, count]) => {
                  const subject = getSubject(subjectId);
                  return (
                    <div key={subjectId} className="flex justify-between items-center p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject?.color || '#555' }} />
                        <span className="font-medium text-sm">{subject?.name || 'Excluída'}</span>
                      </div>
                      <span className="text-sm text-muted bg-surface-hover px-2 py-1 rounded-md">{count}</span>
                    </div>
                  );
                })}
                {Object.keys(notesBySubject).length === 0 && (
                  <div className="p-6 text-center text-muted text-sm">
                    Nenhum dado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
