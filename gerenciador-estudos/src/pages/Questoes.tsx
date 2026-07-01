import { useState } from 'react';
import { useStudyStore } from '../store/useStudyStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileQuestion, Target, CheckCircle2, XCircle, BrainCircuit, Sparkles, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateQuestionsFromText } from '../services/aiService';
import type { GeneratedQuestion } from '../services/aiService';

export function Questoes() {
  const { subjects, questionLogs, mockExams, notes, settings, addQuestionLog, addMockExam } = useStudyStore();
  const [activeTab, setActiveTab] = useState<'questoes' | 'simulados' | 'gerador'>('questoes');

  // Form states
  const [newLog, setNewLog] = useState({
    subjectId: subjects[0]?.id || '',
    topic: '',
    total: 10,
    correct: 8
  });

  const [newExam, setNewExam] = useState({
    title: 'Simulado Final - PMPR',
    totalQuestions: 60,
    score: 45,
    timeSpentMinutes: 240,
    notes: ''
  });

  // AI Generator States
  const [aiConfig, setAiConfig] = useState({ noteId: '', amount: 5, difficulty: 'Médio' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizData, setQuizData] = useState<GeneratedQuestion[] | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.geminiApiKey) {
      alert("Por favor, configure sua chave da API do Gemini na aba de Configurações primeiro.");
      return;
    }
    const selectedNote = notes.find(n => n.id === aiConfig.noteId);
    if (!selectedNote) return alert("Selecione um resumo válido.");

    setIsGenerating(true);
    setQuizData(null);
    setQuizFinished(false);
    setUserAnswers([]);
    setCurrentQIndex(0);

    try {
      // Clean HTML tags from content to save tokens
      const plainText = selectedNote.content.replace(/<[^>]+>/g, ' ');
      const questions = await generateQuestionsFromText(settings.geminiApiKey, plainText, aiConfig.amount, aiConfig.difficulty);
      setQuizData(questions);
    } catch (err: any) {
      alert("Falha ao gerar questões: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (quizFinished) return;
    const newAnswers = [...userAnswers];
    newAnswers[currentQIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const handleFinishQuiz = () => {
    setQuizFinished(true);
    // Save to history automatically
    const correctCount = quizData!.reduce((acc, q, idx) => acc + (q.correctAnswerIndex === userAnswers[idx] ? 1 : 0), 0);
    const selectedNote = notes.find(n => n.id === aiConfig.noteId);
    
    addQuestionLog({
      subjectId: selectedNote?.subjectId || subjects[0]?.id || '',
      topic: `Quiz IA: ${selectedNote?.title || 'Resumo'}`,
      total: quizData!.length,
      correct: correctCount,
      date: new Date().toISOString()
    });
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    addQuestionLog({
      ...newLog,
      date: new Date().toISOString()
    });
    setNewLog({ ...newLog, topic: '' });
  };

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    addMockExam({
      ...newExam,
      date: new Date().toISOString()
    });
    setNewExam({ ...newExam, title: '' });
  };

  const getSubject = (id: string) => subjects.find(s => s.id === id);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 text-primary rounded-lg">
          <FileQuestion className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Questões e Simulados</h1>
          <p className="text-muted mt-1">Registre seu desempenho prático e meça sua evolução.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab('questoes')}
          className={`pb-3 font-medium transition-colors border-b-2 ${
            activeTab === 'questoes' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Bateria de Questões
        </button>
        <button
          onClick={() => setActiveTab('simulados')}
          className={`pb-3 font-medium transition-colors border-b-2 ${
            activeTab === 'simulados' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          Simulados Completos
        </button>
        <button
          onClick={() => setActiveTab('gerador')}
          className={`pb-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'gerador' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Gerador IA
        </button>
      </div>

      {activeTab === 'questoes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>Nova Bateria</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddLog} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Matéria</label>
                  <select 
                    value={newLog.subjectId}
                    onChange={e => setNewLog({...newLog, subjectId: e.target.value})}
                    className="w-full h-10 px-3 bg-surface border border-border rounded-lg"
                  >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Assunto (Tópico)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Direitos Individuais"
                    value={newLog.topic}
                    onChange={e => setNewLog({...newLog, topic: e.target.value})}
                    className="w-full h-10 px-3 bg-surface border border-border rounded-lg"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Total</label>
                    <input 
                      type="number" 
                      min="1"
                      value={newLog.total}
                      onChange={e => setNewLog({...newLog, total: Number(e.target.value)})}
                      className="w-full h-10 px-3 bg-surface border border-border rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Acertos</label>
                    <input 
                      type="number" 
                      min="0"
                      max={newLog.total}
                      value={newLog.correct}
                      onChange={e => setNewLog({...newLog, correct: Number(e.target.value)})}
                      className="w-full h-10 px-3 bg-surface border border-border rounded-lg"
                    />
                  </div>
                </div>
                <Button type="submit" fullWidth>Salvar Registro</Button>
              </form>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold">Últimas Resoluções</h3>
            {questionLogs.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-border rounded-xl text-muted">
                Nenhum registro encontrado.
              </div>
            ) : (
              <div className="space-y-3">
                {questionLogs.slice().reverse().map(log => {
                  const subject = getSubject(log.subjectId);
                  const percentage = ((log.correct / log.total) * 100).toFixed(1);
                  return (
                    <Card key={log.id} className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject?.color || '#555' }} />
                            <span className="font-semibold">{subject?.name || 'Excluída'}</span>
                            <span className="text-muted text-sm px-2">&bull; {log.topic}</span>
                          </div>
                          <p className="text-xs text-muted">{format(parseISO(log.date), "dd/MM/yyyy HH:mm")}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-4 text-sm font-medium">
                            <span className="flex items-center gap-1 text-success"><CheckCircle2 className="w-4 h-4"/> {log.correct}</span>
                            <span className="flex items-center gap-1 text-danger"><XCircle className="w-4 h-4"/> {log.total - log.correct}</span>
                          </div>
                          <div className="text-xl font-bold text-primary w-20 text-right">
                            {percentage}%
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'simulados' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>Novo Simulado</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddExam} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Título</label>
                  <input 
                    type="text" 
                    value={newExam.title}
                    onChange={e => setNewExam({...newExam, title: e.target.value})}
                    className="w-full h-10 px-3 bg-surface border border-border rounded-lg"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Questões</label>
                    <input 
                      type="number" 
                      value={newExam.totalQuestions}
                      onChange={e => setNewExam({...newExam, totalQuestions: Number(e.target.value)})}
                      className="w-full h-10 px-3 bg-surface border border-border rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Acertos</label>
                    <input 
                      type="number" 
                      value={newExam.score}
                      onChange={e => setNewExam({...newExam, score: Number(e.target.value)})}
                      className="w-full h-10 px-3 bg-surface border border-border rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Tempo Gasto (minutos)</label>
                  <input 
                    type="number" 
                    value={newExam.timeSpentMinutes}
                    onChange={e => setNewExam({...newExam, timeSpentMinutes: Number(e.target.value)})}
                    className="w-full h-10 px-3 bg-surface border border-border rounded-lg"
                  />
                </div>
                <Button type="submit" fullWidth>Salvar Simulado</Button>
              </form>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold">Simulados Realizados</h3>
            {mockExams.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-border rounded-xl text-muted">
                Nenhum simulado registrado.
              </div>
            ) : (
              <div className="space-y-3">
                {mockExams.slice().reverse().map(exam => {
                  const percentage = ((exam.score / exam.totalQuestions) * 100).toFixed(1);
                  return (
                    <Card key={exam.id} className="relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                      <CardContent className="p-5 pl-6 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-lg mb-1 flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary"/> {exam.title}
                          </h4>
                          <p className="text-sm text-muted">
                            {format(parseISO(exam.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} &bull; {exam.timeSpentMinutes} minutos de duração
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-foreground">{percentage}%</div>
                          <div className="text-sm text-muted">{exam.score} de {exam.totalQuestions} certas</div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'gerador' && (
        <div className="space-y-6">
          {!quizData ? (
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">Gerador de Questões</CardTitle>
                <p className="text-muted text-sm mt-2">
                  Transforme seus resumos em simulados interativos em segundos usando Inteligência Artificial.
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleGenerate} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Base de Conhecimento (Resumo)</label>
                    <select 
                      value={aiConfig.noteId}
                      onChange={e => setAiConfig({...aiConfig, noteId: e.target.value})}
                      className="w-full h-12 px-3 bg-surface border border-border rounded-lg"
                      required
                    >
                      <option value="">Selecione um resumo...</option>
                      {notes.map(n => <option key={n.id} value={n.id}>{n.title}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quantidade</label>
                      <select 
                        value={aiConfig.amount}
                        onChange={e => setAiConfig({...aiConfig, amount: Number(e.target.value)})}
                        className="w-full h-12 px-3 bg-surface border border-border rounded-lg"
                      >
                        <option value={3}>3 Questões</option>
                        <option value={5}>5 Questões</option>
                        <option value={10}>10 Questões</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nível / Estilo</label>
                      <select 
                        value={aiConfig.difficulty}
                        onChange={e => setAiConfig({...aiConfig, difficulty: e.target.value})}
                        className="w-full h-12 px-3 bg-surface border border-border rounded-lg"
                      >
                        <option value="Fácil (Direto ao ponto)">Fácil (Direto)</option>
                        <option value="Médio (Padrão)">Médio (Padrão)</option>
                        <option value="Difícil (Estilo Cespe/FGV com pegadinhas)">Avançado (Pegadinhas)</option>
                      </select>
                    </div>
                  </div>

                  <Button type="submit" size="lg" fullWidth disabled={isGenerating} className="h-14 text-lg mt-4">
                    {isGenerating ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analisando texto e gerando...</>
                    ) : (
                      <><Sparkles className="w-5 h-5 mr-2" /> Gerar Simulado Inteligente</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">
                  Questão {currentQIndex + 1} de {quizData.length}
                </h3>
                {quizFinished && (
                  <Button variant="secondary" onClick={() => setQuizData(null)}>
                    Gerar Novo Quiz
                  </Button>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300" 
                  style={{ width: `${((currentQIndex + 1) / quizData.length) * 100}%` }}
                />
              </div>

              <Card>
                <CardContent className="p-6 md:p-8 space-y-6">
                  <p className="text-lg md:text-xl font-medium leading-relaxed">
                    {quizData[currentQIndex].question}
                  </p>

                  <div className="space-y-3">
                    {quizData[currentQIndex].options.map((opt, idx) => {
                      const isSelected = userAnswers[currentQIndex] === idx;
                      const isCorrect = quizData[currentQIndex].correctAnswerIndex === idx;
                      
                      let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all ";
                      
                      if (!quizFinished) {
                        btnClass += isSelected 
                          ? "border-primary bg-primary/5" 
                          : "border-border bg-surface hover:border-primary/30";
                      } else {
                        if (isCorrect) {
                          btnClass += "border-success bg-success/10 text-success-foreground font-medium";
                        } else if (isSelected && !isCorrect) {
                          btnClass += "border-danger bg-danger/10 text-danger-foreground line-through opacity-70";
                        } else {
                          btnClass += "border-border bg-surface opacity-50";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(idx)}
                          disabled={quizFinished}
                          className={btnClass}
                        >
                          <div className="flex items-start gap-3">
                            <span className="font-bold shrink-0 mt-0.5">
                              {['A)', 'B)', 'C)', 'D)'][idx]}
                            </span>
                            <span>{opt}</span>
                            {quizFinished && isCorrect && <CheckCircle2 className="w-5 h-5 ml-auto text-success shrink-0" />}
                            {quizFinished && isSelected && !isCorrect && <XCircle className="w-5 h-5 ml-auto text-danger shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {quizFinished && (
                    <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20">
                      <p className="text-sm font-semibold text-primary mb-1">Explicação do Mestre:</p>
                      <p className="text-sm text-foreground/90">{quizData[currentQIndex].explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between items-center pt-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQIndex === 0}
                >
                  Anterior
                </Button>

                {!quizFinished && currentQIndex === quizData.length - 1 ? (
                  <Button 
                    variant="primary"
                    size="lg"
                    onClick={handleFinishQuiz}
                    disabled={userAnswers.filter(a => a !== undefined).length !== quizData.length}
                  >
                    Finalizar e Corrigir
                  </Button>
                ) : (
                  <Button 
                    variant="secondary"
                    onClick={() => setCurrentQIndex(prev => Math.min(quizData.length - 1, prev + 1))}
                    disabled={currentQIndex === quizData.length - 1}
                  >
                    Próxima
                  </Button>
                )}
              </div>
              
              {quizFinished && (
                <div className="text-center p-6 bg-surface border border-border rounded-xl mt-8">
                  <h2 className="text-2xl font-bold mb-2">Resultado Final</h2>
                  <p className="text-4xl font-black text-primary mb-4">
                    {quizData!.reduce((acc, q, idx) => acc + (q.correctAnswerIndex === userAnswers[idx] ? 1 : 0), 0)} / {quizData.length}
                  </p>
                  <p className="text-muted">Este resultado foi salvo automaticamente no seu Histórico de Questões!</p>
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
}
