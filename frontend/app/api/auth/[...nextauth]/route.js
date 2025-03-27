// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth/next";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
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
            // Return the mock user data
            return { 
               id: "demo-user-id",
              email: mockUsers["demo-user-id"].email,
              name: `${mockUsers["demo-user-id"].firstName} ${mockUsers["demo-user-id"].lastName}`
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
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.email = token.email || session.user.email;
        session.user.name = token.name || session.user.name;
        
        try {
          // For development mode, use mock user data
          if (process.env.NODE_ENV === "development") {
            const mockUserData = mockUsers["demo-user-id"];
            session.user.subscribed = mockUserData.subscribed;
            session.user.onTrial = mockUserData.onTrial;
            return session;
          }
          
          // Production - get real data from Firestore
          const userDoc = await getDoc(doc(db, "users", token.sub));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            session.user.subscribed = userData.subscribed || false;
            session.user.onTrial = userData.onTrial || false;
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      
      return session;
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