

export default function Navbar({ currentPage, setPage }) {
  const navItems = [
    { id: 'home', icon: '🏠' },
    { id: 'explore', icon: '🔍' },
    { id: 'notifications', icon: '❤' },
    { id: 'profile', icon: '👤' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around py-3">
      {navItems.map((item) => (
        <button
          Key={item.id}
          onClick={() => setPage(item.id)}
          className={`text-2xl ${currentPage === item.id ? 'text-blue-500' : 'text-gray-500'}`}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}
