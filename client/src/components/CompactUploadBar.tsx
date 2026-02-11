import { useState } from 'react';
import * as S from '../AppStyles';

interface CompactUploadBarProps {
  loading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDrop: (file: File) => void;
}

export function CompactUploadBar({ loading, onUpload, onFileDrop }: CompactUploadBarProps) {
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
    <div
      style={{
        ...S.uploadArea,
        ...(dragActive ? S.uploadAreaDragActive : {}),
        padding: '16px 24px',
        marginTop: 0,
        marginBottom: 24,
        borderRadius: 16,
      }}
      className={loading ? 'loading' : ''}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {loading && <div className="scanner-line" />}
      <input type="file" id="compact-file" accept="application/pdf,.pdf" onChange={onUpload} style={{ display: 'none' }} />
      <label htmlFor="compact-file" style={{ ...S.uploadLabel, flexDirection: 'row', cursor: 'pointer', margin: 0 }}>
        <div style={{ ...S.iconCircle, width: 44, height: 44, fontSize: 20, marginBottom: 0 }}>{loading ? '⚙️' : '📄'}</div>
        <span style={{ fontWeight: 600, fontSize: 15 }}>
          {loading ? 'Analyzing…' : 'Add new contract — click or drop PDF here'}
        </span>
      </label>
    </div>
  );
}
