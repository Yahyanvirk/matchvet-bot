import React, { useState } from 'react';
import { MessageCircle, MapPin, Calendar, Phone, Mail, Check, Sparkles } from 'lucide-react';

const MatchVetBot = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    service: '',
    appointmentType: '',
    location: '',
    dateTime: '',
    phone: '',
    email: '',
    customOffer: ''
  });
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hi! 👋 I'm MatchVetBot. I'll help you book a vet appointment in less than 2 minutes. What service do you need for your pet?"
    }
  ]);

  const vetServices = [
    {
      service: "Cat Vaccination",
      inClinic: 4500,
      inHome: 6000,
      inClinicDiscounted: 4050,
      inHomeDiscounted: 5400
    },
    {
      service: "Dog Vaccination",
      inClinic: 4200,
      inHome: 5700,
      inClinicDiscounted: 3780,
      inHomeDiscounted: 5130
    },
    {
      service: "General Check-up",
      inClinic: 1200,
      inHome: 2700,
      inClinicDiscounted: 1080,
      inHomeDiscounted: 2430
    },
    {
      service: "Grooming & Bath",
      inClinic: 3850,
      inHome: 5350,
      inClinicDiscounted: 3465,
      inHomeDiscounted: 4815
    },
    {
      service: "Hair Trimming",
      inClinic: 2000,
      inHome: 3500,
      inClinicDiscounted: 1800,
      inHomeDiscounted: 3150
    },
    {
      service: "Dental Cleaning & Check-up",
      inClinic: 1200,
      inHome: 2700,
      inClinicDiscounted: 1080,
      inHomeDiscounted: 2430
    },
    {
      service: "Dental Scaling",
      inClinic: 2000,
      inHome: 3500,
      inClinicDiscounted: 1800,
      inHomeDiscounted: 3150
    },
    {
      service: "Neutering (Cat)",
      inClinic: 9500,
      inHome: 11000,
      inClinicDiscounted: 8550,
      inHomeDiscounted: 9900
    },
    {
      service: "Spaying (Cat)",
      inClinic: 15000,
      inHome: 16500,
      inClinicDiscounted: 13500,
      inHomeDiscounted: 14850
    },
    {
      service: "Neutering (Dog)",
      inClinic: 13000,
      inHome: 14500,
      inClinicDiscounted: 11700,
      inHomeDiscounted: 13050
    },
    {
      service: "Spaying (Dog)",
      inClinic: 18500,
      inHome: 20000,
      inClinicDiscounted: 16650,
      inHomeDiscounted: 18000
    },
    {
      service: "Boarding (per day)",
      inClinic: 1000,
      inHome: 2500,
      inClinicDiscounted: 900,
      inHomeDiscounted: 2250
    },
    {
      service: "Cat or Puppy Deworming",
      inClinic: 700,
      inHome: 2200,
      inClinicDiscounted: 630,
      inHomeDiscounted: 1980
    }
  ];

  const getDiscountRate = (serviceName) => {
    if (serviceName.includes('Vaccination') || serviceName.includes('Check-up')) {
      return 0.95; // 5% discount
    } else if (serviceName.includes('Spaying')) {
      return 0.85; // 15% discount
    } else {
      return 0.90; // 10% discount
    }
  };

  const getDiscountText = (serviceName) => {
    if (serviceName.includes('Vaccination') || serviceName.includes('Check-up')) {
      return '5% Special Discount!';
    } else if (serviceName.includes('Spaying')) {
      return '15% Special Discount!';
    } else {
      return '10% Special Discount!';
    }
  };

  const addMessage = (type, content) => {
    setMessages(prev => [...prev, { type, content }]);
  };

  const generateWhatsAppMessage = () => {
    const selectedService = vetServices.find(s => s.service === bookingData.service);
    const price = bookingData.appointmentType === 'clinic' ? selectedService?.inClinicDiscounted : selectedService?.inHomeDiscounted;
    const discountRate = getDiscountRate(bookingData.service);
    const finalPrice = price ? Math.round(price * discountRate) : 'Pending';
    const discountText = getDiscountText(bookingData.service);
    
    const summary = `Hi MatchVet Team! 👋

I would like to confirm my appointment booking:

📋 Booking Details:
• Service: ${bookingData.service}
• Type: ${bookingData.appointmentType === 'clinic' ? 'At Clinic' : 'At Home'}
• Price: Rs ${finalPrice} (${discountText})
• Location: ${bookingData.location}
• Date & Time: ${bookingData.dateTime}

📞 Contact Information:
• Phone: ${bookingData.phone}
• Email: ${bookingData.email}

Please confirm this appointment. Thank you!`;
    
    return encodeURIComponent(summary);
  };

  const handleServiceSelect = (service) => {
    setBookingData(prev => ({ ...prev, service }));
    addMessage('user', service);
    
    setTimeout(() => {
      addMessage('bot', `Perfect! You've selected **${service}**.\n\nWould you prefer an appointment at a clinic or at home?`);
      setCurrentStep(1);
    }, 500);
  };

  const handleAppointmentType = (type) => {
    setBookingData(prev => ({ ...prev, appointmentType: type }));
    addMessage('user', type === 'clinic' ? 'At Clinic' : 'At Home');
    
    const selectedService = vetServices.find(s => s.service === bookingData.service);
    let priceMessage = '';
    
    if (selectedService) {
      const originalPrice = type === 'clinic' ? selectedService.inClinic : selectedService.inHome;
      const discountedPrice = type === 'clinic' ? selectedService.inClinicDiscounted : selectedService.inHomeDiscounted;
      const discountRate = getDiscountRate(bookingData.service);
      const finalPrice = Math.round(discountedPrice * discountRate);
      const discountText = getDiscountText(bookingData.service);
      
      priceMessage = `🎉 **${discountText}**\n\n**${bookingData.service} ${type === 'clinic' ? 'at clinic' : 'at home'}:**\n• Original Price: ~~Rs ${originalPrice}~~\n• **Our Price: Rs ${discountedPrice}**\n• **With Special Discount: Rs ${finalPrice}**\n\nYou can offer your own price, but the minimum allowed is Rs ${finalPrice}.`;
    }
    
    setTimeout(() => {
      addMessage('bot', priceMessage + '\n\nWhat is your full address or area for the appointment?');
      setCurrentStep(2);
    }, 500);
  };

  const handleLocationSubmit = () => {
    if (!bookingData.location.trim()) return;
    
    addMessage('user', bookingData.location);
    setTimeout(() => {
      addMessage('bot', 'When would you like to schedule the appointment? Please provide a date and time.');
      setCurrentStep(3);
    }, 500);
  };

  const handleDateTimeSubmit = () => {
    if (!bookingData.dateTime.trim()) return;
    
    addMessage('user', bookingData.dateTime);
    
    const selectedService = vetServices.find(s => s.service === bookingData.service);
    const price = bookingData.appointmentType === 'clinic' ? selectedService?.inClinicDiscounted : selectedService?.inHomeDiscounted;
    const discountRate = getDiscountRate(bookingData.service);
    const finalPrice = price ? Math.round(price * discountRate) : 'Pending';
    const discountText = getDiscountText(bookingData.service);
    
    const summary = `📋 **Booking Summary:**\n• **Service:** ${bookingData.service}\n• **Type:** ${bookingData.appointmentType === 'clinic' ? 'At Clinic' : 'At Home'}\n• **Price:** Rs ${finalPrice} (${discountText})\n• **Location:** ${bookingData.location}\n• **Date & Time:** ${bookingData.dateTime}\n\nPlease provide your phone number and email address for confirmation.`;
    
    setTimeout(() => {
      addMessage('bot', summary);
      setCurrentStep(4);
    }, 500);
  };

  const handleContactSubmit = () => {
    if (!bookingData.phone.trim() || !bookingData.email.trim()) return;
    
    addMessage('user', `${bookingData.phone} | ${bookingData.email}`);
    
    setTimeout(() => {
      addMessage('bot', '✅ **Your request has been submitted!** We\'ll reach out shortly to confirm your booking.\n\n📲 **To confirm this appointment, please send the summary to our team by clicking the button below.**');
      setCurrentStep(5);
    }, 500);
  };

  const resetChat = () => {
    setCurrentStep(0);
    setBookingData({
      service: '',
      appointmentType: '',
      location: '',
      dateTime: '',
      phone: '',
      email: '',
      customOffer: ''
    });
    setMessages([
      {
        type: 'bot',
        content: "Hi! 👋 I'm MatchVetBot. I'll help you book a vet appointment in less than 2 minutes. What service do you need for your pet?"
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2d3c3f] to-[#1a2426] text-white p-6 shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="bg-green-400/20 p-3 rounded-full">
            <Sparkles className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-green-400">
              MatchVet AI Agent
            </h1>
            <p className="text-black text-lg">Pakistan's Premier Veterinary Care Marketplace</p>
          </div>
        </div>
        <div className="mt-4 bg-gradient-to-r from-lime-400/20 to-green-400/20 rounded-xl p-4 backdrop-blur">
          <p className="text-sm font-semibold text-black">
            🎉 Special Discounts: 5% on Vaccinations & Checkups, 15% on Spaying, 10% on Others!
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="p-6">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-green-100">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-green-50/30">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-lime-400 to-green-500 text-white font-medium shadow-lg border-2 border-green-300' 
                    : 'bg-white text-gray-800 shadow-md border border-green-100'
                }`}>
                  <div className="whitespace-pre-line text-sm">{message.content}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t">
            {currentStep === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">Select a service:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {vetServices.map((service, index) => (
                    <button
                      key={index}
                      onClick={() => handleServiceSelect(service.service)}
                      className="p-3 text-left border-2 border-green-200 rounded-xl hover:border-lime-400 hover:bg-gradient-to-r hover:from-lime-50 hover:to-green-50 transition-all duration-300 transform hover:scale-[1.02] shadow-sm hover:shadow-md"
                    >
                      <div className="font-medium text-gray-800">{service.service}</div>
                      <div className="text-sm text-green-600 font-medium">From Rs {Math.round(service.inClinicDiscounted * getDiscountRate(service.service))}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">Choose appointment type:</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAppointmentType('clinic')}
                    className="p-4 border-2 border-green-200 rounded-xl hover:border-lime-400 hover:bg-gradient-to-br hover:from-lime-50 hover:to-green-50 transition-all duration-300 text-center transform hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    <MapPin className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <div className="font-medium">At Clinic</div>
                  </button>
                  <button
                    onClick={() => handleAppointmentType('home')}
                    className="p-4 border-2 border-green-200 rounded-xl hover:border-lime-400 hover:bg-gradient-to-br hover:from-lime-50 hover:to-green-50 transition-all duration-300 text-center transform hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    <MessageCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <div className="font-medium">At Home</div>
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4 inline mr-2 text-green-600" />
                  Full Address or Area
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={bookingData.location}
                    onChange={(e) => setBookingData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter your address..."
                    className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all duration-200"
                  />
                  <button
                    onClick={handleLocationSubmit}
                    className="bg-gradient-to-r from-lime-400 to-green-500 text-white px-6 py-3 rounded-xl hover:from-lime-500 hover:to-green-600 transition-all duration-200 font-bold shadow-lg transform hover:scale-105"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 inline mr-2 text-green-600" />
                  Preferred Date & Time
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={bookingData.dateTime}
                    onChange={(e) => setBookingData(prev => ({ ...prev, dateTime: e.target.value }))}
                    placeholder="e.g., Today 9:00 PM"
                    className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all duration-200"
                  />
                  <button
                    onClick={handleDateTimeSubmit}
                    className="bg-gradient-to-r from-lime-400 to-green-500 text-white px-6 py-3 rounded-xl hover:from-lime-500 hover:to-green-600 transition-all duration-200 font-bold shadow-lg transform hover:scale-105"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2 text-green-600" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="03XX-XXXXXXX"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2 text-green-600" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={bookingData.email}
                      onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your.email@example.com"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all duration-200"
                    />
                  </div>
                </div>
                <button
                  onClick={handleContactSubmit}
                  className="w-full bg-gradient-to-r from-lime-400 to-green-500 text-white p-3 rounded-xl hover:from-lime-500 hover:to-green-600 transition-all duration-200 font-bold shadow-lg transform hover:scale-[1.02]"
                >
                  <Check className="w-5 h-5 inline mr-2" />
                  Submit Booking Request
                </button>
              </div>
            )}

            {currentStep === 5 && (
              <div className="text-center space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-lime-50 border-2 border-green-200 rounded-xl p-6 shadow-lg">
                  <Check className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-bold text-green-800 text-lg">Booking Submitted Successfully!</h3>
                  <p className="text-green-700 text-sm">We'll contact you shortly to confirm your appointment.</p>
                </div>
                
                <div className="space-y-3">
                  <a
                    href={`https://wa.me/923121488954?text=${generateWhatsAppMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-lime-400 to-green-500 text-white p-4 rounded-xl hover:from-lime-500 hover:to-green-600 transition-all duration-200 font-bold shadow-lg transform hover:scale-[1.02]"
                  >
                    📲 Confirm Your Appointment Now
                  </a>
                  
                  <button
                    onClick={resetChat}
                    className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 p-3 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium border border-gray-300"
                  >
                    Book Another Appointment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center p-6 text-gray-600">
        <p className="text-sm">MatchVet - Pakistan's Premier Veterinary Care Marketplace</p>
        <p className="text-xs mt-2">Currently serving Lahore • More cities coming soon</p>
      </div>
    </div>
  );
};

export default MatchVetBot;
