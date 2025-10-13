import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "./Idioma/Language"; 

const PantHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, changeLanguage, texts } = useLanguage();
  const [carrito, setCarrito] = useState([]);
  const [tipoConsumo, setTipoConsumo] = useState("");


  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    }

    const tipoGuardado = localStorage.getItem('tipoConsumo');
    if (tipoGuardado) {
      setTipoConsumo(tipoGuardado);
    }

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

  const seleccionarTipoConsumo = (tipo) => {
    setTipoConsumo(tipo);
    localStorage.setItem('tipoConsumo', tipo);
  };

  const isActive = (path) => location.pathname === path;
  const cartCount = carrito.reduce((total, item) => total + item.cantidad, 0);

  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-6 pb-20">
      {/* Selector de idioma */}
      <div className="fixed top-6 right-6 z-10">
        <select
          value={language}
          onChange={(e) => changeLanguage(e.target.value)} // 👈 Usar changeLanguage del contexto
          className="select select-bordered select-sm md:select-md shadow-md"
        >
          <option value="es">🇪🇸 Español</option>
          <option value="en">🇬🇧 English</option>
        </select>
      </div>

      <div className="card w-full max-w-sm md:max-w-md bg-base-200 shadow-2xl rounded-2xl p-6 md:p-8 text-center">
        <div className="text-6xl mb-4">🍔</div>
        
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-2">
          {texts.welcome} {/* 👈 Usar texts del contexto */}
        </h1>

        <p className="text-base-content/70 mb-6">
          {texts.selectOption}
        </p>

        <div className="flex flex-col md:flex-row gap-4 w-full justify-center mb-6">
          <button 
            onClick={() => seleccionarTipoConsumo("llevar")}
            className={`btn flex-1 ${
              tipoConsumo === "llevar" 
                ? "btn-success" 
                : "btn-outline btn-success"
            }`}
          >
            {tipoConsumo === "llevar" && "✓ "}
             {texts.takeaway}
          </button>
          <button 
            onClick={() => seleccionarTipoConsumo("local")}
            className={`btn flex-1 ${
              tipoConsumo === "local" 
                ? "btn-info" 
                : "btn-outline btn-info"
            }`}
          >
            {tipoConsumo === "local" && "✓ "}
              {texts.dinein}
          </button>
        </div>

        {/* Botón principal */}
        <button
          onClick={() => navigate("/menu")}
          disabled={!tipoConsumo}
          className={`btn btn-lg w-full text-xl md:text-2xl ${
            tipoConsumo ? "btn-warning" : "btn-disabled"
          }`}
        >
          {texts.start}
        </button>

        {!tipoConsumo && (
          <p className="text-sm text-warning mt-2">
            {texts.pleaseSelect}
          </p>
        )}
      </div>

      {/* Barra de navegación dock inferior - SOLO INICIO HABILITADO */}
      <div className="dock">
        {/* Inicio - Siempre activo y no clickeable */}
        <button
          className="dock-active cursor-default"
          title={texts.home}
        >
          <div className="text-2xl">🏠</div>
          <div className="dock-label">{texts.home}</div>
        </button>

        {/* Menú - DESHABILITADO */}
        <button
          disabled
          className="opacity-30 cursor-not-allowed"
          title={texts.menu}
        >
          <div className="text-2xl">🍔</div>
          <div className="dock-label">{texts.menu}</div>
        </button>

        {/* Carrito - DESHABILITADO */}
        <button
          disabled
          className="opacity-30 cursor-not-allowed relative"
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

        {/* Pago - DESHABILITADO */}
        <button
          disabled
          className="opacity-30 cursor-not-allowed"
          title={texts.payment}
        >
          <div className="text-2xl">💳</div>
          <div className="dock-label">{texts.payment}</div>
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
};

export default PantHome;