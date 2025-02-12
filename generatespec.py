import numpy as np
import matplotlib.pyplot as plt

def load_iq_file(file_path):
    """Loads IQ data from a binary file assuming float32 format."""
    try:
        iq_data = np.fromfile(file_path, dtype=np.complex64)
        return iq_data
    except Exception as e:
        print(f"Error loading file: {e}")
        return None

def plot_spectrogram(iq_data, fs=1e6, nfft=1024, noverlap=512):
    """Plots a spectrogram of the given IQ data using matplotlib.pyplot.specgram with switched axes."""
    plt.figure(figsize=(10, 6))
    spec, freqs, t, im = plt.specgram(iq_data, NFFT=nfft, Fs=fs, noverlap=noverlap, cmap='viridis', scale='dB')
    plt.gca().invert_yaxis()
    plt.colorbar(label='Power/Frequency (dB/Hz)')
    plt.ylabel('Time (s)')
    plt.xlabel('Frequency (Hz)')
    plt.title('IQ Data Spectrogram')
    plt.show()

def main():
    """Main function to load and process IQ file."""
    file_path = "USRP_1000000.0_K1_06_27_2022_09_37_06_F1024.csv.crdownload"
    print(f"Loading file: {file_path}")
    iq_data = load_iq_file(file_path)
    if iq_data is not None:
        print(f"Loaded {len(iq_data)} samples.")
        plot_spectrogram(iq_data)
    else:
        print("Failed to load IQ data.")

if __name__ == "__main__":
    main()