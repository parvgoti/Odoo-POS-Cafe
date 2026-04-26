import { useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, Menu, Zap } from 'lucide-react';
import { useState } from 'react';
import { getActiveSessionId } from '../../features/sessions/SessionPage';
import './header.css';

export default function Header({ onMenuToggle }) {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  }

  function handleOpenPOS() {
    const sessionId = getActiveSessionId();
    if (!sessionId) {
      // No active session — go to sessions page to open one
      navigate('/sessions');
    } else {
      navigate('/pos/tables');
    }
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="header-menu-btn md-show" onClick={onMenuToggle}>
          <Menu size={20} />
        </button>
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search..." />
        </div>
      </div>

      <div className="header-right">
        <button className="header-icon-btn" title="Notifications">
          <Bell size={20} />
          <span className="notification-dot" />
        </button>

        <button className="header-icon-btn" onClick={toggleTheme} title="Toggle Theme">
          <div className={`theme-toggle-icon ${darkMode ? 'dark' : ''}`}>
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
          </div>
        </button>

        <button
          className="btn btn-accent btn-sm"
          onClick={handleOpenPOS}
        >
          <Zap size={16} />
          Open POS
        </button>
      </div>
    </header>
  );
}
