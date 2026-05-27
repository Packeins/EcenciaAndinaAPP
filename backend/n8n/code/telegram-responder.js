function cfg(name, fallback = '') {
  const vars = typeof $vars === 'undefined' ? {} : $vars;
  const env = typeof process === 'undefined' ? {} : process.env;
  return env[name] || vars[name] || fallback;
}

const TELEGRAM_BOT_TOKEN = cfg('TELEGRAM_BOT_TOKEN');
if (!TELEGRAM_BOT_TOKEN) {
  throw new Error('Falta TELEGRAM_BOT_TOKEN en n8n.');
}

function cleanInlineReplyMarkup(markup) {
  const keyboard = markup?.inline_keyboard || [];
  const rows = keyboard
    .map((row) => (Array.isArray(row) ? row : []))
    .map((row) => row.filter((button) => button?.text && button?.callback_data))
    .filter((row) => row.length);
  return rows.length ? { inline_keyboard: rows } : null;
}

function replyMarkupFromData(data) {
  if (data.replyMarkup) return data.replyMarkup;
  return cleanInlineReplyMarkup(data.inlineKeyboard);
}

const output = [];
for (const item of items) {
  const data = item.json || {};
  if (data.callbackId) {
    try {
      await helpers.httpRequest({
        method: 'POST',
        url: 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/answerCallbackQuery',
        body: { callback_query_id: data.callbackId },
        json: true,
      });
    } catch (error) {
      // Telegram puede expirar el callback antes de esta respuesta.
    }
  }

  const body = {
    chat_id: data.chatId,
    text: data.text || '',
    disable_web_page_preview: true,
  };
  const replyMarkup = replyMarkupFromData(data);
  if (replyMarkup) body.reply_markup = replyMarkup;

  const response = await helpers.httpRequest({
    method: 'POST',
    url: 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage',
    body,
    json: true,
  });

  output.push({
    json: {
      ...data,
      telegramOk: response.ok === true,
      telegramMessageId: response.result?.message_id || null,
    },
  });
}

return output;
