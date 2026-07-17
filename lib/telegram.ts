export async function sendTelegramMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("ยังไม่ได้ตั้งค่า TELEGRAM_BOT_TOKEN");
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });

  const body = await res.json();
  if (!body.ok) {
    throw new Error(body.description ?? `ส่งข้อความไม่สำเร็จ (HTTP ${res.status})`);
  }

  return body;
}
