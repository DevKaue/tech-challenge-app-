declare module 'camelcase-keys' {
  export default function camelcaseKeys<T>(
    input: T,
    options?: { deep?: boolean },
  ): T;
}
