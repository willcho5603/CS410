import { useState, useEffect, ChangeEvent } from 'react';
import './App.css';

interface SavedFile {
  _id: string;
  filename: string;
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [spectrogram, setSpectrogram] = useState<string | null>(null);
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log("Uploading file:", selectedFile.name);

      try {
        const response = await fetch('http://127.0.0.1:5000/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        console.log("Response received:", result);

        if (result.error) {
          console.error(result.error);
        } else {
          setSpectrogram(result.spectrogram);
          console.log("Spectrogram set:", result.spectrogram);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    } else {
      console.log('No file selected');
    }
  };

  const handleSave = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log("Saving file to database:", selectedFile.name);

      try {
        const response = await fetch('http://127.0.0.1:5000/save', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        console.log("Save response received:", result);
        // Refresh the saved files list after saving
        fetchSavedFiles();
      } catch (error) {
        console.error("Error saving file:", error);
      }
    } else {
      console.log('No file selected');
    }
  };

  const fetchSavedFiles = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/files');
      const result = await response.json();
      console.log("Fetched saved files:", result);
      setSavedFiles(result.files);
    } catch (error) {
      console.error("Error fetching saved files:", error);
    }
  };

  const handleLoadFile = async (fileId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/file/${fileId}/spectrogram`);
      const result = await response.json();
      if (result.error) {
        console.error(result.error);
      } else {
        setSpectrogram(result.spectrogram);
      }
    } catch (error) {
      console.error("Error loading file:", error);
    }
  };

  // Fetch saved files on component mount
  useEffect(() => {
    fetchSavedFiles();
  }, []);

  return (
    <>
      <h1>GC<sup>3</sup></h1>
      
      {/* File Upload Section */}
      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
        <button onClick={handleSave}>Save to Database</button>
      </div>

      {selectedFile && <p>Selected file: {selectedFile.name}</p>}
      {spectrogram && <img src={`data:image/png;base64,${spectrogram}`} alt="Spectrogram" />}

      {/* Saved Files Section */}
      <div>
        <h2>Saved Files</h2>
        <button onClick={fetchSavedFiles}>Refresh Files</button>
        {savedFiles.length > 0 ? (
          <ul>
            {savedFiles.map(file => (
              <li key={file._id}>
                {file.filename} 
                <button onClick={() => handleLoadFile(file._id)}>Load</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No saved files available.</p>
        )}
      </div>
    </>
  );
}

export default App;
