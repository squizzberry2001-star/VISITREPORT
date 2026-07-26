// Firebase configuration for Bestie Visit
window.RB_FIREBASE_CONFIG = {
  enabled: true,
  firebaseConfig: {
    apiKey: "AIzaSyDJRe7Rfgtev2Wvm25q6ol1I-EC_dCbc4c",
    authDomain: "visit-bestie.firebaseapp.com",
    projectId: "visit-bestie",
    storageBucket: "visit-bestie.firebasestorage.app",
    messagingSenderId: "406727156945",
    appId: "1:406727156945:web:20a690f986468fa3dcd1f0",
    measurementId: "G-W8L7D8TMJJ"
  },

  // Collections mapping
  collections: {
    visits: 'monitor_visits',
    manualRequests: 'monitor_manualRequests',
    presence: 'monitor_presence',
    appSettings: 'appSettings',
    masterStores: 'masterStores',
    deviceBackups: 'deviceBackups'
  }
};
