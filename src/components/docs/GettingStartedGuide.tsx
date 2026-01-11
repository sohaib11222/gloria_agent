import React, { useState, useEffect } from 'react';
import './docs.css';

const GettingStartedGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    // Set initial active section
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setActiveSection(hash);
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      setActiveSection('overview');
    }

    // Update active section on scroll
    const handleScroll = () => {
      const sections = [
        'overview',
        'step-1',
        'step-2',
        'step-3',
        'step-4',
        'step-5',
        'best-practices',
        'next-steps',
        'support'
      ];

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(sections[i]);
            window.history.replaceState(null, '', `#${sections[i]}`);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      setActiveSection(id);
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'step-1', label: 'Account Setup & Login', icon: '1️⃣' },
    { id: 'step-2', label: 'Accept Agreements', icon: '2️⃣' },
    { id: 'step-3', label: 'Browse Locations', icon: '3️⃣' },
    { id: 'step-4', label: 'Search Availability', icon: '4️⃣' },
    { id: 'step-5', label: 'Create & Manage Bookings', icon: '5️⃣' },
    { id: 'best-practices', label: 'Best Practices', icon: '✨' },
    { id: 'next-steps', label: 'Next Steps', icon: '🚀' },
    { id: 'support', label: 'Need Help?', icon: '💬' },
  ];

  return (
    <div style={{ display: 'flex', gap: '2rem', maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        flexShrink: 0,
        position: 'sticky',
        top: '100px',
        height: 'fit-content',
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
        padding: '1.5rem',
        background: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: '#4b5563',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin: '0 0 1rem 0',
          paddingBottom: '0.75rem',
          borderBottom: '2px solid #e5e7eb'
        }}>
          Table of Contents
        </h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                border: 'none',
                borderRadius: '0.5rem',
                background: activeSection === item.id
                  ? 'linear-gradient(to right, #dbeafe, #bfdbfe)'
                  : 'transparent',
                color: activeSection === item.id ? '#1e40af' : '#4b5563',
                fontWeight: activeSection === item.id ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.875rem',
                transition: 'all 0.15s',
                boxShadow: activeSection === item.id ? '0 2px 4px rgba(59, 130, 246, 0.2)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.background = '#f3f4f6';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="docs-main" style={{ flex: 1, maxWidth: '900px', padding: '2rem' }}>
        <h1 id="overview" style={{ scrollMarginTop: '100px' }}>Getting Started Guide for Agents</h1>
        <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '2rem' }}>
          Welcome! This guide will walk you through everything you need to know to start using Gloria Connect as an Agent (OTA).
        </p>

        {/* Overview */}
        <section id="overview" style={{ marginBottom: '3rem', padding: '1.5rem', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '0.5rem', scrollMarginTop: '100px' }}>
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
        <section id="step-1" style={{ marginBottom: '2rem', scrollMarginTop: '100px' }}>
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
        <section id="step-2" style={{ marginBottom: '2rem', scrollMarginTop: '100px' }}>
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
        <section id="step-3" style={{ marginBottom: '2rem', scrollMarginTop: '100px' }}>
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
        <section id="step-4" style={{ marginBottom: '2rem', scrollMarginTop: '100px' }}>
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
        <section id="step-5" style={{ marginBottom: '2rem', scrollMarginTop: '100px' }}>
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
        <section id="best-practices" style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '0.5rem', scrollMarginTop: '100px' }}>
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
        <section id="next-steps" style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#ecfdf5', border: '1px solid #86efac', borderRadius: '0.5rem', scrollMarginTop: '100px' }}>
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
        <section id="support" style={{ padding: '1.5rem', backgroundColor: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '0.5rem', scrollMarginTop: '100px' }}>
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
    </div>
  );
};

export default GettingStartedGuide;
