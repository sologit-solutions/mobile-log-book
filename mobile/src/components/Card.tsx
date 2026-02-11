import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useOwnTheme } from '@/src/context/ThemeContext';

interface CardProps extends TouchableOpacityProps {
    children: React.ReactNode;
    style?: ViewStyle;
    /**
     * If provided, renders as a TouchableOpacity.
     * If not, renders as a View.
     */
    onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, ...props }) => {
    const { theme } = useOwnTheme();

    const cardStyle = [
        styles.card,
        { backgroundColor: theme.colors.surface },
        style
    ];

    if (onPress) {
        return (
            <TouchableOpacity
                style={cardStyle}
                onPress={onPress}
                activeOpacity={0.7}
                {...props}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        // Shadow / Elevation
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
});