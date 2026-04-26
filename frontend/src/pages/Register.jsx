import { useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const register = async () => {
    try {
      const res = await api.post("/auth/register", form);

      alert(res.data.msg);

      navigate("/"); // login page
    } catch (err) {
      alert(err.response?.data?.msg || "Error");
      console.log(err);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">

      <div className="bg-white p-6 rounded-xl shadow w-80">

        <h2 className="text-xl font-bold mb-4">
          Register
        </h2>

        <input
          placeholder="Name"
          className="border p-2 w-full mb-2"
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          placeholder="Email"
          className="border p-2 w-full mb-2"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          placeholder="Password"
          type="password"
          className="border p-2 w-full mb-2"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          onClick={register}
          className="bg-blue-500 text-white w-full py-2"
        >
          Register
        </button>

      </div>
    </div>
  );
}