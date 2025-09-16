import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Menu = () => {
  const [hamburguesas, setHamburguesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        // La ruta de la API debe ser '/productos', no '/hamburguesas'
     const response = await axios.get("http://localhost:3000/api/productos");
        
        // Guarda los datos en el estado
        setHamburguesas(response.data); 
        setLoading(false);
      } catch (err) {
        setError("No se pudo cargar el menú. Intenta de nuevo más tarde.");
        setLoading(false);
        console.error("Error fetching data: ", err);
      }
    };

    fetchProductos();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner text-warning loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-error mt-10">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-4xl text-center font-bold mb-8">Menú</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hamburguesas.map((hamburguesa) => (
          <div key={hamburguesa.id_producto} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{hamburguesa.nombre}</h2>
              <p>{hamburguesa.descripcion}</p>
              <p className="text-xl font-semibold mt-2">Precio: ${hamburguesa.precio_base}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;