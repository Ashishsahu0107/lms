import { useEffect, useState } from "react";
import api from "../utils/api";

export default function Leaderboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/analytics/leaderboard").then((res) => {
      setData(res.data);
    });
  }, []);

  return (
    <div className="p-6">

      <h2 className="text-2xl font-bold mb-4">
        🏆 Leaderboard
      </h2>

      <div className="bg-white rounded-xl shadow p-4">

        {data.length === 0 && <p>No data</p>}

        {data.map((u, i) => (
          <div
            key={i}
            className="flex justify-between border-b py-2"
          >
            <span>#{i + 1} {u.name}</span>
            <span>{u.avgScore}%</span>
            <span>{u.attempts} attempts</span>
          </div>
        ))}

      </div>

    </div>
  );
}