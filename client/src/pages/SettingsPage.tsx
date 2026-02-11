import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../apiService';
import * as S from '../AppStyles';

const sectionStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #e2e8f0',
  padding: 24,
  marginBottom: 24,
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: '"Plus Jakarta Sans", sans-serif',
  fontSize: 18,
  fontWeight: 800,
  color: '#0f172a',
  marginBottom: 16,
  paddingBottom: 12,
  borderBottom: '2px solid #f1f5f9',
};

export function SettingsPage() {
  const { currentUser, isGoogleConnected, showToast } = useApp();
  const [defaultReminder, setDefaultReminder] = useState<string>(() => localStorage.getItem('default_reminder') || 'week');

  const handleDefaultReminderChange = (value: string) => {
    setDefaultReminder(value);
    localStorage.setItem('default_reminder', value);
    showToast('Default reminder saved');
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await api.connectGoogle(currentUser);
      if (res.data.url) window.open(res.data.url, 'google-auth', 'width=500,height=600');
    } catch {
      showToast('Could not open Google sign-in', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div>
      <h1 style={{ ...S.sectionTitle, fontSize: 28, marginBottom: 8 }}>Settings</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Manage your account and preferences.</p>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Account</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700, color: '#1e293b' }}>Username</div>
              <div style={{ fontSize: 14, color: '#64748b' }}>{currentUser}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700, color: '#1e293b' }}>Google Calendar</div>
              <div style={{ fontSize: 14, color: '#64748b' }}>
                {isGoogleConnected ? 'Connected — reminders sync to your calendar' : 'Not connected'}
              </div>
            </div>
            <button
              type="button"
              onClick={handleConnectGoogle}
              style={{
                padding: '10px 18px',
                borderRadius: 12,
                border: '2px solid #e2e8f0',
                background: '#fff',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              {isGoogleConnected ? 'Reconnect Google' : 'Connect Google'}
            </button>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Notifications</h2>
        <div>
          <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: 8 }}>
            Default reminder for new contracts
          </label>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 12 }}>
            When you upload a new contract, this reminder will be pre-selected (you can change it per contract).
          </p>
          <select
            value={defaultReminder}
            onChange={(e) => handleDefaultReminderChange(e.target.value)}
            style={{ ...S.sortSelectStyle, minWidth: 180 }}
          >
            <option value="none">No default reminder</option>
            <option value="week">1 week before expiry</option>
            <option value="month">1 month before expiry</option>
          </select>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Session</h2>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>
          Sign out of LegalVault on this device. You will need to sign in again to access your contracts.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            padding: '14px 24px',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
          }}
        >
          Log out
        </button>
      </section>
    </div>
  );
}
