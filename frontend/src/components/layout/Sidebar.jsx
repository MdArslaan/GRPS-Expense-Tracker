import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  FileText, 
  Settings,
  Store
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Purchases', path: '/purchases', icon: <ShoppingCart size={20} /> },
    { name: 'Sales', path: '/sales', icon: <Store size={20} /> },
    { name: 'Inventory', path: '/inventory', icon: <Package size={20} /> },
    { name: 'Contacts', path: '/contacts', icon: <Users size={20} /> },
    { name: 'Reports', path: '/reports', icon: <FileText size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="avatar" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
          <Package size={20} />
        </div>
        <span>TrackerPro</span>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
