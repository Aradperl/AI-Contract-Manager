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
const navFont = '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif';

export const navbarStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    fontFamily: navFont,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
};

export const logoIcon: React.CSSProperties = {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: 'white',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '14px',
    letterSpacing: '-0.02em'
};

export const logoText: React.CSSProperties = {
    fontFamily: navFont,
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.03em'
};

export const statusBadge: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: navFont,
    fontSize: '12px',
    fontWeight: '600',
    color: '#047857',
    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    padding: '8px 14px',
    borderRadius: '12px',
    letterSpacing: '0.02em'
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
const headingFont = '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif';

export const heroSection: React.CSSProperties = {
    textAlign: 'center',
    maxWidth: '900px',
    margin: '0 auto 56px auto',
    paddingTop: '8px'
};

export const heroTitle: React.CSSProperties = {
    fontFamily: headingFont,
    fontSize: 'clamp(40px, 6vw, 56px)',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '16px',
    letterSpacing: '-0.03em',
    lineHeight: 1.15
};

export const gradientText: React.CSSProperties = {
    fontFamily: headingFont,
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
};

export const heroSub: React.CSSProperties = {
    fontFamily: headingFont,
    fontSize: 'clamp(18px, 2vw, 22px)',
    color: '#64748b',
    lineHeight: 1.5,
    fontWeight: '500'
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

export const uploadAreaDragActive: React.CSSProperties = {
    borderColor: '#6366f1',
    background: '#f5f3ff',
    boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.15)'
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
    fontFamily: headingFont,
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.02em'
};

export const countTag: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6366f1',
    background: '#eef2ff',
    padding: '4px 10px',
    borderRadius: '12px'
};

// --- Analytics ---
export const analyticsSection: React.CSSProperties = {
    marginTop: '48px',
    marginBottom: '48px'
};
export const analyticsBlock: React.CSSProperties = {
    marginBottom: '40px'
};
export const analyticsBlockTitle: React.CSSProperties = {
    fontFamily: headingFont,
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '2px solid #e2e8f0',
    letterSpacing: '-0.02em'
};
export const analyticsSectionTitle: React.CSSProperties = {
    fontFamily: headingFont,
    fontSize: '26px',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '6px',
    letterSpacing: '-0.03em'
};
export const analyticsSectionSub: React.CSSProperties = {
    fontFamily: headingFont,
    fontSize: '15px',
    color: '#64748b',
    marginBottom: '24px',
    fontWeight: '500'
};
export const analyticsGrid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
};
export const analyticsCard: React.CSSProperties = {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s'
};
export const analyticsCardWarning: React.CSSProperties = {
    borderColor: '#fcd34d',
    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
};
export const analyticsCardInfo: React.CSSProperties = {
    borderColor: '#93c5fd',
    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
};
export const analyticsCardNeutral: React.CSSProperties = {
    borderColor: '#e2e8f0',
    background: '#f8fafc'
};
export const analyticsCardValue: React.CSSProperties = {
    display: 'block',
    fontSize: '28px',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '4px'
};
export const analyticsCardLabel: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b'
};
export const analyticsRow: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px'
};
export const analyticsPanel: React.CSSProperties = {
    background: '#fff',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
};
export const analyticsPanelTitle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f1f5f9'
};
export const analyticsEmpty: React.CSSProperties = {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0
};
export const analyticsList: React.CSSProperties = {
    listStyle: 'none',
    margin: 0,
    padding: 0
};
export const analyticsListItem: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '14px'
};
export const analyticsListParty: React.CSSProperties = { fontWeight: '600', color: '#1e293b' };
export const analyticsListExpiry: React.CSSProperties = { color: '#64748b', fontWeight: '500' };
export const analyticsListRow: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '14px'
};
export const analyticsListSubject: React.CSSProperties = { color: '#475569', fontWeight: '500' };
export const analyticsListCount: React.CSSProperties = { fontWeight: '700', color: '#6366f1' };

// --- Contract Card ---
export const cardStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
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
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px 20px',
    marginTop: '20px',
    padding: '14px 0',
    borderTop: '1px solid #f1f5f9',
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'center'
};

export const metaItem: React.CSSProperties = {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0
};

export const metaCell: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0
};
export const metaLabel: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
};
export const metaValue: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569'
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

export const pdfOverlay: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(6px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001,
    padding: '24px'
};

export const pdfModalContent: React.CSSProperties = {
    background: '#fff', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    width: '95vw', maxWidth: '900px', height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
};

export const pdfModalHeader: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', borderBottom: '1px solid #e2e8f0', flexShrink: 0
};

export const pdfLoadingPlaceholder: React.CSSProperties = {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#64748b', fontSize: '16px', fontWeight: 600
};

export const pdfIframe: React.CSSProperties = {
    flex: 1, width: '100%', border: 'none', minHeight: '400px'
};

export const modalContent: React.CSSProperties = {
    background: '#fff', width: '90%', maxWidth: '600px', borderRadius: '24px',
    padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)'
};

export const modalHeader: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', marginBottom: '20px'
};

export const modalBody: React.CSSProperties = {
    paddingTop: '4px'
};

// Insights content (rendered inside modal body)
export const insightsBlock: React.CSSProperties = {
    fontSize: '15px',
    color: '#334155',
    lineHeight: 1.6,
    marginBottom: '16px'
};

export const insightsHeading: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: '800',
    color: '#6366f1',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
    marginTop: '16px'
};

export const insightsList: React.CSSProperties = {
    margin: '0 0 12px 0',
    paddingLeft: '20px'
};

export const insightsListItem: React.CSSProperties = {
    marginBottom: '6px',
    color: '#475569'
};

export const insightsParagraph: React.CSSProperties = {
    margin: '0 0 10px 0',
    color: '#475569'
};

export const insightsBold: React.CSSProperties = {
    fontWeight: '700',
    color: '#1e293b'
};

export const closeModal: React.CSSProperties = {
    border: 'none', background: 'none', fontSize: '28px', color: '#94a3b8', cursor: 'pointer'
};

// Delete confirmation modal
export const deleteModalCard: React.CSSProperties = {
    background: '#fff', borderRadius: '24px', padding: '32px 28px', maxWidth: '400px', width: '100%',
    textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)'
};
export const deleteModalTitle: React.CSSProperties = { fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' };
export const deleteModalText: React.CSSProperties = { fontSize: '15px', color: '#64748b', marginBottom: '24px', lineHeight: 1.5 };
export const deleteModalActions: React.CSSProperties = { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' };
export const deleteModalCancelBtn: React.CSSProperties = {
    padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff',
    fontWeight: '600', fontSize: '15px', cursor: 'pointer', color: '#475569'
};
export const deleteModalConfirmBtn: React.CSSProperties = {
    padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    color: '#fff', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)'
};

// Toast notification
export const toastContainer: React.CSSProperties = {
    position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 1100,
    padding: '14px 24px', borderRadius: '14px', fontWeight: '600', fontSize: '15px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)', maxWidth: '90vw', display: 'flex', alignItems: 'center', gap: '10px'
};
export const toastSuccess: React.CSSProperties = { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' };
export const toastError: React.CSSProperties = { background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff' };

// --- Auth ---
export const authContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 40%, #f8fafc 100%)',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif'
};

export const authBgBlob1: React.CSSProperties = {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
    top: '-100px',
    right: '-100px',
    pointerEvents: 'none'
};

export const authBgBlob2: React.CSSProperties = {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
    bottom: '-50px',
    left: '-50px',
    pointerEvents: 'none'
};

export const authCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    padding: '48px 44px',
    borderRadius: '28px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.12), 0 0 0 1px rgba(255,255,255,0.8)',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
    backdropFilter: 'blur(12px)',
    fontFamily: 'inherit'
};

export const logoIconLarge: React.CSSProperties = {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: 'white',
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '22px',
    margin: '0 auto 16px auto',
    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)'
};

export const authAppName: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: '-0.5px',
    marginBottom: '4px'
};

export const modernInput: React.CSSProperties = {
    width: '100%',
    padding: '14px 18px',
    marginBottom: '14px',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    outline: 'none',
    fontSize: '15px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    backgroundColor: '#fafbfc'
};

export const modernInputSub: React.CSSProperties = {
    color: '#64748b',
    marginBottom: '28px',
    fontSize: '14px',
    lineHeight: 1.4
};

export const primaryBtnFull: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #6366f1 0%, #5b21b6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
    fontSize: '15px',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
    transition: 'transform 0.15s, box-shadow 0.15s'
};

export const toggleAuthText: React.CSSProperties = {
    color: '#6366f1',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '24px',
    fontWeight: '600',
    display: 'block'
};

export const authFeatures: React.CSSProperties = {
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '16px'
};

export const authFeaturePill: React.CSSProperties = {
    fontSize: '12px',
    color: '#6366f1',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
    border: '1px solid #c7d2fe'
};

// Signup success overlay & card
export const authSuccessOverlay: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px'
};

export const authSuccessCard: React.CSSProperties = {
    background: '#fff',
    borderRadius: '24px',
    padding: '40px 36px',
    maxWidth: '380px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)',
    animation: 'authSuccessPop 0.3s ease-out'
};

export const authSuccessIcon: React.CSSProperties = {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px auto',
    fontSize: '32px',
    fontWeight: '700',
    boxShadow: '0 12px 24px rgba(16, 185, 129, 0.35)'
};

export const authSuccessTitle: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '8px',
    letterSpacing: '-0.5px'
};

export const authSuccessText: React.CSSProperties = {
    fontSize: '15px',
    color: '#64748b',
    lineHeight: 1.5,
    marginBottom: '24px'
};

export const authSuccessBtn: React.CSSProperties = {
    width: '100%',
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #6366f1 0%, #5b21b6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
    transition: 'transform 0.15s, box-shadow 0.15s'
};

// Auth error (same card pattern, error styling)
export const authErrorIcon: React.CSSProperties = {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px auto',
    fontSize: '32px',
    fontWeight: '700',
    boxShadow: '0 12px 24px rgba(239, 68, 68, 0.35)'
};

export const authErrorTitle: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '8px',
    letterSpacing: '-0.5px'
};

export const authErrorText: React.CSSProperties = {
    fontSize: '15px',
    color: '#64748b',
    lineHeight: 1.5,
    marginBottom: '24px'
};

export const authErrorBtn: React.CSSProperties = {
    width: '100%',
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #6366f1 0%, #5b21b6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
    transition: 'transform 0.15s, box-shadow 0.15s'
};

export const googleConnectBtn: React.CSSProperties = {
    fontFamily: navFont,
    background: '#fff',
    border: '2px solid #e2e8f0',
    padding: '10px 18px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#475569'
};