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
  const [userBookings, setUserBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);

  const navigateTo = (screen, trip = null) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentScreen(screen);
      if (trip) setSelectedTrip(trip);
      setIsTransitioning(false);
    }, 300);
  };

  const addBooking = (booking) => {
    const newBooking = {
      ...booking,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setUserBookings(prev => [...prev, newBooking]);
    return newBooking;
  };

  const toggleSaveDestination = (destination) => {
    setSavedDestinations(prev => {
      const exists = prev.find(d => d.id === destination.id);
      if (exists) {
        return prev.filter(d => d.id !== destination.id);
      } else {
        return [...prev, { ...destination, savedAt: new Date().toISOString() }];
      }
    });
  };

  const isDestinationSaved = (destinationId) => {
    return savedDestinations.some(d => d.id === destinationId);
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
          <HomeScreen
            onSelectTrip={(trip) => navigateTo('tripDetail', trip)}
            onAddBooking={() => navigateTo('addBooking')}
            userBookings={userBookings}
            onNavigate={navigateTo}
          />
        )}
        {currentScreen === 'explore' && (
          <ExploreScreen
            onNavigate={navigateTo}
            savedDestinations={savedDestinations}
            onToggleSave={toggleSaveDestination}
            isDestinationSaved={isDestinationSaved}
            onSelectDestination={setSelectedDestination}
          />
        )}
        {currentScreen === 'tripDetail' && selectedTrip && (
          <TripDetailScreen
            trip={selectedTrip}
            onBack={() => navigateTo('home')}
            onAddBooking={() => navigateTo('addBooking')}
            userBookings={userBookings}
            onSelectBooking={setSelectedBooking}
          />
        )}
        {currentScreen === 'addBooking' && (
          <AddBookingScreen
            onBack={() => navigateTo(selectedTrip ? 'tripDetail' : 'home')}
            onSave={(booking) => {
              addBooking(booking);
              navigateTo(selectedTrip ? 'tripDetail' : 'home');
            }}
            selectedTrip={selectedTrip}
          />
        )}
      </div>

      {/* Booking Detail Modal - Rendered at App level for proper fixed positioning */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {/* Destination Detail Modal - Rendered at App level for proper fixed positioning */}
      {selectedDestination && (
        <DestinationDetailModal
          destination={selectedDestination}
          onClose={() => setSelectedDestination(null)}
          onToggleSave={toggleSaveDestination}
          isSaved={isDestinationSaved(selectedDestination.id)}
        />
      )}
    </div>
  );
};

// ==================== TRIP DETAIL SCREEN ====================
const TripDetailScreen = ({ trip, onBack, onAddBooking, userBookings = [], onSelectBooking }) => {
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
              onClick={onAddBooking}
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

            {/* User Added Bookings */}
            {userBookings.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <SectionHeader title="Your Bookings" count={userBookings.length} />
                <UserBookingsList bookings={userBookings} onSelectBooking={onSelectBooking} />
              </div>
            )}

            <SectionHeader title="Trip Timeline" />
            <TripTimeline timeline={timeline} onSelectEvent={onSelectBooking} />
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

// ==================== BOOKING DETAIL MODAL ====================
const BookingDetailModal = ({ booking, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBookingIcon = (type) => {
    const icons = {
      flight: <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>,
      hotel: <><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"/><path d="M3 21h18"/><rect x="9" y="12" width="6" height="5"/></>,
      car: <><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.5-4.3A2 2 0 0 0 13.8 5H9.2c-.7 0-1.3.3-1.7.8L5 10l-2.5 1.1C1.7 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></>,
      experience: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
      restaurant: <><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>,
      transfer: <><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M8 18h8"/><path d="M5 15V7a2 2 0 0 1 2-2h3"/><path d="M14 5l2-2 2 2"/><path d="M16 3v6"/></>
    };
    return icons[type] || icons.experience;
  };

  const getBookingColor = (type) => {
    const colors = {
      flight: '#d4af37',
      hotel: '#6366f1',
      car: '#22c55e',
      experience: '#ec4899',
      restaurant: '#ef4444',
      transfer: '#8b5cf6'
    };
    return colors[type] || '#d4af37';
  };

  const color = getBookingColor(booking.type);
  const confirmationNumber = booking.confirmationNumber || booking.subtitle?.match(/[A-Z]{2}\s?\d+/)?.[0] || 'N/A';

  // Type-specific details
  const renderFlightDetails = () => (
    <>
      <DetailRow label="Route" value={`${booking.departure || booking.title?.split('→')[0]?.trim() || ''} → ${booking.arrival || booking.title?.split('→')[1]?.trim() || ''}`} />
      <DetailRow label="Airline" value={booking.airline || booking.subtitle?.split(' ')[0] || ''} />
      <DetailRow label="Flight" value={booking.flightNumber || booking.subtitle || ''} />
      <DetailRow label="Date" value={booking.departureDate || ''} />
      <DetailRow label="Departure" value={booking.departureTime || booking.time || ''} />
      {booking.terminal && <DetailRow label="Terminal" value={booking.terminal} />}
      {booking.gate && <DetailRow label="Gate" value={booking.gate} />}
      {booking.seat && <DetailRow label="Seat" value={booking.seat} />}
      {booking.duration && <DetailRow label="Duration" value={booking.duration} />}
    </>
  );

  const renderHotelDetails = () => (
    <>
      <DetailRow label="Property" value={booking.name || booking.title || ''} />
      <DetailRow label="Location" value={booking.location || ''} />
      <DetailRow label="Check-in" value={booking.checkIn || ''} />
      <DetailRow label="Check-out" value={booking.checkOut || ''} />
      {booking.roomType && <DetailRow label="Room" value={booking.roomType} />}
      {booking.roomNumber && <DetailRow label="Room #" value={booking.roomNumber} />}
      {booking.wifiPassword && <DetailRow label="WiFi" value={booking.wifiPassword} copyable onCopy={() => copyToClipboard(booking.wifiPassword)} />}
      {booking.duration && <DetailRow label="Duration" value={booking.duration} />}
    </>
  );

  const renderCarDetails = () => (
    <>
      <DetailRow label="Company" value={booking.company || ''} />
      <DetailRow label="Pick-up" value={booking.pickupLocation || ''} />
      <DetailRow label="Drop-off" value={booking.dropoffLocation || ''} />
      <DetailRow label="Pick-up Date" value={booking.pickupDate || ''} />
      <DetailRow label="Drop-off Date" value={booking.dropoffDate || ''} />
      {booking.carType && <DetailRow label="Vehicle" value={booking.carType} />}
      {booking.pickupPin && <DetailRow label="PIN Code" value={booking.pickupPin} copyable onCopy={() => copyToClipboard(booking.pickupPin)} />}
      {booking.licensePlate && <DetailRow label="License Plate" value={booking.licensePlate} />}
    </>
  );

  const renderExperienceDetails = () => (
    <>
      <DetailRow label="Experience" value={booking.name || booking.title || ''} />
      {booking.provider && <DetailRow label="Provider" value={booking.provider} />}
      <DetailRow label="Location" value={booking.location || ''} />
      <DetailRow label="Date" value={booking.date || ''} />
      <DetailRow label="Time" value={booking.time || ''} />
      {booking.duration && <DetailRow label="Duration" value={booking.duration} />}
      {booking.meetingPoint && <DetailRow label="Meeting Point" value={booking.meetingPoint} />}
      {booking.guideContact && <DetailRow label="Guide" value={booking.guideContact} />}
    </>
  );

  const renderRestaurantDetails = () => (
    <>
      <DetailRow label="Restaurant" value={booking.name || booking.title || ''} />
      <DetailRow label="Location" value={booking.location || ''} />
      <DetailRow label="Date" value={booking.date || ''} />
      <DetailRow label="Time" value={booking.time || ''} />
      {booking.partySize && <DetailRow label="Party Size" value={`${booking.partySize} guests`} />}
      {booking.tableNumber && <DetailRow label="Table" value={booking.tableNumber} />}
    </>
  );

  const renderTransferDetails = () => (
    <>
      <DetailRow label="Company" value={booking.company || booking.title || ''} />
      <DetailRow label="Pick-up" value={booking.pickupLocation || ''} />
      <DetailRow label="Drop-off" value={booking.dropoffLocation || ''} />
      <DetailRow label="Date" value={booking.date || ''} />
      <DetailRow label="Time" value={booking.time || ''} />
      {booking.duration && <DetailRow label="Duration" value={booking.duration} />}
      {booking.driverName && <DetailRow label="Driver" value={booking.driverName} />}
      {booking.driverPhone && <DetailRow label="Contact" value={booking.driverPhone} />}
      {booking.vehicleInfo && <DetailRow label="Vehicle" value={booking.vehicleInfo} />}
    </>
  );

  const renderDetails = () => {
    switch (booking.type) {
      case 'flight': return renderFlightDetails();
      case 'hotel': return renderHotelDetails();
      case 'car': return renderCarDetails();
      case 'experience': return renderExperienceDetails();
      case 'restaurant': return renderRestaurantDetails();
      case 'transfer': return renderTransferDetails();
      default: return renderExperienceDetails();
    }
  };

  // Mock attachments for demo
  const attachments = booking.attachments || [];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }}>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Modal Content */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '90vh',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a0f 100%)',
        borderRadius: '24px 24px 0 0',
        overflow: 'hidden',
        transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* Handle bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '12px',
          cursor: 'pointer'
        }} onClick={handleClose}>
          <div style={{
            width: '36px',
            height: '4px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '2px'
          }} />
        </div>

        {/* Scrollable content */}
        <div style={{
          maxHeight: 'calc(90vh - 40px)',
          overflowY: 'auto',
          padding: '0 24px 40px'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: `${color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1">
                {getBookingIcon(booking.type)}
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '11px',
                fontWeight: '600',
                color: color,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px'
              }}>
                {booking.type}
              </p>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                letterSpacing: '-0.3px'
              }}>
                {booking.title || booking.name || booking.airline || 'Booking Details'}
              </h2>
            </div>
          </div>

          {/* Confirmation Number - Hero element */}
          <div style={{
            background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
            border: `1px solid ${color}30`,
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: '600',
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Confirmation Number
              </span>
              <button
                onClick={() => copyToClipboard(confirmationNumber)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  color: copied ? '#22c55e' : '#fff',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {copied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <p style={{
              fontSize: '28px',
              fontWeight: '700',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '2px',
              color: '#fff'
            }}>
              {confirmationNumber}
            </p>
          </div>

          {/* Status Row */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            flexWrap: 'wrap'
          }}>
            <StatusBadge
              label={booking.status || 'confirmed'}
              color={booking.status === 'pending' ? '#f97316' : '#22c55e'}
            />
            {booking.paymentStatus && (
              <StatusBadge
                label={booking.paymentStatus === 'paid' ? 'Paid' : 'Payment Due'}
                color={booking.paymentStatus === 'paid' ? '#6366f1' : '#f97316'}
              />
            )}
            {booking.price && (
              <StatusBadge
                label={`$${booking.price}`}
                color="#d4af37"
              />
            )}
          </div>

          {/* Details Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '16px'
            }}>
              Details
            </h3>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              {renderDetails()}
            </div>
          </div>

          {/* Attachments Section */}
          {attachments.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '13px',
                fontWeight: '600',
                color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '16px'
              }}>
                Attachments
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {attachments.map((doc, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span style={{ fontSize: '14px', flex: 1 }}>{doc.name}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              color: '#fff',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Maps
            </button>
            <button style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
              background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
              border: 'none',
              borderRadius: '14px',
              color: '#0a0a0f',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Detail Row Component
const DetailRow = ({ label, value, copyable, onCopy }) => {
  if (!value) return null;
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.04)'
    }}>
      <span style={{
        fontSize: '14px',
        color: 'rgba(255,255,255,0.5)'
      }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#fff'
        }}>
          {value}
        </span>
        {copyable && (
          <button
            onClick={onCopy}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 8px',
              cursor: 'pointer',
              color: '#fff',
              fontSize: '11px',
              fontWeight: '600'
            }}
          >
            Copy
          </button>
        )}
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ label, color }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '20px',
    background: `${color}20`,
    fontSize: '12px',
    fontWeight: '600',
    color: color,
    textTransform: 'capitalize'
  }}>
    <div style={{
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: color
    }} />
    {label}
  </span>
);

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
const TripTimeline = ({ timeline, onSelectEvent }) => {
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
                onClick={() => onSelectEvent?.(event)}
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

// ==================== USER BOOKINGS LIST ====================
const UserBookingsList = ({ bookings, onSelectBooking }) => {
  const getBookingIcon = (type) => {
    const icons = {
      flight: <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>,
      hotel: <><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"/><path d="M3 21h18"/><rect x="9" y="12" width="6" height="5"/></>,
      car: <><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.5-4.3A2 2 0 0 0 13.8 5H9.2c-.7 0-1.3.3-1.7.8L5 10l-2.5 1.1C1.7 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></>,
      experience: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
      restaurant: <><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>,
      transfer: <><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M8 18h8"/><path d="M5 15V7a2 2 0 0 1 2-2h3"/><path d="M14 5l2-2 2 2"/><path d="M16 3v6"/></>
    };
    return icons[type] || icons.experience;
  };

  const getBookingColor = (type) => {
    const colors = {
      flight: '#d4af37',
      hotel: '#6366f1',
      car: '#22c55e',
      experience: '#ec4899',
      restaurant: '#ef4444',
      transfer: '#8b5cf6'
    };
    return colors[type] || '#d4af37';
  };

  const getBookingTitle = (booking) => {
    switch (booking.type) {
      case 'flight':
        return `${booking.airline || 'Flight'} ${booking.flightNumber || ''}`;
      case 'hotel':
        return booking.name || 'Hotel';
      case 'car':
        return `${booking.company || 'Car Rental'} - ${booking.carType || 'Vehicle'}`;
      case 'experience':
        return booking.name || 'Experience';
      case 'restaurant':
        return booking.name || 'Restaurant';
      case 'transfer':
        return `${booking.company || 'Transfer'}`;
      default:
        return 'Booking';
    }
  };

  const getBookingSubtitle = (booking) => {
    switch (booking.type) {
      case 'flight':
        return `${booking.departure || ''} → ${booking.arrival || ''} • ${booking.departureDate || ''}`;
      case 'hotel':
        return `${booking.location || ''} • ${booking.checkIn || ''} - ${booking.checkOut || ''}`;
      case 'car':
        return `${booking.pickupLocation || ''} • ${booking.pickupDate || ''}`;
      case 'experience':
        return `${booking.location || ''} • ${booking.date || ''}`;
      case 'restaurant':
        return `${booking.location || ''} • ${booking.date || ''} at ${booking.time || ''}`;
      case 'transfer':
        return `${booking.pickupLocation || ''} → ${booking.dropoffLocation || ''}`;
      default:
        return '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {bookings.map(booking => {
        const color = getBookingColor(booking.type);
        return (
          <div
            key={booking.id}
            onClick={() => onSelectBooking?.(booking)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {/* Icon */}
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: `${color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1">
                {getBookingIcon(booking.type)}
              </svg>
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <p style={{ fontSize: '15px', fontWeight: '600' }}>
                  {getBookingTitle(booking)}
                </p>
                {booking.price && (
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#d4af37' }}>
                    ${booking.price}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                {getBookingSubtitle(booking)}
              </p>

              {/* Status badges */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(34, 197, 94, 0.15)',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#22c55e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e' }} />
                  Confirmed
                </span>

                {booking.paymentStatus && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: booking.paymentStatus === 'paid' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(249, 115, 22, 0.15)',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: booking.paymentStatus === 'paid' ? '#818cf8' : '#f97316',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {booking.paymentStatus === 'paid' ? 'Paid' : 'Payment Due'}
                  </span>
                )}

                {booking.source === 'screenshot' && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: 'rgba(212, 175, 55, 0.15)',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#d4af37',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    AI Parsed
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
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

// ==================== ADD BOOKING SCREEN ====================
const AddBookingScreen = ({ onBack, onSave, selectedTrip }) => {
  const [step, setStep] = useState('method'); // 'method' | 'type' | 'form' | 'screenshot' | 'email' | 'confirm'
  const [inputMethod, setInputMethod] = useState(null); // 'manual' | 'screenshot' | 'email'
  const [bookingType, setBookingType] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const bookingTypes = [
    { id: 'flight', label: 'Flight', icon: <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>, color: '#d4af37' },
    { id: 'hotel', label: 'Hotel', icon: <><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"/><path d="M3 21h18"/><rect x="9" y="12" width="6" height="5"/></>, color: '#6366f1' },
    { id: 'car', label: 'Car Rental', icon: <><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.5-4.3A2 2 0 0 0 13.8 5H9.2c-.7 0-1.3.3-1.7.8L5 10l-2.5 1.1C1.7 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></>, color: '#22c55e' },
    { id: 'experience', label: 'Experience', icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>, color: '#ec4899' },
    { id: 'restaurant', label: 'Restaurant', icon: <><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>, color: '#ef4444' },
    { id: 'transfer', label: 'Transfer', icon: <><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M8 18h8"/><path d="M5 15V7a2 2 0 0 1 2-2h3"/><path d="M14 5l2-2 2 2"/><path d="M16 3v6"/></>, color: '#8b5cf6' }
  ];

  const inputMethods = [
    {
      id: 'manual',
      title: 'Manual Entry',
      subtitle: 'Type in your booking details',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      )
    },
    {
      id: 'screenshot',
      title: 'Upload Screenshot',
      subtitle: 'We\'ll extract the details for you',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      )
    },
    {
      id: 'email',
      title: 'Email Forwarding',
      subtitle: 'Forward confirmation emails to import',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <polyline points="22 6 12 13 2 6"/>
        </svg>
      )
    }
  ];

  const handleMethodSelect = (method) => {
    setInputMethod(method);
    if (method === 'screenshot') {
      setStep('screenshot');
    } else if (method === 'email') {
      setStep('email');
    } else {
      setStep('type');
    }
  };

  const handleTypeSelect = (type) => {
    setBookingType(type);
    setStep('form');
  };

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    // Simulate AI processing with realistic delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Simulate parsed data based on file name hints or random
    const simulatedData = {
      flight: {
        type: 'flight',
        airline: 'United Airlines',
        flightNumber: 'UA 847',
        departure: 'LAX',
        arrival: 'NRT',
        departureDate: '2025-04-15',
        departureTime: '11:30',
        arrivalDate: '2025-04-16',
        arrivalTime: '15:45',
        confirmationNumber: 'ABC123XYZ',
        price: 1250,
        currency: 'USD',
        paymentStatus: 'paid',
        status: 'confirmed'
      },
      hotel: {
        type: 'hotel',
        name: 'The Ritz-Carlton',
        location: 'Tokyo, Japan',
        checkIn: '2025-04-16',
        checkOut: '2025-04-20',
        roomType: 'Deluxe King',
        confirmationNumber: 'RC789456',
        price: 2400,
        currency: 'USD',
        paymentStatus: 'unpaid',
        status: 'confirmed'
      }
    };

    // Randomly pick flight or hotel for demo
    const parsed = Math.random() > 0.5 ? simulatedData.flight : simulatedData.hotel;
    setParsedData(parsed);
    setBookingType(parsed.type);
    setFormData(parsed);
    setIsProcessing(false);
    setStep('confirm');
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const booking = {
      ...formData,
      type: bookingType,
      source: inputMethod,
      tripId: selectedTrip?.id
    };
    onSave(booking);
  };

  const renderMethodSelection = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.5px' }}>
        Add a booking
      </h2>
      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>
        How would you like to add your booking?
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {inputMethods.map(method => (
          <button
            key={method.id}
            onClick={() => handleMethodSelect(method.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d4af37'
            }}>
              {method.icon}
            </div>
            <div>
              <p style={{ fontSize: '17px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                {method.title}
              </p>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                {method.subtitle}
              </p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" style={{ marginLeft: 'auto' }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  );

  const renderTypeSelection = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.5px' }}>
        What type of booking?
      </h2>
      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>
        Select the type of booking you want to add
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {bookingTypes.map(type => (
          <button
            key={type.id}
            onClick={() => handleTypeSelect(type.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              padding: '24px 16px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `${type.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill={type.color} stroke={type.color} strokeWidth="1">
                {type.icon}
              </svg>
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
              {type.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderScreenshotUpload = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.5px' }}>
        Upload screenshot
      </h2>
      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>
        Upload a screenshot of your booking confirmation
      </p>

      {isProcessing ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 24px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '3px solid rgba(212, 175, 55, 0.2)',
            borderTopColor: '#d4af37',
            animation: 'spin 1s linear infinite',
            marginBottom: '24px'
          }} />
          <p style={{ fontSize: '17px', fontWeight: '600', marginBottom: '8px' }}>
            Analyzing your screenshot...
          </p>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
            Extracting booking details with AI
          </p>
        </div>
      ) : (
        <label style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 24px',
          background: 'rgba(255,255,255,0.04)',
          border: '2px dashed rgba(255,255,255,0.15)',
          borderRadius: '20px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleScreenshotUpload}
            style={{ display: 'none' }}
          />
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <p style={{ fontSize: '17px', fontWeight: '600', marginBottom: '8px' }}>
            Tap to upload
          </p>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
            PNG, JPG, or screenshot from your camera roll
          </p>
        </label>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const renderForm = () => {
    const type = bookingTypes.find(t => t.id === bookingType);

    const fields = {
      flight: [
        { key: 'airline', label: 'Airline', placeholder: 'e.g. United Airlines' },
        { key: 'flightNumber', label: 'Flight Number', placeholder: 'e.g. UA 847' },
        { key: 'departure', label: 'From', placeholder: 'e.g. LAX' },
        { key: 'arrival', label: 'To', placeholder: 'e.g. NRT' },
        { key: 'departureDate', label: 'Departure Date', type: 'date' },
        { key: 'departureTime', label: 'Departure Time', type: 'time' },
        { key: 'confirmationNumber', label: 'Confirmation #', placeholder: 'e.g. ABC123' },
        { key: 'price', label: 'Price', type: 'number', placeholder: '0.00' },
        { key: 'paymentStatus', label: 'Payment Status', type: 'select', options: ['paid', 'unpaid', 'partial'] }
      ],
      hotel: [
        { key: 'name', label: 'Hotel Name', placeholder: 'e.g. The Ritz-Carlton' },
        { key: 'location', label: 'Location', placeholder: 'e.g. Tokyo, Japan' },
        { key: 'checkIn', label: 'Check-in Date', type: 'date' },
        { key: 'checkOut', label: 'Check-out Date', type: 'date' },
        { key: 'roomType', label: 'Room Type', placeholder: 'e.g. Deluxe King' },
        { key: 'confirmationNumber', label: 'Confirmation #', placeholder: 'e.g. RC789456' },
        { key: 'price', label: 'Total Price', type: 'number', placeholder: '0.00' },
        { key: 'paymentStatus', label: 'Payment Status', type: 'select', options: ['paid', 'unpaid', 'partial'] }
      ],
      car: [
        { key: 'company', label: 'Rental Company', placeholder: 'e.g. Hertz' },
        { key: 'pickupLocation', label: 'Pick-up Location', placeholder: 'e.g. LAX Airport' },
        { key: 'dropoffLocation', label: 'Drop-off Location', placeholder: 'e.g. SFO Airport' },
        { key: 'pickupDate', label: 'Pick-up Date', type: 'date' },
        { key: 'dropoffDate', label: 'Drop-off Date', type: 'date' },
        { key: 'carType', label: 'Car Type', placeholder: 'e.g. SUV' },
        { key: 'confirmationNumber', label: 'Confirmation #', placeholder: 'e.g. HZ123456' },
        { key: 'price', label: 'Total Price', type: 'number', placeholder: '0.00' },
        { key: 'paymentStatus', label: 'Payment Status', type: 'select', options: ['paid', 'unpaid', 'partial'] }
      ],
      experience: [
        { key: 'name', label: 'Experience Name', placeholder: 'e.g. Sunrise Temple Tour' },
        { key: 'provider', label: 'Provider', placeholder: 'e.g. Viator' },
        { key: 'location', label: 'Location', placeholder: 'e.g. Bali, Indonesia' },
        { key: 'date', label: 'Date', type: 'date' },
        { key: 'time', label: 'Time', type: 'time' },
        { key: 'duration', label: 'Duration', placeholder: 'e.g. 3 hours' },
        { key: 'confirmationNumber', label: 'Confirmation #', placeholder: 'e.g. VIA789' },
        { key: 'price', label: 'Price', type: 'number', placeholder: '0.00' },
        { key: 'paymentStatus', label: 'Payment Status', type: 'select', options: ['paid', 'unpaid', 'partial'] }
      ],
      restaurant: [
        { key: 'name', label: 'Restaurant Name', placeholder: 'e.g. Nobu' },
        { key: 'location', label: 'Location', placeholder: 'e.g. Tokyo, Japan' },
        { key: 'date', label: 'Date', type: 'date' },
        { key: 'time', label: 'Time', type: 'time' },
        { key: 'partySize', label: 'Party Size', type: 'number', placeholder: '2' },
        { key: 'confirmationNumber', label: 'Confirmation #', placeholder: 'e.g. NOBU123' }
      ],
      transfer: [
        { key: 'company', label: 'Company', placeholder: 'e.g. Blacklane' },
        { key: 'pickupLocation', label: 'Pick-up', placeholder: 'e.g. NRT Airport' },
        { key: 'dropoffLocation', label: 'Drop-off', placeholder: 'e.g. Hotel' },
        { key: 'date', label: 'Date', type: 'date' },
        { key: 'time', label: 'Time', type: 'time' },
        { key: 'confirmationNumber', label: 'Confirmation #', placeholder: 'e.g. BL456' },
        { key: 'price', label: 'Price', type: 'number', placeholder: '0.00' },
        { key: 'paymentStatus', label: 'Payment Status', type: 'select', options: ['paid', 'unpaid', 'partial'] }
      ]
    };

    const currentFields = fields[bookingType] || [];

    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: `${type?.color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill={type?.color} stroke={type?.color} strokeWidth="1">
              {type?.icon}
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.3px' }}>
              {type?.label} Details
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
              {parsedData ? 'Review extracted details' : 'Enter your booking information'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentFields.map(field => (
            <div key={field.key}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {field.label}
              </label>
              {field.type === 'select' ? (
                <select
                  value={formData[field.key] || ''}
                  onChange={(e) => handleFormChange(field.key, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                >
                  <option value="">Select...</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleFormChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '18px',
            marginTop: '32px',
            background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
            border: 'none',
            borderRadius: '14px',
            color: '#0a0a0f',
            fontSize: '17px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(212, 175, 55, 0.3)'
          }}
        >
          Save Booking
        </button>
      </div>
    );
  };

  const renderConfirmation = () => {
    const type = bookingTypes.find(t => t.id === bookingType);

    return (
      <div style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '32px 24px',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
            Details Extracted!
          </h3>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
            We found a {type?.label.toLowerCase()} booking. Please review the details below.
          </p>
        </div>

        <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
          Extracted Information
        </h4>

        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          {Object.entries(formData).filter(([key]) => key !== 'type').map(([key, value]) => (
            <div key={key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                {typeof value === 'number' ? `$${value}` : value}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setStep('form')}
            style={{
              flex: 1,
              padding: '16px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Edit Details
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '16px',
              background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
              border: 'none',
              borderRadius: '14px',
              color: '#0a0a0f',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Confirm & Save
          </button>
        </div>
      </div>
    );
  };

  const renderEmailForwarding = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.5px' }}>
        Email Forwarding
      </h2>
      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>
        Forward your confirmation emails to automatically import bookings
      </p>

      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '32px 24px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          color: '#d4af37'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <polyline points="22 6 12 13 2 6"/>
          </svg>
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
          Coming Soon
        </h3>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>
          This feature is under development. Soon you'll be able to forward confirmation emails to automatically import your bookings.
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <DebugLabel name="ADD-BOOKING-SCREEN" />

      {/* Header */}
      <div style={{
        padding: '56px 24px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <button
          onClick={() => {
            if (step === 'method') {
              onBack();
            } else if (step === 'type') {
              setStep('method');
            } else if (step === 'form') {
              setStep(inputMethod === 'screenshot' ? 'confirm' : 'type');
            } else if (step === 'screenshot') {
              setStep('method');
            } else if (step === 'email') {
              setStep('method');
            } else if (step === 'confirm') {
              setStep('screenshot');
            }
          }}
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

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
          {['method', 'type', 'form'].map((s, i) => (
            <div
              key={s}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: ['method', 'screenshot'].includes(step) && i === 0 ? '#d4af37' :
                           step === 'type' && i <= 1 ? '#d4af37' :
                           ['form', 'confirm'].includes(step) ? '#d4af37' :
                           'rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s'
      }}>
        {step === 'method' && renderMethodSelection()}
        {step === 'type' && renderTypeSelection()}
        {step === 'form' && renderForm()}
        {step === 'screenshot' && renderScreenshotUpload()}
        {step === 'email' && renderEmailForwarding()}
        {step === 'confirm' && renderConfirmation()}
      </div>
    </div>
  );
};

// ==================== HOME SCREEN ====================
const HomeScreen = ({ onSelectTrip, onAddBooking, userBookings = [], onNavigate }) => {
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
            <IconButton icon="add" primary onClick={onAddBooking} />
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
      <BottomNav activeTab="home" onNavigate={onNavigate} />
    </div>
  );
};

const IconButton = ({ icon, primary, onClick }) => {
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
    <button onClick={onClick} style={{
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

const BottomNav = ({ activeTab = 'home', onNavigate }) => {
  const tabs = [
    { id: 'home', label: 'Home', screen: 'home', icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>, iconActive: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="currentColor"/></> },
    { id: 'explore', label: 'Explore', screen: 'explore', icon: <><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>, iconActive: <><circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2"/><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></> },
    { id: 'trips', label: 'Trips', screen: 'home', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
    { id: 'wrapped', label: 'Wrapped', screen: 'home', icon: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></> },
    { id: 'profile', label: 'Profile', screen: 'home', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> }
  ];

  const handleTabClick = (tab) => {
    if (onNavigate && tab.screen) {
      onNavigate(tab.screen);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      padding: '12px 24px 28px',
      background: 'linear-gradient(to top, rgba(10, 10, 15, 0.98) 0%, rgba(10, 10, 15, 0.9) 50%, transparent 100%)',
      zIndex: 100
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
            onClick={() => handleTabClick(tab)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '10px 0',
              background: activeTab === tab.id ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
              border: 'none',
              borderRadius: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={activeTab === tab.id && (tab.id === 'wrapped' || tab.id === 'explore') ? '#d4af37' : 'none'}
              stroke={activeTab === tab.id ? '#d4af37' : 'rgba(255,255,255,0.5)'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {activeTab === tab.id && tab.iconActive ? tab.iconActive : tab.icon}
            </svg>
            <span style={{
              fontSize: '10px',
              fontWeight: '500',
              color: activeTab === tab.id ? '#d4af37' : 'rgba(255,255,255,0.5)'
            }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ==================== EXPLORE SCREEN ====================
const ExploreScreen = ({ onNavigate, savedDestinations = [], onToggleSave, isDestinationSaved, onSelectDestination }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState('foryou');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const filters = [
    { id: 'foryou', label: 'For You', icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/> },
    { id: 'deals', label: 'Deals', icon: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></> },
    { id: 'trending', label: 'Trending', icon: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></> },
    { id: 'saved', label: 'Saved', icon: <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/> }
  ];

  const heroDestinations = [
    {
      id: 'hero-1',
      destination: 'Japan',
      tagline: 'Cherry Blossom Season',
      description: 'Experience the magic of sakura in full bloom across ancient temples and modern cities',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80',
      price: 899,
      duration: '7 days',
      season: 'Spring Special',
      rating: 4.9,
      reviews: 2847
    }
  ];

  const flashDeals = [
    { id: 'deal-1', type: 'flight', route: 'NYC → Paris', airline: 'Air France', originalPrice: 499, dealPrice: 299, discount: 40, endsIn: 7200, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80' },
    { id: 'deal-2', type: 'hotel', name: 'Four Seasons Bali', location: 'Ubud, Indonesia', originalPrice: 450, dealPrice: 289, discount: 36, perNight: true, endsIn: 14400, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80' },
    { id: 'deal-3', type: 'package', name: 'Maldives Escape', includes: 'Flight + 5 nights', originalPrice: 3200, dealPrice: 2199, discount: 31, endsIn: 28800, image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80' }
  ];

  const becauseYouLoved = {
    basedOn: 'Bali',
    destinations: [
      { id: 'rec-1', destination: 'Fiji', country: 'South Pacific', tagline: 'Island Paradise', image: 'https://images.unsplash.com/photo-1589179899221-9f5c5ed2c1d0?w=400&q=80', price: 1899, match: 94 },
      { id: 'rec-2', destination: 'Phuket', country: 'Thailand', tagline: 'Beach & Culture', image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&q=80', price: 799, match: 91 },
      { id: 'rec-3', destination: 'Sri Lanka', country: 'South Asia', tagline: 'Hidden Gem', image: 'https://images.unsplash.com/photo-1586613835341-28f093579ab4?w=400&q=80', price: 1099, match: 88 },
      { id: 'rec-4', destination: 'Vietnam', country: 'Southeast Asia', tagline: 'Adventure Awaits', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=80', price: 699, match: 85 }
    ]
  };

  const culturalSpotlights = [
    { id: 'culture-1', title: 'A Week in Morocco', subtitle: 'From Marrakech to the Sahara', readTime: '8 min read', image: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=600&q=80', category: 'Immersive Guide', author: 'Sarah Chen', saves: 4521 },
    { id: 'culture-2', title: 'Tokyo After Dark', subtitle: 'Discovering hidden izakayas', readTime: '6 min read', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80', category: 'Local Secrets', author: 'James Tanaka', saves: 3892 }
  ];

  const trendingDestinations = [
    { id: 'trend-1', rank: 1, destination: 'Portugal', country: 'Europe', change: '+12', image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=300&q=80', searches: '45K' },
    { id: 'trend-2', rank: 2, destination: 'Greece', country: 'Europe', change: '+8', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=300&q=80', searches: '38K' },
    { id: 'trend-3', rank: 3, destination: 'Mexico', country: 'North America', change: '+15', image: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=300&q=80', searches: '32K' },
    { id: 'trend-4', rank: 4, destination: 'Croatia', country: 'Europe', change: '+6', image: 'https://images.unsplash.com/photo-1555990538-1e6c89d63468?w=300&q=80', searches: '28K' },
    { id: 'trend-5', rank: 5, destination: 'New Zealand', country: 'Oceania', change: '+4', image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=300&q=80', searches: '24K' }
  ];

  const dreamTrips = [
    { id: 'dream-1', destination: 'Santorini', country: 'Greece', tagline: 'Sunset Paradise', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=500&q=80', startingPrice: 1499, highlight: 'Iconic Views' },
    { id: 'dream-2', destination: 'Swiss Alps', country: 'Switzerland', tagline: 'Mountain Majesty', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=500&q=80', startingPrice: 2199, highlight: 'Adventure' },
    { id: 'dream-3', destination: 'Amalfi Coast', country: 'Italy', tagline: 'Coastal Dreams', image: 'https://images.unsplash.com/photo-1534008897995-27a23e859048?w=500&q=80', startingPrice: 1799, highlight: 'Romance' }
  ];

  const handleDestinationClick = (destination) => {
    if (onSelectDestination) onSelectDestination(destination);
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '120px', position: 'relative' }}>
      <DebugLabel name="EXPLORE-SCREEN" />

      {/* Header */}
      <div style={{
        padding: '60px 24px 20px',
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }}>
        <DebugLabel name="EXPLORE-HEADER" />
        <h1 style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '6px' }}>
          <span style={{ background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Explore</span>
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', fontWeight: '400' }}>Discover your next adventure</p>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '0 24px', marginBottom: '20px', opacity: isLoaded ? 1 : 0, transform: isLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.05s', position: 'relative' }}>
        <DebugLabel name="SEARCH-BAR" />
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: searchFocused ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
          border: searchFocused ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', padding: '14px 18px', transition: 'all 0.2s ease'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={searchFocused ? '#d4af37' : 'rgba(255,255,255,0.4)'} strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Where to next?" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '16px', fontWeight: '400' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ padding: '0 24px', marginBottom: '24px', opacity: isLoaded ? 1 : 0, transform: isLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s', position: 'relative' }}>
        <DebugLabel name="FILTER-TABS" />
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {filters.map(filter => (
            <button key={filter.id} onClick={() => setActiveFilter(filter.id)} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
              background: activeFilter === filter.id ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)' : 'rgba(255,255,255,0.05)',
              border: activeFilter === filter.id ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap', flexShrink: 0
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={activeFilter === filter.id ? '#d4af37' : 'none'} stroke={activeFilter === filter.id ? '#d4af37' : 'rgba(255,255,255,0.5)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{filter.icon}</svg>
              <span style={{ fontSize: '14px', fontWeight: '500', color: activeFilter === filter.id ? '#d4af37' : 'rgba(255,255,255,0.7)' }}>{filter.label}</span>
              {filter.id === 'saved' && savedDestinations.length > 0 && (
                <span style={{ background: '#d4af37', color: '#0a0a0f', fontSize: '11px', fontWeight: '600', padding: '2px 6px', borderRadius: '10px', minWidth: '18px', textAlign: 'center' }}>{savedDestinations.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* For You Tab Content */}
      {activeFilter === 'foryou' && (
        <>
          {/* Hero Card */}
          <div style={{ padding: '0 24px', marginBottom: '28px', opacity: isLoaded ? 1 : 0, transform: isLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.15s', position: 'relative' }}>
            <DebugLabel name="HERO-SECTION" />
            <ExploreHeroCard destination={heroDestinations[0]} onSelect={handleDestinationClick} onSave={onToggleSave} isSaved={isDestinationSaved(heroDestinations[0].id)} />
          </div>

          {/* Because You Loved Section */}
          <div style={{ marginBottom: '28px', opacity: isLoaded ? 1 : 0, transform: isLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s', position: 'relative' }}>
            <DebugLabel name="BECAUSE-YOU-LOVED" />
            <div style={{ padding: '0 24px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', letterSpacing: '-0.3px' }}>Because you loved</h2>
                <span style={{ background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '20px', fontWeight: '700' }}>{becauseYouLoved.basedOn}</span>
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>AI-curated destinations matching your travel style</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '0 24px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {becauseYouLoved.destinations.map(dest => (
                <ExploreDestinationCard key={dest.id} destination={dest} onSelect={handleDestinationClick} onSave={onToggleSave} isSaved={isDestinationSaved(dest.id)} showMatch />
              ))}
            </div>
          </div>

          {/* Flash Deals Section */}
          <div style={{ marginBottom: '28px', opacity: isLoaded ? 1 : 0, transform: isLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.25s', position: 'relative' }}>
            <DebugLabel name="FLASH-DEALS" />
            <div style={{ padding: '0 24px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', letterSpacing: '-0.3px' }}>Flash Deals</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.15)', padding: '4px 10px', borderRadius: '8px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#ef4444' }}>LIVE</span>
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Limited time offers, book now</p>
              </div>
              <button style={{ background: 'transparent', border: 'none', color: '#d4af37', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>See all</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 24px' }}>
              {flashDeals.map(deal => (<ExploreDealCard key={deal.id} deal={deal} />))}
            </div>
          </div>

          {/* Cultural Spotlight */}
          <div style={{ marginBottom: '28px', opacity: isLoaded ? 1 : 0, transform: isLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s', position: 'relative' }}>
            <DebugLabel name="CULTURAL-SPOTLIGHT" />
            <div style={{ padding: '0 24px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', letterSpacing: '-0.3px' }}>Cultural Spotlight</h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Immerse yourself in destinations</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '0 24px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {culturalSpotlights.map(spotlight => (<ExploreCulturalCard key={spotlight.id} spotlight={spotlight} />))}
            </div>
          </div>

          {/* Dream Trips */}
          <div style={{ marginBottom: '28px', opacity: isLoaded ? 1 : 0, transform: isLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.35s', position: 'relative' }}>
            <DebugLabel name="DREAM-TRIPS" />
            <div style={{ padding: '0 24px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', letterSpacing: '-0.3px' }}>Dream Trips</h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Bucket-list worthy destinations</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '0 24px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {dreamTrips.map(trip => (<ExploreDreamCard key={trip.id} trip={trip} onSelect={handleDestinationClick} onSave={onToggleSave} isSaved={isDestinationSaved(trip.id)} />))}
            </div>
          </div>
        </>
      )}

      {/* Deals Tab */}
      {activeFilter === 'deals' && (
        <div style={{ padding: '0 24px', opacity: isLoaded ? 1 : 0, transform: isLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.15s' }}>
          <DebugLabel name="DEALS-TAB" />
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600' }}>All Deals</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.15)', padding: '4px 10px', borderRadius: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#ef4444' }}>LIVE</span>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>Exclusive offers curated for you</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {flashDeals.map(deal => (<ExploreDealCard key={deal.id} deal={deal} expanded />))}
          </div>
        </div>
      )}

      {/* Trending Tab */}
      {activeFilter === 'trending' && (
        <div style={{ padding: '0 24px', opacity: isLoaded ? 1 : 0, transform: isLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.15s' }}>
          <DebugLabel name="TRENDING-TAB" />
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>Trending Now</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>Most searched destinations this week</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {trendingDestinations.map(dest => (<ExploreTrendingCard key={dest.id} destination={dest} onSelect={handleDestinationClick} onSave={onToggleSave} isSaved={isDestinationSaved(dest.id)} />))}
          </div>
        </div>
      )}

      {/* Saved Tab */}
      {activeFilter === 'saved' && (
        <div style={{ padding: '0 24px', opacity: isLoaded ? 1 : 0, transform: isLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.15s' }}>
          <DebugLabel name="SAVED-TAB" />
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>Saved Destinations</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>Your travel wishlist</p>
          </div>
          {savedDestinations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No saved destinations yet</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', maxWidth: '240px', margin: '0 auto' }}>Tap the bookmark icon on any destination to save it here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {savedDestinations.map(dest => (<ExploreSavedCard key={dest.id} destination={dest} onSelect={handleDestinationClick} onRemove={() => onToggleSave(dest)} />))}
            </div>
          )}
        </div>
      )}

      <BottomNav activeTab="explore" onNavigate={onNavigate} />
    </div>
  );
};

// ==================== EXPLORE CARD COMPONENTS ====================
const ExploreHeroCard = ({ destination, onSelect, onSave, isSaved }) => (
  <div onClick={() => onSelect(destination)} style={{ borderRadius: '24px', overflow: 'hidden', position: 'relative', height: '340px', cursor: 'pointer', transition: 'transform 0.3s ease' }}>
    <DebugLabel name="HERO-CARD" />
    <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${destination.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.2) 100%)' }} />
    <div style={{ position: 'absolute', inset: 0, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)', color: '#0a0a0f', padding: '8px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{destination.season}</div>
        <button onClick={(e) => { e.stopPropagation(); onSave(destination); }} style={{ background: isSaved ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', border: isSaved ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? '#d4af37' : 'none'} stroke={isSaved ? '#d4af37' : '#fff'} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>
      <div>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{destination.tagline}</p>
        <h2 style={{ fontSize: '42px', fontWeight: '700', letterSpacing: '-1.5px', marginBottom: '8px', lineHeight: 1 }}>{destination.destination}</h2>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginBottom: '20px', lineHeight: 1.5, maxWidth: '280px' }}>{destination.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div><p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>FROM</p><p style={{ fontSize: '24px', fontWeight: '700', color: '#d4af37' }}>${destination.price}</p></div>
            <div style={{ height: '36px', width: '1px', background: 'rgba(255,255,255,0.2)' }} />
            <div><p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>DURATION</p><p style={{ fontSize: '16px', fontWeight: '600' }}>{destination.duration}</p></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#d4af37" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{destination.rating}</span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>({destination.reviews.toLocaleString()})</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ExploreDestinationCard = ({ destination, onSelect, onSave, isSaved, showMatch }) => (
  <div onClick={() => onSelect(destination)} style={{ width: '160px', flexShrink: 0, borderRadius: '16px', overflow: 'hidden', position: 'relative', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
    <DebugLabel name="DESTINATION-CARD" />
    <div style={{ height: '120px', backgroundImage: `url(${destination.image})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
      {showMatch && <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(34, 197, 94, 0.9)', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', color: '#fff' }}>{destination.match}% match</div>}
      <button onClick={(e) => { e.stopPropagation(); onSave(destination); }} style={{ position: 'absolute', top: '8px', right: '8px', background: isSaved ? 'rgba(212, 175, 55, 0.9)' : 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={isSaved ? '#fff' : 'none'} stroke="#fff" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      </button>
    </div>
    <div style={{ padding: '12px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '2px' }}>{destination.destination}</h3>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>{destination.country}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>from</span>
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#d4af37' }}>${destination.price}</span>
      </div>
    </div>
  </div>
);

const ExploreDealCard = ({ deal, expanded }) => {
  const [timeLeft, setTimeLeft] = useState(deal.endsIn);
  useEffect(() => { const timer = setInterval(() => { setTimeLeft(prev => prev > 0 ? prev - 1 : 0); }, 1000); return () => clearInterval(timer); }, []);
  const formatTime = (seconds) => { const hours = Math.floor(seconds / 3600); const mins = Math.floor((seconds % 3600) / 60); const secs = seconds % 60; return `${hours}h ${mins}m ${secs}s`; };
  const typeConfig = { flight: { icon: <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>, color: '#6366f1' }, hotel: { icon: <><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"/><path d="M3 21h18"/><path d="M9 7h1"/><path d="M14 7h1"/></>, color: '#22c55e' }, package: { icon: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></>, color: '#d4af37' } };
  const config = typeConfig[deal.type];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' }}>
      <DebugLabel name="DEAL-CARD" />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${config.color} 0%, transparent 100%)`, opacity: 0.6 }} />
      <div style={{ width: '64px', height: '64px', borderRadius: '12px', backgroundImage: `url(${deal.image})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0, position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '24px', height: '24px', borderRadius: '8px', background: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="1">{config.icon}</svg>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600' }}>{deal.type === 'flight' ? deal.route : deal.name}</h3>
          <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '11px', fontWeight: '700', padding: '3px 6px', borderRadius: '6px' }}>-{deal.discount}%</span>
        </div>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>{deal.type === 'flight' ? deal.airline : deal.type === 'hotel' ? deal.location : deal.includes}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>${deal.originalPrice}</span>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#d4af37' }}>${deal.dealPrice}</span>
          {deal.perNight && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>/night</span>}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', textTransform: 'uppercase' }}>Ends in</p>
        <p style={{ fontSize: '13px', fontWeight: '600', color: timeLeft < 3600 ? '#ef4444' : '#fff', fontFamily: 'monospace' }}>{formatTime(timeLeft)}</p>
      </div>
    </div>
  );
};

const ExploreCulturalCard = ({ spotlight }) => (
  <div style={{ width: '280px', flexShrink: 0, borderRadius: '20px', overflow: 'hidden', position: 'relative', height: '200px', cursor: 'pointer' }}>
    <DebugLabel name="CULTURAL-CARD" />
    <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${spotlight.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />
    <div style={{ position: 'absolute', inset: 0, padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '6px 10px', borderRadius: '8px', alignSelf: 'flex-start', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{spotlight.category}</div>
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{spotlight.title}</h3>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '10px' }}>{spotlight.subtitle}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{spotlight.readTime}</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>by {spotlight.author}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{spotlight.saves.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ExploreDreamCard = ({ trip, onSelect, onSave, isSaved }) => (
  <div onClick={() => onSelect(trip)} style={{ width: '200px', flexShrink: 0, borderRadius: '20px', overflow: 'hidden', position: 'relative', height: '260px', cursor: 'pointer' }}>
    <DebugLabel name="DREAM-CARD" />
    <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${trip.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
    <div style={{ position: 'absolute', inset: 0, padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ background: 'rgba(212, 175, 55, 0.9)', color: '#0a0a0f', padding: '5px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{trip.highlight}</div>
        <button onClick={(e) => { e.stopPropagation(); onSave(trip); }} style={{ background: isSaved ? 'rgba(212, 175, 55, 0.9)' : 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '10px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isSaved ? '#fff' : 'none'} stroke="#fff" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>
      <div>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '2px' }}>{trip.country}</p>
        <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px', letterSpacing: '-0.5px' }}>{trip.destination}</h3>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>{trip.tagline}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>from</span>
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#d4af37' }}>${trip.startingPrice}</span>
        </div>
      </div>
    </div>
  </div>
);

const ExploreTrendingCard = ({ destination, onSelect, onSave, isSaved }) => (
  <div onClick={() => onSelect(destination)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', cursor: 'pointer', position: 'relative' }}>
    <DebugLabel name="TRENDING-CARD" />
    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: destination.rank <= 3 ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: destination.rank <= 3 ? '#0a0a0f' : '#fff', flexShrink: 0 }}>{destination.rank}</div>
    <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundImage: `url(${destination.image})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '2px' }}>{destination.destination}</h3>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{destination.country}</p>
    </div>
    <div style={{ textAlign: 'right', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#22c55e' }}>{destination.change}%</span>
      </div>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{destination.searches} searches</p>
    </div>
    <button onClick={(e) => { e.stopPropagation(); onSave(destination); }} style={{ background: isSaved ? 'rgba(212, 175, 55, 0.2)' : 'transparent', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? '#d4af37' : 'none'} stroke={isSaved ? '#d4af37' : 'rgba(255,255,255,0.4)'} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
    </button>
  </div>
);

const ExploreSavedCard = ({ destination, onSelect, onRemove }) => (
  <div onClick={() => onSelect(destination)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', cursor: 'pointer', position: 'relative' }}>
    <DebugLabel name="SAVED-CARD" />
    <div style={{ width: '64px', height: '64px', borderRadius: '14px', backgroundImage: `url(${destination.image})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '2px' }}>{destination.destination}</h3>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>{destination.country || destination.tagline}</p>
      {(destination.price || destination.startingPrice) && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>from</span>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#d4af37' }}>${destination.price || destination.startingPrice}</span>
        </div>
      )}
    </div>
    <button onClick={(e) => { e.stopPropagation(); onRemove(); }} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
);

// ==================== DESTINATION DETAIL MODAL ====================
const DestinationDetailModal = ({ destination, onClose, onToggleSave, isSaved }) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => { setTimeout(() => setIsVisible(true), 50); }, []);
  const handleClose = () => { setIsVisible(false); setTimeout(onClose, 300); };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <DebugLabel name="DESTINATION-MODAL" />
      <div onClick={handleClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', opacity: isVisible ? 1 : 0, transition: 'opacity 0.3s ease' }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: '500px', maxHeight: '90vh', background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a0f 100%)', borderRadius: '24px 24px 0 0', overflow: 'hidden', transform: isVisible ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <div style={{ height: '240px', backgroundImage: `url(${destination.image})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,15,1) 0%, transparent 50%)' }} />
          <button onClick={handleClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <button onClick={() => onToggleSave(destination)} style={{ position: 'absolute', top: '16px', left: '16px', background: isSaved ? 'rgba(212, 175, 55, 0.9)' : 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#fff' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? '#fff' : 'none'} stroke="#fff" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
        <div style={{ padding: '24px', marginTop: '-40px', position: 'relative' }}>
          {destination.season && <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)', color: '#0a0a0f', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>{destination.season}</div>}
          <h2 style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-1px', marginBottom: '8px' }}>{destination.destination}</h2>
          {destination.tagline && <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>{destination.tagline}</p>}
          {destination.description && <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '24px' }}>{destination.description}</p>}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            {(destination.price || destination.startingPrice) && (
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>FROM</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#d4af37' }}>${destination.price || destination.startingPrice}</p>
              </div>
            )}
            {destination.duration && (
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>DURATION</p>
                <p style={{ fontSize: '20px', fontWeight: '600' }}>{destination.duration}</p>
              </div>
            )}
            {destination.rating && (
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>RATING</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#d4af37" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span style={{ fontSize: '20px', fontWeight: '600' }}>{destination.rating}</span>
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ flex: 1, padding: '16px', background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)', border: 'none', borderRadius: '14px', color: '#0a0a0f', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Plan This Trip
            </button>
            <button style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
