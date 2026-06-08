/** Helpers gọi Telegram Bot API. Cần TELEGRAM_BOT_TOKEN. */
const API = (method: string) =>
  `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;

export type InlineButton = { text: string; callback_data: string };

export async function tg(method: string, params: Record<string, unknown>) {
  const res = await fetch(API(method), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}

export function sendMessage(
  chatId: number | string,
  text: string,
  buttons?: InlineButton[][],
) {
  return tg("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : {}),
  });
}

export function answerCallback(id: string, text?: string) {
  return tg("answerCallbackQuery", { callback_query_id: id, text });
}
