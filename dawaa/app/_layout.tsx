import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { colors } = useTheme();

  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_left',
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="webview_shell" options={{ headerShown: false }} />
      <Stack.Screen 
        name="english-invitation" 
        options={{ 
          headerShown: false,
          animation: 'slide_from_left',
        }} 
      />
      <Stack.Screen 
        name="success" 
        options={{ 
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }} 
      />
      <Stack.Screen 
        name="pricing" 
        options={{ 
          headerShown: false,
          animation: 'slide_from_left',
        }} 
      />
      <Stack.Screen 
        name="event-details" 
        options={{ 
          headerShown: false,
          animation: 'slide_from_left',
        }} 
      />
      <Stack.Screen 
        name="rsvp/[id]" 
        options={{ 
          headerShown: false,
          animation: 'slide_from_bottom',
        }} 
      />
      <Stack.Screen 
        name="payment" 
        options={{ 
          headerShown: false,
          animation: 'slide_from_left',
        }} 
      />
      <Stack.Screen 
        name="guests/[id]" 
        options={{ 
          headerShown: true,
          title: 'قائمة الحضور',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' as const },
          animation: 'slide_from_left',
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
