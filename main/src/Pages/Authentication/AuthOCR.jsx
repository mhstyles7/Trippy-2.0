import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Tesseract from "tesseract.js";
import axios from "axios";

function AuthOCR() {
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [docType, setDocType] = useState("nid"); // nid or driving
  const [language, setLanguage] = useState("eng");
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(1); // 1=upload, 2=scanning, 3=result
  const [extractedData, setExtractedData] = useState({ front: '', back: '' });
  const [idNumber, setIdNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isLoggedIn = user && user._id;
  const isVerified = user?.verifyOCR === true;

  const onFrontChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFrontFile(f); setFrontPreview(URL.createObjectURL(f)); }
  };
  const onBackChange = (e) => {
    const f = e.target.files[0];
    if (f) { setBackFile(f); setBackPreview(URL.createObjectURL(f)); }
  };

  const scanBothSides = async () => {
    if (!frontFile || !backFile) return alert("Please upload both front and back images.");
    setIsProcessing(true);
    setStep(2);
    setProgress(0);

    try {
      // Scan FRONT
      const frontResult = await Tesseract.recognize(frontFile, language, {
        logger: (m) => { if (m.status === "recognizing text") setProgress(m.progress * 0.5); }
      });
      const frontText = frontResult.data.text;

      // Scan BACK
      const backResult = await Tesseract.recognize(backFile, language, {
        logger: (m) => { if (m.status === "recognizing text") setProgress(0.5 + m.progress * 0.5); }
      });
      const backText = backResult.data.text;

      setExtractedData({ front: frontText, back: backText });

      // Try to auto-extract ID number
      const combined = frontText + "\n" + backText;

      // NID patterns (Bangladesh): 10 or 17 digit number
      const nidPatterns = [
        /(?:NID|ID\s*NO|National\s*ID)[:\s]*(\d{10,17})/i,
        /(?:IDNO)[:\s]*(\d{10,17})/i,
        /\b(\d{10})\b/,      // 10-digit standalone number
        /\b(\d{13})\b/,      // 13-digit
        /\b(\d{17})\b/,      // 17-digit
      ];

      // Driving License patterns
      const dlPatterns = [
        /(?:License|Licence|DL)\s*(?:No|Number)?[:\s]*([A-Z0-9-]{5,20})/i,
        /(?:DL|D\.L\.)\s*[:.]?\s*([A-Z0-9-]+)/i,
      ];

      const patterns = docType === 'nid' ? nidPatterns : dlPatterns;
      let foundId = '';
      for (const pattern of patterns) {
        const match = combined.match(pattern);
        if (match) { foundId = match[1]; break; }
      }
      setIdNumber(foundId);

      // Try to extract name
      const namePatterns = [
        /(?:Name|নাম)[:\s]*([A-Za-z\s.]+)/i,
        /(?:Name)[:\s]*(.+)/i,
      ];
      for (const pattern of namePatterns) {
        const match = combined.match(pattern);
        if (match) { setHolderName(match[1].trim()); break; }
      }

      setStep(3);
    } catch (err) {
      console.error("OCR Error:", err);
      alert("Error scanning document. Please try again.");
      setStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerify = async () => {
    if (!idNumber.trim()) {
      return alert("Please enter or confirm the ID number.");
    }

    try {
      // Convert front image to base64 for storage
      const frontBase64 = await fileToBase64(frontFile);
      const backBase64 = await fileToBase64(backFile);

      const res = await axios.post("http://localhost:3000/verify-ocr", {
        userId: user._id,
        documentType: docType,
        idNumber: idNumber.trim(),
        holderName: holderName.trim(),
        frontImage: frontBase64,
        backImage: backBase64,
        extractedText: { front: extractedData.front, back: extractedData.back }
      });

      if (res.status === 200) {
        setVerificationStatus('success');
        const updatedUser = { ...user, verifyOCR: true, verifiedDocType: docType, verifiedIdNumber: idNumber };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Verification error:", err);
      if (err.response?.status === 409) {
        setVerificationStatus('duplicate');
      } else {
        setVerificationStatus('failed');
      }
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => resolve(reader.result);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 animate-slide-up">
      <div className="text-center mb-10">
        <h1 className="section-title">🪪 Identity Verification</h1>
        <p className="text-base-content/50 text-lg max-w-lg mx-auto">
          Upload both sides of your NID or Driver's License to verify your identity and unlock all platform features.
        </p>
      </div>

      {/* Already verified */}
      {isVerified && (
        <div className="glass-panel p-8 rounded-3xl max-w-lg w-full text-center mb-8 border border-success/20">
          <span className="text-6xl block mb-4">✅</span>
          <h2 className="text-2xl font-bold text-success mb-2">Already Verified!</h2>
          <p className="text-base-content/50 mb-4">Your identity has been successfully verified. You have full access to all features.</p>
          <button className="btn btn-primary btn-gradient" onClick={() => navigate("/profile")}>Go to Profile</button>
        </div>
      )}

      {/* Not logged in */}
      {!isLoggedIn && (
        <div className="alert alert-warning mb-8 max-w-lg glass-panel border-warning/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          <span>Please <a href="/login" className="link link-primary font-bold">log in</a> first to save your verification status.</span>
        </div>
      )}

      {!isVerified && isLoggedIn && (
        <div className="glass-panel w-full max-w-3xl rounded-3xl p-8 md:p-12">
          {/* Steps indicator */}
          <ul className="steps steps-horizontal w-full mb-10">
            <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>Upload Documents</li>
            <li className={`step ${step >= 2 ? 'step-primary' : ''}`}>OCR Scanning</li>
            <li className={`step ${step >= 3 ? 'step-primary' : ''}`}>Verify & Confirm</li>
          </ul>

          {/* STEP 1: Upload */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              {/* Why verify */}
              <div className="flex gap-6 p-5 rounded-2xl bg-primary/5 border border-primary/10">
                <span className="text-3xl">🔒</span>
                <div>
                  <h3 className="font-bold text-sm mb-1">Why verify?</h3>
                  <ul className="text-xs text-base-content/50 space-y-1">
                    <li>✓ Get a ✅ verified badge beside your name</li>
                    <li>✓ Access the Trip Marketplace (bid & rent)</li>
                    <li>✓ Build trust with other travelers</li>
                  </ul>
                </div>
              </div>

              {/* Document Type */}
              <div className="form-control w-full">
                <label className="label"><span className="label-text font-bold text-base-content/70">📋 Document Type</span></label>
                <select className="select select-bordered input-glass w-full" value={docType} onChange={(e) => setDocType(e.target.value)}>
                  <option value="nid">National ID (NID)</option>
                  <option value="driving">Driving License</option>
                </select>
              </div>

              {/* Language */}
              <div className="form-control w-full">
                <label className="label"><span className="label-text font-bold text-base-content/70">🌐 Document Language</span></label>
                <select className="select select-bordered input-glass w-full" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="eng">English</option>
                  <option value="ben">Bengali</option>
                </select>
              </div>

              {/* Front & Back Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FRONT */}
                <div className="flex flex-col gap-3">
                  <label className="label"><span className="label-text font-bold text-base-content/70">📸 FRONT Side</span></label>
                  <input type="file" className="file-input file-input-bordered file-input-primary w-full bg-transparent" onChange={onFrontChange} accept="image/*" />
                  {frontPreview && (
                    <div className="rounded-2xl overflow-hidden border border-white/[0.08] h-40">
                      <img src={frontPreview} alt="Front" className="w-full h-full object-contain bg-base-300/30" />
                    </div>
                  )}
                </div>
                {/* BACK */}
                <div className="flex flex-col gap-3">
                  <label className="label"><span className="label-text font-bold text-base-content/70">📸 BACK Side</span></label>
                  <input type="file" className="file-input file-input-bordered file-input-secondary w-full bg-transparent" onChange={onBackChange} accept="image/*" />
                  {backPreview && (
                    <div className="rounded-2xl overflow-hidden border border-white/[0.08] h-40">
                      <img src={backPreview} alt="Back" className="w-full h-full object-contain bg-base-300/30" />
                    </div>
                  )}
                </div>
              </div>

              <button
                className={`btn btn-gradient btn-glow btn-wide text-lg shadow-lg mx-auto ${(!frontFile || !backFile) ? 'btn-disabled' : ''}`}
                onClick={scanBothSides}
                disabled={!frontFile || !backFile}
              >
                🔍 Scan Both Sides
              </button>
            </div>
          )}

          {/* STEP 2: Scanning */}
          {step === 2 && (
            <div className="flex flex-col items-center gap-6 py-10">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <h3 className="text-xl font-bold gradient-text">Scanning your document...</h3>
              <p className="text-sm text-base-content/50">OCR engine is extracting text from both sides</p>
              <div className="w-full max-w-md">
                <div className="flex justify-between text-xs mb-2 text-base-content/50">
                  <span>{progress < 0.5 ? 'Scanning front...' : 'Scanning back...'}</span>
                  <span className="font-bold text-primary">{Math.round(progress * 100)}%</span>
                </div>
                <progress className="progress progress-primary w-full h-3" value={progress * 100} max="100"></progress>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Confirm */}
          {step === 3 && !verificationStatus && (
            <div className="flex flex-col gap-6">
              <div className="alert alert-info border-info/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Please review and confirm the extracted information below. You can edit the fields if the OCR made mistakes.</span>
              </div>

              {/* Extracted text preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <h4 className="text-xs font-bold opacity-50 mb-2">FRONT TEXT</h4>
                  <div className="text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto text-base-content/60">{extractedData.front || 'No text found'}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <h4 className="text-xs font-bold opacity-50 mb-2">BACK TEXT</h4>
                  <div className="text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto text-base-content/60">{extractedData.back || 'No text found'}</div>
                </div>
              </div>

              {/* Editable fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-bold">{docType === 'nid' ? 'NID Number' : 'License Number'}</span></label>
                  <input type="text" className="input input-bordered input-glass w-full" value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder="Enter or confirm the ID number" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-bold">Name on Document</span></label>
                  <input type="text" className="input input-bordered input-glass w-full" value={holderName} onChange={e => setHolderName(e.target.value)} placeholder="Full name as on document" />
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button className="btn btn-ghost" onClick={() => { setStep(1); setExtractedData({ front: '', back: '' }); }}>
                  ← Re-scan
                </button>
                <button className="btn btn-primary btn-gradient btn-glow btn-wide text-lg" onClick={handleVerify}>
                  ✅ Verify My Identity
                </button>
              </div>
            </div>
          )}

          {/* Verification Results */}
          {verificationStatus === 'success' && (
            <div className="alert alert-success border-success/20 animate-scale-in">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div>
                <h3 className="font-bold">✅ Identity Verified!</h3>
                <p className="text-sm">Your {docType === 'nid' ? 'NID' : 'Driving License'} has been verified. You now have full access!</p>
              </div>
              <button className="btn btn-sm btn-success" onClick={() => { navigate("/"); window.location.reload(); }}>Go to Home</button>
            </div>
          )}
          {verificationStatus === 'duplicate' && (
            <div className="alert alert-warning border-warning/20 animate-scale-in">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              <div>
                <h3 className="font-bold">⚠️ ID Already Used</h3>
                <p className="text-sm">This ID number is already registered to another account.</p>
              </div>
            </div>
          )}
          {verificationStatus === 'failed' && (
            <div className="alert alert-error border-error/20 animate-scale-in">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div>
                <h3 className="font-bold">❌ Verification Failed</h3>
                <p className="text-sm">Could not verify your identity. Please try again with clearer images.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AuthOCR;
