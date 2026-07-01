export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export const generateQuestionsFromText = async (
  apiKey: string, 
  text: string, 
  amount: number, 
  difficulty: string
): Promise<GeneratedQuestion[]> => {
  if (!apiKey) throw new Error("Chave da API do Gemini não configurada.");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
Você é um examinador de bancas de concurso público militar (como PM, BM).
Abaixo está um texto de estudo (resumo). 
Gere um simulado com EXATAMENTE ${amount} questões de múltipla escolha com base no texto fornecido.
A dificuldade deve ser: ${difficulty}. (Se for difícil, crie pegadinhas típicas de concurso).

REGRAS OBRIGATÓRIAS:
1. Retorne APENAS um JSON válido. Não use formatação markdown de blocos de código (\`\`\`json). Apenas o array JSON cru.
2. Cada questão deve ter exatamente 4 opções (índices de 0 a 3).
3. Siga ESTRITAMENTE o formato abaixo:

[
  {
    "question": "O que é...",
    "options": ["Alternativa 1", "Alternativa 2", "Alternativa 3", "Alternativa 4"],
    "correctAnswerIndex": 1,
    "explanation": "A alternativa 2 está correta porque..."
  }
]

Aqui está o texto base para a criação das questões:
"${text}"
  `;

  const body = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.2, // Low temperature for more deterministic, factual generation based on text
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Erro desconhecido na API do Gemini.");
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Clean up potential markdown formatting if the model disobeys
    const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Erro na geração de questões:", error);
    throw error;
  }
};
