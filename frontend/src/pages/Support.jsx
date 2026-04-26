import { useState } from "react";
import toast from "react-hot-toast";

export default function Support() {
  const [form, setForm] = useState({
    course: "",
    topic: "",
    description: "",
  });

  const submit = () => {
    toast.success("Doubt Submitted 🎉");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 dark:text-white">
        Support
      </h2>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow space-y-4">
        
        <input
          placeholder="Course"
          className="w-full border p-2 rounded"
          onChange={(e) => setForm({ ...form, course: e.target.value })}
        />

        <input
          placeholder="Topic"
          className="w-full border p-2 rounded"
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
        />

        <textarea
          placeholder="Describe your doubt"
          className="w-full border p-2 rounded"
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <button
          onClick={submit}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>

      </div>
    </div>
  );
}