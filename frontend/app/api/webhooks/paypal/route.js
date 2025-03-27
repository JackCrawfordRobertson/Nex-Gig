import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log("PayPal webhook received:", body);
    
    const eventType = body.event_type;
    const resourceId = body.resource?.id;
    
    switch (eventType) {
      case "BILLING.SUBSCRIPTION.CREATED":
        console.log("Subscription created:", resourceId);
        break;
        
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await handleSubscriptionActivated(resourceId, body.resource);
        break;
        
      case "BILLING.SUBSCRIPTION.CANCELLED":
        await handleSubscriptionCancelled(resourceId);
        break;
        
      case "BILLING.SUBSCRIPTION.SUSPENDED":
        await handleSubscriptionSuspended(resourceId);
        break;
        
      case "PAYMENT.SALE.COMPLETED":
        console.log("Payment completed for subscription");
        break;
        
      default:
        console.log("Unhandled PayPal event type:", eventType);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing PayPal webhook:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleSubscriptionActivated(subscriptionId, resourceData) {
  try {
    const subscriptionsRef = collection(db, "subscriptions");
    const q = query(subscriptionsRef, where("subscriptionId", "==", subscriptionId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.error("No subscription found with ID:", subscriptionId);
      return;
    }
    
    const subscription = querySnapshot.docs[0];
    const userData = subscription.data();

    // Update subscription
    await updateDoc(subscription.ref, {
      status: "active",
      onTrial: false,
      trialEndedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    // Ensure user document exists and update
    if (userData.userId) {
      const userRef = doc(db, "users", userData.userId);
      await setDoc(userRef, {
        onTrial: false,
        subscriptionActive: true,
        trialEndedAt: new Date().toISOString(),
      }, { merge: true });
    }
    
    console.log("Subscription activated successfully:", subscriptionId);
  } catch (error) {
    console.error("Error handling subscription activation:", error);
  }
}

async function handleSubscriptionCancelled(subscriptionId) {
  try {
    // Find the subscription in our database
    const subscriptionsRef = collection(db, "subscriptions");
    const q = query(subscriptionsRef, where("subscriptionId", "==", subscriptionId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.error("No subscription found with ID:", subscriptionId);
      return;
    }
    
    // Update the subscription status
    const subscription = querySnapshot.docs[0];
    await updateDoc(subscription.ref, {
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    // Also update the user's subscription status
    const userData = subscription.data();
    if (userData.userId) {
      await updateDoc(doc(db, "users", userData.userId), {
        subscribed: false,
        subscriptionActive: false,
        onTrial: false,
        subscriptionCancelledAt: new Date().toISOString(),
      });
    }
    
    console.log("Subscription cancelled successfully:", subscriptionId);
  } catch (error) {
    console.error("Error handling subscription cancellation:", error);
  }
}

async function handleSubscriptionSuspended(subscriptionId) {
  try {
    // Find the subscription in our database
    const subscriptionsRef = collection(db, "subscriptions");
    const q = query(subscriptionsRef, where("subscriptionId", "==", subscriptionId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.error("No subscription found with ID:", subscriptionId);
      return;
    }
    
    // Update the subscription status
    const subscription = querySnapshot.docs[0];
    await updateDoc(subscription.ref, {
      status: "suspended",
      suspendedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    // Also update the user's subscription status
    const userData = subscription.data();
    if (userData.userId) {
      await updateDoc(doc(db, "users", userData.userId), {
        subscriptionActive: false,
        subscriptionSuspendedAt: new Date().toISOString(),
      });
    }
    
    console.log("Subscription suspended successfully:", subscriptionId);
  } catch (error) {
    console.error("Error handling subscription suspension:", error);
  }
}