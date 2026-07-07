import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../components/Modal';

interface ConfigProps {
  columns: string[];
  file: File | null;
  setAnalysisResult: (result: any) => void;
  regressionType: string;
}

const Config: React.FC<ConfigProps> = ({ columns, file, setAnalysisResult, regressionType }) => {
  const navigate = useNavigate();
  const [yCol, setYCol] = useState<string>('');
  const [xCols, setXCols] = useState<string[]>([]);
  const [entityCol, setEntityCol] = useState<string>('');
  const [timeCol, setTimeCol] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleXChange = (col: string) => {
    if (xCols.includes(col)) {
      setXCols(xCols.filter(c => c !== col));
    } else {
      setXCols([...xCols, col]);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !yCol || xCols.length === 0) {
      setError("Silakan pilih file, variabel Y, dan minimal satu variabel X.");
      return;
    }

    if (regressionType === 'linear_simple' && xCols.length !== 1) {
        setModalMessage("Regresi linear sederhana hanya membutuhkan tepat 1 variabel X.");
        setModalOpen(true);
        return;
    }

    if (regressionType === 'linear_multiple' && xCols.length < 2) {
        setModalMessage("Regresi linear berganda membutuhkan setidaknya 2 variabel X.");
        setModalOpen(true);
        return;
    }

    if (regressionType === 'panel' && (!entityCol || !timeCol)) {
        setModalMessage("Regresi data panel memerlukan kolom entitas dan kolom waktu.");
        setModalOpen(true);
        return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    const configData = {
      y_col: yCol,
      x_cols: xCols,
      regression_type: regressionType,
      entity_col: regressionType === 'panel' ? entityCol : null,
      time_col: regressionType === 'panel' ? timeCol : null
    };

    formData.append('config', JSON.stringify(configData));

    try {
      // Assuming backend is on port 8000
      const response = await axios.post('/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setAnalysisResult(response.data);
      navigate('/result');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Terjadi kesalahan saat memproses data.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!file || columns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-6 rounded-xl shadow w-full max-w-md text-center">
            <p className="text-red-500 mb-4">File atau data kolom tidak ditemukan.</p>
            <button onClick={() => navigate('/')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Kembali</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 pb-20">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Konfigurasi Variabel</h2>

        {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm font-medium">
          Jenis Regresi Terpilih: {
            regressionType === 'linear_simple' ? 'Linear Sederhana' :
            regressionType === 'linear_multiple' ? 'Linear Berganda' :
            regressionType === 'logistic' ? 'Logistik' :
            regressionType === 'nonlinear_quadratic' ? 'Non-Linear (Kuadratik)' :
            regressionType === 'nonlinear_exponential' ? 'Non-Linear (Eksponensial)' :
            regressionType === 'panel' ? 'Data Panel' : regressionType
          }
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Variabel Terikat (Y)</label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={yCol}
            onChange={(e) => setYCol(e.target.value)}
          >
            <option value="">-- Pilih Variabel Y --</option>
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Variabel Bebas (X)</label>
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-2">
            {columns.map(col => (
              col !== yCol && (
                <label key={col} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer touch-manipulation">
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-blue-600 rounded"
                    checked={xCols.includes(col)}
                    onChange={() => handleXChange(col)}
                  />
                  <span className="text-gray-700">{col}</span>
                </label>
              )
            ))}
          </div>
        </div>

        {regressionType === 'panel' && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kolom Entitas</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={entityCol}
                onChange={(e) => setEntityCol(e.target.value)}
              >
                <option value="">-- Pilih Kolom Entitas --</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kolom Waktu</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={timeCol}
                onChange={(e) => setTimeCol(e.target.value)}
              >
                <option value="">-- Pilih Kolom Waktu --</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <button
          className={`w-full py-4 rounded-xl text-white font-semibold text-lg transition-colors ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? 'Memproses...' : 'Mulai Analisis'}
        </button>
      </div>
      <Modal
        isOpen={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default Config;
