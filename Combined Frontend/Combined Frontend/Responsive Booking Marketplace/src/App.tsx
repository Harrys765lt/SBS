import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { ScrollToTop } from './components/shared/ScrollToTop';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Hero } from './components/home/Hero';
import { SearchResults } from './components/pages/SearchResults';
import { BusinessProfile } from './components/pages/BusinessProfile';
import { BookingFlow } from './components/booking/BookingFlow';
import { ConfirmationPage } from './components/booking/ConfirmationPage';

// Helper: Fix image URLs from backend to include localhost:5000
const getImageUrl = (path: string) => {
  if (!path) return 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800'; 
  if (path.startsWith('http')) return path;
  return `http://localhost:5000/${path.replace(/\\/g, '/')}`;
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  
  // Real Data State
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [bookingData, setBookingData] = useState<any>(null);

  // 1. Fetch Merchant List from Backend
  useEffect(() => {
    fetch('http://localhost:5000/api/merchants')
      .then(res => res.json())
      .then(data => {
        // Transform DB data to Frontend Format
        const mappedData = data.map((b: any) => ({
          id: b.id.toString(),
          slug: b.slug, // Important for fetching details
          name: b.name,
          category: b.industry || 'salon',
          description: b.about || 'No description available',
          image: getImageUrl(b.cover_photo_path),
          location: b.address,
          rating: 5.0, 
          reviewCount: 0,
          priceRange: 2,
          whatsappEnabled: true,
          instantConfirm: true,
          phone: '+1234567890',
          address: b.address,
          gallery: [getImageUrl(b.cover_photo_path)], // Use cover as first gallery image
          hours: {},
          badges: ['New']
        }));
        setBusinesses(mappedData);
      })
      .catch(err => console.error("Failed to fetch merchants:", err));
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. Fetch Single Merchant Details (Services, Hours, etc.)
  const handleBusinessClick = async (id: string) => {
    const business = businesses.find(b => b.id === id);
    if (!business) return;

    try {
      // Use the slug to get full details
      const res = await fetch(`http://localhost:5000/api/merchants/${business.slug}`);
      const fullData = await res.json();
      
      // Format Hours from DB (Array) to Object
      const formattedHours: any = {};
      if (fullData.hours) {
        fullData.hours.forEach((h: any) => {
           if(h.is_open) {
             formattedHours[h.day_of_week] = `${h.open_time} - ${h.close_time}`;
           } else {
             formattedHours[h.day_of_week] = 'Closed';
           }
        });
      }

      setSelectedBusiness({
        ...business,
        description: fullData.about || business.description,
        hours: formattedHours,
        policies: {
          cancellation: fullData.cancellation_policy || "Standard 24h cancellation",
          deposit: fullData.deposit_required ? "Deposit Required" : "No deposit required",
          lateArrival: "15 min grace period"
        },
        // Add logo to gallery if it exists
        gallery: [
            getImageUrl(fullData.cover_photo_path), 
            getImageUrl(fullData.logo_path)
        ].filter(Boolean)
      });
      
      setSelectedServices(fullData.services || []);
      
      setCurrentPage('business-profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error("Could not load business details");
      console.error(err);
    }
  };

  const handleStartBooking = (data: any) => {
    setBookingData(data);
    setCurrentPage('booking-flow');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} onAuthClick={() => {}} />

      {currentPage === 'home' && (
        <>
          <Hero onSearch={() => handleNavigate('browse')} />
          <div className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold mb-8">Recently Added</h2>
              {/* Display Real Data */}
              <SearchResults 
                businesses={businesses} 
                onBusinessClick={(id) => handleBusinessClick(id)} 
              />
            </div>
          </div>
          <Footer />
        </>
      )}

      {currentPage === 'browse' && (
        <>
          <SearchResults
            businesses={businesses}
            onBusinessClick={(id) => handleBusinessClick(id)}
          />
          <Footer />
        </>
      )}

      {currentPage === 'business-profile' && selectedBusiness && (
        <>
          <BusinessProfile
            business={selectedBusiness}
            services={selectedServices}
            reviews={[]} 
            onStartBooking={handleStartBooking}
            onWhatsAppClick={() => {}}
          />
          <Footer />
        </>
      )}

      {currentPage === 'booking-flow' && selectedBusiness && (
        <BookingFlow
          business={selectedBusiness}
          initialData={bookingData}
          onComplete={() => {
             toast.success("Booking Sent!");
             handleNavigate('home');
          }}
          onBack={() => handleNavigate('business-profile')}
        />
      )}
      
      {currentPage === 'confirmation' && (
         <ConfirmationPage 
            booking={bookingData} 
            onHome={() => handleNavigate('home')}
            onReschedule={() => {}}
            onViewBookings={() => {}}
            onWhatsAppClick={() => {}}
         />
      )}

      <Toaster />
      <ScrollToTop />
    </div>
  );
}