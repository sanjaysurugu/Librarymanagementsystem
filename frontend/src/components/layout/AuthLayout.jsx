import React from 'react';
import { Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Outlet />
    </div>
  );
}

export default AuthLayout;
