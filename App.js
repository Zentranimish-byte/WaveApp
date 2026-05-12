import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import RadarScreen from './screens/RadarScreen';
import FeedScreen from './screens/FeedScreen';
import SparksScreen from './screens/SparksScreen';
import ProfileScreen from './screens/ProfileScreen';
import AuthScreen from './screens/AuthScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  if (!session) return <AuthScreen />;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#0a0a1a', borderTopColor: '#1a1a2e' },
          tabBarActiveTintColor: '#00ff88',
          tabBarInactiveTintColor: '#888',
        }}>
        <Tab.Screen name="Radar" component={RadarScreen} />
        <Tab.Screen name="Feed" component={FeedScreen} />
        <Tab.Screen name="Sparks" component={SparksScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}