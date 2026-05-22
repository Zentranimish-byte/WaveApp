import { View, Text, StyleSheet, TouchableOpacity, Animated, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState, useRef } from 'react';
import { supabase } from '../services/supabase';

const QUESTIONS = [
  { id: 'q1', text: 'After a fight, you:', options: ['Cool down alone', 'Fix it immediately', 'Shut down completely', 'Pretend its fine'] },
  { id: 'q2', text: 'Someone goes quiet on you, you:', options: ['Panic and check in', 'Give them space', 'Spiral internally', 'Match their silence'] },
  { id: 'q3', text: 'You communicate by:', options: ['Saying it straight', 'Dropping hints', 'Writing it out', 'Waiting too long'] },
  { id: 'q4', text: 'Your love language is:', options: ['Words, say it out loud', 'Actions, just show up', 'Time, be present', 'Touch, says everything'] },
  { id: 'q5', text: 'When someone is upset, you:', options: ['Fix the problem', 'Just listen', 'Feel it with them', 'Give them space'] },
  { id: 'q6', text: 'How real are you:', options: ['Brutally honest', 'Honest but careful', 'Soften everything', 'Avoid conflict'] },
  { id: 'q7', text: 'Your social battery:', options: ['Always full', 'Picky with people', 'Drains fast', 'Completely unpredictable'] },
  { id: 'q8', text: 'Your ideal relationship pace:', options: ['Fast, you just know', 'Slow, trust takes time', 'Organic, no timeline', 'Structured, need clarity'] },
  { id: 'q9', text: 'Free day together, you are:', options: ['Spontaneous trip, no plan', 'Couch, food, show', 'Outside, moving, exploring', 'Doing your own thing'] },
  { id: 'q10', text: 'In a relationship you are usually:', options: ['The one who initiates', 'The one who responds', 'Pretty equal', 'Pull back when intense'] },
  { id: 'q11', text: 'Right now you are looking for:', options: ['Something real', 'Something fun', 'Connection first', 'Still figuring it out'] },
  { id: 'q12', text: 'Your non-negotiable is:', options: ['Ambition', 'Emotional maturity', 'Loyalty', 'Humor'] },
  { id: 'q13', text: 'Biggest dealbreaker:', options: ['Cannot communicate', 'Emotionally unavailable', 'Too clingy', 'No direction in life'] },
  { id: 'q14', text: 'People fall for you because of your:', options: ['Humor', 'Ambition', 'Depth', 'Calm energy'] },
  { id: 'q15', text: 'Your heart is:', options: ['Open, love hard', 'Guarded, slow to trust', 'Healing right now', 'Ready, lets go'] },
];

export default function ThisOrThatScreen(props) {
  const onComplete = props.onComplete;
  const userId = props.userId;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [customAnswer, setCustomAnswer] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [saving, setSaving] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  function animateProgress(index) {
    Animated.timing(progress, {
      toValue: (index / QUESTIONS.length) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }

  async function handleAnswer(answer) {
    const question = QUESTIONS[currentIndex];
    const newAnswers = { ...answers, [question.id]: answer };
    setAnswers(newAnswers);
    setShowCustom(false);
    setCustomAnswer('');
    if (currentIndex + 1 === QUESTIONS.length) {
      await saveAnswers(newAnswers);
    } else {
      animateProgress(currentIndex + 1);
      setCurrentIndex(currentIndex + 1);
    }
  }

  async function saveAnswers(allAnswers) {
    setSaving(true);
    const rows = Object.entries(allAnswers).map(([question_id, answer]) => ({
      user_id: userId,
      question_id,
      answer,
    }));
    await supabase.from('preference_answers').upsert(rows, { onConflict: 'user_id,question_id' });
    setSaving(false);
    onComplete();
  }

  const question = QUESTIONS[currentIndex];
  const progressWidth = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  if (saving) return (
    <View style={styles.savingOverlay}>
      <Text style={styles.savingText}>Spark is reading you...</Text>
    </View>
  );

  if (saving) return (
    <View style={styles.savingOverlay}>
      <Text style={styles.savingText}>Spark is reading you...</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.headerText}>This or That</Text>
          <Text style={styles.counter}>{currentIndex + 1} / {QUESTIONS.length}</Text>
        </View>

        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.sparkLabel}>Spark asks...</Text>
          <Text style={styles.questionText}>{question.text}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionBtn}
              onPress={() => handleAnswer(option)}>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.customBtn}
            onPress={() => setShowCustom(!showCustom)}>
            <Text style={styles.customBtnText}>+ Something else</Text>
          </TouchableOpacity>
        </View>

        {showCustom && (
          <View style={styles.customInputRow}>
            <TextInput
              style={styles.customInput}
              placeholder="Type your answer..."
              placeholderTextColor="#555"
              value={customAnswer}
              onChangeText={setCustomAnswer}
              autoFocus
              maxLength={40}
            />
            <TouchableOpacity onPress={() => customAnswer.trim() && handleAnswer(customAnswer.trim())}>
              <Text style={styles.customSubmit}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    scrollContent: { flexGrow: 1, paddingBottom: 40 },
  container: { flex: 1, backgroundColor: '#080810', padding: 24, paddingTop: 60 },
  savingOverlay: { flex: 1, backgroundColor: '#080810', justifyContent: 'center', alignItems: 'center' },
  savingText: { color: '#f5f0c0', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  counter: { color: '#888', fontSize: 14 },
  progressBar: { height: 3, backgroundColor: '#1a1a2e', borderRadius: 2, marginBottom: 40 },
  progressFill: { height: 3, backgroundColor: '#00e87a', borderRadius: 2 },
  questionCard: { marginBottom: 40 },
  sparkLabel: { color: '#f5f0c0', fontSize: 13, marginBottom: 12, letterSpacing: 1 },
  questionText: { color: '#fff', fontSize: 26, fontWeight: 'bold', lineHeight: 34 },
  optionsContainer: { gap: 12 },
  optionBtn: { backgroundColor: '#12121f', borderWidth: 1, borderColor: '#1a1a2e', padding: 18, borderRadius: 16 },
  optionText: { color: '#fff', fontSize: 16 },
  customBtn: { padding: 18, alignItems: 'center' },
  customBtnText: { color: '#888', fontSize: 14 },
  customInputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  customInput: { flex: 1, backgroundColor: '#12121f', color: '#fff', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#00e87a', fontSize: 15 },
  customSubmit: { color: '#00e87a', fontSize: 16, fontWeight: 'bold' },
});