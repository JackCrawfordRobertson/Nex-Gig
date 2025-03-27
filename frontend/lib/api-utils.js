import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { isDevelopment, mockSession } from "./environment";

export async function protectedApiRoute(handler) {
  return async (req) => {
    // In development, use mock session
    if (isDevelopment) {
      return handler(req, mockSession);
    }

    // Production: use actual session
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(req, session);
  };
}