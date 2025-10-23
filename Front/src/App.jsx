import { Routes, Route } from "react-router-dom";
import PantHome from "./Components/PantHome";
import Menu from "./Components/Menu";
import Carrito from "./Components/Carrito";
import Pago from "./Components/Pago";
import Ticket from "./Components/Ticket";


function App() {
  return (
    <Routes>
      <Route path="/" element={<PantHome />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/carrito" element={<Carrito />} />
      <Route path="/pago" element={<Pago />} />
      <Route path="/ticket" element={<Ticket />} />



    </Routes>
  );
}

export default App;
