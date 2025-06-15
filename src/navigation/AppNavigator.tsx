import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { SavedWalksScreen } from '../screens/SavedWalksScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Walk Tracker',
          }}
        />
        <Stack.Screen
          name="SavedWalks"
          component={SavedWalksScreen}
          options={{
            title: 'Saved Walks',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 