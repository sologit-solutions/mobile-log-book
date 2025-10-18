import { DARK_THEME } from "@/assets/styles/defaultColors";
import { useOwnTheme } from "@/context/themeContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Text } from "@react-navigation/elements";
import { useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function TabBar({ state, descriptors, navigation }) {
  const { theme } = useOwnTheme();

  const styles = useMemo(() => createStyles(theme), [theme]);

  const icons = {
    index: (props) => <FontAwesome name="plus-square-o" size={24} {...props} />,
    profile: (props) => <FontAwesome name="user-o" size={24} {...props} />,
    eventList: (props) => <FontAwesome6 name="list-alt" size={24} {...props} />,
  };

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
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
            {icons[route.name]({
              color: isFocused
                ? DARK_THEME.textPrimary
                : DARK_THEME.textSecondary,
            })}
            <Text
              style={{
                color: isFocused
                  ? DARK_THEME.textPrimary
                  : DARK_THEME.textSecondary,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
    tabBar: {
      flexDirection: "row",
      position: "absolute",
      bottom: 25,
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: DARK_THEME.surface,
      marginHorizontal: 20,
      paddingVertical: 15,
      borderRadius: 25,
      borderCurve: "continuous",
      shadowColor: "grey",
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 10,
      shadowOpacity: 0.1,
    },
    tabBarItem: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 4,
    },
  });
