export const sendTelegramMessage = async (botToken: string, chatId: string, message: string) => {
  if (!botToken || !chatId) {
    console.warn("Telegram: Token ou Chat ID ausente.");
    return false;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      console.error("Erro do Telegram:", data.description);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Erro ao enviar mensagem para o Telegram:", error);
    return false;
  }
};
