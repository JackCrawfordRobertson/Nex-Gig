// api/auth/[...nextauth]/route.js

import NextAuth from "next-auth/next";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import CredentialsProvider from "next-auth/providers/credentials";
import mockUsers from "@/app/mock/users";
import crypto from 'crypto';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        
        try {
          // For development mode, use the mock user
          if (process.env.NODE_ENV === "development") {
            const mockUser = mockUsers["demo-user-id"];
            console.log("Development mode: Using mock user for authentication");
            return { 
              id: "demo-user-id",
              email: mockUser.email,
              name: `${mockUser.firstName} ${mockUser.lastName}`
            };
          }
          
          // Production mode - use actual Firebase auth
          try {
            console.log("Attempting Firebase authentication for email:", credentials.email);
            const userCredential = await signInWithEmailAndPassword(
              auth, 
              credentials.email, 
              credentials.password
            );
            
            console.log("Firebase authentication successful, user ID:", userCredential.user.uid);
            return { 
              id: userCredential.user.uid, 
              email: userCredential.user.email,
              name: userCredential.user.displayName || credentials.email.split('@')[0]
            };
          } catch (firebaseError) {
            console.error("Firebase authentication error:", firebaseError.code, firebaseError.message);
            throw new Error(`Firebase authentication failed: ${firebaseError.message}`);
          }
        } catch (error) {
          console.error("Authorization error:", error.message);
          // Return null instead of throwing to prevent NextAuth from breaking
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign-in or user update
      if (user) {
        console.log("JWT callback: User data received, updating token");
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      
      try {
        // Update token on every refresh or if it's a new sign-in
        if ((trigger === "update" || user) && process.env.NODE_ENV !== "development" && token.sub) {
          console.log("JWT callback: Fetching latest user data from Firestore");
          const userDoc = await getDoc(doc(db, "users", token.sub));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("JWT callback: User data found in Firestore");
            
            // Update token with the latest user data
            token.subscribed = userData.subscribed || false;
            token.onTrial = userData.onTrial || false;
            token.subscriptionId = userData.subscriptionId;
            token.subscriptionStartDate = userData.subscriptionStartDate;
            token.trialEndDate = userData.trialEndDate;
            
            // Add these new fields
            token.firstName = userData.firstName;
            token.lastName = userData.lastName;
            token.profilePicture = userData.profilePicture;
            
            // Log subscription status for debugging
            console.log("JWT callback: Token updated with subscription status:", {
              subscribed: token.subscribed,
              onTrial: token.onTrial,
              subscriptionId: token.subscriptionId
            });
          } else {
            console.warn("JWT callback: User document not found in Firestore");
          }
        }
      } catch (error) {
        console.error("Error updating token:", error);
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        console.log("Session callback: Updating session with token data");
        
        // Always update session with the latest token data
        session.user.id = token.sub;
        session.user.email = token.email || session.user.email;
        session.user.name = token.name || session.user.name;
        
        // Add subscription-related information
        session.user.subscribed = token.subscribed || false;
        session.user.onTrial = token.onTrial || false;
        session.user.subscriptionId = token.subscriptionId;
        session.user.subscriptionStartDate = token.subscriptionStartDate;
        session.user.trialEndDate = token.trialEndDate;
        
        // Add new user fields
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.profilePicture = token.profilePicture;
        
        // For development, use mock user data
        if (process.env.NODE_ENV === "development") {
          console.log("Session callback: Using mock user data in development mode");
          const mockUser = mockUsers["demo-user-id"];
          session.user.subscribed = mockUser.subscribed;
          session.user.onTrial = mockUser.onTrial;
          session.user.firstName = mockUser.firstName;
          session.user.lastName = mockUser.lastName;
          session.user.profilePicture = mockUser.profilePicture;
        }
        
        // Log session for debugging
        console.log("Session callback: Updated session:", {
          id: session.user.id,
          email: session.user.email,
          subscribed: session.user.subscribed,
          onTrial: session.user.onTrial
        });
      }
      
      return session;
    }
  },
  events: {
    async signIn(message) {
      // Optional: Additional actions on sign-in
      if (message.user.id && process.env.NODE_ENV !== "development") {
        try {
          console.log("SignIn event: Updating last login timestamp for user:", message.user.id);
          const userRef = doc(db, "users", message.user.id);
          await updateDoc(userRef, {
            lastLogin: new Date().toISOString()
          });
        } catch (error) {
          console.error("Error updating last login:", error);
        }
      }
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  // Netlify-specific configurations
  basePath: '/api/auth',
  csrf: {
    verifyToken: process.env.NODE_ENV !== 'development'
  },
  
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET || crypto.randomUUID(),
};

// Create the handler
const handler = NextAuth(authOptions);

// Export the handler functions
export { handler as GET, handler as POST };