import { useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function UploadQuiz() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return toast.error("Select a file first");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      await api.post("/quiz/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Quiz Uploaded 🎉");
      setFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-2xl font-bold mb-4">
        Upload Quiz (JSON)
      </h2>

      <input
        type="file"
        accept=".json"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}