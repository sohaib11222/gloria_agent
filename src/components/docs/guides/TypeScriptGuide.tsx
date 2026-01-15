import React from 'react';

type SectionType = 'quick-start' | 'installation' | 'availability' | 'bookings' | 'locations' | 'error-handling' | 'configuration' | 'testing' | 'troubleshooting' | 'best-practices' | 'api-reference' | 'input-validation';

interface TypeScriptGuideProps {
  activeSection: SectionType;
}

const TypeScriptGuide: React.FC<TypeScriptGuideProps> = ({ activeSection }) => {
  const renderSection = () => {
    switch (activeSection) {
      case 'quick-start':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Quick Start</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Get up and running with the TypeScript SDK in minutes. This example demonstrates availability search and booking creation.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
{`import { CarHireClient, Config, AvailabilityCriteria, BookingCreate } from '@carhire/nodejs-sdk';

const config = Config.forRest({
  baseUrl: 'https://your-gateway.example.com',
  token: 'Bearer <JWT>',
  apiKey: '<YOUR_API_KEY>', // Optional: prefer API key auth for SDKs
  agentId: 'ag_123',
  callTimeoutMs: 12000,
  availabilitySlaMs: 120000,
  longPollWaitMs: 10000,
});

const client = new CarHireClient(config);

// Search availability
const criteria = AvailabilityCriteria.make({
  pickupLocode: 'PKKHI',
  returnLocode: 'PKLHE',
  pickupAt: new Date('2025-11-03T10:00:00Z'),
  returnAt: new Date('2025-11-05T10:00:00Z'),
  driverAge: 28,
  currency: 'USD',
  agreementRefs: ['AGR-001'],
  vehiclePrefs: ['ECONOMY'], // Optional
  ratePrefs: [], // Optional
  extras: {}, // Optional
});

for await (const chunk of client.getAvailability().search(criteria)) {
  console.log(\`[\${chunk.status}] items=\${chunk.items.length} cursor=\${chunk.cursor ?? 0}\`);
  
  // Process offers as they arrive
  for (const offer of chunk.items) {
    console.log('Offer:', offer);
  }
  
  // Stop when complete
  if (chunk.status === 'COMPLETE') {
    break;
  }
}

// Create booking
// Note: supplier_id is not required - backend resolves source_id from agreement_ref
const booking = BookingCreate.fromOffer({
  agreement_ref: 'AGR-001',
  offer_id: 'off_123',
  driver: {
    firstName: 'Ali',
    lastName: 'Raza',
    email: 'ali@example.com',
    phone: '+92...',
    age: 28,
  },
});

const result = await client.getBooking().create(booking, 'idem-123');
console.log(result.supplierBookingRef);`}
              </pre>
            </div>
            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Key Points:</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                <li>Uses async/await for asynchronous operations</li>
                <li>Availability search streams results incrementally</li>
                <li>Booking creation requires an idempotency key</li>
                <li>supplier_id is automatically resolved from agreement_ref</li>
              </ul>
            </div>
          </div>
        );

      case 'installation':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Installation</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Install the TypeScript SDK using npm, yarn, or pnpm.
            </p>
            <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`# Using npm
npm install @carhire/nodejs-sdk

# Using yarn
yarn add @carhire/nodejs-sdk

# Using pnpm
pnpm add @carhire/nodejs-sdk`}
              </pre>
            </div>
            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Requirements:</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                <li>Node.js 16+ or TypeScript 4.5+</li>
                <li>TypeScript types are included in the package</li>
                <li>Uses axios for HTTP requests</li>
                <li>Uses @grpc/grpc-js for gRPC (optional)</li>
              </ul>
            </div>
          </div>
        );

      case 'availability':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Availability</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Search for available vehicles using the Submit → Poll pattern with streaming results. Results arrive incrementally as suppliers respond.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`import { AvailabilityCriteria } from '@carhire/nodejs-sdk';

// Create search criteria with validation
const criteria = AvailabilityCriteria.make({
  pickupLocode: 'PKKHI',
  returnLocode: 'PKLHE',
  pickupAt: new Date('2025-11-03T10:00:00Z'),
  returnAt: new Date('2025-11-05T10:00:00Z'),
  driverAge: 28,
  currency: 'USD',
  agreementRefs: ['AGR-001'],
  vehiclePrefs: ['ECONOMY'], // Optional
  ratePrefs: [], // Optional
  residencyCountry: 'US', // Optional, 2-letter ISO code
  extras: {}, // Optional
});

// Search and stream results
for await (const chunk of client.getAvailability().search(criteria)) {
  console.log(\`[\${chunk.status}] items=\${chunk.items.length} cursor=\${chunk.cursor ?? 0}\`);
  
  // Process offers as they arrive
  for (const offer of chunk.items) {
    console.log('Offer:', offer);
    // Process each offer (price, vehicle, supplier, etc.)
  }
  
  // Stop when complete
  if (chunk.status === 'COMPLETE') {
    break;
  }
}`}
              </pre>
            </div>
            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>How It Works:</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                <li><strong>Submit:</strong> Sends availability request to backend</li>
                <li><strong>Poll:</strong> Long-polls for results with incremental updates</li>
                <li><strong>Stream:</strong> Results arrive as async generator chunks</li>
                <li><strong>Status:</strong> PARTIAL (more coming) or COMPLETE (all done)</li>
                <li><strong>Cursor:</strong> Sequence number for tracking progress</li>
              </ul>
            </div>
          </div>
        );

      case 'bookings':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Bookings</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Create, modify, cancel, and check booking status. All booking creation operations require an Idempotency-Key to prevent duplicate bookings.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`import { BookingCreate } from '@carhire/nodejs-sdk';

// Create booking from availability offer
// Note: supplier_id is not required - backend resolves source_id from agreement_ref
const booking = BookingCreate.fromOffer({
  agreement_ref: 'AGR-001',
  offer_id: 'off_123',
  driver: {
    firstName: 'Ali',
    lastName: 'Raza',
    email: 'ali@example.com',
    phone: '+92...',
    age: 28,
  },
});

// Create booking (requires Idempotency-Key)
const result = await client.getBooking().create(booking, 'unique-idempotency-key-123');
console.log('Booking Reference:', result.supplierBookingRef);

// Modify booking
await client.getBooking().modify(
  result.supplierBookingRef,
  { driver: { email: 'newemail@example.com' } },
  'AGR-001'
);

// Check booking status
const status = await client.getBooking().check(
  result.supplierBookingRef,
  'AGR-001'
);

// Cancel booking
await client.getBooking().cancel(
  result.supplierBookingRef,
  'AGR-001'
);`}
              </pre>
            </div>
            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Important Notes:</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                <li><strong>Idempotency Key:</strong> Required for booking creation to prevent duplicates</li>
                <li><strong>supplier_id:</strong> Not required - backend resolves from agreement_ref</li>
                <li><strong>Agreement Reference:</strong> Required for all booking operations</li>
                <li><strong>Modify:</strong> Only updates specified fields, others remain unchanged</li>
              </ul>
            </div>
          </div>
        );

      case 'locations':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Locations</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Check if a UN/LOCODE location is supported by a specific agreement. Location validation is automatically performed during availability submit.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`// Check if a location is supported by an agreement
const isSupported = await client.getLocations().isSupported('AGR-001', 'PKKHI');
if (isSupported) {
  console.log('Location PKKHI is supported by agreement AGR-001');
}

// Note: For searching UN/LOCODE locations or getting agreement coverage,
// use the REST API endpoints directly:
// GET /locations?query=Manchester
// GET /coverage/agreement/{agreementId}`}
              </pre>
            </div>
            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#92400e' }}>Current Limitation:</h3>
              <p style={{ margin: 0, color: '#78350f' }}>
                The <code style={{ backgroundColor: '#fef3c7', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>isSupported()</code> method currently returns <code style={{ backgroundColor: '#fef3c7', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>false</code> as a safe default because the backend requires agreement ID (not ref) to check coverage, and there's no direct endpoint to resolve agreementRef to ID. Location validation happens automatically during availability submit, so use that for actual validation.
              </p>
            </div>
          </div>
        );

      case 'error-handling':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Error Handling</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Handle errors properly with structured error information. All SDK errors extend TransportException.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`import { TransportException } from '@carhire/nodejs-sdk';

try {
  await client.getBooking().create(booking, 'idem-123');
} catch (error) {
  if (error instanceof TransportException) {
    console.error('Status:', error.statusCode);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    
    // Handle specific error codes
    if (error.statusCode === 409) {
      // Conflict - duplicate idempotency key
      console.error('Duplicate booking detected');
    } else if (error.statusCode === 502) {
      // Bad Gateway - source error
      console.error('Source error occurred');
    } else if (error.statusCode === 503) {
      // Service Unavailable - source unavailable
      console.error('Source unavailable');
    }
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}`}
              </pre>
            </div>
            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Common Error Codes:</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                <li><strong>400 Bad Request:</strong> Invalid input (validation errors)</li>
                <li><strong>401 Unauthorized:</strong> Invalid or expired JWT token</li>
                <li><strong>404 Not Found:</strong> Resource not found (agreement, booking, etc.)</li>
                <li><strong>409 Conflict:</strong> Duplicate request (idempotency key collision)</li>
                <li><strong>502 Bad Gateway:</strong> Source error</li>
                <li><strong>503 Service Unavailable:</strong> Source unavailable</li>
              </ul>
            </div>
          </div>
        );

      case 'configuration':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Configuration</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Configure the SDK with REST or gRPC transport, timeouts, and other settings.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`// REST Configuration
const config = Config.forRest({
  baseUrl: 'https://your-gateway.example.com', // Required
  token: 'Bearer <JWT>', // Required
  apiKey: '<API_KEY>', // Optional: prefer API key auth for SDKs
  agentId: 'ag_123', // Optional
  callTimeoutMs: 10000, // Default: 10000
  availabilitySlaMs: 120000, // Default: 120000
  longPollWaitMs: 10000, // Default: 10000
  correlationId: 'custom-id', // Auto-generated if not provided
});

// gRPC Configuration
const grpcConfig = Config.forGrpc({
  host: 'api.example.com:50051', // Required
  caCert: '<CA_CERT>', // Required
  clientCert: '<CLIENT_CERT>', // Required
  clientKey: '<CLIENT_KEY>', // Required
  agentId: 'ag_123', // Optional
  callTimeoutMs: 10000, // Default: 10000
  availabilitySlaMs: 120000, // Default: 120000
  longPollWaitMs: 10000, // Default: 10000
});

const client = new CarHireClient(config);`}
              </pre>
            </div>
            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Configuration Options:</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                <li><strong>baseUrl:</strong> API gateway URL (required for REST)</li>
                <li><strong>token:</strong> Bearer JWT token (required for REST)</li>
                <li><strong>apiKey:</strong> API key for authentication (optional, preferred)</li>
                <li><strong>agentId:</strong> Agent identifier (optional)</li>
                <li><strong>callTimeoutMs:</strong> Request timeout in milliseconds (default: 10000)</li>
                <li><strong>availabilitySlaMs:</strong> Availability SLA deadline (default: 120000)</li>
                <li><strong>longPollWaitMs:</strong> Long poll wait time (default: 10000)</li>
                <li><strong>correlationId:</strong> Request correlation ID (auto-generated if not provided)</li>
              </ul>
            </div>
          </div>
        );

      case 'testing':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Testing</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Test the SDK locally with the backend running on localhost:8080.
            </p>
            <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Prerequisites:</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                <li>Backend running on <code>http://localhost:8080</code></li>
                <li>Agent account created and verified</li>
                <li>Active agreement with a source</li>
                <li>JWT token from agent login</li>
              </ul>
            </div>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`// Setup .env file
BASE_URL=http://localhost:8080
JWT_TOKEN=your_access_token_here
AGENT_ID=your_agent_id_here
AGREEMENT_REF=AGR-001

// Install dependencies
npm install dotenv

// Run test script
node examples/test-availability.js`}
              </pre>
            </div>
          </div>
        );

      case 'troubleshooting':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Troubleshooting</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: '#111827' }}>Common Issues:</h3>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>JWT_TOKEN is required</h4>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  Ensure <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>.env</code> file exists and contains <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>JWT_TOKEN=your_token</code>. Verify token is valid by checking backend logs.
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>pickupLocode is required (Validation Error)</h4>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  Ensure locode is 5 characters (UN/LOCODE format). Example: <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>PKKHI</code>, <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>PKLHE</code>, <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>USNYC</code>. Locodes are automatically normalized to uppercase.
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>returnAt must be after pickupAt</h4>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  Ensure return date/time is after pickup date/time. Example: Pickup <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>2025-12-01T10:00:00Z</code>, Return <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>2025-12-03T10:00:00Z</code>.
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>driverAge must be between 18 and 100</h4>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  Set driver age between 18 and 100.
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>agreement_refs must be a non-empty array</h4>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  Provide at least one agreement reference. Ensure agreement exists and is active.
                </p>
              </div>
            </div>
          </div>
        );

      case 'best-practices':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Best Practices</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: '#111827' }}>Idempotency</h3>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                Always use unique idempotency keys for booking creation to prevent duplicate bookings. Store keys for retry scenarios.
              </p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: '#111827' }}>Error Handling</h3>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                Always handle TransportException with proper error codes. Implement retry logic for transient errors (502, 503).
              </p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: '#111827' }}>Timeouts</h3>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                Configure timeouts based on your SLA requirements. availabilitySlaMs should match your expected response time.
              </p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: '#111827' }}>Agreement Validation</h3>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                Verify agreements are active before making requests. Cache agreement data to reduce API calls.
              </p>
            </div>
          </div>
        );

      case 'api-reference':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>API Reference</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Complete REST API endpoints used by the SDK.
            </p>
            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#111827' }}>Method</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#111827' }}>Endpoint</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#111827' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', color: '#111827' }}><code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>POST</code></td>
                    <td style={{ padding: '0.75rem', color: '#111827' }}><code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>/availability/submit</code></td>
                    <td style={{ padding: '0.75rem', color: '#6b7280' }}>Submit availability request</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', color: '#111827' }}><code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>GET</code></td>
                    <td style={{ padding: '0.75rem', color: '#111827' }}><code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>/availability/poll</code></td>
                    <td style={{ padding: '0.75rem', color: '#6b7280' }}>Poll availability results</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', color: '#111827' }}><code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>POST</code></td>
                    <td style={{ padding: '0.75rem', color: '#111827' }}><code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>/bookings</code></td>
                    <td style={{ padding: '0.75rem', color: '#6b7280' }}>Create booking (requires Idempotency-Key header)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', color: '#111827' }}><code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>PATCH</code></td>
                    <td style={{ padding: '0.75rem', color: '#111827' }}><code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>/bookings/{'{supplierBookingRef}'}</code></td>
                    <td style={{ padding: '0.75rem', color: '#6b7280' }}>Modify booking</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', color: '#111827' }}><code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>POST</code></td>
                    <td style={{ padding: '0.75rem', color: '#111827' }}><code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>/bookings/{'{supplierBookingRef}'}/cancel</code></td>
                    <td style={{ padding: '0.75rem', color: '#6b7280' }}>Cancel booking</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', color: '#111827' }}><code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>GET</code></td>
                    <td style={{ padding: '0.75rem', color: '#111827' }}><code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>/bookings/{'{supplierBookingRef}'}</code></td>
                    <td style={{ padding: '0.75rem', color: '#6b7280' }}>Check booking status</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'input-validation':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Input Validation</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              The SDK automatically validates inputs before sending requests. Invalid inputs will throw errors immediately.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`// Invalid input will throw an error
try {
  const criteria = AvailabilityCriteria.make({
    pickupLocode: '', // Error: pickupLocode is required
    returnLocode: 'PKLHE',
    pickupAt: new Date('2025-11-03'),
    returnAt: new Date('2025-11-01'), // Error: returnAt must be after pickupAt
    driverAge: 17, // Error: driverAge must be between 18 and 100
    currency: 'USD',
    agreementRefs: [], // Error: agreementRefs must be a non-empty array
  });
} catch (error) {
  console.error('Validation error:', error.message);
}`}
              </pre>
            </div>
            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Validation Rules:</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                <li><strong>pickupLocode/returnLocode:</strong> Required, non-empty, normalized to uppercase</li>
                <li><strong>pickupAt/returnAt:</strong> Required, valid Date, returnAt must be after pickupAt</li>
                <li><strong>driverAge:</strong> Required, must be between 18 and 100</li>
                <li><strong>currency:</strong> Required, non-empty, normalized to uppercase</li>
                <li><strong>agreementRefs:</strong> Required, non-empty array</li>
                <li><strong>residencyCountry:</strong> Optional, must be 2-letter ISO code if provided</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <div>{renderSection()}</div>;
};

export default TypeScriptGuide;

