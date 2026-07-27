// src/context/AuthModalContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import LoginModal from "../components/auth/LoginModal";
import RegisterModal from "../components/auth/RegisterModal";

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const authType = params.get("auth");
    return authType === "login" || authType === "register";
  });
  const [modalType, setModalType] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const authType = params.get("auth");
    return authType === "login" || authType === "register" ? authType : null;
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Open modals based on URL query parameter (?auth=login or ?auth=register)
  useEffect(() => {
    const authType = searchParams.get("auth");
    if (authType === "login" || authType === "register") {
      const timer = setTimeout(() => {
        setModalType(authType);
        setIsOpen(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const openLogin = () => {
    setModalType("login");
    setIsOpen(true);
    // Keep search params in sync
    setSearchParams({ auth: "login" }, { replace: true });
  };

  const openRegister = () => {
    setModalType("register");
    setIsOpen(true);
    // Keep search params in sync
    setSearchParams({ auth: "register" }, { replace: true });
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalType(null);

    // Clean up query param from URL
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("auth");
    setSearchParams(newParams, { replace: true });
  };

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <AuthModalContext.Provider
      value={{ isOpen, modalType, openLogin, openRegister, closeModal }}
    >
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={closeModal}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300"
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md z-10">
            {modalType === "login" ? (
              <LoginModal
                onClose={closeModal}
                onSwitchToRegister={openRegister}
              />
            ) : (
              <RegisterModal onClose={closeModal} onSwitchToLogin={openLogin} />
            )}
          </div>
        </div>
      )}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}

export default AuthModalContext;
