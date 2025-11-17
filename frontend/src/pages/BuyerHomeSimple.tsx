/**
 * Simplified Buyer Home Screen for Testing
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { BottomTabBar } from '../components/navigation/BottomTabBar';

export const BuyerHomeSimple: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ka' ? 'en' : 'ka';
    i18n.changeLanguage(newLang);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '2rem',
      paddingBottom: '80px', // Space for bottom navigation
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <header style={{
          backgroundColor: 'white',
          padding: '1rem 2rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h1 style={{
            color: '#4CAF50',
            margin: 0,
            fontSize: '2rem',
          }}>
            buildApp
          </h1>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
            }}
          >
            {i18n.language === 'ka' ? 'EN' : 'KA'}
          </button>
        </header>

        {/* Welcome Section */}
        <section style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ margin: 0, marginBottom: '0.5rem', color: '#333' }}>
            მოგესალმებით buildApp-ში
          </h2>
          <p style={{ margin: 0, color: '#666' }}>
            დაიწყეთ თქვენი სამშენებლო პროექტი თავდაჯერებულად
          </p>
        </section>

        {/* Templates Section */}
        <section style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ marginTop: 0, color: '#333' }}>
            პროექტის შაბლონები
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem',
            marginTop: '1rem',
          }}>
            {/* Template Card 1 */}
            <div style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <h4 style={{ margin: 0, marginBottom: '0.5rem', color: '#4CAF50' }}>
                ღობე / Fence
              </h4>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                აშენე ღობე
              </p>
            </div>

            {/* Template Card 2 */}
            <div style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <h4 style={{ margin: 0, marginBottom: '0.5rem', color: '#4CAF50' }}>
                ბეტონის ფილა / Concrete Slab
              </h4>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                ჩაასხი ბეტონის ფილა
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <BottomTabBar />
    </div>
  );
};
