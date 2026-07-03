// Reusable avatar — shows profile image or colored initial
export default function Avatar({ user, size = 40, className = '' }) {
  if (!user) return null;

  const style = {
    width: size,
    height: size,
    minWidth: size,
    borderRadius: '50%',
    background: user.avatarColor || '#7C3AED',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: size * 0.35,
    fontFamily: 'Poppins, sans-serif',
    overflow: 'hidden',
  };

  return (
    <div style={style} className={className}>
      {user.avatarImage
        ? <img src={user.avatarImage} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : (user.name || user.username || '?')[0].toUpperCase()
      }
    </div>
  );
}
