import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import OrganizationSetupPage from "./pages/OrganizationSetupPage";
import EmployeeDirectoryPage from "./pages/EmployeeDirectoryPage";
import EmployeeViewPage from "./pages/EmployeeViewPage";
import EmployeeEditPage from "./pages/EmployeeEditPage";
import OnboardingPage from "./pages/OnboardingPage";
import FilterTestPage from "./pages/FilterTestPage";
import OnboardingDocumentsPage from "./pages/OnboardingDocumentsPage";
import CandidateProfilePage from "./pages/CandidateProfilePage";
import PlaceholderPage from "./pages/PlaceholderPage";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import menuItems from "./config/menuItems";
import TeamCalendarPage from "./pages/TeamCalendarPage";
import EmployeeSalaryPage from "./pages/EmployeeSalaryPage";
import PayrollDraftPage from "./pages/PayrollDraftPage";


// Menu items that already have a real page (everything else shows "coming soon")
//const built = ["/dashboard", "/organization-setup", "/employees", "/onboarding"];
//const built = ["/dashboard", "/organization-setup", "/employees", "/onboarding", "/team-calendar"];
const built = ["/dashboard", "/organization-setup", "/employees", "/onboarding", "/team-calendar", "/payroll/draft"];
const placeholders = menuItems.filter((m) => !built.includes(m.path));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Pages with sidebar (login required) */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/filter-test" element={<FilterTestPage />} />
        <Route path="/organization-setup" element={<OrganizationSetupPage />} />

        {/* Employees */}
        <Route path="/employees" element={<EmployeeDirectoryPage />} />
        <Route path="/employees/:id" element={<EmployeeViewPage />} />
        <Route path="/employees/:id/edit" element={<EmployeeEditPage />} />
        <Route path="/employees/:id/documents" element={<OnboardingDocumentsPage />} />
        <Route path="/payroll/draft" element={<PayrollDraftPage />} />

        {/* Onboarding */}
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/team-calendar" element={<TeamCalendarPage />} />
        <Route path="/employees/:id/salary" element={<EmployeeSalaryPage />} />
        {/* Candidate profile: temporary until Srilekha's page exists */}
        <Route path="/candidates/:id" element={<CandidateProfilePage />} />

        {placeholders.map((m) => (
          <Route key={m.path} path={m.path} element={<PlaceholderPage title={m.label} />} />
        ))}
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}