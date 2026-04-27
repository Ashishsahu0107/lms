import { useEffect, useState } from "react";
import api from "../utils/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    // 🔹 dashboard stats
    api.get("/dashboard/stats").then((res) =>
      setData(res.data)
    );

    // 🔹 quiz history
    api.get("/quiz/attempts").then((res) =>
      setAttempts(res.data)
    );
  }, []);

  if (!data) return <p className="p-6">Loading...</p>;

  const latestScore = attempts[0]?.score || 0;

  return (
    <div className="space-y-6">

      {/* 🔹 Header */}
      <div>
        <h2 className="text-2xl font-bold dark:text-white">
          Welcome Back 👋
        </h2>
        <p className="text-gray-500">
          Track your learning progress
        </p>
      </div>

      {/* 🔹 Cards */}
      <div className="grid md:grid-cols-5 gap-6">

        <Card title="Score" value={`${data.score}%`} color="blue" />
        <Card title="Assignments" value={data.assignments} color="green" />
        <Card title="Streak" value={data.streak} color="purple" />
        <Card title="Skills" value={data.skills} color="orange" />

        {/* 🔥 NEW CARD */}
        <Card title="Quiz Score" value={`${latestScore}%`} color="blue" />

      </div>

      {/* 🔹 Charts */}
      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow">
          <h3 className="font-semibold mb-3 dark:text-white">
            📈 Weekly Activity
          </h3>

          <LineChart width={350} height={250} data={data.activity}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} />
          </LineChart>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow">
          <h3 className="font-semibold mb-3 dark:text-white">
            📊 Performance
          </h3>

          <BarChart width={350} height={250} data={data.performance}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#22c55e" />
          </BarChart>
        </div>

      </div>

      {/* 🔹 Bottom Section */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Progress */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow">
          <h3 className="font-semibold mb-3 dark:text-white">
            🎯 Overall Progress
          </h3>

          <div className="bg-gray-200 h-3 rounded-full">
            <div
              className="bg-blue-500 h-3 rounded-full"
              style={{ width: `${data.score}%` }}
            />
          </div>

          <p className="mt-2 text-sm dark:text-white">
            {data.score}% Completed
          </p>
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow">
          <h3 className="font-semibold mb-3 dark:text-white">
            ⚡ Recent Activity
          </h3>

          <ul className="space-y-2 text-sm">
            <li className="dark:text-white">✔ Completed a course</li>
            <li className="dark:text-white">✔ Attempted quiz</li>
            <li className="dark:text-white">✔ Submitted assignment</li>
          </ul>
        </div>

      </div>

      {/* 🔥 QUIZ HISTORY SECTION */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow">
        <h3 className="text-xl font-bold mb-3 dark:text-white">
          📊 Quiz History
        </h3>

        {attempts.length === 0 && (
          <p className="text-gray-500">No attempts yet</p>
        )}

        {attempts.map((a, i) => (
          <div
            key={i}
            className="flex justify-between border-b py-2 text-sm"
          >
            <span className="dark:text-white">
              {new Date(a.createdAt).toLocaleDateString()}
            </span>

            <span className="text-blue-500">
              {a.score}%
            </span>

            <span className="text-gray-500">
              {a.correctAnswers}/{a.totalQuestions}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}

// 🔹 Card Component
function Card({ title, value, color }) {
  const colors = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow hover:shadow-xl transition">
      <div className="flex justify-between items-center">
        <h3 className="text-gray-500 dark:text-gray-300">
          {title}
        </h3>

        <span className={`${colors[color]} text-white px-2 py-1 rounded text-xs`}>
          {title}
        </span>
      </div>

      <p className="text-3xl font-bold mt-3 dark:text-white">
        {value}
      </p>
    </div>
  );
}