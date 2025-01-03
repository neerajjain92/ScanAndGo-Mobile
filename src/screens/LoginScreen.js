import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import axiosInstance from '../api/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleLogin = async () => {
        try {
            // Send the phone number to the backend
            const response = await axiosInstance.post('https://scanandgo-xq6h.onrender.com/mobileLogin', {
                phoneNumber,
            },
            { 
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                }
              });

            if (response.data.success) {
                // Save the JWT token locally
                await AsyncStorage.setItem('token', response.data.token);
                Alert.alert('Login successful!');
                navigation.navigate('Scanner');
            } else {
                Alert.alert('Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            Alert.alert('An error occurred. Please try again.');
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <TextInput
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                style={{ marginBottom: 20, borderWidth: 1, padding: 10 }}
            />
            <Button title="Login" onPress={handleLogin} />
        </View>
    );
};

export default LoginScreen;