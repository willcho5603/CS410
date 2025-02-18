import { useState, useEffect, ChangeEvent } from 'react';
import './App.css';
import './index.css';

interface SavedFile {
  _id: string;
  filename: string;
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [spectrogram, setSpectrogram] = useState<string | null>(null);
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file.name.endsWith('.iq') || file.name.endsWith('.cfile')) {
        setSelectedFile(file);
        setErrorMessage(null); // Clear any previous error message
      } else {
        setErrorMessage('Please upload a file with a .iq or .cfile extension');
        setSelectedFile(null); // Clear the selected file
      }
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log("Uploading file:", selectedFile.name);
      setLoadingMessage("Uploading file...");
      setSuccessMessage(null); // Clear any previous success message

      try {
        const response = await fetch('http://127.0.0.1:5000/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        console.log("Response received:", result);

        if (result.error) {
          console.error(result.error);
          setErrorMessage(result.error);
        } else {
          setSpectrogram(result.spectrogram);
          console.log("Spectrogram set:", result.spectrogram);
          setSuccessMessage("File successfully uploaded");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        setErrorMessage("Error uploading file");
      } finally {
        setLoadingMessage(null);
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
      setLoadingMessage("Saving file to database...");
      setSuccessMessage(null); // Clear any previous success message

      try {
        const response = await fetch('http://127.0.0.1:5000/save', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        console.log("Save response received:", result);
        // Refresh the saved files list after saving
        fetchSavedFiles();
        setSuccessMessage("File successfully saved to database");
      } catch (error) {
        console.error("Error saving file:", error);
        setErrorMessage("Error saving file");
      } finally {
        setLoadingMessage(null);
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
      setErrorMessage("Error fetching saved files");
    }
  };

  const handleClearFiles = async () => {
    const confirmed = window.confirm("Are you sure you want to clear all files?");
    if (!confirmed) {
      return;
    }

    setLoadingMessage("Clearing files...");
    setSuccessMessage(null); // Clear any previous success message
    try {
      const response = await fetch('http://127.0.0.1:5000/clear_files', {
        method: 'DELETE',
      });
      const result = await response.json();
      console.log("Clear files response received:", result);
      setSavedFiles([]); // Clear the saved files list in the frontend
      setSuccessMessage("Files successfully cleared");
    } catch (error) {
      console.error("Error clearing files:", error);
      setErrorMessage("Error clearing files");
    } finally {
      setLoadingMessage(null);
    }
  };

  const handleLoadFile = async (fileId: string) => {
    setLoadingMessage("Loading file...");
    setSuccessMessage(null); // Clear any previous success message
    try {
      const response = await fetch(`http://127.0.0.1:5000/file/${fileId}/spectrogram`);
      const result = await response.json();
      if (result.error) {
        console.error(result.error);
        setErrorMessage(result.error);
      } else {
        setSpectrogram(result.spectrogram);
        setSuccessMessage("File successfully loaded");
      }
    } catch (error) {
      console.error("Error loading file:", error);
      setErrorMessage("Error loading file");
    } finally {
      setLoadingMessage(null);
    }
  };

  // Fetch saved files on component mount
  useEffect(() => {
    fetchSavedFiles();
  }, []);

  return (
    <>
      <header className="header">
        <h1>GC<sup>3</sup></h1>
        <p>Upload and visualize your IQ data files</p>
      </header>
      
      <main className="main-content">
        {/* File Upload Section */}
        <div className="container">
          <h2>Upload File</h2>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload}>Upload</button>
          <button onClick={handleSave}>Save to Database</button>
        </div>

        {loadingMessage && <p className="loading-message">{loadingMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        {selectedFile && <p>Selected file: {selectedFile.name}</p>}
        {spectrogram && <img src={`data:image/png;base64,${spectrogram}`} alt="Spectrogram" />}

        {/* Saved Files Section */}
        <div className="container">
          <h2>Saved Files</h2>
          <button onClick={handleClearFiles}>Clear Files</button>
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
      </main>
    </>
  );
}

export default App;