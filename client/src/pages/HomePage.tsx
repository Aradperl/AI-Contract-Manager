import { Link } from 'react-router-dom';
import { DashboardHeader } from '../components/DashboardHeader';
import { useApp } from '../context/AppContext';
import * as S from '../AppStyles';

export function HomePage() {
  const {
    analytics,
    filteredAndSortedHistory,
    loading,
    handleUpload,
    handleUploadFile,
  } = useApp();
  const recent = filteredAndSortedHistory.slice(0, 3);

  return (
    <div>
      <DashboardHeader
        loading={loading}
        onUpload={handleUpload}
        onFileDrop={handleUploadFile}
        showFilterBar={false}
      />

      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
          Quick overview
        </h2>
        <p style={{ fontSize: 15, color: '#64748b' }}>
          Your contract portfolio at a glance.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
        <div style={S.analyticsCard}>
          <span style={S.analyticsCardValue}>{analytics.totalContracts}</span>
          <span style={S.analyticsCardLabel}>Total contracts</span>
        </div>
        <div style={S.analyticsCard}>
          <span style={S.analyticsCardValue}>${(analytics.totalAnnual / 1000).toFixed(1)}k</span>
          <span style={S.analyticsCardLabel}>Annual liability</span>
        </div>
        <div style={S.analyticsCard}>
          <span style={S.analyticsCardValue}>{analytics.autoRenewalCount}</span>
          <span style={S.analyticsCardLabel}>Auto-renewals</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <Link
          to="/contracts"
          style={{
            padding: '14px 24px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
          }}
        >
          Upload contract
        </Link>
        <Link
          to="/analytics"
          style={{
            padding: '14px 24px',
            borderRadius: 14,
            border: '2px solid #e2e8f0',
            background: '#fff',
            color: '#475569',
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
          }}
        >
          View analytics
        </Link>
      </div>

      <section>
        <div style={S.sectionHeader}>
          <h2 style={S.sectionTitle}>Recent contracts</h2>
          {filteredAndSortedHistory.length > 0 && (
            <Link to="/contracts" style={{ ...S.countTag, textDecoration: 'none' }}>
              View all ({filteredAndSortedHistory.length})
            </Link>
          )}
        </div>
        {recent.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: 15 }}>
            No contracts yet. <Link to="/contracts" style={{ color: '#6366f1', fontWeight: 600 }}>Upload your first PDF</Link> to get started.
          </p>
        ) : (
          <div style={S.cardGrid}>
            {recent.map((c) => (
              <Link
                key={c.contract_id}
                to="/contracts"
                style={{
                  ...S.cardStyle,
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                }}
              >
                <div style={S.cardParty}>
                  {(typeof c.analysis === 'object' && c.analysis && 'party' in c.analysis
                    ? (c.analysis as { party?: string }).party
                    : 'Contract') || 'Contract'}
                </div>
                <div style={S.cardSummary}>
                  {typeof c.analysis === 'object' && c.analysis && 'subject' in c.analysis
                    ? String((c.analysis as { subject?: string }).subject || c.filename).slice(0, 80)
                    : c.filename}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
