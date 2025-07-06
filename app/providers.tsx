'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        appearance: {
            theme: 'light',
            accentColor: '#DEBF43',
            logo: "/logo.png"
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets'
        }
        }
      }}
    >
      {children}
    </PrivyProvider>
  );
}

    //   config={{
    //     // Customize Privy's appearance in your app
    //     appearance: {
    //       theme: 'dark',
    //       accentColor: '#676FFF',
    //       logo: 'https://your-logo-url',
    //     },