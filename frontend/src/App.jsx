import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import ProblemList from "./pages/ProblemList";
import ViewProblem from "./pages/ViewProblem";
import SubmissionList from "./pages/SubmissionList";
import NewProblem from "./pages/NewProblem";
import ProblemEdit from "./pages/ProblemEdit";
import ProfilePage from "./pages/ProfilePage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CodeEditor from "./pages/CodeEditor";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/problems"
        element={
          <PrivateRoute>
            <ProblemList />
          </PrivateRoute>
        }
      />
      <Route
        path="/problems/:id"
        element={
          <PrivateRoute>
            <ViewProblem />
          </PrivateRoute>
        }
      />
      <Route
        path="/submissions"
        element={
          <PrivateRoute>
            <SubmissionList />
          </PrivateRoute>
        }
      />
      <Route
        path="/problems/new"
        element={
          <PrivateRoute>
            <NewProblem />
          </PrivateRoute>
        }
      />
      <Route
        path="/problems/:id/edit"
        element={
          <PrivateRoute>
            <ProblemEdit />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/editor"
        element={
          <PrivateRoute>
            <CodeEditor />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
export default App;
