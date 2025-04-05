import { invoker, modify } from 'ramda';

export type FetchWrapper<T> = Promise<
  | { code: '0'; data: T }
  | { code: '500'; msg: 'Internal server error'; data: undefined }
  | { code: '400'; msg: 'Bad request'; data: undefined }
  | { code: '429'; msg: 'Too Many Requests'; data: undefined }
>;

// 1inch API configuration
const INCH_API_KEY = process.env.INCH_API_KEY || '';
const INCH_API_BASE_URL = process.env.NEXT_PUBLIC_1INCH_API_URL || 'https://api.1inch.dev';

// Get headers for 1inch API requests
export const getHeadersParams = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${INCH_API_KEY}`,
  Accept: 'application/json',
});

// Generic fetch wrapper for 1inch API
export const fetchWrapper = async <T>(url: string, options: RequestInit = {}): FetchWrapper<T> =>
  fetch(url, {
    method: 'get',
    headers: getHeadersParams(),
    ...options,
  })
    .then(invoker(0, 'json'))
    .then(modify('code', String) as any);

// --------------------- util function ---------------------

const urlBuilder =
  (path: `/${string}`) => (methodName: string, queryParams: Record<string, string>) =>
    INCH_API_BASE_URL + path + methodName + '?' + new URLSearchParams(queryParams).toString();

// Function to get the token list URL
export const getTokenListUrl = (chainId: string) => {
  return `${INCH_API_BASE_URL}/token/v1.2/${chainId}/tokens`;
};

// Function to get the balance URL
export const getBalanceUrl = (chainId: string, address: string) => {
  return `${INCH_API_BASE_URL}/balance/v1.2/${chainId}/balances/${address}`;
};

// Function to get the price URL
export const getPriceUrl = (chainId: string) => {
  return `${INCH_API_BASE_URL}/price/v1.1/${chainId}`;
};
