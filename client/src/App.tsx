import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, Subtitle1, Body1, Button } from '@fluentui/react-components';
import * as S from './AppStyles';
import { api, getPdfBlobUrl, setAuth, getToken, clearAuth, API_BASE } from './apiService';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './layouts/AppLayout';
import { HomePage } from './pages/HomePage';
import { ContractsPage } from './pages/ContractsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { safeParse } from './utils/contractHelpers';

function renderInsightContent(raw: string | unknown) {
  const text = typeof raw === 'string' ? raw : (raw != null && typeof raw === 'object' ? 'No summary.' : String(raw ?? ''));
  if (!text?.trim()) return <p style={S.insightsParagraph}>No summary available.</p>;
  const parts: React.ReactNode[] = [];
  const blocks = text.split(/\n\n+/);
  blocks.forEach((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return;
    if (/^##\s+/.test(trimmed)) {
      parts.push(<div key={i} style={S.insightsHeading}>{trimmed.replace(/^##\s+/, '').replace(/\*\*(.+?)\*\*/g, '$1')}</div>);
      return;
    }
    if (/^[-*]\s+/m.test(trimmed)) {
      const items = trimmed.split(/\n/).filter(l => /^[-*]\s+/.test(l)).map(l => l.replace(/^[-*]\s+/, '').trim());
      parts.push(
        <ul key={i} style={S.insightsList}>
          {items.map((item, j) => (
            <li key={j} style={S.insightsListItem}>
              {item.split(/(\*\*.+?\*\*)/g).map((bit, k) =>
                /\*\*.+?\*\*/.test(bit) ? <strong key={k} style={S.insightsBold}>{bit.replace(/\*\*/g, '')}</strong> : bit
              )}
            </li>
          ))}
        </ul>
      );
      return;
    }
    const paragraph = trimmed.split(/\n/).join(' ').trim();
    if (paragraph) {
      parts.push(
        <p key={i} style={S.insightsParagraph}>
          {paragraph.split(/(\*\*.+?\*\*)/g).map((bit, k) =>
            /\*\*.+?\*\*/.test(bit) ? <strong key={k} style={S.insightsBold}>{bit.replace(/\*\*/g, '')}</strong> : bit
          )}
        </p>
      );
    }
  });
  return <div style={S.insightsBlock}>{parts.length ? parts : <p style={S.insightsParagraph}>{text}</p>}</div>;
}

function App() {
  // --- States ---
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const token = getToken();
      const uid = (typeof localStorage !== 'undefined' && localStorage.getItem('user_id')) || '';
      if (!token && uid) {
        clearAuth();
        return '';
      }
      return uid;
    } catch {
      return '';
    }
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return !!getToken();
    } catch {
      return false;
    }
  });
  const [userPicture, setUserPicture] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [pdfViewUrl, setPdfViewUrl] = useState<string | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authModal, setAuthModal] = useState<{ type: 'success' | 'error'; title: string; body: string; buttonText: string } | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'alphabetical' | 'expiry'>('timestamp');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // --- Data Loading ---
  const loadUserData = useCallback(async () => {
    if (!getToken()) return;
    try {
      const [resContracts, resGoogle] = await Promise.all([
        api.getContracts(),
        api.checkGoogle(),
      ]);
      setHistory(resContracts.data?.contracts || []);
      setIsGoogleConnected(resGoogle.data.connected || false);
      setUserPicture(resGoogle.data.picture_url || null);
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }, []);

  // Listen for Google OAuth success (popup)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'google-success') loadUserData();
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [loadUserData]);

  useEffect(() => {
    if (getToken() && currentUser) {
      setIsLoggedIn(true);
      loadUserData();
    }
  }, [currentUser, loadUserData]);

  // --- Handlers ---
  const handleAuth = async () => {
    const trimmedUser = username.trim();
    const trimmedEmail = email.trim();
    if (!trimmedUser || !password) {
      setAuthModal({
        type: 'error',
        title: 'Missing fields',
        body: 'Please enter username and password.',
        buttonText: 'OK',
      });
      return;
    }
    if (authMode === 'signup' && !trimmedEmail) {
      setAuthModal({
        type: 'error',
        title: 'Missing email',
        body: 'Please enter your email to sign up.',
        buttonText: 'OK',
      });
      return;
    }
    setAuthLoading(true);
    setAuthModal(null);
    try {
      const endpoint = authMode === 'login' ? 'login' : 'signup';
      const formData = new URLSearchParams();
      formData.append('username', trimmedUser);
      formData.append('password', password);
      if (authMode === 'signup') formData.append('email', trimmedEmail);

      const res = await api.authenticate(endpoint, formData);
      const data = res.data as Record<string, unknown>;

      if (authMode === 'login') {
        const token = data?.access_token as string | undefined;
        const name = (data?.username as string) ?? trimmedUser;
        if (!token) {
          setAuthModal({
            type: 'error',
            title: 'Sign in failed',
            body: 'Server did not return a token. Please try again.',
            buttonText: 'Try again',
          });
          return;
        }
        setAuth(token, name);
        setCurrentUser(name);
        setIsLoggedIn(true);
      } else {
        setAuthMode('login');
        setPassword('');
        setAuthModal({
          type: 'success',
          title: 'Account created',
          body: 'You can now sign in with your username and password.',
          buttonText: 'Sign in',
        });
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string | string[] } }; message?: string };
      const detail = err?.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.join(' ')
        : typeof detail === 'string'
          ? detail
          : err?.message || 'Network error. Is the backend running at ' + API_BASE + '?';
      setAuthModal({
        type: 'error',
        title: authMode === 'login' ? 'Sign in failed' : 'Sign up failed',
        body: msg,
        buttonText: 'Try again',
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUploadFile = async (file: File) => {
    if (!file || !currentUser) return;
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      alert('Please upload a PDF file.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.upload(formData);
      loadUserData();
    } catch (e) {
      alert('Upload Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUploadFile(file);
    e.target.value = '';
  };

  const handleDeleteContract = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.deleteContract(deleteConfirmId);
      loadUserData();
      setDeleteConfirmId(null);
      showToast('Contract deleted', 'success');
    } catch (e) {
      setDeleteConfirmId(null);
      showToast('Failed to delete contract', 'error');
    }
  };

  const handleNotificationChange = async (contractId: string, reminderSetting: string) => {
    try {
      await api.updateReminder({
        contract_id: contractId,
        reminder_setting: reminderSetting,
      });
      loadUserData();
      const label = reminderSetting === 'none' ? 'Reminder removed' : `Reminder set to ${reminderSetting === 'week' ? '1 week' : '1 month'} before expiry`;
      showToast(label, 'success');
    } catch (err: any) {
      const isNetworkError = !err?.response && (err?.message === 'Network Error' || err?.code === 'ERR_NETWORK');
      const msg = isNetworkError
        ? `Could not reach the server. Make sure the backend is running at ${API_BASE}.`
        : (err?.response?.data?.detail ?? err?.message ?? 'Update failed.');
      showToast(Array.isArray(msg) ? msg.join(' ') : msg, 'error');
    }
  };

  // --- Analytics (derived from history) ---
  const analytics = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    let totalAnnual = 0;
    let noticeSum = 0, noticeCount = 0;
    let autoRenewalCount = 0;
    const riskCounts: Record<string, number> = {};
    const upcoming: { contract_id: string; party: string; expiry: string; annual_value: number; subject: string }[] = [];
    const byParty: Record<string, number> = {};
    const expiryByQuarter: Record<string, number> = {};
    let nextBig: { contract_id: string; party: string; expiry: string; subject: string; annual_value: number } | null = null;

    for (const c of history) {
      const d = safeParse(c.analysis) as ReturnType<typeof safeParse> & { annual_value?: number; has_auto_renewal?: boolean; notice_period_days?: number; risk_flags?: string[] };
      const annual = typeof d.annual_value === 'number' ? d.annual_value : 0;
      totalAnnual += annual;
      if (d.notice_period_days && d.notice_period_days > 0) {
        noticeSum += d.notice_period_days;
        noticeCount++;
      }
      if (d.has_auto_renewal) autoRenewalCount++;
      (d.risk_flags || []).forEach((f: string) => { riskCounts[f] = (riskCounts[f] || 0) + 1; });
      const party = d.party || 'Unknown';
      byParty[party] = (byParty[party] || 0) + 1;

      if (d.expiry && d.expiry !== 'N/A') {
        try {
          const expDate = new Date(d.expiry);
          const t = expDate.getTime();
          if (t > today) {
            const y = expDate.getFullYear();
            const q = Math.floor(expDate.getMonth() / 3) + 1;
            const key = `Q${q} ${y}`;
            expiryByQuarter[key] = (expiryByQuarter[key] || 0) + 1;
            upcoming.push({ contract_id: c.contract_id, party, expiry: d.expiry, annual_value: annual, subject: d.subject });
          }
        } catch (_) {}
      }
    }
    upcoming.sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime());
    const next3Payments = upcoming.slice(0, 3);
    if (upcoming.length > 0) {
      const u = upcoming[0];
      nextBig = { contract_id: u.contract_id, party: u.party, expiry: u.expiry, subject: u.subject, annual_value: u.annual_value };
    }
    const quarterOrder = Object.keys(expiryByQuarter).sort((a, b) => {
      const [qA, yA] = a.split(' ');
      const [qB, yB] = b.split(' ');
      if (yA !== yB) return parseInt(yA, 10) - parseInt(yB, 10);
      return parseInt(qA.replace('Q', ''), 10) - parseInt(qB.replace('Q', ''), 10);
    });
    const totalContracts = history.length;
    const partyEntries = Object.entries(byParty).sort((a, b) => b[1] - a[1]);
    const partyPie = partyEntries.map(([name, count]) => ({ name, count, pct: totalContracts ? Math.round((count / totalContracts) * 100) : 0 }));

    return {
      totalAnnual,
      avgMonthlyBurn: totalAnnual / 12,
      upcomingPayments: next3Payments,
      autoRenewalCount,
      noticeAvg: noticeCount ? Math.round(noticeSum / noticeCount) : 0,
      riskCounts: Object.entries(riskCounts).sort((a, b) => b[1] - a[1]),
      expiryClusters: quarterOrder.map(q => ({ quarter: q, count: expiryByQuarter[q] })),
      nextBig,
      topCounterparties: partyPie.slice(0, 8),
      totalContracts,
    };
  }, [history]);

  // --- Filter & Sort Logic ---
  const filteredAndSortedHistory = history
    .filter(c => {
      const details = safeParse(c.analysis);
      const searchString = `${details.party} ${details.subject} ${c.filename}`.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      const dA = safeParse(a.analysis);
      const dB = safeParse(b.analysis);
      if (sortBy === 'alphabetical') return dA.party.toLowerCase().localeCompare(dB.party.toLowerCase());
      if (sortBy === 'expiry') {
        if (dA.expiry === 'N/A') return 1;
        if (dB.expiry === 'N/A') return -1;
        return new Date(dA.expiry).getTime() - new Date(dB.expiry).getTime();
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  // --- Context value (must run on every render to satisfy Rules of Hooks) ---
  const appContextValue = useMemo(
    () => ({
      currentUser,
      userPicture,
      isGoogleConnected,
      history,
      loading,
      searchTerm,
      setSearchTerm,
      sortBy,
      setSortBy,
      loadUserData,
      handleUploadFile,
      handleUpload,
      handleDeleteContract,
      handleNotificationChange,
      handleFileClick: (contractId: string, e: React.MouseEvent) => {
        e.preventDefault();
        setPdfViewUrl((prev) => {
          if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
          return null;
        });
        getPdfBlobUrl(contractId)
          .then((url) => setPdfViewUrl(url))
          .catch(() => showToast('Failed to load PDF', 'error'));
      },
      setSelectedAnalysis,
      showToast,
      filteredAndSortedHistory,
      analytics,
    }),
    [
      currentUser,
      userPicture,
      isGoogleConnected,
      history,
      loading,
      searchTerm,
      sortBy,
      filteredAndSortedHistory,
      analytics,
      loadUserData,
      handleUploadFile,
      handleUpload,
      handleDeleteContract,
      handleNotificationChange,
      setSelectedAnalysis,
      showToast,
    ]
  );

  // --- Render Auth ---
  if (!isLoggedIn) {
     return (
       <div style={S.authContainerStyle}>
         <style>{`
           @keyframes authSuccessPop {
             from { opacity: 0; transform: scale(0.92); }
             to { opacity: 1; transform: scale(1); }
           }
           .auth-page input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2); }
           .auth-page button.primary-auth:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45); }
           .auth-page button.primary-auth:active { transform: translateY(0); }
           .auth-success-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45); }
           .auth-modal-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45); }
         `}</style>
         {authModal && (
           <div style={S.authSuccessOverlay} onClick={() => setAuthModal(null)} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
             <div style={S.authSuccessCard} onClick={e => e.stopPropagation()}>
               {authModal.type === 'success' ? (
                 <div style={S.authSuccessIcon}>✓</div>
               ) : (
                 <div style={S.authErrorIcon}>✕</div>
               )}
               <h2 id="auth-modal-title" style={authModal.type === 'success' ? S.authSuccessTitle : S.authErrorTitle}>
                 {authModal.title}
               </h2>
               <p style={authModal.type === 'success' ? S.authSuccessText : S.authErrorText}>
                 {authModal.body}
               </p>
               <button
                 type="button"
                 style={authModal.type === 'success' ? S.authSuccessBtn : S.authErrorBtn}
                 className="auth-modal-btn"
                 onClick={() => setAuthModal(null)}
               >
                 {authModal.buttonText}
               </button>
             </div>
           </div>
         )}
         <div style={S.authBgBlob1} aria-hidden />
         <div style={S.authBgBlob2} aria-hidden />
         <div style={S.authCardStyle} className="auth-page">
           <div style={S.logoIconLarge}>LV</div>
           <div style={S.authAppName}>LegalVault</div>
           <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
             {authMode === 'login' ? 'Welcome back' : 'Create your account'}
           </h2>
           <p style={S.modernInputSub}>
             {authMode === 'login'
               ? 'Sign in to manage and analyze your contracts.'
               : 'Get started with AI-powered contract insights.'}
           </p>
           <input
             placeholder="Username"
             value={username}
             onChange={e => setUsername(e.target.value)}
             style={S.modernInput}
             autoComplete="username"
           />
           {authMode === 'signup' && (
             <input
               placeholder="Email"
               type="email"
               value={email}
               onChange={e => setEmail(e.target.value)}
               style={S.modernInput}
               autoComplete="email"
             />
           )}
           <input
             type="password"
             placeholder="Password"
             value={password}
             onChange={e => setPassword(e.target.value)}
             style={S.modernInput}
             autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
           />
           <button
             type="button"
             onClick={handleAuth}
             disabled={authLoading}
             style={S.primaryBtnFull}
             className="primary-auth"
           >
             {authLoading ? (authMode === 'login' ? 'Signing in…' : 'Signing up…') : authMode === 'login' ? 'Sign in' : 'Sign up'}
           </button>
           <button
             type="button"
             onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
             style={{ ...S.toggleAuthText, background: 'none', border: 'none', padding: 0 }}
           >
             {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
           </button>
           <div style={S.authFeatures}>
             <span style={S.authFeaturePill}>📄 AI analysis</span>
             <span style={S.authFeaturePill}>🔒 Secure storage</span>
             <span style={S.authFeaturePill}>📅 Reminders</span>
           </div>
         </div>
       </div>
     );
  }

  // --- Main Render (logged-in dashboard with routing) ---
  return (
    <>
      <style>{`
        @keyframes scanMove { 0% { transform: translateY(-100%); } 100% { transform: translateY(400%); } }
        .scanner-line { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #6366f1, transparent); box-shadow: 0 0 15px #6366f1; animation: scanMove 2s linear infinite; }
        .card-hover:hover { transform: translateY(-5px); box-shadow: 0 12px 24px rgba(0,0,0,0.05); }
        .delete-trigger:hover .trash-lid { transform: translateY(-5px) rotate(-15deg); fill: #ef4444; }
        .delete-trigger:hover .trash-base { fill: #ef4444; }
        .trash-lid, .trash-base { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); fill: #94a3b8; }
        .delete-trigger svg { overflow: visible !important; }
      `}</style>

      <AppProvider value={appContextValue}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="about" element={<AboutPage />} />
          </Route>
        </Routes>
      </AppProvider>

      {selectedAnalysis && (
        <div style={S.modalOverlay} onClick={() => setSelectedAnalysis(null)}>
          <Card style={S.modalContent} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <Subtitle1 block style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>Contract Insights</Subtitle1>
              <Button appearance="subtle" onClick={() => setSelectedAnalysis(null)} aria-label="Close">×</Button>
            </div>
            <div style={S.modalBody}>{renderInsightContent(selectedAnalysis)}</div>
          </Card>
        </div>
      )}

      {pdfViewUrl && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(6px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001,
            padding: 24
          }}
          onClick={() => setPdfViewUrl((p) => (p?.startsWith('blob:') ? (URL.revokeObjectURL(p), null) : null))}
        >
          <div
            style={{
              background: '#fff', borderRadius: 16, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              width: '95vw', maxWidth: 900, height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
              <Subtitle1 block style={{ fontWeight: 700, color: '#1e293b' }}>Contract preview</Subtitle1>
              <Button appearance="subtle" onClick={() => setPdfViewUrl((p) => (p?.startsWith('blob:') ? (URL.revokeObjectURL(p), null) : null))} aria-label="Close">×</Button>
            </div>
            <iframe title="Contract PDF" src={pdfViewUrl} style={{ flex: 1, width: '100%', border: 'none', minHeight: 400 }} />
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div style={S.modalOverlay} onClick={() => setDeleteConfirmId(null)}>
          <Card style={S.deleteModalCard} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗑️</div>
            <Subtitle1 block style={S.deleteModalTitle}>Delete contract?</Subtitle1>
            <Body1 block style={S.deleteModalText}>This will permanently remove the contract and its analysis. This action cannot be undone.</Body1>
            <div style={S.deleteModalActions}>
              <Button appearance="secondary" style={S.deleteModalCancelBtn} onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
              <Button appearance="primary" style={S.deleteModalConfirmBtn} onClick={confirmDelete}>Delete</Button>
            </div>
          </Card>
        </div>
      )}

      {toast && (
        <div style={{ ...S.toastContainer, ...(toast.type === 'success' ? S.toastSuccess : S.toastError) }}>
          <span>{toast.type === 'success' ? '✓' : '!'}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </>
  );
}

export default App;