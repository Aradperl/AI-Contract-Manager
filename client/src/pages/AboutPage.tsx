import * as S from '../AppStyles';

const sectionStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #e2e8f0',
  padding: 28,
  marginBottom: 24,
};

const headingStyle: React.CSSProperties = {
  fontFamily: '"Plus Jakarta Sans", sans-serif',
  fontSize: 20,
  fontWeight: 800,
  color: '#0f172a',
  marginBottom: 12,
};

const subHeadingStyle: React.CSSProperties = {
  fontFamily: '"Plus Jakarta Sans", sans-serif',
  fontSize: 16,
  fontWeight: 700,
  color: '#334155',
  marginTop: 20,
  marginBottom: 8,
};

const codeStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, monospace',
  fontSize: 13,
  background: '#f1f5f9',
  padding: '2px 8px',
  borderRadius: 6,
};

export function AboutPage() {
  return (
    <div>
      <h1 style={{ ...S.sectionTitle, fontSize: 28, marginTop: 0, marginBottom: 8 }}>About LegalVault</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>
        An intelligent contract analysis platform powered by AI.
      </p>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>What is LegalVault?</h2>
        <p style={{ color: '#475569', lineHeight: 1.7, margin: 0 }}>
          LegalVault is an intelligent contract management platform that transforms static PDF documents into dynamic, actionable data. By leveraging state-of-the-art Natural Language Processing (NLP), the platform automatically extracts key terms, deadlines, and financial liabilities, presenting them in a clean, intuitive dashboard.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Key features</h2>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', lineHeight: 1.9 }}>
          <li><strong>AI-Powered Analysis:</strong> Instant extraction of parties, subjects, and critical clauses using GPT-4o-mini.</li>
          <li><strong>Deadline Automation:</strong> Seamless synchronization with Google Calendar and daily email reminders via AWS SES to ensure you never miss a renewal or termination date.</li>
          <li><strong>Risk Detection:</strong> Automatically flags potential “Red Flags” like hidden penalties or restrictive exclusivity clauses.</li>
          <li><strong>Financial Insights:</strong> Real-time analytics of your contractual liabilities and upcoming payments.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Tech stack</h2>
        <h3 style={subHeadingStyle}>Frontend</h3>
        <ul style={{ margin: '0 0 16px', paddingLeft: 20, color: '#475569', lineHeight: 1.8 }}>
          <li><strong>React 19</strong> with TypeScript</li>
          <li><strong>Vite</strong> (Rolldown) for build and dev server</li>
          <li><strong>React Router</strong> for client-side routing (Home, Contracts, Analytics, Settings, About)</li>
          <li><strong>Axios</strong> for API calls</li>
          <li>Plus Jakarta Sans typography, responsive layout with fixed sidebar</li>
        </ul>
        <h3 style={subHeadingStyle}>Backend</h3>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', lineHeight: 1.8 }}>
          <li><strong>Python 3.9+</strong>, <strong>FastAPI</strong>, <strong>Uvicorn</strong></li>
          <li><strong>PyMuPDF (fitz)</strong> for PDF text extraction</li>
          <li><strong>OpenAI GPT-4o-mini</strong> for contract analysis (subject, party, expiry, summary, risk flags, signed status)</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>AWS &amp; external services</h2>
        <p style={{ color: '#475569', lineHeight: 1.7, margin: '0 0 16px' }}>
          Storage and reminders use AWS and Google. <strong>Expiration email reminders</strong> are sent via AWS serverless: a week before a contract expires, the system sends a daily reminder at <strong>8:00</strong> until the expiry date.
        </p>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', lineHeight: 1.8 }}>
          <li><strong>AWS DynamoDB</strong>: users, analyzed contracts, custom folders</li>
          <li><strong>AWS S3</strong>: PDF storage</li>
          <li><strong>AWS Lambda</strong>: runs on a schedule to find contracts expiring in 7 days and triggers the email flow</li>
          <li><strong>Amazon EventBridge</strong>: runs the job daily at 8:00 so Lambda is invoked without a dedicated server</li>
          <li><strong>Amazon SES</strong>: sends the reminder emails to users</li>
          <li><strong>Google Calendar API</strong> + OAuth 2.0: in-app expiration reminders synced to the user’s calendar</li>
        </ul>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 16, marginBottom: 0 }}>
          EventBridge triggers Lambda at 8:00 each day; Lambda queries contracts expiring within a week and uses SES to email the relevant users.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Project structure</h2>
        <pre style={{ background: '#f8fafc', padding: 20, borderRadius: 12, overflow: 'auto', fontSize: 13, lineHeight: 1.6, margin: 0, border: '1px solid #e2e8f0' }}>
{`contract_manager/
├── backend/
│   ├── main.py              # FastAPI app, CORS, /view/{id}/pdf, /update-reminder
│   ├── config.py            # AWS, OpenAI, auth config
│   ├── models.py            # Pydantic models
│   ├── requirements.txt
│   ├── routers/
│   │   ├── auth.py          # /signup, /login
│   │   ├── contracts.py     # /contracts/upload, GET /, DELETE /{id}
│   │   ├── folders.py       # Custom folders CRUD
│   │   └── google_auth.py   # /auth/google, /auth/callback, /check-google-connection
│   └── services/
│       ├── ai_service.py    # OpenAI contract analysis (JSON)
│       ├── auth_service.py # Password hashing, user lookup
│       └── calendar_service.py # Google Calendar events for reminders
├── client/
│   ├── src/
│   │   ├── main.tsx         # React root, BrowserRouter
│   │   ├── App.tsx          # Auth + routes, context, modals
│   │   ├── AppStyles.ts     # Shared styles
│   │   ├── apiService.ts    # API client, types
│   │   ├── context/AppContext.tsx
│   │   ├── layouts/AppLayout.tsx  # Navbar + fixed sidebar + Outlet
│   │   ├── pages/           # Home, Contracts, Analytics, Settings, About
│   │   ├── components/      # Navbar, ContractCard, DashboardHeader, CompactUploadBar
│   │   └── utils/contractHelpers.ts # safeParse, risk flags, is_signed
│   ├── package.json
│   └── vite.config.ts
└── README.md`}
        </pre>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Build and run</h2>
        <h3 style={subHeadingStyle}>Backend</h3>
        <p style={{ color: '#475569', lineHeight: 1.7, margin: '0 0 12px' }}>
          From <span style={codeStyle}>backend/</span>: create a <span style={codeStyle}>.env</span> with AWS keys,
          S3 bucket, OpenAI API key, and Google OAuth credentials. Create DynamoDB tables (Users, Analyzed_Contracts,
          Contract_Folders). Then:
        </p>
        <pre style={{ background: '#f1f5f9', padding: 14, borderRadius: 10, margin: '0 0 16px', fontSize: 13 }}>{`python -m venv venv
source venv/bin/activate   # or venv\\Scripts\\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload`}</pre>
        <p style={{ color: '#475569', lineHeight: 1.7, margin: 0 }}>
          API runs at <span style={codeStyle}>http://localhost:8000</span>.
        </p>
        <h3 style={subHeadingStyle}>Frontend</h3>
        <pre style={{ background: '#f1f5f9', padding: 14, borderRadius: 10, margin: 0, fontSize: 13 }}>{`cd client
npm install
npm run dev`}</pre>
        <p style={{ color: '#475569', lineHeight: 1.7, marginTop: 12, marginBottom: 0 }}>
          App runs at <span style={codeStyle}>http://localhost:5173</span>. Set <span style={codeStyle}>VITE_API_BASE</span> if the backend is elsewhere.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>About the developer</h2>
        <p style={{ color: '#475569', lineHeight: 1.7, margin: 0 }}>
          <strong>Arad P.</strong> I am a Computer Science student at the Academic College of Tel Aviv-Yaffo, passionate about Software Engineering and Cloud Computing. This project was born out of my desire to combine AI capabilities with robust cloud infrastructure to solve real-world administrative challenges.
        </p>
      </section>
    </div>
  );
}
