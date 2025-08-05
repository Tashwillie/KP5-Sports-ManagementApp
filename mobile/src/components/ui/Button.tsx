import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { tw } from '../../utils/tailwind';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}) => {
  const getVariantStyles = (): string => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-600 text-white';
      case 'secondary':
        return 'bg-secondary-200 text-gray-800';
      case 'outline':
        return 'border border-gray-300 bg-white text-gray-700';
      case 'ghost':
        return 'text-gray-700';
      case 'destructive':
        return 'bg-error-600 text-white';
      case 'success':
        return 'bg-success-600 text-white';
      case 'warning':
        return 'bg-warning-600 text-white';
      default:
        return 'bg-primary-600 text-white';
    }
  };

  const getSizeStyles = (): string => {
    switch (size) {
      case 'sm':
        return 'h-8 px-3';
      case 'md':
        return 'h-10 px-4';
      case 'lg':
        return 'h-12 px-6';
      default:
        return 'h-10 px-4';
    }
  };

  const buttonStyles = tw(`flex-row items-center justify-center rounded-lg font-medium ${getVariantStyles()} ${getSizeStyles()}`);
  const textStyles = tw(`font-medium ${variant === 'outline' ? 'text-gray-700' : variant === 'ghost' ? 'text-gray-700' : 'text-white'}`);

  return (
    <TouchableOpacity
      style={[buttonStyles, disabled && { opacity: 0.5 }, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? '#374151' : '#ffffff'} 
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text style={[textStyles, textStyle]}>{title}</Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
}; 