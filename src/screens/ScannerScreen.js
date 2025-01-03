import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import axiosInstance from '../api/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';


const ScannerScreen = ({ navigation }) => {
    const [facing, setFacing] = useState('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [scannedCode, setScannedCode] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    if (permission === null) {
        return <View><Text>Loading...</Text></View>;
    }

    if (!permission?.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    // Handle QR code scanning
    const handleBarCodeScanned = async ({ type, data }) => {
        if (isProcessing) return;
        setIsProcessing(true);
        setScanned(true);
        setScannedCode(data);
        try {
            const jwtToken = await AsyncStorage.getItem('token');
            if (!jwtToken) {
                Alert.alert('Error', 'No authentication token found');
                navigation.navigate('Login');
                return;
            }
            // Send the scanned token to the backend
            const response = await axiosInstance.post('https://scanandgo-xq6h.onrender.com/validateToken', {
                token: data,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Bearer ${jwtToken}`
                },
            });

            if (response.data.success) {
                alert('Token validated successfully!');
                navigation.navigate('Home');
            } else {
                alert('Invalid token!');
            }
        } catch (error) {
            console.error('Error validating token:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setTimeout(() => {
                setIsProcessing(false);
            }, 2000);
        }
    };

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }


    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing={facing}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr", "ean-13", "code-128"],
                    interval: 1000 // Optional: Set scanning interval in millisecond
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            >
                {scannedCode && (
                    <View style={styles.overlay}>
                        <Text style={styles.scanText}>Scanned: {scannedCode}</Text>
                        <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />
                    </View>
                )}
            </CameraView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
    },
    message: {
      textAlign: 'center',
      paddingBottom: 10,
    },
    camera: {
      flex: 1,
    },
    buttonContainer: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: 'transparent',
      margin: 64,
    },
    button: {
      flex: 1,
      alignSelf: 'flex-end',
      alignItems: 'center',
    },
    text: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
  });

export default ScannerScreen;