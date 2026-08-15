import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';

function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />
      <main style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
