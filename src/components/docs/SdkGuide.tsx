import React, { useState } from 'react';
import './docs.css';

type SdkType = 'javascript' | 'typescript' | 'go' | 'php' | 'python' | 'java' | 'perl';
type SectionType = 'quick-start' | 'installation' | 'availability' | 'bookings' | 'locations' | 'error-handling' | 'configuration';

const SdkGuide: React.FC<{ role?: 'agent' | 'source' | 'admin' }> = ({ role = 'agent' }) => {
  const [activeSdk, setActiveSdk] = useState<SdkType>('typescript');
  const [activeSection, setActiveSection] = useState<SectionType>('quick-start');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const prefaceText = {
    agent: 'Start here: login → approve agreement → availability → booking',
    source: 'Start here: login → offer agreement → locations → verification',
    admin: 'Start here: login → manage companies → agreements → health monitoring',
  };

  const sections: { id: SectionType; label: string }[] = [
    { id: 'quick-start', label: 'Quick Start' },
    { id: 'installation', label: 'Installation' },
    { id: 'availability', label: 'Availability' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'locations', label: 'Locations' },
    { id: 'error-handling', label: 'Error Handling' },
    { id: 'configuration', label: 'Configuration' },
  ];

  const sdks: { id: SdkType; name: string; icon: string }[] = [
    { id: 'typescript', name: 'TypeScript', icon: '📘' },
    { id: 'javascript', name: 'JavaScript', icon: '📦' },
    { id: 'go', name: 'Go', icon: '🐹' },
    { id: 'php', name: 'PHP', icon: '🐘' },
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'java', name: 'Java', icon: '☕' },
    { id: 'perl', name: 'Perl', icon: '🐪' },
  ];

  const renderSection = (sectionId: SectionType) => {
    switch (sectionId) {
      case 'quick-start':
        return renderQuickStart();
      case 'installation':
        return renderInstallation();
      case 'availability':
        return renderAvailability();
      case 'bookings':
        return renderBookings();
      case 'locations':
        return renderLocations();
      case 'error-handling':
        return renderErrorHandling();
      case 'configuration':
        return renderConfiguration();
      default:
        return null;
    }
  };

  // Complete section renderer implementations

  const renderAvailability = () => {
    const codes: Record<SdkType, string> = {
      typescript: `import { AvailabilityCriteria } from '@carhire/nodejs-sdk';

// Create search criteria
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

// Search and stream results
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
}`,
      javascript: `import { AvailabilityCriteria } from '@carhire/nodejs-sdk';

// Create search criteria
const criteria = AvailabilityCriteria.make({
  pickupLocode: 'PKKHI',
  returnLocode: 'PKLHE',
  pickupAt: new Date('2025-11-03T10:00:00Z'),
  returnAt: new Date('2025-11-05T10:00:00Z'),
  driverAge: 28,
  currency: 'USD',
  agreementRefs: ['AGR-001'],
});

// Search and stream results
for await (const chunk of client.getAvailability().search(criteria)) {
  console.log(\`[\${chunk.status}] items=\${chunk.items.length}\`);
  if (chunk.status === 'COMPLETE') break;
}`,
      go: `// Create search criteria
criteria := sdk.MakeAvailabilityCriteria(
    "PKKHI",
    "PKLHE",
    time.Date(2025, 11, 3, 10, 0, 0, 0, time.UTC),
    time.Date(2025, 11, 5, 10, 0, 0, 0, time.UTC),
    28,
    "USD",
    []string{"AGR-001"},
).WithVehiclePrefs([]string{"ECONOMY"})

// Search and stream results
resultChan, err := client.Availability().Search(ctx, criteria)
if err != nil {
    panic(err)
}

// Process results from channel
for result := range resultChan {
    if result.Error != nil {
        panic(result.Error)
    }
    chunk := result.Chunk
    cursor := 0
    if chunk.Cursor != nil {
        cursor = *chunk.Cursor
    }
    fmt.Printf("[%s] items=%d cursor=%d\\n", chunk.Status, len(chunk.Items), cursor)
    
    // Process offers as they arrive
    for _, offer := range chunk.Items {
        fmt.Println("Offer:", offer)
    }
    
    // Stop when complete
    if chunk.Status == "COMPLETE" {
        break
    }
}`,
      php: `use HMS\\CarHire\\DTO\\AvailabilityCriteria;

// Create search criteria
$criteria = AvailabilityCriteria::make(
    pickupLocode: 'PKKHI',
    returnLocode: 'PKLHE',
    pickupAt: new DateTimeImmutable('2025-11-03T10:00:00Z'),
    returnAt: new DateTimeImmutable('2025-11-05T10:00:00Z'),
    driverAge: 28,
    currency: 'USD',
    agreementRefs: ['AGR-001'],
    vehiclePrefs: ['ECONOMY'], // Optional
);

// Search and stream results
foreach ($client->availability()->search($criteria) as $chunk) {
    echo "[{$chunk->status}] items=" . count($chunk->items) . " cursor=" . ($chunk->cursor ?? 0) . "\\n";
    if ($chunk->status === 'COMPLETE') break;
}`,
      python: `from carhire import AvailabilityCriteria

# Create search criteria
criteria = AvailabilityCriteria.make(
    pickup_locode="PKKHI",
    return_locode="PKLHE",
    pickup_at=datetime.fromisoformat("2025-11-03T10:00:00Z"),
    return_at=datetime.fromisoformat("2025-11-05T10:00:00Z"),
    driver_age=28,
    currency="USD",
    agreement_refs=["AGR-001"],
    vehicle_prefs=["ECONOMY"],  # Optional
)

# Search and stream results
async for chunk in client.get_availability().search(criteria):
    print(f"[{chunk.status}] items={len(chunk.items)} cursor={chunk.cursor or 0}")
    if chunk.status == "COMPLETE":
        break`,
      java: `// Create search criteria
Map<String, Object> criteria = new HashMap<>();
criteria.put("pickup_unlocode", "PKKHI");
criteria.put("dropoff_unlocode", "PKLHE");
criteria.put("pickup_iso", "2025-11-03T10:00:00Z");
criteria.put("dropoff_iso", "2025-11-05T10:00:00Z");
criteria.put("driver_age", 28);
criteria.put("currency", "USD");
criteria.put("agreement_refs", Arrays.asList("AGR-001"));

// Search and stream results
client.getAvailability().search(criteria).forEach(chunkFuture -> {
    Map<String, Object> chunk = chunkFuture.join();
    System.out.println("Status: " + chunk.get("status"));
    if ("COMPLETE".equals(chunk.get("status"))) {
        // Process complete
    }
});`,
      perl: `# Create search criteria
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
}`,
    };
    return (
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Availability</h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Search for available vehicles using the Submit → Poll pattern with streaming results. Results arrive incrementally as suppliers respond.</p>
        <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
            {codes[activeSdk]}
          </pre>
        </div>
      </div>
    );
  };

  const renderBookings = () => {
    const codes: Record<SdkType, string> = {
      typescript: `import { BookingCreate } from '@carhire/nodejs-sdk';

// Create booking from availability offer
const booking = BookingCreate.fromOffer({
  agreement_ref: 'AGR-001',
  supplier_id: 'SRC-AVIS',
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
);`,
      javascript: `import { BookingCreate } from '@carhire/nodejs-sdk';

// Create booking from offer
const booking = BookingCreate.fromOffer({
  agreement_ref: 'AGR-001',
  supplier_id: 'SRC-AVIS',
  offer_id: 'off_123',
});

// Create booking
const result = await client.getBooking().create(booking, 'unique-idempotency-key-123');

// Modify, check, or cancel
await client.getBooking().modify(result.supplierBookingRef, { driver: { email: 'new@example.com' } }, 'AGR-001');
await client.getBooking().check(result.supplierBookingRef, 'AGR-001');
await client.getBooking().cancel(result.supplierBookingRef, 'AGR-001');`,
      go: `// Create booking from availability offer
booking := &sdk.BookingCreate{
    AgreementRef: "AGR-001",
    SupplierID: "SRC-AVIS",
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
}`,
      php: `use HMS\\CarHire\\DTO\\BookingCreate;

// Create booking from offer
$booking = BookingCreate::fromOffer([
    'agreement_ref' => 'AGR-001',
    'supplier_id' => 'SRC-AVIS',
    'offer_id' => 'off_123',
    'driver' => [
        'firstName' => 'Ali',
        'lastName' => 'Raza',
        'email' => 'ali@example.com',
        'phone' => '+92...',
        'age' => 28,
    ],
]);

// Create booking (requires Idempotency-Key)
$result = $client->booking()->create($booking, 'unique-idempotency-key-123');
echo 'Booking Reference: ' . ($result['supplierBookingRef'] ?? '');

// Modify booking (source_id is optional, backend resolves from agreement_ref)
$client->booking()->modify(
    $result['supplierBookingRef'],
    ['driver' => ['email' => 'newemail@example.com']],
    'AGR-001'
);

// Check booking status
$status = $client->booking()->check($result['supplierBookingRef'], 'AGR-001');

// Cancel booking
$client->booking()->cancel($result['supplierBookingRef'], 'AGR-001');`,
      python: `from carhire import BookingCreate

# Create booking from availability offer
booking = BookingCreate.from_offer({
    "agreement_ref": "AGR-001",
    "supplier_id": "SRC-AVIS",
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
await client.get_booking().cancel(result["supplierBookingRef"], "AGR-001")`,
      java: `// Create booking from availability offer
Map<String, Object> booking = new HashMap<>();
booking.put("agreement_ref", "AGR-001");
booking.put("supplier_id", "SRC-AVIS");
booking.put("offer_id", "off_123");

Map<String, Object> driver = new HashMap<>();
driver.put("firstName", "Ali");
driver.put("lastName", "Raza");
driver.put("email", "ali@example.com");
driver.put("phone", "+92...");
driver.put("age", 28);
booking.put("driver", driver);

// Create booking (requires Idempotency-Key)
Map<String, Object> result = client.getBooking().create(booking, "unique-idempotency-key-123").join();
System.out.println("Booking Reference: " + result.get("supplierBookingRef"));

// Modify booking
client.getBooking().modify(
    (String) result.get("supplierBookingRef"),
    Map.of("driver", Map.of("email", "newemail@example.com")),
    "AGR-001",
    null
).join();

// Check booking status
Map<String, Object> status = client.getBooking().check(
    (String) result.get("supplierBookingRef"),
    "AGR-001",
    null
).join();

// Cancel booking
client.getBooking().cancel(
    (String) result.get("supplierBookingRef"),
    "AGR-001",
    null
).join();`,
      perl: `# Create booking from availability offer
my $booking = {
    agreement_ref => 'AGR-001',
    supplier_id   => 'SRC-AVIS',
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
$client->booking()->cancel($result->{supplierBookingRef}, 'AGR-001', undef);`,
    };
    return (
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Bookings</h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Create, modify, cancel, and check booking status. All booking creation operations require an Idempotency-Key to prevent duplicate bookings.</p>
        <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
            {codes[activeSdk]}
          </pre>
        </div>
      </div>
    );
  };

  const renderLocations = () => {
    const codes: Record<SdkType, string> = {
      typescript: `// Check if a location is supported by an agreement
const isSupported = await client.getLocations().isSupported('AGR-001', 'PKKHI');
if (isSupported) {
  console.log('Location PKKHI is supported by agreement AGR-001');
}

// Note: For searching UN/LOCODE locations or getting agreement coverage,
// use the REST API endpoints directly:
// GET /locations?query=Manchester
// GET /coverage/agreement/{agreementId}`,
      javascript: `// Check if location is supported
const isSupported = await client.getLocations().isSupported('AGR-001', 'PKKHI');
console.log('Supported:', isSupported);`,
      go: `// Check if location is supported
isSupported, err := client.Locations().IsSupported(ctx, "AGR-001", "PKKHI")
if err != nil {
    panic(err)
}
fmt.Printf("Location supported: %v\\n", isSupported)`,
      php: `// Check if a location is supported by an agreement
$isSupported = $client->locations()->isSupported('AGR-001', 'PKKHI');
if ($isSupported) {
    echo "Location PKKHI is supported by agreement AGR-001\\n";
}

// Note: For searching UN/LOCODE locations or getting agreement coverage,
// use the REST API endpoints directly:
// GET /locations?query=Manchester
// GET /coverage/agreement/{agreementId}`,
      python: `# Check if location is supported
is_supported = await client.get_locations().is_supported("AGR-001", "PKKHI")
print(f"Location supported: {is_supported}")`,
      java: `// Check if location is supported
Boolean isSupported = client.getLocations().isSupported("AGR-001", "PKKHI").join();
System.out.println("Location supported: " + isSupported);`,
      perl: `# Check if location is supported
my $is_supported = $client->locations()->is_supported('AGR-001', 'PKKHI');
print "Location supported: " . ($is_supported ? 'yes' : 'no') . "\\n";`,
    };
    return (
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Locations</h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Check if a UN/LOCODE location is supported by a specific agreement. For searching locations or getting full agreement coverage, use the REST API endpoints directly.</p>
        <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
            {codes[activeSdk]}
          </pre>
        </div>
      </div>
    );
  };


  const renderErrorHandling = () => {
    const codes: Record<SdkType, string> = {
      typescript: `import { TransportException } from '@carhire/nodejs-sdk';

try {
  await client.getBooking().create(booking, 'idem-123');
} catch (error) {
  if (error instanceof TransportException) {
    console.error('Status:', error.statusCode);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
  }
}`,
      javascript: `import { TransportException } from '@carhire/nodejs-sdk';

try {
  await client.getBooking().create(booking, 'idem-123');
} catch (error) {
  if (error instanceof TransportException) {
    console.error('Status:', error.statusCode);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
  }
}`,
      go: `result, err := client.Booking().Create(ctx, booking, "idem-123")
if err != nil {
    if sdkErr, ok := err.(*sdk.TransportException); ok {
        fmt.Printf("Status: %d\\n", sdkErr.StatusCode)
        fmt.Printf("Code: %s\\n", sdkErr.Code)
        fmt.Printf("Message: %s\\n", sdkErr.Message)
    }
    return err
}`,
      php: `use HMS\\CarHire\\Exceptions\\TransportException;

try {
    $result = $client->booking()->create($booking, 'idem-123');
} catch (TransportException $e) {
    echo "Status: {$e->statusCode}\\n";
    echo "Code: {$e->code}\\n";
    echo "Message: {$e->getMessage()}\\n";
}`,
      python: `from carhire import TransportException

try:
    result = await client.get_booking().create(booking, "idem-123")
except TransportException as e:
    print(f"Status: {e.status_code}")
    print(f"Code: {e.code}")
    print(f"Message: {e.message}")`,
      java: `try {
    Map<String, Object> result = client.getBooking().create(booking, "idem-123").join();
} catch (TransportException e) {
    System.out.println("Status: " + e.getStatusCode());
    System.out.println("Code: " + e.getCode());
    System.out.println("Message: " + e.getMessage());
}`,
      perl: `eval {
    my $result = $client->booking()->create($booking, 'idem-123');
} or do {
    my $error = $@;
    if (blessed($error) && $error->isa('CarHire::SDK::TransportException')) {
        print "Status: " . $error->status_code . "\\n";
        print "Code: " . $error->code . "\\n";
        print "Message: " . $error->message . "\\n";
    }
};`,
    };
    return (
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Error Handling</h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Handle errors properly with structured error information.</p>
        <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
            {codes[activeSdk]}
          </pre>
        </div>
      </div>
    );
  };

  const renderConfiguration = () => {
    const codes: Record<SdkType, string> = {
      typescript: `// REST Configuration
const config = Config.forRest({
  baseUrl: 'https://your-gateway.example.com', // Required
  token: 'Bearer <JWT>', // Required
  apiKey: '<API_KEY>', // Optional: prefer API key auth
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
  agentId: 'ag_123',
});`,
      javascript: `// REST Configuration
const config = Config.forRest({
  baseUrl: 'https://your-gateway.example.com',
  token: 'Bearer <JWT>',
  apiKey: '<API_KEY>',
  agentId: 'ag_123',
});`,
      go: `// REST Configuration
config := sdk.ForRest(sdk.ConfigData{
    BaseURL: "https://your-gateway.example.com", // Required
    Token: "Bearer <JWT>", // Required
    APIKey: "<API_KEY>", // Optional
    AgentID: "ag_123",
    CallTimeoutMs: 10000,
    AvailabilitySlaMs: 120000,
    LongPollWaitMs: 10000,
})

// gRPC Configuration
grpcConfig := sdk.ForGrpc(sdk.ConfigData{
    Host: "api.example.com:50051", // Required
    CACert: "<CA_CERT>", // Required
    ClientCert: "<CLIENT_CERT>", // Required
    ClientKey: "<CLIENT_KEY>", // Required
    AgentID: "ag_123", // Optional
})`,
      php: `// REST Configuration
$config = Config::forRest([
    'baseUrl' => 'https://your-gateway.example.com', // Required
    'token' => 'Bearer <JWT>', // Required
    'apiKey' => '<API_KEY>', // Optional
    'agentId' => 'ag_123',
    'callTimeoutMs' => 12000,
    'availabilitySlaMs' => 120000,
    'longPollWaitMs' => 10000,
]);

// gRPC Configuration
$grpcConfig = Config::forGrpc([
    'host' => 'api.example.com:50051',
    'caCert' => '<CA_CERT>',
    'clientCert' => '<CLIENT_CERT>',
    'clientKey' => '<CLIENT_KEY>',
]);`,
      python: `# REST Configuration
config = Config.for_rest({
    "baseUrl": "https://your-gateway.example.com",  # Required
    "token": "Bearer <JWT>",  # Required
    "apiKey": "<API_KEY>",  # Optional
    "agentId": "ag_123",
    "callTimeoutMs": 12000,
    "availabilitySlaMs": 120000,
    "longPollWaitMs": 10000,
})

# gRPC Configuration
grpc_config = Config.for_grpc({
    "host": "api.example.com:50051",
    "caCert": "<CA_CERT>",
    "clientCert": "<CLIENT_CERT>",
    "clientKey": "<CLIENT_KEY>",
})`,
      java: `// REST Configuration
Map<String, Object> configData = new HashMap<>();
configData.put("baseUrl", "https://your-gateway.example.com"); // Required
configData.put("token", "Bearer <JWT>"); // Required
configData.put("apiKey", "<API_KEY>"); // Optional
configData.put("agentId", "ag_123");
configData.put("callTimeoutMs", 12000);
configData.put("availabilitySlaMs", 120000);
configData.put("longPollWaitMs", 10000);

Config config = Config.forRest(configData);`,
      perl: `# REST Configuration
my $config = CarHire::SDK::Config->for_rest({
    baseUrl => 'https://your-gateway.example.com',  # Required
    token   => 'Bearer <JWT>',                      # Required
    apiKey  => '<API_KEY>',                         # Optional
    agentId => 'ag_123',
    callTimeoutMs     => 12000,
    availabilitySlaMs => 120000,
    longPollWaitMs    => 10000,
});

# gRPC Configuration
my $grpc_config = CarHire::SDK::Config->for_grpc({
    host       => 'api.example.com:50051',
    caCert     => '<CA_CERT>',
    clientCert => '<CLIENT_CERT>',
    clientKey  => '<CLIENT_KEY>',
});`,
    };
    return (
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Configuration</h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Configure the SDK with REST or gRPC transport, timeouts, and other settings.</p>
        <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
            {codes[activeSdk]}
          </pre>
        </div>
      </div>
    );
  };

  const renderQuickStart = () => {
    const codeSnippets: Record<SdkType, string> = {
      typescript: `import { CarHireClient, Config, AvailabilityCriteria, BookingCreate } from '@carhire/nodejs-sdk';

const config = Config.forRest({
  baseUrl: 'https://your-gateway.example.com',
  token: 'Bearer <JWT>',
  apiKey: '<YOUR_API_KEY>', // Optional
  agentId: 'ag_123',
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
});

for await (const chunk of client.getAvailability().search(criteria)) {
  console.log(\`[\${chunk.status}] items=\${chunk.items.length} cursor=\${chunk.cursor ?? 0}\`);
  if (chunk.status === 'COMPLETE') break;
}

// Create booking
const booking = BookingCreate.fromOffer({
  agreement_ref: 'AGR-001',
  supplier_id: 'SRC-AVIS',
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
console.log(result.supplierBookingRef);`,
      javascript: `import { CarHireClient, Config, AvailabilityCriteria, BookingCreate } from '@carhire/nodejs-sdk';

const config = Config.forRest({
  baseUrl: 'https://your-gateway.example.com',
  token: 'Bearer <JWT>',
  apiKey: '<YOUR_API_KEY>', // Optional
  agentId: 'ag_123',
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
});

for await (const chunk of client.getAvailability().search(criteria)) {
  console.log(\`[\${chunk.status}] items=\${chunk.items.length}\`);
  if (chunk.status === 'COMPLETE') break;
}

// Create booking
const booking = BookingCreate.fromOffer({
  agreement_ref: 'AGR-001',
  supplier_id: 'SRC-AVIS',
  offer_id: 'off_123',
});

const result = await client.getBooking().create(booking, 'idem-123');`,
      go: `package main

import (
    "context"
    "fmt"
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
    
    // Search availability
    criteria := sdk.MakeAvailabilityCriteria(
        "PKKHI",
        "PKLHE",
        time.Date(2025, 11, 3, 10, 0, 0, 0, time.UTC),
        time.Date(2025, 11, 5, 10, 0, 0, 0, time.UTC),
        28,
        "USD",
        []string{"AGR-001"},
    )
    
    resultChan, err := client.Availability().Search(ctx, criteria)
    if err != nil {
        panic(err)
    }
    
    for result := range resultChan {
        if result.Error != nil {
            panic(result.Error)
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
    booking := &sdk.BookingCreate{
        AgreementRef: "AGR-001",
        SupplierID: "SRC-AVIS",
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
}`,
      php: `<?php

require_once 'vendor/autoload.php';

use HMS\\CarHire\\Config;
use HMS\\CarHire\\CarHireClient;
use HMS\\CarHire\\DTO\\AvailabilityCriteria;
use HMS\\CarHire\\DTO\\BookingCreate;

$config = Config::forRest([
    'baseUrl' => 'https://your-gateway.example.com',
    'token' => 'Bearer <JWT>',
    'apiKey' => '<YOUR_API_KEY>', // Optional
    'agentId' => 'ag_123',
    'callTimeoutMs' => 12000,
    'availabilitySlaMs' => 120000,
    'longPollWaitMs' => 10000,
]);

$client = new CarHireClient($config);

// Search availability
$criteria = AvailabilityCriteria::make(
    pickupLocode: 'PKKHI',
    returnLocode: 'PKLHE',
    pickupAt: new DateTimeImmutable('2025-11-03T10:00:00Z'),
    returnAt: new DateTimeImmutable('2025-11-05T10:00:00Z'),
    driverAge: 28,
    currency: 'USD',
    agreementRefs: ['AGR-001']
);

foreach ($client->availability()->search($criteria) as $chunk) {
    echo "[{$chunk->status}] items=" . count($chunk->items) . " cursor=" . ($chunk->cursor ?? 0) . "\\n";
    if ($chunk->status === 'COMPLETE') break;
}

// Create booking
$booking = BookingCreate::fromOffer([
    'agreement_ref' => 'AGR-001',
    'supplier_id' => 'SRC-AVIS',
    'offer_id' => 'off_123',
    'driver' => [
        'firstName' => 'Ali',
        'lastName' => 'Raza',
        'email' => 'ali@example.com',
        'phone' => '+92...',
        'age' => 28,
    ],
]);

$result = $client->booking()->create($booking, 'idem-123');
echo $result['supplierBookingRef'] ?? '';`,
      python: `from datetime import datetime
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

client = CarHireClient(config)

# Search availability
criteria = AvailabilityCriteria.make(
    pickup_locode="PKKHI",
    return_locode="PKLHE",
    pickup_at=datetime.fromisoformat("2025-11-03T10:00:00Z"),
    return_at=datetime.fromisoformat("2025-11-05T10:00:00Z"),
    driver_age=28,
    currency="USD",
    agreement_refs=["AGR-001"],
)

async for chunk in client.get_availability().search(criteria):
    print(f"[{chunk.status}] items={len(chunk.items)} cursor={chunk.cursor or 0}")
    if chunk.status == "COMPLETE":
        break

# Create booking
booking = BookingCreate.from_offer({
    "agreement_ref": "AGR-001",
    "supplier_id": "SRC-AVIS",
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
print(result["supplierBookingRef"])`,
      java: `import com.carhire.sdk.*;
import java.util.*;

Map<String, Object> configData = new HashMap<>();
configData.put("baseUrl", "https://your-gateway.example.com");
configData.put("token", "Bearer <JWT>");
configData.put("apiKey", "<YOUR_API_KEY>"); // Optional
configData.put("agentId", "ag_123");
configData.put("callTimeoutMs", 12000);
configData.put("availabilitySlaMs", 120000);
configData.put("longPollWaitMs", 10000);

Config config = Config.forRest(configData);
CarHireClient client = new CarHireClient(config);

// Search availability
Map<String, Object> criteria = new HashMap<>();
criteria.put("pickup_unlocode", "PKKHI");
criteria.put("dropoff_unlocode", "PKLHE");
criteria.put("pickup_iso", "2025-11-03T10:00:00Z");
criteria.put("dropoff_iso", "2025-11-05T10:00:00Z");
criteria.put("driver_age", 28);
criteria.put("currency", "USD");
criteria.put("agreement_refs", Arrays.asList("AGR-001"));

client.getAvailability().search(criteria).forEach(chunkFuture -> {
    Map<String, Object> chunk = chunkFuture.join();
    System.out.println("Status: " + chunk.get("status"));
    if ("COMPLETE".equals(chunk.get("status"))) {
        // Process complete
    }
});

// Create booking
Map<String, Object> booking = new HashMap<>();
booking.put("agreement_ref", "AGR-001");
booking.put("supplier_id", "SRC-AVIS");
booking.put("offer_id", "off_123");

Map<String, Object> driver = new HashMap<>();
driver.put("firstName", "Ali");
driver.put("lastName", "Raza");
driver.put("email", "ali@example.com");
driver.put("phone", "+92...");
driver.put("age", 28);
booking.put("driver", driver);

Map<String, Object> result = client.getBooking().create(booking, "idem-123").join();
System.out.println(result.get("supplierBookingRef"));`,
      perl: `use CarHire::SDK;

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
my $booking = {
    agreement_ref => 'AGR-001',
    supplier_id   => 'SRC-AVIS',
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
print $result->{supplierBookingRef}, "\\n";`,
    };

    return (
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Quick Start</h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Get up and running with the {sdks.find(s => s.id === activeSdk)?.name} SDK in minutes.</p>
        <div style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginTop: '1rem' }}>
          <pre style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
            {codeSnippets[activeSdk]}
          </pre>
        </div>
      </div>
    );
  };

  const renderInstallation = () => {
    const installCommands: Record<SdkType, string> = {
      typescript: `npm install @carhire/nodejs-sdk
# or
yarn add @carhire/nodejs-sdk
# or
pnpm add @carhire/nodejs-sdk`,
      javascript: `npm install @carhire/nodejs-sdk
# or
yarn add @carhire/nodejs-sdk
# or
pnpm add @carhire/nodejs-sdk`,
      go: `go get github.com/carhire/go-sdk
# or locally
go mod init your-project
go get ./go-agent`,
      php: `composer require hmstech/carhire-php-sdk
# or locally
cd sdks/php-agent
composer install`,
      python: `pip install carhire-python-sdk
# or locally
pip install -e .`,
      java: `<dependency>
  <groupId>com.carhire</groupId>
  <artifactId>carhire-java-sdk</artifactId>
  <version>1.0.0</version>
</dependency>
# or locally
mvn install`,
      perl: `perl Makefile.PL
make
make install
# or using cpanm
cpanm --installdeps .
cpanm .`,
    };

    return (
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>Installation</h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Install the {sdks.find(s => s.id === activeSdk)?.name} SDK using your package manager.</p>
        <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
          <pre style={{ margin: 0, fontSize: '0.875rem', fontFamily: 'Monaco, Menlo, monospace', whiteSpace: 'pre-wrap' }}>
            {installCommands[activeSdk]}
          </pre>
        </div>
      </div>
    );
  };

  // Due to character limit, I'll create a more concise version focusing on structure
  // The complete implementation would include all section renderers
  
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', backgroundColor: '#fafafa' }}>
      {/* Sidebar */}
      <aside 
        style={{ 
          width: sidebarOpen ? '280px' : '0',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          transition: 'width 0.2s ease-in-out',
          overflow: 'hidden',
          position: 'sticky',
          top: 0,
          height: 'calc(100vh - 80px)',
          overflowY: 'auto',
          flexShrink: 0,
          boxShadow: sidebarOpen ? '2px 0 4px rgba(0,0,0,0.05)' : 'none'
        }}
        className="sdk-sidebar"
      >
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', margin: 0 }}>SDK Guide</h2>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'none',
                border: '1px solid #e5e7eb',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                padding: '0.375rem 0.5rem',
                color: '#6b7280',
                fontSize: '0.75rem',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>
          
          {sidebarOpen && (
            <>
              {/* SDK Selector */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
                  Select SDK
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {sdks.map((sdk) => (
                    <button
                      key={sdk.id}
                      onClick={() => {
                        setActiveSdk(sdk.id);
                        setActiveSection('quick-start');
                      }}
                      style={{
                        padding: '0.75rem',
                        textAlign: 'left',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                        backgroundColor: activeSdk === sdk.id ? '#f1f5f9' : 'white',
                        color: activeSdk === sdk.id ? '#111827' : '#6b7280',
                        fontWeight: activeSdk === sdk.id ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        if (activeSdk !== sdk.id) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeSdk !== sdk.id) {
                          e.currentTarget.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      <span>{sdk.icon}</span>
                      <span>{sdk.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Navigation */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
                  Sections
                </label>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      style={{
                        padding: '0.625rem 0.75rem',
                        textAlign: 'left',
                        border: 'none',
                        backgroundColor: activeSection === section.id ? '#f1f5f9' : 'transparent',
                        color: activeSection === section.id ? '#111827' : '#6b7280',
                        fontWeight: activeSection === section.id ? 600 : 400,
                        cursor: 'pointer',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => {
                        if (activeSection !== section.id) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeSection !== section.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {section.label}
                    </button>
                  ))}
                </nav>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1000px', margin: '0 auto', minWidth: 0 }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>
            {sdks.find(s => s.id === activeSdk)?.name} SDK
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>
            Production-ready SDK for integrating with Gloria Connect API
          </p>
        </div>

        {role && (
          <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }}>
            <p style={{ margin: 0, fontWeight: 600, color: '#334155', fontSize: '0.875rem' }}>
              {prefaceText[role]}
            </p>
          </div>
        )}

        <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '2rem' }}>
          {renderSection(activeSection)}
        </div>
      </main>
    </div>
  );
};

export default SdkGuide;
