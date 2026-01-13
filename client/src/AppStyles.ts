import React from 'react';

// --- Layout & Containers ---
export const appWrapper: React.CSSProperties = {
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    padding: '0 5% 50px 5%',
    fontFamily: '"Inter", sans-serif'
};

export const filterBarContainer: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    gap: '20px',
    flexWrap: 'wrap'
};

export const gridSection: React.CSSProperties = { marginTop: '40px' };

export const cardGrid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px'
};

// --- Navigation ---
export const navbarStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 0',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '60px'
};

export const logoIcon: React.CSSProperties = {
    background: '#6366f1',
    color: 'white',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
};

export const logoText: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: '-0.5px'
};

export const statusBadge: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#059669',
    background: '#f0fdf4',
    padding: '6px 12px',
    borderRadius: '20px'
};

export const onlineDot: React.CSSProperties = {
    width: '8px',
    height: '8px',
    background: '#10b981',
    borderRadius: '50%'
};

export const divider: React.CSSProperties = {
    width: '1px',
    height: '24px',
    background: '#e2e8f0'
};

export const avatarStyle: React.CSSProperties = {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    border: '2px solid #fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

export const logoutBtn: React.CSSProperties = {
    color: '#ef4444',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    background: 'none'
};

// --- Hero & Upload ---
export const heroSection: React.CSSProperties = {
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto 60px auto'
};

export const heroTitle: React.CSSProperties = {
    fontSize: '48px',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '16px',
    letterSpacing: '-1px'
};

export const gradientText: React.CSSProperties = {
    background: 'linear-gradient(90deg, #6366f1, #a855f7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
};

export const heroSub: React.CSSProperties = {
    fontSize: '18px',
    color: '#64748b',
    lineHeight: '1.6'
};

export const uploadArea: React.CSSProperties = {
    position: 'relative',
    background: '#fff',
    border: '2px dashed #e2e8f0',
    borderRadius: '24px',
    padding: '40px',
    marginTop: '40px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    overflow: 'hidden'
};

export const uploadLabel: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    color: '#475569'
};

export const iconCircle: React.CSSProperties = {
    width: '56px',
    height: '56px',
    background: '#f1f5f9',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    marginBottom: '10px'
};

// --- Content Header ---
export const sectionHeader: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
};

export const sectionTitle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b'
};

export const countTag: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6366f1',
    background: '#eef2ff',
    padding: '4px 10px',
    borderRadius: '12px'
};

// --- Contract Card ---
export const cardStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column'
};

export const cardTop: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
};

export const typeBadge: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#6366f1',
    background: '#f5f3ff',
    padding: '6px 12px',
    borderRadius: '20px',
    letterSpacing: '0.5px'
};

export const cardParty: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '8px',
    marginTop: '4px'
};

export const cardSummary: React.CSSProperties = {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.5',
    flex: 1
};

export const cardMeta: React.CSSProperties = {
    display: 'flex',
    gap: '16px',
    marginTop: '20px',
    padding: '12px 0',
    borderTop: '1px solid #f1f5f9',
    borderBottom: '1px solid #f1f5f9'
};

export const metaItem: React.CSSProperties = {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: '500'
};

export const cardActions: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    marginTop: '16px'
};

// --- Buttons & Inputs ---
export const viewPdfBtn: React.CSSProperties = {
    flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0',
    background: '#f8fafc', color: '#1e293b', fontWeight: '600', cursor: 'pointer', fontSize: '13px'
};

export const secondaryBtn: React.CSSProperties = {
    flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0',
    background: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '13px'
};

export const miniSelect: React.CSSProperties = {
    padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px'
};

export const searchInputStyle: React.CSSProperties = {
    flex: 1, minWidth: '300px', padding: '12px 20px', borderRadius: '12px',
    border: '1px solid #e2e8f0', outline: 'none', fontSize: '15px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
};

export const sortSelectStyle: React.CSSProperties = {
    padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0',
    backgroundColor: '#fff', fontSize: '14px', fontWeight: '600', outline: 'none', cursor: 'pointer'
};

// --- Modal ---
export const modalOverlay: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};

export const modalContent: React.CSSProperties = {
    background: '#fff', width: '90%', maxWidth: '600px', borderRadius: '24px',
    padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)'
};

export const modalHeader: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', marginBottom: '20px'
};

export const modalBody: React.CSSProperties = {
    fontSize: '16px', color: '#334155', lineHeight: '1.8',
    whiteSpace: 'pre-wrap', paddingTop: '10px'
};

export const closeModal: React.CSSProperties = {
    border: 'none', background: 'none', fontSize: '28px', color: '#94a3b8', cursor: 'pointer'
};

// --- Auth ---
export const authContainerStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc'
};

export const authCardStyle: React.CSSProperties = {
    background: '#fff', padding: '40px', borderRadius: '24px', width: '100%',
    maxWidth: '380px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', textAlign: 'center'
};

export const logoIconLarge: React.CSSProperties = {
    background: '#6366f1', color: 'white', width: '48px', height: '48px',
    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold', fontSize: '20px', margin: '0 auto 20px auto'
};

export const modernInput: React.CSSProperties = {
    width: '100%', padding: '14px', marginBottom: '12px', borderRadius: '12px',
    border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', boxSizing: 'border-box'
};

export const modernInputSub: React.CSSProperties = {
    color: '#64748b', marginBottom: '24px', fontSize: '14px'
};

export const primaryBtnFull: React.CSSProperties = {
    width: '100%', padding: '14px', background: '#6366f1', color: 'white',
    border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer',
    marginTop: '10px', fontSize: '15px'
};

export const toggleAuthText: React.CSSProperties = {
    color: '#6366f1', cursor: 'pointer', fontSize: '14px', marginTop: '20px', fontWeight: '500'
};

export const googleConnectBtn: React.CSSProperties = {
    background: '#fff', border: '1px solid #e2e8f0', padding: '8px 16px',
    borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
};