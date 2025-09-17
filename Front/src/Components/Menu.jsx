import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Menu = () => {
  const [hamburguesas, setHamburguesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/productos/hamburguesas");
        setHamburguesas(response.data);
        setLoading(false);
      } catch (err) {
        setError("No se pudo cargar el menú. Intenta de nuevo más tarde.");
        setLoading(false);
        console.error("Error fetching data: ", err);
      }
    };

    fetchProductos();

    // Cargar carrito desde localStorage al inicializar
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    }
  }, []);

  const agregarAlCarrito = (hamburguesa) => {
    const productoCarrito = {
      id: hamburguesa.id_producto,
      nombre: hamburguesa.nombre,
      descripcion: hamburguesa.descripcion,
      precio: hamburguesa.precio_base,
      imagen: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1772&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      cantidad: 1
    };

    setCarrito(prevCarrito => {
      // Verificar si el producto ya está en el carrito
      const productoExistente = prevCarrito.find(item => item.id === hamburguesa.id_producto);
      
      let nuevoCarrito;
      if (productoExistente) {
        // Si existe, aumentar la cantidad
        nuevoCarrito = prevCarrito.map(item =>
          item.id === hamburguesa.id_producto
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        // Si no existe, agregarlo al carrito
        nuevoCarrito = [...prevCarrito, productoCarrito];
      }
      
      // Guardar en localStorage
      localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
      return nuevoCarrito;
    });

    // Mostrar toast de confirmación (opcional)
    const toast = document.createElement('div');
    toast.className = 'toast toast-top toast-center';
    toast.innerHTML = `
      <div class="alert alert-success">
        <span>✓ ${hamburguesa.nombre} agregada al carrito</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 2000);
  };

  const irAlCarrito = () => {
    navigate('/carrito');
  };

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
    <div className="flex flex-col items-center justify-start h-screen p-4">
      {/* Header con carrito */}
      <div className="flex justify-between items-center w-full max-w-4xl mb-4">
        <h1 className="text-4xl text-center font-bold flex-1">Menú de Hamburguesas</h1>
        
        {/* Botón del carrito */}
        <div className="flex items-center">
          <button 
            onClick={irAlCarrito}
            className="btn btn-primary btn-circle relative"
          >
            🛒
            {carrito.length > 0 && (
              <div className="badge badge-secondary badge-sm absolute -top-2 -right-2">
                {carrito.reduce((total, item) => total + item.cantidad, 0)}
              </div>
            )}
          </button>
        </div>
      </div>
      
      {/* Carousel horizontal centrado */}
      <div className="carousel carousel-center rounded-box max-w-4xl space-x-4 p-4 w-full">
        {hamburguesas.map((hamburguesa) => (
          <div key={hamburguesa.id_producto} className="carousel-item">
            <div 
              className="card bg-base-100 shadow-xl w-80 flex-shrink-0 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105"
              onClick={() => agregarAlCarrito(hamburguesa)}
            >
              <figure className="h-48 w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1772&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt={hamburguesa.nombre}
                  className="w-full h-full object-cover"
                />
              </figure>
              <div className="card-body">
                <h2 className="card-title text-center">{hamburguesa.nombre}</h2>
                <p>{hamburguesa.descripcion}</p>
                <p className="text-xl font-semibold mt-2">Precio: ${hamburguesa.precio_base}</p>
                
                {/* Indicador visual de que es clickeable */}
                <div className="card-actions justify-center mt-4">
                  <div className="btn btn-primary btn-sm">
                    + Agregar al carrito
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Indicador de scroll */}
      <div className="mt-4 text-sm text-base-content/60 text-center">
        <p>Desliza horizontalmente para ver más hamburguesas →</p>
        <p className="mt-1">Haz clic en una hamburguesa para agregarla al carrito</p>
      </div>
    </div>
  );
};

export default Menu;