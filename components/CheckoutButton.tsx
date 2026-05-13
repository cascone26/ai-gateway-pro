"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

export default function CheckoutButton() {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
        }),
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Loading..." : "Upgrade Now"}
    </button>
  );
}
