export const backupToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(`backup_${key}`, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    console.error('Backup failed:', e);
  }
};

export const restoreFromLocalStorage = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(`backup_${key}`);
    if (!item) return null;
    return JSON.parse(item).data as T;
  } catch {
    return null;
  }
};

export const exportToJSON = (data: any, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const clearBackup = (key: string): void => {
  localStorage.removeItem(`backup_${key}`);
};
