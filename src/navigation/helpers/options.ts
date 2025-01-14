import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";

export const NavigationDefaultOptions: NativeStackNavigationOptions = {
  headerShown: false,
  presentation: "modal",
  headerShadowVisible: false,
};

export const NavigationFormModalOptions: NativeStackNavigationOptions = {
  headerShown: false,
  presentation: "formSheet",
};

export const StatusBarLightOptions: NativeStackNavigationOptions = {
  statusBarStyle: "light",
};
