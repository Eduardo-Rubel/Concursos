import { useState } from 'react';
import { useStudyStore } from '../store/useStudyStore';
import { Card, CardContent } from '../components/ui/Card';
import { Search, Filter, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ResumosLista() {
  const { notes, subjects } = useStudyStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');

  const getSubject = (id: string) => subjects.find(s => s.id === id);

  const filteredNotes = notes
    .filter(n => filterSubject === 'all' || n.subjectId === filterSubject)
    .filter(n => {
      const term = searchTerm.toLowerCase();
      return (
        n.title.toLowerCase().includes(term) ||
        n.content.toLowerCase().includes(term) ||
        getSubject(n.subjectId)?.name.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pesquisar Resumos</h1>
          <p className="text-muted mt-1">Encontre facilmente qualquer anotação pela palavra-chave.</p>
        </div>

        <div className="flex gap-2 flex-1 md:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Buscar título ou conteúdo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-surface border border-border rounded-lg focus:outline-none focus:border-primary text-sm"
            />
          </div>
          <div className="relative w-40">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <select 
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              className="w-full h-10 pl-9 pr-8 bg-surface border border-border rounded-lg focus:outline-none focus:border-primary text-sm appearance-none"
            >
              <option value="all">Todas Matérias</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted border border-dashed border-border rounded-xl">
            Nenhum resumo encontrado para esta pesquisa.
          </div>
        ) : (
          filteredNotes.map(note => {
            const subject = getSubject(note.subjectId);
            // Extract raw text from HTML snippet to show as description
            const rawText = note.content.replace(/<[^>]+>/g, ' ').substring(0, 100) + '...';
            
            return (
              <Link key={note.id} to={`/resumos/${note.id}`}>
                <Card className="h-full hover:border-primary/50 transition-all hover:shadow-md hover:-translate-y-0.5 group">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: subject?.color || '#555' }} />
                        <span className="text-xs font-medium text-muted">{subject?.name}</span>
                      </div>
                      {note.isFavorite && <Star className="w-4 h-4 text-warning fill-warning" />}
                    </div>
                    
                    <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {note.title || 'Sem título'}
                    </h3>
                    
                    <p className="text-sm text-muted line-clamp-3 mb-4 flex-1">
                      {rawText}
                    </p>

                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-border">
                      <span className="text-xs text-muted">
                        {format(parseISO(note.updatedAt), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm border ${
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
          })
        )}
      </div>
    </div>
  );
}
