import { useEffect, useState } from 'react'
import Tesseract from "tesseract.js";

function App() {
  const [file, setFile] = useState("");
  const [dataFromDatabase, setDataFromDatabase] = useState([]);
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState("eng");
  const [result, setResult] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetch('userData.json')
      .then(res => res.json())
      .then(data => setDataFromDatabase(data))
  }, [])

  const handleIDExistCheck = result => {
    const idMatch = result.match(/IDNO: \d{10}/);
    if (!idMatch) {
      alert("Could not find ID number in scanned text. Please try again with a clearer image.");
      return;
    }
    const Nid = idMatch[0].split(' ')[1];
    if (dataFromDatabase && dataFromDatabase.length > 0 && Nid === dataFromDatabase[0].idno) {
      alert('✅ ID verification successful!');
    } else {
      alert('❌ ID verification failed!');
    }
  }

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult("");
    setProgress(0);
  };

  const processImage = () => {
    if (!file) {
      alert("Please select an image first!");
      return;
    }
    setResult("");
    setProgress(0);
    setIsProcessing(true);

    Tesseract.recognize(file, language, {
      logger: (m) => {
        if (m.status === "recognizing text") {
          setProgress(m.progress);
        }
      }
    }).then(({ data: { text } }) => {
      setResult(text);
      setIsProcessing(false);
    }).catch(err => {
      console.error(err);
      setIsProcessing(false);
      alert("Error processing image.");
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 animate-slide-up">
      <div className="text-center mb-10">
        <h1 className="section-title">ID Verification</h1>
        <p className="text-base-content/50 text-lg">Upload your NID or Driver's License for instant verification</p>
      </div>

      <div className="glass-panel w-full max-w-2xl rounded-3xl p-8 md:p-12">
        <div className="flex flex-col gap-6">
          {/* Language Select */}
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-bold text-base-content/70">🌐 Select Language</span></label>
            <select className="select select-bordered input-glass w-full" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="eng">English</option>
              <option value="tel">Telugu</option>
              <option value="hin">Hindi</option>
              <option value="kan">Kannada</option>
            </select>
          </div>

          {/* File Upload */}
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-bold text-base-content/70">📄 Upload Document</span></label>
            <input type="file" className="file-input file-input-bordered file-input-primary w-full bg-transparent" onChange={onFileChange} accept="image/*" />
          </div>

          {/* Scan Button */}
          <div className="flex justify-center mt-4">
            <button
              className={`btn btn-gradient btn-glow btn-wide text-lg shadow-lg ${isProcessing ? 'loading' : ''}`}
              onClick={processImage}
              disabled={isProcessing || !file}
            >
              {isProcessing ? 'Scanning...' : '🔍 Start Scanning'}
            </button>
          </div>

          {/* Progress Bar */}
          {(isProcessing || progress > 0) && (
            <div className="w-full mt-4">
              <div className="flex justify-between text-xs mb-2 text-base-content/50">
                <span>Scanning document...</span>
                <span className="font-bold text-primary">{Math.round(progress * 100)}%</span>
              </div>
              <progress className="progress progress-primary w-full h-3" value={progress * 100} max="100"></progress>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="mt-6 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] animate-scale-in">
              <h3 className="font-bold text-lg mb-3 gradient-text flex items-center gap-2">
                📋 Scanned Result
              </h3>
              <div className="bg-base-100/50 p-4 rounded-xl border border-white/[0.06] text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto mb-4 text-base-content/70">
                {result}
              </div>
              <div className="flex justify-end">
                <button className="btn btn-secondary btn-sm gap-2 btn-glow" onClick={() => handleIDExistCheck(result)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verify with Database
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App
