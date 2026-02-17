import React from 'react';
import { Button, Text, Badge, Avatar } from '@fluentui/react-components';

interface NavbarProps {
  isGoogleConnected: boolean;
  userPicture: string | null;
  currentUser: string;
  onGoogleConnect: () => void;
}

const navbarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 72,
  padding: '0 28px',
  background: '#fff',
  borderBottom: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

const logoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
};

const logoIconStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 12,
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  color: '#fff',
  fontSize: 16,
  fontWeight: 800,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const Navbar: React.FC<NavbarProps> = ({ isGoogleConnected, userPicture, currentUser, onGoogleConnect }) => (
  <nav style={navbarStyle}>
    <div style={logoStyle}>
      <div style={logoIconStyle}>AI</div>
      <Text size={500} weight="bold">LegalVault</Text>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      {isGoogleConnected ? (
        <Badge appearance="filled" color="informative" size="medium">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            Google Active
          </span>
        </Badge>
      ) : (
        <Button appearance="outline" onClick={onGoogleConnect}>
          Connect Google
        </Button>
      )}
      <span style={{ width: 1, height: 24, background: '#e2e8f0' }} />
      <Avatar
        name={currentUser}
        image={{ src: userPicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser)}` }}
        title={currentUser}
      />
    </div>
  </nav>
);
