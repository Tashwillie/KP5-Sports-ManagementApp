import { StyleSheet } from 'react-native';

// Utility function to create styles from Tailwind classes
export const tw = (classes: string) => {
  const styleObject: any = {};
  
  // Parse Tailwind classes and convert to React Native styles
  const classArray = classes.split(' ');
  
  classArray.forEach(className => {
    // Background colors
    if (className.startsWith('bg-')) {
      const color = className.replace('bg-', '');
      styleObject.backgroundColor = getColorValue(color);
    }
    
    // Text colors
    if (className.startsWith('text-')) {
      const color = className.replace('text-', '');
      styleObject.color = getColorValue(color);
    }
    
    // Padding
    if (className.startsWith('p-')) {
      const size = className.replace('p-', '');
      const paddingValue = getSpacingValue(size);
      styleObject.padding = paddingValue;
    }
    
    // Margin
    if (className.startsWith('m-')) {
      const size = className.replace('m-', '');
      const marginValue = getSpacingValue(size);
      styleObject.margin = marginValue;
    }
    
    // Width
    if (className.startsWith('w-')) {
      const size = className.replace('w-', '');
      styleObject.width = getWidthValue(size);
    }
    
    // Height
    if (className.startsWith('h-')) {
      const size = className.replace('h-', '');
      styleObject.height = getHeightValue(size);
    }
    
    // Flex
    if (className === 'flex') {
      styleObject.flex = 1;
    }
    if (className === 'flex-row') {
      styleObject.flexDirection = 'row';
    }
    if (className === 'flex-col') {
      styleObject.flexDirection = 'column';
    }
    
    // Justify content
    if (className.startsWith('justify-')) {
      const value = className.replace('justify-', '');
      styleObject.justifyContent = getJustifyValue(value);
    }
    
    // Align items
    if (className.startsWith('items-')) {
      const value = className.replace('items-', '');
      styleObject.alignItems = getAlignValue(value);
    }
    
    // Border radius
    if (className.startsWith('rounded-')) {
      const size = className.replace('rounded-', '');
      styleObject.borderRadius = getBorderRadiusValue(size);
    }
    
    // Font size
    if (className.startsWith('text-') && !className.includes('text-')) {
      const size = className.replace('text-', '');
      styleObject.fontSize = getFontSizeValue(size);
    }
    
    // Font weight
    if (className.startsWith('font-')) {
      const weight = className.replace('font-', '');
      styleObject.fontWeight = getFontWeightValue(weight);
    }
    
    // Border
    if (className.startsWith('border')) {
      styleObject.borderWidth = 1;
      if (className.includes('-')) {
        const color = className.split('-')[1];
        styleObject.borderColor = getColorValue(color);
      }
    }
  });
  
  return StyleSheet.create({ style: styleObject }).style;
};

// Helper functions to convert Tailwind values to React Native values
const getColorValue = (color: string): string => {
  const colorMap: { [key: string]: string } = {
    'primary-600': '#2563eb',
    'primary-500': '#3b82f6',
    'secondary-200': '#e2e8f0',
    'error-600': '#dc2626',
    'success-600': '#16a34a',
    'warning-600': '#d97706',
    'gray-300': '#d1d5db',
    'gray-600': '#4b5563',
    'white': '#ffffff',
    'black': '#000000',
    'transparent': 'transparent',
  };
  return colorMap[color] || color;
};

const getSpacingValue = (size: string): number => {
  const spacingMap: { [key: string]: number } = {
    '0': 0,
    '1': 4,
    '2': 8,
    '3': 12,
    '4': 16,
    '5': 20,
    '6': 24,
    '8': 32,
    '10': 40,
    '12': 48,
    '16': 64,
    '20': 80,
    '24': 96,
    '32': 128,
  };
  return spacingMap[size] || 0;
};

const getWidthValue = (size: string): string | number => {
  if (size === 'full') return '100%';
  if (size === 'auto') return 'auto';
  return getSpacingValue(size);
};

const getHeightValue = (size: string): string | number => {
  if (size === 'full') return '100%';
  if (size === 'auto') return 'auto';
  return getSpacingValue(size);
};

const getJustifyValue = (value: string): string => {
  const justifyMap: { [key: string]: string } = {
    'start': 'flex-start',
    'end': 'flex-end',
    'center': 'center',
    'between': 'space-between',
    'around': 'space-around',
    'evenly': 'space-evenly',
  };
  return justifyMap[value] || 'flex-start';
};

const getAlignValue = (value: string): string => {
  const alignMap: { [key: string]: string } = {
    'start': 'flex-start',
    'end': 'flex-end',
    'center': 'center',
    'stretch': 'stretch',
    'baseline': 'baseline',
  };
  return alignMap[value] || 'stretch';
};

const getBorderRadiusValue = (size: string): number => {
  const radiusMap: { [key: string]: number } = {
    'none': 0,
    'sm': 2,
    'md': 6,
    'lg': 8,
    'xl': 12,
    '2xl': 16,
    'full': 9999,
  };
  return radiusMap[size] || 0;
};

const getFontSizeValue = (size: string): number => {
  const fontSizeMap: { [key: string]: number } = {
    'xs': 12,
    'sm': 14,
    'base': 16,
    'lg': 18,
    'xl': 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  };
  return fontSizeMap[size] || 16;
};

const getFontWeightValue = (weight: string): string => {
  const weightMap: { [key: string]: string } = {
    'thin': '100',
    'light': '300',
    'normal': '400',
    'medium': '500',
    'semibold': '600',
    'bold': '700',
    'extrabold': '800',
    'black': '900',
  };
  return weightMap[weight] || '400';
};

// Predefined style combinations
export const styles = {
  container: tw('flex-1 bg-white'),
  card: tw('bg-white rounded-lg border border-gray-200 p-4 m-2'),
  button: tw('bg-primary-600 text-white rounded-lg p-3 items-center justify-center'),
  buttonSecondary: tw('bg-secondary-200 text-gray-800 rounded-lg p-3 items-center justify-center'),
  input: tw('border border-gray-300 rounded-lg p-3 bg-white'),
  text: tw('text-gray-800'),
  textPrimary: tw('text-primary-600'),
  textSecondary: tw('text-gray-600'),
  heading: tw('text-2xl font-bold text-gray-900'),
  subheading: tw('text-lg font-semibold text-gray-800'),
  badge: tw('bg-primary-100 text-primary-800 rounded-full px-2 py-1 text-xs'),
}; 