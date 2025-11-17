import { type ReactNode } from 'react';

interface AuthCardProps {
  children: ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F2F2F2',
      padding: '16px',
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
      }}>
        {children}
      </div>
    </div>
  );
}
