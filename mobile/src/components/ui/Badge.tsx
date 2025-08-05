import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { tw } from '../../utils/tailwind';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  style,
}) => {
  const getVariantStyles = (): string => {
    switch (variant) {
      case 'default':
        return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'secondary':
        return 'bg-secondary-100 text-secondary-800 border-secondary-200';
      case 'success':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'warning':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'error':
        return 'bg-error-100 text-error-800 border-error-200';
      case 'outline':
        return 'bg-transparent text-gray-700 border-gray-300';
      default:
        return 'bg-primary-100 text-primary-800 border-primary-200';
    }
  };

  const getSizeStyles = (): string => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'md':
        return 'px-2.5 py-1 text-sm';
      case 'lg':
        return 'px-3 py-1.5 text-base';
      default:
        return 'px-2.5 py-1 text-sm';
    }
  };

  const badgeStyles = tw(`flex-row items-center justify-center rounded-full border ${getVariantStyles()} ${getSizeStyles()}`);

  return (
    <View style={[badgeStyles, style]}>
      <Text style={tw('font-medium')}>
        {children}
      </Text>
    </View>
  );
}; 