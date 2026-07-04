// Generate unique ID
export const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// Format timestamp to relative time
export const formatTime = (timestamp) => {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

// Get avatar color from username
export const getAvatarColor = (username) => {
  const colors = ['#7C3AED', '#2563EB', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

// Gradient backgrounds for posts without images
export const POST_GRADIENTS = [
  'linear-gradient(135deg, #1a1a2e, #533483)',
  'linear-gradient(135deg, #2d6a4f, #95d5b2)',
  'linear-gradient(135deg, #370617, #d62828)',
  'linear-gradient(135deg, #03045e, #90e0ef)',
  'linear-gradient(135deg, #6366F1, #EC4899)',
  'linear-gradient(135deg, #134e4a, #5eead4)',
];

export const getGradient = (id) => POST_GRADIENTS[id % POST_GRADIENTS.length];

// Convert file to base64
export const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});



