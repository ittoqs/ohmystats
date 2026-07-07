import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadBox from '../components/UploadBox';
import Modal from '../components/Modal';
import * as XLSX from 'xlsx';

interface UploadProps {
  setFile: (file: File) => void;
  setColumns: (cols: string[]) => void;
  regressionType: string;
  setRegressionType: (type: string) => void;
}

const Upload: React.FC<UploadProps> = ({ setFile, setColumns, regressionType, setRegressionType }) => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const downloadTemplate = () => {
    let ws_data: string[][] = [];
    if (regressionType === 'linear_simple' || regressionType === 'logistic' || regressionType === 'nonlinear_quadratic' || regressionType === 'nonlinear_exponential') {
        ws_data = [['Y', 'X']];
    } else if (regressionType === 'linear_multiple') {
        ws_data = [['Y', 'X1', 'X2']];
    } else if (regressionType === 'panel') {
        ws_data = [['Entitas', 'Waktu', 'Y', 'X1']];
    }

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `Template_${regressionType}.xlsx`);
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);

    // Read headers
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (data) {
        if (selectedFile.name.endsWith('.xlsx')) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (json.length > 0) {
            setColumns(json[0] as string[]);
          }
        } else if (selectedFile.name.endsWith('.csv')) {
            const text = data as string;
            const lines = text.split('\n');
            if (lines.length > 0) {
                const headers = lines[0].split(',').map(h => h.trim());
                setColumns(headers);
            }
        }
        navigate('/config');
      }
    };

    if (selectedFile.name.endsWith('.xlsx')) {
        reader.readAsBinaryString(selectedFile);
    } else {
        reader.readAsText(selectedFile);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">ohmystats</h1>
        <p className="text-gray-600 text-center mb-8 text-sm">Pilih jenis regresi dan unggah dataset Anda untuk memulai analisis.</p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Regresi</label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={regressionType}
            onChange={(e) => setRegressionType(e.target.value)}
          >
            <option value="linear_simple">Linear Sederhana</option>
            <option value="linear_multiple">Linear Berganda</option>
            <option value="logistic">Logistik</option>
            <option value="nonlinear_quadratic">Non-Linear (Kuadratik)</option>
            <option value="nonlinear_exponential">Non-Linear (Eksponensial)</option>
            <option value="panel">Data Panel</option>
          </select>
          <div className="mt-2 flex justify-end">
            <button
                onClick={downloadTemplate}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Unduh Template</span>
            </button>
          </div>
        </div>

        <UploadBox
          onFileSelect={handleFileSelect}
          onError={(msg) => { setModalMessage(msg); setModalOpen(true); }}
        />
      </div>
      <Modal
        isOpen={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default Upload;
