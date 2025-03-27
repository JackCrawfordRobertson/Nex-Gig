import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// Whitelist of allowed production email domains or specific emails
const ALLOWED_PRODUCTION_EMAILS = [
  'jack@ya-ya.co.uk',
  // Add other trusted email domains or specific emails
  // Example: '@yourcompany.com'
];

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Completely disable any mock/test user authentication in production
        if (process.env.NODE_ENV === "production") {
          // Additional domain/email validation for production
          if (!credentials?.email || 
              !ALLOWED_PRODUCTION_EMAILS.some(allowedEmail => 
                credentials.email.toLowerCase() === allowedEmail.toLowerCase() ||
                credentials.email.toLowerCase().endsWith(`@${allowedEmail.split('@')[1]}`)
              )
          ) {
            console.error("Unauthorized production login attempt:", credentials?.email);
            return null;
          }
        }
        
        // For development mode with mock data - ONLY when explicitly provided
        if (process.env.NODE_ENV === "development" && 
            credentials && 
            credentials.email === "alice@example.com" && 
            credentials.password === "password") {
          return { id: "demo-user-id", email: "alice@example.com" };
        }
        
        // Validate credentials
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }
        
        // Regular authentication path
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );
          
          // Additional production security check
          if (process.env.NODE_ENV === "production") {
            const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
            
            if (!userDoc.exists() || !userDoc.data().subscribed) {
              console.error("Unauthorized production access attempt");
              return null;
            }
          }
          
          return { 
            id: userCredential.user.uid, 
            email: userCredential.user.email 
          };
        } catch (error) {
          console.error("Firebase Auth Error:", error);
          return null; // Changed from throw to return null for better error handling
        }
      },
    }),
  ],
  
  callbacks: {
    async session({ session, token }) {
      // Prevent session creation for unauthorized users in production
      if (process.env.NODE_ENV === "production") {
        if (!ALLOWED_PRODUCTION_EMAILS.some(allowedEmail => 
          session.user.email?.toLowerCase() === allowedEmail.toLowerCase() ||
          session.user.email?.toLowerCase().endsWith(`@${allowedEmail.split('@')[1]}`)
        )) {
          return null;
        }
      }

      session.user.id = token.sub;
      
      // Fetch subscription information from Firestore
      try {
        const userDoc = await getDoc(doc(db, "users", token.sub));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Only allow access to subscribed users in production
          if (process.env.NODE_ENV === "production" && !userData.subscribed) {
            return null;
          }
          
          // Add user profile data to the session
          session.user.firstName = userData.firstName || '';
          
          // Add subscription data to the session
          session.user.subscribed = userData.subscribed || false;
          session.user.onTrial = userData.onTrial || false;
          session.user.subscriptionPlan = userData.subscriptionPlan;
          session.user.subscriptionId = userData.subscriptionId;
          session.user.subscriptionActive = userData.subscriptionActive || false;
          
          // Add trial information if relevant
          if (userData.trialEndDate) {
            session.user.trialEndDate = userData.trialEndDate;
            
            // Calculate if trial is still active based on the end date
            const trialEndDate = new Date(userData.trialEndDate);
            const now = new Date();
            session.user.trialActive = trialEndDate > now;
          }
        }
      } catch (error) {
        console.error("Error fetching user subscription data:", error);
        return null; // Deny session if user data can't be retrieved
      }
      
      return session;
    },
    
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };