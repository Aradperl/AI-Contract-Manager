import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('user_id') || '');
  const [userPicture, setUserPicture] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'alphabetical' | 'expiry'>('timestamp');

  const loadUserData = useCallback(async (uid: string) => {
    if (!uid) return;
    try {
      const [resContracts, resGoogle] = await Promise.all([
        axios.get(`${API_BASE}/contracts?user_id=${uid}`),
        axios.get(`${API_BASE}/check-google-connection?user_id=${uid}`)
      ]);
      setHistory(resContracts.data?.contracts || []);
      setIsGoogleConnected(resGoogle.data.connected || false);
      setUserPicture(resGoogle.data.picture_url || null);
    } catch (e) { console.error("Error loading data:", e); }
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "google-success" && currentUser) loadUserData(currentUser);
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [currentUser, loadUserData]);

  useEffect(() => {
    if (currentUser) {
      setIsLoggedIn(true);
      loadUserData(currentUser);
    }
  }, [currentUser, loadUserData]);

  const handleAuth = async () => {
    try {
      const endpoint = authMode === 'login' ? 'login' : 'signup';
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      if (authMode === 'signup') formData.append('email', email);
      await axios.post(`${API_BASE}/${endpoint}`, formData);
      if (authMode === 'login') {
        localStorage.setItem('user_id', username);
        setCurrentUser(username);
        setIsLoggedIn(true);
      } else {
        alert("Success! Please login.");
        setAuthMode('login');
      }
    } catch (e) { alert("Auth Failed"); }
  };

  const handleGoogleConnect = async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/google?user_id=${currentUser}`);
      if (res.data.url) window.open(res.data.url, 'google-auth', 'width=500,height=600');
    } catch (e) { alert("Google Connect Failed"); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', currentUser);
    try {
      await axios.post(`${API_BASE}/upload`, formData);
      loadUserData(currentUser);
    } catch (e) { alert("Upload Failed"); }
    finally { setLoading(false); }
  };

  const handleDeleteContract = async (id: string) => {
    if (!window.confirm("Delete permanently?")) return;
    try {
      await axios.delete(`${API_BASE}/contracts/${id}?user_id=${currentUser}`);
      loadUserData(currentUser);
    } catch (e) { alert("Delete failed"); }
  };

  const handleNotificationChange = async (contractId: string, reminderSetting: string) => {
    try {
      await axios.post(`${API_BASE}/update-reminder`, {
        contract_id: contractId,
        user_id: currentUser,
        reminder_setting: reminderSetting
      });
      loadUserData(currentUser);
    } catch (error) { alert("Update failed."); }
  };

  const safeParse = (str: any) => {
    if (!str) return { subject: 'General', party: 'Unknown', summary: 'N/A', expiry: 'N/A' };
    try {
      let parsed = typeof str === 'string' ? JSON.parse(str) : str;
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      return {
        subject: parsed?.subject || 'General Contract',
        party: parsed?.party || 'Unknown Party',
        summary: parsed?.summary || 'No summary.',
        expiry: parsed?.expiry_date || parsed?.expiry || 'N/A'
      };
    } catch (e) { return { subject: 'General', party: 'Unknown', summary: 'N/A', expiry: 'N/A' }; }
  };

  const handleFileClick = async (contractId: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const response = await axios.get(`${API_BASE}/view/${contractId}?user_id=${currentUser}`);
      if (response.data.url) window.open(response.data.url, '_blank');
    } catch (error) { alert('Failed to load document'); }
  };

  const filteredAndSortedHistory = history
    .filter(c => {
      const details = safeParse(c.analysis);
      const searchString = `${details.party} ${details.subject} ${c.filename}`.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return safeParse(a.analysis).party.toLowerCase().localeCompare(safeParse(b.analysis).party.toLowerCase());
      }
      if (sortBy === 'expiry') {
        const dateA = safeParse(a.analysis).expiry;
        const dateB = safeParse(b.analysis).expiry;
        if (dateA === 'N/A') return 1;
        if (dateB === 'N/A') return -1;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  if (!isLoggedIn) {
    return (
      <div style={authContainerStyle}>
        <div style={authCardStyle}>
          <div style={logoIconLarge}>AI</div>
          <h2 style={{fontSize: '24px', fontWeight: '700', marginBottom: '8px'}}>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p style={modernInputSub}>Secure your contracts with AI</p>
          <input placeholder="Username" onChange={e => setUsername(e.target.value)} style={modernInput} />
          {authMode === 'signup' && <input placeholder="Email" onChange={e => setEmail(e.target.value)} style={modernInput} />}
          <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} style={modernInput} />
          <button onClick={handleAuth} style={primaryBtnFull}>{authMode === 'login' ? 'Sign In' : 'Sign Up'}</button>
          <p onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} style={toggleAuthText}>
            {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={appWrapper}>
      <style>{`
        @keyframes scanMove { 0% { transform: translateY(-100%); } 100% { transform: translateY(400%); } }
        .scanner-line {
          position: absolute; top: 0; left: 0; width: 100%; height: 2px;
          background: linear-gradient(90deg, transparent, #6366f1, transparent);
          box-shadow: 0 0 15px #6366f1; animation: scanMove 2s linear infinite;
        }
        .card-hover:hover { transform: translateY(-5px); box-shadow: 0 12px 24px rgba(0,0,0,0.05); }

        /* Trash Can Fix & Animation */
        .delete-trigger { background: none; border: none; cursor: pointer; padding: 10px; border-radius: 10px; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; position: relative; }
        .delete-trigger:hover { background-color: #fee2e2; }

        .delete-trigger svg {
          overflow: visible !important; /* התיקון הקריטי: מאפשר למכסה לצאת מהמסגרת */
        }

        .delete-trigger:hover .trash-lid { transform: translateY(-5px) rotate(-15deg); fill: #ef4444; }
        .delete-trigger:hover .trash-base { fill: #ef4444; }
        .trash-lid, .trash-base { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); fill: #94a3b8; }
      `}</style>

      <nav style={navbarStyle}>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <div style={logoIcon}>AI</div>
          <span style={logoText}>LegalVault</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'24px'}}>
          {isGoogleConnected ? (
            <div style={statusBadge}><div style={onlineDot} /> Google Active</div>
          ) : (
            <button onClick={handleGoogleConnect} style={googleConnectBtn}>Connect Google</button>
          )}
          <div style={divider} />
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
            <img src={userPicture || "https://ui-avatars.com/api/?name="+currentUser} style={avatarStyle} alt="profile" />
            <button onClick={() => {localStorage.clear(); window.location.reload();}} style={logoutBtn}>Logout</button>
          </div>
        </div>
      </nav>

      <header style={heroSection}>
        <h1 style={heroTitle}>Your Contracts, <span style={gradientText}>Simplified.</span></h1>
        <p style={heroSub}>Upload PDFs and let AI extract key insights and manage deadlines for you.</p>
        <div style={uploadArea} className={loading ? "loading" : ""}>
          {loading && <div className="scanner-line"></div>}
          <input type="file" id="file" onChange={handleUpload} style={{display:'none'}} />
          <label htmlFor="file" style={uploadLabel}>
            <div style={iconCircle}>{loading ? "⚙️" : "📁"}</div>
            <span style={{fontWeight:'600'}}>{loading ? "AI is analyzing your document..." : "Click to upload or drag & drop"}</span>
          </label>
        </div>
      </header>

      <div style={filterBarContainer}>
        <input
          type="text"
          placeholder="Search contracts..."
          style={searchInputStyle}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
          <span style={{fontSize: '14px', color: '#64748b', fontWeight: '600'}}>Sort by:</span>
          <select style={sortSelectStyle} value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="timestamp">Upload Date</option>
            <option value="alphabetical">Company (A-Z)</option>
            <option value="expiry">Expiration</option>
          </select>
        </div>
      </div>

      <section style={gridSection}>
        <div style={sectionHeader}>
          <h2 style={sectionTitle}>Recent Analysis</h2>
          <span style={countTag}>{history.length} Documents</span>
        </div>

        <div style={cardGrid}>
          {filteredAndSortedHistory.map((c, idx) => {
            const details = safeParse(c.analysis);
            return (
              <div key={c.contract_id || idx} style={cardStyle} className="card-hover">
                <div style={cardTop}>
                  <span style={typeBadge}>{details.subject}</span>
                  <button onClick={() => handleDeleteContract(c.contract_id)} className="delete-trigger" title="Delete Contract">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path className="trash-lid" d="M15 4V3C15 2.44772 14.5523 2 14 2H10C9.44772 2 9 2.44772 9 3V4H4V6H20V4H15ZM11 4V3H13V4H11Z" />
                        <path className="trash-base" fillRule="evenodd" clipRule="evenodd" d="M5 8V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V8H5ZM9 10H7V19H9V10ZM13 10H11V19H13V10ZM17 10H15V19H17V10Z" />
                    </svg>
                  </button>
                </div>

                <h3 style={cardParty}>{details.party}</h3>
                <p style={cardSummary}>{details.summary.substring(0, 90)}...</p>

                <div style={cardMeta}>
                  <div style={metaItem}>📅 Uploaded: {new Date(c.timestamp).toLocaleDateString()}</div>
                  <div style={{ ...metaItem, color: details.expiry !== 'N/A' ? '#e11d48' : '#94a3b8', fontWeight: '700' }}>⌛ Expires: {details.expiry}</div>
                </div>

                <div style={cardActions}>
                  <button onClick={(e) => handleFileClick(c.contract_id, e)} style={viewPdfBtn}>📄 View PDF</button>
                  <button onClick={() => setSelectedAnalysis(details.summary)} style={secondaryBtn}>Insights</button>
                  {isGoogleConnected && (
                    <select value={c.reminder_setting || 'none'} onChange={(e) => handleNotificationChange(c.contract_id, e.target.value)} style={miniSelect}>
                      <option value="none">No Alert</option>
                      <option value="week">1 Week</option>
                      <option value="month">1 Month</option>
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {selectedAnalysis && (
        <div style={modalOverlay} onClick={() => setSelectedAnalysis(null)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={modalHeader}>
              <h3>Contract Insights</h3>
              <button onClick={()=>setSelectedAnalysis(null)} style={closeModal}>×</button>
            </div>
            <div style={modalBody}>{selectedAnalysis}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Styles ---
const appWrapper = { backgroundColor: '#f8fafc', minHeight: '100vh', padding: '0 5% 50px 5%', fontFamily: '"Inter", sans-serif' };
const navbarStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #e2e8f0', marginBottom: '60px' };
const logoIcon = { background: '#6366f1', color: 'white', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' };
const logoText = { fontSize: '20px', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.5px' };
const statusBadge = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#059669', background: '#f0fdf4', padding: '6px 12px', borderRadius: '20px' };
const onlineDot = { width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' };
const divider = { width: '1px', height: '24px', background: '#e2e8f0' };
const avatarStyle = { width: '38px', height: '38px', borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };
const logoutBtn = { color: '#ef4444', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none', background: 'none' };
const heroSection = { textAlign: 'center' as 'center', maxWidth: '800px', margin: '0 auto 60px auto' };
const heroTitle = { fontSize: '48px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', letterSpacing: '-1px' };
const gradientText = { background: 'linear-gradient(90deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };
const heroSub = { fontSize: '18px', color: '#64748b', lineHeight: '1.6' };
const uploadArea = { position: 'relative' as 'relative', background: '#fff', border: '2px dashed #e2e8f0', borderRadius: '24px', padding: '40px', marginTop: '40px', transition: 'all 0.3s ease', cursor: 'pointer', overflow: 'hidden' };
const uploadLabel = { display: 'flex', flexDirection: 'column' as 'column', alignItems: 'center', gap: '8px', color: '#475569' };
const iconCircle = { width: '56px', height: '56px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '10px' };
const gridSection = { marginTop: '40px' };
const sectionHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' };
const sectionTitle = { fontSize: '20px', fontWeight: '700', color: '#1e293b' };
const countTag = { fontSize: '12px', fontWeight: '600', color: '#6366f1', background: '#eef2ff', padding: '4px 10px', borderRadius: '12px' };
const cardGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' };
const cardStyle = { background: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column' as 'column' };
const cardTop = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' };
const typeBadge = { fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' as 'uppercase', color: '#6366f1', background: '#f5f3ff', padding: '6px 12px', borderRadius: '20px', letterSpacing: '0.5px' };
const cardParty = { fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' };
const cardSummary = { fontSize: '14px', color: '#64748b', lineHeight: '1.5', flex: 1 };
const cardMeta = { display: 'flex', gap: '16px', marginTop: '20px', padding: '12px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' };
const metaItem = { fontSize: '12px', color: '#94a3b8', fontWeight: '500' };
const cardActions = { display: 'flex', gap: '10px', marginTop: '16px' };
const viewPdfBtn = { flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontWeight: '600', cursor: 'pointer', fontSize: '13px' };
const secondaryBtn = { flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '13px' };
const miniSelect = { padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' };
const modalOverlay = { position: 'fixed' as 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { background: '#fff', width: '90%', maxWidth: '600px', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' };
const modalBody = { fontSize: '16px', color: '#334155', lineHeight: '1.8', whiteSpace: 'pre-wrap' as 'pre-wrap', paddingTop: '10px' };
const closeModal = { border: 'none', background: 'none', fontSize: '28px', color: '#94a3b8', cursor: 'pointer' };
const authContainerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' };
const authCardStyle = { background: '#fff', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', textAlign: 'center' as 'center' };
const logoIconLarge = { background: '#6366f1', color: 'white', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px', margin: '0 auto 20px auto' };
const modernInput = { width: '100%', padding: '14px', marginBottom: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', boxSizing: 'border-box' as 'border-box' };
const modernInputSub = { color: '#64748b', marginBottom: '24px', fontSize: '14px' };
const primaryBtnFull = { width: '100%', padding: '14px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', marginTop: '10px', fontSize: '15px' };
const toggleAuthText = { color: '#6366f1', cursor: 'pointer', fontSize: '14px', marginTop: '20px', fontWeight: '500' };
const googleConnectBtn = { background: '#fff', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' };
const filterBarContainer = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '20px', flexWrap: 'wrap' as 'wrap' };
const searchInputStyle = { flex: 1, minWidth: '300px', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '15px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const sortSelectStyle = { padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#fff', fontSize: '14px', fontWeight: '600', outline: 'none', cursor: 'pointer' };

export default App;