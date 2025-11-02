export async function initializePayment(email: string, amount: number, reference: string, workOrderId: string) {
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100), // Paystack uses cents
      reference,
      metadata: {
        workOrderId,
      },
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to initialize payment")
  }

  return response.json()
}

export async function verifyPayment(reference: string) {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to verify payment")
  }

  return response.json()
}
