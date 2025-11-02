export function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).PaystackPop) {
      resolve()
      return
    }

    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v1/inline.js"
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load Paystack"))
    document.head.appendChild(script)
  })
}
