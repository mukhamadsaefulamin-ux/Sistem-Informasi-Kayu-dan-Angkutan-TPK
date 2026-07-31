const fs = require('fs');
let code = fs.readFileSync('src/components/ImportModal.tsx', 'utf8');

// Update handleCommitImport to set loading
const oldHandler = `  const handleCommitImport = async () => {
    if (!previewResult) return;
    try {
        const { importedCount } = await commitImportCSV(previewResult.rows, target);`;

const newHandler = `  const handleCommitImport = async () => {
    if (!previewResult || loading) return;
    setLoading(true);
    try {
        const { importedCount } = await commitImportCSV(previewResult.rows, target);`;

if (code.includes(oldHandler)) {
    code = code.replace(oldHandler, newHandler);
}

const oldCatch = `        setTimeout(() => {
          handleClose();
          onImportComplete();
        }, 1500);
    } catch (err: any) {
        setStatusMsg({ type: 'error', text: err.message || 'Gagal menyimpan data import.' });
    }`;

const newCatch = `        setTimeout(() => {
          handleClose();
          onImportComplete();
        }, 1500);
    } catch (err: any) {
        setStatusMsg({ type: 'error', text: err.message || 'Gagal menyimpan data import.' });
    } finally {
        setLoading(false);
    }`;

if (code.includes(oldCatch)) {
    code = code.replace(oldCatch, newCatch);
}

const oldBtn = `                      <button
                        onClick={handleCommitImport}
                        disabled={previewResult.valid === 0 || !!statusMsg}
                        className="flex-1 bg-teal-600 text-white font-semibold py-3 rounded-xl hover:bg-teal-700 transition-all text-sm cursor-pointer disabled:opacity-50"
                      >
                        Simpan {previewResult.valid} Data Valid
                      </button>`;

const newBtn = `                      <button
                        onClick={handleCommitImport}
                        disabled={previewResult.valid === 0 || !!statusMsg || loading}
                        className="flex-1 bg-teal-600 text-white font-semibold py-3 rounded-xl hover:bg-teal-700 transition-all text-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Menyimpan...
                          </>
                        ) : (
                          \`Simpan \${previewResult.valid} Data Valid\`
                        )}
                      </button>`;

if (code.includes(oldBtn)) {
    code = code.replace(oldBtn, newBtn);
}

fs.writeFileSync('src/components/ImportModal.tsx', code);
