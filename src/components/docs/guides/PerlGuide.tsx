import React from 'react';

type SectionType = 'quick-start' | 'installation' | 'availability' | 'bookings' | 'locations' | 'error-handling' | 'configuration' | 'testing' | 'troubleshooting' | 'best-practices' | 'api-reference' | 'input-validation';

interface PerlGuideProps {
  activeSection: SectionType;
}

const PerlGuide: React.FC<PerlGuideProps> = ({ activeSection }) => {
  const renderSection = () => {
    switch (activeSection) {
      case 'quick-start':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Quick Start</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Get up and running with the Perl SDK. Uses standard Perl patterns and LWP::UserAgent for HTTP.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
{`use CarHire::SDK;

my $config = CarHire::SDK::Config->for_rest({
    baseUrl => 'https://your-gateway.example.com',
    token   => 'Bearer <JWT>',
    apiKey  => '<YOUR_API_KEY>',  # Optional
    agentId => 'ag_123',
    callTimeoutMs     => 12000,
    availabilitySlaMs => 120000,
    longPollWaitMs    => 10000,
});

my $client = CarHire::SDK::Client->new($config);

# Search availability
my $criteria = {
    pickup_unlocode  => 'PKKHI',
    dropoff_unlocode => 'PKLHE',
    pickup_iso       => '2025-11-03T10:00:00Z',
    dropoff_iso      => '2025-11-05T10:00:00Z',
    driver_age       => 28,
    currency         => 'USD',
    agreement_refs   => ['AGR-001'],
};

for my $chunk ($client->availability()->search($criteria)) {
    print "[$chunk->{status}] items=" . scalar(@{$chunk->{items}}) . " cursor=" . ($chunk->{cursor} || 0) . "\\n";
    last if $chunk->{status} eq 'COMPLETE';
}

# Create booking
# Note: supplier_id is not required - backend resolves source_id from agreement_ref
my $booking = {
    agreement_ref => 'AGR-001',
    offer_id      => 'off_123',
    driver => {
        firstName => 'Ali',
        lastName  => 'Raza',
        email     => 'ali@example.com',
        phone     => '+92...',
        age       => 28,
    },
};

my $result = $client->booking()->create($booking, 'idem-123');
print $result->{supplierBookingRef}, "\\n";`}
              </pre>
            </div>
            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Key Points:</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                <li>Uses standard Perl patterns</li>
                <li>Uses LWP::UserAgent for HTTP requests</li>
                <li>Uses JSON for serialization</li>
                <li>Generator patterns for streaming</li>
              </ul>
            </div>
          </div>
        );

      case 'installation':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Installation</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Install the Perl SDK using cpanm or Makefile.PL.
            </p>
            <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`perl Makefile.PL
make
make install
# or using cpanm
cpanm --installdeps .
cpanm .`}
              </pre>
            </div>
            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Requirements:</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                <li>Perl 5.26+</li>
                <li>LWP::UserAgent for HTTP</li>
                <li>JSON for serialization</li>
                <li>cpanm for installation</li>
              </ul>
            </div>
          </div>
        );

      case 'availability':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Availability</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Search for available vehicles using Perl generators.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`# Create search criteria
my $criteria = {
    pickup_unlocode  => 'PKKHI',
    dropoff_unlocode => 'PKLHE',
    pickup_iso       => '2025-11-03T10:00:00Z',
    dropoff_iso      => '2025-11-05T10:00:00Z',
    driver_age       => 28,
    currency         => 'USD',
    agreement_refs   => ['AGR-001'],
};

# Search and stream results
for my $chunk ($client->availability()->search($criteria)) {
    print "[$chunk->{status}] items=" . scalar(@{$chunk->{items}}) . " cursor=" . ($chunk->{cursor} || 0) . "\\n";
    last if $chunk->{status} eq 'COMPLETE';
}`}
              </pre>
            </div>
          </div>
        );

      case 'bookings':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Bookings</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Create, modify, cancel, and check booking status.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`# Create booking from availability offer
# Note: supplier_id is not required - backend resolves source_id from agreement_ref
my $booking = {
    agreement_ref => 'AGR-001',
    offer_id      => 'off_123',
    driver => {
        firstName => 'Ali',
        lastName  => 'Raza',
        email     => 'ali@example.com',
        phone     => '+92...',
        age       => 28,
    },
};

# Create booking (requires Idempotency-Key)
my $result = $client->booking()->create($booking, 'unique-idempotency-key-123');
print "Booking Reference: " . ($result->{supplierBookingRef} || '') . "\\n";

# Modify booking
$client->booking()->modify(
    $result->{supplierBookingRef},
    {driver => {email => 'newemail@example.com'}},
    'AGR-001',
    undef  # source_id is optional, backend resolves from agreement_ref
);

# Check booking status
my $status = $client->booking()->check($result->{supplierBookingRef}, 'AGR-001', undef);

# Cancel booking
$client->booking()->cancel($result->{supplierBookingRef}, 'AGR-001', undef);`}
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
my $is_supported = $client->locations()->is_supported('AGR-001', 'PKKHI');
print "Location supported: " . ($is_supported ? 'yes' : 'no') . "\\n";`}
              </pre>
            </div>
          </div>
        );

      case 'error-handling':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Error Handling</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Handle errors properly with Perl exception handling.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`use Scalar::Util qw(blessed);

eval {
    my $result = $client->booking()->create($booking, 'idem-123');
} or do {
    my $error = $@;
    if (blessed($error) && $error->isa('CarHire::SDK::TransportException')) {
        print "Status: " . $error->status_code . "\\n";
        print "Code: " . $error->code . "\\n";
        print "Message: " . $error->message . "\\n";
    }
};`}
              </pre>
            </div>
          </div>
        );

      case 'configuration':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Configuration</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Configure the SDK with REST transport.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`# REST Configuration
my $config = CarHire::SDK::Config->for_rest({
    baseUrl => 'https://your-gateway.example.com',  # Required
    token   => 'Bearer <JWT>',                      # Required
    apiKey  => '<API_KEY>',                         # Optional
    agentId => 'ag_123',                            # Optional
    callTimeoutMs     => 10000,                     # Default: 10000
    availabilitySlaMs => 120000,                    # Default: 120000
    longPollWaitMs    => 10000,                     # Default: 10000
});

# gRPC Configuration
my $grpc_config = CarHire::SDK::Config->for_grpc({
    host       => 'api.example.com:50051',
    caCert     => '<CA_CERT>',
    clientCert => '<CLIENT_CERT>',
    clientKey  => '<CLIENT_KEY>',
});`}
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
{`# Setup environment variables
export BASE_URL=http://localhost:8080
export JWT_TOKEN=your_access_token_here
export AGENT_ID=your_agent_id_here
export AGREEMENT_REF=AGR-001

# Run test script
perl examples/test_availability.pl`}
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
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Token is required</h4>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  Ensure environment variable <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>JWT_TOKEN</code> is set or token is provided in config hash. Verify token is valid by checking backend logs.
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>pickup_unlocode is required (Validation Error)</h4>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  Ensure locode is 5 characters (UN/LOCODE format). Example: <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>PKKHI</code>, <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>PKLHE</code>, <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>USNYC</code>. Locodes are automatically normalized to uppercase.
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>dropoff_iso must be after pickup_iso</h4>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  Ensure dropoff ISO 8601 datetime string is after pickup datetime string. Use <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>DateTime</code> module for date manipulation if needed.
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Module not found</h4>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  Ensure all dependencies are installed. Run <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>cpanm --installdeps .</code> to install dependencies.
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
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: '#111827' }}>Error Handling</h3>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                Use <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>eval { }</code> blocks to catch exceptions. Check <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>$@</code> for errors after eval blocks.
              </p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: '#111827' }}>Idempotency</h3>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                Always use unique idempotency keys for booking creation. Store keys for retry scenarios.
              </p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: '#111827' }}>Hash References</h3>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                Use hash references (<code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>{}</code>) for nested data structures. Access nested values with <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>$hash-&gt;{'{key}'}-&gt;{'{nested}'}</code>.
              </p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: '#111827' }}>Generator Patterns</h3>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                The SDK uses generator patterns for streaming results. Use <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>for my $chunk ($client-&gt;availability()-&gt;search($criteria))</code> to iterate.
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
              The SDK automatically validates inputs before sending requests. Invalid inputs will die with error messages.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`# Invalid input will die with error
eval {
    my $criteria = {
        pickup_unlocode  => '',  # Error: pickup_unlocode is required
        dropoff_unlocode => 'PKLHE',
        pickup_iso       => '2025-11-03T10:00:00Z',
        dropoff_iso      => '2025-11-01T10:00:00Z',  # Error: dropoff_iso must be after pickup_iso
        driver_age       => 17,  # Error: driver_age must be between 18 and 100
        currency         => 'USD',
        agreement_refs   => [],  # Error: agreement_refs must be a non-empty array
    };
};
if ($@) {
    print "Validation error: $@\\n";
}`}
              </pre>
            </div>
            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Validation Rules:</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                <li><strong>pickup_unlocode/dropoff_unlocode:</strong> Required, non-empty, normalized to uppercase</li>
                <li><strong>pickup_iso/dropoff_iso:</strong> Required, valid ISO 8601 string, dropoff_iso must be after pickup_iso</li>
                <li><strong>driver_age:</strong> Required, must be between 18 and 100</li>
                <li><strong>currency:</strong> Required, non-empty, normalized to uppercase</li>
                <li><strong>agreement_refs:</strong> Required, non-empty array reference</li>
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

export default PerlGuide;

