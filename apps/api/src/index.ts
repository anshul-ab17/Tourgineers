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

// In-Memory Database with city-specific and currency-aware expenses
let expenses: Expense[] = [
  // Amsterdam Stays Expenses
  { id: "1", city: "Amsterdam", description: "Anne Frank House tickets", amount: 48, currency: "EUR", paidBy: "Alex" },
  { id: "2", city: "Amsterdam", description: "Jordaan Boutique Loft booking", amount: 590, currency: "EUR", paidBy: "Emily" },
  { id: "3", city: "Amsterdam", description: "Van Gogh Museum Group Pass", amount: 65, currency: "EUR", paidBy: "Sophia" },
  { id: "4", city: "Amsterdam", description: "Damrak Candlelight Canal cruise", amount: 110, currency: "EUR", paidBy: "Alex" },
  
  // Delhi Stays Expenses
  { id: "5", city: "Delhi", description: "Heritage Haveli stay deposit", amount: 4500, currency: "INR", paidBy: "Alex" },
  { id: "6", city: "Delhi", description: "Connaught Place Dinner", amount: 2800, currency: "INR", paidBy: "Sophia" },
  
  // Tokyo Stays Expenses
  { id: "7", city: "Tokyo", description: "Asakusa Tatami Ryokan Reservation", amount: 120, currency: "USD", paidBy: "Emily" },
  { id: "8", city: "Tokyo", description: "Shibuya Sky view tickets", amount: 45, currency: "USD", paidBy: "Alex" },
  
  // Singapore Expenses
  { id: "9", city: "Singapore", description: "Marina Bay Entrance tickets", amount: 90, currency: "USD", paidBy: "Emily" },
  
  // London Expenses
  { id: "10", city: "London", description: "Kensington High tea room", amount: 75, currency: "EUR", paidBy: "Sophia" },
  
  // New York Expenses
  { id: "11", city: "New York", description: "Broadway show tickets", amount: 180, currency: "USD", paidBy: "Alex" }
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

// 2. CHECKLIST CRUD
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

// 3. MESSAGES CRUD
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

// 4. ITINERARY CRUD
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
