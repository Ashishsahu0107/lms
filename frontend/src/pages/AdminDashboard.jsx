import { useEffect, useState } from "react";
import api from "../utils/api";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/analytics/admin");

        console.log("ADMIN DATA:", res.data); // 🔥 debug

        setData(res.data);
      } catch (err) {
        console.error("ADMIN ERROR:", err);
        setError("Failed to load admin analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  if (error)
    return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">
        👑 Admin Analytics
      </h2>

      <div className="grid md:grid-cols-4 gap-6">

        <Card title="Users" value={data?.users || 0} />
        <Card title="Courses" value={data?.courses || 0} />
        <Card title="Attempts" value={data?.attempts || 0} />
        <Card title="Avg Score" value={`${data?.avgScore || 0}%`} />

        <Card title="Assignments" value={data?.assignments || 0} />
        <Card title="Submissions" value={data?.submissions || 0} />
        <Card title="Pending Review" value={data?.pendingSubmissions || 0} />

      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
      <p className="text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold dark:text-white">
        {value}
      </h3>
    </div>
  );
}