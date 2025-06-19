// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAOZ43o6fpwSKLzLqCPvFK9dlPZH1lf8Cs',
  authDomain: 'products-webapi.firebaseapp.com',
  projectId: 'products-webapi',
  storageBucket: 'products-webapi.appspot.com',
  messagingSenderId: '783416815487',
  appId: '1:783416815487:web:e321268f039bcbd419744a',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
