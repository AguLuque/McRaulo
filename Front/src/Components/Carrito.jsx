import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "./Idioma/Language";
import BarraMenu from "./BarraMenu";

const Carrito = () => {
  const { texts } = useLanguage();
  const [carrito, setCarrito] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
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
    navigate('/menu');
  };

  const irAPago = () => {
    navigate('/pago');
  };

  const cartCount = carrito.reduce((total, item) => total + item.cantidad, 0);

  if (carrito.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">🛒 {texts.cartTitle}</h1>
          <div className="text-6xl mb-4">🍔</div>
          <p className="text-xl mb-6 text-gray-600">{texts.emptyCart}</p>
          <button 
            onClick={volverAlMenu}
            className="btn bg-amber-500 hover:bg-amber-600 text-white border-0 btn-lg rounded-xl"
          >
            {texts.menu}
          </button>
        </div>

        {/* Barra de navegación */}
        <BarraMenu cartCount={cartCount} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl pt-6 pb-40 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">{texts.cart}</h1>
        <button 
          onClick={volverAlMenu}
          className="btn bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 rounded-xl"
        >
          ← {texts.continueShopping}
        </button>
      </div>

      <div className="space-y-4 mb-6">
        {carrito.map((item) => (
          <div key={item.id} className="card bg-white shadow-lg border-2 border-gray-100 rounded-2xl">
            <div className="card-body">
              <div className="flex flex-col md:flex-row items-center gap-4">

                <div className="avatar">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-100">
                    <img src={item.imagen} alt={item.nombre} className="object-cover" />
                  </div>
                </div>

                {/* Info del producto */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-semibold text-gray-800">{item.nombre}</h3>
                  <p className="text-gray-500">{item.descripcion}</p>
                  <p className="text-lg font-bold mt-1 text-gray-700">${item.precio}</p>
                </div>

                {/* Controles de cantidad */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                    className="btn btn-circle btn-sm bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200"
                  >
                    -
                  </button>
                  <span className="mx-3 text-xl font-semibold min-w-[2rem] text-center text-gray-800">
                    {item.cantidad}
                  </span>
                  <button 
                    onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                    className="btn btn-circle btn-sm bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-800">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </p>
                  <button 
                    onClick={() => eliminarDelCarrito(item.id)}
                    className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50"
                  >
                    🗑️ {texts.remove}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen del pedido - Compacto */}
      <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center">
        <div className="bg-white shadow-2xl border-2 border-gray-100 rounded-t-2xl w-[90%] max-w-md p-4">
          <h3 className="text-lg font-bold text-center mb-3 text-gray-800">{texts.orderSummary}</h3>

          <div className="flex justify-between text-sm mb-2 text-gray-600">
            <span>{texts.quantity}:</span>
            <span className="font-semibold text-gray-800">
              {carrito.reduce((total, item) => total + item.cantidad, 0)}
            </span>
          </div>

          <div className="flex justify-between items-center text-xl font-bold mb-4 text-gray-800">
            <span>{texts.total}:</span>
            <span className="text-amber-600">${calcularTotal().toFixed(2)}</span>
          </div>

          <div className="flex gap-2 justify-between">
            <button
              onClick={vaciarCarrito}
              className="btn bg-white hover:bg-red-50 text-red-500 border-2 border-red-200 btn-sm flex-1 rounded-xl"
            >
              {texts.remove}
            </button>
            <button
              onClick={irAPago}
              className="btn bg-amber-500 hover:bg-amber-600 text-white border-0 btn-sm flex-1 rounded-xl"
            >
              {texts.proceedPayment}
            </button>
          </div>
        </div>
      </div>

      {/* Barra de navegación */}
      <BarraMenu cartCount={cartCount} />
    </div>
  );
};

export default Carrito;