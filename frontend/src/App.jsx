import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute"; // Assuming this handles authentication logic
import AdminRoute from "./components/AdminRoute";
import ProblemList from "./pages/ProblemList";
import ViewProblem from "./pages/ViewProblem";
import NewProblem from "./pages/NewProblem";
import ProblemEdit from "./pages/ProblemEdit";
import ProfilePage from "./pages/ProfilePage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CodeEditor from "./pages/CodeEditor";
import SubmissionHistory from "./pages/SubmissionList";

// Import the new layout component
import DashboardLayout from "./components/DashboardLayout"; // This will be your main application layout

function App() {
  return (
    // The outermost div no longer needs the min-h-screen class, as the layout will handle it.
    <div>
      <Routes>
        {/* Public Routes - These do NOT use the DashboardLayout */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* The token route might need special handling or be considered public for the reset form itself */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Private Routes - These routes will render within the DashboardLayout.
          The <Outlet /> in DashboardLayout.jsx will render the specific page component.
        */}
        <Route
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/problems" element={<ProblemList />} />
          <Route path="/problems/:id" element={<ViewProblem />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/editor" element={<CodeEditor />} />
          <Route path="/submissions" element={<SubmissionHistory />} />
        </Route>
        <Route
          path="/problems/new"
          element={
            <AdminRoute>
              <NewProblem />
            </AdminRoute>
          }
        />
        <Route
          path="/problems/:id/edit"
          element={
            <AdminRoute>
              <ProblemEdit />
            </AdminRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
