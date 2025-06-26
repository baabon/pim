import { useState, useRef, useEffect } from 'react';
import Header from './templates/Header';
import Sidebar from './templates/Sidebar';
import Products from '../views/product/Products';
import Users from '../auth/views/Users';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('products');
  const mainContentRef = useRef(null);

  function toggleSidebar() {
    setSidebarOpen(prev => !prev);
  }

  function renderContent() {
    switch (activeView) {
      case 'products':
        return <Products mainScrollRef={mainContentRef} />;
      case 'users':
        return <Users />;
      default:
        return <Products mainScrollRef={mainContentRef} />;
    }
  }

  const sidebarWidth = 90;
  const APP_BAR_HEIGHT = 64; 

  return (
    <>
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} setActiveView={setActiveView} />
      <main
        ref={mainContentRef}
        style={{
          transition: 'margin-left 0.3s ease, width 0.3s ease',
          marginLeft: sidebarOpen ? `${sidebarWidth}px` : '0',
          width: sidebarOpen ? `calc(100% - ${sidebarWidth}px)` : '100%',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {renderContent()}
      </main>
    </>
  );
}