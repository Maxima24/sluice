/** The backend's uniform success envelope. */
export interface Envelope<T> {
  statusCode: number;
  message: string;
  data: T;
}

/** The backend's uniform error shape (same interceptor/filter). */
export interface ApiErrorBody {
  statusCode: number;
  message: string;
  data: null;
  error?: unknown;
}
