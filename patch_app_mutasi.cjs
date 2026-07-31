const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Ensure loadDataMutasi and saveDataMutasi are imported
if (!code.includes('loadDataMutasi')) {
  code = code.replace(
    "  loadDataInvoice,\n  saveDataInvoice,",
    "  loadDataInvoice,\n  saveDataInvoice,\n  loadDataMutasi,\n  saveDataMutasi,"
  );
}

if (!code.includes('DataMutasi')) {
  code = code.replace(
    "DataInvoice } from './types';",
    "DataInvoice, DataMutasi } from './types';"
  );
}

// Add states and handlers
const stateRegex = /const \[dataInvoice, setDataInvoice\] = useState<DataInvoice\[\]>\(\[\]\);/g;
if (!code.includes('const [dataMutasi, setDataMutasi] = useState<DataMutasi[]>([])')) {
  code = code.replace(
    "  const [dataInvoice, setDataInvoice] = useState<DataInvoice[]>([]);",
    "  const [dataInvoice, setDataInvoice] = useState<DataInvoice[]>([]);\n  const [dataMutasi, setDataMutasi] = useState<DataMutasi[]>([]);"
  );
}

if (!code.includes('setDataMutasi(loadDataMutasi());')) {
  code = code.replace(
    "      setDataInvoice(loadDataInvoice());",
    "      setDataInvoice(loadDataInvoice());\n      setDataMutasi(loadDataMutasi());"
  );
}

const handlersBlock = `
  const handleAddMutasi = async (newItem: Omit<DataMutasi, 'id'>) => {
    try {
      const docRef = doc(collection(db, 'mutasi'));
      const itemWithId = { ...newItem, id: docRef.id };
      await setDoc(docRef, itemWithId);
    } catch (error) {
      console.error('Error adding data mutasi:', error);
      alert('Gagal menambahkan data mutasi');
    }
  };

  const handleUpdateMutasi = async (id: string, updatedItem: Omit<DataMutasi, 'id'>) => {
    try {
      await setDoc(doc(db, 'mutasi', id), { ...updatedItem, id });
    } catch (error) {
      console.error('Error updating data mutasi:', error);
      alert('Gagal memperbarui data mutasi');
    }
  };

  const handleDeleteMutasi = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'mutasi', id));
    } catch (error) {
      console.error('Error deleting data mutasi:', error);
      alert('Gagal menghapus data mutasi');
    }
  };
`;

if (!code.includes('handleAddMutasi')) {
  code = code.replace(
    "  const handleAddInvoice = async (newItem: Omit<DataInvoice, 'id'>) => {",
    handlersBlock + "\n  const handleAddInvoice = async (newItem: Omit<DataInvoice, 'id'>) => {"
  );
}

const tabRenderRegex = /<RekapMutasiTab\s+dataPerhutani=\{dataPerhutani\}\s+\/>/g;
const newTabRender = `<RekapMutasiTab
              userRole={userRole}
              data={dataMutasi}
              onAddData={handleAddMutasi}
              onUpdateData={handleUpdateMutasi}
              onDeleteData={handleDeleteMutasi}
              onExportCSV={() => exportToCSV('mutasi')}
            />`;

code = code.replace(tabRenderRegex, newTabRender);

fs.writeFileSync('src/App.tsx', code);
