import { useEffect, useState } from 'react'
import Tesseract from "tesseract.js";
//import './App.css'

function App() {
  const [file, setFile] = useState("");
  const [dataFromDatabase, setDataFromDatabase] = useState([]);
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState("eng");
  const [result, setResult] = useState("");
  //  manually added ------>
  useEffect(() => {
    fetch('userData.json')
        .then(res => res.json())
        .then(data => setDataFromDatabase(data))
  }, [])
  
  const handleIDExistCheck = result => {
    const idMatch = result.match(/IDNO: \d{10}/);
    const Nid = idMatch[0].split(' ')[1];
    console.log('NIDNO:', Nid)
    if (Nid === dataFromDatabase[0].idno) {
      alert('ID already exists');
    } else {
      alert('ID does not exist');
    } 
  }

  // ------------------------->
  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const processImage = () => {
    setResult("");
    setProgress(0);
    Tesseract.recognize(file, language, {
      logger: (m) => {
        if (m.status === "recognizing text") {
          setProgress(m.progress);
        }
      }
    }).then(({ data: { text } }) => {
      setResult(text);
      console.log("Result status: ", text);
    });
  };
  return (
    <div className="App">
      <input type="file" onChange={onFileChange} />
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="eng">English</option>
        <option value="tel">Telugu</option>
        <option value="hin">Hindi</option>
        <option value="kan">Kannada</option>
      </select>
      <div style={{ marginTop: 25 }}>
        <input type="button" value="Submit" onClick={processImage} />
      </div>
      <div>
        <progress value={progress} max={1} />
      </div>
      {result && 
        <div style={{ marginTop: 20, fontSize: 24, color: "teal" }}>
          Result: {result}
        </div>
      }
      {
        result && <div>
          <button onClick={()=>handleIDExistCheck(result)}>Check exist</button>
        </div>
      }
    </div>
  );
}

export default App
