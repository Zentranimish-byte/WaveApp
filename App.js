import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

const Tab = createBottomTabNavigator();

import RadarScreen from './screens/RadarScreen';
import FeedScreen from './screens/FeedScreen';
import SparksScreen from './screens/SparksScreen';
import ProfileScreen from './screens/ProfileScreen';

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Radar" component={RadarScreen} />
        <Tab.Screen name="Feed" component={FeedScreen} />
        <Tab.Screen name="Sparks" component={SparksScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}