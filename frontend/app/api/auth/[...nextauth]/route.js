import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase"; // ✅ Ensure Firestore is imported
import { doc, getDoc, setDoc } from "firebase/firestore";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );
          return { id: userCredential.user.uid, email: userCredential.user.email };
        } catch (error) {
          console.error("Firebase Auth Error:", error);
          throw new Error("Invalid credentials.");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        const userRef = doc(db, "users", user.email);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // ✅ If user does not exist, register them in Firestore
          await setDoc(userRef, {
            name: user.name,
            email: user.email,
            profilePicture: user.image || "/default-avatar.png",
            address: {},
            jobTitles: [],
            jobLocations: [],
            subscribed: false,
          });
        }
      }
      return true;
    },

    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };