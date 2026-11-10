import { Routes, Route, Link } from "react-router";
import { WorksList } from "./pages/WorksList";
import { WorkDetail } from "./pages/WorkDetail";

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/">Works</Link>
      </nav>
      <Routes>
        <Route path="/" element={<WorksList />} />
        <Route path="/works/:id" element={<WorkDetail />} />
      </Routes>
    </div>
  );
}
