export default function Topbar() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow px-6 py-4 flex justify-between items-center">

      <h1 className="text-xl font-semibold dark:text-white">
        Dashboard
      </h1>

      <div className="flex items-center gap-4">

        {/* Dark Mode */}
        <button
          onClick={() =>
            document.documentElement.classList.toggle("dark")
          }
          className="bg-gray-200 px-3 py-1 rounded"
        >
          🌙
        </button>

        {/* User */}
        <span className="text-gray-600 dark:text-gray-300">
          👤 User
        </span>

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>

      </div>
    </div>
  );
}