import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "./Idioma/Language"; // 👈 Importar

const Carrito = () => {
  const { texts } = useLanguage(); // 👈 Usar el hook
  const [carrito, setCarrito] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

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

  const isActive = (path) => location.pathname === path;
  const cartCount = carrito.reduce((total, item) => total + item.cantidad, 0);

  if (carrito.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">🛒 {texts.cartTitle}</h1>
          <div className="text-6xl mb-4">🍔</div>
          <p className="text-xl mb-6">{texts.emptyCart}</p>
          <button 
            onClick={volverAlMenu}
            className="btn btn-primary btn-lg"
          >
            {texts.menu}
          </button>
        </div>

        {/* Dock para carrito vacío */}
        <div className="dock">
          <button
            onClick={() => navigate("/")}
            className={isActive("/") ? "dock-active" : ""}
            title={texts.home}
          >
            <div className="text-2xl">🏠</div>
            <div className="dock-label">{texts.home}</div>
          </button>

          <button
            onClick={() => navigate("/menu")}
            className={isActive("/menu") ? "dock-active" : ""}
            title={texts.menu}
          >
            <div className="text-2xl">🍔</div>
            <div className="dock-label">{texts.menu}</div>
          </button>

          <button
            className="dock-active relative"
            title={texts.cart}
          >
            <div className="text-2xl">🛒</div>
            <div className="dock-label">{texts.cart}</div>
          </button>

          <button
            disabled
            className="opacity-30 cursor-not-allowed"
            title={texts.payment}
          >
            <div className="text-2xl">💳</div>
            <div className="dock-label">{texts.payment}</div>
          </button>
        </div>

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
            @apply rounded-xl relative flex h-12 max-w-20 shrink-1 basis-full flex-col items-center justify-center gap-1 bg-transparent;
            transition: all 0.3s ease-out;
            color: rgba(255, 255, 255, 0.8);
          }

          .dock > button:not([disabled]):not(.dock-active):hover {
            @apply scale-110;
            color: rgba(255, 255, 255, 1);
            background: rgba(255, 255, 255, 0.1);
          }

          .dock > *[disabled] {
            @apply pointer-events-none;
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
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl pt-6 pb-40">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">🛒 {texts.cartTitle}</h1>
        <button 
          onClick={volverAlMenu}
          className="btn btn-outline"
        >
          ← {texts.continueShopping}
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
                    🗑️ {texts.remove}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen del pedido - STICKY */}
      <div className="fixed bottom-20 left-0 right-0 bg-base-100 shadow-2xl border-t z-50 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body p-4">
              <h3 className="text-xl font-bold mb-3 text-center">{texts.orderSummary}</h3>
              
              <div className="flex justify-between items-center mb-2">
                <span>{texts.quantity}:</span>
                <span className="font-semibold">
                  {carrito.reduce((total, item) => total + item.cantidad, 0)}
                </span>
              </div>
              
              <div className="divider my-2"></div>
              
              <div className="flex justify-between items-center text-2xl font-bold mb-4">
                <span>{texts.total}:</span>
                <span>${calcularTotal().toFixed(2)}</span>
              </div>

              {/* Acciones */}
              <div className="flex flex-col sm:flex-row gap-2 justify-between">
                <button 
                  onClick={vaciarCarrito}
                  className="btn btn-outline btn-error btn-sm"
                >
                  {texts.remove} {texts.cart}
                </button>
                <button 
                  onClick={irAPago}
                  className="btn btn-primary btn-lg flex-1 sm:flex-none"
                >
                  {texts.proceedPayment} 💳
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de navegación dock inferior */}
      <div className="dock">
        <button
          onClick={() => navigate("/")}
          className={isActive("/") ? "dock-active" : ""}
          title={texts.home}
        >
          <div className="text-2xl">🏠</div>
          <div className="dock-label">{texts.home}</div>
        </button>

        <button
          onClick={() => navigate("/menu")}
          className={isActive("/menu") ? "dock-active" : ""}
          title={texts.menu}
        >
          <div className="text-2xl">🍔</div>
          <div className="dock-label">{texts.menu}</div>
        </button>

        <button
          onClick={() => navigate("/carrito")}
          className={`relative ${isActive("/carrito") ? "dock-active" : ""}`}
          title={texts.cart}
        >
          <div className="text-2xl">🛒</div>
          <div className="dock-label">{texts.cart}</div>
          {cartCount > 0 && (
            <div className="badge badge-secondary badge-sm absolute -top-1 -right-1">
              {cartCount}
            </div>
          )}
        </button>

        <button
          onClick={() => navigate("/pago")}
          className={`${isActive("/pago") ? "dock-active" : ""} ${cartCount === 0 ? "opacity-50" : ""}`}
          disabled={cartCount === 0}
          title={texts.payment}
        >
          <div className="text-2xl">💳</div>
          <div className="dock-label">{texts.payment}</div>
        </button>
      </div>

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

export default Carrito;