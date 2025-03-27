import mockUsers from "@/app/mock/users";

// Add a mock storage for profile pictures
const mockStorage = {};

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

export const updateDoc = async (docRef, data) => {
  const userId = docRef._path.segments[1];
  
  if (mockUsers[userId]) {
    mockUsers[userId] = {
      ...mockUsers[userId],
      ...data
    };
    console.log("Mock updateDoc called with:", { userId, data });
    console.log("Updated mock user:", mockUsers[userId]);
  } else {
    console.error("Mock user not found:", userId);
  }
  
  return Promise.resolve();
};

export const doc = (db, collection, id) => {
  // Return an object that more closely resembles a real DocumentReference
  return {
    _path: {
      segments: [collection, id]
    },
    id: id,
    parent: {
      id: collection
    },
    // Add any other properties needed to simulate a DocumentReference
    firestore: db
  };
};

// Mock storage functions
export const getStorage = () => {
  return { _isMock: true };
};

export const ref = (storage, path) => {
  return {
    _path: path,
    fullPath: path,
    name: path.split('/').pop(),
    bucket: "mock-bucket"
  };
};

export const uploadBytes = async (storageRef, file) => {
  const path = storageRef._path;
  // Create a mock file URL
  const mockUrl = `https://mock-storage.example.com/${path}`;
  mockStorage[path] = {
    url: mockUrl,
    metadata: {
      name: file.name,
      contentType: file.type,
      size: file.size,
      timeCreated: new Date().toISOString()
    }
  };
  
  console.log("Mock uploadBytes: File stored at", path);
  return Promise.resolve({
    ref: storageRef,
    metadata: {
      fullPath: path,
      name: file.name,
      contentType: file.type
    }
  });
};

export const getDownloadURL = async (storageRef) => {
  const path = storageRef._path;
  if (mockStorage[path]) {
    console.log("Mock getDownloadURL: Returning URL for", path);
    return Promise.resolve(mockStorage[path].url);
  }
  
  // Return a fallback URL if not found
  console.log("Mock getDownloadURL: No file found, returning default URL");
  return Promise.resolve(`https://mock-storage.example.com/default-${Date.now()}`);
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