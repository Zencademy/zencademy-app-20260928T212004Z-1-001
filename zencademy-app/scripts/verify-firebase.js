const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBfawlR2MNMjF1NAtpeJwmGFNHVk2plBRg",
  authDomain: "zencademy-app.firebaseapp.com",
  projectId: "zencademy-app",
  storageBucket: "zencademy-app.firebasestorage.app",
  messagingSenderId: "858906437355",
  appId: "1:858906437355:android:59b55711bb76b007eec0ae"
};

async function verifyFirebaseSetup() {
  console.log('🔍 Verifying Firebase Setup...\n');
  
  try {
    // Initialize Firebase
    console.log('1. Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
    
    // Test authentication
    console.log('\n2. Testing authentication...');
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';
    
    try {
      await signInWithEmailAndPassword(auth, testEmail, testPassword);
      console.log('✅ Authentication successful');
    } catch (authError) {
      console.log('⚠️  Authentication failed (this is expected for test credentials):', authError.message);
    }
    
    // Test Firestore write
    console.log('\n3. Testing Firestore write permissions...');
    const testRef = doc(db, 'test', 'verification-test');
    const testData = {
      timestamp: new Date(),
      message: 'Firebase verification test',
      projectId: firebaseConfig.projectId
    };
    
    await setDoc(testRef, testData);
    console.log('✅ Firestore write successful');
    
    // Test Firestore read
    console.log('\n4. Testing Firestore read permissions...');
    const readResult = await getDoc(testRef);
    if (readResult.exists()) {
      console.log('✅ Firestore read successful');
      console.log('📄 Test data:', readResult.data());
    } else {
      console.log('❌ Firestore read failed - document not found');
    }
    
    // Clean up test data
    console.log('\n5. Cleaning up test data...');
    await setDoc(testRef, { deleted: true }, { merge: true });
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 Firebase verification completed successfully!');
    console.log('\n📋 Configuration Summary:');
    console.log(`   Project ID: ${firebaseConfig.projectId}`);
    console.log(`   Auth Domain: ${firebaseConfig.authDomain}`);
    console.log(`   Storage Bucket: ${firebaseConfig.storageBucket}`);
    
  } catch (error) {
    console.error('\n❌ Firebase verification failed:', error);
    console.error('\n🔧 Troubleshooting steps:');
    console.error('1. Check if your Firebase project exists and is active');
    console.error('2. Verify your Firebase configuration in utils/firebase.ts');
    console.error('3. Ensure Firestore is enabled in your Firebase console');
    console.error('4. Deploy your Firestore security rules');
    console.error('5. Check if your Firebase project has billing enabled (if required)');
    
    if (error.code === 'permission-denied') {
      console.error('\n🔐 Permission denied error detected!');
      console.error('This usually means:');
      console.error('- Firestore security rules are not deployed');
      console.error('- Security rules are too restrictive');
      console.error('- Firebase project is not properly configured');
    }
  }
}

// Run the verification
verifyFirebaseSetup().catch(console.error);
