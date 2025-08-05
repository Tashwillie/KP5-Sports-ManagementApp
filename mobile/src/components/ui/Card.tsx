import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { tw } from '../../utils/tailwind';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  variant = 'default',
  style,
}) => {
  const getVariantStyles = (): string => {
    switch (variant) {
      case 'elevated':
        return 'bg-white rounded-lg shadow-lg border border-gray-100';
      case 'outlined':
        return 'bg-white rounded-lg border border-gray-300';
      default:
        return 'bg-white rounded-lg border border-gray-200 shadow-sm';
    }
  };

  const cardStyles = tw(`p-4 ${getVariantStyles()}`);

  return (
    <View style={[cardStyles, style]}>
      {(title || subtitle) && (
        <View style={tw('mb-4')}>
          {title && (
            <Text style={tw('text-lg font-semibold text-gray-900 mb-1')}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={tw('text-sm text-gray-600')}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
      
      <View style={tw('flex-1')}>
        {children}
      </View>
      
      {footer && (
        <View style={tw('mt-4 pt-4 border-t border-gray-200')}>
          {footer}
        </View>
      )}
    </View>
  );
}; 