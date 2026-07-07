import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
// import { Scatter } from 'react-chartjs-2'; // Could be used if scatter plot data is provided by backend

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ResultProps {
  result: any;
}

const Result: React.FC<ResultProps> = ({ result }) => {
  const navigate = useNavigate();

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="mb-4">Tidak ada hasil untuk ditampilkan.</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-blue-600 text-white rounded">Ke Beranda</button>
      </div>
    );
  }

  const handleDownload = async () => {
    try {
      const response = await axios.post('/api/export', result, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Laporan_Regresi_ohmystats.docx');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      alert("Gagal mengunduh laporan");
    }
  };

  const { metrics, coefficients, diagnostic_tests, insights, recommended_model } = result;

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-24">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Hasil Analisis</h1>
            <button onClick={() => navigate('/')} className="text-sm text-blue-600 font-semibold">Mulai Baru</button>
        </div>

        {/* Ringkasan Card */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 border-b pb-2 mb-3">Ringkasan Model</h3>
          <div className="grid grid-cols-2 gap-4">
            {metrics?.r_squared !== undefined && (
                <div>
                    <p className="text-xs text-gray-500 uppercase">R-Squared</p>
                    <p className="text-lg font-bold text-blue-600">{metrics.r_squared.toFixed(4)}</p>
                </div>
            )}
            {metrics?.adj_r_squared !== undefined && (
                <div>
                    <p className="text-xs text-gray-500 uppercase">Adj. R-Squared</p>
                    <p className="text-lg font-bold text-blue-600">{metrics.adj_r_squared.toFixed(4)}</p>
                </div>
            )}
            {metrics?.f_statistic !== undefined && metrics.f_statistic !== null && (
                <div>
                    <p className="text-xs text-gray-500 uppercase">F-Statistic</p>
                    <p className="text-lg font-bold text-blue-600">{metrics.f_statistic.toFixed(4)}</p>
                </div>
            )}
            {metrics?.p_value_f !== undefined && metrics.p_value_f !== null && (
                <div>
                    <p className="text-xs text-gray-500 uppercase">Prob (F-stat)</p>
                    <p className="text-lg font-bold text-blue-600">{metrics.p_value_f.toFixed(4)}</p>
                </div>
            )}
             {metrics?.pseudo_r_squared !== undefined && (
                <div>
                    <p className="text-xs text-gray-500 uppercase">Pseudo R-Squared</p>
                    <p className="text-lg font-bold text-blue-600">{metrics.pseudo_r_squared.toFixed(4)}</p>
                </div>
            )}
            {recommended_model && (
                <div className="col-span-2 mt-2">
                     <p className="text-xs text-gray-500 uppercase">Rekomendasi Model Panel</p>
                     <p className="text-md font-bold text-green-600">{recommended_model}</p>
                </div>
            )}
          </div>
        </div>

        {/* Tabel Koefisien (Mobile friendly overflow) */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 border-b pb-2 mb-3">Koefisien</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Variabel</th>
                  <th className="px-4 py-3">Koef (B)</th>
                  {coefficients[0]?.t_stat !== undefined && <th className="px-4 py-3">t-Stat</th>}
                  {coefficients[0]?.z_stat !== undefined && <th className="px-4 py-3">z-Stat</th>}
                  {coefficients[0]?.p_value !== undefined && <th className="px-4 py-3">P-Value</th>}
                  {coefficients[0]?.odds_ratio !== undefined && <th className="px-4 py-3">Odds Ratio</th>}
                </tr>
              </thead>
              <tbody>
                {coefficients.map((coef: any, idx: number) => (
                  <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{coef.variable}</td>
                    <td className="px-4 py-3">{coef.coefficient?.toFixed(4)}</td>
                    {coef.t_stat !== undefined && <td className="px-4 py-3">{coef.t_stat?.toFixed(4)}</td>}
                    {coef.z_stat !== undefined && <td className="px-4 py-3">{coef.z_stat?.toFixed(4)}</td>}
                    {coef.p_value !== undefined && <td className="px-4 py-3 font-semibold text-blue-600">{coef.p_value?.toFixed(4)}</td>}
                    {coef.odds_ratio !== undefined && <td className="px-4 py-3">{coef.odds_ratio?.toFixed(4)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Diagnostik Asumsi */}
        {diagnostic_tests && (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 border-b pb-2 mb-3">Uji Asumsi</h3>
            <div className="space-y-3">
                {diagnostic_tests.normality && (
                    <div className="flex justify-between items-center text-sm">
                        <span>Normalitas (Jarque-Bera)</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${diagnostic_tests.normality.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {diagnostic_tests.normality.passed ? 'LULUS' : 'GAGAL'} (p: {diagnostic_tests.normality.p_value.toFixed(3)})
                        </span>
                    </div>
                )}
                {diagnostic_tests.heteroskedasticity && (
                    <div className="flex justify-between items-center text-sm">
                        <span>Heteroskedastisitas (Breusch-Pagan)</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${diagnostic_tests.heteroskedasticity.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {diagnostic_tests.heteroskedasticity.passed ? 'LULUS' : 'GAGAL'} (p: {diagnostic_tests.heteroskedasticity.p_value.toFixed(3)})
                        </span>
                    </div>
                )}
                 {diagnostic_tests.multicollinearity && (
                    <div className="text-sm">
                        <div className="flex justify-between items-center mb-1">
                            <span>Multikolinieritas (VIF)</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${diagnostic_tests.multicollinearity.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {diagnostic_tests.multicollinearity.passed ? 'LULUS (< 10)' : 'GAGAL'}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 pl-2">
                             {Object.entries(diagnostic_tests.multicollinearity.vif_values).map(([k, v]: any) => (
                                 <div key={k}>{k}: {v.toFixed(2)}</div>
                             ))}
                        </div>
                    </div>
                )}
            </div>
            </div>
        )}

        {/* Kesimpulan */}
        {insights && (
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">Kesimpulan</h3>
                <p className="text-sm text-blue-900 leading-relaxed">{insights}</p>
            </div>
        )}
      </div>

      {/* Floating Action Button for Download */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t shadow-lg flex justify-center">
        <button
            onClick={handleDownload}
            className="w-full max-w-md bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center justify-center space-x-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Unduh Laporan (.docx)</span>
        </button>
      </div>
    </div>
  );
};

export default Result;
