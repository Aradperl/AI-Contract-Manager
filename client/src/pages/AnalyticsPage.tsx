import { useApp } from '../context/AppContext';
import * as S from '../AppStyles';

export function AnalyticsPage() {
  const { analytics } = useApp();

  return (
    <section style={{ ...S.analyticsSection, marginTop: 0 }}>
      <h2 style={S.analyticsSectionTitle}>Analytics</h2>
      <p style={S.analyticsSectionSub}>Contract insights and risk overview</p>

      {/* 1. Financial Exposure */}
      <div style={S.analyticsBlock}>
        <h3 style={S.analyticsBlockTitle}>Financial Exposure</h3>
        <div style={S.analyticsGrid}>
          <div style={S.analyticsCard}>
            <span style={S.analyticsCardValue}>${(analytics.totalAnnual / 1000).toFixed(1)}k</span>
            <span style={S.analyticsCardLabel}>Total Annual Liability</span>
          </div>
          <div style={S.analyticsCard}>
            <span style={S.analyticsCardValue}>${Math.round(analytics.avgMonthlyBurn).toLocaleString()}</span>
            <span style={S.analyticsCardLabel}>Average Monthly Burn</span>
          </div>
        </div>
        <div style={S.analyticsPanel}>
          <h4 style={S.analyticsPanelTitle}>Upcoming Payments</h4>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>Next 3 expiries to plan for</p>
          {analytics.upcomingPayments.length === 0 ? (
            <p style={S.analyticsEmpty}>No upcoming payments.</p>
          ) : (
            <ul style={S.analyticsList}>
              {analytics.upcomingPayments.map((u) => (
                <li key={u.contract_id} style={S.analyticsListItem}>
                  <span style={S.analyticsListParty}>{u.party}</span>
                  <span style={S.analyticsListExpiry}>
                    {new Date(u.expiry).toLocaleDateString()}
                    {u.annual_value ? ` · $${(u.annual_value / 1000).toFixed(1)}k/yr` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 2. Risk Assessment */}
      <div style={S.analyticsBlock}>
        <h3 style={S.analyticsBlockTitle}>Risk Assessment</h3>
        <div style={S.analyticsGrid}>
          <div style={{ ...S.analyticsCard, ...S.analyticsCardWarning }}>
            <span style={S.analyticsCardValue}>{analytics.autoRenewalCount}</span>
            <span style={S.analyticsCardLabel}>Auto-Renewal Tracker</span>
          </div>
          <div style={S.analyticsCard}>
            <span style={S.analyticsCardValue}>{analytics.noticeAvg} days</span>
            <span style={S.analyticsCardLabel}>Termination Notice Avg</span>
          </div>
        </div>
        <div style={S.analyticsPanel}>
          <h4 style={S.analyticsPanelTitle}>Risk Heatmap</h4>
          {analytics.riskCounts.length === 0 ? (
            <p style={S.analyticsEmpty}>No red flags detected in contracts.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {analytics.riskCounts.map(([flag, count]) => (
                <span
                  key={flag}
                  style={{
                    background: '#fef2f2',
                    color: '#b91c1c',
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {flag.replace(/_/g, ' ')}: {count}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Expiry Pipeline */}
      <div style={S.analyticsBlock}>
        <h3 style={S.analyticsBlockTitle}>Expiry Pipeline</h3>
        <div style={S.analyticsRow}>
          <div style={S.analyticsPanel}>
            <h4 style={S.analyticsPanelTitle}>Expiry Clusters</h4>
            {analytics.expiryClusters.length === 0 ? (
              <p style={S.analyticsEmpty}>No expiries in the pipeline.</p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, minHeight: 120 }}>
                {analytics.expiryClusters.map(({ quarter, count }) => {
                  const max = Math.max(...analytics.expiryClusters.map((c) => c.count), 1);
                  return (
                    <div key={quarter} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ height: 80, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <div
                          style={{
                            width: '100%',
                            maxWidth: 40,
                            height: `${(count / max) * 100}%`,
                            background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                            borderRadius: '8px 8px 0 0',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{quarter}</span>
                      <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div style={S.analyticsPanel}>
            <h4 style={S.analyticsPanelTitle}>Next Big Expiry</h4>
            {!analytics.nextBig ? (
              <p style={S.analyticsEmpty}>No upcoming expiries.</p>
            ) : (
              <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>
                  {analytics.nextBig.party}
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>{analytics.nextBig.subject}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#6366f1' }}>
                  Expires: {new Date(analytics.nextBig.expiry).toLocaleDateString()}
                </div>
                {analytics.nextBig.annual_value > 0 && (
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    ~${(analytics.nextBig.annual_value / 1000).toFixed(1)}k/year
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Vendor Concentration */}
      <div style={S.analyticsBlock}>
        <h3 style={S.analyticsBlockTitle}>Vendor Concentration</h3>
        <div style={S.analyticsPanel}>
          <h4 style={S.analyticsPanelTitle}>Top Counterparties</h4>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>With whom you have the most contracts</p>
          {analytics.topCounterparties.length === 0 ? (
            <p style={S.analyticsEmpty}>No contracts yet.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: '50%',
                  background: (() => {
                    const colors = [
                      '#6366f1',
                      '#8b5cf6',
                      '#a855f7',
                      '#d946ef',
                      '#ec4899',
                      '#f43f5e',
                      '#fb923c',
                      '#eab308',
                    ];
                    const parts = analytics.topCounterparties.map((p, i) => {
                      const start = analytics.topCounterparties.slice(0, i).reduce((s, x) => s + x.pct, 0);
                      return `${colors[i % colors.length]} ${start}% ${start + p.pct}%`;
                    });
                    return `conic-gradient(${parts.join(', ')})`;
                  })(),
                }}
              />
              <ul style={{ ...S.analyticsList, flex: 1, minWidth: 200 }}>
                {analytics.topCounterparties.map((p) => (
                  <li key={p.name} style={S.analyticsListRow}>
                    <span style={S.analyticsListSubject}>{p.name}</span>
                    <span style={S.analyticsListCount}>
                      {p.count} ({p.pct}%)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
