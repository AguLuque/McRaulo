import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useReactToPrint } from 'react-to-print';
import { useLanguage } from "./Idioma/Language";
import Ticket from "./Ticket";

const Pago = () => {
  const { texts } = useLanguage();
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [mostrarTicket, setMostrarTicket] = useState(false);
  const [numeroOrden, setNumeroOrden] = useState('');
  const [tipoConsumo, setTipoConsumo] = useState('');

  // Sistema de socio
  const [esSocio, setEsSocio] = useState(false);
  const [dniSocio, setDniSocio] = useState('');
  const [descuentoAplicado, setDescuentoAplicado] = useState(0);
  const [cuponProximaCompra, setCuponProximaCompra] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const ticketRef = useRef();

  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carrito');
    const tipoGuardado = localStorage.getItem('tipoConsumo');

    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    } else {
      navigate('/menu');
    }

    if (tipoGuardado) {
      setTipoConsumo(tipoGuardado);
    }
  }, [navigate]);

  const calcularSubtotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    return subtotal - descuentoAplicado;
  };

  const validarDNI = (dni) => {
    // DNI argentino: 7 u 8 dígitos
    const dniRegex = /^[0-9]{7,8}$/;
    return dniRegex.test(dni);
  };

  const aplicarDescuentoSocio = () => {
    if (!validarDNI(dniSocio)) {
      alert("Por favor ingrese un DNI válido (7 u 8 dígitos)");
      return;
    }

    // Opción 1: Descuento del 15% en esta compra
    const subtotal = calcularSubtotal();
    const descuento = subtotal * 0.15;
    setDescuentoAplicado(descuento);
    setEsSocio(true);

    // Opción 2: Generar cupón para próxima compra (20% off)
    const codigoCupon = `MCRAULO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setCuponProximaCompra({
      codigo: codigoCupon,
      descuento: 20,
      valido: true
    });

    alert(`¡Descuento aplicado! Ahorraste $${descuento.toFixed(2)}\n\nAdemás, recibiste un cupón del 20% OFF para tu próxima compra: ${codigoCupon}`);
  };

  const quitarDescuento = () => {
    setEsSocio(false);
    setDniSocio('');
    setDescuentoAplicado(0);
    setCuponProximaCompra(null);
  };

  const confirmarPedido = async () => {
    if (!metodoPago) {
      alert("Por favor selecciona un método de pago");
      return;
    }

    setProcesando(true);

    // Generar número de orden
    const ordenNum = `ORD-${Date.now()}`;
    setNumeroOrden(ordenNum);

    // Simular procesamiento
    setTimeout(() => {
      console.log("Pedido Confirmado:", {
        numeroOrden: ordenNum,
        carrito,
        metodoPago,
        subtotal: calcularSubtotal(),
        descuento: descuentoAplicado,
        total: calcularTotal(),
        tipoConsumo,
        esSocio,
        dniSocio: esSocio ? dniSocio : null,
        cuponProximaCompra
      });

      // Mostrar ticket
      setMostrarTicket(true);
      setProcesando(false);
    }, 2000);
  };

  const handleImprimirTicket = useReactToPrint({
    content: () => ticketRef.current,
    documentTitle: `Ticket-${numeroOrden}`,
    onAfterPrint: () => {
      // Limpiar carrito después de imprimir
      localStorage.removeItem('carrito');

      // Guardar cupón si existe
      if (cuponProximaCompra) {
        const cupones = JSON.parse(localStorage.getItem('cupones') || '[]');
        cupones.push(cuponProximaCompra);
        localStorage.setItem('cupones', JSON.stringify(cupones));
      }

      alert("¡Gracias por tu compra! ");
      navigate('/');
    }
  });

  const finalizarpedido = () => {
    localStorage.removeItem('carrito');

    if (cuponProximaCompra) {
      const cupones = JSON.parse(localStorage.getItem('cupones') || '[]');
      cupones.push(cuponProximaCompra);
      localStorage.setItem('cupones', JSON.stringify(cupones));
    }

    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  const cartCount = carrito.reduce((total, item) => total + item.cantidad, 0);

  // Si el ticket está listo, mostrar pantalla de impresión
  if (mostrarTicket) {
    return (
      <div className="container mx-auto p-4 max-w-4xl pt-6 pb-20">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-4">✅ ¡Pedido Confirmado!</h1>
          <p className="text-xl">Orden #{numeroOrden}</p>
        </div>

        {/* Vista previa del ticket */}
        <div className="flex justify-center mb-6">
          <div className="border-4 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <Ticket
              ref={ticketRef}
              carrito={carrito}
              total={calcularTotal()}
              metodoPago={metodoPago}
              tipoConsumo={tipoConsumo}
              numeroOrden={numeroOrden}
            />
          </div>
        </div>

        {/* Mostrar cupón si existe */}
        {cuponProximaCompra && (
          <div className="alert alert-success mb-6">
            <div>
              <h3 className="font-bold"> ¡Cupón de descuento generado!</h3>
              <p>Código: <strong>{cuponProximaCompra.codigo}</strong></p>
              <p>{cuponProximaCompra.descuento}% OFF en tu próxima compra</p>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex flex-col gap-4">
          <button
            onClick={finalizarpedido}
            className="btn btn-outline"
          >
            Volver a Home
          </button>
        </div>
      </div>
    );
  }

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

      {/* Sistema de Socio */}
      <div className="card bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl mb-6">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-2">👤 ¿Eres socio McRaulo?</h2>
          <p className="text-sm mb-4">¡Obtén un 15% de descuento + cupón 20% OFF para tu próxima compra!</p>

          {!esSocio ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ingresa tu DNI (7-8 dígitos)"
                value={dniSocio}
                onChange={(e) => setDniSocio(e.target.value.replace(/\D/g, '').slice(0, 8))}
                className="input input-bordered flex-1 text-black"
                maxLength="8"
              />
              <button
                onClick={aplicarDescuentoSocio}
                className="btn btn-warning"
              >
                Aplicar
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">✓ Descuento aplicado</p>
                <p className="text-sm">DNI: {dniSocio}</p>
                <p className="text-sm">Ahorro: ${descuentoAplicado.toFixed(2)}</p>
              </div>
              <button
                onClick={quitarDescuento}
                className="btn btn-sm btn-ghost"
              >
                Quitar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Selección de método de pago */}
      <div className="card bg-base-200 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-4">{texts.paymentTitle}</h2>

          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={() => setMetodoPago("Efectivo")}
              className={`btn flex-1 ${metodoPago === "Efectivo"
                  ? "btn-success"
                  : "btn-outline btn-success"
                }`}
            >
              {metodoPago === "Efectivo" && "✓ "}
               {texts.cash}
            </button>

            <button
              onClick={() => setMetodoPago("Tarjeta")}
              className={`btn flex-1 ${metodoPago === "Tarjeta"
                  ? "btn-info"
                  : "btn-outline btn-info"
                }`}
            >
              {metodoPago === "Tarjeta" && "✓ "}
               {texts.card}
            </button>

            <button
              onClick={() => setMetodoPago("mercadopago")}
              className={`btn flex-1 ${metodoPago === "mercadopago"
                  ? "btn-primary"
                  : "btn-outline btn-primary"
                }`}
            >
              {metodoPago === "mercadopago" && "✓ "}
               Mercado Pago
            </button>
          </div>
        </div>
      </div>

      {/* Resumen del pedido */ }
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
            <p className="font-bold">${(item.precio * item.cantidad).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="divider"></div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-lg">
          <span>Subtotal:</span>
          <span>${calcularSubtotal().toFixed(2)}</span>
        </div>

        {descuentoAplicado > 0 && (
          <div className="flex justify-between items-center text-lg text-success">
            <span>Descuento Socio (15%):</span>
            <span>-${descuentoAplicado.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-2xl font-bold">
          <span>{texts.total}:</span>
          <span>${calcularTotal().toFixed(2)}</span>
        </div>
      </div>
    </div>
  </div>

  {/* Botón de confirmación */ }
  <div className="card bg-base-200 shadow-xl">
    <div className="card-body">
      <button
        onClick={confirmarPedido}
        disabled={!metodoPago || procesando}
        className={`btn btn-lg w-full ${metodoPago && !procesando ? "btn-primary" : "btn-disabled"
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
          Por favor selecciona un método de pago
        </p>
      )}
    </div>
  </div>

  {/* Dock */ }
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
    </div >
  );
};

export default Pago;