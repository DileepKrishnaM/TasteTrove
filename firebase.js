// firebase.js - Firebase configuration and utility functions

// Import the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFof5rBA7f3emBwqboDIc7yfKxSP5Wd8Q",
  authDomain: "tastetrove-3c59e.firebaseapp.com",
  projectId: "tastetrove-3c59e",
  storageBucket: "tastetrove-3c59e.firebasestorage.app",
  messagingSenderId: "707396441293",
  appId: "1:707396441293:web:8010b2072a532a18f24584"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication functions
export const registerUser = async (email, password, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Add user info to Firestore
    await addDoc(collection(db, "users"), {
      uid: userCredential.user.uid,
      username: username,
      email: email,
      createdAt: new Date().toISOString()
    });
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const getUserInfo = async (uid) => {
  try {
    const userQuery = query(collection(db, "users"), where("uid", "==", uid));
    const querySnapshot = await getDocs(userQuery);
    if (!querySnapshot.empty) {
      return { success: true, data: querySnapshot.docs[0].data() };
    }
    return { success: false, error: "User not found" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Recipe functions
export const getAllRecipes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "recipes"));
    const recipes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: recipes };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getRecipeById = async (recipeId) => {
  try {
    const docRef = doc(db, "recipes", recipeId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: "Recipe not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const addRecipe = async (recipeData) => {
  try {
    const docRef = await addDoc(collection(db, "recipes"), recipeData);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default { 
  auth, 
  db, 
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser, 
  getUserInfo,
  getAllRecipes,
  getRecipeById,
  addRecipe
};