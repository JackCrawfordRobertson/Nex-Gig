import { ALLOWED_PRODUCTION_EMAILS } from '@/lib/environment';

export const authOptions = {
  // ... existing configuration
  callbacks: {
    async session({ session, token }) {
      // Add subscription status to session
      const userDoc = await getDoc(doc(db, "users", token.sub));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Add subscription information to session
        session.user.subscribed = userData.subscribed || false;
        session.user.onTrial = userData.onTrial || false;
      }
      
      return session;
    }
  }
};