import React from 'react';
import * as S from '../AppStyles';
import { safeParse } from '../utils/contractHelpers';

interface ContractCardProps {
  contract: any;
  onDelete: (id: string) => void;
  onFileClick: (id: string, e: React.MouseEvent) => void;
  onViewInsights: (summary: string) => void;
  onReminderChange: (id: string, setting: string) => void;
  isGoogleConnected: boolean;
}

export const ContractCard: React.FC<ContractCardProps> = ({
  contract,
  onDelete,
  onFileClick,
  onViewInsights,
  onReminderChange,
  isGoogleConnected
}) => {
  const details = safeParse(contract.analysis);

  return (
    <div style={S.cardStyle} className="card-hover">
      <div style={S.cardTop}>
        <span style={S.typeBadge}>{details.subject}</span>
        <button
          onClick={() => onDelete(contract.contract_id)}
          className="delete-trigger"
          title="Delete Contract"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path className="trash-lid" d="M15 4V3C15 2.44772 14.5523 2 14 2H10C9.44772 2 9 2.44772 9 3V4H4V6H20V4H15ZM11 4V3H13V4H11Z" />
            <path className="trash-base" fillRule="evenodd" clipRule="evenodd" d="M5 8V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V8H5ZM9 10H7V19H9V10ZM13 10H11V19H13V10ZM17 10H15V19H17V10Z" />
          </svg>
        </button>
      </div>

      <h3 style={S.cardParty}>{details.party}</h3>
      <p style={S.cardSummary}>{details.summary.substring(0, 90)}...</p>

      <div style={S.cardMeta}>
        <div style={S.metaItem}>📅 Uploaded: {new Date(contract.timestamp).toLocaleDateString()}</div>
        <div style={{
          ...S.metaItem,
          color: details.expiry !== 'N/A' ? '#e11d48' : '#94a3b8',
          fontWeight: '700'
        }}>
          ⌛ Expires: {details.expiry}
        </div>
      </div>

      <div style={S.cardActions}>
        <button onClick={(e) => onFileClick(contract.contract_id, e)} style={S.viewPdfBtn}>📄 View PDF</button>
        <button onClick={() => onViewInsights(details.summary)} style={S.secondaryBtn}>Insights</button>
        {isGoogleConnected && (
          <select
            value={contract.reminder_setting || 'none'}
            onChange={(e) => onReminderChange(contract.contract_id, e.target.value)}
            style={S.miniSelect}
          >
            <option value="none">No Alert</option>
            <option value="week">1 Week</option>
            <option value="month">1 Month</option>
          </select>
        )}
      </div>
    </div>
  );
};