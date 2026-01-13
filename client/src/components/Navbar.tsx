import React from 'react';
import * as S from '../AppStyles';

interface NavbarProps {
  isGoogleConnected: boolean;
  userPicture: string | null;
  currentUser: string;
  onGoogleConnect: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isGoogleConnected, userPicture, currentUser, onGoogleConnect, onLogout }) => (
  <nav style={S.navbarStyle}>
    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
      <div style={S.logoIcon}>AI</div>
      <span style={S.logoText}>LegalVault</span>
    </div>
    <div style={{display:'flex', alignItems:'center', gap:'24px'}}>
      {isGoogleConnected ? (
        <div style={S.statusBadge}><div style={S.onlineDot} /> Google Active</div>
      ) : (
        <button onClick={onGoogleConnect} style={S.googleConnectBtn}>Connect Google</button>
      )}
      <div style={S.divider} />
      <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
        <img src={userPicture || `https://ui-avatars.com/api/?name=${currentUser}`} style={S.avatarStyle} alt="profile" />
        <button onClick={onLogout} style={S.logoutBtn}>Logout</button>
      </div>
    </div>
  </nav>
);