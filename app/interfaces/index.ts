export interface IBase {
  createDate: string;
  deleteDate?: string;
  id: number;
  updateDate?: string;
  version?: number;
}

export interface ICompleted<T> {
  instance: Response;
  response: T;
}

export interface IError {
  code?: number | string;
  error?: unknown;
  message: string;
  statusCode?: number;
}

export interface IFailed<T> {
  error: T;
  ok: false;
}

export interface IHealth {
  status: 'UP';
}

export interface IPage<T> {
  data: T;
  next: boolean;
  page: number;
  pages: number;
  previous: boolean;
  size: number;
}

export interface ISuccessful<T> {
  data: T;
  ok: true;
}

export interface IToken {
  expDays: number;
  id: number;
  token: string;
  username: string;
}
