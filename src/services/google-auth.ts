declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
            error_callback?: (error: { type: string; message: string }) => void;
          }): TokenClient;
        };
      };
    };
  }
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  error?: string;
}

interface TokenClient {
  requestAccessToken(overrides?: { prompt?: string }): void;
}

const SCOPES = "https://www.googleapis.com/auth/drive.appdata";

let tokenClient: TokenClient | null = null;
let accessToken: string | null = null;
let tokenExpiry: number = 0;

function getClientId(): string {
  const id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!id) throw new Error("VITE_GOOGLE_CLIENT_ID is not set");
  return id;
}

function isGsiLoaded(): boolean {
  return !!window.google?.accounts?.oauth2;
}

export function loadGsi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isGsiLoaded()) {
      resolve();
      return;
    }

    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

export function initAuth(): void {
  if (!isGsiLoaded()) return;

  tokenClient = window.google!.accounts.oauth2.initTokenClient({
    client_id: getClientId(),
    scope: SCOPES,
    callback: () => {},
  });
}

export function signIn(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isGsiLoaded()) {
      reject(new Error("Google Identity Services not loaded"));
      return;
    }

    tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: getClientId(),
      scope: SCOPES,
      callback: (response: TokenResponse) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        accessToken = response.access_token;
        tokenExpiry = Date.now() + response.expires_in * 1000;
        resolve(response.access_token);
      },
      error_callback: (error) => {
        reject(new Error(error.message));
      },
    });

    tokenClient.requestAccessToken({ prompt: "" });
  });
}

export async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry - 60_000) {
    return accessToken;
  }

  return signIn();
}

export function signOut(): void {
  if (accessToken) {
    fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
      method: "POST",
    }).catch(() => {});
  }
  accessToken = null;
  tokenExpiry = 0;
  tokenClient = null;
}

export function isSignedIn(): boolean {
  return !!accessToken && Date.now() < tokenExpiry;
}
