# Contract Manager AI 🚀

An intelligent contract analysis platform powered by AI that extracts key information from PDF contracts, tracks expiration dates, and syncs reminders with Google Calendar.

## ✨ Features

- **AI-Powered Contract Analysis**: Automatically extracts critical information from PDF contracts using OpenAI GPT-4o
- **Smart Metadata Extraction**: Identifies contract subjects, parties, expiry dates, and key terms
- **Google Calendar Integration**: Sync contract expiration reminders directly to your Google Calendar
- **Customizable Notifications**: Set reminders for 1 week, 2 weeks, or 1 month before contract expiration
- **Secure Document Storage**: Store contracts securely in AWS S3
- **User Authentication**: Secure user registration and login system
- **Contract History**: View all your analyzed contracts in one place
- **PDF Preview**: Click to view original contract documents

## 🛠 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Axios** for API communication
- Modern, responsive UI with inline styles

### Backend
- **Python 3.9+**
- **FastAPI** for RESTful API
- **Uvicorn** as ASGI server
- **PyMuPDF (fitz)** for PDF text extraction

### AI & Services
- **OpenAI GPT-4o-mini** for contract analysis
- **AWS DynamoDB** for data storage
- **AWS S3** for document storage
- **Google Calendar API** for reminder synchronization
- **Google OAuth 2.0** for authentication

## 📋 Prerequisites

Before you begin, ensure you have:

- **Python 3.9+** installed
- **Node.js 16+** and npm installed
- **AWS Account** with:
  - DynamoDB tables created
  - S3 bucket for document storage
  - IAM user with appropriate permissions
- **Google Cloud Project** with:
  - Google Calendar API enabled
  - OAuth 2.0 credentials configured
- **OpenAI API Key**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/contract_manager.git
cd contract_manager
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn boto3 openai python-dotenv pymupdf passlib[bcrypt] google-auth-oauthlib google-api-python-client
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_bucket_name

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend URL (optional, defaults to http://localhost:5173)
FRONTEND_URL=http://localhost:5173
```

### 4. AWS Setup

#### DynamoDB Tables

Create two tables in AWS DynamoDB:

1. **Users Table**
   - Table name: `Users`
   - Partition key: `username` (String)

2. **Analyzed_Contracts Table**
   - Table name: `Analyzed_Contracts`
   - Partition key: `user_id` (String)
   - Sort key: `contract_id` (String)

#### S3 Bucket

1. Create an S3 bucket for storing PDF contracts
2. Configure appropriate bucket policies for your use case
3. Update `S3_BUCKET_NAME` in your `.env` file

#### IAM Permissions

Your AWS IAM user needs permissions for:
- DynamoDB: `PutItem`, `GetItem`, `Query`, `UpdateItem`, `DeleteItem`
- S3: `PutObject`, `GetObject`, `GeneratePresignedUrl`

### 5. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google Calendar API**:
   - Navigate to APIs & Services > Library
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create OAuth 2.0 Credentials:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:8000/auth/callback`
   - Copy the Client ID and Client Secret to your `.env` file
5. Configure OAuth Consent Screen:
   - Add the scope: `https://www.googleapis.com/auth/calendar.events`
   - Add test users if in testing mode

### 6. Start the Backend Server

```bash
# Make sure you're in the backend directory with venv activated
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### 7. Frontend Setup

```bash
# Navigate to client directory (from project root)
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
contract_manager/
├── backend/
│   ├── main.py              # FastAPI application
│   └── .env                 # Environment variables (not in git)
├── client/
│   ├── src/
│   │   ├── App.tsx          # Main React component
│   │   ├── main.tsx         # React entry point
│   │   └── ErrorBoundary.tsx # Error handling
│   ├── package.json
│   └── vite.config.ts
├── README.md
└── .gitignore
```

## 🔑 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `AWS_ACCESS_KEY_ID` | AWS access key for DynamoDB and S3 | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Yes |
| `AWS_REGION` | AWS region (e.g., us-east-1) | Yes |
| `S3_BUCKET_NAME` | Name of your S3 bucket for PDF storage | Yes |
| `OPENAI_API_KEY` | OpenAI API key for contract analysis | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 client secret | Yes |
| `FRONTEND_URL` | Frontend URL for redirects (default: http://localhost:5173) | No |

## 📖 Usage

1. **Sign Up / Login**: Create an account or log in with existing credentials
2. **Connect Google Calendar**: Click "Connect Google" to enable calendar reminders
3. **Upload Contract**: Click "+ Upload PDF Contract" and select a PDF file
4. **View Analysis**: The AI will analyze your contract and extract key information
5. **Set Reminders**: If Google Calendar is connected, select notification timing (1 week, 2 weeks, or 1 month before expiration)
6. **View Documents**: Click on any filename to view the original PDF
7. **View Analysis**: Click "View Analysis" to see detailed contract insights

## 🔌 API Endpoints

### Authentication
- `POST /signup` - Register a new user
- `POST /login` - User login

### Contracts
- `POST /upload` - Upload and analyze a PDF contract
- `GET /contracts?user_id={user_id}` - Get all contracts for a user
- `GET /view/{contract_id}?user_id={user_id}` - Get presigned URL for PDF
- `DELETE /contracts/{contract_id}?user_id={user_id}` - Delete a contract

### Google Calendar
- `GET /auth/google?user_id={user_id}` - Get Google OAuth URL
- `GET /auth/callback` - OAuth callback handler
- `GET /check-google-connection?user_id={user_id}` - Check if Google is connected
- `POST /update-reminder` - Update contract reminder settings

## 🐛 Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Find and kill the process using port 8000
lsof -ti:8000 | xargs kill -9
```

**Module not found errors:**
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows
# Reinstall dependencies
pip install -r requirements.txt
```

**AWS connection errors:**
- Verify your AWS credentials in `.env`
- Check IAM permissions
- Ensure DynamoDB tables exist

**Google Calendar API errors:**
- Verify Google Calendar API is enabled
- Check OAuth credentials
- Ensure redirect URI matches exactly: `http://localhost:8000/auth/callback`

### Frontend Issues

**Port already in use:**
```bash
# Change port in vite.config.ts or use:
npm run dev -- --port 5174
```

**CORS errors:**
- Ensure backend CORS middleware allows your frontend URL
- Check that backend is running on port 8000

**API connection errors:**
- Verify backend is running
- Check `API_BASE` in frontend code matches your backend URL

## 🔒 Security Notes

- **Never commit `.env` files** to version control
- Use environment variables for all sensitive data
- Keep your API keys secure
- Use HTTPS in production
- Regularly rotate AWS and Google credentials

## 📝 Creating requirements.txt

To generate a `requirements.txt` file for easy dependency installation:

```bash
cd backend
pip freeze > requirements.txt
```

## 🚢 Production Deployment

For production deployment:

1. Set `FRONTEND_URL` to your production frontend URL
2. Update Google OAuth redirect URI to production URL
3. Use environment variables instead of `.env` file
4. Enable HTTPS
5. Configure proper CORS origins
6. Set up proper error logging and monitoring

## 📄 License

[Add your license here]

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Note**: This project uses Google Calendar API in testing mode. For production use, you'll need to go through Google's verification process.
