# Trading Bot API Server

## 🔒 Security Notice

This project contains sensitive API integrations. Before deploying or sharing this code:
1. Never commit API keys or secrets
2. Use environment variables for sensitive data
3. Review code for any hardcoded credentials
4. Enable 2FA on all connected trading accounts

## 📋 Features

- Multiple Exchange Support:
  - Binance
  - OKX
  - Bybit
  - Alpaca (Paper & Live Trading)
- User Settings Management
- Secure API Key Storage
- JWT Authentication
- Trading Strategy Implementation

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd [repository-name]
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/trading-bot

# JWT Configuration
JWT_SECRET=your-secure-secret
JWT_EXPIRATION=24h

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Development

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## 🔐 Security Best Practices

### API Keys Storage
- All API keys are encrypted before storage
- Keys are stored in MongoDB with proper access controls
- Access to keys is limited to authenticated users
- Regular key rotation is recommended

### Authentication
- JWT-based authentication
- Rate limiting on all endpoints
- Request validation and sanitization
- CORS protection

### Environment Variables
Required environment variables:
- `JWT_SECRET`: Secret key for JWT token generation
- `MONGODB_URI`: MongoDB connection string
- Additional exchange-specific variables (see .env.example)

## 🏗️ Project Structure

```
src/
├── auth/                 # Authentication related files
├── mongodb/             # Database models and schemas
├── user-settings/       # User settings management
├── trading/            # Trading logic
└── common/             # Shared utilities and interfaces
```

## 📝 API Documentation

API documentation is available at `/api` when running the server (Swagger UI).

### Key Endpoints

- `POST /auth/login` - User authentication
- `GET /user-settings/mysettings` - Get user settings
- `PATCH /user-settings/keys` - Update API keys
- `GET /trading/status` - Get trading status

## 🛡️ Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This software is for educational purposes only. Use at your own risk. The developers are not responsible for any financial losses incurred through the use of this software.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## 🐛 Known Issues

See the [Issues](https://github.com/your-username/your-repo/issues) page for current issues and feature requests.

## 📞 Support

For support, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue if needed

Remember to never share sensitive information when requesting support. 