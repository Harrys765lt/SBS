import { Business, Service, Review } from '../types';

export const mockBusinesses: Business[] = [
  {
    id: '1',
    name: 'Lumière Salon',
    category: 'salon',
    description: 'Premium hair and beauty salon with expert stylists and luxurious treatments.',
    image: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    rating: 4.8,
    reviewCount: 156,
    priceRange: 3,
    location: 'KLCC',
    distance: 1.2,
    nextAvailable: 'Today 2:00 PM',
    badges: ['WhatsApp Auto', 'Instant Confirm'],
    whatsappEnabled: true,
    instantConfirm: true,
    phone: '+60123456789',
    address: 'Lot 2.45, Suria KLCC, Jalan Ampang, 50088 Kuala Lumpur',
    policies: {
      cancellation: 'Free cancellation up to 24 hours before appointment',
      deposit: 'RM50 deposit required for bookings over RM200',
      lateArrival: 'Please arrive 10 minutes early. Late arrivals may result in shortened service time',
    },
    gallery: [
      'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1719858511928-94db73c8de67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    hours: {
      'Mon-Fri': '10:00 AM - 9:00 PM',
      'Sat-Sun': '9:00 AM - 8:00 PM',
    },
  },
  {
    id: '2',
    name: 'Nasi Kandar Pelita',
    category: 'restaurant',
    description: 'Authentic Malaysian cuisine in a cozy setting. Family-friendly with traditional favorites.',
    image: 'https://images.unsplash.com/photo-1600470944938-b301e41001c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    rating: 4.6,
    reviewCount: 289,
    priceRange: 2,
    location: 'Bangsar',
    distance: 2.5,
    nextAvailable: 'Today 6:30 PM',
    badges: ['WhatsApp Auto', 'Free Cancellation'],
    whatsappEnabled: true,
    instantConfirm: true,
    phone: '+60123456790',
    address: '156 Jalan Telawi 3, Bangsar, 59100 Kuala Lumpur',
    policies: {
      cancellation: 'Free cancellation up to 2 hours before reservation',
      deposit: 'No deposit required for parties under 6',
      lateArrival: 'Tables held for 15 minutes. Please call if running late',
    },
    gallery: [
      'https://images.unsplash.com/photo-1600470944938-b301e41001c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1756397481872-ed981ef72a51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    hours: {
      'Mon-Sun': '11:00 AM - 11:00 PM',
    },
  },
  {
    id: '3',
    name: 'Elite Sports Arena',
    category: 'sports',
    description: 'Premier indoor sports facility with badminton, tennis, and squash courts.',
    image: 'https://images.unsplash.com/photo-1624024834874-2a1611305604?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    rating: 4.9,
    reviewCount: 342,
    priceRange: 3,
    location: 'Bukit Jalil',
    distance: 3.8,
    nextAvailable: 'Tomorrow 8:00 AM',
    badges: ['WhatsApp Auto', 'Instant Confirm', 'Free Cancellation'],
    whatsappEnabled: true,
    instantConfirm: true,
    phone: '+60123456791',
    address: 'Axiata Arena, Bukit Jalil National Stadium, 57000 Kuala Lumpur',
    policies: {
      cancellation: 'Free cancellation up to 6 hours before booking',
      deposit: 'Full payment required at booking',
      lateArrival: 'Court time starts at booked time. No extensions for late arrivals',
    },
    gallery: [
      'https://images.unsplash.com/photo-1624024834874-2a1611305604?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1703565391056-3e8b33cfe2c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    hours: {
      'Mon-Sun': '6:00 AM - 11:00 PM',
    },
  },
  {
    id: '4',
    name: 'Pavilion Sky Dining',
    category: 'restaurant',
    description: 'Fine dining with contemporary Asian fusion cuisine and elegant ambiance.',
    image: 'https://images.unsplash.com/photo-1756397481872-ed981ef72a51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    rating: 4.7,
    reviewCount: 198,
    priceRange: 4,
    location: 'Bukit Bintang',
    distance: 4.2,
    nextAvailable: 'Today 7:00 PM',
    badges: ['WhatsApp Auto'],
    whatsappEnabled: true,
    instantConfirm: false,
    phone: '+60123456792',
    address: 'Level 7, Pavilion KL, 168 Jalan Bukit Bintang, 55100 Kuala Lumpur',
    policies: {
      cancellation: 'Free cancellation up to 24 hours before reservation',
      deposit: 'RM100 per person deposit required',
      lateArrival: 'Please arrive on time. Reservations held for 15 minutes',
    },
    gallery: [
      'https://images.unsplash.com/photo-1756397481872-ed981ef72a51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    hours: {
      'Mon-Sun': '12:00 PM - 3:00 PM, 6:00 PM - 11:00 PM',
    },
  },
  {
    id: '5',
    name: 'Serenity Spa & Wellness',
    category: 'salon',
    description: 'Tranquil spa offering massage, facials, and holistic wellness treatments.',
    image: 'https://images.unsplash.com/photo-1719858511928-94db73c8de67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    rating: 4.9,
    reviewCount: 412,
    priceRange: 4,
    location: 'Mont Kiara',
    distance: 6.5,
    nextAvailable: 'Tomorrow 10:00 AM',
    badges: ['WhatsApp Auto', 'Instant Confirm', 'Free Cancellation'],
    whatsappEnabled: true,
    instantConfirm: true,
    phone: '+60123456793',
    address: '163 Retail Park, 2 Jalan Kiara, Mont Kiara, 50480 Kuala Lumpur',
    policies: {
      cancellation: 'Free cancellation up to 48 hours before appointment',
      deposit: 'RM100 deposit required, deducted from final bill',
      lateArrival: 'Arrive 15 minutes early for consultation. Late arrivals may result in shortened treatment',
    },
    gallery: [
      'https://images.unsplash.com/photo-1719858511928-94db73c8de67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    hours: {
      'Mon-Sun': '9:00 AM - 10:00 PM',
    },
  },
  {
    id: '6',
    name: 'Victory Sports Complex',
    category: 'sports',
    description: 'Multi-sport facility with basketball, futsal, and volleyball courts.',
    image: 'https://images.unsplash.com/photo-1703565391056-3e8b33cfe2c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    rating: 4.5,
    reviewCount: 267,
    priceRange: 2,
    location: 'Cheras',
    distance: 8.3,
    nextAvailable: 'Today 5:00 PM',
    badges: ['WhatsApp Auto', 'Free Cancellation'],
    whatsappEnabled: true,
    instantConfirm: true,
    phone: '+60123456794',
    address: 'Jalan Yaacob Latif, Bandar Tun Razak, 56000 Kuala Lumpur',
    policies: {
      cancellation: 'Free cancellation up to 4 hours before booking',
      deposit: 'No deposit required',
      lateArrival: 'Grace period of 10 minutes. After that, booking may be forfeited',
    },
    gallery: [
      'https://images.unsplash.com/photo-1703565391056-3e8b33cfe2c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    hours: {
      'Mon-Sun': '7:00 AM - 11:00 PM',
    },
  },
];

export const mockServices: { [businessId: string]: Service[] } = {
  '1': [
    {
      id: 's1',
      name: 'Haircut & Styling',
      description: 'Professional haircut with wash and blow dry',
      duration: 60,
      price: 180,
      staff: ['Aisha Karim', 'Siti Nurhaliza'],
    },
    {
      id: 's2',
      name: 'Hair Coloring',
      description: 'Full color treatment with toner',
      duration: 120,
      price: 450,
      staff: ['Aisha Karim'],
    },
    {
      id: 's3',
      name: 'Manicure & Pedicure',
      description: 'Complete nail care with gel polish',
      duration: 90,
      price: 200,
      staff: ['Mei Lin'],
    },
  ],
  '3': [
    {
      id: 's4',
      name: 'Badminton Court',
      description: 'Premium indoor badminton court',
      duration: 60,
      price: 70,
    },
    {
      id: 's5',
      name: 'Tennis Court',
      description: 'Professional tennis court with lighting',
      duration: 60,
      price: 90,
    },
  ],
  '5': [
    {
      id: 's6',
      name: 'Swedish Massage',
      description: 'Relaxing full-body massage',
      duration: 90,
      price: 320,
      staff: ['Therapist Nurul', 'Therapist Jasmine'],
    },
    {
      id: 's7',
      name: 'Signature Facial',
      description: 'Deep cleansing and hydrating facial',
      duration: 75,
      price: 380,
      staff: ['Therapist Nurul'],
    },
  ],
};

export const mockReviews: { [businessId: string]: Review[] } = {
  '1': [
    {
      id: 'r1',
      customerName: 'Natasha A.',
      rating: 5,
      comment: 'Aisha did an amazing job with my hair! The WhatsApp booking was super convenient.',
      date: new Date('2025-10-15'),
      verified: true,
    },
    {
      id: 'r2',
      customerName: 'Ahmad R.',
      rating: 5,
      comment: 'Great service and atmosphere. Very professional staff.',
      date: new Date('2025-10-10'),
      verified: true,
    },
    {
      id: 'r3',
      customerName: 'Priya K.',
      rating: 4,
      comment: 'Love my new haircut! Booking through WhatsApp made it so easy.',
      date: new Date('2025-10-05'),
      verified: true,
    },
  ],
  '2': [
    {
      id: 'r4',
      customerName: 'Hakim S.',
      rating: 5,
      comment: 'Authentic Malaysian flavors! The nasi kandar is incredible. Easy to book via WhatsApp.',
      date: new Date('2025-10-16'),
      verified: true,
    },
    {
      id: 'r5',
      customerName: 'Wei Ling T.',
      rating: 4,
      comment: 'Good food and friendly service. Great for families.',
      date: new Date('2025-10-12'),
      verified: true,
    },
  ],
  '3': [
    {
      id: 'r6',
      customerName: 'Imran L.',
      rating: 5,
      comment: 'Best courts in KL! Clean facilities and easy WhatsApp booking.',
      date: new Date('2025-10-17'),
      verified: true,
    },
    {
      id: 'r7',
      customerName: 'Siti M.',
      rating: 5,
      comment: 'Love playing here. The automated booking system is fantastic!',
      date: new Date('2025-10-14'),
      verified: true,
    },
  ],
};

export const generateTimeSlots = (date: Date) => {
  const slots = [];
  for (let hour = 9; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const random = Math.random();
      let status: 'available' | 'booked' | 'disabled' = 'available';
      
      if (random > 0.7) {
        status = 'booked';
      } else if (random > 0.9) {
        status = 'disabled';
      }
      
      slots.push({ time: timeString, status });
    }
  }
  return slots;
};
