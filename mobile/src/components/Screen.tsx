import React from 'react';
import { View, StyleSheet, ViewStyle, Platform, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useOwnTheme } from '@/src/context/ThemeContext';

interface ScreenProps {
    children: React.ReactNode;
    style?: ViewStyle;
    unsafe?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({ children, style, unsafe = false }) => {
    const { theme } = useOwnTheme();

    const Wrapper = unsafe ? View : SafeAreaView;

    return (
        <Wrapper style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
            <StatusBar
                style={theme.isDark ? "light" : "dark"}
                backgroundColor={theme.colors.statusBar}
                translucent
            />

            <View style={styles.content}>
                {children}
            </View>
        </Wrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
    },
    content: {
        flex: 1,
    }
});