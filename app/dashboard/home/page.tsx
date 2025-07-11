"use client";
import React, { useState } from "react";
import { apiClient } from "@/lib/axios-client";
import Image from "next/image";

const page = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("File to upload:", file);
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiClient.public.uploadImageToGoogleApi(file);
      console.log("Upload response:", res);
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1>Home</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit" disabled={uploading || !file}>
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
      </form>
      {result && (
        <div style={{ color: "green" }}>
          Upload successful: {JSON.stringify(result)}
        </div>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}

      <Image
        src={result?.publicUrl || "/placeholder.png"}
        alt="Placeholder"
        width={150}
        height={150}
        style={{ marginTop: "20px" }}
      />
    </div>
  );
};

export default page;
