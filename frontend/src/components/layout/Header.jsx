import { Bell, Search } from 'lucide-react';

const Header = () => {
  return (
    <header className="header">
      <div className="search-bar flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', width: '300px' }}>
        <Search size={18} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search..." 
          style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%' }}
        />
      </div>

      <div className="user-profile">
        <button style={{ color: 'var(--text-muted)', position: 'relative' }}>
          <Bell size={20} />
          <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'var(--danger)', borderRadius: '50%' }}></span>
        </button>
        <div className="avatar">A</div>
        <div className="flex-col" style={{ fontSize: '0.875rem' }}>
          <span style={{ fontWeight: 600 }}>Admin User</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
