import Constants from 'expo-constants';
import { initializeApp,firebase} from 'firebase/app';
import { getAnalytics, isSupported} from 'firebase/analytics';
//import '@react-native-firebase/firestore';


// Ensure that Constants.expoConfig.extra is properly accessed
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: Constants.expoConfig?.extra?.firebaseAppId,
  measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId,
};

// Log the configuration to debug any issues
console.log(Constants.expoConfig.extra);

// Initialize Firebase
const app = initializeApp(firebaseConfig);


const initFirebaseAnalytics = async () => {
  const supported = await isSupported();
  if (supported) {
    const analytics = getAnalytics(app);
  }
};

initFirebaseAnalytics();

// Initialize Firestore


export {app, firebaseConfig};

