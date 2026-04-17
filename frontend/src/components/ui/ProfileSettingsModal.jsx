import { useState, useRef, useEffect } from 'react';
import Avatar from './Avatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { updateMyProfile, updateMyAvatar } from '../../api/users.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function ProfileSettingsModal({ onClose }) {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState(user?.avatar_url || null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const isBase64 = profileImage?.startsWith('data:image/');
  const hasNameChange = displayName.trim() !== user?.name;
  const hasAvatarChange = isBase64 && profileImage !== user?.avatar_url;
  const hasChanges = hasNameChange || hasAvatarChange;

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    const onOutside = (e) => { if (modalRef.current && !modalRef.current.contains(e.target)) onClose(); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onOutside);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onOutside);
    };
  }, [onClose]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image must be under 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!displayName.trim()) return showToast('Name is required', 'error');
    if (displayName.trim().length < 2) return showToast('Name must be at least 2 characters', 'error');

    setSaving(true);
    try {
      let updatedUser = { ...user };

      if (hasNameChange) {
        const result = await updateMyProfile(displayName.trim());
        updatedUser = { ...updatedUser, name: result.name };
      }

      if (hasAvatarChange) {
        const result = await updateMyAvatar(profileImage);
        updatedUser = { ...updatedUser, avatar_url: result.avatar_url };
      }

      setUser(updatedUser);
      showToast('Profile saved successfully', 'success');
      onClose();
    } catch (err) {
      showToast('Failed to save profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 120,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
    }}>
      <div ref={modalRef} style={{
        background: '#fff', borderRadius: 16, width: 480, maxWidth: '95vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', borderBottom: '1px solid #f0f0f0', background: '#f8f9fa',
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Profile Settings</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 18 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Photo */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
              Profile Photo
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile"
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }} />
                ) : (
                  <Avatar initials={initials} color="#0D9488" size={64} />
                )}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.45)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                >
                  <span style={{ fontSize: 11, color: '#fff', fontWeight: 500 }}>Edit</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{ padding: '7px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#374151' }}
                >
                  Change Photo
                </button>
                {isBase64 && (
                  <button
                    onClick={() => setProfileImage(user?.avatar_url || null)}
                    style={{ fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                  >
                    Remove change
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </div>
          </div>

          {/* Display name */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb',
                borderRadius: 10, fontSize: 14, color: '#111', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#0D9488'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '6px 0 0 2px' }}>Visible to everyone across SHNOOR Chat.</p>
          </div>

          {/* Email (readonly) */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
              Email Address
            </label>
            <input
              type="email" value={user?.email || ''} readOnly
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#9ca3af', background: '#f9fafb', cursor: 'default', boxSizing: 'border-box' }}
            />
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '6px 0 0 2px' }}>Contact your admin to change this.</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          padding: '16px 24px', background: '#f8f9fa', borderTop: '1px solid #f0f0f0',
        }}>
          <button onClick={onClose} style={{ padding: '9px 18px', fontSize: 13, color: '#666', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8 }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            style={{
              padding: '9px 20px', fontSize: 13, fontWeight: 500, color: '#fff',
              background: hasChanges && !saving ? '#0D9488' : '#9ca3af',
              border: 'none', borderRadius: 8, cursor: hasChanges && !saving ? 'pointer' : 'not-allowed',
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}