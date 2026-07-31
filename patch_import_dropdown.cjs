const fs = require('fs');
let code = fs.readFileSync('src/components/ImportModal.tsx', 'utf8');

const oldSelect = `<option value="angkut">Data Angkut Harian Kayu</option>
                      <option value="dkp">Dokumen Kayu Produksi (DKP)</option>
                      <option value="ketiga">Sisa Pihak Ketiga</option>
                      <option value="perhutani">Sisa Perhutani</option>
                      <option value="invoice">Pendapatan Invoice (Rahasia)</option>`;

const newSelect = `<option value="angkut">Data Angkut Harian Kayu</option>
                      <option value="dkp">Dokumen Kayu Produksi (DKP)</option>
                      <option value="ketiga">Sisa Pihak Ketiga</option>
                      <option value="perhutani">Sisa Perhutani</option>
                      <option value="invoice">Pendapatan Invoice (Rahasia)</option>
                      <option value="mutasi">Rekap Mutasi Kapling</option>`;

if (code.includes(oldSelect)) {
  code = code.replace(oldSelect, newSelect);
  fs.writeFileSync('src/components/ImportModal.tsx', code);
}
