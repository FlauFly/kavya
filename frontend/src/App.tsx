import { Routes, Route, Link } from "react-router";
import { WorksList } from "./pages/WorksList";
import { WorkDetail } from "./pages/WorkDetail";
import { SearchBar } from "./components/SearchBar";
import { SearchResults } from "./pages/SearchResults";

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/stories">Stories</Link> | <Link to="/poetry">Poetry</Link>
        <SearchBar />
      </nav>
      <Routes>
        <Route path="/" element={<WorksList />} />
        <Route path="/stories" element={<WorksList form="short_story" />} />
        <Route path="/poetry" element={<WorksList form="poetry" />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/works/:id" element={<WorkDetail />} />
      </Routes>
    </div>
  );
}
