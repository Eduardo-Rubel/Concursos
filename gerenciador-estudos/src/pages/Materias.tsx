import { useState } from 'react';
import { useStudyStore } from '../store/useStudyStore';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import type { Priority } from '../types';

export function Materias() {
  const { subjects, addSubject, deleteSubject } = useStudyStore();
  const [isAdding, setIsAdding] = useState(false);
  
  // Simple form state for MVP
  const [newSubject, setNewSubject] = useState({
    name: '',
    color: '#4f46e5',
    weight: 1,
    priority: 'Alta' as Priority,
    status: 'Ativo' as const
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.name.trim()) return;
    addSubject(newSubject);
    setIsAdding(false);
    setNewSubject({ ...newSubject, name: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Matérias</h1>
          <p className="text-muted mt-1">Configure o peso e a prioridade de cada disciplina.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          <Plus className="w-4 h-4" /> Nova Matéria
        </Button>
      </div>

      {isAdding && (
        <Card className="border-primary/50 shadow-[0_0_15px_rgba(79,70,229,0.1)]">
          <CardContent className="p-6">
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-medium">Nome da Matéria</label>
                <input 
                  type="text" 
                  value={newSubject.name}
                  onChange={e => setNewSubject({...newSubject, name: e.target.value})}
                  className="w-full h-10 px-3 bg-surface border border-border rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Ex: Português"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Prioridade</label>
                <select 
                  value={newSubject.priority}
                  onChange={e => setNewSubject({...newSubject, priority: e.target.value as Priority})}
                  className="w-full h-10 px-3 bg-surface border border-border rounded-lg focus:outline-none focus:border-primary"
                >
                  <option value="Alta">Alta</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Cor</label>
                <input 
                  type="color" 
                  value={newSubject.color}
                  onChange={e => setNewSubject({...newSubject, color: e.target.value})}
                  className="w-full h-10 p-1 bg-surface border border-border rounded-lg cursor-pointer"
                />
              </div>
              <Button type="submit" fullWidth>Salvar</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map(subject => (
          <Card key={subject.id} className="group hover:border-border/80 transition-colors">
            <CardContent className="p-5 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-4 h-12 rounded-full" 
                  style={{ backgroundColor: subject.color }} 
                />
                <div>
                  <h3 className="font-bold text-lg">{subject.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface-hover text-muted font-medium border border-border">
                      {subject.priority} Prioridade
                    </span>
                  </div>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button className="text-muted hover:text-primary transition-colors p-1">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  className="text-muted hover:text-danger transition-colors p-1"
                  onClick={() => deleteSubject(subject.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
        {subjects.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl">
            <p className="text-muted">Nenhuma matéria cadastrada.</p>
            <Button variant="ghost" className="mt-2 text-primary" onClick={() => setIsAdding(true)}>
              Adicionar primeira matéria
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
