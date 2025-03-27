// app/api/user/route.js
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";
import mockUsers from "@/app/mock/users";

export async function GET(req) {
  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV === "development") {
      // In development, return the mock user data
      const mockUserData = mockUsers["demo-user-id"];
      return NextResponse.json(mockUserData || {});
    }

    // In production, get the user from the session
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/app/api/auth/[...nextauth]/route");
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user data from Firestore
    const userId = session.user.id;
    const userDoc = await getDoc(doc(db, "users", userId));
    
    // Return the user data
    return NextResponse.json(userDoc.exists() ? userDoc.data() : {});
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" }, 
      { status: 500 }
    );
  }
}