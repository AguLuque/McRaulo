import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "./Idioma/Language";
import { Home, UtensilsCrossed, ShoppingCart, CreditCard } from "lucide-react";

const BarraMenu = ({ cartCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { texts } = useLanguage();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className="dock">
        <button 
          onClick={() => navigate("/")} 
          className={isActive("/") ? "dock-active" : ""} 
          title={texts.home}
        >
          <Home size={24} strokeWidth={1.5} />
          <div className="dock-label">{texts.home}</div>
        </button>

        <button
          onClick={() => navigate("/menu")}
          className={isActive("/menu") ? "dock-active" : ""}
          title={texts.menu}
        >
          <UtensilsCrossed size={24} strokeWidth={1.5} />
          <div className="dock-label">{texts.menu}</div>
        </button>

        <button
          onClick={() => navigate("/carrito")}
          className={`relative ${isActive("/carrito") ? "dock-active" : ""}`}
          title={texts.cart}
        >
          <ShoppingCart size={24} strokeWidth={1.5} />
          <div className="dock-label">{texts.cart}</div>
          {cartCount > 0 && (
            <div className="badge bg-amber-500 text-white border-0 badge-sm absolute -top-1 -right-1">
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
          <CreditCard size={24} strokeWidth={1.5} />
          <div className="dock-label">{texts.payment}</div>
        </button>
      </div>

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
          @apply rounded-xl relative flex h-12 max-w-20 shrink-1 basis-full cursor-pointer flex-col items-center justify-center gap-1 bg-transparent;
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
          color: #d1d5db;
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
    </>
  );
};

export default BarraMenu;