export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, contact, service, task, source } = req.body;
  
  // Твой токен
  const token = '8870506499:AAGuyBYGS59EfCT0gm6fVIGxERjUzRZLZcU';
  
  // Массив Chat ID. Вставь ID помощника вместо 'ID_ПОМОЩНИКА'
  const chatIds = ['237343250', '562975355'];

  const text = `🔥 <b>Нова заявка: ${source}</b>\n\n<b>Ім'я:</b> ${name}\n<b>Контакт:</b> ${contact}\n<b>Послуга:</b> ${service || 'Не вказано'}\n<b>Задача:</b> ${task || 'Немає'}`;

  try {
    // Создаем массив запросов для каждого Chat ID
    const sendPromises = chatIds.map(chatId => 
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: chatId, 
          text: text, 
          parse_mode: 'HTML' 
        })
      })
    );

    // Отправляем сообщения всем одновременно
    await Promise.all(sendPromises);

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}