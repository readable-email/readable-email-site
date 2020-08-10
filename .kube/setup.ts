import createIngress from './createIngress';
import createServiceAccount from './createServiceAccount';
import createConfigMap from './createConfigMap';

export default [
  ...createServiceAccount({namespace: 'readable-email'}),
  ...createIngress({
    name: 'readable-email-staging',
    namespace: 'readable-email',
    serviceName: 'readable-email-staging',
    hosts: ['staging-temp.readable-email.org'],
    createCertificate: false,
    enableTLS: false,
    stagingTLS: true,
  }),
  ...createIngress({
    name: 'readable-email-production',
    namespace: 'readable-email',
    serviceName: 'readable-email-production',
    hosts: ['prod-temp.readable-email.org'],
    createCertificate: false,
    enableTLS: false,
    stagingTLS: true,
  }),

  createConfigMap({
    name: 'readable-email-staging',
    namespace: 'readable-email',
    data: {
      NODE_ENV: 'production',
    },
  }),
  createConfigMap({
    name: 'readable-email-production',
    namespace: 'readable-email',
    data: {
      NODE_ENV: 'production',
    },
  }),
];
