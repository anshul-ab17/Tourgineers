import express from "express";
import cors from "cors";

const app = express();
const PORT = 3008;

app.use(cors());
app.use(express.json());

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
  city: string;
  title: string;
  type: string;
  price: string;
  rating: string;
  imageUrl: string;
  isFav: boolean;
}

// In-Memory Database with EMPTY seed expenses (no seeds!)
let expenses: Expense[] = [];

// Dynamic listings created by the hosts (initially empty)
let customListings: ListingCard[] = [];

interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
}

let users: User[] = [
  { id: "u1", name: "Anshul", email: "anshul@test.com", password: "password123" }
];

let checklist = [
  { id: "c1", text: "Passports & Schengen Travel Visa", checked: true, tag: "Essential" },
  { id: "c2", text: "Universal Plug Adapter (Type C/F)", checked: true, tag: "Tech" },
  { id: "c3", text: "Comfortable Sneakers (for cobblestone walks)", checked: true, tag: "Gear" },
  { id: "c4", text: "Light Windbreaker / Raincoat", checked: false, tag: "Essential" },
  { id: "c5", text: "Compact travel umbrella (Cloudy weather alert)", checked: false, tag: "Weather" },
  { id: "c6", text: "Public transport OV-Chipkaart", checked: false, tag: "Gear" }
];

let chatMessages = [
  { id: "m1", user: "Alex", text: "Booked the Canal Loft in Jordaan. The location is perfect!", time: "11:12 AM", avatar: "👤" },
  { id: "m2", user: "Sophia", text: "Perfect! I added the Van Gogh Museum group pass to the expenses split.", time: "11:15 AM", avatar: "👩‍🎨" },
  { id: "m3", user: "Emily", text: "Agreed. Let's make sure the Canal Cruise booking details are finalized today.", time: "11:22 AM", avatar: "👩‍💻" }
];

let currentItineraries: Record<string, any> = {
  "Amsterdam, Netherlands": {
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
  }
};

// --- CRUD API ENDPOINTS ---

// 0. AUTHENTICATION ENDPOINTS
app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }
  const emailLower = email.toLowerCase().trim();
  if (users.find(u => u.email === emailLower)) {
    return res.status(400).json({ error: "Email is already registered" });
  }
  const newUser = { id: Date.now().toString(), name, email: emailLower, password };
  users.push(newUser);
  res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const emailLower = email.toLowerCase().trim();
  const user = users.find(u => u.email === emailLower && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  res.json({ id: user.id, name: user.name, email: user.email });
});

// 1. EXPENSES CRUD (Supports filtering by city)
app.get("/api/expenses", (req, res) => {
  const { city } = req.query;
  if (city) {
    const searchCity = city.toString().toLowerCase();
    const filtered = expenses.filter(e => e.city.toLowerCase().includes(searchCity));
    return res.json(filtered);
  }
  res.json(expenses);
});

app.post("/api/expenses", (req, res) => {
  const { city, description, amount, currency, paidBy } = req.body;
  if (!city || !description || !amount || !currency || !paidBy) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const newExpense: Expense = {
    id: Date.now().toString(),
    city,
    description,
    amount: parseFloat(amount),
    currency,
    paidBy
  };
  expenses.push(newExpense);
  res.status(201).json(newExpense);
});

app.delete("/api/expenses/:id", (req, res) => {
  const { id } = req.params;
  expenses = expenses.filter(e => e.id !== id);
  res.json({ message: "Expense deleted successfully", id });
});

// 2. LISTINGS CRUD
app.get("/api/listings", (req, res) => {
  res.json(customListings);
});

app.post("/api/listings", (req, res) => {
  const { city, title, type, price, rating, imageUrl } = req.body;
  
  // Validation: Check if all fields are filled
  if (!city || !title || !type || !price || !imageUrl) {
    return res.status(400).json({ error: "All listing sections must be filled!" });
  }

  const newListing: ListingCard = {
    id: `custom-${Date.now()}`,
    city,
    title,
    type,
    price,
    rating: rating || "5.00",
    imageUrl,
    isFav: false
  };

  customListings.push(newListing);
  res.status(201).json(newListing);
});

app.delete("/api/listings/:id", (req, res) => {
  const { id } = req.params;
  customListings = customListings.filter(l => l.id !== id);
  res.json({ message: "Listing deleted successfully", id });
});

// 3. CHECKLIST CRUD
app.get("/api/checklist", (req, res) => {
  res.json(checklist);
});

app.post("/api/checklist", (req, res) => {
  const { text, tag } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text field is required" });
  }
  const newItem = {
    id: Date.now().toString(),
    text,
    checked: false,
    tag: tag || "Custom"
  };
  checklist.push(newItem);
  res.status(201).json(newItem);
});

app.put("/api/checklist/:id", (req, res) => {
  const { id } = req.params;
  const { checked } = req.body;
  
  let updatedItem = null;
  checklist = checklist.map(item => {
    if (item.id === id) {
      updatedItem = { ...item, checked: !!checked };
      return updatedItem;
    }
    return item;
  });

  if (!updatedItem) {
    return res.status(404).json({ error: "Item not found" });
  }
  res.json(updatedItem);
});

app.delete("/api/checklist/:id", (req, res) => {
  const { id } = req.params;
  checklist = checklist.filter(item => item.id !== id);
  res.json({ message: "Item deleted successfully", id });
});

// 4. MESSAGES CRUD
app.get("/api/messages", (req, res) => {
  res.json(chatMessages);
});

app.post("/api/messages", (req, res) => {
  const { user, text, avatar } = req.body;
  if (!user || !text) {
    return res.status(400).json({ error: "User and text are required" });
  }
  const newMsg = {
    id: Date.now().toString(),
    user,
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    avatar: avatar || "👤"
  };
  chatMessages.push(newMsg);
  res.status(201).json(newMsg);
});

// 5. ITINERARY CRUD
app.get("/api/itinerary", (req, res) => {
  const { destination } = req.query;
  if (destination) {
    const key = destination.toString();
    if (currentItineraries[key]) {
      return res.json(currentItineraries[key]);
    }
  }
  res.json(currentItineraries["Amsterdam, Netherlands"]);
});

app.post("/api/itinerary", (req, res) => {
  const { destination, itinerary } = req.body;
  if (!destination || !itinerary) {
    return res.status(400).json({ error: "Destination and itinerary are required" });
  }
  currentItineraries[destination] = itinerary;
  res.status(201).json({ message: "Itinerary saved successfully", destination });
});

app.listen(PORT, () => {
  console.log(`Backend Express server running at http://localhost:${PORT}`);
});
