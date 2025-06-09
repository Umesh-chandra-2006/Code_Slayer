import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
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
import Leaderboard from "./pages/Leaderboard";
import ViewSubmission from "./pages/ViewSubmission";

import DashboardLayout from "./components/DashboardLayout";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

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
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/submissions/:id" element={<ViewSubmission />} />          
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
