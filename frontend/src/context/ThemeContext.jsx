import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

const themes = ["light", "dark", "red", "green"];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return sessionStorage.getItem("shnoor-theme") || "light"; } catch { return "light"; }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "theme-red", "theme-green");
    if (theme === "dark")  root.classList.add("dark");
    if (theme === "red")   root.classList.add("theme-red");
    if (theme === "green") root.classList.add("theme-green");
    try { sessionStorage.setItem("shnoor-theme", theme); } catch {}
  }, [theme]);

  const toggleTheme = () =>
    setTheme(prev => {
      const idx = themes.indexOf(prev);
      return themes[(idx + 1) % themes.length];
    });

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
