/**
 * return ApiResponseBuilder.success(
  'PRODUCT_CREATED',
  'Product created successfully',
  product,
);
 */
export interface ApiSuccessResponse<T> {
  success: true;

  code: string;

  message: string;

  data: T;

  timestamp: string;
}

export interface ApiErrorDetail {
  field?: string;

  code: string;

  message?: string;
}

export interface ApiErrorResponse {
  success: false;

  code: string;

  message: string;

  data: null;

  errors?: ApiErrorDetail[];

  timestamp: string;
}

export type ApiResponse<T> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse;

export class ApiResponseBuilder {
  static success<T>(
    code: string,
    message: string,
    data: T,
  ): ApiSuccessResponse<T> {
    return {
      success: true,
      code,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(
    code: string,
    message: string,
    errors?: ApiErrorDetail[],
  ): ApiErrorResponse {
    return {
      success: false,
      code,
      message,
      data: null,
      errors,
      timestamp: new Date().toISOString(),
    };
  }
}