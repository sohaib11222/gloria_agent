import React from 'react';
import './docs.css';

const GettingStartedGuide: React.FC = () => {
  return (
    <div className="docs-main" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Getting Started Guide for Agents</h1>
      <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '2rem' }}>
        Welcome! This guide will walk you through everything you need to know to start using the Car Hire Middleware as an Agent (OTA).
      </p>

      {/* Overview */}
      <section style={{ marginBottom: '3rem', padding: '1.5rem', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '0.5rem' }}>
        <h2 style={{ marginTop: 0 }}>What is an Agent?</h2>
        <p>
          As an <strong>Agent</strong> (Online Travel Agency), you connect customers to car rental suppliers (Sources). 
          You search for availability, display options to customers, and create bookings on their behalf.
        </p>
        <p style={{ marginBottom: 0 }}>
          <strong>Your main responsibilities:</strong>
        </p>
        <ul>
          <li>Accept agreements from car rental suppliers</li>
          <li>Search for vehicle availability</li>
          <li>Create and manage bookings</li>
          <li>Handle customer inquiries and modifications</li>
        </ul>
      </section>

      {/* Step 1 */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ 
            width: '3rem', 
            height: '3rem', 
            borderRadius: '50%', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '1.5rem', 
            fontWeight: 'bold' 
          }}>
            1
          </div>
          <h2 style={{ margin: 0 }}>Account Setup & Login</h2>
        </div>
        
        <div style={{ paddingLeft: '4rem' }}>
          <h3>Initial Setup</h3>
          <ol style={{ lineHeight: '1.8' }}>
            <li>
              <strong>Contact Admin:</strong> Your account must be created by a system administrator. 
              Contact your admin to get your login credentials.
            </li>
            <li>
              <strong>Login:</strong> Navigate to the Agent UI and log in with your email and password.
            </li>
            <li>
              <strong>Verify Account:</strong> Ensure your account status is <code style={{ backgroundColor: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>ACTIVE</code>. 
              If it's <code style={{ backgroundColor: '#fef3c7', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>PENDING_VERIFICATION</code>, 
              contact admin for activation.
            </li>
          </ol>

          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '0.5rem' }}>
            <strong>💡 Tip:</strong> Save your API token from the Dashboard - you'll need it for API integration.
          </div>
        </div>
      </section>

      {/* Step 2 */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ 
            width: '3rem', 
            height: '3rem', 
            borderRadius: '50%', 
            backgroundColor: '#10b981', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '1.5rem', 
            fontWeight: 'bold' 
          }}>
            2
          </div>
          <h2 style={{ margin: 0 }}>Accept Agreements</h2>
        </div>
        
        <div style={{ paddingLeft: '4rem' }}>
          <h3>Understanding Agreements</h3>
          <p>
            An <strong>Agreement</strong> is a business contract between you (Agent) and a car rental supplier (Source). 
            You must accept an agreement before you can search for availability or create bookings with that supplier.
          </p>

          <h3>How to Accept an Agreement</h3>
          <ol style={{ lineHeight: '1.8' }}>
            <li>
              <strong>Go to Agreements Tab:</strong> Navigate to the "Agreements" section in the sidebar.
            </li>
            <li>
              <strong>View Pending Offers:</strong> Look for agreements with status <code style={{ backgroundColor: '#dbeafe', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>OFFERED</code>.
            </li>
            <li>
              <strong>Review Details:</strong> Check the agreement reference, validity dates, and source company information.
            </li>
            <li>
              <strong>Accept:</strong> Click the "Accept" button to activate the agreement. Status will change to <code style={{ backgroundColor: '#d1fae5', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>ACTIVE</code>.
            </li>
          </ol>

          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '0.5rem' }}>
            <strong>✅ Important:</strong> Only <code>ACTIVE</code> agreements can be used for availability searches and bookings.
          </div>
        </div>
      </section>

      {/* Step 3 */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ 
            width: '3rem', 
            height: '3rem', 
            borderRadius: '50%', 
            backgroundColor: '#8b5cf6', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '1.5rem', 
            fontWeight: 'bold' 
          }}>
            3
          </div>
          <h2 style={{ margin: 0 }}>Browse Available Locations</h2>
        </div>
        
        <div style={{ paddingLeft: '4rem' }}>
          <h3>Understanding Locations</h3>
          <p>
            Locations are identified by <strong>UN/LOCODE</strong> (United Nations Location Code), a standardized format 
            like <code>GBMAN</code> (Manchester, UK) or <code>USNYC</code> (New York, USA).
          </p>

          <h3>How to Browse Locations</h3>
          <ol style={{ lineHeight: '1.8' }}>
            <li>
              <strong>Go to Locations Tab:</strong> Navigate to the "Locations" section in the sidebar.
            </li>
            <li>
              <strong>Search:</strong> Use the search box to find locations by city name, country, or UN/LOCODE.
            </li>
            <li>
              <strong>Filter by Agreement:</strong> Optionally filter to see only locations available for a specific agreement.
            </li>
            <li>
              <strong>View Details:</strong> Each location shows country, place name, IATA code (if available), and coordinates.
            </li>
          </ol>

          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#faf5ff', border: '1px solid #c084fc', borderRadius: '0.5rem' }}>
            <strong>📍 Note:</strong> Not all locations may be available for all agreements. Check agreement-specific coverage in the Agreements tab.
          </div>
        </div>
      </section>

      {/* Step 4 */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ 
            width: '3rem', 
            height: '3rem', 
            borderRadius: '50%', 
            backgroundColor: '#f59e0b', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '1.5rem', 
            fontWeight: 'bold' 
          }}>
            4
          </div>
          <h2 style={{ margin: 0 }}>Search for Availability</h2>
        </div>
        
        <div style={{ paddingLeft: '4rem' }}>
          <h3>How Availability Works</h3>
          <p>
            The availability search uses a <strong>Submit → Poll</strong> pattern:
          </p>
          <ol style={{ lineHeight: '1.8' }}>
            <li>Submit your search criteria (pickup/dropoff locations, dates, driver age, etc.)</li>
            <li>Receive a request ID</li>
            <li>Poll for results - offers will stream in as suppliers respond</li>
            <li>Use the offers to create bookings</li>
          </ol>

          <h3>Required Information</h3>
          <ul style={{ lineHeight: '1.8' }}>
            <li><strong>Pickup Location:</strong> UN/LOCODE (e.g., <code>GBMAN</code>)</li>
            <li><strong>Dropoff Location:</strong> UN/LOCODE (e.g., <code>GBGLA</code>)</li>
            <li><strong>Pickup Date & Time:</strong> ISO 8601 format</li>
            <li><strong>Dropoff Date & Time:</strong> ISO 8601 format</li>
            <li><strong>Driver Age:</strong> Minimum age (typically 21-25)</li>
            <li><strong>Residency Country:</strong> ISO-3166 alpha-2 code (e.g., <code>GB</code>, <code>US</code>)</li>
            <li><strong>Agreement References:</strong> Array of active agreement refs to search</li>
            <li><strong>Vehicle Classes:</strong> (Optional) Filter by vehicle class codes</li>
          </ul>

          <h3>Using the API</h3>
          <p>
            See the <strong>API Reference</strong> section for detailed endpoint documentation and code samples.
            The key endpoints are:
          </p>
          <ul style={{ lineHeight: '1.8' }}>
            <li><code>POST /availability/submit</code> - Submit search request</li>
            <li><code>GET /availability/poll</code> - Poll for results (supports long-polling)</li>
          </ul>
        </div>
      </section>

      {/* Step 5 */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ 
            width: '3rem', 
            height: '3rem', 
            borderRadius: '50%', 
            backgroundColor: '#ef4444', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '1.5rem', 
            fontWeight: 'bold' 
          }}>
            5
          </div>
          <h2 style={{ margin: 0 }}>Create & Manage Bookings</h2>
        </div>
        
        <div style={{ paddingLeft: '4rem' }}>
          <h3>Creating a Booking</h3>
          <ol style={{ lineHeight: '1.8' }}>
            <li>
              <strong>Get an Offer:</strong> Use an offer from your availability search results.
            </li>
            <li>
              <strong>Prepare Booking Data:</strong> You'll need:
              <ul>
                <li>Agreement reference</li>
                <li>Supplier offer reference (from availability response)</li>
                <li>Your own booking reference (optional but recommended)</li>
                <li>Idempotency key (unique per booking attempt)</li>
              </ul>
            </li>
            <li>
              <strong>Call Create Booking API:</strong> <code>POST /bookings</code> with the required headers and body.
            </li>
            <li>
              <strong>Store Booking Reference:</strong> Save the supplier booking reference for future operations.
            </li>
          </ol>

          <h3>Managing Bookings</h3>
          <ul style={{ lineHeight: '1.8' }}>
            <li>
              <strong>View Bookings:</strong> Go to "My Bookings" tab to see all your bookings with filters and search.
            </li>
            <li>
              <strong>Check Status:</strong> Use <code>POST /bookings/:ref/check</code> to check current booking status.
            </li>
            <li>
              <strong>Modify Booking:</strong> Use <code>PATCH /bookings/:ref</code> to modify an existing booking.
            </li>
            <li>
              <strong>Cancel Booking:</strong> Use <code>POST /bookings/:ref/cancel</code> to cancel a booking.
            </li>
          </ul>

          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '0.5rem' }}>
            <strong>⚠️ Important:</strong> Always use idempotency keys when creating, modifying, or canceling bookings to prevent duplicate operations.
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '0.5rem' }}>
        <h2 style={{ marginTop: 0 }}>Best Practices</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li>
            <strong>Idempotency:</strong> Always use unique idempotency keys for booking operations. This ensures 
            that if a request fails and you retry, you won't create duplicate bookings.
          </li>
          <li>
            <strong>Error Handling:</strong> Implement proper error handling and retry logic with exponential backoff.
          </li>
          <li>
            <strong>Polling:</strong> Use the <code>sinceSeq</code> parameter when polling to only get new results, 
            and use <code>waitMs</code> for long-polling to reduce API calls.
          </li>
          <li>
            <strong>Agreement Status:</strong> Regularly check agreement status - expired or suspended agreements 
            won't work for searches or bookings.
          </li>
          <li>
            <strong>Location Validation:</strong> Verify UN/LOCODEs before submitting searches to avoid errors.
          </li>
        </ul>
      </section>

      {/* Next Steps */}
      <section style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#ecfdf5', border: '1px solid #86efac', borderRadius: '0.5rem' }}>
        <h2 style={{ marginTop: 0 }}>Next Steps</h2>
        <ol style={{ lineHeight: '1.8' }}>
          <li>Review the <strong>API Reference</strong> for detailed endpoint documentation</li>
          <li>Check out the <strong>SDK Guide</strong> to see available SDKs for your programming language</li>
          <li>Test your integration using the test endpoints</li>
          <li>Monitor your bookings in the "My Bookings" section</li>
          <li>Contact support if you encounter any issues</li>
        </ol>
      </section>

      {/* Support */}
      <section style={{ padding: '1.5rem', backgroundColor: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '0.5rem' }}>
        <h2 style={{ marginTop: 0 }}>Need Help?</h2>
        <p>
          If you have questions or need assistance:
        </p>
        <ul style={{ lineHeight: '1.8' }}>
          <li>Check the <strong>API Reference</strong> for detailed endpoint documentation</li>
          <li>Review the <strong>SDK Guide</strong> for integration examples</li>
          <li>Contact your system administrator</li>
          <li>Check system health and status in the Dashboard</li>
        </ul>
      </section>
    </div>
  );
};

export default GettingStartedGuide;

