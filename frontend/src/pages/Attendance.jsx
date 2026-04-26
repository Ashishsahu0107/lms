export default function Attendance() {
  const percentage = 75;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 dark:text-white">
        Attendance
      </h2>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
        <h3 className="text-lg dark:text-white">Attendance Overview</h3>

        <div className="mt-4 bg-gray-200 h-3 rounded-full">
          <div
            className="bg-green-500 h-3 rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        <p className="mt-2 dark:text-white">{percentage}%</p>
      </div>
    </div>
  );
}