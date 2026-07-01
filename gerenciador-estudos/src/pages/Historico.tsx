import { useState } from 'react';
import { useStudyStore } from '../store/useStudyStore';
import { Card, CardContent } from '../components/ui/Card';
import { History, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export function Historico() {
  const { sessions, subjects } = useStudyStore();
  const [searchTerm, setSearchTerm] = useState('');

  const getSubject = (id: string) => subjects.find(s => s.id === id);

  const filteredSessions = sessions
    .filter(s => {
      const subjectName = getSubject(s.subjectId)?.name.toLowerCase() || '';
      const notes = s.notes?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      return subjectName.includes(term) || notes.includes(term);
    })
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-lg">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Histórico</h1>
            <p className="text-muted mt-1">Veja todas as suas sessões de estudo passadas.</p>
          </div>
        </div>
        
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder="Buscar matéria ou anotação..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-surface border border-border rounded-lg focus:outline-none focus:border-primary text-sm"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-hidden">
          {filteredSessions.length === 0 ? (
            <div className="p-12 text-center text-muted">
              Nenhuma sessão de estudo encontrada.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface-hover/50 text-muted uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Data</th>
                    <th className="px-6 py-4 font-semibold">Matéria</th>
                    <th className="px-6 py-4 font-semibold">Duração</th>
                    <th className="px-6 py-4 font-semibold">Anotações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSessions.map(session => {
                    const subject = getSubject(session.subjectId);
                    return (
                      <tr key={session.id} className="hover:bg-surface-hover/50 transition-colors">
                        <td className="px-6 py-4">
                          {format(parseISO(session.date), "dd/MM/yyyy HH:mm")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject?.color || '#555' }} />
                            <span className="font-medium">{subject?.name || 'Excluída'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-primary">
                          {session.durationMinutes} min
                        </td>
                        <td className="px-6 py-4 text-muted truncate max-w-[300px]">
                          {session.notes || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
