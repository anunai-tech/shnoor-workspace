import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme, THEMES } = useTheme();

  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      <span>Theme</span>
      <div className="flex rounded-full overflow-hidden border border-white/10">
        {THEMES.map((mode) => (
          <button
            key={mode}
            onClick={() => setTheme(mode)}
            className={`px-3 py-1 capitalize transition-all ${
              theme === mode
                ? "bg-white text-black font-medium"
                : "bg-transparent text-gray-400"
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
