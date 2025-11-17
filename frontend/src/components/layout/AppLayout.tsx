/**
 * AppLayout Component
 * Responsive layout wrapper with navigation
 */

import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomTabBar } from '../navigation/BottomTabBar';
import { Sidebar } from '../navigation/Sidebar';
import { breakpoints } from '../../theme/tokens';

export const AppLayout: React.FC = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoints.md);
  const [sidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoints.md);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar collapsed={sidebarCollapsed} />}

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          marginLeft: isMobile ? 0 : sidebarCollapsed ? '64px' : '240px',
          transition: 'margin-left 200ms ease',
        }}
      >
        <Outlet />
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <BottomTabBar />}
    </div>
  );
};
