import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-brand-surface border-b border-brand-border px-4 py-2 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand-primary">
            <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2"/>
            <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2"/>
        </svg>
        <h1 className="text-xl font-bold text-brand-text">
          TOR – Unveil <span className="text-brand-text-dim">:</span> Peel the Onion
        </h1>
      </div>
      <div className="text-right hidden sm:block">
        <p className="text-sm font-bold text-brand-primary">HACKATHON 2025</p>
        <p className="text-xs text-brand-text-dim">TN POLICE</p>
      </div>
    </header>
  );
};

export default Header;
