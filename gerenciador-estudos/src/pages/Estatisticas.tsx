import { useStudyStore } from '../store/useStudyStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { BarChart3, TrendingUp, BrainCircuit, Target } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { subDays, format, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Estatisticas() {
  const { sessions, subjects, questionLogs, mockExams } = useStudyStore();

  const getSubject = (id: string) => subjects.find(s => s.id === id);

  // 1. Data for Bar Chart: Last 7 Days Study Hours
  const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));
  const barChartData = last7Days.map(date => {
    const daySessions = sessions.filter(s => isSameDay(parseISO(s.date), date));
    const totalMinutes = daySessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    return {
      name: format(date, 'EEE', { locale: ptBR }),
      horas: Number((totalMinutes / 60).toFixed(1))
    };
  });

  // 2. Data for Pie Chart: Distribution by Subject
  const subjectMinutes: Record<string, number> = {};
  sessions.forEach(session => {
    subjectMinutes[session.subjectId] = (subjectMinutes[session.subjectId] || 0) + session.durationMinutes;
  });
  const pieChartData = Object.entries(subjectMinutes).map(([id, minutes]) => {
    const subject = getSubject(id);
    return {
      name: subject?.name || 'Excluída',
      value: Number((minutes / 60).toFixed(1)),
      color: subject?.color || '#555'
    };
  });

  // 3. Overall Stats
  const totalQuestions = questionLogs.reduce((acc, curr) => acc + curr.total, 0);
  const totalCorrect = questionLogs.reduce((acc, curr) => acc + curr.correct, 0);
  const globalAccuracy = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(1) : '0.0';

  const avgMockScore = mockExams.length > 0
    ? (mockExams.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / mockExams.length * 100).toFixed(1)
    : '0.0';

  const totalHoursStudied = (sessions.reduce((acc, curr) => acc + curr.durationMinutes, 0) / 60).toFixed(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 text-primary rounded-lg">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estatísticas</h1>
          <p className="text-muted mt-1">Acompanhe seu desempenho e evolução geral.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted font-medium">Total Estudado</p>
              <h3 className="text-2xl font-bold">{totalHoursStudied}h</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-success/10 text-success rounded-lg">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted font-medium">Acertos em Questões</p>
              <h3 className="text-2xl font-bold">{globalAccuracy}%</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-warning/10 text-warning rounded-lg">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted font-medium">Média Simulados</p>
              <h3 className="text-2xl font-bold">{avgMockScore}%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Horas Estudadas (Últimos 7 dias)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#888'}} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#888'}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                  contentStyle={{backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '8px'}}
                  itemStyle={{color: '#fff'}}
                />
                <Bar dataKey="horas" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Matéria (Total em Horas)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {pieChartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted">
                Sem dados suficientes.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '8px'}}
                    itemStyle={{color: '#fff'}}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
