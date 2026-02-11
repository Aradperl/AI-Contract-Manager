import React from 'react';
import * as S from '../AppStyles';

interface NavbarProps {
  isGoogleConnected: boolean;
  userPicture: string | null;
  currentUser: string;
  onGoogleConnect: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isGoogleConnected, userPicture, currentUser, onGoogleConnect }) => (
  <nav style={S.navbarStyle}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={S.logoIcon}>AI</div>
      <span style={S.logoText}>LegalVault</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      {isGoogleConnected ? (
        <div style={S.statusBadge}><div style={S.onlineDot} /> Google Active</div>
      ) : (
        <button onClick={onGoogleConnect} style={S.googleConnectBtn}>Connect Google</button>
      )}
      <div style={S.divider} />
      <img src={userPicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser)}`} style={S.avatarStyle} alt="" referrerPolicy="no-referrer" title={currentUser} />
    </div>
  </nav>
);