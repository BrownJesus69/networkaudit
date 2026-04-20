import 'react-native-gesture-handler'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { View, KeyboardAvoidingView, Platform } from 'react-native'
import { ThemeProvider, useTheme } from './src/context/ThemeContext'
import { ScanCountProvider, useScanCount } from './src/context/ScanCountContext'
import ScanScreen from './src/screens/ScanScreen'
import HistoryScreen from './src/screens/HistoryScreen'
import AboutScreen from './src/screens/AboutScreen'
import HistoryDetailScreen from './src/screens/HistoryDetailScreen'
import type { RootStackParamList } from './src/types/navigation'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator<RootStackParamList>()

function TabNavigator() {
  const { colors } = useTheme()
  const { count } = useScanCount()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap
          if (route.name === 'Scan') {
            iconName = focused ? 'shield' : 'shield-outline'
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline'
          } else {
            iconName = focused ? 'information-circle' : 'information-circle-outline'
          }
          return (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name={iconName} size={size} color={color} />
              {focused && (
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: colors.textPrimary,
                    marginTop: 3,
                  }}
                />
              )}
            </View>
          )
        },
      })}
    >
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarBadge: count > 0 ? count : undefined,
          tabBarBadgeStyle: { fontSize: 10, minWidth: 18, height: 18, lineHeight: 18 },
        }}
      />
      <Tab.Screen name="About" component={AboutScreen} />
    </Tab.Navigator>
  )
}

function Navigation() {
  const { isDark } = useTheme()

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ScanCountProvider>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <Navigation />
          </KeyboardAvoidingView>
        </ScanCountProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
