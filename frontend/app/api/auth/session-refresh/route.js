import { NextResponse } from "next/server";

export async function POST(req) {
  // This route's only purpose is to trigger a new request cycle
  // that will have the updated session from the database
  return NextResponse.redirect(new URL('/dashboard', req.url));
}