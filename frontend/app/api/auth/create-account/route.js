// app/api/auth/create-account/route.js
import { NextResponse } from "next/server";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export async function POST(request) {
  try {
    const data = await request.json();
    const { 
      email, password, firstName, lastName, address,
      profilePicture, jobTitles, jobLocations, userIP, deviceFingerprint
    } = data;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth, email, password
    );
    const user = userCredential.user;

    // Store user data in Firestore
    const userData = {
      email,
      firstName,
      lastName,
      address: address || {},
      profilePicture,
      jobTitles: jobTitles || [],
      jobLocations: jobLocations || [],
      subscribed: false,
      profileVisibility: "private",
      marketingConsent: false,
      createdAt: new Date().toISOString(),
      userIP,
      deviceFingerprint,
    };

    await setDoc(doc(db, "users", user.uid), userData);

    return NextResponse.json({ 
      success: true, 
      userId: user.uid,
      email: user.email
    });
  } catch (error) {
    console.error("Account creation error:", error);
    
    // Format the error message appropriately
    let errorMessage = "Failed to create account";
    let statusCode = 500;
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "Email already in use. Please try a different email or log in.";
      statusCode = 409;
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Invalid email format.";
      statusCode = 400;
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Password is too weak. Please use a stronger password.";
      statusCode = 400;
    }
    
    return NextResponse.json(
      { error: errorMessage, code: error.code },
      { status: statusCode }
    );
  }
}