"use client";
import React, { useRef, useState } from "react";
import axios from "axios";

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY!;
const PINATA_API_SECRET = process.env.NEXT_PUBLIC_PINATA_API_SECRET!;

interface PinataUploadProps {
  onUploadSuccess: (ipfsHash: string) => void;
}

const PinataUpload: React.FC<PinataUploadProps> = ({ onUploadSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!PINATA_API_KEY || !PINATA_API_SECRET) {
      setStatus("Missing Pinata API credentials. Please set up your .env.local file.");
      return;
    }
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setLoading(true);
      setStatus("Uploading file to Pinata...");
      try {
        const data = new FormData();
        data.append("file", file);
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
          maxBodyLength: Infinity,
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_API_SECRET,
          },
        });
        const ipfsHash = res.data.IpfsHash;
        setStatus("Upload successful! IPFS Hash: " + ipfsHash);
        onUploadSuccess(ipfsHash);
      } catch (err: any) {
        setStatus("Error uploading to Pinata: " + (err.message || err.toString()));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        disabled={loading}
      />
      <button
        onClick={handleButtonClick}
        style={{ padding: "0.5rem 1.5rem", fontSize: "1rem", cursor: "pointer", borderRadius: "5px", border: "1px solid #ccc", background: "#f5f5f5" }}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Choose File & Upload to Pinata"}
      </button>
      {status && <p style={{ marginTop: "0.5rem", maxWidth: 400, textAlign: "center" }}>{status}</p>}
    </div>
  );
};

export default PinataUpload; 