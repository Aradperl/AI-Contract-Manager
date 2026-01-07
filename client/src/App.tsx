import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return localStorage.getItem('user_id') || '';
    } catch (e) {
      console.error('localStorage access failed:', e);
      return '';
    }
  });
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const fetchHistory = useCallback(async (uid: string) => {
    try {
      const res = await axios.get(`${API_BASE}/contracts?user_id=${uid}`);
      // הגנה קריטית: מוודאים ש-contracts הוא מערך
      const data = res.data?.contracts || [];
      const safeData = Array.isArray(data) ? data.filter(item => item && typeof item === 'object') : [];
      setHistory(safeData);
    } catch (e) {
      console.error("Fetch history failed", e);
      setHistory([]);
    }
  }, []);

  const checkGoogleConnection = useCallback(async (uid: string) => {
    try {
      const res = await axios.get(`${API_BASE}/check-google-connection?user_id=${uid}`);
      setIsGoogleConnected(res.data.connected || false);
    } catch (e) {
      console.error("Check Google connection failed", e);
      setIsGoogleConnected(false);
    }
  }, []);

  useEffect(() => {
    // Only run once on mount if user exists
    if (currentUser) {
      setIsLoggedIn(true);
      fetchHistory(currentUser);
      checkGoogleConnection(currentUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        fetchHistory(username);
        checkGoogleConnection(username);
      } else {
        alert("Registration successful! Please login.");
        setAuthMode('login');
      }
    } catch (e) {
      alert("Authentication Failed.");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', currentUser);
    try {
      await axios.post(`${API_BASE}/upload`, formData);
      fetchHistory(currentUser);
    } catch (error) {
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      const response = await axios.get(`${API_BASE}/auth/google?user_id=${currentUser}`);
      const authUrl = response.data.url;
      if (authUrl) {
        // Open in popup window for better UX
        const popup = window.open(
          authUrl,
          'google-auth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );
        
        // Check if popup was blocked
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          // Popup blocked, fallback to same window
          window.location.href = authUrl;
        } else {
          // Monitor popup for closure or redirect
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              // Check connection status and refresh data
              checkGoogleConnection(currentUser);
              fetchHistory(currentUser);
            }
          }, 500);
        }
      } else {
        alert("Failed to get Google authentication URL.");
      }
    } catch (error) {
      console.error("Google connect error:", error);
      alert("Failed to connect to Google. Please try again.");
    }
  };

  const handleFileClick = async (contractId: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      const response = await axios.get(`${API_BASE}/view/${contractId}?user_id=${currentUser}`);
      if (response.data.url) {
        // Create a temporary link element and click it to avoid popup blocker
        const link = document.createElement('a');
        link.href = response.data.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Failed to load document URL');
      }
    } catch (error) {
      console.error('Error loading document:', error);
      alert('Failed to load document. Please try again.');
    }
  };

  const handleNotificationChange = async (contractId: string, reminderSetting: string) => {
    try {
      const response = await axios.post(`${API_BASE}/update-reminder`, {
        contract_id: contractId,
        user_id: currentUser,
        reminder_setting: reminderSetting
      });
      
      // Show success message
      if (reminderSetting !== 'none') {
        if (response.data.calendar_event_created) {
          const eventLink = response.data.event_link;
          if (eventLink) {
            alert(`Notification set successfully! Calendar event created.`);
          }
        } else {
          const errorMsg = response.data.error_message || "Unknown error";
          alert(`Reminder setting saved, but calendar event could not be created.\n\nError: ${errorMsg}`);
        }
      } else {
        alert("Notification disabled.");
      }
      
      // Refresh history to show updated reminder setting
      fetchHistory(currentUser);
    } catch (error: any) {
      console.error("Update reminder failed:", error);
      const errorMsg = error.response?.data?.detail || error.message || "Failed to update notification setting.";
      alert(`❌ Error: ${errorMsg}`);
    }
  };

  // פונקציית פענוח "חסינת קריסה"
  const safeParse = (str: any) => {
    if (!str) return { subject: 'N/A', party: 'N/A', summary: 'No data' };
    try {
      // אם זה כבר אובייקט, פשוט נחזיר אותו
      const p = typeof str === 'string' ? JSON.parse(str) : str;
      return {
        subject: p.subject || 'N/A',
        party: p.party || 'N/A',
        summary: p.summary || (typeof str === 'string' ? str : 'No summary')
      };
    } catch (e) {
      return { subject: 'N/A', party: 'N/A', summary: String(str) };
    }
  };

  // Ensure history is always an array
  const safeHistory = Array.isArray(history) ? history : [];

  if (!isLoggedIn) {
    return (
    <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f0f4f8', fontFamily:'sans-serif'}}>
      <div style={{background:'white', padding:'40px', borderRadius:'15px', width:'320px', boxShadow:'0 10px 25px rgba(0,0,0,0.1)', textAlign:'center'}}>
        <h2 style={{color:'#333', marginBottom:'20px'}}>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
        <input placeholder="Username" onChange={e => setUsername(e.target.value)} style={inputStyle} />
        {authMode === 'signup' && <input placeholder="Email" onChange={e => setEmail(e.target.value)} style={inputStyle} />}
        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} style={inputStyle} />
        <button onClick={handleAuth} style={btnStyle}>Continue</button>
        <p onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} style={{color:'#007aff', cursor:'pointer', fontSize:'14px', marginTop:'20px'}}>
          {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Login"}
        </p>
      </div>
    </div>
    );
  }

  return (
    <div style={{maxWidth:'1100px', margin:'0 auto', padding:'40px 20px', fontFamily:'sans-serif'}}>
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
        <div>
          <h1 style={{color:'#007aff', margin:0, marginBottom:'5px'}}>Contract AI</h1>
          <p style={{color:'#666', fontSize:'14px', margin:0}}>Welcome, {currentUser}</p>
        </div>
        <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
          {isGoogleConnected ? (
            <span style={{color:'#10b981', fontSize:'14px', display:'flex', alignItems:'center', gap:'8px'}}>
              <span style={{width:'8px', height:'8px', background:'#10b981', borderRadius:'50%', display:'inline-block'}}></span>
              Google Connected
            </span>
          ) : (
            <button onClick={handleGoogleConnect} style={googleBtnStyle}>Connect Google</button>
          )}
          <button onClick={() => {localStorage.clear(); window.location.reload();}} style={{border:'none', background:'none', color:'#666', cursor:'pointer'}}>Logout</button>
        </div>
      </header>

      <div style={uploadZoneStyle}>
        <input type="file" id="file" onChange={handleUpload} style={{display:'none'}} />
        <label htmlFor="file" style={{cursor:'pointer', color:'#007aff', fontWeight:'bold', fontSize:'18px'}}>
          {loading ? "Analyzing..." : "+ Upload PDF Contract"}
        </label>
      </div>

      <div style={{background:'white', borderRadius:'12px', boxShadow:'0 4px 12px rgba(0,0,0,0.05)', overflow:'hidden'}}>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead style={{background:'#f8fafc'}}>
            <tr>
              <th style={thStyle}>Subject</th>
              <th style={thStyle}>File</th>
              <th style={thStyle}>Party</th>
              <th style={thStyle}>Date Uploaded</th>
              <th style={thStyle}>Analysis</th>
              {isGoogleConnected && <th style={thStyle}>Notification</th>}
            </tr>
          </thead>
          <tbody>
            {safeHistory.length > 0 ? safeHistory
              .filter((c) => c && typeof c === 'object')
              .map((c, index) => {
                const details = safeParse(c.analysis);
                const contractId = c.contract_id || `contract-${index}`;
                const reminderSetting = c.reminder_setting || 'none';
                // Format the timestamp
                const formatDate = (timestamp: string | undefined) => {
                  if (!timestamp) return 'N/A';
                  try {
                    const date = new Date(timestamp);
                    return date.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    });
                  } catch {
                    return timestamp;
                  }
                };

                return (
                  <tr key={contractId} style={{borderBottom:'1px solid #eee'}}>
                    <td style={tdStyle}>{String(details?.subject || 'N/A')}</td>
                    <td style={tdStyle}>
                      <a 
                        href="#"
                        onClick={(e) => handleFileClick(contractId, e)}
                        style={linkStyle}
                      >
                        {String(c.filename || 'N/A')}
                      </a>
                    </td>
                    <td style={tdStyle}>{String(details?.party || 'N/A')}</td>
                    <td style={tdStyle}>{formatDate(c.timestamp)}</td>
                    <td style={tdStyle}>
                      <button onClick={() => setSelectedAnalysis(String(details?.summary || 'No analysis available'))} style={viewBtnStyle}>View Analysis</button>
                    </td>
                    {isGoogleConnected && (
                      <td style={tdStyle}>
                        <select 
                          value={reminderSetting} 
                          onChange={(e) => handleNotificationChange(contractId, e.target.value)}
                          style={selectStyle}
                        >
                          <option value="none">No notification</option>
                          <option value="week">1 week before</option>
                          <option value="two_weeks">2 weeks before</option>
                          <option value="month">1 month before</option>
                        </select>
                      </td>
                    )}
                  </tr>
                );
              }) : (
              <tr><td colSpan={isGoogleConnected ? 6 : 5} style={{padding:'20px', textAlign:'center', color:'#666'}}>No contracts found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedAnalysis && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #eee', paddingBottom:'10px', marginBottom:'20px'}}>
              <h2 style={{margin:0}}>Analysis Summary</h2>
              <button onClick={()=>setSelectedAnalysis(null)} style={{cursor:'pointer', border:'none', background:'none', fontSize:'24px'}}>&times;</button>
            </div>
            <p style={{lineHeight:'1.7', whiteSpace:'pre-wrap'}}>{String(selectedAnalysis || '')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const inputStyle = { width:'100%', padding:'12px', marginBottom:'15px', borderRadius:'8px', border:'1px solid #ddd', boxSizing:'border-box' as 'border-box' };
const btnStyle = { width:'100%', padding:'12px', background:'#007aff', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' as 'bold' };
const googleBtnStyle = { padding:'10px 15px', borderRadius:'8px', border:'1px solid #4285F4', background:'white', color:'#4285F4', cursor:'pointer', fontWeight:'bold' as 'bold' };
const uploadZoneStyle = { background:'#eef2f7', padding:'40px', borderRadius:'15px', textAlign:'center' as 'center', marginBottom:'30px', border:'2px dashed #007aff' };
const thStyle = { padding:'15px', textAlign:'left' as 'left', color:'#666', borderBottom:'2px solid #eee' };
const tdStyle = { padding:'15px', color:'#333' };
const viewBtnStyle = { padding:'6px 12px', borderRadius:'6px', border:'1px solid #ddd', background:'white', cursor:'pointer' };
const selectStyle = { padding:'6px 10px', borderRadius:'6px', border:'1px solid #ddd', background:'white', cursor:'pointer', fontSize:'14px', minWidth:'150px' };
const linkStyle = { color:'#007aff', textDecoration:'underline', cursor:'pointer', fontWeight:'500' };
const modalOverlayStyle = { position:'fixed' as 'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.6)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000 };
const modalStyle = { background:'white', padding:'40px', borderRadius:'15px', maxWidth:'700px', width:'90%', maxHeight:'80vh', overflowY:'auto' as 'auto' };

export default App;