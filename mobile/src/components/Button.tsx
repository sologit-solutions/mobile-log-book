import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacityProps,
    ViewStyle,
    TextStyle
} from 'react-native';
import { useOwnTheme } from '@/src/context/ThemeContext';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: ButtonVariant;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
                                                  title,
                                                  variant = 'primary',
                                                  loading = false,
                                                  style,
                                                  textStyle,
                                                  disabled,
                                                  ...props
                                              }) => {
    const { theme } = useOwnTheme();

    // Dynamic styles based on variant
    const getBackgroundColor = () => {
        if (disabled) return theme.colors.surface; // Or a specific disabled color
        switch (variant) {
            case 'primary': return theme.colors.surface; // Using surface as primary button color based on your design
            case 'danger': return 'transparent';
            case 'outline': return 'transparent';
            case 'ghost': return 'transparent';
            default: return theme.colors.surface;
        }
    };

    const getBorderColor = () => {
        switch (variant) {
            case 'outline': return theme.colors.textSecondary;
            case 'danger': return 'red';
            default: return getBackgroundColor();
        }
    };

    const getTextColor = () => {
        if (disabled) return theme.colors.textSecondary;
        switch (variant) {
            case 'danger': return 'red';
            case 'ghost': return theme.colors.textPrimary;
            default: return theme.colors.textPrimary;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: getBorderColor(),
                    borderWidth: variant === 'outline' || variant === 'danger' ? 1 : 0,
                    opacity: disabled ? 0.6 : 1,
                },
                style
            ]}
            disabled={loading || disabled}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 30, // Default to rounded pill style
        minHeight: 50,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
});