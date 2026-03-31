import { useEffect, useState } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

const APP_ID = 'app_ccf542f4e61d9faa92be78b5154299b4';

export function MiniKitProvider({ children }: { children: React.ReactNode }) {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    console.log("MiniKit init", APP_ID);
    MiniKit.install(APP_ID);
    
    const timer = setTimeout(() => {
      setIsInstalled(MiniKit.isInstalled());
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return <>{children}</>;
}
