"use client";

import Link from 'next/link';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import React from 'react';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{
        backgroundColor: 'var(--card-bg)',
        padding: '3rem',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-md)',
        maxWidth: '500px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{
          backgroundColor: 'var(--accent-red-light)',
          color: 'var(--accent-red)',
          padding: '1rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AlertCircle size={48} />
        </div>
        
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: 'var(--text-primary)',
          margin: 0
        }}>
          404 - Page Not Found
        </h1>
        
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.1rem',
          margin: 0,
          lineHeight: '1.5'
        }}>
          The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
        </p>

        <div style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1rem',
          width: '100%',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--accent-red)',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'background-color 0.2s',
            boxShadow: '0 2px 4px rgba(255, 77, 77, 0.2)'
          }}>
            <Home size={18} />
            Go to Dashboard
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'white',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'background-color 0.2s',
              boxShadow: 'var(--shadow-sm)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-color)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
