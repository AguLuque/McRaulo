import { Routes, Route } from "react-router-dom";
import PantHome from "./Components/PantHome";
import Menu from "./Components/Menu";
import Carrito from "./Components/Carrito";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PantHome />} />
      <Route path="/menu" element={<Menu />} />
            <Route path="/carrito" element={<Carrito />} />

    </Routes>
  );
}

export default App;
