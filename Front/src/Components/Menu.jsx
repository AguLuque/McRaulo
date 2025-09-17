import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const Menu = () => {
  const [hamburguesas, setHamburguesas] = useState([]);
  const [papas, setPapas] = useState([]);
  const [bebidas, setBebidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        // Fetch paralelo de todos los productos
        const [hamburguesasRes, papasRes, bebidasRes] = await Promise.all([
          axios.get("http://localhost:3000/api/productos/hamburguesas"),
          axios.get("http://localhost:3000/api/productos/papas"),
          axios.get("http://localhost:3000/api/productos/bebidas")
        ]);

        setHamburguesas(hamburguesasRes.data);
        setPapas(papasRes.data);
        setBebidas(bebidasRes.data);
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

  // Función genérica para agregar productos al carrito
  const agregarAlCarrito = (producto, tipo) => {
    // Definir imágenes según el tipo de producto
    const imagenes = {
      hamburguesa: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1772&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      papa: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      bebida: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    };

    const productoCarrito = {
      id: producto.id_producto,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio_base,
      imagen: imagenes[tipo],
      cantidad: 1,
      tipo: tipo
    };

    setCarrito(prevCarrito => {
      // Verificar si el producto ya está en el carrito
      const productoExistente = prevCarrito.find(item => item.id === producto.id_producto);
      
      let nuevoCarrito;
      if (productoExistente) {
        // Si existe, aumentar la cantidad
        nuevoCarrito = prevCarrito.map(item =>
          item.id === producto.id_producto
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

    // Mostrar toast de confirmación
    const toast = document.createElement('div');
    toast.className = 'toast toast-top toast-center';
    toast.innerHTML = `
      <div class="alert alert-success">
        <span>✓ ${producto.nombre} agregado al carrito</span>
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

  const isActive = (path) => location.pathname === path;
  const cartCount = carrito.reduce((total, item) => total + item.cantidad, 0);

  // Componente reutilizable para los carousels
  const CarouselProductos = ({ productos, tipo, titulo, emoji }) => (
    <section className="w-full max-w-6xl mb-12">
      <h2 className="text-3xl font-bold text-center mb-6">
        {emoji} {titulo}
      </h2>
      <div className="carousel carousel-center rounded-box max-w-full space-x-4 p-4 w-full">
        {productos.map((producto) => (
          <div key={producto.id_producto} className="carousel-item">
            <div 
              className="card bg-base-100 shadow-xl w-80 flex-shrink-0 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105"
              onClick={() => agregarAlCarrito(producto, tipo)}
            >
              <figure className="h-48 w-full overflow-hidden">
                <img
                  src={
                    tipo === 'hamburguesa' 
                      ? "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1772&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      : tipo === 'papa'
                      ? "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      : "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  }
                  alt={producto.nombre}
                  className="w-full h-full object-cover"
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title text-center">{producto.nombre}</h3>
                <p className="text-sm text-center">{producto.descripcion}</p>
                <p className="text-xl font-semibold mt-2 text-center">Precio: ${producto.precio_base}</p>
                
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
      
      {/* Indicador de scroll para cada sección */}
      <div className="text-center mt-4">
        <p className="text-sm text-base-content/60">
          Desliza horizontalmente para ver más {titulo.toLowerCase()} →
        </p>
      </div>
    </section>
  );

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
    <div className="flex flex-col items-center justify-start min-h-screen p-4 space-y-8 pb-20">
      {/* Header con carrito */}
      <div className="flex justify-between items-center w-full max-w-6xl mb-8">
        <h1 className="text-4xl text-center font-bold flex-1">🍔 Menú Completo</h1>
        
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

      {/* Carousel de Hamburguesas */}
      <CarouselProductos 
        productos={hamburguesas}
        tipo="hamburguesa"
        titulo="Hamburguesas"
        emoji="🍔"
      />

      {/* Carousel de Papas Fritas */}
      <CarouselProductos 
        productos={papas}
        tipo="papa"
        titulo="Papas Fritas"
        emoji="🍟"
      />

      {/* Carousel de Bebidas */}
      <CarouselProductos 
        productos={bebidas}
        tipo="bebida"
        titulo="Bebidas"
        emoji="🥤"
      />

      {/* Instrucciones generales */}
      <div className="text-center mt-8 p-4 bg-base-200 rounded-lg max-w-2xl">
        <p className="text-lg font-semibold mb-2">¿Cómo ordenar?</p>
        <p className="text-base-content/70">
          Haz clic en cualquier producto para agregarlo al carrito. 
          Puedes combinar hamburguesas, papas y bebidas para armar tu combo perfecto.
        </p>
      </div>

      {/* Botón flotante para ir al carrito */}
      {carrito.length > 0 && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50">
          <button 
            onClick={irAlCarrito}
            className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <span className="flex items-center gap-3">
              🛒 Ver Carrito 
              <div className="badge badge-secondary">
                {carrito.reduce((total, item) => total + item.cantidad, 0)}
              </div>
              <span className="font-bold">
                ${carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0).toFixed(2)}
              </span>
            </span>
          </button>
        </div>
      )}

      {/* Barra de navegación dock inferior */}
      <div className="dock">
        {/* Inicio */}
        <button
          onClick={() => navigate("/")}
          className={isActive("/") ? "dock-active" : ""}
          title="Inicio"
        >
          <div className="text-2xl">🏠</div>
          <div className="dock-label">Inicio</div>
        </button>

        {/* Menú */}
        <button
          onClick={() => navigate("/menu")}
          className={isActive("/menu") ? "dock-active" : ""}
          title="Menú"
        >
          <div className="text-2xl">🍔</div>
          <div className="dock-label">Menú</div>
        </button>

        {/* Carrito */}
        <button
          onClick={() => navigate("/carrito")}
          className={`relative ${isActive("/carrito") ? "dock-active" : ""}`}
          title="Carrito"
        >
          <div className="text-2xl">🛒</div>
          <div className="dock-label">Carrito</div>
          {cartCount > 0 && (
            <div className="badge badge-secondary badge-sm absolute -top-1 -right-1">
              {cartCount}
            </div>
          )}
        </button>

        {/* Pago */}
        <button
          onClick={() => navigate("/pago")}
          className={`${isActive("/pago") ? "dock-active" : ""} ${cartCount === 0 ? "opacity-50" : ""}`}
          disabled={cartCount === 0}
          title="Pago"
        >
          <div className="text-2xl">💳</div>
          <div className="dock-label">Pago</div>
        </button>
      </div>

      {/* Estilos CSS para el dock */}
      <style jsx>{`
        .dock {
          @apply fixed right-0 bottom-0 left-0 z-40 flex w-full flex-row items-center justify-around p-3 text-white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          height: 4.5rem;
          height: calc(4.5rem + env(safe-area-inset-bottom));
          padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
          box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
        }

        .dock > * {
          @apply rounded-xl relative flex h-12 max-w-20 shrink-1 basis-full cursor-pointer flex-col items-center justify-center gap-1 bg-transparent;
          transition: all 0.3s ease-out;
          color: rgba(255, 255, 255, 0.8);
        }

        .dock > *:hover {
          @apply scale-110;
          color: rgba(255, 255, 255, 1);
          background: rgba(255, 255, 255, 0.1);
        }

        .dock > *[disabled] {
          @apply pointer-events-none;
          color: rgba(255, 255, 255, 0.3);
        }

        .dock-label {
          font-size: 0.65rem;
          font-weight: 500;
        }

        .dock > *:after {
          content: "";
          @apply absolute h-1 w-0 rounded-full;
          bottom: -0.5rem;
          background: #fff;
          transition: width 0.3s ease-out;
        }

        .dock-active {
          color: rgba(255, 255, 255, 1) !important;
          background: rgba(255, 255, 255, 0.15) !important;
        }

        .dock-active:after {
          @apply w-8;
        }
      `}</style>
    </div>
  );
};

export default Menu;