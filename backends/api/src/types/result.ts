type ResultSuccess<T> = {
  success: true;
  data: T;
};

type ResultFailure = {
  success: false;
  error: {
    code?: string;
    message?: string;
  };
};

export type Result<T> = ResultSuccess<T> | ResultFailure;
