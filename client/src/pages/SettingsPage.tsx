import { useState } from 'react';
import { Card, Title1, Body1, Subtitle1, Caption1, Button, Label } from '@fluentui/react-components';
import { useApp } from '../context/AppContext';
import { api } from '../apiService';

const sectionTitleStyle: React.CSSProperties = {
  marginBottom: 16,
  paddingBottom: 12,
  borderBottom: '2px solid #f1f5f9',
};

export function SettingsPage() {
  const { currentUser, isGoogleConnected, showToast } = useApp();
  const [defaultReminder, setDefaultReminder] = useState<string>(
    () => localStorage.getItem('default_reminder') || 'week'
  );

  const handleDefaultReminderChange = (value: string) => {
    setDefaultReminder(value);
    localStorage.setItem('default_reminder', value);
    showToast('Default reminder saved');
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await api.connectGoogle();
      if (res.data.url) window.open(res.data.url, 'google-auth', 'width=500,height=600');
    } catch {
      showToast('Could not open Google sign-in', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const googleStatusText = isGoogleConnected
    ? 'Connected — reminders sync to your calendar'
    : 'Not connected';

  return (
    <>
      <Title1 block style={{ marginBottom: 8 }}>Settings</Title1>
      <Body1 block style={{ color: '#64748b', marginBottom: 32 }}>
        Manage your account and preferences.
      </Body1>

      <Card style={{ marginBottom: 24 }}>
        <Subtitle1 block style={sectionTitleStyle}>Account</Subtitle1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <Caption1 block style={{ fontWeight: 700, color: '#1e293b' }}>Username</Caption1>
              <Body1 block style={{ fontSize: 14, color: '#64748b' }}>{currentUser}</Body1>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <Caption1 block style={{ fontWeight: 700, color: '#1e293b' }}>Google Calendar</Caption1>
              <Body1 block style={{ fontSize: 14, color: '#64748b' }}>{googleStatusText}</Body1>
            </div>
            <Button
              appearance="outline"
              onClick={handleConnectGoogle}
            >
              {isGoogleConnected ? 'Reconnect Google' : 'Connect Google'}
            </Button>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Subtitle1 block style={sectionTitleStyle}>Notifications</Subtitle1>
        <Label style={{ display: 'block', marginBottom: 8 }}>Default reminder for new contracts</Label>
        <Body1 block style={{ fontSize: 14, color: '#64748b', marginBottom: 12 }}>
          When you upload a new contract, this reminder will be pre-selected (you can change it per contract).
        </Body1>
        <select
          value={defaultReminder}
          onChange={(e) => handleDefaultReminderChange(e.target.value)}
          style={{ minWidth: 180, padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }}
        >
          <option value="none">No default reminder</option>
          <option value="week">1 week before expiry</option>
          <option value="month">1 month before expiry</option>
        </select>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Subtitle1 block style={sectionTitleStyle}>Session</Subtitle1>
        <Body1 block style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>
          Sign out of LegalVault on this device. You will need to sign in again to access your contracts.
        </Body1>
        <Button
          appearance="primary"
          onClick={handleLogout}
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#fff',
          }}
        >
          Log out
        </Button>
      </Card>
    </>
  );
}
