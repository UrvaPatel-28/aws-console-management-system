export interface SuccessResponse<T> {
  is_error?: boolean;
  message?: string;
  data?: T;
}
