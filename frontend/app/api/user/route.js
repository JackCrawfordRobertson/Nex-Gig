import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { protectedApiRoute } from "@/lib/api-utils";

export const GET = protectedApiRoute(async (req, session) => {
  const userId = session.user.id;
  const userDoc = await getDoc(doc(db, "users", userId));
  
  return new Response(
    JSON.stringify(userDoc.data() || {}), 
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
});