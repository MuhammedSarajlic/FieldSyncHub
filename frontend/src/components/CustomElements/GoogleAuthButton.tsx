import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

interface IGoogleAuthButton {
  onCredential: (idToken: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}

const GoogleAuthButton = ({
  onCredential,
  text = 'continue_with',
}: IGoogleAuthButton) => {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !buttonRef.current) return;

    const renderButton = () => {
      if (!window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: { credential: string }) =>
          onCredential(response.credential),
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        width: 350,
        text,
      });
    };

    if (window.google) {
      renderButton();
      return;
    }

    const existingScript = document.getElementById('google-identity-script');
    if (existingScript) {
      existingScript.addEventListener('load', renderButton);
      return () => existingScript.removeEventListener('load', renderButton);
    }

    const script = document.createElement('script');
    script.id = 'google-identity-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    document.body.appendChild(script);
  }, [onCredential, text]);

  // Google sign-in isn't configured yet - hide rather than show a dead button.
  if (!GOOGLE_CLIENT_ID) return null;

  return <div ref={buttonRef} className='w-full flex justify-center' />;
};

export default GoogleAuthButton;
