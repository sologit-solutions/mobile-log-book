type RepositoryResult<T> = RepositoryResultSuccess<T> | RepositoryResultFailure;

type RepositoryResultSuccess<T> = {
  success: true;
  data: T;
};

type RepositoryResultFailure = {
  success: false;
  error: {
    code?: string;
    message?: string;
  };
};
