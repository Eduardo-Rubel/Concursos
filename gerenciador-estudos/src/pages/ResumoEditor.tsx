import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useStudyStore } from '../store/useStudyStore';
import { RichTextEditor } from '../components/ui/RichTextEditor';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Save, Star } from 'lucide-react';
import type { StudyNote } from '../types';

export function ResumoEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { notes, subjects, addNote, updateNote, scheduleRevisionsForNote } = useStudyStore();
  
  const existingNote = notes.find(n => n.id === id);
  const initialState = location.state as { subjectId?: string, sessionId?: string, title?: string } || {};
  
  const [noteData, setNoteData] = useState<Partial<StudyNote>>(existingNote || {
    title: initialState.title || '',
    content: '',
    subjectId: initialState.subjectId || subjects[0]?.id || '',
    sessionId: initialState.sessionId,
    tags: [],
    objectives: '',
    difficulties: '',
    errorsMade: '',
    comprehensionLevel: 50,
    confidenceLevel: 'Médio',
    isFavorite: false,
    status: 'Em andamento'
  });

  const handleSave = () => {
    if (!noteData.title?.trim() || !noteData.subjectId) {
      alert('Título e Matéria são obrigatórios.');
      return;
    }

    if (existingNote) {
      updateNote(existingNote.id, noteData);
      
      // If it changed to Completo and wasn't before, maybe schedule revisions? (Optional enhancement)
      if (noteData.status === 'Completo' && existingNote.status !== 'Completo') {
        scheduleRevisionsForNote(existingNote.id, noteData.subjectId!);
        alert('Resumo atualizado e revisões agendadas!');
      } else {
        alert('Resumo atualizado!');
      }
    } else {
      const newNoteId = addNote(noteData as Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>);
      
      if (noteData.status === 'Completo') {
        scheduleRevisionsForNote(newNoteId, noteData.subjectId!);
        alert('Resumo salvo e ciclo de revisões (24h, 7d, 30d) agendado!');
      } else {
        alert('Resumo criado (Em andamento)!');
      }
      navigate('/resumos');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2 -ml-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            className={noteData.isFavorite ? 'text-warning' : 'text-muted'}
            onClick={() => setNoteData({ ...noteData, isFavorite: !noteData.isFavorite })}
          >
            <Star className={`w-5 h-5 ${noteData.isFavorite ? 'fill-warning' : ''}`} />
          </Button>
          <Button variant="primary" className="gap-2" onClick={handleSave}>
            <Save className="w-4 h-4" /> Salvar Resumo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Editor Main Area */}
        <div className="lg:col-span-3 space-y-4">
          <input 
            type="text" 
            placeholder="Título do Resumo..." 
            value={noteData.title}
            onChange={e => setNoteData({ ...noteData, title: e.target.value })}
            className="w-full text-4xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-muted/50"
          />
          <RichTextEditor 
            content={noteData.content || ''} 
            onChange={(html) => setNoteData({ ...noteData, content: html })} 
          />
        </div>

        {/* Metadata Sidebar */}
        <div className="space-y-6">
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted uppercase tracking-wider text-xs">Matéria</label>
            <select 
              value={noteData.subjectId}
              onChange={e => setNoteData({...noteData, subjectId: e.target.value})}
              className="w-full h-10 px-3 bg-surface border border-border rounded-lg"
            >
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted uppercase tracking-wider text-xs">Status</label>
            <select 
              value={noteData.status}
              onChange={e => setNoteData({...noteData, status: e.target.value as any})}
              className="w-full h-10 px-3 bg-surface border border-border rounded-lg"
            >
              <option value="Em andamento">Em andamento</option>
              <option value="Revisar">Revisar</option>
              <option value="Completo">Completo</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted uppercase tracking-wider text-xs flex justify-between">
              Nível de Compreensão <span>{noteData.comprehensionLevel}%</span>
            </label>
            <input 
              type="range" 
              min="0" max="100" step="10"
              value={noteData.comprehensionLevel}
              onChange={e => setNoteData({...noteData, comprehensionLevel: Number(e.target.value)})}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted uppercase tracking-wider text-xs">Nível de Confiança</label>
            <div className="flex gap-2">
              {['Baixo', 'Médio', 'Alto'].map(level => (
                <button
                  key={level}
                  onClick={() => setNoteData({...noteData, confidenceLevel: level as any})}
                  className={`flex-1 py-1.5 text-xs font-medium rounded border transition-colors ${
                    noteData.confidenceLevel === level 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-surface border-border text-muted hover:bg-surface-hover'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-border" />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted uppercase tracking-wider text-xs">Erros Cometidos / Dificuldades</label>
            <textarea 
              value={noteData.difficulties}
              onChange={e => setNoteData({...noteData, difficulties: e.target.value})}
              placeholder="Onde você travou? Ex: Errei a crase antes de pronomes."
              className="w-full h-24 p-3 bg-surface border border-border rounded-lg resize-none text-sm"
            />
          </div>

        </div>
      </div>
    </div>
  );
}
