import { Link } from 'react-router-dom';
import { Card, Text, Subtitle1, Body1, Caption1 } from '@fluentui/react-components';
import { DashboardHeader } from '../components/DashboardHeader';
import { useApp } from '../context/AppContext';
import type { ContractItem } from '../context/AppContext';

// --- Helper: extract party from contract analysis
function getContractParty(contract: ContractItem): string {
  if (typeof contract.analysis !== 'object' || !contract.analysis || !('party' in contract.analysis)) {
    return 'Contract';
  }
  const party = (contract.analysis as { party?: string }).party;
  return (party && String(party).trim()) || 'Contract';
}

// --- Helper: extract summary (subject or filename), capped length
function getContractSummary(contract: ContractItem, maxLength = 80): string {
  if (typeof contract.analysis === 'object' && contract.analysis && 'subject' in contract.analysis) {
    const subject = (contract.analysis as { subject?: string }).subject;
    const text = String(subject ?? contract.filename);
    return text.slice(0, maxLength) + (text.length > maxLength ? '…' : '');
  }
  return contract.filename;
}

// --- Helper: format annual value for display
function formatAnnual(value: number): string {
  return `$${(value / 1000).toFixed(1)}k`;
}

export function HomePage() {
  const {
    analytics,
    filteredAndSortedHistory,
    loading,
    handleUpload,
    handleUploadFile,
  } = useApp();

  const recentContracts = filteredAndSortedHistory.slice(0, 3);
  const hasContracts = recentContracts.length > 0;

  return (
    <>
      <DashboardHeader
        loading={loading}
        onUpload={handleUpload}
        onFileDrop={handleUploadFile}
        showFilterBar={false}
      />

      <div style={{ marginBottom: 28 }}>
        <Subtitle1 block style={{ marginBottom: 4 }}>Quick overview</Subtitle1>
        <Body1 block style={{ color: '#64748b' }}>Your contract portfolio at a glance.</Body1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
        <Card>
          <Text size={500} weight="semibold" block>{analytics.totalContracts}</Text>
          <Caption1 block style={{ color: '#64748b' }}>Total contracts</Caption1>
        </Card>
        <Card>
          <Text size={500} weight="semibold" block>{formatAnnual(analytics.totalAnnual)}</Text>
          <Caption1 block style={{ color: '#64748b' }}>Annual liability</Caption1>
        </Card>
        <Card>
          <Text size={500} weight="semibold" block>{analytics.autoRenewalCount}</Text>
          <Caption1 block style={{ color: '#64748b' }}>Auto-renewals</Caption1>
        </Card>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Subtitle1 block>Recent contracts</Subtitle1>
          {filteredAndSortedHistory.length > 0 && (
            <Link to="/contracts" style={{ fontSize: 14, color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
              View all ({filteredAndSortedHistory.length})
            </Link>
          )}
        </div>

        {!hasContracts ? (
          <Body1 style={{ color: '#64748b' }}>
            No contracts yet.{' '}
            <Link to="/contracts" style={{ color: '#6366f1', fontWeight: 600 }}>Upload your first PDF</Link> to get started.
          </Body1>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {recentContracts.map((c) => (
              <Link
                key={c.contract_id}
                to="/contracts"
                style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                <Card style={{ height: '100%' }}>
                  <Subtitle1 block style={{ marginBottom: 4 }}>{getContractParty(c)}</Subtitle1>
                  <Caption1 block style={{ color: '#64748b' }}>{getContractSummary(c)}</Caption1>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
