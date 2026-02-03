
import { GoogleGenAI, Type } from "@google/genai";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  onSnapshot,
  limit,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCMqmN36CPWc5TePfCzXTfuZGlJz90gpY8",
  authDomain: "bazaar-1c7e8.firebaseapp.com",
  projectId: "bazaar-1c7e8",
  storageBucket: "bazaar-1c7e8.firebasestorage.app",
  messagingSenderId: "162360142442",
  appId: "1:162360142442:web:615845038d886f1eb3f813",
  measurementId: "G-HP0H1DBKJC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- User Auth ---
export const loginUser = async (email: string, pass: string, rememberMe: boolean = true) => {
  try {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return { status: 'success', user: { email: userCredential.user.email, displayName: userCredential.user.displayName } };
  } catch (error: any) {
    return { status: 'error', message: "Email or password incorrect." };
  }
};

export const registerUser = async (email: string, pass: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      name: name,
      email: email,
      createdAt: serverTimestamp()
    });
    return { status: 'success', user: { email: userCredential.user.email, displayName: name } };
  } catch (error: any) {
    return { status: 'error', message: "Registration failed." };
  }
};

export const logoutUser = () => signOut(auth);

// --- Product Data ---
export const saveProductToDB = async (p: any) => { 
  const cleanData = { ...p, createdAt: serverTimestamp(), rating: 0, reviewsCount: 0 };
  const docRef = await addDoc(collection(db, "products"), cleanData); 
  return docRef.id; 
};

export const deleteProductFromDB = async (productId: string) => { 
  await deleteDoc(doc(db, "products", productId)); 
};

// --- Real-time Chat Logic ---
export const getOrCreateChat = async (productId: string, productTitle: string, productImage: string, buyerEmail: string, sellerEmail: string, sellerName: string, buyerName: string) => {
  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, 
    where("productId", "==", productId),
    where("participants", "array-contains", buyerEmail)
  );
  
  const querySnapshot = await getDocs(q);
  let existingChat = querySnapshot.docs.find(doc => doc.data().participants.includes(sellerEmail));
  
  if (existingChat) {
    return existingChat.id;
  }

  const newChat = {
    productId,
    productTitle,
    productImage,
    sellerName,
    buyerName,
    participants: [buyerEmail, sellerEmail],
    lastMessage: "Bazaar: المحادثة بدأت.",
    lastMessageTimestamp: serverTimestamp(),
    unreadBy: [sellerEmail]
  };
  
  const docRef = await addDoc(chatsRef, newChat);
  
  await addDoc(collection(db, "chats", docRef.id, "messages"), {
    sender: "system",
    text: "نظام بازار: هذه المحادثة مراقبة لضمان الأمان.",
    timestamp: serverTimestamp(),
    status: 'sent'
  });

  return docRef.id;
};

export const sendChatMessage = async (chatId: string, senderEmail: string, text: string, recipientEmail: string) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  await addDoc(messagesRef, {
    sender: senderEmail,
    text,
    timestamp: serverTimestamp(),
    status: 'sent'
  });

  const chatDoc = doc(db, "chats", chatId);
  await updateDoc(chatDoc, {
    lastMessage: text,
    lastMessageTimestamp: serverTimestamp(),
    unreadBy: [recipientEmail]
  });
};

export const subscribeToUserChats = (userEmail: string, callback: (chats: any[]) => void) => {
  const q = query(
    collection(db, "chats"), 
    where("participants", "array-contains", userEmail)
  );
  
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      unread: doc.data().unreadBy?.includes(userEmail)
    }));

    chats.sort((a: any, b: any) => {
      const timeA = a.lastMessageTimestamp?.toMillis ? a.lastMessageTimestamp.toMillis() : 0;
      const timeB = b.lastMessageTimestamp?.toMillis ? b.lastMessageTimestamp.toMillis() : 0;
      return timeB - timeA;
    });

    callback(chats);
  });
};

export const subscribeToMessages = (chatId: string, callback: (messages: any[]) => void) => {
  const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    }));
    callback(messages);
  });
};

export const markChatAsRead = async (chatId: string, userEmail: string) => {
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);
  if (chatSnap.exists()) {
    const unreadBy = chatSnap.data().unreadBy || [];
    if (unreadBy.includes(userEmail)) {
      await updateDoc(chatRef, {
        unreadBy: unreadBy.filter((email: string) => email !== userEmail)
      });
    }
  }
};

// --- AI Services ---
export const identifyProductFromImage = async (base64Image: string): Promise<any> => {
  try {
    const ai = getAI();
    const data = base64Image.split(',')[1] || base64Image;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [
        { text: "Analyze image for marketplace listing. JSON: title, category, description." }, 
        { inlineData: { mimeType: "image/jpeg", data } }
      ] }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || 'null');
  } catch (error) { return null; }
};

export const analyzeImageSafety = async (base64Image: string): Promise<{ isSafe: boolean }> => {
  try {
    const ai = getAI();
    const data = base64Image.split(',')[1] || base64Image;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [
        { text: "Is this image safe? {isSafe: boolean}" }, 
        { inlineData: { mimeType: "image/jpeg", data } }
      ] }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{"isSafe": true}');
  } catch (error) { return { isSafe: true }; }
};

export const getUserUploadCountToday = async (email: string): Promise<number> => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startTimestamp = Timestamp.fromDate(startOfToday);
    const q = query(collection(db, "products"), where("sellerEmail", "==", email));
    const snapshot = await getDocs(q);
    return snapshot.docs.filter(doc => {
      const data = doc.data();
      const createdAt = data.createdAt as Timestamp;
      return createdAt && createdAt.seconds >= startTimestamp.seconds;
    }).length;
  } catch (e) { return 0; }
};

// --- Rating & Review Services ---
export const addProductReview = async (productId: string, rating: number, userName: string, comment: string): Promise<boolean> => {
  try {
    const productRef = doc(db, "products", productId);
    
    await runTransaction(db, async (transaction) => {
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists()) throw "Product does not exist!";

      const currentRating = productDoc.data().rating || 0;
      const currentReviewsCount = productDoc.data().reviewsCount || 0;
      const sellerName = productDoc.data().sellerName || 'Unknown';

      const newReviewsCount = currentReviewsCount + 1;
      const newAverageRating = ((currentRating * currentReviewsCount) + rating) / newReviewsCount;

      const reviewRef = doc(collection(db, "product_comments"));
      transaction.set(reviewRef, {
        productId,
        sellerName,
        rating,
        userName,
        comment,
        timestamp: serverTimestamp()
      });

      transaction.update(productRef, {
        rating: Number(newAverageRating.toFixed(1)),
        reviewsCount: newReviewsCount
      });
    });

    return true;
  } catch (e) { 
    console.error("Failed to add review:", e);
    return false; 
  }
};

export const getProductReviews = async (productId: string): Promise<any[]> => {
  try {
    // FIX: Removing ORDER BY from query to avoid composite index requirement. 
    // We sort programmatically in memory.
    const q = query(
      collection(db, "product_comments"), 
      where("productId", "==", productId)
    );
    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(), 
      timestamp: doc.data().timestamp?.toDate() || new Date() 
    }));
    
    // Client-side sort to fix index issue
    return reviews.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (e) { 
    console.error("Error fetching reviews:", e);
    return []; 
  }
};

export const getSellerStats = async (sellerName: string): Promise<any> => {
  try {
    const q = query(collection(db, "product_comments"), where("sellerName", "==", sellerName));
    const snapshot = await getDocs(q);
    const ratings = snapshot.docs.map(d => d.data().rating as number);
    const count = ratings.length;
    const avg = count > 0 ? (ratings.reduce((a, b) => a + b, 0) / count) : 0;
    return { rating: Number(avg.toFixed(1)), reviewsCount: count, joinedDate: "Feb 2024" };
  } catch (e) {
    return { rating: 0, reviewsCount: 0, joinedDate: "Feb 2024" };
  }
};

export const negotiatePrice = async (productTitle: string, originalPrice: number, offeredPrice: number): Promise<any> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Negotiate ${productTitle} ($${originalPrice}). Buyer offered $${offeredPrice}. JSON {status: 'accepted'|'counter'|'rejected', message: string}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) { return { status: 'error', message: 'Communication error.' }; }
};

export const generateProductDescription = async (title: string, category: string, currentDesc: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Rewrite this description for ${title} (${category}). Current: ${currentDesc}. ONLY description text.`,
    });
    return response.text || currentDesc;
  } catch (error) { return currentDesc; }
};

export const markNotificationAsRead = async (id: string) => { 
  await updateDoc(doc(db, "notifications", id), { isRead: true }); 
};
