import { googleSignIn, getAccessToken } from './firebase';
import { 
  loadDataAngkut, 
  loadDataKetiga, 
  loadDataPerhutani, 
  loadDataDKP, 
  loadDataInvoice, 
  loadDataMutasi 
} from './storage';

export const backupToGoogleDrive = async () => {
  try {
    let token = await getAccessToken();
    if (!token) {
      const authResult = await googleSignIn();
      if (!authResult || !authResult.accessToken) {
        throw new Error('Gagal login ke Google.');
      }
      token = authResult.accessToken;
    }

    const data = {
      angkut: loadDataAngkut(),
      ketiga: loadDataKetiga(),
      perhutani: loadDataPerhutani(),
      dkp: loadDataDKP(),
      invoice: loadDataInvoice(),
      mutasi: loadDataMutasi(),
      timestamp: new Date().toISOString()
    };
    
    const fileContent = JSON.stringify(data, null, 2);
    const file = new Blob([fileContent], { type: 'application/json' });
    const metadata = {
      name: `Backup_TPK_Talok_${new Date().toISOString().split('T')[0]}.json`,
      mimeType: 'application/json'
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form
    });

    if (!response.ok) {
      throw new Error(`Google Drive API error: ${response.statusText}`);
    }

    alert('Backup berhasil disimpan ke Google Drive!');
  } catch (error: any) {
    console.error('Backup error:', error);
    alert('Gagal melakukan backup ke Google Drive: ' + error.message);
  }
};

export const listGoogleDriveBackups = async () => {
  try {
    let token = await getAccessToken();
    if (!token) {
      const authResult = await googleSignIn();
      if (!authResult || !authResult.accessToken) {
        throw new Error('Gagal login ke Google.');
      }
      token = authResult.accessToken;
    }

    const query = encodeURIComponent("name contains 'Backup_TPK_Talok_' and mimeType='application/json' and trashed=false");
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=createdTime desc&pageSize=10`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Google Drive API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (error: any) {
    console.error('List backups error:', error);
    throw error;
  }
};

export const restoreFromGoogleDrive = async (fileId: string) => {
  try {
    let token = await getAccessToken();
    if (!token) {
      throw new Error('Gagal memverifikasi akses token. Silakan login kembali.');
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Gagal mengunduh file backup.`);
    }

    const content = await response.json();
    return content;
  } catch (error: any) {
    console.error('Restore backup error:', error);
    throw error;
  }
};
