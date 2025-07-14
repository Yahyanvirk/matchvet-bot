import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Calendar, Phone, Mail, Check, Download, Home, Hospital, User } from 'lucide-react';

const MatchVetBot = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionId] = useState(() => 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11));
  const [bookingData, setBookingData] = useState({
    ownerName: '',
    service: '',
    appointmentType: '',
    clinic: '',
    location: '',
    dateTime: '',
    phone: '',
    email: ''
  });
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hi! 👋 I'm MatchVetBot. I'll help you book a vet appointment in less than 2 minutes. First, what's your name?"
    }
  ]);

  const messagesEndRef = useRef(null);
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzqCfrpmqxQKfFjiPFrjhtwuEKkcu4Enz-i7kRHfVQNACL4pz1P9hJvubQxnGD4bftsgw/exec';

  const vetServices = [
    { service: "Cat Vaccination", inClinic: 4500, inHome: 6000, inClinicDiscounted: 4050, inHomeDiscounted: 5400 },
    { service: "Dog Vaccination", inClinic: 4200, inHome: 5700, inClinicDiscounted: 3780, inHomeDiscounted: 5130 },
    { service: "General Check-up", inClinic: 1200, inHome: 2700, inClinicDiscounted: 1080, inHomeDiscounted: 2430 },
    { service: "Grooming & Bath", inClinic: 3850, inHome: 5350, inClinicDiscounted: 3465, inHomeDiscounted: 4815 },
    { service: "Hair Trimming", inClinic: 2000, inHome: 3500, inClinicDiscounted: 1800, inHomeDiscounted: 3150 },
    { service: "Dental Cleaning & Check-up", inClinic: 1200, inHome: 2700, inClinicDiscounted: 1080, inHomeDiscounted: 2430 },
    { service: "Dental Scaling", inClinic: 2000, inHome: 3500, inClinicDiscounted: 1800, inHomeDiscounted: 3150 },
    { service: "Neutering (Cat)", inClinic: 9500, inHome: 11000, inClinicDiscounted: 8550, inHomeDiscounted: 9900 },
    { service: "Spaying (Cat)", inClinic: 15000, inHome: 16500, inClinicDiscounted: 13500, inHomeDiscounted: 14850 },
    { service: "Neutering (Dog)", inClinic: 13000, inHome: 14500, inClinicDiscounted: 11700, inHomeDiscounted: 13050 },
    { service: "Spaying (Dog)", inClinic: 18500, inHome: 20000, inClinicDiscounted: 16650, inHomeDiscounted: 18000 },
    { service: "Boarding (per day)", inClinic: 1000, inHome: 2500, inClinicDiscounted: 900, inHomeDiscounted: 2250 },
    { service: "Cat or Puppy Deworming", inClinic: 700, inHome: 2200, inClinicDiscounted: 630, inHomeDiscounted: 1980 }
  ];

  const vetClinics = [
    { id: 'clinic_1', name: 'Gillani Pets Care', address: 'Johar Town, Lahore' },
    { id: 'clinic_2', name: 'Riverbrook Animal Hospital', address: 'Lahore College Road, Lahore' },
    { id: 'clinic_3', name: 'Abid Pets Clinic', address: 'Gulberg, Lahore' },
    { id: 'clinic_4', name: 'Ahmad Pet Clinic', address: 'Johar Town, Lahore' },
    { id: 'clinic_5', name: 'Cuddles Pet Clinic', address: 'Johar Town, Lahore' },
    { id: 'clinic_6', name: 'Township Pet Clinic', address: 'Township, Lahore' },
    { id: 'clinic_7', name: 'Pet Station Veterinary Hospital & Pet Mart', address: 'DHA Phase 1, Lahore' },
    { id: 'clinic_8', name: 'Tiger Pets Clinic', address: 'DHA Phase 1, Lahore' },
    { id: 'clinic_9', name: 'The Vets Animal Hospital', address: 'Gulberg, Lahore' },
    { id: 'clinic_10', name: 'Faith Pets Clinic', address: 'Ghazi Road DHA, Lahore' },
    { id: 'clinic_11', name: 'Salman Pets Clinic & Mart', address: 'Jubilee Town, Lahore' },
    { id: 'clinic_12', name: 'Aamir Veterinary Hospital', address: 'Nasheman-e-Iqbal, Lahore' },
    { id: 'clinic_13', name: 'Salik Pets Clinic', address: 'WAPDA Town, Lahore' },
    { id: 'clinic_14', name: 'My Healthy Pet Clinic', address: 'DHA Phase 3, Lahore' },
    { id: 'clinic_15', name: 'Vision Pet Clinic', address: 'Johar Town, Lahore' },
    { id: 'clinic_16', name: 'Manj Pets and Veterinary Clinic', address: 'Allama Iqbal Town, Lahore' },
    { id: 'clinic_17', name: 'Fahad Pets Clinic', address: 'DHA Phase 6, Lahore' },
    { id: 'clinic_18', name: 'K-9 Pets Clinic', address: 'DHA Phase 1, Lahore' },
    { id: 'clinic_19', name: 'Royal Care Pets Clinic', address: 'Valencia Town, Lahore' }
  ];

  // New: Function to send Google Analytics 4 events
  const sendGAEvent = useCallback((eventName, eventParams = {}) => {
    if (window.gtag) {
      window.gtag('event', eventName, {
        session_id: sessionId,
        ...bookingData, // Include current bookingData for context
        ...eventParams
      });
      console.log(`GA4 Event Sent: ${eventName}`, { session_id: sessionId, ...bookingData, ...eventParams });
    } else {
      console.warn('Google Analytics (gtag) not loaded. Event not sent:', eventName, eventParams);
    }
  }, [sessionId, bookingData]); // Depend on sessionId and bookingData to include updated info


  // Combined tracking function (for Sheets and GA4)
  const trackEvent = useCallback(async (eventType, eventData = {}) => {
    // JSONP function to bypass CORS - MOVED INSIDE trackEvent
    const sendToGoogleSheets = (data) => {
      return new Promise((resolve) => {
        const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
        
        const script = document.createElement('script');
        const params = new URLSearchParams({
          ...data,
          callback: callbackName
        });
        
        script.src = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;
        
        window[callbackName] = function(response) {
          document.body.removeChild(script);
          delete window[callbackName];
          resolve(response);
        };
        
        script.onerror = function() {
          document.body.removeChild(script);
          delete window[callbackName];
          resolve({ status: 'error', message: 'Network error' });
        };
        
        document.body.appendChild(script);
      });
    };

    const timestamp = new Date().toISOString();
    const event = {
      sessionId,
      timestamp,
      eventType,
      userAgent: navigator.userAgent,
      ...bookingData,
      ...eventData
    };

    console.log('📊 Analytics Event (Sheets/Local):', event);

    // Save to localStorage for backup
    try {
      const existingData = JSON.parse(localStorage.getItem('matchvet_analytics_backup') || '[]');
      existingData.push(event);
      localStorage.setItem('matchvet_analytics_backup', JSON.stringify(existingData));
    } catch (storageError) {
      console.warn('localStorage save failed:', storageError);
    }

    // Send to Google Sheets (if you still need this)
    try {
      const result = await sendToGoogleSheets(event); // sendToGoogleSheets is now defined within this scope
      if (result.status === 'success') {
        console.log('✅ Event sent to Google Sheets successfully');
      }
    } catch (error) {
      console.warn('❌ Google Sheets error (data saved locally):', error);
    }
  }, [sessionId, bookingData]); // GOOGLE_SCRIPT_URL is a constant, so it's fine.

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Track only session start - once per user
  useEffect(() => {
    trackEvent('session_start', {
      language: navigator.language,
      viewport: { width: window.innerWidth, height: window.innerHeight }
    });
    // GA4: Also send a custom event for session_start
    sendGAEvent('chatbot_session_start', {
      language: navigator.language,
      viewport_width: window.innerWidth, // Use snake_case for GA4 parameters
      viewport_height: window.innerHeight
    });
  }, [trackEvent, sendGAEvent]); // Include sendGAEvent in dependencies

  const getDiscountRate = (serviceName) => {
    if (serviceName.includes('Vaccination') || serviceName.includes('Check-up')) {
      return 0.95;
    } else if (serviceName.includes('Spaying')) {
      return 0.85;
    } else {
      return 0.90;
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
    const discountedPrice = bookingData.appointmentType === 'clinic' ? selectedService?.inClinicDiscounted : selectedService?.inHomeDiscounted;
    const discountRate = getDiscountRate(bookingData.service);
    const finalPrice = discountedPrice ? Math.round(discountedPrice * discountRate) : 'Pending';
    const discountText = getDiscountText(bookingData.service);

    const locationDetails = bookingData.appointmentType === 'clinic' && bookingData.clinic
      ? `Clinic: ${vetClinics.find(c => c.id === bookingData.clinic)?.name || 'N/A'} (${vetClinics.find(c => c.id === bookingData.clinic)?.address || 'N/A'})`
      : `Location: ${bookingData.location}`;

    const summary = `Hi MatchVet Team! 👋

I would like to confirm my appointment booking:

👤 Pet Owner: ${bookingData.ownerName}

📋 Booking Details:
• Service: ${bookingData.service}
• Type: ${bookingData.appointmentType === 'clinic' ? 'At Clinic' : 'At Home'}
• Price: Rs ${finalPrice} (${discountText})
• ${locationDetails}
• Date & Time: ${bookingData.dateTime}

📞 Contact Information:
• Phone: ${bookingData.phone}
• Email: ${bookingData.email}

Please confirm this appointment. Thank you!`;

    return encodeURIComponent(summary);
  };

  const handleOwnerNameSubmit = () => {
    if (!bookingData.ownerName.trim()) return;

    addMessage('user', bookingData.ownerName);
    // GA4 Event: User provided name
    sendGAEvent('chatbot_step_completed', {
      step_name: 'owner_name_submitted',
      owner_name: bookingData.ownerName,
      current_step: currentStep,
      next_step: currentStep + 1
    });
    setTimeout(() => {
      addMessage('bot', `Nice to meet you, ${bookingData.ownerName}! 🐾 What service do you need for your pet?`);
      setCurrentStep(1);
    }, 500);
  };

  const handleServiceSelect = (service) => {
    setBookingData(prev => ({ ...prev, service }));
    addMessage('user', service);
    // GA4 Event: Service selected
    sendGAEvent('chatbot_step_completed', {
      step_name: 'service_selected',
      service_name: service,
      current_step: currentStep,
      next_step: currentStep + 1
    });
    setTimeout(() => {
      addMessage('bot', `Perfect! You've selected **${service}**.\n\nWould you prefer an appointment at a clinic or at home?`);
      setCurrentStep(2);
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

      priceMessage = `🎉 **${discountText}**\n\n**${bookingData.service} ${type === 'clinic' ? 'at clinic' : 'at home'}:**\n• Original Price: ~~Rs ${originalPrice}~~\n• **Our Price: Rs ${discountedPrice}**\n• **With Special Discount: Rs ${finalPrice}**`;
      // GA4 Event: Appointment type selected with price details
      sendGAEvent('chatbot_step_completed', {
        step_name: 'appointment_type_selected',
        appointment_type: type,
        service_name: bookingData.service,
        original_price: originalPrice,
        discounted_price: discountedPrice,
        final_price: finalPrice,
        current_step: currentStep,
        next_step: type === 'clinic' ? currentStep + 1 : currentStep + 2 // Different next steps
      });
    }

    setTimeout(() => {
      addMessage('bot', priceMessage + `\n\n${type === 'clinic' ? 'Please select a clinic from the list below.' : 'What is your full address or area for the appointment?'}`);
      setCurrentStep(type === 'clinic' ? 3 : 4);
    }, 500);
  };

  const handleClinicSelect = (clinicId) => {
    const selectedClinic = vetClinics.find(c => c.id === clinicId);
    if (!selectedClinic) return;

    setBookingData(prev => ({ ...prev, clinic: clinicId, location: selectedClinic.address }));
    addMessage('user', selectedClinic.name);
    // GA4 Event: Clinic selected
    sendGAEvent('chatbot_step_completed', {
      step_name: 'clinic_selected',
      clinic_id: clinicId,
      clinic_name: selectedClinic.name,
      clinic_address: selectedClinic.address,
      current_step: currentStep,
      next_step: currentStep + 2
    });
    setTimeout(() => {
      addMessage('bot', `Great! You've chosen **${selectedClinic.name}**.\n\nWhen would you like to schedule the appointment? Please provide a date and time.`);
      setCurrentStep(5);
    }, 500);
  };

  const handleLocationSubmit = () => {
    if (!bookingData.location.trim()) return;

    addMessage('user', bookingData.location);
    // GA4 Event: Location submitted (for home visits)
    sendGAEvent('chatbot_step_completed', {
      step_name: 'location_submitted',
      location: bookingData.location,
      current_step: currentStep,
      next_step: currentStep + 1
    });
    setTimeout(() => {
      addMessage('bot', 'When would you like to schedule the appointment? Please provide a date and time.');
      setCurrentStep(5);
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

    const summary = `📋 **Booking Summary:**\n• **Pet Owner:** ${bookingData.ownerName}\n• **Service:** ${bookingData.service}\n• **Type:** ${bookingData.appointmentType === 'clinic' ? 'At Clinic' : 'At Home'}\n• **Price:** Rs ${finalPrice} (${discountText})\n• **Location:** ${bookingData.appointmentType === 'clinic' ? (vetClinics.find(c => c.id === bookingData.clinic)?.name || bookingData.location) : bookingData.location}\n• **Date & Time:** ${bookingData.dateTime}\n\nPlease provide your phone number and email address for confirmation.`;
    
    // GA4 Event: Date & Time submitted
    sendGAEvent('chatbot_step_completed', {
      step_name: 'datetime_submitted',
      date_time: bookingData.dateTime,
      current_step: currentStep,
      next_step: currentStep + 1
    });

    setTimeout(() => {
      addMessage('bot', summary);
      setCurrentStep(6);
    }, 500);
  };

  const handleContactSubmit = async () => {
    if (!bookingData.phone.trim() || !bookingData.email.trim()) return;

    addMessage('user', `${bookingData.phone} | ${bookingData.email}`);

    const selectedService = vetServices.find(s => s.service === bookingData.service);
    const price = bookingData.appointmentType === 'clinic' ? selectedService?.inClinicDiscounted : selectedService?.inHomeDiscounted;
    const discountRate = getDiscountRate(bookingData.service);
    const finalPrice = price ? Math.round(price * discountRate) : 'Pending';

    // Track only the completed booking for your custom Sheets/local storage
    await trackEvent('booking_completed', {
      ownerName: bookingData.ownerName,
      service: bookingData.service,
      appointmentType: bookingData.appointmentType,
      clinic: bookingData.clinic,
      location: bookingData.location,
      dateTime: bookingData.dateTime,
      phone: bookingData.phone,
      email: bookingData.email,
      finalPrice: finalPrice,
      completedAt: new Date().toISOString()
    });

    // GA4 Event: Final booking completed
    sendGAEvent('booking_completed', {
      owner_name: bookingData.ownerName,
      service_name: bookingData.service,
      appointment_type: bookingData.appointmentType,
      clinic_id: bookingData.clinic,
      location_details: bookingData.location,
      date_time: bookingData.dateTime,
      phone_number_provided: !!bookingData.phone.trim(), // Boolean to indicate if provided
      email_provided: !!bookingData.email.trim(),
      final_price: finalPrice,
      current_step: currentStep,
      next_step: currentStep + 1
    });

    setTimeout(() => {
      addMessage('bot', '✅ **Your request has been submitted!** We\'ll reach out shortly to confirm your booking.\n\n📲 **To confirm this appointment, please send the summary to our team by clicking the button below.**');
      setCurrentStep(7);
    }, 500);
  };

  const resetChat = () => {
    setCurrentStep(0);
    setBookingData({
      ownerName: '',
      service: '',
      appointmentType: '',
      clinic: '',
      location: '',
      dateTime: '',
      phone: '',
      email: ''
    });
    setMessages([
      {
        type: 'bot',
        content: "Hi! 👋 I'm MatchVetBot. I'll help you book a vet appointment in less than 2 minutes. First, what's your name?"
      }
    ]);
    // GA4 Event: Chat reset
    sendGAEvent('chatbot_reset');
  };

  const exportAnalytics = () => {
    const backupData = localStorage.getItem('matchvet_analytics_backup');
    if (backupData) {
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `matchvet_backup_analytics_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('📥 Analytics data exported successfully');
      // GA4 Event: Analytics exported
      sendGAEvent('analytics_exported');
    } else {
      alert('No backup analytics data found. Check Google Sheets for live data!');
      // GA4 Event: Analytics export failed (no data)
      sendGAEvent('analytics_export_failed', { reason: 'no_data' });
    }
  };

  const renderChatInput = () => {
    switch (currentStep) {
      case 0: // Owner Name
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2 text-green-600" />
              Your Name
            </label>
            <input
              type="text"
              value={bookingData.ownerName}
              onChange={(e) => setBookingData(prev => ({ ...prev, ownerName: e.target.value }))}
              placeholder="Enter your name..."
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all duration-200 text-base"
              onKeyPress={(e) => { if (e.key === 'Enter') handleOwnerNameSubmit(); }}
            />
            <button
              onClick={handleOwnerNameSubmit}
              className="w-full bg-gradient-to-r from-lime-400 to-green-500 text-white py-4 rounded-xl hover:from-lime-500 hover:to-green-600 transition-all duration-200 font-bold shadow-lg active:scale-95 touch-manipulation"
            >
              Next
            </button>
          </div>
        );
      case 1: // Service Selection
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-3 font-medium">Select a service:</p>
            <div className="space-y-2">
              {vetServices.map((service, index) => (
                <button
                  key={index}
                  onClick={() => handleServiceSelect(service.service)}
                  className="w-full p-4 text-left border-2 border-green-200 rounded-xl hover:border-lime-400 hover:bg-gradient-to-r hover:from-lime-50 hover:to-green-50 transition-all duration-200 active:scale-95 touch-manipulation"
                >
                  <div className="font-medium text-gray-800 text-sm">{service.service}</div>
                  <div className="text-sm text-green-600 font-semibold mt-1">
                    From Rs {Math.round(service.inClinicDiscounted * getDiscountRate(service.service))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 2: // Appointment Type
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-3 font-medium">Choose appointment type:</p>
            <div className="space-y-3">
              <button
                onClick={() => handleAppointmentType('clinic')}
                className="w-full p-5 border-2 border-green-200 rounded-xl hover:border-lime-400 hover:bg-gradient-to-br hover:from-lime-50 hover:to-green-50 transition-all duration-200 active:scale-95 touch-manipulation"
              >
                <Hospital className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <div className="font-medium text-gray-800">At Clinic</div>
              </button>
              <button
                onClick={() => handleAppointmentType('home')}
                className="w-full p-5 border-2 border-green-200 rounded-xl hover:border-lime-400 hover:bg-gradient-to-br hover:from-lime-50 hover:to-green-50 transition-all duration-200 active:scale-95 touch-manipulation"
              >
                <Home className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <div className="font-medium text-gray-800">At Home</div>
              </button>
            </div>
          </div>
        );
      case 3: // Clinic Selection
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-3 font-medium">Select a clinic:</p>
            <div className="space-y-2">
              {vetClinics.map((clinic) => (
                <button
                  key={clinic.id}
                  onClick={() => handleClinicSelect(clinic.id)}
                  className="w-full p-4 text-left border-2 border-green-200 rounded-xl hover:border-lime-400 hover:bg-gradient-to-r hover:from-lime-50 hover:to-green-50 transition-all duration-200 active:scale-95 touch-manipulation"
                >
                  <div className="font-medium text-gray-800 text-sm">{clinic.name}</div>
                  <div className="text-sm text-gray-500 mt-1">{clinic.address}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 4: // Location Input (Home visits)
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2 text-green-600" />
              Full Address or Area
            </label>
            <input
              type="text"
              value={bookingData.location}
              onChange={(e) => setBookingData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Enter your address..."
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all duration-200 text-base"
              onKeyPress={(e) => { if (e.key === 'Enter') handleLocationSubmit(); }}
            />
            <button
              onClick={handleLocationSubmit}
              className="w-full bg-gradient-to-r from-lime-400 to-green-500 text-white py-4 rounded-xl hover:from-lime-500 hover:to-green-600 transition-all duration-200 font-bold shadow-lg active:scale-95 touch-manipulation"
            >
              Next
            </button>
          </div>
        );
      case 5: // Date & Time
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2 text-green-600" />
              Preferred Date & Time
            </label>
            <input
              type="text"
              value={bookingData.dateTime}
              onChange={(e) => setBookingData(prev => ({ ...prev, dateTime: e.target.value }))}
              placeholder="e.g., Today 9:00 PM or 2025-07-15 14:00"
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all duration-200 text-base"
              onKeyPress={(e) => { if (e.key === 'Enter') handleDateTimeSubmit(); }}
            />
            <button
              onClick={handleDateTimeSubmit}
              className="w-full bg-gradient-to-r from-lime-400 to-green-500 text-white py-4 px-6 rounded-xl hover:from-lime-500 hover:to-green-600 transition-all duration-200 font-bold shadow-lg active:scale-95 touch-manipulation text-center flex items-center justify-center min-h-[48px]"
            >
              Next
            </button>
          </div>
        );
      case 6: // Contact Info
        return (
          <div className="space-y-4">
            <div className="space-y-3">
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
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all duration-200 text-base"
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
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all duration-200 text-base"
                />
              </div>
            </div>
            <button
              onClick={handleContactSubmit}
              className="w-full bg-gradient-to-r from-lime-400 to-green-500 text-white py-4 rounded-xl hover:from-lime-500 hover:to-green-600 transition-all duration-200 font-bold shadow-lg active:scale-95 touch-manipulation"
            >
              <Check className="w-5 h-5 inline mr-2" />
              Submit Booking Request
            </button>
          </div>
        );
      case 7: // Final Confirmation
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-lime-50 border-2 border-green-200 rounded-xl p-5 shadow-sm">
              <Check className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-green-800 text-lg text-center">Booking Submitted!</h3>
              <p className="text-green-700 text-sm text-center mt-2">We'll contact you shortly to confirm.</p>
            </div>

            <div className="space-y-3">
              <a
                href={`https://wa.me/923121488954?text=${generateWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-lime-400 to-green-500 text-white py-4 rounded-xl hover:from-lime-500 hover:to-green-600 transition-all duration-200 font-bold shadow-lg active:scale-95 touch-manipulation text-center"
              >
                📲 Confirm Your Appointment Now
              </a>

              <button
                onClick={resetChat}
                className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 py-4 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium border border-gray-300 active:scale-95 touch-manipulation"
              >
                Book Another Appointment
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 flex flex-col">
      <div className="bg-gradient-to-r from-[#2d3c3f] to-[#1a2426] text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-green-400/20 p-2 rounded-full flex items-center justify-center">
              <img
                src="./MatchVet.png"
                alt="MatchVet Logo"
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-green-400 leading-tight">
                MatchVet AI Agent
              </h1>
              <p className="text-gray-200 text-sm leading-tight">Premier Veterinary Care</p>
            </div>
          </div>
          <button
            onClick={exportAnalytics}
            className="bg-blue-500/20 p-2 rounded-full hover:bg-blue-500/30 transition-colors"
            title="Export Analytics"
          >
            <Download className="w-4 h-4 text-blue-400" />
          </button>
        </div>
        <div className="mt-3 bg-gradient-to-r from-lime-400/20 to-green-400/20 rounded-lg p-3 backdrop-blur">
          <p className="text-xs font-medium text-white text-center">
            🎉 Special Discounts Available!
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-3">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-green-100 flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-green-50/30">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-lime-400 to-green-500 text-white font-medium shadow-md'
                    : 'bg-white text-gray-800 shadow-sm border border-green-100'
                }`}>
                  <div className="whitespace-pre-line text-sm leading-relaxed">{message.content}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            {renderChatInput()}
          </div>
        </div>
      </div>

      <div className="text-center p-4 text-gray-600 bg-white border-t border-gray-100">
        <p className="text-xs">MatchVet - Premier Veterinary Care</p>
        <p className="text-xs mt-1">Currently serving Lahore • More cities coming soon</p>
      </div>
    </div>
  );
};

export default MatchVetBot;
