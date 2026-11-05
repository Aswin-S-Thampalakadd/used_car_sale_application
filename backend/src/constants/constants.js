const usersTypess = {
  ADMIN: {
    name: "ADMIN",
  },
  CUSTOMER: {
    name: "CUSTOMER",
  },
  DEALER: {
    name: "DEALER",
  },
  OPERATOR: {
    name: "OPERATOR",
  },
};

const dummyUsers = {
  ADMIN: {
    name: "Admin",
    email: "admin@gmail.com",
    
    phone: "9000000001",
    password: "111111",
  },

  CUSTOMER: {
    name: "Customer",
    email: "customer@gmail.com",
    phone: "9000000002",
    password: "111111",
  },

  DEALER: {
    name: "Dealer",
    email: "dealer@gmail.com",
    phone: "9000000003",
    password: "111111",
  },

  OPERATOR: {
    name: "Operator",
    email: "operator@gmail.com",
    phone: "9000000004",
    password: "111111",
  },
};

const dummyDealer = {
  dealershipName: "Aswin Motors",
  description:
    "Trusted pre-owned car dealership offering quality inspected vehicles.",
  logo: "https://example.com/logos/aswin-motors.png",
  address: "MG Road, Kochi",
  city: "Kochi",
  state: "Kerala",
  country: "India",
  pincode: "682016",
  latitude: "9.931233",
  longitude: "76.267303",
  gstNumber: "32ABCDE1234F1Z5",
  isVerified: true,
};

const carFeatures = [
  "Air Conditioning",
  "Power Steering",
  "Power Windows",
  "Central Locking",
  "Airbags",
  "ABS",
  "Rear Parking Camera",
  "Parking Sensors",
  "Bluetooth",
  "Apple CarPlay",
  "Android Auto",
  "Cruise Control",
  "Sunroof",
  "Alloy Wheels",
  "Keyless Entry",
  "Push Button Start",
];

const dummyCars = [];

export { usersTypess, dummyUsers, dummyDealer, carFeatures, dummyCars };
