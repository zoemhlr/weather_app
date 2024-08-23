import axios from 'axios';

const apiKey = 'dKA1NPDrDdjmCjhZHTDpqSaiRizjI7B5';

const mistralAPI = axios.create({
  baseURL: 'https://api.mistral.ai',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
});

export const generateOutfitSuggestion = async (prompt) => {
  try {
    const response = await mistralAPI.post('/v1/chat/completions', {
      model: "mistral-small-latest",
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 5000,
    });
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error communicating with Mistral AI:", error.response ? error.response.data : error.message);
    throw new Error("Failed to generate response from Mistral AI.");
  }
};
