import { useState, useEffect, useMemo } from 'react';
import { CompactUploadBar } from '../components/CompactUploadBar';
import { ContractCard } from '../components/ContractCard';
import { useApp } from '../context/AppContext';
import { api, type FolderItem } from '../apiService';
import { safeParse } from '../utils/contractHelpers';
import * as S from '../AppStyles';

const SYSTEM_FOLDERS = [
  { id: 'all', label: 'All', symbol: '📋', color: '#64748b' },
  { id: 'expires_30', label: 'Expires in 30 days', symbol: '⏰', color: '#ea580c' },
  { id: 'not_signed', label: 'Not signed', symbol: '✍️', color: '#7c3aed' },
  { id: 'red_flag', label: 'Red flag', symbol: '🚩', color: '#dc2626' },
] as const;

function getContractIdsInFolder(
  folderId: string,
  customFolders: FolderItem[],
  contracts: { contract_id: string; analysis: string | Record<string, unknown> }[]
): string[] {
  if (folderId === 'all') return contracts.map((c) => c.contract_id);
  if (folderId === 'expires_30') {
    const now = Date.now();
    const in30 = now + 30 * 24 * 60 * 60 * 1000;
    return contracts
      .filter((c) => {
        const d = safeParse(c.analysis);
        if (d.expiry === 'N/A') return false;
        try {
          const t = new Date(d.expiry).getTime();
          return t >= now && t <= in30;
        } catch {
          return false;
        }
      })
      .map((c) => c.contract_id);
  }
  if (folderId === 'not_signed') {
    return contracts.filter((c) => !safeParse(c.analysis).is_signed).map((c) => c.contract_id);
  }
  if (folderId === 'red_flag') {
    return contracts.filter((c) => safeParse(c.analysis).risk_flags?.length > 0).map((c) => c.contract_id);
  }
  const folder = customFolders.find((f) => f.folder_id === folderId);
  return folder?.contract_ids ?? [];
}

export function ContractsPage() {
  const {
    currentUser,
    loading,
    handleUpload,
    handleUploadFile,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filteredAndSortedHistory,
    handleDeleteContract,
    handleFileClick,
    setSelectedAnalysis,
    handleNotificationChange,
    isGoogleConnected,
    showToast,
  } = useApp();

  const [customFolders, setCustomFolders] = useState<FolderItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [folderModal, setFolderModal] = useState<'closed' | 'new' | { edit: FolderItem }>('closed');
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#6366f1');
  const [newFolderSymbol, setNewFolderSymbol] = useState('📁');
  const [savingFolder, setSavingFolder] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    api
      .getFolders(currentUser)
      .then((r) => setCustomFolders(r.data.folders || []))
      .catch(() => setCustomFolders([]));
  }, [currentUser]);

  const contractIdsInSelectedFolder = useMemo(() => {
    return getContractIdsInFolder(selectedFolderId, customFolders, filteredAndSortedHistory);
  }, [selectedFolderId, customFolders, filteredAndSortedHistory]);

  const displayContracts = useMemo(() => {
    const idSet = new Set(contractIdsInSelectedFolder);
    return filteredAndSortedHistory.filter((c) => idSet.has(c.contract_id));
  }, [filteredAndSortedHistory, contractIdsInSelectedFolder]);

  const handleCreateFolder = async () => {
    const name = newFolderName.trim() || 'New folder';
    setSavingFolder(true);
    try {
      await api.createFolder({ user_id: currentUser, name, color: newFolderColor, symbol: newFolderSymbol });
      const res = await api.getFolders(currentUser);
      setCustomFolders(res.data.folders || []);
      setFolderModal('closed');
      setNewFolderName('');
      setNewFolderColor('#6366f1');
      setNewFolderSymbol('📁');
      showToast('Folder created');
    } catch (e: unknown) {
      showToast(e && typeof e === 'object' && 'response' in e ? String((e as { response?: { data?: unknown } }).response?.data) : 'Failed to create folder', 'error');
    } finally {
      setSavingFolder(false);
    }
  };

  const handleUpdateFolderContracts = async (folderId: string, contractId: string, add: boolean) => {
    const folder = customFolders.find((f) => f.folder_id === folderId);
    if (!folder) return;
    const ids = add
      ? [...(folder.contract_ids || []), contractId].filter((id, i, a) => a.indexOf(id) === i)
      : (folder.contract_ids || []).filter((id) => id !== contractId);
    try {
      await api.updateFolder(folderId, { user_id: currentUser, contract_ids: ids });
      setCustomFolders((prev) => prev.map((f) => (f.folder_id === folderId ? { ...f, contract_ids: ids } : f)));
      showToast(add ? 'Added to folder' : 'Removed from folder');
    } catch {
      showToast('Update failed', 'error');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await api.deleteFolder(folderId, currentUser);
      setCustomFolders((prev) => prev.filter((f) => f.folder_id !== folderId));
      if (selectedFolderId === folderId) setSelectedFolderId('all');
      showToast('Folder deleted');
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  return (
    <>
      <CompactUploadBar loading={loading} onUpload={handleUpload} onFileDrop={handleUploadFile} />

      <div style={S.filterBarContainer}>
        <input
          type="text"
          placeholder="Search contracts..."
          style={S.searchInputStyle}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Sort by:</span>
          <select style={S.sortSelectStyle} value={sortBy} onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'alphabetical' | 'expiry')}>
            <option value="timestamp">Upload Date</option>
            <option value="alphabetical">Company (A-Z)</option>
            <option value="expiry">Expiration</option>
          </select>
        </div>
      </div>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ ...S.sectionTitle, marginBottom: 12 }}>Folders</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          {SYSTEM_FOLDERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFolderId(f.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 12,
                border: selectedFolderId === f.id ? `2px solid ${f.color}` : '1px solid #e2e8f0',
                background: selectedFolderId === f.id ? `${f.color}12` : '#fff',
                color: selectedFolderId === f.id ? f.color : '#475569',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              <span>{f.symbol}</span>
              {f.label}
              {f.id !== 'all' && (
                <span style={{ fontSize: 12, opacity: 0.8 }}>
                  ({getContractIdsInFolder(f.id, customFolders, filteredAndSortedHistory).length})
                </span>
              )}
            </button>
          ))}
          {customFolders.map((f) => (
            <div key={f.folder_id} style={{ display: 'inline-flex', alignItems: 'center', gap: 0 }}>
              <button
                type="button"
                onClick={() => setSelectedFolderId(f.folder_id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: '12px 0 0 12px',
                  border: selectedFolderId === f.folder_id ? `2px solid ${f.color}` : '1px solid #e2e8f0',
                  borderRight: 'none',
                  background: selectedFolderId === f.folder_id ? `${f.color}18` : '#fff',
                  color: selectedFolderId === f.folder_id ? f.color : '#475569',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                <span>{f.symbol || '📁'}</span>
                {f.name}
                <span style={{ fontSize: 12, opacity: 0.8 }}>({(f.contract_ids || []).length})</span>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDeleteFolder(f.folder_id); }}
                title="Delete folder"
                style={{
                  padding: '10px 10px',
                  borderRadius: '0 12px 12px 0',
                  border: selectedFolderId === f.folder_id ? `2px solid ${f.color}` : '1px solid #e2e8f0',
                  borderLeft: 'none',
                  background: selectedFolderId === f.folder_id ? `${f.color}18` : '#fff',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => { setFolderModal('new'); setNewFolderName(''); setNewFolderColor('#6366f1'); setNewFolderSymbol('📁'); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              borderRadius: 12,
              border: '2px dashed #cbd5e1',
              background: '#f8fafc',
              color: '#64748b',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            + Add folder
          </button>
        </div>
      </section>

      <section style={S.gridSection}>
        <div style={S.sectionHeader}>
          <h2 style={S.sectionTitle}>
            {selectedFolderId === 'all' ? 'All contracts' : SYSTEM_FOLDERS.find((f) => f.id === selectedFolderId)?.label || customFolders.find((f) => f.folder_id === selectedFolderId)?.name || 'Folder'}
          </h2>
          <span style={S.countTag}>{displayContracts.length} documents</span>
        </div>
        <div style={S.cardGrid}>
          {displayContracts.map((c) => (
            <ContractCard
              key={c.contract_id}
              contract={c}
              onDelete={handleDeleteContract}
              onFileClick={handleFileClick}
              onViewInsights={setSelectedAnalysis}
              onReminderChange={handleNotificationChange}
              isGoogleConnected={isGoogleConnected}
              customFolders={customFolders}
              onAddToFolder={handleUpdateFolderContracts}
            />
          ))}
        </div>
      </section>

      {folderModal === 'new' && (
        <div style={S.modalOverlay} onClick={() => setFolderModal('closed')}>
          <div style={S.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>New folder</h3>
              <button type="button" onClick={() => setFolderModal('closed')} style={S.closeModal} aria-label="Close">×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#475569' }}>Name</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Vendors"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 15 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#475569' }}>Color</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={newFolderColor}
                    onChange={(e) => setNewFolderColor(e.target.value)}
                    style={{ width: 44, height: 44, padding: 2, borderRadius: 10, border: '1px solid #e2e8f0', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={newFolderColor}
                    onChange={(e) => setNewFolderColor(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14 }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#475569' }}>Symbol (emoji)</label>
                <input
                  type="text"
                  value={newFolderSymbol}
                  onChange={(e) => setNewFolderSymbol(e.target.value.slice(0, 2))}
                  placeholder="📁"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 20 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setFolderModal('closed')} style={S.deleteModalCancelBtn}>Cancel</button>
                <button
                  type="button"
                  onClick={handleCreateFolder}
                  disabled={savingFolder}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: savingFolder ? 'not-allowed' : 'pointer',
                  }}
                >
                  {savingFolder ? 'Creating…' : 'Create folder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
