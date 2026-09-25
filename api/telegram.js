export default async function handler(req, res) {
  // Cho phép CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Lấy bí mật từ biến môi trường (.env)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID environment variables');
      return res.status(500).json({ error: 'Telegram environment variables not configured' });
    }

    // 📍 Lấy IP thật của người truy cập từ Vercel/Proxy headers
    const visitorIP =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      'Không xác định';

    // 📱 Lấy User-Agent để biết thiết bị
    const userAgent = req.headers['user-agent'] || 'Không rõ';

    // Phân tích thiết bị đơn giản từ User-Agent
    let deviceInfo = '🖥️ Desktop';
    const ua = userAgent.toLowerCase();
    if (ua.includes('iphone')) deviceInfo = '📱 iPhone';
    else if (ua.includes('ipad')) deviceInfo = '📱 iPad';
    else if (ua.includes('android')) deviceInfo = '📱 Android';
    else if (ua.includes('mobile')) deviceInfo = '📱 Mobile';

    // Thêm thông tin IP & thiết bị vào cuối tin nhắn
    const enrichedMessage = message +
      `\n\n🔍 <b>Thông tin truy cập:</b>` +
      `\n📡 <b>IP:</b> <code>${visitorIP}</code>` +
      `\n${deviceInfo} <b>Thiết bị:</b> ${userAgent.substring(0, 100)}`;

    const teleResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: enrichedMessage,
        parse_mode: 'HTML'
      })
    });

    const data = await teleResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error forwarding to Telegram:', error);
    return res.status(500).json({ error: error.message });
  }
}
