import { AuthProvider } from "../../context/AuthContext.jsx";

export default function AppProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
