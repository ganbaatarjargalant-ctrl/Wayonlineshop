/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_MODE?: string
  readonly VITE_MOCK_DELAY?: string
  /** 'qpay' (анхдагч) эсвэл 'mock' */
  readonly VITE_PAYMENT_MODE?: string
}
