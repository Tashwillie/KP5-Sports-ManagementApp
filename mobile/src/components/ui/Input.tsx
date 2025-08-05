import React, { useState } from 'react';
import { View, TextInput, Text, ViewStyle, TextStyle } from 'react-native';
import { tw } from '../../utils/tailwind';

export interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helper?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  helper,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  multiline = false,
  numberOfLines = 1,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  inputStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getInputStyles = (): string => {
    let baseStyles = 'border rounded-lg px-3 py-2 text-base';
    
    if (disabled) {
      return `${baseStyles} bg-gray-100 border-gray-300 text-gray-500`;
    }
    
    if (error) {
      return `${baseStyles} bg-white border-error-500 text-gray-900`;
    }
    
    if (isFocused) {
      return `${baseStyles} bg-white border-primary-500 text-gray-900`;
    }
    
    return `${baseStyles} bg-white border-gray-300 text-gray-900`;
  };

  const inputContainerStyles = tw(`flex-row items-center ${getInputStyles()}`);
  const inputTextStyles = tw('flex-1 text-base');

  return (
    <View style={[tw('mb-4'), style]}>
      {label && (
        <Text style={tw('text-sm font-medium text-gray-700 mb-2')}>
          {label}
        </Text>
      )}
      
      <View style={inputContainerStyles}>
        {leftIcon && (
          <View style={tw('mr-2')}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={[inputTextStyles, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {rightIcon && (
          <View style={tw('ml-2')}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {(error || helper) && (
        <Text style={tw(`text-sm mt-1 ${error ? 'text-error-600' : 'text-gray-500'}`)}>
          {error || helper}
        </Text>
      )}
    </View>
  );
}; 