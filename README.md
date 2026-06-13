# TimeDrop Backend Server

A simple Express.js backend server with Nodemailer email sending functionality for the TimeDrop application.

## Features

- POST endpoint to send emails
- Gmail SMTP integration
- TypeScript for type safety
- Environment variable configuration
- Proper error handling
- CORS enabled

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Configure your Gmail credentials:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification
   - Go to https://myaccount.google.com/apppasswords
   - Create an App Password for "Mail"
   - Use the generated app password in your `.env` file

4. Update `.env` with your credentials:
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-generated-app-password
```

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

The server will start on port 5000 (or the port specified in `.env`).

## API Endpoints

### POST /api/email/send-email
Send an email to a recipient.

**Request Body:**
```json
{
  "recipientEmail": "recipient@example.com",
  "subject": "Your Subject",
  "message": "Your message content"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "message-id"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "TimeDrop backend server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /
Root endpoint with API information.

## Testing

You can test the email endpoint using curl:

```bash
curl -X POST http://localhost:5000/api/email/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "test@example.com",
    "subject": "Test Email",
    "message": "This is a test email from TimeDrop"
  }'
```

Or use Postman/Insomnia with the same JSON payload.

## Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── email.controller.ts
│   ├── routes/
│   │   └── email.routes.ts
│   └── server.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Technologies Used

- Node.js
- Express.js
- TypeScript
- Nodemailer
- dotenv
- CORS