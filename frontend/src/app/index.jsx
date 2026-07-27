import AppProvider from "./AppProvider";
import AppRouter from "./router";

export default function AppRoot() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
