import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Companies from './pages/Companies';
import CompanyProfile from './pages/CompanieProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import CandidateDashboard from './pages/CandidateDashboard';
import CandidateProfile from './pages/CandidateProfile';
import CVPreview from './pages/CVPreview';
import ProtectedRoute from './components/ProtectedRoute';
import About from './pages/About';
import Pricing from './pages/Pricing';
import RecruiterDashboard from './pages/RecruiterDashboard';
import PostJob from './pages/PostJob';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/:id" element={<CompanyProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/cv/:candidateId" element={<CVPreview />} />
        
        {/* Candidate protected routes */}
        <Route 
          path="/candidate/dashboard" 
          element={
            <ProtectedRoute allowedRole="candidate">
              <CandidateDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/candidate/profile" 
          element={
            <ProtectedRoute allowedRole="candidate">
              <CandidateProfile />
            </ProtectedRoute>
          } 
        />

        {/* Recruiter protected routes */}
        <Route 
          path="/recruiter/dashboard" 
          element={
            <ProtectedRoute allowedRole="recruiter">
              <RecruiterDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/post-job" 
          element={
            <ProtectedRoute allowedRole="recruiter">
              <PostJob />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;