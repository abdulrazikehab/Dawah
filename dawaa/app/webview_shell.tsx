import React from 'react';
import AppWebView from '../components/AppWebView';
import { Platform } from 'react-native';

export default function WebViewShell() {
  // Replace this with your actual production URL after hosting
  const productionUrl = 'https://rork-app-pages-maker.vercel.app'; 
  const localUrl = 'http://192.168.1.12:8081'; // Your computer's IP address
  
  // Use production URL if available, otherwise fallback to local dev
  const url = __DEV__ ? localUrl : productionUrl;

  return <AppWebView url={url} />;
}
