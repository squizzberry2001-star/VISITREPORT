// Firebase configuration for Bestie Visit
// Ganti nilai-nilai di bawah ini dengan konfigurasi dari Firebase Console Anda (Project Settings > General > Your apps)
window.RB_FIREBASE_CONFIG = {
  enabled: true,
  firebaseConfig: {
    apiKey: "ISI_API_KEY_ANDA_DI_SINI",
    authDomain: "PROJECT_ID.firebaseapp.com",
    projectId: "PROJECT_ID",
    storageBucket: "PROJECT_ID.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
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
