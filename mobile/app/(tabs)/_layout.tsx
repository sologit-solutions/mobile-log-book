import TabBar from "@/components/tabBar";
import { useOwnTheme } from "@/context/themeContext";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function LayoutContent() {
  const { theme } = useOwnTheme();
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <StatusBar backgroundColor={theme.colors.statusBar} translucent />
        <Tabs
          tabBar={(props) => <TabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
            }}
          />
          <Tabs.Screen
            name="index"
            options={{
              title: "Add event",
            }}
          />
          <Tabs.Screen
            name="eventList"
            options={{
              title: "Event list",
            }}
          />
        </Tabs>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
