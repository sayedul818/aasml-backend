import { Response } from 'express';

class ApiResponse<T = any> {
  public success: boolean;
  public message: string;
  public data?: T;
  public statusCode: number;

  constructor(
    statusCode: number,
    message: string,
    data?: T,
    success: boolean = true
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = success;
  }

  send(res: Response): Response {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
      statusCode: this.statusCode
    });
  }

  static success<T>(
    res: Response,
    message: string = 'Success',
    data?: T,
    statusCode: number = 200
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      statusCode
    });
  }

  static created<T>(
    res: Response,
    message: string = 'Created successfully',
    data?: T
  ): Response {
    return ApiResponse.success(res, message, data, 201);
  }

  static error(
    res: Response,
    message: string = 'Something went wrong',
    statusCode: number = 500
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      statusCode
    });
  }
}

export default ApiResponse;
