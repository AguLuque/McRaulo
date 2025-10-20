import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from 'react-to-print';
import { useLanguage } from "./Idioma/Language";
import BarraMenu from "./BarraMenu";
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
  
  // Estado para los modales
  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
  const [mostrarModalExito, setMostrarModalExito] = useState(false);
  const [dniPendiente, setDniPendiente] = useState('');
  const [descuentoObtenido, setDescuentoObtenido] = useState(0);

  const navigate = useNavigate();
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
    const dniRegex = /^[0-9]{7,8}$/;
    return dniRegex.test(dni);
  };

  const aplicarDescuentoSocio = async () => {
    if (!validarDNI(dniSocio)) {
      alert("Por favor ingrese un DNI válido (7 u 8 dígitos)");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/socios/${dniSocio}`);
      
      if (response.ok) {
        const subtotal = calcularSubtotal();
        const descuento = subtotal * 0.15;
        setDescuentoAplicado(descuento);
        setDescuentoObtenido(descuento);
        setEsSocio(true);
        setMostrarModalExito(true);
      } 
      else if (response.status === 404) {
        // Mostrar modal en lugar de window.confirm
        setDniPendiente(dniSocio);
        setMostrarModalRegistro(true);
      } else {
        alert("Error al verificar el socio. Inténtalo nuevamente.");
      }
    } catch (error) {
      console.error("Error al verificar socio:", error);
      alert("Error de conexión con el servidor.");
    }
  };

  const confirmarRegistroSocio = async () => {
    try {
      const nuevoSocio = await fetch(`http://localhost:3000/api/socios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni: dniPendiente }),
      });

      if (nuevoSocio.ok) {
        const subtotal = calcularSubtotal();
        const descuento = subtotal * 0.15;
        setDescuentoAplicado(descuento);
        setDescuentoObtenido(descuento);
        setEsSocio(true);
        setMostrarModalRegistro(false);
        setMostrarModalExito(true);
      } else {
        const dataError = await nuevoSocio.json();
        alert(dataError.error || "Error al registrar socio.");
      }
    } catch (error) {
      console.error("Error al registrar socio:", error);
      alert("Error de conexión con el servidor.");
    }
  };

  const cancelarRegistroSocio = () => {
    setMostrarModalRegistro(false);
    setDniPendiente('');
    setDniSocio('');
  };

  const cerrarModalExito = () => {
    setMostrarModalExito(false);
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

    const ordenNum = `ORD-${Date.now()}`;
    setNumeroOrden(ordenNum);

    try {
      let idSocio = null;

      if (esSocio && validarDNI(dniSocio)) {
        const response = await fetch(`http://localhost:3000/api/socios/${dniSocio}`);

        if (response.ok) {
          const data = await response.json();
          idSocio = data.socioData?.id_socio || null;
        } else if (response.status === 404) {
          const nuevoSocio = await fetch(`http://localhost:3000/api/socios`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dni: dniSocio })
          });
          const dataNuevo = await nuevoSocio.json();
          idSocio = dataNuevo?.socio?.id_socio || null;
        }
      }

      await fetch("http://localhost:3000/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numeroOrden: ordenNum,
          carrito,
          metodoPago,
          subtotal: calcularSubtotal(),
          descuento: descuentoAplicado,
          total: calcularTotal(),
          tipoConsumo,
          idSocio
        })
      });

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

        setMostrarTicket(true);
        setProcesando(false);
      }, 2000);
    } catch (error) {
      console.error("Error al confirmar pedido:", error);
      alert("Ocurrió un error al guardar el pedido.");
      setProcesando(false);
    }
  };

  const handleImprimirTicket = useReactToPrint({
    content: () => ticketRef.current,
    documentTitle: `Ticket-${numeroOrden}`,
    onAfterPrint: () => {
      localStorage.removeItem('carrito');

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

  const cartCount = carrito.reduce((total, item) => total + item.cantidad, 0);

  if (mostrarTicket) {
    return (
      <div className="container mx-auto p-4 max-w-4xl pt-6 pb-20 bg-gray-50 min-h-screen">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">✅ ¡Pedido Confirmado!</h1>
          <p className="text-xl text-gray-600">Orden #{numeroOrden}</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="border-4 border-dashed border-gray-200 rounded-2xl p-4 bg-white">
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

        {cuponProximaCompra && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-6">
            <div>
              <h3 className="font-bold text-green-700 text-lg">🎉 ¡Cupón de descuento generado!</h3>
              <p className="text-green-600">Código: <strong>{cuponProximaCompra.codigo}</strong></p>
              <p className="text-green-600">{cuponProximaCompra.descuento}% OFF en tu próxima compra</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <button
            onClick={finalizarpedido}
            className="btn bg-amber-500 hover:bg-amber-600 text-white border-0 btn-lg rounded-xl"
          >
            Volver a Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl pt-6 pb-40 bg-gray-50 min-h-screen">
      
      {/* Modal de Éxito - Descuento Aplicado */}
      {mostrarModalExito && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md bg-white rounded-2xl shadow-2xl">
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-3xl text-gray-800 mb-2">
                ¡Bienvenido!
              </h3>
              <p className="text-gray-600 text-lg mb-4">
                Ya eres socio y obtuviste tu descuento
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-200">
              <div className="text-center">
                <p className="text-gray-700 text-lg mb-2">Descuento aplicado:</p>
                <p className="text-4xl font-bold text-green-600 mb-3">
                  ${descuentoObtenido.toFixed(2)}
                </p>
                <div className="badge badge-success badge-lg text-white px-4 py-3">
                  15% OFF
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 mb-6 border-2 border-amber-200">
              <p className="text-center text-amber-800 font-medium">
                🎉 <strong>¡Bonus!</strong> Obtendrás un cupón del 20% OFF para tu próxima compra
              </p>
            </div>

            <div className="modal-action justify-center">
              <button 
                onClick={cerrarModalExito}
                className="btn bg-green-500 hover:bg-green-600 text-white border-0 rounded-xl px-8"
              >
                ¡Genial, continuar!
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-black opacity-50" onClick={cerrarModalExito}></div>
        </div>
      )}
      
      {/* Modal de Registro de Socio - DaisyUI */}
      {mostrarModalRegistro && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md bg-white rounded-2xl shadow-2xl">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-2xl text-gray-800 mb-2">
                ¡Únete a McRaulo!
              </h3>
              <p className="text-gray-600 mb-4">
                No estás registrado como socio.
              </p>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-6 border-2 border-amber-200">
              <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Beneficios de ser socio:
              </h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span><strong>15% de descuento</strong> en esta compra</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span><strong>20% OFF</strong> en tu próxima compra</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Descuentos exclusivos permanentes</span>
                </li>
              </ul>
            </div>

            <p className="text-center text-gray-700 font-medium mb-6">
              ¿Deseas registrarte como socio y obtener estos beneficios?
            </p>

            <div className="modal-action flex gap-3 mt-6">
              <button 
                onClick={cancelarRegistroSocio}
                className="btn bg-white hover:bg-gray-100 text-gray-700 border-2 border-gray-300 flex-1 rounded-xl"
              >
                Seguir sin ser socio
              </button>
              <button 
                onClick={confirmarRegistroSocio}
                className="btn bg-amber-500 hover:bg-amber-600 text-white border-0 flex-1 rounded-xl"
              >
                ¡Quiero ser socio!
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-black opacity-50" onClick={cancelarRegistroSocio}></div>
        </div>
      )}

      {/* Sistema de Socio */}
      <div className="card bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-xl mb-6 border border-slate-600 rounded-2xl">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-2">¿Eres socio McRaulo?</h2>
          <p className="text-sm mb-4 text-slate-200">¡Obtén un 15% de descuento + cupón 20% OFF para tu próxima compra!</p>

          {!esSocio ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ingresa tu DNI (7-8 dígitos)"
                value={dniSocio}
                onChange={(e) => setDniSocio(e.target.value.replace(/\D/g, '').slice(0, 8))}
                className="input input-bordered flex-1 bg-white text-black rounded-xl"
                maxLength="8"
              />
              <button
                onClick={aplicarDescuentoSocio}
                className="btn bg-amber-600 hover:bg-amber-700 text-white border-0 rounded-xl"
              >
                Aplicar
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-emerald-400">✓ Descuento aplicado</p>
                <p className="text-sm text-slate-300">DNI: {dniSocio}</p>
                <p className="text-sm text-slate-300">Ahorro: ${descuentoAplicado.toFixed(2)}</p>
              </div>
              <button
                onClick={quitarDescuento}
                className="btn btn-sm bg-slate-600 hover:bg-slate-500 text-white border-0 rounded-xl"
              >
                Quitar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Selección de método de pago */}
      <div className="card bg-white shadow-xl mb-6 border-2 border-gray-100 rounded-2xl">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{texts.paymentTitle}</h2>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => setMetodoPago("Efectivo")}
              className={`btn flex-1 border-2 rounded-xl transition-all h-16 text-lg ${metodoPago === "Efectivo"
                  ? "bg-green-500 hover:bg-green-600 text-white border-green-500"
                  : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                }`}
            >
              {metodoPago === "Efectivo" && "✓ "}
              {texts.cash}
            </button>

            <button
              onClick={() => setMetodoPago("Tarjeta")}
              className={`btn flex-1 border-2 rounded-xl transition-all h-16 text-lg ${metodoPago === "Tarjeta"
                  ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                  : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                }`}
            >
              {metodoPago === "Tarjeta" && "✓ "}
              {texts.card}
            </button>

            <button
              onClick={() => setMetodoPago("mercadopago")}
              className={`btn flex-1 border-2 rounded-xl transition-all h-16 text-lg ${metodoPago === "mercadopago"
                  ? "bg-blue-400 hover:bg-blue-500 text-white border-blue-400"
                  : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                }`}
            >
              {metodoPago === "mercadopago" && "✓ "}
              Mercado Pago
            </button>
          </div>
        </div>
      </div>

      {/* Resumen del pedido */}
      <div className="card bg-white shadow-xl mb-6 border-2 border-gray-100 rounded-2xl">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{texts.orderSummary}</h2>

          <div className="space-y-4">
            {carrito.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-100">
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="w-16 h-16 rounded-lg object-cover border-2 border-gray-100"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-lg">{item.nombre}</p>
                    <p className="text-sm text-gray-500">
                      {texts.quantity}: {item.cantidad} × ${item.precio}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-gray-800 text-xl ml-4">${(item.precio * item.cantidad).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="divider"></div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-lg text-gray-700">
              <span>Subtotal:</span>
              <span>${calcularSubtotal().toFixed(2)}</span>
            </div>

            {descuentoAplicado > 0 && (
              <div className="flex justify-between items-center text-lg text-green-600">
                <span>Descuento Socio (15%):</span>
                <span>-${descuentoAplicado.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-2xl font-bold text-gray-800 bg-amber-50 p-3 rounded-xl">
              <span>{texts.total}:</span>
              <span className="text-amber-600">${calcularTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de confirmación */}
      <div className="card bg-white shadow-xl border-2 border-gray-100 rounded-2xl">
        <div className="card-body">
          <button
            onClick={confirmarPedido}
            disabled={!metodoPago || procesando}
            className={`btn btn-lg w-full rounded-xl ${metodoPago && !procesando
                ? "bg-amber-500 hover:bg-amber-600 text-white border-0"
                : "bg-gray-200 text-gray-400 cursor-not-allowed border-0"
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
            <p className="text-sm text-amber-600 text-center mt-2">
              Por favor selecciona un método de pago
            </p>
          )}
        </div>
      </div>

      {/* Barra de navegación */}
      <BarraMenu cartCount={cartCount} />
    </div>
  );
};

export default Pago; 