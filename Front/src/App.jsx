import { Routes, Route } from "react-router-dom";
import PantHome from "./Components/PantHome";
import Menu from "./Components/Menu";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PantHome />} />
      <Route path="/menu" element={<Menu />} />
    </Routes>
  );
}

export default App;
