import NextAuth from "next-auth/next";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import CredentialsProvider from "next-auth/providers/credentials";
import mockUsers from "@/app/mock/users";

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
            return { 
              id: "demo-user-id",
              email: mockUser.email,
              name: `${mockUser.firstName} ${mockUser.lastName}`
            };
          }
          
          // Production mode - use actual Firebase auth
          const userCredential = await signInWithEmailAndPassword(
            auth, 
            credentials.email, 
            credentials.password
          );
          
          return { 
            id: userCredential.user.uid, 
            email: userCredential.user.email,
            name: userCredential.user.displayName || credentials.email.split('@')[0]
          };
        } catch (error) {
          console.error("Auth error:", error.message);
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
    async jwt({ token, user }) {
      // Initial sign-in or user update
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      
      try {
        // For non-development environments, fetch the most up-to-date user data
        if (process.env.NODE_ENV !== "development" && token.sub) {
          const userDoc = await getDoc(doc(db, "users", token.sub));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Update token with the latest user data
            token.subscribed = userData.subscribed || false;
            token.onTrial = userData.onTrial || false;
            token.subscriptionId = userData.subscriptionId;
            token.subscriptionStartDate = userData.subscriptionStartDate;
            token.trialEndDate = userData.trialEndDate;
          }
        }
      } catch (error) {
        console.error("Error updating token:", error);
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
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
        
        // For development, use mock user data
        if (process.env.NODE_ENV === "development") {
          const mockUser = mockUsers["demo-user-id"];
          session.user.subscribed = mockUser.subscribed;
          session.user.onTrial = mockUser.onTrial;
        }
      }
      
      return session;
    }
  },
  events: {
    async signIn(message) {
      // Optional: Additional actions on sign-in
      if (message.user.id && process.env.NODE_ENV !== "development") {
        try {
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
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET || "development-secret",
};

// Create the handler
const handler = NextAuth(authOptions);

// Export the handler functions
export { handler as GET, handler as POST };