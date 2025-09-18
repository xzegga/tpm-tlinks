import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const STORAGE_KEY = "lastRoute";

// Definir rutas a ignorar (como login, registro, etc.)
const IGNORED_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/unauthorized"];

const usePreviousRoute = () => {
  const location = useLocation();

  useEffect(() => {
    const handleNavigationClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Ignorar clics en elementos con data-logout
      if (target.closest("[data-logout]")) {
        return;
      }

      // Verificar si el elemento clickeado es un enlace de navegación
      if (target.tagName === "A" || target.closest("a")) {
        const currentPath = location.pathname;

        // Guardar la ruta solo si no está en la lista de rutas ignoradas
        if (!IGNORED_ROUTES.includes(currentPath)) {
          localStorage.setItem(STORAGE_KEY, currentPath);
        }
      }
    };

    // Agregar el event listener a todos los clics en la página
    document.addEventListener("click", handleNavigationClick);

    return () => {
      // Limpiar el event listener cuando el componente se desmonte
      document.removeEventListener("click", handleNavigationClick);
    };
  }, [location]);

  // Método para obtener la última ruta almacenada
  const getPreviousRoute = () => localStorage.getItem(STORAGE_KEY);

  // Método para eliminar la última ruta almacenada
  const clearPreviousRoute = () => localStorage.removeItem(STORAGE_KEY);

  return { getPreviousRoute, clearPreviousRoute };
};

export default usePreviousRoute;
