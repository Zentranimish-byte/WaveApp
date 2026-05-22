import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import { View } from 'react-native';
import ThisOrThatScreen from './screens/ThisOrThatScreen';
import RadarScreen from './screens/RadarScreen';
import FeedScreen from './screens/FeedScreen';
import SparksScreen from './screens/SparksScreen';
import ProfileScreen from './screens/ProfileScreen';
import AuthScreen from './screens/AuthScreen';
import OnboardingScreen from './screens/OnboardingScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [hasAnswers, setHasAnswers] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkProfile(session.user.id);
      else setLoading(false);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkProfile(session.user.id);
      else { setHasProfile(false); setLoading(false); }
    });
  }, []);

  async function checkProfile(userId) {
    try {
      const [profileResult, answersResult] = await Promise.all([
        supabase.from('profiles').select('id').eq('user_id', userId).single(),
        supabase.from('preference_answers').select('id').eq('user_id', userId).limit(1)
      ]);
      setHasProfile(!!profileResult.data);
      setHasAnswers(answersResult.data && answersResult.data.length > 0);
    } catch(e) {
      console.log('checkProfile error:', e);
    } finally {
      setLoading(false);
    }
  }
  if (loading) return (
    <View style={{ flex: 1, backgroundColor: '#080810' }} />
  );
  if (!session) return <AuthScreen />;
  if (!hasProfile) return <OnboardingScreen userId={session.user.id} onComplete={() => setHasProfile(true)} />;
  if (!hasAnswers) return <ThisOrThatScreen userId={session.user.id} onComplete={() => setHasAnswers(true)} />;
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