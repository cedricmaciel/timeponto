
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [entryTime, setEntryTime] = useState('');
  const [exitTime, setExitTime] = useState('');
  const [workHours, setWorkHours] = useState('');
  const [nightHours, setNightHours] = useState('');

  useEffect(() => {
    const loadTimes = async () => {
      const entry = await AsyncStorage.getItem('entryTime');
      const exit = await AsyncStorage.getItem('exitTime');
      if (entry) setEntryTime(entry);
      if (exit) setExitTime(exit);
    };
    loadTimes();
  }, []);

  const saveTimes = async () => {
    await AsyncStorage.setItem('entryTime', entryTime);
    await AsyncStorage.setItem('exitTime', exitTime);
  };

  const calculateHours = () => {
    if (!entryTime || !exitTime) return;
    
    const entry = new Date(`1970-01-01T${entryTime}:00`);
    const exit = new Date(`1970-01-01T${exitTime}:00`);

    let diff = (exit - entry) / (1000 * 60 * 60); // difference in hours
    if (diff < 0) diff += 24; // handle overnight shifts

    setWorkHours(diff.toFixed(2));

    const nightStart = new Date('1970-01-01T22:00:00');
    const nightEnd = new Date('1970-01-01T05:00:00');
    
    let nightWork = 0;

    if (entry < nightEnd) nightWork += Math.min(exit, nightEnd) - entry;
    if (exit > nightStart) nightWork += exit - Math.max(entry, nightStart);

    setNightHours((nightWork / (1000 * 60 * 60)).toFixed(2));
  };

  return (
    <View style={styles.container}>
      <Text>Entry Time:</Text>
      <TextInput
        style={styles.input}
        value={entryTime}
        onChangeText={setEntryTime}
        placeholder="HH:MM"
      />
      <Text>Exit Time:</Text>
      <TextInput
        style={styles.input}
        value={exitTime}
        onChangeText={setExitTime}
        placeholder="HH:MM"
      />
      <Button title="Save" onPress={saveTimes} />
      <Button title="Calculate" onPress={calculateHours} />
      {workHours ? <Text>Hours Worked: {workHours}</Text> : null}
      {nightHours ? <Text>Night Hours: {nightHours}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});
