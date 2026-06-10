export const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";

const getBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;
  return apiUrl.replace(/\/api\/?$/, "");
};

/**
 * Resolves course thumbnail paths (absolute/relative) to fully qualified URLs.
 * Handles local IP/localhost rewrites dynamically for multi-device testing.
 */
export const getImageUrl = (path, fallback = DEFAULT_THUMBNAIL) => {
  if (!path) return fallback;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    const hostname = window.location.hostname;
    // Rewrite localhost URL if we are testing on a LAN IP / external address
    if (path.includes("localhost:5000") && hostname !== "localhost" && hostname !== "127.0.0.1") {
      const base = getBaseUrl();
      return path.replace("http://localhost:5000", base);
    }
    return path;
  }

  const base = getBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

/**
 * Image onError fallback handler to prevent infinite reload loops and load fallback images
 */
export const handleImageError = (e, fallback = DEFAULT_THUMBNAIL) => {
  e.target.onerror = null; // Prevent infinite error loops
  e.target.src = fallback;
};
