import React, { useState } from 'react';
import * as S from '../AppStyles';

interface DashboardHeaderProps {
  loading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDrop: (file: File) => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  sortBy?: string;
  onSortChange?: (val: string) => void;
  /** When false, only hero + upload are shown (e.g. on Home). Default true. */
  showFilterBar?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  loading,
  onUpload,
  onFileDrop,
  searchTerm = '',
  onSearchChange = () => {},
  sortBy = 'timestamp',
  onSortChange = () => {},
  showFilterBar = true,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const preventDefault = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent) => {
    preventDefault(e);
    if (!loading) setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    preventDefault(e);
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    preventDefault(e);
    setDragActive(false);
    if (loading) return;
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      onFileDrop(file);
    }
  };

  return (
  <>
    <header style={S.heroSection}>
      <h1 style={S.heroTitle}>Your Contracts, <span style={S.gradientText}>Simplified.</span></h1>
      <p style={S.heroSub}>Upload PDFs and let AI extract key insights and manage deadlines for you.</p>
      <div
        style={{ ...S.uploadArea, ...(dragActive ? S.uploadAreaDragActive : {}) }}
        className={loading ? "loading" : ""}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {loading && <div className="scanner-line"></div>}
        <input type="file" id="file" accept="application/pdf,.pdf" onChange={onUpload} style={{display:'none'}} />
        <label htmlFor="file" style={S.uploadLabel}>
          <div style={S.iconCircle}>{loading ? "⚙️" : "📁"}</div>
          <span style={{fontWeight:'600'}}>{loading ? "AI is analyzing document..." : "Click to upload or drag & drop a PDF"}</span>
        </label>
      </div>
    </header>

    {showFilterBar && (
      <div style={S.filterBarContainer}>
        <input
          type="text"
          placeholder="Search contracts..."
          style={S.searchInputStyle}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Sort by:</span>
          <select style={S.sortSelectStyle} value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
            <option value="timestamp">Upload Date</option>
            <option value="alphabetical">Company (A-Z)</option>
            <option value="expiry">Expiration</option>
          </select>
        </div>
      </div>
    )}
  </>
  );
};