/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export const startTracing = (serviceName: string) => {
  const exporterOptions = {
    // Explicit Jaeger Exporter targeted per user request
    endpoint:
      process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
  };

  const traceExporter = new JaegerExporter(exporterOptions);

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Optional: disable noisy FS instrumentations
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
      }),
    ],
  });

  // Init the SDK safely
  sdk.start();

  // Graceful shutdown parsing
  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });

  return sdk;
};
