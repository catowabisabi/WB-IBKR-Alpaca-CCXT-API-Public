// config.ts

export const config = {
  /** 前端用（需以 NEXT_PUBLIC_ 開頭） */
  
  // 本機 WebSocket 新訊號處理 URL
  localhostNewSignalUrl: process.env.NEXT_PUBLIC_LOCALHOST_NEW_SIGNAL_URL,

  // 雲端伺服器主機網址（正式部署）
  cloudWbServerUrl: process.env.NEXT_PUBLIC_CLOUD_WB_SERVER_URL,

  // 本機網站網址
  localhostUrl: process.env.NEXT_PUBLIC_LOCALHOST_URL,

  // 本機 3824 端口網址（後端）
  localhostUrl3824: process.env.NEXT_PUBLIC_LOCALHOST_URL_3824,

  // Google OAuth 回調 URL（正式部署）
  googleCallBackUrlHead: process.env.NEXT_PUBLIC_GOOGLE_CALLBACK_URL_HEAD,

  // App 提供給前端的 API 金鑰
  adminApiKey: process.env.NEXT_PUBLIC_ADMIN_API_KEY,

  /** 後端專用（不加 NEXT_PUBLIC_） */

  // API 基礎網址（後端呼叫）
  apiBaseUrl: process.env.API_BASE_URL,

  // Google OAuth 用的 Client ID 與 Secret
  googleClientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,

  // SSH 金鑰（自動部署用）
  hostingerSSH: process.env.HOSTINGER_WB_VPS_SSH,

  // JWT 金鑰（用於身份驗證）
  jwtKey: process.env.JWT_KEY,

  // MongoDB 連線字串
  mongodbUri: process.env.MONGODB_CONNECTION_STRING,

  // Telegram Bot 設定
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramIdCat: process.env.TG_ID_CAT,
  telegramIdCho: process.env.TG_ID_CHO,
};
