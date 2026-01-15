import React from 'react';

type SectionType = 'quick-start' | 'installation' | 'availability' | 'bookings' | 'locations' | 'error-handling' | 'configuration' | 'testing' | 'troubleshooting' | 'best-practices' | 'api-reference' | 'input-validation';

interface PythonGuideProps {
  activeSection: SectionType;
}

const PythonGuide: React.FC<PythonGuideProps> = ({ activeSection }) => {
  const renderSection = () => {
    switch (activeSection) {
      case 'quick-start':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Quick Start</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Get up and running with the Python SDK. Uses async/await with httpx for non-blocking requests.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
{`from datetime import datetime
from carhire import CarHireClient, Config, AvailabilityCriteria, BookingCreate

config = Config.for_rest({
    "baseUrl": "https://your-gateway.example.com",
    "token": "Bearer <JWT>",
    "apiKey": "<YOUR_API_KEY>",  # Optional
    "agentId": "ag_123",
    "callTimeoutMs": 12000,
    "availabilitySlaMs": 120000,
    "longPollWaitMs": 10000,
})

# The client uses async HTTP (httpx) for non-blocking requests
# Use async context manager for proper cleanup, or call aclose() manually
async with CarHireClient(config) as client:

    # Search availability
    criteria = AvailabilityCriteria.make(
        pickup_locode="PKKHI",
        return_locode="PKLHE",
        pickup_at=datetime.fromisoformat("2025-11-03T10:00:00Z".replace("Z", "+00:00")),
        return_at=datetime.fromisoformat("2025-11-05T10:00:00Z".replace("Z", "+00:00")),
        driver_age=28,
        currency="USD",
        agreement_refs=["AGR-001"],
    )

    async for chunk in client.get_availability().search(criteria):
        print(f"[{chunk.status}] items={len(chunk.items)} cursor={chunk.cursor or 0}")
        if chunk.status == "COMPLETE":
            break

    # Create booking
    # Note: supplier_id is not required - backend resolves source_id from agreement_ref
    booking = BookingCreate.from_offer({
        "agreement_ref": "AGR-001",
        "offer_id": "off_123",
        "driver": {
            "firstName": "Ali",
            "lastName": "Raza",
            "email": "ali@example.com",
            "phone": "+92...",
            "age": 28,
        },
    })

    result = await client.get_booking().create(booking, "idem-123")
    print(result["supplierBookingRef"])

# Client automatically closes HTTP connections when exiting context`}
              </pre>
            </div>
            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Key Points:</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                <li>Uses async context manager for proper resource cleanup</li>
                <li>Uses httpx for async HTTP requests</li>
                <li>Full type hints included</li>
                <li>Automatic connection cleanup on context exit</li>
              </ul>
            </div>
          </div>
        );

      case 'installation':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Installation</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Install the Python SDK using pip.
            </p>
            <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`pip install carhire-python-sdk
# or for development
pip install -e .`}
              </pre>
            </div>
            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Requirements:</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                <li>Python 3.8+</li>
                <li>httpx {'>='} 0.25.0 (async HTTP client)</li>
                <li>grpcio {'>='} 1.60.0 (for gRPC transport)</li>
                <li>Type hints included</li>
              </ul>
            </div>
          </div>
        );

      case 'availability':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Availability</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Search for available vehicles using async generators for streaming results.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`from datetime import datetime
from carhire import AvailabilityCriteria

# Create search criteria
criteria = AvailabilityCriteria.make(
    pickup_locode="PKKHI",
    return_locode="PKLHE",
    pickup_at=datetime.fromisoformat("2025-11-03T10:00:00Z".replace("Z", "+00:00")),
    return_at=datetime.fromisoformat("2025-11-05T10:00:00Z".replace("Z", "+00:00")),
    driver_age=28,
    currency="USD",
    agreement_refs=["AGR-001"],
    vehicle_prefs=["ECONOMY"],  # Optional
)

# Search and stream results (uses async HTTP with httpx)
async for chunk in client.get_availability().search(criteria):
    print(f"[{chunk.status}] items={len(chunk.items)} cursor={chunk.cursor or 0}")
    if chunk.status == "COMPLETE":
        break`}
              </pre>
            </div>
          </div>
        );

      case 'bookings':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Bookings</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Create, modify, cancel, and check booking status using async methods.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`from carhire import BookingCreate

# Create booking from availability offer
# Note: supplier_id is not required - backend resolves source_id from agreement_ref
booking = BookingCreate.from_offer({
    "agreement_ref": "AGR-001",
    "offer_id": "off_123",
    "driver": {
        "firstName": "Ali",
        "lastName": "Raza",
        "email": "ali@example.com",
        "phone": "+92...",
        "age": 28,
    },
})

# Create booking (requires Idempotency-Key)
result = await client.get_booking().create(booking, "unique-idempotency-key-123")
print(f"Booking Reference: {result.get('supplierBookingRef')}")

# Modify booking (source_id is optional, backend resolves from agreement_ref)
await client.get_booking().modify(
    result["supplierBookingRef"],
    {"driver": {"email": "newemail@example.com"}},
    "AGR-001"
)

# Check booking status
status = await client.get_booking().check(result["supplierBookingRef"], "AGR-001")

# Cancel booking
await client.get_booking().cancel(result["supplierBookingRef"], "AGR-001")`}
              </pre>
            </div>
          </div>
        );

      case 'locations':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Locations</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Check if location is supported by an agreement.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`# Check if location is supported
is_supported = await client.get_locations().is_supported("AGR-001", "PKKHI")
print(f"Location supported: {is_supported}")`}
              </pre>
            </div>
          </div>
        );

      case 'error-handling':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Error Handling</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Handle errors properly with Python exception handling.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`from carhire import TransportException

try:
    result = await client.get_booking().create(booking, "idem-123")
except TransportException as e:
    print(f"Status: {e.status_code}")
    print(f"Code: {e.code}")
    print(f"Message: {e.message}")`}
              </pre>
            </div>
          </div>
        );

      case 'configuration':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Configuration</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Configure the SDK with REST or gRPC transport.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`# REST Configuration
config = Config.for_rest({
    "baseUrl": "https://your-gateway.example.com",  # Required
    "token": "Bearer <JWT>",  # Required
    "apiKey": "<API_KEY>",  # Optional
    "agentId": "ag_123",  # Optional
    "callTimeoutMs": 12000,  # Default: 10000
    "availabilitySlaMs": 120000,  # Default: 120000
    "longPollWaitMs": 10000,  # Default: 10000
})

# gRPC Configuration
grpc_config = Config.for_grpc({
    "host": "api.example.com:50051",
    "caCert": "<CA_CERT>",
    "clientCert": "<CLIENT_CERT>",
    "clientKey": "<CLIENT_KEY>",
})`}
              </pre>
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
                <li>Backend running on <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>http://localhost:8080</code></li>
                <li>Agent account created and verified</li>
                <li>Active agreement with a source</li>
                <li>JWT token from agent login</li>
              </ul>
            </div>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`# Setup .env file
BASE_URL=http://localhost:8080
JWT_TOKEN=your_access_token_here
AGENT_ID=your_agent_id_here
AGREEMENT_REF=AGR-001

# Install dependencies
pip install python-dotenv

# Run test script
python examples/test_availability.py`}
              </pre>
            </div>
            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#92400e' }}>Note on Async:</h3>
              <p style={{ margin: 0, color: '#78350f' }}>
                The Python SDK uses async/await with httpx, but the underlying HTTP requests are synchronous. This is a known limitation - the SDK provides async interfaces but uses blocking HTTP calls internally.
              </p>
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
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Token is required</h4>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  Ensure environment variable <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>JWT_TOKEN</code> is set or token is provided in config. Verify token is valid by checking backend logs.
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>pickup_locode is required (Validation Error)</h4>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  Ensure locode is 5 characters (UN/LOCODE format). Example: <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>PKKHI</code>, <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>PKLHE</code>, <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>USNYC</code>. Locodes are automatically normalized to uppercase.
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>return_at must be after pickup_at</h4>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  Ensure return datetime is after pickup datetime. Use <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>datetime.fromisoformat()</code> or <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>datetime.now()</code> to create valid datetime objects.
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Context manager not used</h4>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  Always use <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>async with CarHireClient(config) as client:</code> for proper resource cleanup. Alternatively, call <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>await client.aclose()</code> manually.
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
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: '#111827' }}>Context Managers</h3>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                Always use <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>async with</code> for proper resource cleanup. The client automatically closes HTTP connections when exiting the context.
              </p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: '#111827' }}>Idempotency</h3>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                Always use unique idempotency keys for booking creation. Store keys for retry scenarios.
              </p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: '#111827' }}>Error Handling</h3>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                Always handle <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>TransportException</code> with proper error codes. Implement retry logic for transient errors (502, 503).
              </p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: '#111827' }}>Async/Await</h3>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                All SDK methods are async. Use <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>await</code> when calling SDK methods. Note: The SDK uses synchronous HTTP requests internally despite async interfaces.
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
              The SDK automatically validates inputs before sending requests. Invalid inputs will raise exceptions immediately.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`# Invalid input will raise an exception
try:
    criteria = AvailabilityCriteria.make(
        pickup_locode="",  # Error: pickup_locode is required
        return_locode="PKLHE",
        pickup_at=datetime.fromisoformat("2025-11-03T10:00:00Z".replace("Z", "+00:00")),
        return_at=datetime.fromisoformat("2025-11-01T10:00:00Z".replace("Z", "+00:00")),  # Error: return_at must be after pickup_at
        driver_age=17,  # Error: driver_age must be between 18 and 100
        currency="USD",
        agreement_refs=[],  # Error: agreement_refs must be a non-empty list
    )
except ValueError as e:
    print(f"Validation error: {e}")`}
              </pre>
            </div>
            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Validation Rules:</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                <li><strong>pickup_locode/return_locode:</strong> Required, non-empty, normalized to uppercase</li>
                <li><strong>pickup_at/return_at:</strong> Required, valid datetime, return_at must be after pickup_at</li>
                <li><strong>driver_age:</strong> Required, must be between 18 and 100</li>
                <li><strong>currency:</strong> Required, non-empty, normalized to uppercase</li>
                <li><strong>agreement_refs:</strong> Required, non-empty list</li>
                <li><strong>residency_country:</strong> Optional, must be 2-letter ISO code if provided</li>
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

export default PythonGuide;

