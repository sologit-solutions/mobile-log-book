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

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';
export type ButtonShape = 'default' | 'pill' | 'small' | 'grid';

/**
 * Props for the custom Button component
 * Inherits all standard React Native TouchableOpacity properties (e.g., onPress, disabled)
 */
export interface ButtonProps extends TouchableOpacityProps {
    /** The text displayed inside the button */
    title: string;
    /** The visual color scheme of the button, defaults to "primary" */
    variant?: ButtonVariant;
    /** The geometric layout and sizing preset, defaults to "default" */
    shape?: ButtonShape;
    /** If true, shows an ActivityIndicator and disables user interaction */
    loading?: boolean;
    /** Optional style overrides for the outer container */
    style?: ViewStyle;
    /** Optional style overrides for the inner text */
    textStyle?: TextStyle;
}

/**
 * A reusable, theme-aware Button component
 * Automatically adapts its colors to the current Light/Dark theme and
 * handles its own geometry based on the provided `shape` prop
 */
export const Button: React.FC<ButtonProps> = ({
                                                  title,
                                                  variant = 'primary',
                                                  shape = 'default',
                                                  loading = false,
                                                  style,
                                                  textStyle,
                                                  disabled,
                                                  ...props
                                              }) => {
    const { theme } = useOwnTheme();

    const getBackgroundColor = () => {
        if (disabled && variant !== 'outline' && variant !== 'ghost') return theme.colors.surface;
        switch (variant) {
            case 'primary': return theme.colors.surface;
            case 'danger': return theme.colors.danger;
            case 'outline': return 'transparent';
            case 'ghost': return 'transparent';
            default: return theme.colors.surface;
        }
    };

    const getBorderColor = () => {
        switch (variant) {
            case 'outline': return theme.colors.textSecondary;
            case 'danger': return theme.colors.danger;
            default: return getBackgroundColor();
        }
    };

    const getTextColor = () => {
        if (disabled) return theme.colors.textSecondary;
        switch (variant) {
            case 'danger': return '#FFFFFF';
            case 'primary': return theme.colors.textPrimary;
            case 'outline': return theme.colors.textPrimary;
            case 'ghost': return theme.colors.textPrimary;
            default: return theme.colors.textPrimary;
        }
    };

    const getShapeStyles = (): { container: ViewStyle; text: TextStyle } => {
        switch (shape) {
            case 'pill': // Header Pill (Logout, Back, Delete)
                return {
                    container: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2 },
                    text: { fontSize: 14, fontWeight: '600' }
                };
            case 'small': // Profile Button List (Remove)
                return {
                    container: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15 },
                    text: { fontSize: 14, fontWeight: '600' }
                };
            case 'grid': // Home Event Buttons & Modal Actions
                return {
                    container: { borderRadius: 15, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
                    text: { fontSize: 18, fontWeight: '600' }
                };
            case 'default': // Main standard (Login, Profile Menu, Save Event)
            default:
                return {
                    container: { height: 55, width: '100%', borderRadius: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
                    text: { fontSize: 16, fontWeight: '600' }
                };
        }
    };

    const shapeStyles = getShapeStyles();

    return (
        <TouchableOpacity
            style={[
                styles.baseButton,
                shapeStyles.container,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: getBorderColor(),
                    borderWidth: variant === 'outline' || (variant === 'danger' && getBackgroundColor() === 'transparent') ? 1 : 0,
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
                <Text style={[{ color: getTextColor(), textAlign: 'center' }, shapeStyles.text, textStyle]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    baseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    }
});