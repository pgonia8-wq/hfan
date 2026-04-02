import { useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { useWalletAuth, customFetch } from "@workspace/api-client-react";
import { useAuthStore } from "@/store/use-auth-store";
import { Button } from "@/components/ui/button";
import { Loader2, Fingerprint, ShieldCheck, Coins, Lock } from "lucide-react";
import { motion } from "framer-motion";

export function AuthScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const walletAuthMutation = useWalletAuth();
  const { setUser } = useAuthStore();

  const handleConnect = async () => {
    setIsAuthenticating(true);
    setError(null);

    try {
      // ✅ AHORA USA customFetch (respeta baseUrl)
      const { nonce } = await customFetch<{ nonce: string }>("/api/auth/nonce");

      let finalPayload: any;

      if (MiniKit.isInstalled()) {
        const { finalPayload: fp } = await MiniKit.commandsAsync.walletAuth({
          nonce,
          requestId: "0",
          expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000),
          statement: "Sign in to H Fans — the premier Web3 creator platform.",
        });

        if (fp.status !== "success") throw new Error("Wallet auth cancelled");
        finalPayload = fp;
      } else {
        // fallback dev
        await new Promise(r => setTimeout(r, 1200));

        const mockAddr = `0x${Array.from({ length: 40 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("")}`;

        finalPayload = {
          status: "success",
          message: `hfans.app wants you to sign in with your Ethereum account:\n${mockAddr}\n\nSign in to H Fans\n\nURI: https://hfans.app\nVersion: 1\nChain ID: 480\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`,
          signature: "0x" + "a".repeat(130),
          address: mockAddr,
        };
      }

      const res = await walletAuthMutation.mutateAsync({
        data: { payload: finalPayload, nonce }
      });

      setUser((res as any).user);

    } catch (e: any) {
      console.error("Auth error", e);
      setError(e?.message || "Authentication failed. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center relative overflow-hidden bg-black text-white">
      <img
        src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/30" />

      <div className="z-10 w-full max-w-sm px-6 flex flex-col items-center text-center">
        <motion.img
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
          src={`${import.meta.env.BASE_URL}images/logo.png`}
          alt="H Fans Logo"
          className="w-24 h-24 mb-6"
        />

        <h1 className="text-4xl font-bold mb-2">
          H <span className="text-primary">Fans</span>
        </h1>

        <p className="text-white/60 mb-8 text-sm">
          Premium exclusive content.
        </p>

        <Button onClick={handleConnect} disabled={isAuthenticating}>
          {isAuthenticating ? "Connecting..." : "Connect with World App"}
        </Button>

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
}
