const whatsappData = [
  {
    messageId: 'msg001',
    customerName: 'John Doe',
    customerPhone: '+60198287777',
    serviceRequested: 'Haircut',
    bookingDate: '2025-11-15',
    bookingTime: '3:00 PM',
    staffAssigned: 'Sarah',
    status: 'confirmed',
    timestamp: '2025-11-13T12:30:00',
  },
  {
    messageId: 'msg002',
    customerName: 'Jane Smith',
    customerPhone: '+60108826567',
    serviceRequested: 'Hair Color',
    bookingDate: '2025-11-16',
    bookingTime: '10:00 AM',
    staffAssigned: 'Mike',
    status: 'pending',
    timestamp: '2025-11-13T13:00:00',
  },
];

// Function to simulate processing a booking request
function simulateBooking(message) {
  console.log(`Processing booking for ${message.customerName}...`);
  // Simulate availability check, booking confirmation, etc.
  return {
    ...message,
    status: 'confirmed', // Simulate a confirmed booking
  };
}

// Example: Process first message
const processedBooking = simulateBooking(whatsappData[0]);
console.log('Booking confirmed:', processedBooking);
