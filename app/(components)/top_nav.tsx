'use client';

import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/actions/userActions';
import React from 'react';

const TopNav: React.FC = () => {
  return (
    <nav className="top-nav">
      <ul>
        <Button variant="default" size="lg" onClick={async () => await signOut()}>
          Logout
        </Button>
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/about">About</a>
        </li>
        <li>
          <a href="/contact">Contact</a>
        </li>
      </ul>
      <style jsx>{`
        .top-nav {
          background-color: #333;
          padding: 1rem;
        }
        .top-nav ul {
          list-style: none;
          display: flex;
          justify-content: space-around;
        }
        .top-nav li {
          margin: 0 1rem;
        }
        .top-nav a {
          color: white;
          text-decoration: none;
        }
        .top-nav a:hover {
          text-decoration: underline;
        }
      `}</style>
    </nav>
  );
};

export default TopNav;
