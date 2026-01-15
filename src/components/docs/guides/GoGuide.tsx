import React from 'react';

type SectionType = 'quick-start' | 'installation' | 'availability' | 'bookings' | 'locations' | 'error-handling' | 'configuration' | 'testing' | 'troubleshooting' | 'best-practices' | 'api-reference' | 'input-validation';

interface GoGuideProps {
  activeSection: SectionType;
}

const GoGuide: React.FC<GoGuideProps> = ({ activeSection }) => {
  const renderSection = () => {
    switch (activeSection) {
      case 'quick-start':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Quick Start</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Get up and running with the Go SDK. This example demonstrates availability search and booking creation using Go idioms.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
{`package main

import (
    "context"
    "fmt"
    "log"
    "time"
    "github.com/carhire/go-sdk"
)

func main() {
    config := sdk.ForRest(sdk.ConfigData{
        BaseURL: "https://your-gateway.example.com",
        Token: "Bearer <JWT>",
        APIKey: "<YOUR_API_KEY>", // Optional
        AgentID: "ag_123",
        CallTimeoutMs: 12000,
        AvailabilitySlaMs: 120000,
        LongPollWaitMs: 10000,
    })
    
    client := sdk.NewClient(config)
    ctx := context.Background()
    
    // Search availability (with validation)
    criteria, err := sdk.MakeAvailabilityCriteria(
        "PKKHI",
        "PKLHE",
        time.Date(2025, 11, 3, 10, 0, 0, 0, time.UTC),
        time.Date(2025, 11, 5, 10, 0, 0, 0, time.UTC),
        28,
        "USD",
        []string{"AGR-001"},
    )
    if err != nil {
        log.Fatal(err)
    }
    
    resultChan, err := client.Availability().Search(ctx, criteria)
    if err != nil {
        panic(err)
    }
    
    for result := range resultChan {
        if result.Error != nil {
            fmt.Printf("Error: %v\\n", result.Error)
            break
        }
        chunk := result.Chunk
        cursor := 0
        if chunk.Cursor != nil {
            cursor = *chunk.Cursor
        }
        fmt.Printf("[%s] items=%d cursor=%d\\n", chunk.Status, len(chunk.Items), cursor)
        if chunk.Status == "COMPLETE" {
            break
        }
    }
    
    // Create booking
    // Note: SupplierID is not required - backend resolves source_id from agreement_ref
    booking := &sdk.BookingCreate{
        AgreementRef: "AGR-001",
        OfferID: "off_123",
        Driver: &sdk.Driver{
            FirstName: "Ali",
            LastName: "Raza",
            Email: "ali@example.com",
            Phone: "+92...",
            Age: 28,
        },
    }
    
    result, err := client.Booking().Create(ctx, booking, "idem-123")
    if err != nil {
        panic(err)
    }
    fmt.Println(result.SupplierBookingRef)
}`}
              </pre>
            </div>
            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Key Points:</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                <li>Uses Go channels for async iteration (idiomatic Go pattern)</li>
                <li>Context is required for all operations</li>
                <li>Error handling follows Go conventions</li>
                <li>Results arrive via channel with error handling</li>
              </ul>
            </div>
          </div>
        );

      case 'installation':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Installation</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Install the Go SDK using go get or add to your go.mod file.
            </p>
            <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`# Using go get
go get github.com/carhire/go-sdk

# Or add to go.mod
go mod init your-project
go get ./go-agent`}
              </pre>
            </div>
            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Requirements:</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                <li>Go 1.18+</li>
                <li>Uses standard library net/http for HTTP requests</li>
                <li>Uses context.Context for cancellation and timeouts</li>
              </ul>
            </div>
          </div>
        );

      case 'availability':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Availability</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Search for available vehicles using Go channels for streaming results.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`import (
    "context"
    "fmt"
    "time"
    "github.com/carhire/go-sdk"
)

// Create search criteria (with validation)
criteria, err := sdk.MakeAvailabilityCriteria(
    "PKKHI",
    "PKLHE",
    time.Date(2025, 11, 3, 10, 0, 0, 0, time.UTC),
    time.Date(2025, 11, 5, 10, 0, 0, 0, time.UTC),
    28,
    "USD",
    []string{"AGR-001"},
)
if err != nil {
    log.Fatal(err)
}

// Search and stream results via channel
ctx := context.Background()
resultChan, err := client.Availability().Search(ctx, criteria)
if err != nil {
    log.Fatal(err)
}

// Process results from channel
for result := range resultChan {
    if result.Error != nil {
        fmt.Printf("Error: %v\\n", result.Error)
        break
    }
    chunk := result.Chunk
    fmt.Printf("[%s] items=%d cursor=%d\\n", chunk.Status, len(chunk.Items), chunk.Cursor)
    
    // Process offers as they arrive
    for _, offer := range chunk.Items {
        fmt.Println("Offer:", offer)
    }
    
    // Stop when complete
    if chunk.Status == "COMPLETE" {
        break
    }
}`}
              </pre>
            </div>
            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>How It Works:</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                <li><strong>Channel-based:</strong> Results arrive via Go channel (idiomatic pattern)</li>
                <li><strong>Error Handling:</strong> Check result.Error for each chunk</li>
                <li><strong>Context:</strong> Use context for cancellation and timeouts</li>
                <li><strong>Status:</strong> PARTIAL (more coming) or COMPLETE (all done)</li>
              </ul>
            </div>
          </div>
        );

      case 'bookings':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Bookings</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Create, modify, cancel, and check booking status using Go patterns.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`// Create booking from availability offer
// Note: SupplierID is not required - backend resolves source_id from agreement_ref
booking := &sdk.BookingCreate{
    AgreementRef: "AGR-001",
    OfferID: "off_123",
    Driver: &sdk.Driver{
        FirstName: "Ali",
        LastName: "Raza",
        Email: "ali@example.com",
        Phone: "+92...",
        Age: 28,
    },
}

// Create booking (requires Idempotency-Key)
result, err := client.Booking().Create(ctx, booking, "unique-idempotency-key-123")
if err != nil {
    panic(err)
}
fmt.Println("Booking Reference:", result.SupplierBookingRef)

// Modify booking (sourceID can be empty string, backend resolves from agreement_ref)
modifyResult, err := client.Booking().Modify(ctx, result.SupplierBookingRef, 
    map[string]interface{}{"driver": map[string]interface{}{"email": "newemail@example.com"}},
    "AGR-001", "")
if err != nil {
    panic(err)
}

// Check booking status
status, err := client.Booking().Check(ctx, result.SupplierBookingRef, "AGR-001", "")
if err != nil {
    panic(err)
}

// Cancel booking
cancelResult, err := client.Booking().Cancel(ctx, result.SupplierBookingRef, "AGR-001", "")
if err != nil {
    panic(err)
}`}
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
{`// Check if location is supported
isSupported, err := client.Locations().IsSupported(ctx, "AGR-001", "PKKHI")
if err != nil {
    panic(err)
}
fmt.Printf("Location supported: %v\\n", isSupported)`}
              </pre>
            </div>
          </div>
        );

      case 'error-handling':
        return (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Error Handling</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Handle errors properly with Go error handling patterns.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`result, err := client.Booking().Create(ctx, booking, "idem-123")
if err != nil {
    if sdkErr, ok := err.(*sdk.TransportException); ok {
        fmt.Printf("Status: %d\\n", sdkErr.StatusCode)
        fmt.Printf("Code: %s\\n", sdkErr.Code)
        fmt.Printf("Message: %s\\n", sdkErr.Message)
    }
    return err
}`}
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
{`// REST Configuration
config := sdk.ForRest(sdk.ConfigData{
    BaseURL: "https://your-gateway.example.com", // Required
    Token: "Bearer <JWT>", // Required
    APIKey: "<API_KEY>", // Optional
    AgentID: "ag_123", // Optional
    CallTimeoutMs: 10000, // Default: 10000
    AvailabilitySlaMs: 120000, // Default: 120000
    LongPollWaitMs: 10000, // Default: 10000
})

// gRPC Configuration
grpcConfig := sdk.ForGrpc(sdk.ConfigData{
    Host: "api.example.com:50051", // Required
    CACert: "<CA_CERT>", // Required
    ClientCert: "<CLIENT_CERT>", // Required
    ClientKey: "<CLIENT_KEY>", // Required
    AgentID: "ag_123", // Optional
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
{`// Setup environment variables
export BASE_URL=http://localhost:8080
export JWT_TOKEN=your_access_token_here
export AGENT_ID=your_agent_id_here
export AGREEMENT_REF=AGR-001

// Run test
go run examples/test_availability.go`}
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
                  Ensure environment variable <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>JWT_TOKEN</code> is set or Token is provided in ConfigData. Verify token is valid by checking backend logs.
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Validation Error: pickupLocode is required</h4>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  Ensure locode is 5 characters (UN/LOCODE format). Example: <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>PKKHI</code>, <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>PKLHE</code>, <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>USNYC</code>. Locodes are automatically normalized to uppercase.
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>returnAt must be after pickupAt</h4>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  Ensure return time is after pickup time. Use <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>time.Date()</code> or <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>time.Parse()</code> to create valid time.Time values.
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Channel closed unexpectedly</h4>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  Check <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>result.Error</code> for each chunk. The channel closes on error or completion.
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
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: '#111827' }}>Context Usage</h3>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                Always use context.Context for cancellation and timeouts. Use <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>context.WithTimeout()</code> for request timeouts.
              </p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: '#111827' }}>Channel Error Handling</h3>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                Always check <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>result.Error</code> for each chunk received from the channel. Break the loop on error.
              </p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: '#111827' }}>Idempotency</h3>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                Always use unique idempotency keys for booking creation. Store keys for retry scenarios.
              </p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: '#111827' }}>Error Wrapping</h3>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                Use <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>fmt.Errorf()</code> or <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>errors.Wrap()</code> to add context to errors.
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
              The SDK automatically validates inputs before sending requests. Invalid inputs will return errors immediately.
            </p>
            <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
{`// Invalid input will return an error
criteria, err := sdk.MakeAvailabilityCriteria(
    "", // Error: pickupLocode is required
    "PKLHE",
    time.Date(2025, 11, 3, 10, 0, 0, 0, time.UTC),
    time.Date(2025, 11, 1, 10, 0, 0, 0, time.UTC), // Error: returnAt must be after pickupAt
    17, // Error: driverAge must be between 18 and 100
    "USD",
    []string{}, // Error: agreementRefs must be a non-empty array
)
if err != nil {
    log.Fatal("Validation error:", err)
}`}
              </pre>
            </div>
            <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>Validation Rules:</h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569' }}>
                <li><strong>pickupLocode/returnLocode:</strong> Required, non-empty, normalized to uppercase</li>
                <li><strong>pickupAt/returnAt:</strong> Required, valid time.Time, returnAt must be after pickupAt</li>
                <li><strong>driverAge:</strong> Required, must be between 18 and 100</li>
                <li><strong>currency:</strong> Required, non-empty, normalized to uppercase</li>
                <li><strong>agreementRefs:</strong> Required, non-empty slice</li>
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

export default GoGuide;

