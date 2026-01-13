import React from 'react';
import * as S from '../AppStyles';

interface DashboardHeaderProps {
  loading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  sortBy: string;
  onSortChange: (val: any) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  loading, onUpload, searchTerm, onSearchChange, sortBy, onSortChange
}) => (
  <>
    <header style={S.heroSection}>
      <h1 style={S.heroTitle}>Your Contracts, <span style={S.gradientText}>Simplified.</span></h1>
      <p style={S.heroSub}>Upload PDFs and let AI extract key insights and manage deadlines for you.</p>
      <div style={S.uploadArea} className={loading ? "loading" : ""}>
        {loading && <div className="scanner-line"></div>}
        <input type="file" id="file" onChange={onUpload} style={{display:'none'}} />
        <label htmlFor="file" style={S.uploadLabel}>
          <div style={S.iconCircle}>{loading ? "⚙️" : "📁"}</div>
          <span style={{fontWeight:'600'}}>{loading ? "AI is analyzing document..." : "Click to upload or drag & drop"}</span>
        </label>
      </div>
    </header>

    <div style={S.filterBarContainer}>
      <input
        type="text"
        placeholder="Search contracts..."
        style={S.searchInputStyle}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
        <span style={{fontSize: '14px', color: '#64748b', fontWeight: '600'}}>Sort by:</span>
        <select style={S.sortSelectStyle} value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
          <option value="timestamp">Upload Date</option>
          <option value="alphabetical">Company (A-Z)</option>
          <option value="expiry">Expiration</option>
        </select>
      </div>
    </div>
  </>
);