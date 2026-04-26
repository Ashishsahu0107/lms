import { useState } from "react";

export default function Assignments() {
  const [assignments] = useState([
    { id: 1, title: "React Project", status: "Pending" },
    { id: 2, title: "Node API", status: "Submitted" },
  ]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 dark:text-white">
        Assignments
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {assignments.map((a) => (
          <div
            key={a.id}
            className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow"
          >
            <h3 className="font-bold text-lg dark:text-white">
              {a.title}
            </h3>

            <p className="text-sm mt-2 text-gray-500">
              Status: {a.status}
            </p>

            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
              Submit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}