import React, {
  createContext,
  useState,
  useEffect,
  useCallback
} from "react";
export const CarContext = createContext();

const initialCars = [
  { id: 1, name: "Maruti Suzuki Swift", pricePerDay: 1500, fuel: "Petrol", purpose: "City", mileage: 22, image: "🚗", availability: true },
  { id: 2, name: "Hyundai i20", pricePerDay: 1800, fuel: "Petrol", purpose: "City", mileage: 20, image: "🚘", availability: true },
  { id: 3, name: "Hyundai Creta", pricePerDay: 2500, fuel: "Diesel", purpose: "Family", mileage: 18, image: "🚙", availability: true },
  { id: 4, name: "Toyota Fortuner", pricePerDay: 4500, fuel: "Diesel", purpose: "Off-road", mileage: 12, image: "🏔️", availability: true },
  { id: 5, name: "Tata Nexon EV", pricePerDay: 2800, fuel: "Electric", purpose: "City", mileage: 300, image: "⚡", availability: true },
  { id: 6, name: "Tata Tiago", pricePerDay: 1200, fuel: "Petrol", purpose: "City", mileage: 23, image: "🚗", availability: true },
  { id: 7, name: "Tesla Model 3", pricePerDay: 8000, fuel: "Electric", purpose: "Long Drive", mileage: 500, image: "🏎️", availability: true },
  { id: 8, name: "Mahindra Thar", pricePerDay: 3500, fuel: "Diesel", purpose: "Off-road", mileage: 15, image: "⛰️", availability: true },
  { id: 9, name: "Toyota Innova Crysta", pricePerDay: 3200, fuel: "Diesel", purpose: "Family", mileage: 14, image: "🚐", availability: true },
  { id: 10, name: "Mahindra XUV700", pricePerDay: 3800, fuel: "Petrol", purpose: "Long Drive", mileage: 16, image: "🚙", availability: true },
  { id: 11, name: "Tata Punch", pricePerDay: 1600, fuel: "Petrol", purpose: "City", mileage: 20, image: "🚘", availability: true },
];

export const CarProvider = ({ children }) => {
  const [cars, setCars] = useState(initialCars);
  const [bookingRequests, setBookingRequests] = useState(() => {
    const saved = localStorage.getItem("bookingRequests");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem(
      "bookingRequests",
      JSON.stringify(bookingRequests)
    );
  }, [bookingRequests]);

  const addCar = useCallback((newCar) => {
    setCars((prev) => [
      ...prev,
      { ...newCar, id: Date.now(), image: newCar.fuel === "Electric" ? "⚡" : "🚗" },
    ]);
  }, []);

  const editCar = useCallback((updatedCar) => {
    setCars((prev) =>
      prev.map((car) => (car.id === updatedCar.id ? { ...car, ...updatedCar } : car))
    );
  }, []);

  const deleteCar = useCallback((id) => {
    setCars((prev) => prev.filter((car) => car.id !== id));
  }, []);

  const requestBooking = useCallback(
    (carId, startDate, endDate, totalDays, totalAmount, carName) => {
      if (!carId || !startDate || !endDate) {
        return { success: false, message: "Missing booking details." };
      }

      const car = cars.find((c) => c.id === carId);
      if (!car) {
        return { success: false, message: "Selected car was not found." };
      }

      const hasPending = bookingRequests.some(
        (b) => b.carId === carId && b.status === "pending"
      );
      if (hasPending) {
        return {
          success: false,
          message: "A booking request for this car is already pending.",
        };
      }

      const newRequest = {
        id: Date.now(),
        carId,
        carName: carName || car.name,
        startDate,
        endDate,
        totalDays,
        totalAmount,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      setBookingRequests((prev) => [...prev, newRequest]);
      return { success: true, message: "Booking request sent to admin." };
    },
    [cars, bookingRequests]
  );

  const updateBookingStatus = useCallback((bookingId, status) => {
    setBookingRequests((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
  }, []);

  const cancelBookingRequest = useCallback((bookingId) => {
    setBookingRequests((prev) => prev.filter((b) => b.id !== bookingId));
  }, []);

  return (
    <CarContext.Provider
      value={{
        cars,
        addCar,
        editCar,
        deleteCar,
        bookingRequests,
        requestBooking,
        updateBookingStatus,
        cancelBookingRequest,
      }}
    >
      {children}
    </CarContext.Provider>
  );
};