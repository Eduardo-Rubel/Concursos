import { useState, useRef } from 'react';
import { useStudyStore } from '../store/useStudyStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Settings as SettingsIcon, Download, Upload, Trash2, CheckCircle2 } from 'lucide-react';

export function Configuracoes() {
  const { settings, updateSettings } = useStudyStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(localSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportData = () => {
    // Get full state from localStorage
    const data = localStorage.getItem('study-management-storage');
    if (!data) return alert("Nenhum dado encontrado para exportar.");
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studymanager-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.state) {
          localStorage.setItem('study-management-storage', content);
          alert("Backup restaurado com sucesso! A página será recarregada.");
          window.location.reload();
        } else {
          alert("Arquivo JSON inválido. Certifique-se de ser um backup do StudyManager.");
        }
      } catch (err) {
        alert("Erro ao ler o arquivo JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm("TEM CERTEZA? Isso apagará TODO o seu progresso, matérias, revisões e simulados. Não tem volta sem um backup!")) {
      localStorage.removeItem('study-management-storage');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 text-primary rounded-lg">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted mt-1">Ajuste suas metas e gerencie seus dados.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Preferências de Estudo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Como gostaria de ser chamado?</label>
                <input 
                  type="text" 
                  value={localSettings.userName}
                  onChange={e => setLocalSettings({...localSettings, userName: e.target.value})}
                  className="w-full h-10 px-3 bg-surface border border-border rounded-lg"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Meta Diária (horas)</label>
                <input 
                  type="number" 
                  min="1"
                  max="24"
                  value={localSettings.dailyGoalHours}
                  onChange={e => setLocalSettings({...localSettings, dailyGoalHours: Number(e.target.value)})}
                  className="w-full h-10 px-3 bg-surface border border-border rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Pomodoro (Foco) - min</label>
                  <input 
                    type="number" 
                    min="1"
                    value={localSettings.pomodoroWork}
                    onChange={e => setLocalSettings({...localSettings, pomodoroWork: Number(e.target.value)})}
                    className="w-full h-10 px-3 bg-surface border border-border rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Pomodoro (Pausa) - min</label>
                  <input 
                    type="number" 
                    min="1"
                    value={localSettings.pomodoroRest}
                    onChange={e => setLocalSettings({...localSettings, pomodoroRest: Number(e.target.value)})}
                    className="w-full h-10 px-3 bg-surface border border-border rounded-lg"
                  />
                </div>
              </div>
              <Button type="submit" fullWidth className={saveSuccess ? "bg-success hover:bg-success" : ""}>
                {saveSuccess ? <><CheckCircle2 className="w-5 h-5 mr-2"/> Salvo com sucesso!</> : "Salvar Configurações"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* AI Config */}
        <Card>
          <CardHeader>
            <CardTitle>Inteligência Artificial (Gemini)</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-1.5 mb-4">
                <label className="text-sm font-medium">Chave da API (Google Gemini)</label>
                <input 
                  type="password" 
                  value={localSettings.geminiApiKey || ''}
                  onChange={e => setLocalSettings({...localSettings, geminiApiKey: e.target.value})}
                  placeholder="Ex: AIzaSyB..."
                  className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-xs font-mono"
                />
                <p className="text-xs text-muted mt-1">
                  Obtenha gratuitamente no <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google AI Studio</a>.
                </p>
              </div>
              <Button type="submit" className="w-full bg-primary">
                Salvar Chave
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Telegram Config */}
        <Card>
          <CardHeader>
            <CardTitle>Notificações (Telegram)</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium">Habilitar Alertas</label>
                <input 
                  type="checkbox"
                  checked={localSettings.enableTelegramAlerts}
                  onChange={e => setLocalSettings({...localSettings, enableTelegramAlerts: e.target.checked})}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary bg-surface"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Bot Token</label>
                <input 
                  type="text" 
                  value={localSettings.telegramBotToken || ''}
                  onChange={e => setLocalSettings({...localSettings, telegramBotToken: e.target.value})}
                  placeholder="Ex: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-xs font-mono"
                  disabled={!localSettings.enableTelegramAlerts}
                />
              </div>

              <div className="space-y-1.5 mb-4">
                <label className="text-sm font-medium">Chat ID</label>
                <input 
                  type="text" 
                  value={localSettings.telegramChatId || ''}
                  onChange={e => setLocalSettings({...localSettings, telegramChatId: e.target.value})}
                  placeholder="Ex: 123456789"
                  className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-xs font-mono"
                  disabled={!localSettings.enableTelegramAlerts}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="flex-1"
                  disabled={!localSettings.enableTelegramAlerts || !localSettings.telegramBotToken || !localSettings.telegramChatId}
                  onClick={async () => {
                    if (localSettings.telegramBotToken && localSettings.telegramChatId) {
                      const { sendTelegramMessage } = await import('../services/telegramService');
                      const success = await sendTelegramMessage(
                        localSettings.telegramBotToken, 
                        localSettings.telegramChatId, 
                        "🤖 <b>Teste de Conexão!</b>\n\nSeu gerenciador de estudos militar está conectado e pronto para te enviar alertas."
                      );
                      if (success) alert("Notificação enviada! Verifique o Telegram.");
                      else alert("Falha ao enviar. Verifique o Token e Chat ID.");
                    }
                  }}
                >
                  Testar Envio
                </Button>
                <Button type="submit" className="flex-1 bg-primary">
                  Salvar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Gerenciamento de Dados (Backup)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted">Exporte todo o seu histórico (matérias, cronograma, estatísticas) para um arquivo seguro no seu computador.</p>
              <Button variant="secondary" fullWidth onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" /> Exportar Backup (JSON)
              </Button>
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
              <p className="text-sm text-muted">Importe um arquivo de backup gerado anteriormente. Isso substituirá os dados atuais.</p>
              <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef} 
                onChange={handleImportData}
                className="hidden" 
              />
              <Button variant="secondary" fullWidth onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" /> Restaurar Backup
              </Button>
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
              <p className="text-sm text-muted">Cuidado! Esta ação é irreversível.</p>
              <Button variant="danger" fullWidth onClick={handleResetData}>
                <Trash2 className="w-4 h-4 mr-2" /> Apagar Todos os Dados
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
