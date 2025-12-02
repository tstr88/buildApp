/**
 * CartIcon Component
 * Shopping cart icon with badge showing item count
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Icons } from '../icons/Icons';
import { colors, spacing, typography, borderRadius, transitions } from '../../theme/tokens';

interface CartIconProps {
  variant?: 'default' | 'light';
}

export const CartIcon: React.FC<CartIconProps> = ({ variant = 'default' }) => {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch cart count
  const fetchCount = useCallback(async () => {
    try {
      const response = await api.get<{ count?: number; data?: { count?: number } }>('/buyers/cart/count');
      if (response.success && response.data) {
        const cnt = (response.data as any).count ?? (response.data as any).data?.count ?? 0;
        setCount(typeof cnt === 'string' ? parseInt(cnt, 10) : cnt);
      }
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    }
  }, []);

  useEffect(() => {
    fetchCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchCount, 30000);

    // Listen for custom cart update events
    const handleCartUpdate = () => fetchCount();
    window.addEventListener('cart-updated', handleCartUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, [fetchCount]);

  const handleClick = () => {
    navigate('/cart');
  };

  const isLight = variant === 'light';

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        border: 'none',
        backgroundColor: isHovered
          ? (isLight ? 'rgba(255, 255, 255, 0.2)' : colors.neutral[100])
          : 'transparent',
        borderRadius: borderRadius.full,
        cursor: 'pointer',
        transition: `all ${transitions.fast} ease`,
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label={`Cart${count > 0 ? ` (${count} items)` : ''}`}
    >
      <Icons.ShoppingCart
        size={20}
        strokeWidth={2}
        color={isLight
          ? colors.neutral[0]
          : (count > 0 ? colors.primary[600] : colors.text.secondary)
        }
        style={{
          transition: `all ${transitions.fast} ease`,
        }}
      />

      {count > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            backgroundColor: colors.success[500] || '#28A745',
            color: colors.text.inverse,
            fontSize: '10px',
            fontWeight: 700,
            lineHeight: 1,
            padding: '2px 5px',
            borderRadius: borderRadius.full,
            minWidth: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isLight
              ? `0 0 0 2px ${colors.primary[600]}`
              : `0 0 0 2px ${colors.neutral[0]}`,
          }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};

// Utility function to trigger cart update
export const triggerCartUpdate = () => {
  window.dispatchEvent(new CustomEvent('cart-updated'));
};
