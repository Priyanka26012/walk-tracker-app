/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import WalkListScreen from './src/screens/WalkListScreen';
import WalkDetailScreen from './src/screens/WalkDetailScreen';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Walk Tracker' }}
          />
          <Stack.Screen 
            name="WalkList" 
            component={WalkListScreen} 
            options={{ title: 'Saved Walks' }}
          />
          <Stack.Screen 
            name="WalkDetail" 
            component={WalkDetailScreen} 
            options={{ title: 'Walk Details' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
