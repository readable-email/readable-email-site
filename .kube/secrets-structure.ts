import createSecret from './createSecrets';

// To set secrets:
//   - create `secrets.ts` in this folder
//   - run `jskube .kube/secrets.ts`
//   - delete `secrets.ts`
// The code for `secrets.ts` is in 1password
interface Secrets {
  /**
   * Amazon S3 bucket
   */
  BUCKET: string;
  /**
   * MongoDB Database
   */
  DATABASE: string;

  /**
   * Postgres
   */
  // DATABASE_URL: string;
}
export default function secrets(data: {staging: Secrets; production: Secrets}) {
  return [
    createSecret({
      name: 'readable-email-staging',
      namespace: 'readable-email',
      data: data.staging as any,
    }),
    createSecret({
      name: 'readable-email-production',
      namespace: 'readable-email',
      data: data.production as any,
    }),
  ];
}
