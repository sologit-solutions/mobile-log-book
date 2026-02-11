import React, { useMemo } from "react";
import { StyleSheet, TouchableOpacity, View, LayoutChangeEvent } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Text } from "@react-navigation/elements";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {useOwnTheme} from "@/src/context/ThemeContext";

/**
 * TabBar Component
 *
 * We use BottomTabBarProps from @react-navigation/bottom-tabs to
 * strictly type the state, descriptors, and navigation props.
 */
export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme } = useOwnTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Define icon mapping with strict types
  const icons: Record<string, (props: { color: string; size: number }) => React.ReactNode> = {
    home: (props) => <FontAwesome name="plus-square-o" {...props} />,
    profile: (props) => <FontAwesome name="user-o" {...props} />,
    events: (props) => <FontAwesome6 name="list-alt" {...props} />,
  };

  return (
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];

          // Handle label fallback logic
          const label =
              options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                      ? options.title
                      : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
              <TouchableOpacity
                  key={route.name}
                  testID={options.tabBarButtonTestID}
                  onPress={onPress}
                  style={styles.tabBarItem}
              >
                {/* Render the icon based on the route name.
              We default to a question mark if the route name is missing from our map
             */}
                {icons[route.name]
                    ? icons[route.name]({
                      color: isFocused ? theme.colors.textPrimary : theme.colors.textSecondary,
                      size: 24
                    })
                    : <FontAwesome name="question" size={24} color={theme.colors.textSecondary} />
                }

                <Text
                    style={{
                      color: isFocused ? theme.colors.textPrimary : theme.colors.textSecondary,
                      fontSize: 12,
                      marginTop: 4
                    }}
                >
                  {typeof label === 'string' ? label : route.name}
                </Text>
              </TouchableOpacity>
          );
        })}
      </View>
  );
}

// Ensure strict typing for the theme argument
const createStyles = (theme: any) => // We will fix 'any' here in the next step when we fix global theme types
    StyleSheet.create({
      tabBar: {
        flexDirection: "row",
        position: "absolute",
        bottom: 25,
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        marginHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 25,
        shadowColor: "grey",
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 10,
        shadowOpacity: 0.1,
        elevation: 5, // Android shadow
      },
      tabBarItem: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      },
    });