import { Routes, Route } from "react-router-dom";
import ApplicationList from "./pages/ApplicationList";
import ApplicationForm from "./pages/ApplicationForm";
import ApplicationDetail from "./pages/ApplicationDetail";
import ReviewDecision from "./pages/ReviewDecision";

function App() {
  return (
      <Routes>
        <Route path="/applications" element={<ApplicationList />} />
        <Route path="/applications/new" element={<ApplicationForm />} />
        <Route path="/applications/:id/edit" element={<ApplicationForm />} />
        <Route path="/applications/:id" element={<ApplicationDetail />} />
        <Route path="/applications/:id/review" element={<ReviewDecision />} />
        <Route path="/" element={<ApplicationList />} />
      </Routes>
  );
}

export default App;
