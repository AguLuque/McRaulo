import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PantHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useState("es");
  const [carrito, setCarrito] = useState([]);

  // Cargar carrito para mostrar contador
  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    }

    // Actualizar carrito en tiempo real
    const handleStorageChange = () => {
      const carritoActualizado = localStorage.getItem('carrito');
      if (carritoActualizado) {
        setCarrito(JSON.parse(carritoActualizado));
      } else {
        setCarrito([]);
      }
    };

    const interval = setInterval(handleStorageChange, 500);
    return () => clearInterval(interval);
  }, []);

  // Diccionario básico de idiomas
  const texts = {
    es: {
      start: "Iniciar Pedido",
      language: "Idioma",
      takeaway: "Para Llevar",
      dinein: "Consumir en el Local",
      welcome: "Bienvenido",
      home: "Inicio",
      menu: "Menú",
      cart: "Carrito",
      payment: "Pago"
    },
    en: {
      start: "Start Order",
      language: "Language",
      takeaway: "Takeaway",
      dinein: "Dine In",
      welcome: "Welcome",
      home: "Home",
      menu: "Menu",
      cart: "Cart",
      payment: "Payment"
    },
  };

  const isActive = (path) => location.pathname === path;
  const cartCount = carrito.reduce((total, item) => total + item.cantidad, 0);

  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-6 pb-20">
      {/* Contenedor principal para posicionamiento */}
      <div className="fixed top-6 right-6 z-10">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="select select-bordered select-sm md:select-md shadow-md"
        >
          <option value="es">🇪🇸 Español</option>
          <option value="en">🇬🇧 English</option>
        </select>
      </div>

      {/* Tarjeta de bienvenida centrada */}
      <div className="card w-full max-w-sm md:max-w-md bg-base-200 shadow-2xl rounded-2xl p-6 md:p-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary-content mb-8">
          {texts[language].welcome}
        </h1>

        {/* Botón principal grande y destacado */}
        <button
          onClick={() => navigate("/menu")}
          className="btn btn-warning btn-lg w-full mb-6 text-xl md:text-2xl"
        >
          {texts[language].start}
        </button>

        {/* Botones secundarios */}
        <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
          <button className="btn btn-outline btn-success flex-1">
            {texts[language].takeaway}
          </button>
          <button className="btn btn-outline btn-info flex-1">
            {texts[language].dinein}
          </button>
        </div>
      </div>

      {/* Barra de navegación dock inferior */}
      <div className="dock">
        {/* Inicio */}
        <button
          onClick={() => navigate("/")}
          className={isActive("/") ? "dock-active" : ""}
          title={texts[language].home}
        >
          <div className="text-2xl">🏠</div>
          <div className="dock-label">{texts[language].home}</div>
        </button>

        {/* Menú */}
        <button
          onClick={() => navigate("/menu")}
          className={isActive("/menu") ? "dock-active" : ""}
          title={texts[language].menu}
        >
          <div className="text-2xl">🍔</div>
          <div className="dock-label">{texts[language].menu}</div>
        </button>

        {/* Carrito */}
        <button
          onClick={() => navigate("/carrito")}
          className={`relative ${isActive("/carrito") ? "dock-active" : ""}`}
          title={texts[language].cart}
        >
          <div className="text-2xl">🛒</div>
          <div className="dock-label">{texts[language].cart}</div>
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
          title={texts[language].payment}
        >
          <div className="text-2xl">💳</div>
          <div className="dock-label">{texts[language].payment}</div>
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

export default PantHome;