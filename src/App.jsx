import React, { useState, useEffect } from 'react';

// Premium Travel Identity App - "Wanderlust"
// Design: Dark luxury meets iOS glass morphism
// Inspired by: Uber, iOS 26, Lucid Motors

// ==================== DEBUG LABEL COMPONENT ====================
// Set to false to hide all debug labels in production
const SHOW_DEBUG_LABELS = true;

const DebugLabel = ({ name }) => {
  if (!SHOW_DEBUG_LABELS) return null;
  return (
    <div style={{
      position: 'absolute',
      top: '4px',
      left: '4px',
      background: 'rgba(255, 0, 0, 0.85)',
      color: '#fff',
      fontSize: '9px',
      fontWeight: '700',
      padding: '2px 6px',
      borderRadius: '4px',
      zIndex: 9999,
      fontFamily: 'monospace',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      pointerEvents: 'none'
    }}>
      {name}
    </div>
  );
};

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const navigateTo = (screen, trip = null) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentScreen(screen);
      if (trip) setSelectedTrip(trip);
      setIsTransitioning(false);
    }, 300);
  };

  const nextOnboarding = () => {
    if (onboardingStep < 3) {
      setOnboardingStep(prev => prev + 1);
    } else {
      navigateTo('home');
    }
  };

  const skipOnboarding = () => {
    navigateTo('home');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(165deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
      color: '#ffffff',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Ambient glow effects */}
      <div style={{
        position: 'fixed',
        top: '-20%',
        right: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-30%',
        left: '-20%',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{
        opacity: isTransitioning ? 0 : 1,
        transform: isTransitioning ? 'scale(0.98)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        zIndex: 1
      }}>
        {currentScreen === 'login' && (
          <LoginScreen onLogin={() => navigateTo('onboarding')} />
        )}
        {currentScreen === 'onboarding' && (
          <OnboardingScreen 
            step={onboardingStep} 
            onNext={nextOnboarding}
            onSkip={skipOnboarding}
          />
        )}
        {currentScreen === 'home' && (
          <HomeScreen onSelectTrip={(trip) => navigateTo('tripDetail', trip)} />
        )}
        {currentScreen === 'tripDetail' && selectedTrip && (
          <TripDetailScreen trip={selectedTrip} onBack={() => navigateTo('home')} />
        )}
      </div>
    </div>
  );
};

// ==================== TRIP DETAIL SCREEN ====================
const TripDetailScreen = ({ trip, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/> },
    { id: 'updates', label: 'Updates', icon: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></> },
    { id: 'budget', label: 'Budget', icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></> },
    { id: 'weather', label: 'Weather', icon: <><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></> },
    { id: 'documents', label: 'Documents', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></> }
  ];

  // Calculate days until trip
  const getDaysUntil = () => {
    const tripDate = new Date('2025-03-15'); // Mock date
    const today = new Date();
    const diff = Math.ceil((tripDate - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const tripAlerts = [
    {
      id: 1,
      type: 'info',
      title: 'Visa Reminder',
      message: 'Indonesia offers visa-free entry for 30 days. Passport valid until Sep 2026',
      time: '1d ago',
      affectedBookings: [
        { type: 'flight', title: 'SQ 25 departure' }
      ]
    },
    { id: 2, type: 'info', title: 'Villa Check-in', message: 'Four Seasons Sayan check-in available from 2:00 PM', time: '3h ago' }
  ];

  const timeline = [
    {
      day: 'Day 1',
      date: 'Thu, Mar 20',
      events: [
        { type: 'flight', time: '22:45', title: 'JFK → SIN → DPS', subtitle: 'Singapore Airlines SQ 25', duration: '22h 45m', status: 'confirmed' },
      ]
    },
    {
      day: 'Day 2',
      date: 'Fri, Mar 21',
      events: [
        { type: 'flight', time: '11:30', title: 'Arrive Ngurah Rai', subtitle: 'Terminal International', status: 'confirmed' },
        { type: 'transfer', time: '12:30', title: 'Private Car Transfer', subtitle: 'Airport to Ubud', duration: '1h 30m', status: 'confirmed' },
        { type: 'hotel', time: '14:00', title: 'Four Seasons Sayan', subtitle: 'Check-in • Valley View Suite', duration: '5 nights', status: 'confirmed' }
      ]
    },
    {
      day: 'Day 3',
      date: 'Sat, Mar 22',
      events: [
        { type: 'experience', time: '06:00', title: 'Sunrise at Tegallalang', subtitle: 'Rice terrace photography tour', duration: '3h', status: 'confirmed' },
        { type: 'experience', time: '14:00', title: 'Sacred Monkey Forest', subtitle: 'Guided nature walk', duration: '2h', status: 'confirmed' },
        { type: 'restaurant', time: '19:00', title: 'Locavore Restaurant', subtitle: 'Farm-to-table tasting menu', duration: '2.5h', status: 'confirmed' }
      ]
    },
    {
      day: 'Day 4',
      date: 'Sun, Mar 23',
      events: [
        { type: 'experience', time: '09:00', title: 'Balinese Cooking Class', subtitle: 'Traditional recipes with local chef', duration: '4h', status: 'confirmed' },
        { type: 'experience', time: '16:00', title: 'Spa & Wellness Retreat', subtitle: 'Couples massage & healing ritual', duration: '3h', status: 'confirmed' }
      ]
    },
    {
      day: 'Day 5',
      date: 'Mon, Mar 24',
      events: [
        { type: 'car', time: '07:00', title: 'Private Driver', subtitle: 'Full day exploration', duration: 'Full day', status: 'confirmed' },
        { type: 'experience', time: '08:00', title: 'Tirta Empul Temple', subtitle: 'Holy water purification ceremony', duration: '2h', status: 'confirmed' },
        { type: 'experience', time: '12:00', title: 'Mount Batur Lunch', subtitle: 'Volcanic hot springs & buffet', duration: '3h', status: 'confirmed' }
      ]
    },
    {
      day: 'Day 6',
      date: 'Tue, Mar 25',
      events: [
        { type: 'transfer', time: '10:00', title: 'Transfer to Seminyak', subtitle: 'Private car Ubud to beach', duration: '1h 15m', status: 'confirmed' },
        { type: 'hotel', time: '14:00', title: 'W Bali Seminyak', subtitle: 'Check-in • Ocean Facing Retreat', duration: '5 nights', status: 'confirmed' },
        { type: 'restaurant', time: '18:00', title: 'Ku De Ta', subtitle: 'Sunset dinner & cocktails', duration: '3h', status: 'confirmed' }
      ]
    },
    {
      day: 'Day 7',
      date: 'Wed, Mar 26',
      events: [
        { type: 'experience', time: '07:00', title: 'Surf Lesson', subtitle: 'Beginner session at Echo Beach', duration: '2h', status: 'confirmed' },
        { type: 'experience', time: '15:00', title: 'Beach Club Day', subtitle: 'Potato Head • Reserved daybed', duration: '5h', status: 'pending' }
      ]
    },
    {
      day: 'Day 8',
      date: 'Thu, Mar 27',
      events: [
        { type: 'experience', time: '05:00', title: 'Nusa Penida Day Trip', subtitle: 'Speed boat • Kelingking Beach', duration: 'Full day', status: 'confirmed' }
      ]
    },
    {
      day: 'Day 9',
      date: 'Fri, Mar 28',
      events: [
        { type: 'experience', time: '10:00', title: 'Tanah Lot Temple', subtitle: 'Sunset temple visit', duration: '3h', status: 'confirmed' },
        { type: 'restaurant', time: '19:30', title: 'Merah Putih', subtitle: 'Indonesian fine dining', duration: '2h', status: 'confirmed' }
      ]
    },
    {
      day: 'Day 10',
      date: 'Sat, Mar 29',
      events: [
        { type: 'experience', time: '09:00', title: 'Spa Day', subtitle: 'Full day wellness package', duration: '6h', status: 'confirmed' },
        { type: 'restaurant', time: '20:00', title: 'Sardine Restaurant', subtitle: 'Seafood in rice paddies', duration: '2h', status: 'confirmed' }
      ]
    },
    {
      day: 'Day 11',
      date: 'Sun, Mar 30',
      events: [
        { type: 'hotel', time: '11:00', title: 'W Bali Checkout', subtitle: 'Late checkout arranged', status: 'confirmed' },
        { type: 'transfer', time: '14:00', title: 'Airport Transfer', subtitle: 'Private car to DPS', duration: '45m', status: 'confirmed' },
        { type: 'flight', time: '17:30', title: 'DPS → SIN → JFK', subtitle: 'Singapore Airlines SQ 948', duration: '24h 15m', status: 'confirmed' }
      ]
    }
  ];

  const budgetData = {
    total: 12500,
    spent: 9850,
    categories: [
      { name: 'Flights', amount: 3200, color: '#d4af37' },
      { name: 'Hotels', amount: 4100, color: '#6366f1' },
      { name: 'Experiences', amount: 1450, color: '#22c55e' },
      { name: 'Transport', amount: 580, color: '#f97316' },
      { name: 'Dining', amount: 520, color: '#ec4899' }
    ]
  };

  const weatherData = [
    { day: 'Thu', date: '20', high: 32, low: 25, condition: 'sunny', precip: 10 },
    { day: 'Fri', date: '21', high: 31, low: 24, condition: 'cloudy', precip: 30 },
    { day: 'Sat', date: '22', high: 33, low: 26, condition: 'sunny', precip: 5 },
    { day: 'Sun', date: '23', high: 30, low: 24, condition: 'rainy', precip: 65 },
    { day: 'Mon', date: '24', high: 31, low: 25, condition: 'cloudy', precip: 40 },
    { day: 'Tue', date: '25', high: 32, low: 25, condition: 'sunny', precip: 15 }
  ];

  const documents = [
    { id: 1, name: 'Passport', type: 'visa', status: 'valid', expiry: 'Sep 2026' },
    { id: 2, name: 'Travel Insurance', type: 'insurance', status: 'active', provider: 'Allianz Global' },
    { id: 3, name: 'Four Seasons Confirmation', type: 'confirmation', status: 'confirmed', ref: 'FS-9284710' },
    { id: 4, name: 'W Bali Confirmation', type: 'confirmation', status: 'confirmed', ref: 'WB-3847201' },
    { id: 5, name: 'Flight E-Tickets', type: 'ticket', status: 'confirmed', ref: 'SQ-7482910' },
    { id: 6, name: 'Nusa Penida Boat Tickets', type: 'ticket', status: 'confirmed', ref: 'NP-284710' },
    { id: 7, name: 'Locavore Reservation', type: 'confirmation', status: 'confirmed', ref: 'LOC-8471' }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <DebugLabel name="TRIP-DETAIL-SCREEN" />
      {/* Fixed Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.98) 0%, rgba(10, 10, 15, 0.95) 70%, transparent 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingBottom: '24px'
      }}>
        <DebugLabel name="TRIP-HEADER" />
        {/* Top Bar */}
        <div style={{
          padding: '56px 24px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative'
        }}>
          <DebugLabel name="TOP-BAR" />
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <div style={{ textAlign: 'center', flex: 1 }}>
            <h1 style={{
              fontSize: '22px',
              fontWeight: '700',
              letterSpacing: '-0.5px',
              marginBottom: '4px'
            }}>{trip.destination}</h1>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: '500'
            }}>{trip.dates} • {trip.country}</p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleRefresh}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff',
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </button>
            <button
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                border: 'none',
                borderRadius: '12px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#0a0a0f',
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          padding: '0 16px',
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s',
          position: 'relative'
        }}>
          <DebugLabel name="TAB-BAR" />
          <div style={{
            display: 'flex',
            gap: '4px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '16px',
            padding: '4px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '10px 6px',
                  background: activeTab === tab.id 
                    ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)'
                    : 'transparent',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={activeTab === tab.id ? '#d4af37' : 'rgba(255,255,255,0.4)'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {tab.icon}
                </svg>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  color: activeTab === tab.id ? '#d4af37' : 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.3px'
                }}>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div style={{
        flex: 1,
        padding: '0 24px 120px',
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
        position: 'relative'
      }}>
        <DebugLabel name="CONTENT-AREA" />
        {/* Day Counter - The Ive Approach: singular, centered, confident */}
        <div style={{
          textAlign: 'center',
          paddingTop: '8px',
          paddingBottom: '32px',
          position: 'relative'
        }}>
          <DebugLabel name="DAY-COUNTER" />
          
          {/* The Number - given room to breathe */}
          <span style={{
            fontSize: '80px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-4px',
            lineHeight: 1,
            display: 'block'
          }}>{getDaysUntil()}</span>
          
          {/* Contextual detail - understated */}
          <p style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.4)',
            fontWeight: '500',
            marginTop: '12px',
            letterSpacing: '0.5px'
          }}>
            days until JL 5 to Tokyo
          </p>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div style={{ position: 'relative' }}>
            <DebugLabel name="TAB-OVERVIEW" />
            <TripAlerts alerts={tripAlerts} />
            <SectionHeader title="Trip Timeline" />
            <TripTimeline timeline={timeline} />
          </div>
        )}

        {activeTab === 'updates' && (
          <div style={{ position: 'relative' }}>
            <DebugLabel name="TAB-UPDATES" />
            <TripAlerts alerts={tripAlerts} />
            <SectionHeader title="Recent Updates" />
            <UpdatesFeed />
          </div>
        )}

        {activeTab === 'budget' && (
          <div style={{ position: 'relative' }}>
            <DebugLabel name="TAB-BUDGET" />
            <SectionHeader title="Budget Tracker" />
            <BudgetTracker data={budgetData} />
          </div>
        )}

        {activeTab === 'weather' && (
          <div style={{ position: 'relative' }}>
            <DebugLabel name="TAB-WEATHER" />
            <SectionHeader title="Weather Forecast" />
            <WeatherForecast data={weatherData} destination={trip.destination} />
          </div>
        )}

        {activeTab === 'documents' && (
          <div style={{ position: 'relative' }}>
            <DebugLabel name="TAB-DOCUMENTS" />
            <SectionHeader title="Travel Documents" />
            <DocumentsList documents={documents} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// ==================== TRIP ALERTS COMPONENT ====================
const TripAlerts = ({ alerts, compact = false }) => {
  if (!alerts || alerts.length === 0) return null;

  const getAffectedIcon = (type) => {
    const icons = {
      transfer: <><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M8 18h8"/><path d="M5 15V7a2 2 0 0 1 2-2h3"/><path d="M14 5l2-2 2 2"/><path d="M16 3v6"/></>,
      hotel: <><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"/><path d="M3 21h18"/><rect x="9" y="12" width="6" height="5"/></>,
      train: <><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 12h16"/><path d="M12 4v16"/><circle cx="8" cy="20" r="1"/><circle cx="16" cy="20" r="1"/></>,
      flight: <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>,
      experience: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    };
    return icons[type] || icons.experience;
  };

  return (
    <div style={{ marginBottom: compact ? '16px' : '24px', position: 'relative' }}>
      <DebugLabel name={compact ? "ALERT-COMPACT" : "TRAVEL-ALERTS"} />
      {!compact && <SectionHeader title="Travel Alerts" />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {alerts.slice(0, compact ? 1 : alerts.length).map(alert => (
          <div
            key={alert.id}
            style={{
              background: alert.type === 'warning' 
                ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(249, 115, 22, 0.06) 100%)'
                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0.06) 100%)',
              border: `1px solid ${alert.type === 'warning' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
              borderRadius: '14px',
              padding: compact ? '12px 14px' : '14px 16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              position: 'relative'
            }}
          >
            <DebugLabel name={alert.type === 'warning' ? "ALERT-WARNING" : "ALERT-INFO"} />
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: alert.type === 'warning' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {alert.type === 'warning' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: alert.type === 'warning' ? '#f97316' : '#818cf8',
                  marginBottom: '2px'
                }}>{alert.title}</p>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{alert.time}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.4' }}>{alert.message}</p>
              
              {/* Affected Bookings */}
              {alert.affectedBookings && alert.affectedBookings.length > 0 && !compact && (
                <div style={{ 
                  marginTop: '12px', 
                  paddingTop: '12px', 
                  borderTop: `1px solid ${alert.type === 'warning' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(99, 102, 241, 0.15)'}`
                }}>
                  <p style={{ 
                    fontSize: '11px', 
                    color: 'rgba(255,255,255,0.4)', 
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: '600'
                  }}>May Affect</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {alert.affectedBookings.map((booking, idx) => (
                      <div 
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(255,255,255,0.08)',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: 'rgba(255,255,255,0.7)'
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {getAffectedIcon(booking.type)}
                        </svg>
                        {booking.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== TRIP TIMELINE COMPONENT ====================
const TripTimeline = ({ timeline }) => {
  const getEventIcon = (type) => {
    const icons = {
      flight: <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>,
      hotel: <><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"/><path d="M3 21h18"/><rect x="9" y="12" width="6" height="5"/></>,
      car: <><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.5-4.3A2 2 0 0 0 13.8 5H9.2c-.7 0-1.3.3-1.7.8L5 10l-2.5 1.1C1.7 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></>,
      train: <><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 12h16"/><path d="M12 4v16"/><circle cx="8" cy="20" r="1"/><circle cx="16" cy="20" r="1"/></>,
      experience: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
      restaurant: <><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>,
      transfer: <><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M8 18h8"/><path d="M5 15V7a2 2 0 0 1 2-2h3"/><path d="M14 5l2-2 2 2"/><path d="M16 3v6"/></>
    };
    return icons[type] || icons.experience;
  };

  const getEventColor = (type) => {
    const colors = {
      flight: '#d4af37',
      hotel: '#6366f1',
      car: '#22c55e',
      train: '#f97316',
      experience: '#ec4899',
      restaurant: '#ef4444',
      transfer: '#8b5cf6'
    };
    return colors[type] || '#d4af37';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      <DebugLabel name="TRIP-TIMELINE" />
      {timeline.map((day, dayIndex) => (
        <div key={dayIndex} style={{ position: 'relative' }}>
          <DebugLabel name={`TIMELINE-${day.day.toUpperCase().replace(' ', '-')}`} />
          {/* Day Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '10px',
              padding: '8px 14px'
            }}>
              <span style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#d4af37'
              }}>{day.day}</span>
            </div>
            <span style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: '500'
            }}>{day.date}</span>
          </div>

          {/* Day Events */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginLeft: '8px',
            paddingLeft: '20px',
            borderLeft: '2px solid rgba(255,255,255,0.08)'
          }}>
            {day.events.map((event, eventIndex) => (
              <div
                key={eventIndex}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  padding: '16px',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                <DebugLabel name={`EVENT-${event.type.toUpperCase()}`} />
                {/* Timeline Dot */}
                <div style={{
                  position: 'absolute',
                  left: '-28px',
                  top: '20px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: getEventColor(event.type),
                  border: '3px solid #0a0a0f',
                  boxShadow: `0 0 0 2px ${getEventColor(event.type)}40`
                }} />

                <div style={{ display: 'flex', gap: '14px' }}>
                  {/* Icon */}
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: `${getEventColor(event.type)}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={getEventColor(event.type)}
                      stroke={getEventColor(event.type)}
                      strokeWidth="1"
                    >
                      {getEventIcon(event.type)}
                    </svg>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '4px'
                    }}>
                      <div>
                        <p style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          marginBottom: '2px'
                        }}>{event.title}</p>
                        <p style={{
                          fontSize: '13px',
                          color: 'rgba(255,255,255,0.5)'
                        }}>{event.subtitle}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#d4af37'
                        }}>{event.time}</p>
                        {event.duration && (
                          <p style={{
                            fontSize: '12px',
                            color: 'rgba(255,255,255,0.4)'
                          }}>{event.duration}</p>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '8px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: event.status === 'confirmed' 
                        ? 'rgba(34, 197, 94, 0.15)' 
                        : 'rgba(249, 115, 22, 0.15)',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: event.status === 'confirmed' ? '#22c55e' : '#f97316',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      <div style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        background: event.status === 'confirmed' ? '#22c55e' : '#f97316'
                      }} />
                      {event.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ==================== ACTION BUTTON ====================
const ActionButton = ({ icon, label, primary }) => {
  const icons = {
    import: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
    add: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    )
  };

  return (
    <button style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: primary ? '10px 16px' : '10px 14px',
      background: primary 
        ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)'
        : 'rgba(255,255,255,0.08)',
      border: primary ? 'none' : '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      color: primary ? '#0a0a0f' : '#fff',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: primary ? '0 4px 16px rgba(212, 175, 55, 0.25)' : 'none'
    }}>
      {icons[icon]}
      <span>{label}</span>
    </button>
  );
};

// ==================== BUDGET TRACKER ====================
const BudgetTracker = ({ data }) => {
  const percentage = (data.spent / data.total) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
      <DebugLabel name="BUDGET-TRACKER" />
      {/* Summary Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        borderRadius: '20px',
        padding: '24px',
        position: 'relative'
      }}>
        <DebugLabel name="BUDGET-SUMMARY" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Total Budget</p>
            <p style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-1px' }}>${data.total.toLocaleString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Remaining</p>
            <p style={{ fontSize: '24px', fontWeight: '600', color: '#22c55e' }}>${(data.total - data.spent).toLocaleString()}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          height: '8px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #d4af37 0%, #f4d03f 100%)',
            borderRadius: '4px',
            transition: 'width 0.5s ease'
          }} />
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
          {percentage.toFixed(0)}% spent
        </p>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.categories.map((cat, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '3px',
                background: cat.color
              }} />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{cat.name}</span>
            </div>
            <span style={{ fontSize: '15px', fontWeight: '600' }}>${cat.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== WEATHER FORECAST ====================
const WeatherForecast = ({ data, destination }) => {
  const getWeatherIcon = (condition) => {
    const icons = {
      sunny: <><circle cx="12" cy="12" r="5" fill="#f59e0b"/><line x1="12" y1="1" x2="12" y2="3" stroke="#f59e0b" strokeWidth="2"/><line x1="12" y1="21" x2="12" y2="23" stroke="#f59e0b" strokeWidth="2"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#f59e0b" strokeWidth="2"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#f59e0b" strokeWidth="2"/><line x1="1" y1="12" x2="3" y2="12" stroke="#f59e0b" strokeWidth="2"/><line x1="21" y1="12" x2="23" y2="12" stroke="#f59e0b" strokeWidth="2"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="#f59e0b" strokeWidth="2"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="#f59e0b" strokeWidth="2"/></>,
      cloudy: <><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/></>,
      rainy: <><path d="M16 13v8M8 13v8M12 15v8" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/></>
    };
    return icons[condition] || icons.sunny;
  };

  return (
    <div style={{ position: 'relative' }}>
      <DebugLabel name="WEATHER-FORECAST" />
      {/* Current Highlight */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '20px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <DebugLabel name="WEATHER-CURRENT" />
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>{destination}</p>
        <p style={{ fontSize: '48px', fontWeight: '700', marginBottom: '4px' }}>{data[0].high}°</p>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>H:{data[0].high}° L:{data[0].low}° • {data[0].condition}</p>
      </div>

      {/* Daily Forecast */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '8px'
      }}>
        {data.map((day, i) => (
          <div
            key={i}
            style={{
              background: i === 0 ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${i === 0 ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: '14px',
              padding: '14px 8px',
              textAlign: 'center'
            }}
          >
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>{day.day}</p>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 8px' }}>
              {getWeatherIcon(day.condition)}
            </svg>
            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>{day.high}°</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{day.low}°</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== DOCUMENTS LIST ====================
const DocumentsList = ({ documents }) => {
  const getDocIcon = (type) => {
    const icons = {
      visa: <><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="7" y1="15" x2="8" y2="15"/><line x1="12" y1="15" x2="17" y2="15"/></>,
      insurance: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
      ticket: <><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></>,
      confirmation: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15l2 2 4-4"/></>
    };
    return icons[type] || icons.confirmation;
  };

  const getStatusColor = (status) => {
    const colors = {
      valid: '#22c55e',
      active: '#6366f1',
      ready: '#f59e0b',
      confirmed: '#d4af37'
    };
    return colors[status] || '#d4af37';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
      <DebugLabel name="DOCUMENTS-LIST" />
      {documents.map(doc => (
        <div
          key={doc.id}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
        >
          <DebugLabel name={`DOC-${doc.type.toUpperCase()}`} />
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `${getStatusColor(doc.status)}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke={getStatusColor(doc.status)}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {getDocIcon(doc.type)}
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '2px' }}>{doc.name}</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
              {doc.expiry || doc.provider || doc.validity || doc.ref}
            </p>
          </div>

          <div style={{
            padding: '4px 10px',
            borderRadius: '20px',
            background: `${getStatusColor(doc.status)}20`,
            fontSize: '11px',
            fontWeight: '600',
            color: getStatusColor(doc.status),
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {doc.status}
          </div>
        </div>
      ))}

      {/* Add Document Button */}
      <button style={{
        background: 'rgba(255,255,255,0.04)',
        border: '2px dashed rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: 'pointer',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease'
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Document
      </button>
    </div>
  );
};

// ==================== UPDATES FEED ====================
const UpdatesFeed = () => {
  const updates = [
    {
      id: 1,
      type: 'flight',
      title: 'Check-in Available',
      message: 'Online check-in for SQ 25 is now open',
      time: '1h ago',
      icon: <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
    },
    {
      id: 2,
      type: 'weather',
      title: 'Weather Update',
      message: 'Afternoon showers expected in Ubud on Mar 23. Perfect spa day!',
      time: '3h ago',
      icon: <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
    },
    {
      id: 3,
      type: 'price',
      title: 'Experience Discount',
      message: 'Nusa Penida day trip reduced by $25 per person',
      time: '6h ago',
      icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Reservation Confirmed',
      message: 'Locavore dinner reservation confirmed for Mar 22 at 7 PM',
      time: '1d ago',
      icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>
    },
    {
      id: 5,
      type: 'reminder',
      title: 'Packing Reminder',
      message: 'Don\'t forget: reef-safe sunscreen required for Bali beaches',
      time: '2d ago',
      icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
      <DebugLabel name="UPDATES-FEED" />
      {updates.map(update => (
        <div
          key={update.id}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            gap: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
        >
          <DebugLabel name={`UPDATE-${update.type.toUpperCase()}`} />
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(212, 175, 55, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#d4af37" stroke="#d4af37" strokeWidth="1">
              {update.icon}
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>{update.title}</p>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{update.time}</span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.4' }}>{update.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ==================== LOGIN SCREEN ====================
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '60px 24px 40px',
      maxWidth: '420px',
      margin: '0 auto',
      position: 'relative'
    }}>
      <DebugLabel name="LOGIN-SCREEN" />
      {/* Header */}
      <div style={{
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }}>
        <DebugLabel name="LOGIN-HEADER" />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(212, 175, 55, 0.3)'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#0a0a0f" opacity="0.9"/>
              <path d="M2 17L12 22L22 17" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{
            fontSize: '28px',
            fontWeight: '700',
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Wanderlust</span>
        </div>
        <p style={{
          fontSize: '15px',
          color: 'rgba(255,255,255,0.5)',
          fontWeight: '400',
          marginTop: '4px',
          letterSpacing: '0.3px'
        }}>Your travel identity, unified.</p>
      </div>

      {/* Main Content */}
      <div style={{
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.15s',
        position: 'relative'
      }}>
        <DebugLabel name="LOGIN-CONTENT" />
        <h1 style={{
          fontSize: '42px',
          fontWeight: '700',
          lineHeight: '1.1',
          letterSpacing: '-1.5px',
          marginBottom: '16px'
        }}>
          Every journey,<br/>
          <span style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>one place.</span>
        </h1>
        <p style={{
          fontSize: '17px',
          color: 'rgba(255,255,255,0.6)',
          lineHeight: '1.6',
          fontWeight: '400'
        }}>
          Flights, hotels, adventures—organized beautifully. 
          Never lose a booking again.
        </p>
      </div>

      {/* Login Form */}
      <div style={{
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(40px)',
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
        position: 'relative'
      }}>
        <DebugLabel name="LOGIN-FORM" />
        {/* Email Input */}
        <div style={{ marginBottom: '12px' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={{
              width: '100%',
              padding: '18px 20px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              color: '#ffffff',
              fontSize: '16px',
              outline: 'none',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(212, 175, 55, 0.5)';
              e.target.style.background = 'rgba(255,255,255,0.08)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.1)';
              e.target.style.background = 'rgba(255,255,255,0.05)';
            }}
          />
        </div>

        {/* Sign In Button */}
        <button
          onClick={onLogin}
          style={{
            width: '100%',
            padding: '18px',
            background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
            border: 'none',
            borderRadius: '16px',
            color: '#0a0a0f',
            fontSize: '17px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 32px rgba(212, 175, 55, 0.25)',
            marginBottom: '24px'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 12px 40px rgba(212, 175, 55, 0.35)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 32px rgba(212, 175, 55, 0.25)';
          }}
        >
          Continue
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Social Logins */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <SocialButton icon="apple" label="Apple" onClick={onLogin} />
          <SocialButton icon="facebook" label="Facebook" onClick={onLogin} />
          <SocialButton icon="github" label="GitHub" onClick={onLogin} />
        </div>

        {/* Terms */}
        <p style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.35)',
          textAlign: 'center',
          marginTop: '24px',
          lineHeight: '1.6'
        }}>
          By continuing, you agree to our <span style={{ color: 'rgba(212, 175, 55, 0.8)' }}>Terms of Service</span> and <span style={{ color: 'rgba(212, 175, 55, 0.8)' }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

const SocialButton = ({ icon, label, onClick }) => {
  const icons = {
    apple: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
      </svg>
    ),
    facebook: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
    ),
    github: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
      </svg>
    )
  };

  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '16px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px',
        color: '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
      }}
    >
      {icons[icon]}
    </button>
  );
};

// ==================== ONBOARDING SCREENS ====================
const OnboardingScreen = ({ step, onNext, onSkip }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayStep, setDisplayStep] = useState(step);

  useEffect(() => {
    if (step !== displayStep) {
      setIsAnimating(true);
      setTimeout(() => {
        setDisplayStep(step);
        setIsAnimating(false);
      }, 200);
    }
  }, [step, displayStep]);

  const screens = [
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#grad1)" strokeWidth="1.5">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#f4d03f" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      ),
      title: "Your travels,\nyour story",
      subtitle: "Every destination you've explored becomes part of your personal travel tapestry. We'll help you remember every moment.",
      visual: "globe"
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#grad1)" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
          <path d="M8 14h.01"/>
          <path d="M12 14h.01"/>
          <path d="M16 14h.01"/>
          <path d="M8 18h.01"/>
          <path d="M12 18h.01"/>
        </svg>
      ),
      title: "One home for\nall bookings",
      subtitle: "Flights, hotels, rentals, experiences—everything in one beautiful timeline. No more digging through emails.",
      visual: "calendar"
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#grad1)" strokeWidth="1.5">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      ),
      title: "Share your\nadventures",
      subtitle: "Get your personalized travel wrapped. See your stats, share your journey, inspire others to explore.",
      visual: "spark"
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#grad1)" strokeWidth="1.5">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
      title: "Connect your\ninbox",
      subtitle: "We'll automatically find and organize your travel confirmations. Your bookings, beautifully sorted.",
      visual: "mail"
    }
  ];

  const current = screens[displayStep];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '60px 24px 40px',
      maxWidth: '420px',
      margin: '0 auto',
      position: 'relative'
    }}>
      <DebugLabel name="ONBOARDING-SCREEN" />
      {/* Skip button */}
      <button
        onClick={onSkip}
        style={{
          position: 'absolute',
          top: '20px',
          right: '24px',
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '15px',
          fontWeight: '500',
          cursor: 'pointer',
          padding: '8px 0'
        }}
      >
        Skip
      </button>

      {/* Progress dots */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        marginBottom: '40px',
        position: 'relative'
      }}>
        <DebugLabel name="ONBOARDING-PROGRESS" />
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              width: i === displayStep ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i === displayStep 
                ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)'
                : 'rgba(255,255,255,0.2)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        opacity: isAnimating ? 0 : 1,
        transform: isAnimating ? 'translateX(-20px)' : 'translateX(0)',
        transition: 'all 0.2s ease-out',
        position: 'relative'
      }}>
        <DebugLabel name="ONBOARDING-CONTENT" />
        {/* Visual */}
        <div style={{
          width: '160px',
          height: '160px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <DebugLabel name="ONBOARDING-VISUAL" />
          <OnboardingVisual type={current.visual} />
        </div>

        {/* Icon */}
        <div style={{ marginBottom: '20px' }}>
          {current.icon}
        </div>

        {/* Text */}
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          lineHeight: '1.15',
          letterSpacing: '-0.5px',
          marginBottom: '12px',
          whiteSpace: 'pre-line'
        }}>
          {current.title}
        </h2>
        <p style={{
          fontSize: '15px',
          color: 'rgba(255,255,255,0.6)',
          lineHeight: '1.5',
          maxWidth: '300px'
        }}>
          {current.subtitle}
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        style={{
          width: '100%',
          padding: '18px',
          background: displayStep === 3 
            ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)'
            : 'rgba(255,255,255,0.1)',
          border: displayStep === 3 ? 'none' : '1px solid rgba(255,255,255,0.15)',
          borderRadius: '16px',
          color: displayStep === 3 ? '#0a0a0f' : '#ffffff',
          fontSize: '17px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
        }}
      >
        {displayStep === 3 ? 'Connect Email' : 'Continue'}
      </button>

      {displayStep === 3 && (
        <button
          onClick={onNext}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '15px',
            marginTop: '16px',
            cursor: 'pointer'
          }}
        >
          Maybe later
        </button>
      )}
    </div>
  );
};

const OnboardingVisual = ({ type }) => {
  const visuals = {
    globe: (
      <div style={{ position: 'relative', width: '160px', height: '160px' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%)',
          animation: 'pulse 3s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          inset: '20px',
          borderRadius: '50%',
          border: '2px solid rgba(212, 175, 55, 0.3)',
          animation: 'spin 20s linear infinite'
        }} />
        <div style={{
          position: 'absolute',
          inset: '40px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.1)'
        }} />
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#d4af37',
            top: `${30 + Math.random() * 100}px`,
            left: `${30 + Math.random() * 100}px`,
            animation: `twinkle ${1.5 + Math.random()}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`
          }} />
        ))}
        <style>{`
          @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 0.8; } }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        `}</style>
      </div>
    ),
    calendar: (
      <div style={{ position: 'relative', width: '160px', height: '160px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: 'absolute',
            width: '120px',
            height: '80px',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            top: `${i * 25}px`,
            left: `${i * 20}px`,
            transform: `rotate(${-5 + i * 5}deg)`,
            animation: `float ${2 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`
          }}>
            <div style={{
              height: '20px',
              background: i === 2 ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)' : 'rgba(255,255,255,0.1)',
              borderRadius: '12px 12px 0 0'
            }} />
          </div>
        ))}
        <style>{`
          @keyframes float { 0%, 100% { transform: translateY(0) rotate(var(--r)); } 50% { transform: translateY(-5px) rotate(var(--r)); } }
        `}</style>
      </div>
    ),
    spark: (
      <div style={{ position: 'relative', width: '160px', height: '160px' }}>
        <div style={{
          position: 'absolute',
          inset: '30px',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(244, 208, 63, 0.1) 100%)',
          borderRadius: '50%',
          filter: 'blur(20px)',
          animation: 'glow 2s ease-in-out infinite'
        }} />
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: '3px',
            height: '20px',
            background: 'linear-gradient(to top, transparent, #d4af37)',
            top: '50%',
            left: '50%',
            transformOrigin: '50% 50px',
            transform: `rotate(${i * 45}deg)`,
            animation: `ray 1.5s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`
          }} />
        ))}
        <style>{`
          @keyframes glow { 0%, 100% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } }
          @keyframes ray { 0%, 100% { opacity: 0.3; height: 20px; } 50% { opacity: 1; height: 30px; } }
        `}</style>
      </div>
    ),
    mail: (
      <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '120px',
          height: '80px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
          animation: 'mailFloat 3s ease-in-out infinite'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '60px solid transparent',
            borderRight: '60px solid transparent',
            borderTop: '40px solid rgba(212, 175, 55, 0.3)'
          }} />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: '40px',
            height: '25px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '4px',
            top: `${20 + i * 5}px`,
            right: `${10 + i * 15}px`,
            animation: `mailIn 2s ease-out infinite`,
            animationDelay: `${i * 0.3}s`
          }} />
        ))}
        <style>{`
          @keyframes mailFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
          @keyframes mailIn { 0% { opacity: 0; transform: translateX(30px); } 30% { opacity: 1; } 70% { opacity: 1; } 100% { opacity: 0; transform: translateX(-20px); } }
        `}</style>
      </div>
    )
  };

  return visuals[type] || null;
};

// ==================== HOME SCREEN ====================
const HomeScreen = ({ onSelectTrip }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const trips = [
    {
      id: 1,
      destination: 'Bali',
      country: 'Indonesia',
      dates: 'Mar 20 - 31',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
      localTime: '10:42 PM',
      bookings: { flights: 2, hotels: 2, experiences: 5 },
      upcoming: true
    },
    {
      id: 2,
      destination: 'Paris',
      country: 'France',
      dates: 'Apr 15 - 22',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
      localTime: '5:42 PM',
      bookings: { flights: 2, hotels: 1, experiences: 4 },
      upcoming: true
    },
    {
      id: 3,
      destination: 'Queenstown',
      country: 'New Zealand',
      dates: 'Jan 5 - 14',
      image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&q=80',
      localTime: '6:42 AM',
      bookings: { flights: 2, hotels: 2, experiences: 6 },
      upcoming: false
    }
  ];

  const nextFlight = {
    airline: 'Singapore Airlines',
    flightNo: 'SQ 25',
    departure: 'JFK',
    arrival: 'DPS',
    departureTime: '22:45',
    arrivalTime: '11:30',
    arrivalNextDay: true,
    date: 'Mar 20',
    terminal: '4',
    gate: 'A12',
    status: 'On Time'
  };

  // Global trip alerts for homepage
  const globalAlerts = [
    { id: 1, type: 'info', title: 'Upcoming: Bali Trip', message: 'Online check-in for SQ 25 opens in 24 hours', time: '1h ago' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: '100px',
      position: 'relative'
    }}>
      <DebugLabel name="HOME-SCREEN" />
      {/* Header */}
      <div style={{
        padding: '60px 24px 24px',
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }}>
        <DebugLabel name="HOME-HEADER" />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '4px',
              fontWeight: '500'
            }}>Saturday, March 8</p>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              letterSpacing: '-0.5px'
            }}>
              Welcome back, <span style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Rafal</span>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <IconButton icon="search" />
            <IconButton icon="add" primary />
          </div>
        </div>
      </div>

      {/* Global Trip Alerts on Homepage */}
      <div style={{
        padding: '0 24px',
        marginBottom: '20px',
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.05s',
        position: 'relative'
      }}>
        <DebugLabel name="HOME-ALERTS" />
        <TripAlerts alerts={globalAlerts} compact />
      </div>

      {/* Next Flight */}
      <div style={{
        padding: '0 24px',
        marginBottom: '24px',
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s',
        position: 'relative'
      }}>
        <DebugLabel name="NEXT-FLIGHT-SECTION" />
        <SectionHeader title="Next Flight" subtitle="7 days" />
        <FlightCard flight={nextFlight} />
      </div>

      {/* Next Adventure */}
      <div style={{
        padding: '0 24px',
        marginBottom: '32px',
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
        position: 'relative'
      }}>
        <DebugLabel name="NEXT-ADVENTURE-SECTION" />
        <SectionHeader title="Next Adventure" />
        <div onClick={() => onSelectTrip(trips[0])} style={{ cursor: 'pointer' }}>
          <AdventureCard trip={trips[0]} />
        </div>
      </div>

      {/* Upcoming Trips */}
      <div style={{
        padding: '0 24px',
        marginBottom: '32px',
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
        position: 'relative'
      }}>
        <DebugLabel name="UPCOMING-TRIPS-SECTION" />
        <SectionHeader title="Upcoming" count={2} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {trips.filter(t => t.upcoming).map(trip => (
            <div key={trip.id} onClick={() => onSelectTrip(trip)} style={{ cursor: 'pointer' }}>
              <TripCard trip={trip} />
            </div>
          ))}
        </div>
      </div>

      {/* Past Trips */}
      <div style={{
        padding: '0 24px',
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s',
        position: 'relative'
      }}>
        <DebugLabel name="PAST-TRIPS-SECTION" />
        <SectionHeader title="Past Adventures" count={1} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {trips.filter(t => !t.upcoming).map(trip => (
            <div key={trip.id} onClick={() => onSelectTrip(trip)} style={{ cursor: 'pointer' }}>
              <TripCard trip={trip} past />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
};

const IconButton = ({ icon, primary }) => {
  const icons = {
    search: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
    ),
    add: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    )
  };

  return (
    <button style={{
      width: '44px',
      height: '44px',
      borderRadius: '14px',
      background: primary 
        ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)'
        : 'rgba(255,255,255,0.08)',
      border: primary ? 'none' : '1px solid rgba(255,255,255,0.1)',
      color: primary ? '#0a0a0f' : '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }}>
      {icons[icon]}
    </button>
  );
};

const SectionHeader = ({ title, subtitle, count }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '600',
        letterSpacing: '-0.3px'
      }}>{title}</h2>
      {count && (
        <span style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.4)',
          background: 'rgba(255,255,255,0.08)',
          padding: '4px 10px',
          borderRadius: '20px',
          fontWeight: '500'
        }}>{count}</span>
      )}
    </div>
    {subtitle && (
      <span style={{
        fontSize: '14px',
        color: '#d4af37',
        fontWeight: '500'
      }}>{subtitle}</span>
    )}
  </div>
);

const FlightCard = ({ flight }) => (
  <div style={{
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <DebugLabel name="FLIGHT-CARD" />
    {/* Decorative gradient */}
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: '150px',
      height: '150px',
      background: 'radial-gradient(circle at top right, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
      pointerEvents: 'none'
    }} />

    {/* Header */}
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, #dc143c 0%, #ff6b6b 100%)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>JL</span>
        </div>
        <div>
          <p style={{ fontSize: '15px', fontWeight: '600' }}>{flight.airline}</p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{flight.flightNo}</p>
        </div>
      </div>
      <div style={{
        background: 'rgba(34, 197, 94, 0.15)',
        color: '#22c55e',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {flight.status}
      </div>
    </div>

    {/* Flight Route */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px'
    }}>
      <div style={{ textAlign: 'left' }}>
        <p style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-1px' }}>{flight.departureTime}</p>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>{flight.departure}</p>
      </div>
      
      <div style={{ flex: 1, padding: '0 20px', position: 'relative' }}>
        <div style={{
          height: '2px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.3), #d4af37, rgba(255,255,255,0.3))',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#1a1a2e',
            padding: '0 8px'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#d4af37">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
        </div>
        <p style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.4)',
          textAlign: 'center',
          marginTop: '8px'
        }}>13h 55m</p>
      </div>

      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-1px' }}>{flight.arrivalTime}</p>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
          {flight.arrival}
          {flight.arrivalNextDay && <span style={{ color: '#d4af37', marginLeft: '6px' }}>+1</span>}
        </p>
      </div>
    </div>

    {/* Footer */}
    <div style={{
      display: 'flex',
      gap: '24px',
      paddingTop: '16px',
      borderTop: '1px solid rgba(255,255,255,0.08)'
    }}>
      <div>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>DATE</p>
        <p style={{ fontSize: '14px', fontWeight: '500' }}>{flight.date}</p>
      </div>
      <div>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>TERMINAL</p>
        <p style={{ fontSize: '14px', fontWeight: '500' }}>{flight.terminal}</p>
      </div>
      <div>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>GATE</p>
        <p style={{ fontSize: '14px', fontWeight: '500' }}>{flight.gate}</p>
      </div>
    </div>
  </div>
);

const AdventureCard = ({ trip }) => (
  <div style={{
    borderRadius: '24px',
    overflow: 'hidden',
    position: 'relative',
    height: '280px',
    cursor: 'pointer',
    transition: 'transform 0.3s ease'
  }}>
    <DebugLabel name="ADVENTURE-CARD" />
    {/* Background Image */}
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: `url(${trip.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }} />
    
    {/* Gradient Overlay */}
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)'
    }} />

    {/* Content */}
    <div style={{
      position: 'absolute',
      inset: 0,
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      {/* Top */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
          padding: '8px 14px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '2px' }}>LOCAL TIME</p>
          <p style={{ fontSize: '16px', fontWeight: '600' }}>{trip.localTime}</p>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
          color: '#0a0a0f',
          padding: '8px 14px',
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          {trip.dates}
        </div>
      </div>

      {/* Bottom */}
      <div>
        <p style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.7)',
          fontWeight: '500',
          marginBottom: '4px'
        }}>{trip.country}</p>
        <h3 style={{
          fontSize: '36px',
          fontWeight: '700',
          letterSpacing: '-1px',
          marginBottom: '16px'
        }}>{trip.destination}</h3>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <BookingPill icon="plane" count={trip.bookings.flights} label="Flights" />
          <BookingPill icon="hotel" count={trip.bookings.hotels} label="Hotels" />
          <BookingPill icon="ticket" count={trip.bookings.experiences} label="Experiences" />
        </div>
      </div>
    </div>
  </div>
);

const BookingPill = ({ icon, count, label }) => {
  const icons = {
    plane: <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>,
    hotel: <><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"/><path d="M3 21h18"/><path d="M9 7h1"/><path d="M14 7h1"/><path d="M9 11h1"/><path d="M14 11h1"/><path d="M9 15h1"/><path d="M14 15h1"/></>,
    ticket: <><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></>
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      padding: '8px 12px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
        {icons[icon]}
      </svg>
      <span style={{ fontSize: '13px', fontWeight: '500' }}>{count}</span>
    </div>
  );
};

const TripCard = ({ trip, past }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    opacity: past ? 0.7 : 1,
    position: 'relative'
  }}>
    <DebugLabel name={past ? "TRIP-CARD-PAST" : "TRIP-CARD"} />
    <div style={{
      width: '64px',
      height: '64px',
      borderRadius: '14px',
      backgroundImage: `url(${trip.image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      flexShrink: 0
    }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <h3 style={{
          fontSize: '17px',
          fontWeight: '600',
          letterSpacing: '-0.3px'
        }}>{trip.destination}</h3>
        <span style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.4)'
        }}>•</span>
        <span style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.5)'
        }}>{trip.country}</span>
      </div>
      <p style={{
        fontSize: '14px',
        color: 'rgba(255,255,255,0.4)'
      }}>{trip.dates}</p>
    </div>
    <div style={{
      display: 'flex',
      gap: '4px'
    }}>
      {Object.values(trip.bookings).map((count, i) => (
        <div key={i} style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: '500'
        }}>{count}</div>
      ))}
    </div>
  </div>
);

const BottomNav = () => {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', label: 'Home', icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>, iconActive: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="currentColor"/></> },
    { id: 'trips', label: 'Trips', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
    { id: 'wrapped', label: 'Wrapped', icon: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></> },
    { id: 'profile', label: 'Profile', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> }
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      padding: '12px 24px 28px',
      background: 'linear-gradient(to top, rgba(10, 10, 15, 0.98) 0%, rgba(10, 10, 15, 0.9) 50%, transparent 100%)'
    }}>
      <DebugLabel name="BOTTOM-NAV" />
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '8px',
        position: 'relative'
      }}>
        <DebugLabel name="NAV-TABS" />
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '12px 0',
              background: activeTab === tab.id ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
              border: 'none',
              borderRadius: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill={activeTab === tab.id && tab.id === 'wrapped' ? '#d4af37' : 'none'}
              stroke={activeTab === tab.id ? '#d4af37' : 'rgba(255,255,255,0.5)'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {activeTab === tab.id && tab.iconActive ? tab.iconActive : tab.icon}
            </svg>
            <span style={{
              fontSize: '11px',
              fontWeight: '500',
              color: activeTab === tab.id ? '#d4af37' : 'rgba(255,255,255,0.5)'
            }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
