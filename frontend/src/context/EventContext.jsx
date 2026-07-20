import React, { createContext, useState, useEffect } from 'react';

export const EventContext = createContext();

const initialEvents = [
  {
    id: 'future-visionary-summit-2024',
    title: 'Future Visionary Summit 2024',
    category: 'Technology & Innovation',
    date: 'November 14-16, 2024',
    venueName: 'Metropolitan Convention Center',
    address: '125 W 18th St, New York, NY 10011',
    price: 499,
    attendeesCount: 840,
    maxParticipants: 1000,
    lastDateToReg: 'November 10, 2024',
    organizerId: 1, // Future Tech Lab
    organizer: {
      name: 'Future Tech Lab',
      subtitle: 'Pioneering Tech Education & Global Summits',
      description: 'Future Tech Lab is a leading international consortium hosting over 30 global conferences annually. We focus on bridging the gap between cutting-edge research and industrial application, creating spaces for deep technical exploration.',
      avatar: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80'
    },
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    aboutParagraphs: [
      'The Future Visionary Summit 2024 brings together pioneering developers, industry leaders, and tech visionaries to explore the next frontier of digital engineering, AI, and design systems. Engage in high-impact keynote presentations, hands-on masterclasses, and vibrant networking sessions built around real-world insights.',
      'Whether you are a startup developer scaling your architecture or a seasoned tech leader designing enterprise ecosystems, this summit offers three action-packed days of technical depth and inspiring panels that will challenge your paradigms and elevate your projects.'
    ],
    stats: {
      speakers: '32',
      workshops: '15',
      networking: '24h',
      exhibitors: '12'
    },
    schedule: [
      {
        id: 1,
        time: '09:00 AM - 10:30 AM',
        title: 'Opening Keynote: Designing the Next Gen Internet',
        speaker: 'Dr. Sarah Jenkins (AI Architect)',
        location: 'Grand Ballroom (Stage A)',
        duration: '90 min'
      },
      {
        id: 2,
        time: '11:00 AM - 12:30 PM',
        title: 'Interactive Workshop: Micro-Frontends & Design Tokens',
        speaker: 'Marcus Aurelius (Lead Frontend Eng)',
        location: 'Workshop Room C',
        duration: '90 min'
      }
    ],
    similarEvents: [
      {
        id: 'ai-ml-expo-2024',
        title: 'AI & Machine Learning Expo',
        category: 'Artificial Intelligence',
        date: 'Dec 05, 2024',
        venueName: 'Convention Hall, San Francisco, CA',
        price: 299,
        image: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'ux-ui-design-masterclass-2024',
        title: 'UX/UI Design Masterclass',
        category: 'Design Systems',
        date: 'Dec 18, 2024',
        venueName: 'Design Hub, Austin, TX / Online',
        price: 199,
        image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'saas-growth-forum-2025',
        title: 'SaaS Product Growth Forum',
        category: 'Product Strategy',
        date: 'Jan 12, 2025',
        venueName: 'Hilton Grand, Miami, FL',
        price: 349,
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80'
      }
    ]
  },
  {
    id: 'ai-ml-expo-2024',
    title: 'AI & Machine Learning Expo',
    category: 'Artificial Intelligence',
    date: 'December 05, 2024',
    venueName: 'Convention Hall',
    address: '450 Howard St, San Francisco, CA 94105',
    price: 299,
    attendeesCount: 520,
    maxParticipants: 800,
    lastDateToReg: 'December 01, 2024',
    organizerId: 2,
    organizer: {
      name: 'Neural Collective',
      subtitle: 'Pioneering Machine Learning Development',
      description: 'Neural Collective gathers research labs and commercial AI vendors to host annual interactive technology briefings.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    image: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&w=600&q=80',
    aboutParagraphs: [
      'Join us for the premier AI & Machine Learning Expo of the year, bringing together deep tech innovators and artificial intelligence specialists. This year covers LLMs, autonomous agents, and AI edge deployments.'
    ],
    stats: {
      speakers: '24',
      workshops: '8',
      networking: '12h',
      exhibitors: '8'
    },
    schedule: [
      {
        id: 1,
        time: '10:00 AM - 11:30 AM',
        title: 'Panel Discussion: The Future of Agentic AI',
        speaker: 'AI Board Panelists',
        location: 'Hall B',
        duration: '90 min'
      }
    ],
    similarEvents: []
  },
  {
    id: 'ux-ui-design-masterclass-2024',
    title: 'UX/UI Design Masterclass',
    category: 'Design Systems',
    date: 'December 18, 2024',
    venueName: 'Design Hub',
    address: '812 Congress Ave, Austin, TX 78701',
    price: 199,
    attendeesCount: 310,
    maxParticipants: 400,
    lastDateToReg: 'December 15, 2024',
    organizerId: 3,
    organizer: {
      name: 'Pixel Perfect Academy',
      subtitle: 'UI/UX Interactive Learning Lab',
      description: 'Pixel Perfect Academy hosts design workshops and bootcamps to raise standard practices in client side interfaces.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
    },
    image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80',
    aboutParagraphs: [
      'Elevate your design details in this intensive masterclass. Learn about interactive animations, typographic grids, complex layouts, and responsive accessibility design.'
    ],
    stats: {
      speakers: '12',
      workshops: '6',
      networking: '8h',
      exhibitors: '4'
    },
    schedule: [
      {
        id: 1,
        time: '01:00 PM - 02:30 PM',
        title: 'Masterclass: Crafting Premium Web App Visuals',
        speaker: 'Clara Oswald (Principal Designer)',
        location: 'Studio Room A',
        duration: '90 min'
      }
    ],
    similarEvents: []
  }
];

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]); // Array of eventIds
  const [myEvents, setMyEvents] = useState([]); // Array of events created by user

  useEffect(() => {
    // Sync with localStorage
    const savedEvents = localStorage.getItem('mock_events');
    const savedRegs = localStorage.getItem('mock_registrations');
    const savedMyEvents = localStorage.getItem('mock_my_events');

    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      setEvents(initialEvents);
      localStorage.setItem('mock_events', JSON.stringify(initialEvents));
    }

    if (savedRegs) {
      setMyRegistrations(JSON.parse(savedRegs));
    } else {
      setMyRegistrations([]);
    }

    if (savedMyEvents) {
      setMyEvents(JSON.parse(savedMyEvents));
    } else {
      setMyEvents([]);
    }
  }, []);

  const getEventById = (id) => {
    return events.find(e => e.id === id);
  };

  const createEvent = async (eventData, currentUser) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const id = eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `event-${Date.now()}`;
    const newEvent = {
      ...eventData,
      id,
      attendeesCount: 0,
      price: Number(eventData.price) || 0,
      maxParticipants: Number(eventData.maxParticipants) || 100,
      organizerId: currentUser.id,
      organizer: {
        name: currentUser.username,
        subtitle: 'Independent Organizer',
        description: currentUser.bio || 'Event organizer and hub host.',
        avatar: currentUser.avatar
      },
      stats: {
        speakers: eventData.speakersCount || '5',
        workshops: eventData.workshopsCount || '2',
        networking: '6h',
        exhibitors: '0'
      },
      schedule: eventData.schedule || [
        { id: 1, time: '09:00 AM - 10:00 AM', title: 'Registration & Coffee', speaker: 'Host', location: 'Reception', duration: '60 min' }
      ],
      similarEvents: events.slice(0, 3).map(e => ({
        id: e.id,
        title: e.title,
        category: e.category,
        date: e.date,
        venueName: e.venueName,
        price: e.price,
        image: e.image
      }))
    };

    const updatedEvents = [newEvent, ...events];
    setEvents(updatedEvents);
    localStorage.setItem('mock_events', JSON.stringify(updatedEvents));

    const updatedMyEvents = [newEvent, ...myEvents];
    setMyEvents(updatedMyEvents);
    localStorage.setItem('mock_my_events', JSON.stringify(updatedMyEvents));

    return newEvent;
  };

  const updateEvent = async (id, updatedData) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const updatedEvents = events.map(e => {
      if (e.id === id) {
        return {
          ...e,
          ...updatedData,
          price: Number(updatedData.price) || e.price,
          maxParticipants: Number(updatedData.maxParticipants) || e.maxParticipants
        };
      }
      return e;
    });

    setEvents(updatedEvents);
    localStorage.setItem('mock_events', JSON.stringify(updatedEvents));

    // Also update in myEvents if present
    const updatedMyEvents = myEvents.map(e => {
      if (e.id === id) {
        return {
          ...e,
          ...updatedData,
          price: Number(updatedData.price) || e.price,
          maxParticipants: Number(updatedData.maxParticipants) || e.maxParticipants
        };
      }
      return e;
    });
    setMyEvents(updatedMyEvents);
    localStorage.setItem('mock_my_events', JSON.stringify(updatedMyEvents));

    return updatedEvents.find(e => e.id === id);
  };

  const deleteEvent = async (id) => {
    await new Promise(resolve => setTimeout(resolve, 600));

    const updatedEvents = events.filter(e => e.id !== id);
    setEvents(updatedEvents);
    localStorage.setItem('mock_events', JSON.stringify(updatedEvents));

    const updatedMyEvents = myEvents.filter(e => e.id !== id);
    setMyEvents(updatedMyEvents);
    localStorage.setItem('mock_my_events', JSON.stringify(updatedMyEvents));

    const updatedRegs = myRegistrations.filter(regId => regId !== id);
    setMyRegistrations(updatedRegs);
    localStorage.setItem('mock_registrations', JSON.stringify(updatedRegs));
  };

  const registerForEvent = async (eventId) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (myRegistrations.includes(eventId)) {
      return { success: false, message: 'Already registered for this event!' };
    }

    const updatedRegs = [...myRegistrations, eventId];
    setMyRegistrations(updatedRegs);
    localStorage.setItem('mock_registrations', JSON.stringify(updatedRegs));

    // Increment event attendee count
    const updatedEvents = events.map(e => {
      if (e.id === eventId) {
        return { ...e, attendeesCount: e.attendeesCount + 1 };
      }
      return e;
    });
    setEvents(updatedEvents);
    localStorage.setItem('mock_events', JSON.stringify(updatedEvents));

    return { success: true, message: 'Successfully registered!' };
  };

  return (
    <EventContext.Provider value={{
      events,
      myRegistrations,
      myEvents,
      getEventById,
      createEvent,
      updateEvent,
      deleteEvent,
      registerForEvent
    }}>
      {children}
    </EventContext.Provider>
  );
};
