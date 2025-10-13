import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "./Idioma/Language";

const Pago = () => {
  const { texts } = useLanguage();
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState("");
  const [procesando, setProcesando] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    } else {
      // Si no hay carrito, redirigir al menú
      navigate('/menu');
    }
  }, [navigate]);

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const confirmarPedido = async () => {
    if (!metodoPago) {
      alert(texts.pleaseSelect || "Por favor selecciona un método de pago");
      return;
    }

    setProcesando(true);

    // Simular procesamiento
    setTimeout(() => {
      // Aquí irá tu lógica de envío al backend
      console.log("Pedido confirmado:", {
        carrito,
        metodoPago,
        total: calcularTotal(),
        tipoConsumo: localStorage.getItem('tipoConsumo')
      });

      // Limpiar carrito
      localStorage.removeItem('carrito');
      
      // Redirigir o mostrar mensaje de éxito
      alert("¡Pedido confirmado con éxito!");
      navigate('/');
      setProcesando(false);
    }, 2000);
  };

  const isActive = (path) => location.pathname === path;
  const cartCount = carrito.reduce((total, item) => total + item.cantidad, 0);

  return (
    <div className="container mx-auto p-4 max-w-4xl pt-6 pb-40">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">💳 {texts.paymentTitle}</h1>
        <button 
          onClick={() => navigate('/carrito')}
          className="btn btn-outline"
        >
          ← {texts.cart}
        </button>
      </div>

      {/* Selección de método de pago */}
      <div className="card bg-base-200 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-4">{texts.paymentTitle}</h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={() => setMetodoPago("Efectivo")}
              className={`btn flex-1 ${
                metodoPago === "Efectivo"
                  ? "btn-success"
                  : "btn-outline btn-success"
              }`}
            >
              {metodoPago === "Efectivo" && "✓ "}
               {texts.cash}
            </button>
            
            <button
              onClick={() => setMetodoPago("Mercado Pago")}
              className={`btn flex-1 ${
                metodoPago === "Mercado Pago"
                  ? "btn-info"
                  : "btn-outline btn-info"
              }`}
            >
              {metodoPago === "Mercado Pago" && "✓ "}
               {texts.card}
            </button>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-4">{texts.orderSummary}</h2>
          
          <div className="space-y-3">
            {carrito.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b">
                <div className="flex items-center gap-3">
                  <img 
                    src={item.imagen} 
                    alt={item.nombre} 
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold">{item.nombre}</p>
                    <p className="text-sm text-base-content/70">
                      {texts.quantity}: {item.cantidad}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="divider"></div>

          <div className="flex justify-between items-center text-2xl font-bold">
            <span>{texts.total}:</span>
            <span>${calcularTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <button
            onClick={confirmarPedido}
            disabled={!metodoPago || procesando}
            className={`btn btn-lg w-full ${
              metodoPago && !procesando ? "btn-primary" : "btn-disabled"
            }`}
          >
            {procesando ? (
              <>
                <span className="loading loading-spinner"></span>
                {texts.processing}
              </>
            ) : (
              `${texts.confirmOrder} - $${calcularTotal().toFixed(2)}`
            )}
          </button>

          {!metodoPago && (
            <p className="text-sm text-warning text-center mt-2">
              {texts.pleaseSelect || "Por favor selecciona un método de pago"}
            </p>
          )}
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
          className="dock-active"
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

export default Pago;