import { useState, useRef, useEffect } from "react";

// Reads a boolean flag from localStorage, returns the value or a default
function getLocalPref(key, defaultVal) {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? defaultVal : stored === "true";
  } catch {
    return defaultVal;
  }
}

function saveLocalPref(key, val) {
  try {
    localStorage.setItem(key, String(val));
  } catch {}
}

export default function ChatSettingsModal({ onClose }) {
  const modalRef = useRef(null);

  const [notifSounds, setNotifSounds] = useState(() =>
    getLocalPref("shnoor_notif_sounds", true)
  );
  const [compactMode, setCompactMode] = useState(() =>
    getLocalPref("shnoor_compact_mode", false)
  );

  // Close on Escape or click outside
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    const onOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onOutside);
    };
  }, [onClose]);

  const handleNotifSounds = (val) => {
    setNotifSounds(val);
    saveLocalPref("shnoor_notif_sounds", val);
  };

  const handleCompactMode = (val) => {
    setCompactMode(val);
    saveLocalPref("shnoor_compact_mode", val);
    // Full compact mode CSS is wired in a later phase — preference is saved now
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
      }}
    >
      <div
        ref={modalRef}
        style={{
          background: "#fff",
          borderRadius: 16,
          width: 520,
          maxWidth: "95vw",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid #f0f0f0",
            background: "#f8f9fa",
            borderRadius: "16px 16px 0 0",
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", margin: 0 }}>
            Chat Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              fontSize: 20,
              lineHeight: 1,
              padding: "2px 4px",
              borderRadius: 6,
              transition: "color 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#374151")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "0 0 20px" }}>
          {/* Notifications section */}
          <Section label="Notifications">
            <Toggle
              label="Notification sounds"
              description="Play a sound when a new message arrives in a space or DM"
              checked={notifSounds}
              onChange={handleNotifSounds}
            />
          </Section>

          <Divider />

          {/* Display section */}
          <Section label="Display">
            <Toggle
              label="Compact message view"
              description="Reduce spacing between messages for a denser layout"
              checked={compactMode}
              onChange={handleCompactMode}
              badge="Coming soon"
            />
          </Section>

          <Divider />

          {/* Keyboard shortcuts — static reference */}
          <Section label="Keyboard shortcuts">
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <ShortcutRow keys={["Ctrl", "K"]} label="Search messages" badge="Coming soon" />
              <ShortcutRow keys={["Escape"]} label="Close current panel" badge="Coming soon" />
              <ShortcutRow keys={["/"]} label="Focus message input" badge="Coming soon" />
              <ShortcutRow keys={["Alt", "↑"]} label="Previous space or DM" badge="Coming soon" />
              <ShortcutRow keys={["Alt", "↓"]} label="Next space or DM" badge="Coming soon" />
            </div>
          </Section>

          <Divider />

          {/* About section */}
          <Section label="About">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Row label="Version" value="1.0.0 (Phase 1)" />
              <Row label="Built by" value="SHNOOR Engineering" />
              <Row
                label="Support"
                value={
                  <a
                    href="mailto:support@shnoor.com"
                    style={{ color: "#0D9488", textDecoration: "none", fontSize: 13 }}
                  >
                    support@shnoor.com
                  </a>
                }
              />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

// -- Sub-components used only inside this modal --

function Section({ label, children }) {
  return (
    <div style={{ padding: "18px 24px 4px" }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          margin: "0 0 12px",
        }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#f3f4f6", margin: "8px 0 0" }} />;
}

function Toggle({ label, description, checked, onChange, badge }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "10px 0",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: "#111" }}>{label}</span>
          {badge && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#9ca3af",
                background: "#f3f4f6",
                padding: "2px 6px",
                borderRadius: 4,
                letterSpacing: "0.04em",
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: "#9ca3af", margin: 0, lineHeight: 1.4 }}>
          {description}
        </p>
      </div>

      {/* Toggle switch */}
      <button
        onClick={() => onChange(!checked)}
        style={{
          position: "relative",
          width: 40,
          height: 22,
          borderRadius: 11,
          border: "none",
          cursor: "pointer",
          background: checked ? "#0D9488" : "#e5e7eb",
          transition: "background 0.2s",
          flexShrink: 0,
          padding: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 21 : 3,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }}
        />
      </button>
    </div>
  );
}

function ShortcutRow({ keys, label, badge }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom: "1px solid #f9fafb",
      }}
    >
      <span style={{ fontSize: 13, color: "#374151" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {badge && (
          <span style={{ fontSize: 10, color: "#9ca3af" }}>{badge}</span>
        )}
        <div style={{ display: "flex", gap: 3 }}>
          {keys.map((k, i) => (
            <kbd
              key={i}
              style={{
                display: "inline-block",
                padding: "2px 7px",
                fontSize: 11,
                fontFamily: "monospace",
                fontWeight: 600,
                color: "#374151",
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                borderRadius: 5,
                boxShadow: "0 1px 0 #d1d5db",
              }}
            >
              {k}
            </kbd>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
      <span style={{ fontSize: 13, color: "#9ca3af" }}>{label}</span>
      {typeof value === "string" ? (
        <span style={{ fontSize: 13, color: "#374151" }}>{value}</span>
      ) : (
        value
      )}
    </div>
  );
}