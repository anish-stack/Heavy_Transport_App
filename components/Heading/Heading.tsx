import React, { memo } from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

export interface HeadingProps {
  title: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  align?: 'left' | 'center' | 'right';
  color?: string;
  style?: TextStyle;
}

export const Heading = memo(({
  title,
  level = 1,
  align = 'left',
  color = '#1F2937',
  style,
}: HeadingProps) => {
  const getFontSize = (): number => {
    switch (level) {
      case 1:
        return 32;
      case 2:
        return 28;
      case 3:
        return 24;
      case 4:
        return 20;
      case 5:
        return 18;
      case 6:
        return 16;
      default:
        return 32;
    }
  };

  const getLineHeight = (): number => {
    switch (level) {
      case 1:
        return 40;
      case 2:
        return 36;
      case 3:
        return 32;
      case 4:
        return 28;
      case 5:
        return 24;
      case 6:
        return 20;
      default:
        return 40;
    }
  };

  return (
    <Text
      style={[
        styles.heading,
        {
          fontSize: getFontSize(),
          lineHeight: getLineHeight(),
          textAlign: align,
          color,
        },
        style,
      ]}
      accessibilityRole="header"
      accessibilityLevel={level}
    >
      {title}
    </Text>
  );
});

Heading.displayName = 'Heading';

const styles = StyleSheet.create({
  heading: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
});