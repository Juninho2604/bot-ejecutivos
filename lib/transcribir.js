import fetch from 'node-fetch';
import FormData from 'form-data';

const GROQ_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
const MODELO_WHISPER = 'whisper-large-v3';

/**
 * Transcribe un audio (OGG/Opus de WhatsApp) a texto usando Groq Whisper.
 * @param {Buffer} buffer - Audio binario.
 * @returns {Promise<string>} Texto transcrito (cadena vacía si falla).
 */
export async function transcribirAudio(buffer) {
  if (!buffer || !buffer.length) {
    console.error('[transcribir] Buffer de audio vacío');
    return '';
  }

  if (!process.env.GROQ_API_KEY) {
    console.error('[transcribir] Falta GROQ_API_KEY');
    return '';
  }

  try {
    const form = new FormData();
    form.append('file', buffer, {
      filename: 'audio.ogg',
      contentType: 'audio/ogg',
    });
    form.append('model', MODELO_WHISPER);
    form.append('language', 'es');
    form.append('response_format', 'json');

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        ...form.getHeaders(),
      },
      body: form,
    });

    if (!res.ok) {
      const detalle = await res.text().catch(() => '');
      console.error('[transcribir] Groq respondió', res.status, detalle);
      return '';
    }

    const data = await res.json();
    return (data?.text || '').trim();
  } catch (err) {
    console.error('[transcribir] Error transcribiendo audio:', err.message);
    return '';
  }
}

export default transcribirAudio;
