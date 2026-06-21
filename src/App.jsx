import React from "react";
import Navbar from "./componens/Navbar";
import { Routes, Route } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import Buyacar from "./componens/Buyacar";
import AddCar from "./componens/AddCar";
import Aboutus from "./Pages/Aboutus";
import Contactus from "./Pages/Contactus";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Payment from "./Pages/Payment";
import GPSTracker from "./componens/GPSTracker";
import CarRecommendation from "./Pages/CarRecommendation";
import Chatbot from "./componens/Chatbot";
import AdminDashboard from "./Pages/AdminDashboard";
import MyBookings from "./Pages/MyBookings";
import RentalHistory from "./Pages/RentalHistory";
import Profile from "./Pages/Profile";
import AdminRoute from "./componens/AdminRoute";
import { CarProvider } from "./context/CarContext";

function App() {
  return (
    <CarProvider>
      <Navbar />
      <Chatbot />
      <Routes>
        <Route path="/"               element={<Homepage />} />
        <Route path="/buyacar"        element={<Buyacar />} />
        <Route path="/addcar"         element={<AddCar />} />
        <Route path="/aboutus"        element={<Aboutus />} />
        <Route path="/contactus"      element={<Contactus />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/payment"        element={<Payment />} />
        <Route path="/gpstracker"     element={<GPSTracker />} />
        <Route path="/recommend"      element={<CarRecommendation />} />
        <Route path="/my-bookings"    element={<MyBookings />} />
        <Route path="/rental-history" element={<RentalHistory />} />
        <Route path="/profile"        element={<Profile />} />
        <Route path="/admin"          element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
    </CarProvider>
  );
}

export default App;
