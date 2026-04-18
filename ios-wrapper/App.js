import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import * as InAppPurchases from 'expo-in-app-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Placeholder ad unit IDs - replace with actual IDs when provided
const BANNER_AD_UNIT_ID = __DEV__ 
  ? TestIds.BANNER 
  : 'ca-app-pub-3002325591150738/9683450640';

const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-3002325591150738/4291523162';

const REMOVE_ADS_PRODUCT_ID = 'com.christianappempire.datingdosdonts.removeads';
const ADS_REMOVED_KEY = '@ads_removed';
const INTERSTITIAL_COUNT_KEY = '@interstitial_count';

let interstitialAd = null;
let isInterstitialLoaded = false;

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [adsRemoved, setAdsRemoved] = useState(false);
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(false);
  const webViewRef = useRef(null);

  // Initialize ads and purchases
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if ads were removed
      const adsRemovedValue = await AsyncStorage.getItem(ADS_REMOVED_KEY);
      const shouldRemoveAds = adsRemovedValue === 'true';
      setAdsRemoved(shouldRemoveAds);

      // Request ATT permission (iOS only)
      if (Platform.OS === 'ios') {
        const { status } = await requestTrackingPermissionsAsync();
        console.log('ATT permission status:', status);
      }

      // Initialize StoreKit
      if (Platform.OS !== 'web') {
        await InAppPurchases.connectAsync();
        console.log('StoreKit connected');

        // Check for existing purchases
        await checkPurchaseStatus();

        // Set up purchase listener
        InAppPurchases.setPurchaseListener(handlePurchaseUpdate);
      }

      // Initialize ads if not removed
      if (!shouldRemoveAds) {
        initializeAds();
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeAds = () => {
    if (Platform.OS === 'web') return;

    // Initialize interstitial
    loadInterstitialAd();
  };

  const loadInterstitialAd = () => {
    if (interstitialAd) {
      interstitialAd.destroy();
    }

    interstitialAd = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('Interstitial ad loaded');
      isInterstitialLoaded = true;
    });

    interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('Interstitial ad closed');
      isInterstitialLoaded = false;
      loadInterstitialAd();
    });

    interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Interstitial ad error:', error);
      isInterstitialLoaded = false;
    });

    interstitialAd.load();
  };

  const checkPurchaseStatus = async () => {
    try {
      const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync();
      if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
        const hasRemoveAds = results.some(purchase => purchase.productId === REMOVE_ADS_PRODUCT_ID);
        if (hasRemoveAds) {
          await setAdsRemovedStatus(true);
        }
      }
    } catch (error) {
      console.error('Error checking purchase status:', error);
    }
  };

  const handlePurchaseUpdate = async ({ responseCode, results, errorCode }) => {
    if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
      for (const purchase of results) {
        if (!purchase.acknowledged) {
          await InAppPurchases.finishTransactionAsync(purchase, true);
        }
        if (purchase.productId === REMOVE_ADS_PRODUCT_ID) {
          await setAdsRemovedStatus(true);
          Alert.alert('Thank You!', 'Ads have been removed. Enjoy your ad-free experience!');
        }
      }
    } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
      console.log('User canceled purchase');
    } else {
      console.error('Purchase error:', errorCode);
    }
    setIsPurchaseLoading(false);
  };

  const setAdsRemovedStatus = async (removed) => {
    await AsyncStorage.setItem(ADS_REMOVED_KEY, removed ? 'true' : 'false');
    setAdsRemoved(removed);
    if (removed && interstitialAd) {
      interstitialAd.destroy();
      interstitialAd = null;
    }
  };

  const showInterstitialAd = async () => {
    if (adsRemoved || Platform.OS === 'web') return;

    try {
      const countStr = await AsyncStorage.getItem(INTERSTITIAL_COUNT_KEY);
      let count = parseInt(countStr || '0', 10);
      count += 1;

      if (count >= 3) {
        count = 0;
        if (isInterstitialLoaded && interstitialAd) {
          interstitialAd.show();
        }
      }

      await AsyncStorage.setItem(INTERSTITIAL_COUNT_KEY, count.toString());
    } catch (error) {
      console.error('Error showing interstitial:', error);
    }
  };

  const handlePurchaseRemoveAds = async () => {
    if (adsRemoved) {
      Alert.alert('Already Purchased', 'You have already removed ads!');
      return;
    }

    setIsPurchaseLoading(true);
    try {
      await InAppPurchases.purchaseItemAsync(REMOVE_ADS_PRODUCT_ID);
    } catch (error) {
      console.error('Error purchasing:', error);
      Alert.alert('Purchase Failed', 'Unable to complete purchase. Please try again.');
      setIsPurchaseLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setIsPurchaseLoading(true);
    try {
      const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync();
      if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
        const hasRemoveAds = results.some(purchase => purchase.productId === REMOVE_ADS_PRODUCT_ID);
        if (hasRemoveAds) {
          await setAdsRemovedStatus(true);
          Alert.alert('Success', 'Your purchases have been restored!');
        } else {
          Alert.alert('No Purchases Found', 'No previous purchases were found to restore.');
        }
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setIsPurchaseLoading(false);
    }
  };

  // Handle messages from WebView
  const handleWebViewMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Message from WebView:', data);

      switch (data.type) {
        case 'PAGE_CHANGE':
          // Show interstitial every 3rd page navigation
          showInterstitialAd();
          break;
        case 'PURCHASE_REMOVE_ADS':
          handlePurchaseRemoveAds();
          break;
        case 'RESTORE_PURCHASES':
          handleRestorePurchases();
          break;
        case 'CHECK_ADS_STATUS':
          // Send ads status back to WebView
          webViewRef.current?.injectJavaScript(`
            window.postMessage(JSON.stringify({
              type: 'ADS_STATUS',
              adsRemoved: ${adsRemoved}
            }), '*');
            true;
          `);
          break;
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  }, [adsRemoved]);

  // Inject JavaScript to communicate with WebView
  const injectedJavaScript = `
    (function() {
      // Override the Remove Ads button click
      const originalRemoveAds = window.handleRemoveAds;
      window.handleRemoveAds = function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'PURCHASE_REMOVE_ADS'
        }));
      };

      // Track page changes for interstitial ads
      let navigationCount = 0;
      const originalPushState = history.pushState;
      history.pushState = function() {
        originalPushState.apply(this, arguments);
        navigationCount++;
        if (navigationCount % 3 === 0) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PAGE_CHANGE'
          }));
        }
      };

      // Check ads status on load
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'CHECK_ADS_STATUS'
      }));

      // Listen for ads status from native
      window.addEventListener('message', function(event) {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ADS_STATUS') {
            window.adsRemoved = data.adsRemoved;
            // Dispatch custom event for the app
            window.dispatchEvent(new CustomEvent('adsStatusChanged', { 
              detail: { adsRemoved: data.adsRemoved }
            }));
          }
        } catch (e) {}
      });
    })();
    true;
  `;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6321" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <WebView
          ref={webViewRef}
          source={{ uri: 'https://christianappsfamily.github.io/ChristainDatingDosDonts/' }}
          style={styles.webview}
          onMessage={handleWebViewMessage}
          injectedJavaScript={injectedJavaScript}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webviewLoading}>
              <ActivityIndicator size="large" color="#FF6321" />
            </View>
          )}
        />
      </View>
      
      {/* Banner Ad at bottom */}
      {!adsRemoved && Platform.OS !== 'web' && (
        <View style={styles.bannerContainer}>
          <BannerAd
            unitId={BANNER_AD_UNIT_ID}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            onAdFailedToLoad={(error) => console.error('Banner ad error:', error)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  bannerContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
