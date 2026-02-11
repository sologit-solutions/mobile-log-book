type ResultSuccess<T> = {
  success: true;
  status?: number;
  data: T;
};

type ResultFailure = {
  success: false;
  status?: number;
  error: {
    code?: string;
    message?: string;
  };
};

export type Result<T> = ResultSuccess<T> | ResultFailure;
