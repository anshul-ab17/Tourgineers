"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  CheckSquare,
  Users,
  User,
  CloudSun,
  ArrowRight,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  Globe,
  Send,
  Check,
  Briefcase,
  Map,
  Search,
  Heart,
  Home as HomeIcon,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

// Types
type TabType = "ai-planner" | "budget" | "checklist" | "friends";
type DropdownType = "where" | "when" | "who" | null;
type HeaderTabType = "homes" | "planner" | "host";

interface ItineraryItem {
  time: string;
  activity: string;
  location: string;
  notes: string;
}

interface Expense {
  id: string;
  city: string;
  description: string;
  amount: number;
  currency: "USD" | "INR" | "EUR";
  paidBy: string;
}

interface ListingCard {
  id: string;
  city?: string;
  title: string;
  type: string;
  price: string;
  rating: string;
  imageUrl: string;
  isFav: boolean;
}

export default function Home() {
  // Navigation Tabs: Homes and Planner are two different views
  const [headerTab, setHeaderTab] = useState<HeaderTabType>("homes");
  
  // Search Pill Dropdown States
  const [heroDest, setHeroDest] = useState("");
  const [heroDays, setHeroDays] = useState("5");
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  
  // Active Selected City ("All" by default to trigger the horizontal scrollers)
  const [selectedCity, setSelectedCity] = useState("All");

  // Collaborative Console Tabs
  const [activeTab, setActiveTab] = useState<TabType>("ai-planner");

  // --- Feature 1: AI Planner State ---
  const [destInput, setDestInput] = useState("Amsterdam, Netherlands");
  const [daysInput, setDaysInput] = useState("3");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<Record<string, ItineraryItem[]>>({
    "Day 1": [
      { time: "09:30 AM", activity: "Jordaan District Canal Walking Tour", location: "Jordaan, Amsterdam", notes: "Explore picturesque canals, boutique shops, and narrow streets." },
      { time: "01:00 PM", activity: "Pancake Lunch at The Pancake Bakery", location: "Prinsengracht", notes: "Try the traditional Dutch savoury pancakes." },
      { time: "03:00 PM", activity: "Anne Frank House Memorial Visit", location: "Westermarkt", notes: "Book tickets online exactly 6 weeks in advance." },
      { time: "07:30 PM", activity: "Canal Cruise & Traditional Dinner", location: "Damrak Pier", notes: "A 90-minute evening cruise with candle-lit wine and cheese." }
    ],
    "Day 2": [
      { time: "09:00 AM", activity: "Rijksmuseum Classical Art Collection", location: "Museumplein", notes: "See masterpieces by Rembrandt and Vermeer." },
      { time: "01:30 PM", activity: "Stroll in Vondelpark & Cafe Pitstop", location: "Vondelpark", notes: "Rent a bike to tour the green paths." },
      { time: "04:30 PM", activity: "Van Gogh Museum Exploration", location: "Museumplein", notes: "Audio guide recommended for letters archive." }
    ],
    "Day 3": [
      { time: "10:00 AM", activity: "Bloemenmarkt Flower Market Stroll", location: "Singel Canal", notes: "See thousands of tulips and flower bulbs." },
      { time: "02:00 PM", activity: "Heineken Experience Brewery Tour", location: "Stadhouderskade", notes: "Interactive historical tasting experience." }
    ]
  });

  // --- Feature 2: Budget State ---
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expDescription, setExpDescription] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expPaidBy, setExpPaidBy] = useState("");
  const [expCurrency, setExpCurrency] = useState<"USD" | "INR" | "EUR">("USD");
  const [displayCurrency, setDisplayCurrency] = useState<"USD" | "INR" | "EUR">("USD");
  const [baseBudgetLimit, setBaseBudgetLimit] = useState(2500);

  // --- Host Admin Panel State ---
  const [customListings, setCustomListings] = useState<ListingCard[]>([]);
  const [hostTitle, setHostTitle] = useState("");
  const [hostCity, setHostCity] = useState("Amsterdam");
  const [hostPrice, setHostPrice] = useState("");
  const [hostType, setHostType] = useState("Entire rental unit");
  const [hostImageUrl, setHostImageUrl] = useState("");
  const [hostError, setHostError] = useState("");
  const [hostSuccess, setHostSuccess] = useState("");

  const exchangeRates = {
    USD: 83,
    EUR: 90,
    INR: 1
  };

  const convertCurrency = (amount: number, from: "USD" | "INR" | "EUR", to: "USD" | "INR" | "EUR") => {
    if (from === to) return amount;
    const amountInInr = amount * exchangeRates[from];
    return amountInInr / exchangeRates[to];
  };

  const currencySymbols = {
    USD: "$",
    EUR: "€",
    INR: "₹"
  };

  // --- Feature 3: Weather & Checklist State ---
  const [weatherCity, setWeatherCity] = useState("Amsterdam");
  const [weatherData, setWeatherData] = useState({ temp: 19, condition: "Partly Cloudy", icon: "CloudSun" });
  const [checklist, setChecklist] = useState([
    { id: "c1", text: "Passports & Schengen Travel Visa", checked: true, tag: "Essential" },
    { id: "c2", text: "Universal Plug Adapter (Type C/F)", checked: true, tag: "Tech" },
    { id: "c3", text: "Comfortable Sneakers (for cobblestone walks)", checked: true, tag: "Gear" },
    { id: "c4", text: "Light Windbreaker / Raincoat", checked: false, tag: "Essential" },
    { id: "c5", text: "Compact travel umbrella (Cloudy weather alert)", checked: false, tag: "Weather" },
    { id: "c6", text: "Public transport OV-Chipkaart", checked: false, tag: "Gear" }
  ]);
  const [newItemText, setNewItemText] = useState("");

  // --- Feature 4: Friends Chat Sync State ---
  const [chatMessages, setChatMessages] = useState([
    { id: "m1", user: "Alex", text: "Booked the Canal Loft in Jordaan. The location is perfect!", time: "11:12 AM", avatar: "👤" },
    { id: "m2", user: "Sophia", text: "Perfect! I added the Van Gogh Museum group pass to the expenses split.", time: "11:15 AM", avatar: "👩‍🎨" },
    { id: "m3", user: "Emily", text: "Agreed. Let's make sure the Canal Cruise booking details are finalized today.", time: "11:22 AM", avatar: "👩‍💻" }
  ]);
  const [newMsgText, setNewMsgText] = useState("");

  // Guests Counters (Who tab)
  const [guestCount, setGuestCount] = useState({ adults: 3, children: 0, infants: 0, pets: 0 });
  
  // Selected Calendar dates
  const [selectedDate, setSelectedDate] = useState<number | null>(10);

  // Wishlisted Cards State
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({
    "ams-1": true,
    "del-1": false,
    "tok-1": true,
    "sin-1": false,
    "lon-1": false,
    "nyc-1": true
  });

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const containerRef = useRef<HTMLDivElement>(null);

  const API_BASE = "http://localhost:3008/api";

  // Fetch expenses whenever active destination changes to align with current city
  useEffect(() => {
    const cityName = destInput.split(',')[0]?.trim() || "Amsterdam";
    fetch(`${API_BASE}/expenses?city=${cityName}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setExpenses(data);
      })
      .catch(err => console.log("Express backend query failed, running offline fallback mode."));
  }, [destInput]);

  // Fetch initial checklist, messages and listings on mount
  useEffect(() => {
    // 1. Fetch Checklist
    fetch(`${API_BASE}/checklist`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setChecklist(data);
      })
      .catch(err => {});

    // 2. Fetch Messages
    fetch(`${API_BASE}/messages`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setChatMessages(data);
      })
      .catch(err => {});

    // 3. Fetch Listings
    fetch(`${API_BASE}/listings`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustomListings(data);
      })
      .catch(err => {});
  }, []);

  // Click outside listener for search dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Predefined realistic city listings database (6 properties for each city)
  const initialCityListingsData: Record<string, ListingCard[]> = {
    Amsterdam: [
      { id: "ams-1", city: "Amsterdam", title: "Canal View Loft in Jordaan", type: "Entire rental unit", price: "₹12,450", rating: "4.96", imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80", isFav: true },
      { id: "ams-2", city: "Amsterdam", title: "Historic Apartment near Rijksmuseum", type: "Entire loft", price: "₹14,200", rating: "4.98", imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80", isFav: true },
      { id: "ams-3", city: "Amsterdam", title: "Charming Houseboat on Amstel River", type: "Houseboat", price: "₹16,800", rating: "4.92", imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80", isFav: false },
      { id: "ams-4", city: "Amsterdam", title: "Bright Scandinavian Studio in De Pijp", type: "Entire studio", price: "₹9,800", rating: "4.88", imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80", isFav: false },
      { id: "ams-5", city: "Amsterdam", title: "Designer Flat overlooking Vondelpark", type: "Entire condo", price: "₹15,500", rating: "4.95", imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80", isFav: true },
      { id: "ams-6", city: "Amsterdam", title: "Industrial Penthouse in Amsterdam Noord", type: "Entire loft", price: "₹18,900", rating: "4.90", imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=80", isFav: false }
    ],
    Delhi: [
      { id: "del-1", city: "Delhi", title: "Heritage Haveli Suite in South Delhi", type: "Private room in home", price: "₹4,500", rating: "4.94", imageUrl: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80", isFav: true },
      { id: "del-2", city: "Delhi", title: "Modern Terrace Apartment in Hauz Khas", type: "Entire rental unit", price: "₹5,200", rating: "4.90", imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80", isFav: false },
      { id: "del-3", city: "Delhi", title: "Elegant Greenery Bungalow in Lutyens", type: "Entire bungalow", price: "₹12,800", rating: "4.97", imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80", isFav: true },
      { id: "del-4", city: "Delhi", title: "Artistic Studio with Lotus Temple views", type: "Entire studio", price: "₹3,900", rating: "4.86", imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80", isFav: false },
      { id: "del-5", city: "Delhi", title: "Cozy Garden Suite near Connaught Place", type: "Entire guest suite", price: "₹6,500", rating: "4.89", imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80", isFav: true },
      { id: "del-6", city: "Delhi", title: "Sleek Modern Loft in Vasant Vihar", type: "Entire loft", price: "₹8,900", rating: "4.91", imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80", isFav: false }
    ],
    Tokyo: [
      { id: "tok-1", city: "Tokyo", title: "Traditional Tatami Ryokan in Asakusa", type: "Private room in ryokan", price: "₹8,500", rating: "4.97", imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80", isFav: true },
      { id: "tok-2", city: "Tokyo", title: "Compact High-Tech Studio in Shibuya", type: "Entire rental unit", price: "₹11,200", rating: "4.91", imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80", isFav: false },
      { id: "tok-3", city: "Tokyo", title: "Skyscraper Skyline Flat in Shinjuku", type: "Entire condo", price: "₹15,600", rating: "4.95", imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80", isFav: true },
      { id: "tok-4", city: "Tokyo", title: "Zen Garden Oasis in Meguro", type: "Entire residential home", price: "₹18,000", rating: "4.98", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80", isFav: true },
      { id: "tok-5", city: "Tokyo", title: "Minimalist Loft near Roppongi Hills", type: "Entire loft", price: "₹14,900", rating: "4.88", imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80", isFav: false },
      { id: "tok-6", city: "Tokyo", title: "Modern Design Penthouse in Ginza", type: "Entire rental unit", price: "₹22,000", rating: "4.96", imageUrl: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80", isFav: false }
    ],
    Singapore: [
      { id: "sin-1", city: "Singapore", title: "Marina Bay View Penthouse", type: "Entire condominium", price: "₹28,500", rating: "4.98", imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80", isFav: true },
      { id: "sin-2", city: "Singapore", title: "Luxury Sky Loft in Orchard Road", type: "Entire condo", price: "₹19,800", rating: "4.93", imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80", isFav: false },
      { id: "sin-3", city: "Singapore", title: "Chic Heritage Shophouse in Chinatown", type: "Entire townhouse", price: "₹15,400", rating: "4.91", imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80", isFav: true },
      { id: "sin-4", city: "Singapore", title: "Modern Condominium with Infinity Pool", type: "Entire rental unit", price: "₹12,900", rating: "4.89", imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80", isFav: false },
      { id: "sin-5", city: "Singapore", title: "Designer Garden Suite in Sentosa", type: "Entire guest suite", price: "₹24,000", rating: "4.96", imageUrl: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=600&q=80", isFav: true },
      { id: "sin-6", city: "Singapore", title: "Luxury High-Rise Suite in Bugis", type: "Entire rental unit", price: "₹16,500", rating: "4.92", imageUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80", isFav: false }
    ],
    London: [
      { id: "lon-1", city: "London", title: "Victorian Brick Townhouse in Kensington", type: "Entire townhouse", price: "₹21,000", rating: "4.96", imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80", isFav: true },
      { id: "lon-2", city: "London", title: "Cozy Garden Apartment in Shoreditch", type: "Entire rental unit", price: "₹14,500", rating: "4.91", imageUrl: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80", isFav: false },
      { id: "lon-3", city: "London", title: "Elegant Flat near Hyde Park", type: "Entire loft", price: "₹18,200", rating: "4.94", imageUrl: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=600&q=80", isFav: true },
      { id: "lon-4", city: "London", title: "Charming Chelsea Study & Apartment", type: "Entire rental unit", price: "₹16,900", rating: "4.95", imageUrl: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=600&q=80", isFav: false },
      { id: "lon-5", city: "London", title: "Bright Modern flat in Greenwich", type: "Entire condo", price: "₹11,000", rating: "4.87", imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80", isFav: true },
      { id: "lon-6", city: "London", title: "Classic Mews House in Westminster", type: "Entire townhouse", price: "₹25,000", rating: "4.98", imageUrl: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80", isFav: true }
    ],
    NewYork: [
      { id: "nyc-1", city: "New York", title: "Manhattan Loft with Skyline view", type: "Entire loft", price: "₹24,500", rating: "4.97", imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80", isFav: true },
      { id: "nyc-2", city: "New York", title: "Brooklyn Industrial Brick Flat", type: "Entire condo", price: "₹16,200", rating: "4.92", imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80", isFav: false },
      { id: "nyc-3", city: "New York", title: "High-Rise Central Park Penthouse", type: "Entire penthouse", price: "₹38,000", rating: "4.99", imageUrl: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=600&q=80", isFav: true },
      { id: "nyc-4", city: "New York", title: "Chic West Village Studio", type: "Entire studio", price: "₹13,900", rating: "4.89", imageUrl: "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=600&q=80", isFav: false },
      { id: "nyc-5", city: "New York", title: "Bright Chelsea Apartment", type: "Entire loft", price: "₹18,000", rating: "4.93", imageUrl: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=600&q=80", isFav: true },
      { id: "nyc-6", city: "New York", title: "Modern Studio near Times Square", type: "Entire rental unit", price: "₹15,000", rating: "4.87", imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80", isFav: false }
    ]
  };

  // Combine initial listings with custom listings added by host
  const cityListingsData = React.useMemo(() => {
    const data = {
      Amsterdam: [...initialCityListingsData.Amsterdam!],
      Delhi: [...initialCityListingsData.Delhi!],
      Tokyo: [...initialCityListingsData.Tokyo!],
      Singapore: [...initialCityListingsData.Singapore!],
      London: [...initialCityListingsData.London!],
      NewYork: [...initialCityListingsData.NewYork!]
    };

    customListings.forEach(item => {
      const cityKey = (item.city || "Amsterdam").replace(/\s/g, "");
      if (data[cityKey as keyof typeof data]) {
        data[cityKey as keyof typeof data].push(item);
      }
    });

    return data;
  }, [customListings]);

  // Simulated AI Generation Action
  const handleGenerateItinerary = (targetDest?: string, targetDays?: string) => {
    const activeDest = targetDest || destInput;
    const activeDays = parseInt(targetDays || daysInput) || 3;
    
    setIsGenerating(true);

    setTimeout(() => {
      const newItinerary: Record<string, ItineraryItem[]> = {};

      const activitiesPool = [
        { activity: "Guided walking tour & architectural history walk", location: "Historic Center", notes: "Comfortable shoes are a must" },
        { activity: "Local market food tasting", location: "Central Market", notes: "Try the regional cheese and baked goods" },
        { activity: "Contemporary museum & art gallery exploration", location: "Arts Quarter", notes: "Check out the permanent exhibition" },
        { activity: "Scenic sunset viewing over the rooftops", location: "Panoramic Terrace", notes: "Great time for skyline photography" },
        { activity: "Traditional dinner at a family-run trattoria", location: "Piazza Area", notes: "Reservations strongly recommended" },
        { activity: "Botanical gardens stroll & coffee pitstop", location: "West Wing Park", notes: "Try the local espresso" },
        { activity: "Local craft market & boutique shopping", location: "Arts District", notes: "Carry cash for vendor stalls" }
      ];

      for (let i = 1; i <= activeDays; i++) {
        const items: ItineraryItem[] = [];
        items.push({
          time: "09:30 AM",
          activity: `Morning exploration of ${activeDest} landmarks`,
          location: "Downtown",
          notes: "Start early to beat the crowds."
        });
        const act1 = activitiesPool[Math.floor(Math.random() * activitiesPool.length)] || activitiesPool[0]!;
        items.push({
          time: "01:30 PM",
          activity: act1.activity,
          location: act1.location,
          notes: act1.notes
        });
        const act2 = activitiesPool[Math.floor(Math.random() * activitiesPool.length)] || activitiesPool[0]!;
        items.push({
          time: "07:00 PM",
          activity: act2.activity,
          location: act2.location,
          notes: act2.notes
        });

        newItinerary[`Day ${i}`] = items;
      }

      setGeneratedItinerary(newItinerary);
      setIsGenerating(false);
    }, 1200);
  };

  // Click on a property card to load and switch directly to Planner
  const handleCardClick = (title: string, city: string) => {
    const fullLoc = `${title}, ${city}`;
    setDestInput(fullLoc);
    setHeroDest(fullLoc);
    setWeatherCity(city);
    handleWeatherQuery(city);
    
    // Switch header view to Planner
    setHeaderTab("planner");

    // Auto generate plan
    handleGenerateItinerary(fullLoc, daysInput);
  };

  // Add Custom Listing / Host Home Action
  const handleAddListing = (e: React.FormEvent) => {
    e.preventDefault();
    setHostError("");
    setHostSuccess("");

    // Enforce validation: all fields must be filled
    if (!hostTitle.trim() || !hostCity.trim() || !hostPrice.trim() || !hostType.trim() || !hostImageUrl.trim()) {
      setHostError("All sections must be filled before publishing your listing!");
      return;
    }

    const priceVal = parseFloat(hostPrice.replace(/[^\d.]/g, ""));
    if (isNaN(priceVal) || priceVal <= 0) {
      setHostError("Please enter a valid price per night!");
      return;
    }

    const newListingPayload = {
      city: hostCity,
      title: hostTitle,
      type: hostType,
      price: `₹${priceVal.toLocaleString()}`,
      imageUrl: hostImageUrl,
      rating: "5.00",
      isFav: false
    };

    fetch(`${API_BASE}/listings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newListingPayload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Validation failed");
        return res.json();
      })
      .then(addedListing => {
        setCustomListings(prev => [...prev, addedListing]);
        setHostSuccess("Listing successfully published and is now active!");
        // Reset fields
        setHostTitle("");
        setHostPrice("");
        setHostImageUrl("");
      })
      .catch(err => {
        // Offline/Failure fallback
        const offlineListing = { id: `custom-${Date.now()}`, ...newListingPayload };
        setCustomListings(prev => [...prev, offlineListing]);
        setHostSuccess("Listing published successfully (Offline Fallback Mode)!");
        setHostTitle("");
        setHostPrice("");
        setHostImageUrl("");
      });
  };

  // Add Expense Action
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDescription || !expAmount) return;
    const amountNum = parseFloat(expAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const cityName = destInput.split(',')[0]?.trim() || "Amsterdam";
    const newExpPayload = {
      city: cityName,
      description: expDescription,
      amount: amountNum,
      currency: expCurrency,
      paidBy: expPaidBy
    };

    fetch(`${API_BASE}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newExpPayload)
    })
      .then(res => res.json())
      .then(addedExp => {
        setExpenses(prev => [...prev, addedExp]);
      })
      .catch(() => {
        setExpenses(prev => [...prev, { id: Date.now().toString(), ...newExpPayload }]);
      });

    setExpDescription("");
    setExpAmount("");
  };

  // Delete Expense Action
  const handleDeleteExpense = (id: string) => {
    fetch(`${API_BASE}/expenses/${id}`, { method: "DELETE" })
      .then(() => {
        setExpenses(prev => prev.filter(e => e.id !== id));
      })
      .catch(() => {
        setExpenses(prev => prev.filter(e => e.id !== id));
      });
  };

  // Add Checklist Item Action
  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText) return;

    const newChecklistPayload = {
      text: newItemText,
      tag: "Custom"
    };

    fetch(`${API_BASE}/checklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newChecklistPayload)
    })
      .then(res => res.json())
      .then(addedItem => {
        setChecklist(prev => [...prev, addedItem]);
      })
      .catch(() => {
        setChecklist(prev => [...prev, { id: Date.now().toString(), text: newItemText, checked: false, tag: "Custom" }]);
      });

    setNewItemText("");
  };

  // Toggle Checklist Item
  const toggleChecklist = (id: string) => {
    const targetItem = checklist.find(item => item.id === id);
    if (!targetItem) return;

    const newCheckedState = !targetItem.checked;

    fetch(`${API_BASE}/checklist/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: newCheckedState })
    })
      .then(res => res.json())
      .then(updatedItem => {
        setChecklist(prev => prev.map(item => item.id === id ? updatedItem : item));
      })
      .catch(() => {
        setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: newCheckedState } : item));
      });
  };

  // Send Chat Message Action
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText) return;

    const newMsgPayload = {
      user: "You",
      text: newMsgText,
      avatar: "🚀"
    };

    fetch(`${API_BASE}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMsgPayload)
    })
      .then(res => res.json())
      .then(addedMsg => {
        setChatMessages(prev => [...prev, addedMsg]);
      })
      .catch(() => {
        setChatMessages(prev => [
          ...prev,
          { id: Date.now().toString(), user: "You", text: newMsgText, time: "Just now", avatar: "🚀" }
        ]);
      });

    setNewMsgText("");
  };

  // Weather query simulated change
  const handleWeatherQuery = (city: string) => {
    setWeatherCity(city);
    const cities: Record<string, { temp: number; condition: string; icon: string }> = {
      rome: { temp: 31, condition: "Hot & Sunny", icon: "Sun" },
      tokyo: { temp: 21, condition: "Partly Cloudy", icon: "CloudSun" },
      paris: { temp: 24, condition: "Sunny", icon: "Sun" },
      london: { temp: 15, condition: "Rainy", icon: "CloudRain" },
      newyork: { temp: 27, condition: "Humid", icon: "Cloud" },
      delhi: { temp: 36, condition: "Scorching & Dry", icon: "Sun" },
      singapore: { temp: 30, condition: "Tropical Rain", icon: "CloudRain" },
      amsterdam: { temp: 19, condition: "Partly Cloudy", icon: "CloudSun" }
    };

    const queryKey = city.toLowerCase().split(",")[0]?.trim().replace(/\s/g, "") || "";
    if (cities[queryKey]) {
      const data = cities[queryKey];
      setWeatherData({ temp: data.temp, condition: data.condition, icon: data.icon });
      
      // Auto recommend items based on conditions
      if (data.condition.includes("Rain") && !checklist.some(c => c.text.includes("Umbrella"))) {
        setChecklist(prev => [
          ...prev,
          { id: "cw-rain", text: "Compact Travel Umbrella (Rainy weather alert)", checked: false, tag: "Weather" }
        ]);
      } else if (data.condition.includes("Sunny") && !checklist.some(c => c.text.includes("Sunscreen"))) {
        setChecklist(prev => [
          ...prev,
          { id: "cw-sun", text: "Sunscreen SPF 50 (Sunny weather alert)", checked: false, tag: "Weather" }
        ]);
      }
    }
  };

  // Handle Horizontal scroller buttons click
  const handleScroll = (cityName: string, direction: "left" | "right") => {
    const scrollerId = `${cityName.replace(/\s/g, "")}-scroller`;
    const container = document.getElementById(scrollerId);
    if (container) {
      const cardWidth = container.firstElementChild?.clientWidth || 300;
      container.scrollBy({
        left: direction === "left" ? -(cardWidth + 24) : (cardWidth + 24),
        behavior: "smooth"
      });
    }
  };

  // Dropdown list values
  const suggestedDestinations = [
    { name: "Amsterdam, Netherlands", desc: "For canal lovers", short: "Amsterdam" },
    { name: "Delhi, India", desc: "Heritage walks & rich culture", short: "Delhi" },
    { name: "Tokyo, Japan", desc: "Ryokans & tech hubs", short: "Tokyo" },
    { name: "Singapore", desc: "Modern architectural gardens", short: "Singapore" },
    { name: "London, United Kingdom", desc: "Victorian townhouses", short: "London" },
    { name: "New York, USA", desc: "Manhattan lofts", short: "New York" }
  ];

  // Helper counters (Multi-currency aware)
  const totalSpent = Math.round(
    expenses.reduce((sum, item) => {
      const converted = convertCurrency(item.amount, item.currency || "USD", displayCurrency);
      return sum + converted;
    }, 0)
  );
  const budgetTotal = Math.round(convertCurrency(baseBudgetLimit, "USD", displayCurrency));
  const percentSpent = Math.min(100, Math.round((totalSpent / budgetTotal) * 100));
  const remainingBudget = Math.max(0, budgetTotal - totalSpent);
  const checkedCount = checklist.filter(c => c.checked).length;
  const checklistPercent = checklist.length > 0 ? Math.round((checkedCount / checklist.length) * 100) : 0;

  // Active City Listings Grid Data (for single city view)
  const currentCityKey = selectedCity.replace(/\s/g, "");
  const currentCityListings: ListingCard[] = (cityListingsData as Record<string, ListingCard[]>)[currentCityKey] || cityListingsData["Amsterdam"] || [];

  return (
    <div style={{ backgroundColor: "var(--white)", color: "var(--hof)", minHeight: "100vh", position: "relative" }}>
      
      {/* HEADER NAVBAR */}
      <header style={{ borderBottom: "1px solid var(--deco)", position: "sticky", top: 0, zIndex: 100, backgroundColor: "var(--white)" }}>
        <div className="airbnb-container" style={{ height: "80px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} onClick={() => setHeaderTab("homes")}>
            <Compass size={32} style={{ color: "var(--rausch)" }} />
            <span style={{ fontFamily: "var(--font-cereal)", fontWeight: 700, fontSize: "22px", color: "var(--rausch)", letterSpacing: "-0.5px" }}>
              tourngineers
            </span>
          </div>

          {/* Categories Toggle - Homes and Planner are two different tabs */}
          <div style={{ display: "flex", gap: "24px", height: "100%", alignItems: "center" }}>
            <div
              className={`category-item ${headerTab === "homes" ? "active" : ""}`}
              onClick={() => setHeaderTab("homes")}
            >
              <HomeIcon size={18} />
              <span>Homes</span>
            </div>
            <div
              className={`category-item ${headerTab === "planner" ? "active" : ""}`}
              onClick={() => setHeaderTab("planner")}
            >
              <Compass size={18} />
              <span>Planner</span>
            </div>
          </div>

          {/* Right Header items */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontFamily: "var(--font-cereal)", fontSize: "14px", fontWeight: 600, color: "var(--hof)", cursor: "pointer" }} onClick={() => setHeaderTab("host")}>
              Host your home
            </span>
            <Globe size={16} style={{ color: "var(--hof)", cursor: "pointer" }} />
            
            {/* User Pill Button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                border: "1px solid var(--deco)",
                borderRadius: "var(--radius-pill)",
                padding: "6px 6px 6px 12px",
                cursor: "pointer",
                transition: "box-shadow 0.15s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <div style={{ width: "16px", height: "2px", backgroundColor: "var(--hof)" }}></div>
                <div style={{ width: "16px", height: "2px", backgroundColor: "var(--hof)" }}></div>
                <div style={{ width: "16px", height: "2px", backgroundColor: "var(--hof)" }}></div>
              </div>
              <div style={{ width: "28px", height: "28px", borderRadius: "var(--radius-full)", backgroundColor: "var(--rausch)", color: "var(--hof)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <User size={16} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE WRAPPER */}
      <div className="airbnb-container">

        {/* VIEW 1: HOMES (Tourgineers Stays Feed) */}
        {headerTab === "homes" && (
          <div>
            {/* HERO PILL SEARCH COMPONENT */}
            <section ref={containerRef} style={{ padding: "3rem 0 2rem", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
              
              <div className="search-pill-container">
                
                {/* Field 1: Where */}
                <div
                  className={`search-field-pill ${activeDropdown === "where" ? "active-focus" : ""}`}
                  onClick={() => setActiveDropdown("where")}
                >
                  <label>Where</label>
                  <input
                    type="text"
                    placeholder="Search destinations"
                    value={heroDest}
                    onChange={(e) => {
                      setHeroDest(e.target.value);
                      setDestInput(e.target.value);
                    }}
                    style={{ cursor: "text" }}
                  />
                </div>

                <div className="search-divider"></div>

                {/* Field 2: When (Dates) */}
                <div
                  className={`search-field-pill ${activeDropdown === "when" ? "active-focus" : ""}`}
                  onClick={() => setActiveDropdown("when")}
                >
                  <label>When</label>
                  <span style={{ fontSize: "14px", color: selectedDate ? "var(--hof)" : "var(--foggy)", paddingTop: "2px" }}>
                    {selectedDate ? `Starts July ${selectedDate}, 2026` : "Add dates"}
                  </span>
                </div>

                <div className="search-divider"></div>

                {/* Field 3: Who (Guests) */}
                <div
                  className={`search-field-pill ${activeDropdown === "who" ? "active-focus" : ""}`}
                  onClick={() => setActiveDropdown("who")}
                >
                  <label>Who</label>
                  <span style={{ fontSize: "14px", color: "var(--hof)", paddingTop: "2px", fontWeight: 500 }}>
                    {guestCount.adults + guestCount.children + guestCount.infants + guestCount.pets} Guests
                  </span>
                </div>

                {/* Red Submit Circle */}
                <button
                  onClick={() => {
                    setActiveDropdown(null);
                    // Match query with cities
                    const matched = suggestedDestinations.find(
                      d => heroDest.toLowerCase().includes(d.short.toLowerCase())
                    );
                    const finalCity = matched ? matched.short : "Amsterdam";
                    setSelectedCity(finalCity);
                    
                    const queryCity = heroDest || `${finalCity}, Travel`;
                    setDestInput(queryCity);
                    setWeatherCity(finalCity);
                    handleWeatherQuery(finalCity);
                    
                    // Switch view to planner
                    setHeaderTab("planner");

                    // Run AI timelines
                    handleGenerateItinerary(queryCity, heroDays);
                  }}
                  className="search-submit-btn"
                  style={{ borderRadius: "var(--radius-pill)", gap: "8px", height: "48px", width: "auto", padding: "0 24px" }}
                >
                  <Search size={16} />
                  <span>Search</span>
                </button>

                {/* DROPDOWN 1: WHERE MODAL */}
                {activeDropdown === "where" && (
                  <div className="search-dropdown-modal" style={{ left: "24px", width: "420px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--hof)", display: "block", marginBottom: "12px" }}>
                      Suggested destinations
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {suggestedDestinations.map((dest, i) => (
                        <div
                          key={i}
                          className="suggested-dest-item"
                          onClick={() => {
                            setHeroDest(dest.name);
                            setDestInput(dest.name);
                            setSelectedCity(dest.short);
                            setActiveDropdown("when"); // auto switch to calendar
                          }}
                        >
                          <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", backgroundColor: "var(--grey200)", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--foggy)", flexShrink: 0 }}>
                            <MapPin size={18} />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--hof)" }}>{dest.name}</span>
                            <span style={{ fontSize: "12px", color: "var(--foggy)" }}>{dest.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* DROPDOWN 2: WHEN CALENDAR MODAL */}
                {activeDropdown === "when" && (
                  <div className="search-dropdown-modal" style={{ left: "15%", right: "15%", width: "700px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    
                    {/* Header Switch */}
                    <div style={{ display: "flex", justifyContent: "center", gap: "16px", borderBottom: "1px solid var(--deco)", paddingBottom: "12px" }}>
                      <button style={{ border: "none", background: "var(--grey200)", color: "var(--hof)", padding: "8px 16px", borderRadius: "var(--radius-pill)", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                        Dates
                      </button>
                      <button style={{ border: "none", background: "transparent", color: "var(--foggy)", padding: "8px 16px", borderRadius: "var(--radius-pill)", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                        Flexible
                      </button>
                    </div>

                    {/* Calendar months side-by-side */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                      
                      {/* July 2026 */}
                      <div>
                        <h4 style={{ textAlign: "center", marginBottom: "12px" }}>July 2026</h4>
                        <div className="calendar-days-grid">
                          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                            <div key={i} className="calendar-day-header">{d}</div>
                          ))}
                          <div className="calendar-day-number empty"></div>
                          <div className="calendar-day-number empty"></div>
                          <div className="calendar-day-number empty"></div>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <div
                              key={day}
                              className={`calendar-day-number ${selectedDate === day ? "selected" : ""}`}
                              onClick={() => setSelectedDate(day)}
                            >
                              {day}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* August 2026 */}
                      <div>
                        <h4 style={{ textAlign: "center", marginBottom: "12px" }}>August 2026</h4>
                        <div className="calendar-days-grid">
                          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                            <div key={i} className="calendar-day-header">{d}</div>
                          ))}
                          <div className="calendar-day-number empty"></div>
                          <div className="calendar-day-number empty"></div>
                          <div className="calendar-day-number empty"></div>
                          <div className="calendar-day-number empty"></div>
                          <div className="calendar-day-number empty"></div>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <div
                              key={day}
                              className="calendar-day-number"
                              onClick={() => {}}
                            >
                              {day}
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Bottom exact filters */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", borderTop: "1px solid var(--deco)", paddingTop: "12px" }}>
                      {["Exact dates", "± 1 day", "± 2 days", "± 3 days", "± 7 days", "± 14 days"].map((f, i) => (
                        <button
                          key={i}
                          style={{
                            border: "1px solid var(--deco)",
                            background: i === 0 ? "var(--white)" : "transparent",
                            borderColor: i === 0 ? "var(--hof)" : "var(--deco)",
                            color: "var(--hof)",
                            borderRadius: "var(--radius-pill)",
                            padding: "6px 12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          {f}
                        </button>
                      ))}
                    </div>

                  </div>
                )}

                {/* DROPDOWN 3: WHO GUEST SELECTOR */}
                {activeDropdown === "who" && (
                  <div className="search-dropdown-modal" style={{ right: "24px", width: "380px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    
                    {/* Adults */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700 }}>Adults</span>
                        <span style={{ fontSize: "12px", color: "var(--foggy)" }}>Ages 13 or above</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button
                          type="button"
                          disabled={guestCount.adults <= 1}
                          onClick={() => setGuestCount(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                          style={{ width: "32px", height: "32px", borderRadius: "var(--radius-full)", border: "1px solid var(--bobo)", background: "transparent", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: "14px", fontWeight: 600, minWidth: "16px", textAlign: "center" }}>{guestCount.adults}</span>
                        <button
                          type="button"
                          onClick={() => setGuestCount(prev => ({ ...prev, adults: prev.adults + 1 }))}
                          style={{ width: "32px", height: "32px", borderRadius: "var(--radius-full)", border: "1px solid var(--bobo)", background: "transparent", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700 }}>Children</span>
                        <span style={{ fontSize: "12px", color: "var(--foggy)" }}>Ages 2–12</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button
                          type="button"
                          disabled={guestCount.children <= 0}
                          onClick={() => setGuestCount(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
                          style={{ width: "32px", height: "32px", borderRadius: "var(--radius-full)", border: "1px solid var(--bobo)", background: "transparent", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: "14px", fontWeight: 600, minWidth: "16px", textAlign: "center" }}>{guestCount.children}</span>
                        <button
                          type="button"
                          onClick={() => setGuestCount(prev => ({ ...prev, children: prev.children + 1 }))}
                          style={{ width: "32px", height: "32px", borderRadius: "var(--radius-full)", border: "1px solid var(--bobo)", background: "transparent", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Infants */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700 }}>Infants</span>
                        <span style={{ fontSize: "12px", color: "var(--foggy)" }}>Under 2</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button
                          type="button"
                          disabled={guestCount.infants <= 0}
                          onClick={() => setGuestCount(prev => ({ ...prev, infants: Math.max(0, prev.infants - 1) }))}
                          style={{ width: "32px", height: "32px", borderRadius: "var(--radius-full)", border: "1px solid var(--bobo)", background: "transparent", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: "14px", fontWeight: 600, minWidth: "16px", textAlign: "center" }}>{guestCount.infants}</span>
                        <button
                          type="button"
                          onClick={() => setGuestCount(prev => ({ ...prev, infants: prev.infants + 1 }))}
                          style={{ width: "32px", height: "32px", borderRadius: "var(--radius-full)", border: "1px solid var(--bobo)", background: "transparent", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Pets */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700 }}>Pets</span>
                        <span style={{ fontSize: "12px", color: "var(--foggy)", textDecoration: "underline", cursor: "pointer" }}>
                          Bringing a service animal?
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button
                          type="button"
                          disabled={guestCount.pets <= 0}
                          onClick={() => setGuestCount(prev => ({ ...prev, pets: Math.max(0, prev.pets - 1) }))}
                          style={{ width: "32px", height: "32px", borderRadius: "var(--radius-full)", border: "1px solid var(--bobo)", background: "transparent", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: "14px", fontWeight: 600, minWidth: "16px", textAlign: "center" }}>{guestCount.pets}</span>
                        <button
                          type="button"
                          onClick={() => setGuestCount(prev => ({ ...prev, pets: prev.pets + 1 }))}
                          style={{ width: "32px", height: "32px", borderRadius: "var(--radius-full)", border: "1px solid var(--bobo)", background: "transparent", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                  </div>
                )}

              </div>

            </section>

            {/* CITIES TABS SWITCHER (Tourgineers Filter bar style) */}
            <section style={{ padding: "1rem 0 2rem", borderBottom: "1px solid var(--deco)" }}>
              <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "8px", justifyContent: "center" }}>
                <button
                  onClick={() => setSelectedCity("All")}
                  style={{
                    background: selectedCity === "All" ? "var(--rausch)" : "var(--grey200)",
                    border: "none",
                    color: "var(--hof)",
                    borderRadius: "var(--radius-pill)",
                    padding: "10px 24px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: selectedCity === "All" ? "0 4px 12px rgba(255, 56, 92, 0.2)" : "none"
                  }}
                >
                  All Stays
                </button>
                {["Amsterdam", "Delhi", "Tokyo", "Singapore", "London", "New York"].map(city => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    style={{
                      background: selectedCity === city ? "var(--rausch)" : "var(--grey200)",
                      border: "none",
                      color: "var(--hof)",
                      borderRadius: "var(--radius-pill)",
                      padding: "10px 24px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      boxShadow: selectedCity === city ? "0 4px 12px rgba(255, 56, 92, 0.2)" : "none"
                    }}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </section>

            {/* LISTINGS DISPLAY SEGMENT */}
            {selectedCity === "All" ? (
              // 1. ALL STAYS VIEW: Row-based horizontal scroller for each of the 6 cities, 4 visible in line
              <div style={{ display: "flex", flexDirection: "column", gap: "48px", padding: "3rem 0" }}>
                {Object.entries(cityListingsData).map(([cityName, listings]) => {
                  const displayCityName = cityName === "NewYork" ? "New York" : cityName;
                  const scrollerId = `${cityName}-scroller`;
                  return (
                    <div key={cityName} style={{ position: "relative" }}>
                      
                      {/* Section header containing title and scroller buttons */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                        <h2 style={{ fontSize: "22px", fontWeight: 600, color: "var(--hof)" }}>Stays in {displayCityName}</h2>
                        
                        {/* scroller buttons */}
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleScroll(cityName, "left")}
                            style={{ width: "36px", height: "36px", borderRadius: "var(--radius-full)", border: "1px solid var(--deco)", background: "var(--white)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", color: "var(--hof)", transition: "all 0.15s" }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--hof)"}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--deco)"}
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <button
                            onClick={() => handleScroll(cityName, "right")}
                            style={{ width: "36px", height: "36px", borderRadius: "var(--radius-full)", border: "1px solid var(--deco)", background: "var(--white)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", color: "var(--hof)", transition: "all 0.15s" }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--hof)"}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--deco)"}
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Horizontal scroller showing all properties, showing 4 in a line on large screens */}
                      <div
                        id={scrollerId}
                        className="city-scroller"
                        style={{
                          display: "flex",
                          gap: "24px",
                          overflowX: "auto",
                          scrollBehavior: "smooth",
                          paddingBottom: "8px"
                        }}
                      >
                        {listings.map(card => (
                          <div
                            key={card.id}
                            className="airbnb-card"
                            style={{
                              padding: 0,
                              border: "none",
                              boxShadow: "none",
                              cursor: "pointer",
                              flex: "0 0 calc(25% - 18px)", // Displays exactly 4 in a line
                              minWidth: "280px"
                            }}
                            onClick={() => handleCardClick(card.title, displayCityName)}
                          >
                            <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: "var(--radius-card)", overflow: "hidden", backgroundColor: "var(--grey200)" }}>
                              <img src={card.imageUrl} alt={card.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              <div style={{ position: "absolute", top: "12px", left: "12px" }}>
                                <div className="guest-fav-badge">Guest favourite</div>
                              </div>
                              <button
                                onClick={(e) => toggleWishlist(card.id, e)}
                                style={{ position: "absolute", top: "12px", right: "12px", background: "transparent", border: "none", cursor: "pointer" }}
                              >
                                <Heart size={24} style={{ fill: wishlist[card.id] ? "var(--rausch)" : "transparent", stroke: wishlist[card.id] ? "var(--rausch)" : "var(--white)", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
                              </button>
                            </div>
                            <div style={{ padding: "12px 2px 0" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--hof)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80%" }}>
                                  {card.title}
                                </h3>
                                <span style={{ fontSize: "14px", color: "var(--hof)", fontWeight: 600 }}>★ {card.rating}</span>
                              </div>
                              <span style={{ fontSize: "13px", color: "var(--foggy)", display: "block", marginTop: "2px" }}>{card.type}</span>
                              <span style={{ fontSize: "14px", color: "var(--hof)", fontWeight: 700, display: "block", marginTop: "4px" }}>
                                {card.price} <span style={{ fontWeight: 400, color: "var(--foggy)", fontSize: "13px" }}>/ night</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              // 2. SINGLE CITY VIEW: Standard full grid view containing all 6 properties
              <section style={{ padding: "3rem 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "22px", fontWeight: 600 }}>Stays in {selectedCity}</h2>
                  <span style={{ fontSize: "14px", color: "var(--foggy)", fontWeight: 600 }}>6 verified properties found</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
                  {currentCityListings.map(card => (
                    <div
                      key={card.id}
                      className="airbnb-card"
                      style={{ padding: 0, border: "none", boxShadow: "none", cursor: "pointer" }}
                      onClick={() => handleCardClick(card.title, selectedCity)}
                    >
                      <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: "var(--radius-card)", overflow: "hidden", backgroundColor: "var(--grey200)" }}>
                        <img src={card.imageUrl} alt={card.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", top: "12px", left: "12px" }}>
                          <div className="guest-fav-badge">Guest favourite</div>
                        </div>
                        <button
                          onClick={(e) => toggleWishlist(card.id, e)}
                          style={{ position: "absolute", top: "12px", right: "12px", background: "transparent", border: "none", cursor: "pointer" }}
                        >
                          <Heart size={24} style={{ fill: wishlist[card.id] ? "var(--rausch)" : "transparent", stroke: wishlist[card.id] ? "var(--rausch)" : "var(--white)", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
                        </button>
                      </div>
                      <div style={{ padding: "12px 2px 0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--hof)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80%" }}>
                            {card.title}
                          </h3>
                          <span style={{ fontSize: "14px", color: "var(--hof)", fontWeight: 600 }}>★ {card.rating}</span>
                        </div>
                        <span style={{ fontSize: "13px", color: "var(--foggy)", display: "block", marginTop: "2px" }}>{card.type}</span>
                        <span style={{ fontSize: "14px", color: "var(--hof)", fontWeight: 700, display: "block", marginTop: "4px" }}>
                          {card.price} <span style={{ fontWeight: 400, color: "var(--foggy)", fontSize: "13px" }}>/ night</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}

        {/* VIEW 3: HOST (Host Admin Panel) */}
        {headerTab === "host" && (
          <div style={{ padding: "3rem 0 4rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", borderBottom: "1px solid var(--deco)", paddingBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <span style={{ color: "var(--rausch-dark)", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Host Console
                </span>
                <h1 style={{ fontSize: "32px", fontWeight: 700, marginTop: "6px" }}>Host your home</h1>
                <p style={{ color: "var(--foggy)", fontSize: "14px", marginTop: "4px" }}>
                  Fill all sections to publish your property listing. It will instantly show up when searched or filtered in the main feeds.
                </p>
              </div>
              <button
                onClick={() => setHeaderTab("homes")}
                className="airbnb-btn-secondary"
                style={{ border: "1px solid var(--deco)", borderRadius: "var(--radius-pill)", padding: "10px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer", background: "transparent" }}
              >
                ← Back to Stays Feed
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "40px", marginBottom: "48px" }}>
              
              {/* Left Column: List Home Form */}
              <div className="airbnb-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--hof)", marginBottom: "20px" }}>Create New Listing</h3>
                
                {hostError && (
                  <div style={{ padding: "12px 16px", background: "#fdf0f0", color: "#c0392b", borderRadius: "var(--radius-md)", fontSize: "13px", fontWeight: 600, marginBottom: "20px", border: "1px solid #f9d5d5" }}>
                    ⚠️ {hostError}
                  </div>
                )}
                
                {hostSuccess && (
                  <div style={{ padding: "12px 16px", background: "#f0fdf4", color: "#27ae60", borderRadius: "var(--radius-md)", fontSize: "13px", fontWeight: 600, marginBottom: "20px", border: "1px solid #d5f9e2" }}>
                    ✅ {hostSuccess}
                  </div>
                )}

                <form onSubmit={handleAddListing} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--hof)" }}>Listing Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Mid-Century Modern Apartment"
                      value={hostTitle}
                      onChange={(e) => setHostTitle(e.target.value)}
                      className="saas-input"
                      required
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--hof)" }}>City</label>
                      <select
                        value={hostCity}
                        onChange={(e) => setHostCity(e.target.value)}
                        className="saas-select"
                        required
                      >
                        <option value="Amsterdam">Amsterdam</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Tokyo">Tokyo</option>
                        <option value="Singapore">Singapore</option>
                        <option value="London">London</option>
                        <option value="New York">New York</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--hof)" }}>Home Type</label>
                      <select
                        value={hostType}
                        onChange={(e) => setHostType(e.target.value)}
                        className="saas-select"
                        required
                      >
                        <option value="Entire rental unit">Entire rental unit</option>
                        <option value="Entire loft">Entire loft</option>
                        <option value="Houseboat">Houseboat</option>
                        <option value="Entire studio">Entire studio</option>
                        <option value="Entire condo">Entire condo</option>
                        <option value="Private room in home">Private room in home</option>
                        <option value="Entire bungalow">Entire bungalow</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--hof)" }}>Price per night (INR)</label>
                    <input
                      type="number"
                      placeholder="e.g. 7500"
                      value={hostPrice}
                      onChange={(e) => setHostPrice(e.target.value)}
                      className="saas-input"
                      required
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--hof)" }}>Cover Photo URL</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={hostImageUrl}
                      onChange={(e) => setHostImageUrl(e.target.value)}
                      className="saas-input"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="airbnb-btn-primary"
                    style={{ width: "100%", justifyContent: "center", padding: "14px", marginTop: "10px" }}
                  >
                    Publish Listing
                  </button>
                </form>
              </div>

              {/* Right Column: Live Preview & Image Presets */}
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                
                {/* Live Card Preview */}
                <div className="airbnb-card" style={{ padding: "24px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--hof)", marginBottom: "16px" }}>Live Listing Preview</h3>
                  
                  <div style={{ width: "100%", maxWidth: "300px", margin: "0 auto" }}>
                    <div style={{ width: "100%", aspectRatio: "20/19", borderRadius: "var(--radius-xl)", overflow: "hidden", position: "relative", background: "var(--grey200)", border: "1px solid var(--deco)" }}>
                      {hostImageUrl ? (
                        <img src={hostImageUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%", color: "var(--bobo)" }}>
                          <HomeIcon size={40} />
                        </div>
                      )}
                      <div style={{ position: "absolute", top: "12px", left: "12px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, background: "var(--white)", padding: "4px 8px", borderRadius: "var(--radius-pill)", textTransform: "uppercase", color: "var(--hof)", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                          Preview
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 600, color: "var(--hof)", gap: "8px" }}>
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {hostTitle || "Your Home Listing Title"}
                        </span>
                        <span style={{ flexShrink: 0 }}>★ 5.00</span>
                      </div>
                      <span style={{ fontSize: "13px", color: "var(--foggy)", display: "block", marginTop: "2px" }}>
                        {hostType} • {hostCity}
                      </span>
                      <span style={{ fontSize: "14px", color: "var(--hof)", fontWeight: 700, display: "block", marginTop: "4px" }}>
                        ₹{hostPrice ? parseInt(hostPrice).toLocaleString() : "0"} <span style={{ fontWeight: 400, color: "var(--foggy)", fontSize: "13px" }}>/ night</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cover Image Preset Library */}
                <div className="airbnb-card" style={{ padding: "24px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--hof)", marginBottom: "12px" }}>Unsplash HD Presets</h3>
                  <p style={{ fontSize: "12px", color: "var(--foggy)", marginBottom: "16px" }}>Click any template photo to auto-fill the URL for testing.</p>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                    {[
                      { name: "Scandi Loft", url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80" },
                      { name: "Urban Brick", url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80" },
                      { name: "Luxury Bed", url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80" },
                      { name: "Cozy Studio", url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80" },
                      { name: "Modern Suite", url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80" },
                      { name: "Ryokan Zen", url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80" }
                    ].map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => setHostImageUrl(preset.url)}
                        style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: "4px" }}
                      >
                        <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: "var(--radius-md)", overflow: "hidden", border: hostImageUrl === preset.url ? "2px solid var(--rausch-dark)" : "1px solid var(--deco)" }}>
                          <img src={preset.url} alt={preset.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <span style={{ fontSize: "10px", textAlign: "center", color: "var(--foggy)" }}>{preset.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Listings Grid */}
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--hof)", marginBottom: "20px" }}>Your Listed Properties</h3>
              {customListings.length === 0 ? (
                <div style={{ padding: "40px", background: "var(--grey200)", border: "1px dashed var(--deco)", borderRadius: "var(--radius-xl)", textAlign: "center", color: "var(--foggy)" }}>
                  <HomeIcon size={32} style={{ marginBottom: "12px", color: "var(--bobo)", display: "inline-block" }} />
                  <p style={{ fontSize: "14px" }}>No listed properties yet. Use the form above to add your first stay.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "24px" }}>
                  {customListings.map(listing => (
                    <div key={listing.id} className="airbnb-card" style={{ padding: "16px" }}>
                      <div style={{ width: "100%", aspectRatio: "20/19", borderRadius: "var(--radius-xl)", overflow: "hidden", position: "relative" }}>
                        <img src={listing.imageUrl} alt={listing.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ marginTop: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 600, color: "var(--hof)", gap: "8px" }}>
                          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{listing.title}</span>
                          <span>★ {listing.rating}</span>
                        </div>
                        <span style={{ fontSize: "13px", color: "var(--foggy)", display: "block", marginTop: "2px" }}>{listing.type} • {listing.city}</span>
                        <span style={{ fontSize: "14px", color: "var(--hof)", fontWeight: 700, display: "block", marginTop: "4px" }}>{listing.price} <span style={{ fontWeight: 400, color: "var(--foggy)", fontSize: "13px" }}>/ night</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* VIEW 2: PLANNER (Tourngineers Collaborative Workspace Workspace Console) */}
        {headerTab === "planner" && (
          <section style={{ padding: "3rem 0 4rem" }}>
            
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <span style={{ color: "var(--rausch)", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Active Workspace
              </span>
              <h2 style={{ fontSize: "28px", fontWeight: 700, margin: "8px 0" }}>Collaborative Planning Console</h2>
              <p style={{ color: "var(--foggy)", fontSize: "14px", maxWidth: "520px", margin: "0 auto 12px" }}>
                Manage your itinerary, coordinate shared budgets, retrieve weather recommendations, and live chat with friends.
              </p>
              <button
                onClick={() => setHeaderTab("homes")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--rausch)",
                  fontFamily: "var(--font-cereal)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "underline"
                }}
              >
                ← Back to Homes Search
              </button>
            </div>

            <div className="browser-saas-airbnb">
              {/* Header bar */}
              <div className="browser-header-saas">
                <div className="browser-dots">
                  <div className="browser-dot"></div>
                  <div className="browser-dot"></div>
                  <div className="browser-dot"></div>
                </div>
                <div className="browser-url-bar">
                  <Globe size={13} style={{ color: "var(--bobo)" }} />
                  <span>tourngineers.app/workspace-collab</span>
                </div>
                <div style={{ width: "32px" }}></div>
              </div>

              {/* Main Workspace Body */}
              <div className="browser-body-saas">
                
                {/* Sidebar Tabs */}
                <div className="browser-sidebar-saas">
                  <button
                    className={`sidebar-btn-saas ${activeTab === "ai-planner" ? "active" : ""}`}
                    onClick={() => setActiveTab("ai-planner")}
                  >
                    <Sparkles size={16} />
                    <span>AI Timeline</span>
                  </button>
                  <button
                    className={`sidebar-btn-saas ${activeTab === "budget" ? "active" : ""}`}
                    onClick={() => setActiveTab("budget")}
                  >
                    <DollarSign size={16} />
                    <span>Expenses Split</span>
                  </button>
                  <button
                    className={`sidebar-btn-saas ${activeTab === "checklist" ? "active" : ""}`}
                    onClick={() => setActiveTab("checklist")}
                  >
                    <CheckSquare size={16} />
                    <span>Weather Packing</span>
                  </button>
                  <button
                    className={`sidebar-btn-saas ${activeTab === "friends" ? "active" : ""}`}
                    onClick={() => setActiveTab("friends")}
                  >
                    <Users size={16} />
                    <span>Multiplayer Chat</span>
                  </button>
                </div>

                {/* Console Workspace Display */}
                <div className="browser-content-saas">
                  
                  {/* AI PLANNER TAB */}
                  {activeTab === "ai-planner" && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <h3 style={{ fontSize: "18px", color: "var(--hof)", marginBottom: "4px" }}>AI Itinerary Structurer</h3>
                          <p style={{ fontSize: "13px", color: "var(--foggy)", marginBottom: "4px" }}>Active Destination: <strong style={{ color: "var(--rausch)" }}>{destInput}</strong></p>
                        </div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--grey200)", color: "var(--rausch)", padding: "6px 12px", borderRadius: "var(--radius-pill)", fontSize: "11px", fontWeight: 700 }}>
                          <Sparkles size={11} /> Ready
                        </div>
                      </div>

                      <form onSubmit={(e) => { e.preventDefault(); handleGenerateItinerary(); }} style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: "180px" }}>
                          <input
                            type="text"
                            value={destInput}
                            onChange={(e) => setDestInput(e.target.value)}
                            className="saas-input"
                            placeholder="e.g. Rome, Italy"
                            style={{ width: "100%" }}
                          />
                        </div>
                        <div style={{ width: "120px" }}>
                          <select
                            value={daysInput}
                            onChange={(e) => setDaysInput(e.target.value)}
                            className="saas-select"
                            style={{ width: "100%" }}
                          >
                            <option value="1">1 Day</option>
                            <option value="2">2 Days</option>
                            <option value="3">3 Days</option>
                            <option value="4">4 Days</option>
                            <option value="5">5 Days</option>
                          </select>
                        </div>
                        <button
                          type="submit"
                          disabled={isGenerating}
                          className="airbnb-btn-primary"
                        >
                          {isGenerating ? "Processing..." : "Generate Plan"}
                        </button>
                      </form>

                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {Object.entries(generatedItinerary).map(([day, items]) => (
                          <div key={day} className="timeline-item">
                            <div className="timeline-dot"></div>
                            <h4 style={{ color: "var(--rausch)", fontSize: "14px", marginBottom: "16px", fontWeight: 700 }}>{day}</h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                              {items.map((item, idx) => (
                                <div key={idx} className="airbnb-card" style={{ padding: "16px", background: "var(--white)" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px" }}>
                                    <span style={{ color: "var(--rausch)", fontWeight: 700 }}>{item.time}</span>
                                    <span style={{ color: "var(--foggy)" }}>📍 {item.location}</span>
                                  </div>
                                  <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--hof)", marginBottom: "4px" }}>{item.activity}</div>
                                  <div style={{ fontSize: "12px", color: "var(--foggy)" }}>💡 {item.notes}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BUDGET TAB */}
                  {activeTab === "budget" && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
                        <div>
                          <h3 style={{ fontSize: "18px", color: "var(--hof)", marginBottom: "4px" }}>Split Expenses Console</h3>
                          <p style={{ fontSize: "13px", color: "var(--foggy)" }}>Divide shared lodging, flights, and meals equally.</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                          {/* Currency Switcher */}
                          <div style={{ display: "flex", gap: "4px", background: "var(--grey200)", padding: "4px", borderRadius: "var(--radius-pill)", border: "1px solid var(--deco)" }}>
                            {(["USD", "INR", "EUR"] as const).map(curr => (
                              <button
                                key={curr}
                                onClick={() => setDisplayCurrency(curr)}
                                style={{
                                  background: displayCurrency === curr ? "var(--white)" : "transparent",
                                  border: "none",
                                  color: "var(--hof)",
                                  fontWeight: displayCurrency === curr ? 700 : 500,
                                  padding: "6px 12px",
                                  borderRadius: "var(--radius-pill)",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  boxShadow: displayCurrency === curr ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                                  transition: "all 0.15s"
                                }}
                              >
                                {currencySymbols[curr]} {curr}
                              </button>
                            ))}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--foggy)", fontWeight: 700 }}>
                            <span>LIMIT: {currencySymbols[displayCurrency]}</span>
                            <input
                              type="number"
                              value={budgetTotal || ""}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                const valNum = isNaN(val) ? 0 : val;
                                const valInUsd = convertCurrency(valNum, displayCurrency, "USD");
                                setBaseBudgetLimit(valInUsd);
                              }}
                              style={{
                                width: "65px",
                                background: "transparent",
                                border: "none",
                                borderBottom: "1px dashed var(--bobo)",
                                color: "var(--hof)",
                                fontWeight: 700,
                                fontSize: "12px",
                                outline: "none",
                                padding: "2px 4px",
                                textAlign: "left"
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
                        <div className="airbnb-card" style={{ padding: "20px" }}>
                          <span style={{ fontSize: "11px", color: "var(--foggy)", fontWeight: 700, textTransform: "uppercase" }}>TOTAL SPENT</span>
                          <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--hof)", margin: "4px 0" }}>
                            {currencySymbols[displayCurrency]}{totalSpent}
                          </div>
                          <div style={{ width: "100%", height: "6px", backgroundColor: "var(--grey200)", borderRadius: "var(--radius-pill)", overflow: "hidden", margin: "8px 0" }}>
                            <div style={{ width: `${percentSpent}%`, height: "100%", backgroundColor: "var(--rausch)" }}></div>
                          </div>
                          <span style={{ fontSize: "12px", color: "var(--foggy)" }}>{percentSpent}% of active budget limit.</span>
                        </div>
                        <div className="airbnb-card" style={{ padding: "20px" }}>
                          <span style={{ fontSize: "11px", color: "var(--foggy)", fontWeight: 700, textTransform: "uppercase" }}>REMAINING</span>
                          <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--hof)", margin: "4px 0" }}>
                            {currencySymbols[displayCurrency]}{remainingBudget}
                          </div>
                          <span style={{ fontSize: "12px", color: "var(--foggy)" }}>
                            Equal split: <strong style={{ color: "var(--hof)" }}>{currencySymbols[displayCurrency]}{Math.round(totalSpent / 3)}</strong> per person.
                          </span>
                        </div>
                      </div>

                      <form onSubmit={handleAddExpense} style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                        <input
                          type="text"
                          placeholder="Expense item (e.g. Train ticket)"
                          value={expDescription}
                          onChange={(e) => setExpDescription(e.target.value)}
                          className="saas-input"
                          style={{ flex: 1, minWidth: "150px" }}
                        />
                        <div style={{ display: "flex", gap: "6px" }}>
                          <input
                            type="number"
                            placeholder="Amount"
                            value={expAmount}
                            onChange={(e) => setExpAmount(e.target.value)}
                            className="saas-input"
                            style={{ width: "100px" }}
                          />
                          <select
                            value={expCurrency}
                            onChange={(e) => setExpCurrency(e.target.value as any)}
                            className="saas-select"
                            style={{ width: "85px" }}
                          >
                            <option value="USD">USD ($)</option>
                            <option value="INR">INR (₹)</option>
                            <option value="EUR">EUR (€)</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          placeholder="Paid by (e.g. Alex)"
                          value={expPaidBy}
                          onChange={(e) => setExpPaidBy(e.target.value)}
                          className="saas-input"
                          style={{ width: "150px" }}
                          required
                        />
                        <button type="submit" className="airbnb-btn-primary">Add</button>
                      </form>

                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {expenses.map(expense => {
                          const origSymbol = currencySymbols[expense.currency || "USD"];
                          const dispSymbol = currencySymbols[displayCurrency];
                          const convertedVal = Math.round(convertCurrency(expense.amount, expense.currency || "USD", displayCurrency));
                          const hasDiffCurrency = (expense.currency || "USD") !== displayCurrency;

                          return (
                            <div key={expense.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", background: "var(--white)", border: "1px solid var(--deco)", borderRadius: "var(--radius-md)" }}>
                              <div>
                                <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--hof)" }}>{expense.description}</span>
                                <span style={{ marginLeft: "12px", fontSize: "11px", background: "var(--grey200)", padding: "2px 8px", borderRadius: "var(--radius-sm)", color: "var(--foggy)", fontWeight: 600 }}>
                                  Paid by {expense.paidBy}
                                </span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{ textAlign: "right" }}>
                                  <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--hof)" }}>
                                    {dispSymbol}{convertedVal}
                                  </div>
                                  {hasDiffCurrency && (
                                    <div style={{ fontSize: "11px", color: "var(--foggy)" }}>
                                      Original: {origSymbol}{expense.amount}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleDeleteExpense(expense.id)}
                                  style={{ background: "transparent", border: "none", color: "var(--rausch-dark)", cursor: "pointer", display: "flex" }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* CHECKLIST TAB */}
                  {activeTab === "checklist" && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                          <h3 style={{ fontSize: "18px", color: "var(--hof)", marginBottom: "4px" }}>Weather Packing Advisor</h3>
                          <p style={{ fontSize: "13px", color: "var(--foggy)" }}>Retrieve active recommendations matching city temperatures.</p>
                        </div>
                        
                        {/* Weather Indicator */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--white)", border: "1px solid var(--deco)", padding: "8px 16px", borderRadius: "var(--radius-pill)" }}>
                          <CloudSun size={18} style={{ color: "var(--rausch)" }} />
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--hof)" }}>{weatherCity} ({weatherData.temp}°C, {weatherData.condition})</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
                        {["Amsterdam", "Delhi", "Tokyo", "Singapore", "London", "New York"].map(city => (
                          <button
                            key={city}
                            onClick={() => handleWeatherQuery(city)}
                            style={{
                              background: weatherCity.includes(city) ? "var(--rausch)" : "transparent",
                              border: "1px solid",
                              borderColor: weatherCity.includes(city) ? "var(--rausch)" : "var(--bobo)",
                              borderRadius: "var(--radius-pill)",
                              padding: "8px 16px",
                              color: "var(--hof)",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                          >
                            {city}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--foggy)", marginBottom: "6px" }}>
                        <span>Packed Progress</span>
                        <span style={{ fontWeight: 600 }}>{checkedCount} / {checklist.length} items ({checklistPercent}%)</span>
                      </div>
                      <div style={{ width: "100%", height: "6px", backgroundColor: "var(--grey200)", borderRadius: "var(--radius-pill)", overflow: "hidden", marginBottom: "24px" }}>
                        <div style={{ width: `${checklistPercent}%`, height: "100%", backgroundColor: "var(--rausch)" }}></div>
                      </div>

                      <form onSubmit={handleAddChecklistItem} style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                        <input
                          type="text"
                          placeholder="Add custom packing item..."
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          className="saas-input"
                          style={{ flex: 1 }}
                        />
                        <button type="submit" className="airbnb-btn-primary">Add</button>
                      </form>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
                        {checklist.map(item => (
                          <div
                            key={item.id}
                            onClick={() => toggleChecklist(item.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "14px",
                              background: "var(--white)",
                              border: "1px solid var(--deco)",
                              borderRadius: "var(--radius-md)",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              opacity: item.checked ? 0.6 : 1
                            }}
                          >
                            <div className={`custom-checkbox ${item.checked ? "checked" : ""}`}>
                              {item.checked && <Check size={12} style={{ color: "var(--white)" }} />}
                            </div>
                            <span style={{ fontSize: "14px", textDecoration: item.checked ? "line-through" : "none", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--hof)" }}>
                              {item.text}
                            </span>
                            <span style={{ fontSize: "10px", background: "var(--grey200)", padding: "2px 6px", borderRadius: "var(--radius-sm)", color: "var(--foggy)", fontWeight: 700 }}>
                              {item.tag}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FRIENDS CHAT TAB */}
                  {activeTab === "friends" && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                        <div>
                          <h3 style={{ fontSize: "18px", color: "var(--hof)", marginBottom: "4px" }}>Multiplayer Live Chat</h3>
                          <p style={{ fontSize: "13px", color: "var(--foggy)" }}>Log activities and communicate synchronizations.</p>
                        </div>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "12px", color: "var(--rausch)", fontWeight: 700 }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", backgroundColor: "var(--rausch)" }}></span>
                          Connected
                        </div>
                      </div>

                      <div style={{ background: "var(--white)", border: "1px solid var(--deco)", padding: "16px", borderRadius: "var(--radius-md)", height: "260px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                        {chatMessages.map(msg => (
                          <div key={msg.id} style={{ display: "flex", gap: "10px", fontSize: "14px" }}>
                            <span style={{ fontSize: "18px" }}>{msg.avatar}</span>
                            <div>
                              <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
                                <span style={{ fontWeight: 700, color: "var(--hof)" }}>{msg.user}</span>
                                <span style={{ fontSize: "11px", color: "var(--foggy)" }}>{msg.time}</span>
                              </div>
                              <p style={{ color: "var(--foggy)", marginTop: "2px" }}>{msg.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleSendChatMessage} style={{ display: "flex", gap: "12px" }}>
                        <input
                          type="text"
                          placeholder="Type message to sync..."
                          value={newMsgText}
                          onChange={(e) => setNewMsgText(e.target.value)}
                          className="saas-input"
                          style={{ flex: 1 }}
                        />
                        <button type="submit" className="airbnb-btn-primary" style={{ padding: "0 16px" }}>
                          <Send size={16} />
                        </button>
                      </form>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </section>
        )}

      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--deco)", background: "var(--grey200)", padding: "4rem 0 3rem" }}>
        <div className="airbnb-container" style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "40px" }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <Compass size={24} style={{ color: "var(--rausch)" }} />
                <span style={{ fontFamily: "var(--font-cereal)", fontWeight: 700, fontSize: "16px", color: "var(--hof)" }}>
                  Tourngineers
                </span>
              </div>
              <p style={{ color: "var(--foggy)", fontSize: "14px", maxWidth: "280px", lineHeight: "20px" }}>
                The collaborative AI-driven planner engineered for seamless travel with friends.
              </p>
            </div>

            {/* Links */}
            <div style={{ display: "flex", gap: "64px", flexWrap: "wrap" }}>
              <div>
                <h4 style={{ fontSize: "12px", color: "var(--hof)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>Product</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                  <span style={{ color: "var(--foggy)", cursor: "pointer" }} onClick={() => setHeaderTab("homes")}>Homes Feed</span>
                  <span style={{ color: "var(--foggy)", cursor: "pointer" }} onClick={() => setHeaderTab("planner")}>Console Workspace</span>
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: "12px", color: "var(--hof)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>Engineering</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                  <a href="https://github.com/anshul-ab17/Tourgineers/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--foggy)", textDecoration: "none" }}>GitHub</a>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--deco)", paddingTop: "24px", fontSize: "14px", color: "var(--foggy)", flexWrap: "wrap", gap: "12px" }}>
            <span>© 2026 Tourngineers. All rights reserved.</span>
            <div style={{ display: "flex", gap: "24px" }}>
              <a href="https://x.com/anshul_ab17" target="_blank" rel="noopener noreferrer" style={{ color: "var(--foggy)", textDecoration: "none" }}>Twitter</a>
              <a href="https://www.linkedin.com/in/anshul-bt17/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--foggy)", textDecoration: "none" }}>LinkedIn</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
