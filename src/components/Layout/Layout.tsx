import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    // <div className="flex min-h-screen bg-gray-50">
    //   <Sidebar />
    //   <div className="flex-1 flex flex-col">
    //     <Header />
    //     <main className="flex-1 p-6">
    //       <Outlet />
    //     </main>
    //   </div>
    // </div>
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      {/* <div className="w-64 h-full overflow-y-auto no-scrollbar border-r bg-white"> */}
          <div className="w-64 h-full border-r">
        <Sidebar />
      </div>

      {/* Right Side */}
      <div className="flex-1 flex flex-col h-full">
        <Header />

        {/* Outlet Scroll */}
        <main className="flex-1 overflow-y-auto no-scrollbar p-6">
          <Outlet />
        </main>
      </div>
    </div>


  );
};

export default Layout;