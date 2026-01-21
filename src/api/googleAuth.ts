
import { api } from "@/lib/apiClient";
import { toast } from "sonner";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

interface GoogleUser {
  id: string;
  name: string;
  email: string;
  image: string;
}

interface GoogleAuthResponse {
  success: boolean;
  message: string;
  user?: GoogleUser;
  token?: string;
}

export const isGoogleAuthConfigured = (): boolean => {
  return !!GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'your_google_client_id';
};

let googleScriptLoaded = false;
export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (googleScriptLoaded || (window as any).google?.accounts) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleScriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
};

export const initializeGoogleSignIn = (
  buttonElement: HTMLElement,
  onSuccess: (response: GoogleAuthResponse) => void,
  onError: (error: string) => void
) => {
  if (!isGoogleAuthConfigured()) return;

  const google = (window as any).google;
  if (!google?.accounts) return;

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: async (response: any) => {
      try {
        const decoded = decodeJWT(response.credential);
        if (!decoded) throw new Error('Failed to decode Google credential');

        const result = await api.googleAuth(
          decoded.sub,
          decoded.name,
          decoded.email,
          decoded.picture
        );

        if (result.success) {
          onSuccess({
            success: true,
            message: 'Google sign-in successful',
            user: result.user,
            token: result.token
          });
        } else {
          throw new Error('Backend Google authentication failed');
        }
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Google sign-in failed');
      }
    },
  });

  google.accounts.id.renderButton(buttonElement, {
    theme: 'outline',
    size: 'large',
    width: '100%',
    text: 'continue_with',
    shape: 'rectangular',
  });
};

const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const signOutGoogle = () => {
  const google = (window as any).google;
  if (google?.accounts?.id) {
    google.accounts.id.disableAutoSelect();
  }
};
