import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Upload from './pages/Upload';
import Config from './pages/Config';
import Result from './pages/Result';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [regressionType, setRegressionType] = useState<string>('linear_simple');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Upload setFile={setFile} setColumns={setColumns} regressionType={regressionType} setRegressionType={setRegressionType} />} />
        <Route path="/config" element={<Config columns={columns} file={file} setAnalysisResult={setAnalysisResult} regressionType={regressionType} />} />
        <Route path="/result" element={<Result result={analysisResult} />} />
      </Routes>
    </Router>
  );
};

export default App;
