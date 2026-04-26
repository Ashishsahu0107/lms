import { useEffect, useState } from "react";
import api from "../utils/api";

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/analytics/admin").then((res) => {
      setData(res.data);
    });
  }, []);

  if (!data) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 space-y-6">

      <h2 className="text-2xl font-bold">
        👑 Admin Analytics
      </h2>

      <div className="grid md:grid-cols-4 gap-6">

        <Card title="Users" value={data.users} />
        <Card title="Courses" value={data.courses} />
        <Card title="Attempts" value={data.attempts} />
        <Card title="Avg Score" value={`${data.avgScore}%`} />

      </div>

    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <p className="text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  );
}