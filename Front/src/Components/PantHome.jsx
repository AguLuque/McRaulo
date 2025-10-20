import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "./Idioma/Language";
import { Home, UtensilsCrossed, ShoppingCart, CreditCard } from "lucide-react";

const PantHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, changeLanguage, texts } = useLanguage();
  const [carrito, setCarrito] = useState([]);
  const [tipoConsumo, setTipoConsumo] = useState("");

  // Cargar logo dinámicamente
  const imagenesLogo = import.meta.glob("../assets/imagenes/logo/*.webp", { eager: true });
  const logoSrc = imagenesLogo["../assets/imagenes/logo/Logo.webp"]?.default;

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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 pb-20">
      {/* Selector de idioma */}
      <div className="fixed top-6 right-6 z-10">
        <select
          value={language}
          onChange={(e) => changeLanguage(e.target.value)}
          className="select bg-white border-2 border-gray-200 text-gray-700 select-sm md:select-md shadow-sm rounded-xl"
        >
          <option value="es">🇪🇸 Español</option>
          <option value="en">🇬🇧 English</option>
        </select>
      </div>

      <div className="card w-full max-w-sm md:max-w-md bg-white shadow-lg rounded-3xl p-6 md:p-8 text-center border border-gray-100">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          {logoSrc && (
            <img 
              src={logoSrc} 
              alt="McRaulo Logo" 
              className="h-40 md:h-80 w-auto object-contain"
            />
          )}
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          {texts.welcome}
        </h1>

        <p className="text-gray-500 text-base mb-6">
          {texts.selectOption}
        </p>

        <div className="flex flex-col md:flex-row gap-3 w-full justify-center mb-6">
          <button 
            onClick={() => seleccionarTipoConsumo("llevar")}
            className={`btn flex-1 border-2 rounded-xl transition-all ${
              tipoConsumo === "llevar" 
                ? "bg-green-500 hover:bg-green-600 text-white border-green-500" 
                : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
            }`}
          >
            {tipoConsumo === "llevar" && "✓ "}
            {texts.takeaway}
          </button>
          <button 
            onClick={() => seleccionarTipoConsumo("local")}
            className={`btn flex-1 border-2 rounded-xl transition-all ${
              tipoConsumo === "local" 
                ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-500" 
                : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
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
          className={`btn btn-lg w-full text-xl md:text-2xl rounded-xl border-0 ${
            tipoConsumo 
              ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md" 
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {texts.start}
        </button>

        {!tipoConsumo && (
          <p className="text-sm text-amber-600 mt-3">
            {texts.pleaseSelect}
          </p>
        )}
      </div>

      {/* Barra de navegación dock inferior */}
      <div className="dock">
        {/* Inicio - Siempre activo */}
        <button
          className="dock-active cursor-default"
          title={texts.home}
        >
          <Home size={24} strokeWidth={1.5} />
          <div className="dock-label">{texts.home}</div>
        </button>

        {/* Menú - DESHABILITADO */}
        <button
          disabled
          className="opacity-30 cursor-not-allowed"
          title={texts.menu}
        >
          <UtensilsCrossed size={24} strokeWidth={1.5} />
          <div className="dock-label">{texts.menu}</div>
        </button>

        {/* Carrito - DESHABILITADO */}
        <button
          disabled
          className="opacity-30 cursor-not-allowed relative"
          title={texts.cart}
        >
          <ShoppingCart size={24} strokeWidth={1.5} />
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
          <CreditCard size={24} strokeWidth={1.5} />
          <div className="dock-label">{texts.payment}</div>
        </button>
      </div>

      {/* Estilos CSS para el dock */}
      <style jsx>{`
        .dock {
          @apply fixed right-0 bottom-0 left-0 z-40 flex w-full flex-row items-center justify-around p-3;
          background: #ffffff;
          border-top: 2px solid #e5e7eb;
          height: 4.5rem;
          height: calc(4.5rem + env(safe-area-inset-bottom));
          padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
          box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
        }

        .dock > * {
          @apply rounded-xl relative flex h-12 max-w-20 shrink-1 basis-full flex-col items-center justify-center gap-1 bg-transparent;
          transition: all 0.2s ease-out;
          color: #6b7280;
        }

        .dock > button:not([disabled]):not(.dock-active):hover {
          @apply scale-105;
          color: #374151;
          background: #f3f4f6;
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
          background: #f59e0b;
          transition: width 0.2s ease-out;
        }

        .dock-active {
          color: #f59e0b !important;
          background: #fef3c7 !important;
        }

        .dock-active:after {
          @apply w-8;
        }
      `}</style>
    </div>
  );
};

export default PantHome;