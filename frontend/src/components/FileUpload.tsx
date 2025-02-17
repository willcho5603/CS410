import { useState, ChangeEvent } from 'react';


function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [spectrogram, setSpectrogram] = useState<string | null>(null);

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

  return (
    <>
      {/* File Upload Section */}
      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
      </div>

      {selectedFile && <p>Selected file: {selectedFile.name}</p>}
      {spectrogram && <img src={`data:image/png;base64,${spectrogram}`} alt="Spectrogram" />}
    </>
  );
}

export default FileUpload;