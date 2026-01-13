import React, { useState, useEffect, useCallback } from 'react';
import * as S from './AppStyles';
import { api } from './apiService';
import { ContractCard } from './components/ContractCard';
import { Navbar } from './components/Navbar';
import { DashboardHeader } from './components/DashboardHeader';
import { safeParse } from './utils/contractHelpers';

function App() {
  // --- States ---
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

  // --- Data Loading ---
  const loadUserData = useCallback(async (uid: string) => {
    if (!uid) return;
    try {
      const [resContracts, resGoogle] = await Promise.all([
        api.getContracts(uid),
        api.checkGoogle(uid)
      ]);
      setHistory(resContracts.data?.contracts || []);
      setIsGoogleConnected(resGoogle.data.connected || false);
      setUserPicture(resGoogle.data.picture_url || null);
    } catch (e) { console.error("Error loading data:", e); }
  }, []);

  // האזנה להצלחת התחברות מגוגל (בחלון קופץ)
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

  // --- Handlers ---
  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleAuth = async () => {
    try {
      const endpoint = authMode === 'login' ? 'login' : 'signup';
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      if (authMode === 'signup') formData.append('email', email);

      await api.authenticate(endpoint, formData);

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
      const res = await api.connectGoogle(currentUser);
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
      await api.upload(formData);
      loadUserData(currentUser);
    } catch (e) { alert("Upload Failed"); }
    finally { setLoading(false); }
  };

  const handleDeleteContract = async (id: string) => {
    if (!window.confirm("Delete permanently?")) return;
    try {
      await api.deleteContract(id, currentUser);
      loadUserData(currentUser);
    } catch (e) { alert("Delete failed"); }
  };

  const handleNotificationChange = async (contractId: string, reminderSetting: string) => {
    try {
      await api.updateReminder({
        contract_id: contractId,
        user_id: currentUser,
        reminder_setting: reminderSetting
      });
      loadUserData(currentUser);
    } catch (error) { alert("Update failed."); }
  };

  const handleFileClick = async (contractId: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const response = await api.viewContract(contractId, currentUser);
      if (response.data.url) window.open(response.data.url, '_blank');
    } catch (error) { alert('Failed to load document'); }
  };

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

  // --- Render Auth ---
  if (!isLoggedIn) {
     return (
       <div style={S.authContainerStyle}>
         <div style={S.authCardStyle}>
           <div style={S.logoIconLarge}>AI</div>
           <h2 style={{fontSize: '24px', fontWeight: '700', marginBottom: '8px'}}>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
           <p style={S.modernInputSub}>Secure your contracts with AI</p>
           <input placeholder="Username" onChange={e => setUsername(e.target.value)} style={S.modernInput} />
           {authMode === 'signup' && <input placeholder="Email" onChange={e => setEmail(e.target.value)} style={S.modernInput} />}
           <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} style={S.modernInput} />
           <button onClick={handleAuth} style={S.primaryBtnFull}>{authMode === 'login' ? 'Sign In' : 'Sign Up'}</button>
           <p onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} style={S.toggleAuthText}>
             {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Login"}
           </p>
         </div>
       </div>
     );
  }

  // --- Main Render ---
  return (
    <div style={S.appWrapper}>
      <style>{`
        @keyframes scanMove { 0% { transform: translateY(-100%); } 100% { transform: translateY(400%); } }
        .scanner-line { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #6366f1, transparent); box-shadow: 0 0 15px #6366f1; animation: scanMove 2s linear infinite; }
        .card-hover:hover { transform: translateY(-5px); box-shadow: 0 12px 24px rgba(0,0,0,0.05); }
        .delete-trigger:hover .trash-lid { transform: translateY(-5px) rotate(-15deg); fill: #ef4444; }
        .delete-trigger:hover .trash-base { fill: #ef4444; }
        .trash-lid, .trash-base { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); fill: #94a3b8; }
        .delete-trigger svg { overflow: visible !important; }
      `}</style>

      <Navbar
        isGoogleConnected={isGoogleConnected}
        userPicture={userPicture}
        currentUser={currentUser}
        onGoogleConnect={handleGoogleConnect}
        onLogout={handleLogout}
      />

      <DashboardHeader
        loading={loading}
        onUpload={handleUpload}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <section style={S.gridSection}>
        <div style={S.sectionHeader}>
          <h2 style={S.sectionTitle}>Recent Analysis</h2>
          <span style={S.countTag}>{history.length} Documents</span>
        </div>
        <div style={S.cardGrid}>
          {filteredAndSortedHistory.map((c) => (
            <ContractCard
              key={c.contract_id}
              contract={c}
              onDelete={handleDeleteContract}
              onFileClick={handleFileClick}
              onViewInsights={setSelectedAnalysis}
              onReminderChange={handleNotificationChange}
              isGoogleConnected={isGoogleConnected}
            />
          ))}
        </div>
      </section>

      {selectedAnalysis && (
        <div style={S.modalOverlay} onClick={() => setSelectedAnalysis(null)}>
          <div style={S.modalContent} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h3>Contract Insights</h3>
              <button onClick={()=>setSelectedAnalysis(null)} style={S.closeModal}>×</button>
            </div>
            <div style={S.modalBody}>{selectedAnalysis}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;