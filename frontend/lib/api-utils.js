// lib/api-utils.js
import { NextResponse } from "next/server";

export async function protectedApiRoute(handler) {
  return async (req) => {
    try {
      // Check if we're in development mode
      if (process.env.NODE_ENV === "development") {
        // Import mock session
        const { mockSession } = await import("@/app/mock/users");
        // Execute the handler with the mock session
        return await handler(req, mockSession);
      }

      // In production, get the user from the session
      const { getServerSession } = await import("next-auth");
      const { authOptions } = await import("@/app/api/auth/[...nextauth]/route");
      const session = await getServerSession(authOptions);

      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Execute the handler with the real session
      return await handler(req, session);
    } catch (error) {
      console.error("API route error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}