// src/lib/firebase-mock.js
import mockUsers from "@/app/mock/users";

// Mock Firestore functions
export const getDoc = async (docRef) => {
  const userId = docRef._path.segments[1];
  const userData = mockUsers[userId];
  
  return {
    exists: () => !!userData,
    data: () => userData,
    id: userId
  };
};

export const setDoc = async (docRef, data, options = {}) => {
  const userId = docRef._path.segments[1];
  
  if (options.merge) {
    mockUsers[userId] = {
      ...mockUsers[userId],
      ...data
    };
  } else {
    mockUsers[userId] = data;
  }
  
  console.log("Mock setDoc called with:", { userId, data });
  return Promise.resolve();
};

export const doc = (db, collection, id) => {
  return {
    _path: {
      segments: [collection, id]
    }
  };
};

// Add this mock auth function to return null for currentUser
export const getAuth = () => {
  return {
    currentUser: null,
    signInWithEmailAndPassword: async (email, password) => {
      // Only simulate login for explicit credentials
      const matchedUser = Object.entries(mockUsers).find(
        ([id, user]) => user.email === email && password === "password"
      );
      
      if (matchedUser) {
        const [id, userData] = matchedUser;
        return {
          user: {
            uid: id,
            email: userData.email
          }
        };
      }
      
      throw new Error("Invalid credentials");
    }
  };
};