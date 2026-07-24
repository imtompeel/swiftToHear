/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID: string

  /** mesh (default) | daily */
  readonly VITE_VIDEO_PROVIDER?: string
  /** POST endpoint returning { token, roomUrl } when using Daily SFU */
  readonly VITE_DAILY_TOKEN_URL?: string

  /** Metered / Open Relay TURN API key */
  readonly VITE_METERED_TURN_API_KEY?: string
  /** e.g. https://openrelay.metered.ca/openrelayproject or https://yourapp.metered.live */
  readonly VITE_METERED_TURN_ENDPOINT?: string
  /** Comma-separated TURN URLs as an alternative to Metered */
  readonly VITE_TURN_URLS?: string
  readonly VITE_TURN_USERNAME?: string
  readonly VITE_TURN_CREDENTIAL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
