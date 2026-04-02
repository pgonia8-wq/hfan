import { useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { useAuthStore } from "@/store/use-auth-store";
import { Button } from "@/components/ui/button";

export function AuthScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setUser } = useAuthStore();

  const handleConnect = async () => {
    setIsAuthenticating(true);
    setError(null);

    try {
      // 🔥 Obtener nonce del backend REAL
      const nonceRes = await fetch("/api/auth/nonce");
      if (!nonceRes.ok) throw new Error("Failed to get nonce");

      const { nonce } = await nonceRes.json();

      let finalPayload: any;

      if (MiniKit.isInstalled()) {
        const { finalPayload: fp } = await MiniKit.commandsAsync.walletAuth({
          nonce,
          requestId: "0",
          expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000),
          statement: "Sign in to H Fans",
        });

        if (fp.status !== "success") {
          throw new Error("Wallet auth cancelled");
        }

        finalPayload = fp;
      } else {
        // fallback dev
        finalPayload = {
          status: "success",
          address: "0x123",
          signature: "0xabc",
          message: `Nonce: ${nonce}`,
        };
      }

      // 🔥 Login contra backend
      const res = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      });

      if (!res.ok) throw new Error("Auth failed");

      const data = await res.json();
      setUser(data.user);

    } catch (e: any) {
      console.error("Auth error", e);
      setError(e?.message || "Authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">H Fans</h1>

        <Button onClick={handleConnect} disabled={isAuthenticating}>
          {isAuthenticating ? "Connecting..." : "Connect with World App"}
        </Button>

        {error && <p className="text-red-400">{error}</p>}
      </div>
    </div>
  );
}
