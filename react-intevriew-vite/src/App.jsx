import { Link, Route, Routes } from "react-router-dom";

import ChildToParent from "./practices/child-to-parent/ChildToParent.jsx";
import Practice from "./pages/Practice.jsx";
import NotFound from "./pages/NotFound.jsx";
import Home from "./pages/Home.jsx";
import "./App.css";

function App() {
  return (
    <div className="app">
      <nav>
        <Link to="/">Home</Link>
        <Link to="/practice">Practice</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/practice/child-to-parent" element={<ChildToParent />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
