import { Routes, Route, Link } from "react-router";
import { WorksList } from "./pages/WorksList";
import { WorkDetail } from "./pages/WorkDetail";
import { SearchBar } from "./components/SearchBar";
import { SearchResults } from "./pages/SearchResults";
import { LogWorkPage } from "./pages/LogWorkPage";
import { AddWorkPage } from "./pages/AddWorkPage";

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/">Main</Link> | <Link to="/stories">Stories</Link> |
        <Link to="/poetry"> Poetry </Link> | <Link to="/add">Add work</Link>
        <SearchBar />
      </nav>
      <Routes>
        <Route path="/" element={<WorksList />} />
        <Route path="/stories" element={<WorksList form="short_story" />} />
        <Route path="/poetry" element={<WorksList form="poetry" />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/works/:id" element={<WorkDetail />} />
        <Route path="/works/:id/log" element={<LogWorkPage />} />
        <Route path="/add" element={<AddWorkPage />} />
      </Routes>
    </div>
  );
}
