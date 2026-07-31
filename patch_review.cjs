const fs = require('fs');
let code = fs.readFileSync('src/components/ImportModal.tsx', 'utf8');

const oldReview = `      const result = previewImportCSV(csvContent, target);
      setPreviewResult(result);
      
    } catch (err: any) {
      console.error(err);
      setStatusMsg({
        type: 'error',
        text: err.message || 'Gagal memproses import data. Pastikan format CSV sesuai.'
      });
    } finally {
      setLoading(false);
    }
  };`;

const newReview = `      // Run synchronously, but wrap in a small timeout to allow UI spinner to paint
      setTimeout(() => {
        try {
          const result = previewImportCSV(csvContent, target);
          setPreviewResult(result);
        } catch (err: any) {
          console.error(err);
          setStatusMsg({
            type: 'error',
            text: err.message || 'Gagal memproses import data. Pastikan format CSV sesuai.'
          });
        } finally {
          setLoading(false);
        }
      }, 50);
      
    } catch (err: any) {
      console.error(err);
      setStatusMsg({
        type: 'error',
        text: err.message || 'Gagal memproses import data. Pastikan format CSV sesuai.'
      });
      setLoading(false);
    }
  };`;

if (code.includes(oldReview)) {
  code = code.replace(oldReview, newReview);
  fs.writeFileSync('src/components/ImportModal.tsx', code);
} else {
  console.log("Could not find oldReview block");
}
