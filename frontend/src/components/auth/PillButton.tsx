import { type ReactNode } from 'react';

interface PillButtonProps {
  children: ReactNode;
  selected: boolean;
  onClick: () => void;
  icon?: ReactNode;
  size?: 'small' | 'large';
  disabled?: boolean;
}

export function PillButton({ children, selected, onClick, icon, size = 'large', disabled = false }: PillButtonProps) {
  const isLarge = size === 'large';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: isLarge ? '16px 20px' : '10px 16px',
        border: selected ? '2px solid #2563EB' : '1px solid #E6E6E6',
        borderRadius: '12px',
        backgroundColor: selected ? '#EFF6FF' : '#FFFFFF',
        color: selected ? '#2563EB' : '#222',
        fontSize: isLarge ? '16px' : '14px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 200ms ease',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !selected) {
          e.currentTarget.style.borderColor = '#BDBDBD';
          e.currentTarget.style.backgroundColor = '#F9F9F9';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !selected) {
          e.currentTarget.style.borderColor = '#E6E6E6';
          e.currentTarget.style.backgroundColor = '#FFFFFF';
        }
      }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  );
}
