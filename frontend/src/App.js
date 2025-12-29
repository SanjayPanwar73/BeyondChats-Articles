import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.js";
import ArticleDetail from "./pages/ArticleDetail.js";
import CreateArticle from "./pages/CreateArticle.js";
import EditArticle from "./pages/EditArticle.js";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateArticle />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/edit/:id" element={<EditArticle />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
