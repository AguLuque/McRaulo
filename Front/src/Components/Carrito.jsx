import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Carrito = () => {
  const [carrito, setCarrito] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar carrito desde localStorage
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    }
  }, []);

  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(id);
      return;
    }

    const nuevoCarrito = carrito.map(item =>
      item.id === id ? { ...item, cantidad: nuevaCantidad } : item
    );
    
    setCarrito(nuevoCarrito);
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
  };

  const eliminarDelCarrito = (id) => {
    const nuevoCarrito = carrito.filter(item => item.id !== id);
    setCarrito(nuevoCarrito);
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    localStorage.removeItem('carrito');
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const volverAlMenu = () => {
    navigate('/menu'); // o la ruta que uses para el menú
  };

  if (carrito.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">🛒 Tu Carrito</h1>
          <div className="text-6xl mb-4">🍔</div>
          <p className="text-xl mb-6">Tu carrito está vacío</p>
          <button 
            onClick={volverAlMenu}
            className="btn btn-primary btn-lg"
          >
            Ver Menú
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">🛒 Tu Carrito</h1>
        <button 
          onClick={volverAlMenu}
          className="btn btn-outline"
        >
          ← Volver al Menú
        </button>
      </div>

      {/* Items del carrito */}
      <div className="space-y-4 mb-6">
        {carrito.map((item) => (
          <div key={item.id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex flex-col md:flex-row items-center gap-4">
                {/* Imagen */}
                <div className="avatar">
                  <div className="w-24 h-24 rounded-xl">
                    <img src={item.imagen} alt={item.nombre} className="object-cover" />
                  </div>
                </div>

                {/* Información del producto */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-semibold">{item.nombre}</h3>
                  <p className="text-base-content/70">{item.descripcion}</p>
                  <p className="text-lg font-bold mt-1">${item.precio}</p>
                </div>

                {/* Controles de cantidad */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                    className="btn btn-circle btn-sm btn-outline"
                  >
                    -
                  </button>
                  <span className="mx-3 text-xl font-semibold min-w-[2rem] text-center">
                    {item.cantidad}
                  </span>
                  <button 
                    onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                    className="btn btn-circle btn-sm btn-outline"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right">
                  <p className="text-lg font-bold">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </p>
                  <button 
                    onClick={() => eliminarDelCarrito(item.id)}
                    className="btn btn-ghost btn-sm text-error"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen del pedido */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h3 className="text-2xl font-bold mb-4">Resumen del Pedido</h3>
          
          <div className="flex justify-between items-center mb-2">
            <span>Cantidad de items:</span>
            <span className="font-semibold">
              {carrito.reduce((total, item) => total + item.cantidad, 0)}
            </span>
          </div>
          
          <div className="divider"></div>
          
          <div className="flex justify-between items-center text-2xl font-bold">
            <span>Total:</span>
            <span>${calcularTotal().toFixed(2)}</span>
          </div>

          {/* Acciones */}
          <div className="card-actions justify-between mt-6">
            <button 
              onClick={vaciarCarrito}
              className="btn btn-outline btn-error"
            >
              Vaciar Carrito
            </button>
            <button className="btn btn-primary btn-lg">
              Proceder al Pago 💳
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrito;