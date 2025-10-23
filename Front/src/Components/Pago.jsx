import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "./Idioma/Language";
import BarraMenu from "./BarraMenu";
import { formatearPrecio } from './Utils/FormatearPrecio';


const Pago = () => {
  const { texts } = useLanguage();
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [numeroOrden, setNumeroOrden] = useState('');
  const [tipoConsumo, setTipoConsumo] = useState('');
  const [mostrarModalErrorDNI, setMostrarModalErrorDNI] = useState(false);
  const [mostrarModalError, setMostrarModalError] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [mostrarModalMetodoPago, setMostrarModalMetodoPago] = useState(false);
  const [mostrarModalGracias, setMostrarModalGracias] = useState(false);


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
  const imagenesLogo = import.meta.glob("../assets/imagenes/logo/*.webp", { eager: true });
  const logoSrc = imagenesLogo["../assets/imagenes/logo/Logo.webp"]?.default;

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
      setMostrarModalErrorDNI(true);
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
        setMensajeError("Error al verificar el socio. Inténtalo nuevamente.");
        setMostrarModalError(true);
      }
    } catch (error) {
      console.error("Error al verificar socio:", error);
      setMensajeError("Error de conexión con el servidor.");
      setMostrarModalError(true);
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
        setMensajeError(dataError.error || "Error al registrar socio.");
        setMostrarModalError(true);
      }
    } catch (error) {
      console.error("Error al registrar socio:", error);
      setMensajeError("Error de conexión con el servidor.");
      setMostrarModalError(true);
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
      setMostrarModalMetodoPago(true);
      return;
    }

    setProcesando(true);

    try {
      let idSocio = null;

      // 🔹 Verificamos si el socio existe o lo creamos
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

      // 🔹 Formatear el carrito para el backend
      const carritoFormateado = carrito.map(item => ({
        id: item.id,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
        notas: item.notas || null
      }));

      // 🔹 Mapeo de métodos de pago
      const metodosPago = {
        Efectivo: 5,
        Tarjeta: 4,
        mercadopago: 7
      };

      // ✅ Objeto del pedido SIN id_cliente
      const pedidoData = {
        id_estado_pedido: 1,
        id_tipo_pago: metodosPago[metodoPago],
        subtotal: calcularSubtotal(),
        total: calcularTotal(),
        descuento_total: descuentoAplicado || 0,
        descuento_aplicado: descuentoAplicado || 0,
        id_socio: idSocio,
        tipo_servicio: tipoConsumo || 'local',
        activo: true,
        carrito: carritoFormateado,
      };

      console.log("📤 Enviando pedido:", pedidoData);

      // 🔹 Enviamos el pedido al backend
      const response = await fetch("http://localhost:3000/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedidoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error del servidor:", errorData);
        throw new Error(errorData.message || "Error al registrar el pedido");
      }

      const data = await response.json();
      console.log("✅ Pedido creado:", data);

      // Guardamos el número de pedido devuelto
      setNumeroOrden(data.data.id_pedido);
      const numeroOrdenGenerado = data.data.id_pedido;
      setNumeroOrden(numeroOrdenGenerado);
      navigate('/ticket', {
        state: {
          carrito,
          total: calcularTotal(),
          metodoPago,
          tipoConsumo,
          numeroOrden: numeroOrdenGenerado,
          cuponProximaCompra
        }
      });

    } catch (error) {
      console.error("❌ Error al confirmar pedido:", error);
      setMensajeError("Ocurrió un error al guardar el pedido: " + error.message);
      setMostrarModalError(true);
    } finally {
      setProcesando(false);
    }
  };

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


  return (
    <div className="container mx-auto p-4 max-w-4xl pt-6 pb-40 bg-gray-50 min-h-screen">

      {/* Modal de Éxito - Descuento Aplicado */}
      {mostrarModalExito && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md bg-white rounded-2xl shadow-2xl">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                {logoSrc && (
                  <img
                    src={logoSrc}
                    alt="Logo McRaulo"
                    className="h-35 w-auto object-contain"
                  />
                )}
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
                  ${formatearPrecio(descuentoObtenido)}
                </p>
                <div className="badge badge-success badge-lg text-white px-4 py-3">
                  15% OFF
                </div>
              </div>
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

      {/* Modal de Error - DNI Inválido */}
      {mostrarModalErrorDNI && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md bg-white rounded-2xl shadow-2xl">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                {logoSrc && (
                  <img
                    src={logoSrc}
                    alt="Logo McRaulo"
                    className="h-30 w-auto object-contain"
                  />
                )}
              </div>
              <h3 className="font-bold text-2xl text-gray-800 mb-2">
                DNI no válido
              </h3>
              <p className="text-gray-600 text-lg">
                Por favor ingrese un DNI válido de 7 u 8 dígitos
              </p>
            </div>

            <div className="modal-action justify-center">
              <button
                onClick={() => setMostrarModalErrorDNI(false)}
                className="btn bg-red-500 hover:bg-red-600 text-white border-0 rounded-xl px-8"
              >
                Entendido
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-black opacity-50" onClick={() => setMostrarModalErrorDNI(false)}></div>
        </div>
      )}

      {/* Modal de Error General */}
      {mostrarModalError && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md bg-white rounded-2xl shadow-2xl">
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="font-bold text-2xl text-gray-800 mb-2">
                Error
              </h3>
              <p className="text-gray-600 text-lg">
                {mensajeError}
              </p>
            </div>

            <div className="modal-action justify-center">
              <button
                onClick={() => setMostrarModalError(false)}
                className="btn bg-red-500 hover:bg-red-600 text-white border-0 rounded-xl px-8"
              >
                Cerrar
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-black opacity-50" onClick={() => setMostrarModalError(false)}></div>
        </div>
      )}
      {/* Modal de Registro de Socio - CON LOGO */}
      {mostrarModalRegistro && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md bg-white rounded-2xl shadow-2xl">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                {logoSrc && (
                  <img
                    src={logoSrc}
                    alt="Logo McRaulo"
                    className="h-30 w-auto object-contain"
                  />
                )}
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
                  <span><strong>PROMOS</strong> imperdibles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span><strong>Descuento</strong> cumplañero</span>
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
      {/* Modal - Método de Pago No Seleccionado */}
      {mostrarModalMetodoPago && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md bg-white rounded-2xl shadow-2xl">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                {logoSrc && (
                  <img
                    src={logoSrc}
                    alt="Logo McRaulo"
                    className="h-30 w-auto object-contain"
                  />
                )}
              </div>


              <h3 className="font-bold text-2xl text-gray-800 mb-2">
                Selecciona un método de pago
              </h3>
              <p className="text-gray-600 text-lg">
                Por favor elige cómo deseas pagar antes de continuar
              </p>
            </div>

            <div className="modal-action justify-center">
              <button
                onClick={() => setMostrarModalMetodoPago(false)}
                className="btn bg-amber-500 hover:bg-amber-600 text-white border-0 rounded-xl px-8"
              >
                Entendido
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-black opacity-50" onClick={() => setMostrarModalMetodoPago(false)}></div>
        </div>
      )}

      {/* Modal - Gracias por tu compra */}
      {mostrarModalGracias && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md bg-white rounded-2xl shadow-2xl">
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-bold text-3xl text-gray-800 mb-2">
                ¡Gracias por tu compra!
              </h3>
              <p className="text-gray-600 text-lg">
                Tu pedido ha sido procesado exitosamente
              </p>
            </div>

            <div className="modal-action justify-center">
              <button
                onClick={() => {
                  setMostrarModalGracias(false);
                  navigate('/');
                }}
                className="btn bg-green-500 hover:bg-green-600 text-white border-0 rounded-xl px-8"
              >
                Volver al inicio
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-black opacity-50" onClick={() => {
            setMostrarModalGracias(false);
            navigate('/');
          }}></div>
        </div>
      )}

      {/* Socio */}
      <div className="card bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-xl mb-6 border border-slate-600 rounded-2xl">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-2">¿Eres socio McRaulo?</h2>
          <p className="text-sm mb-4 text-slate-200">¡Obtén un 15% de descuento!</p>

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
                <p className="text-sm text-slate-300">Ahorro: ${formatearPrecio(descuentoAplicado)}</p>              </div>
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

          <div className="flex flex-col gap-5">
            <button
              onClick={() => setMetodoPago("Efectivo")}
              className={`btn flex-1 border-2 rounded-xl transition-all duration-200 h-16 text-lg shadow-none ${metodoPago === "Efectivo"
                ? "bg-green-50 text-green-700 border-green-500 hover:bg-green-100"
                : "bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-gray-50"
                }`}
            >
              {metodoPago === "Efectivo" && (
                <span className="mr-2 text-green-600 font-bold">✓</span>
              )}
              {texts.cash}
            </button>

            <button
              onClick={() => setMetodoPago("Tarjeta")}
              className={`btn flex-1 border-2 rounded-xl transition-all duration-200 h-16 text-lg shadow-none ${metodoPago === "Tarjeta"
                ? "bg-green-50 text-green-700 border-green-500 hover:bg-green-100"
                : "bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-gray-50"
                }`}
            >
              {metodoPago === "Tarjeta" && (
                <span className="mr-2 text-green-600 font-bold">✓</span>
              )}
              {texts.card}
            </button>

            <button
              onClick={() => setMetodoPago("mercadopago")}
              className={`btn flex-1 border-2 rounded-xl transition-all duration-200 h-16 text-lg shadow-none ${metodoPago === "mercadopago"
                ? "bg-green-50 text-green-700 border-green-500 hover:bg-green-100"
                : "bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-gray-50"
                }`}
            >
              {metodoPago === "mercadopago" && (
                <span className="mr-2 text-green-600 font-bold">✓</span>
              )}
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
            {carrito.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex justify-between items-center py-3 border-b border-gray-100">
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="w-16 h-16 rounded-lg object-cover border-2 border-gray-100"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-lg">{item.nombre}</p>
                    <p className="text-sm text-gray-500">
                      {texts.quantity}: {item.cantidad} × ${formatearPrecio(item.precio)}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-gray-800 text-xl ml-4">
                  ${formatearPrecio(item.precio * item.cantidad)}
                </p>
              </div>
            ))}
          </div>

          <div className="divider"></div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-lg text-gray-700">
              <span>Subtotal:</span>
              <span>${formatearPrecio(calcularSubtotal())}</span>
            </div>

            {descuentoAplicado > 0 && (
              <div className="flex justify-between items-center text-lg text-green-600">
                <span>Descuento Socio (15%):</span>
                <span>-${formatearPrecio(descuentoAplicado)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-2xl font-bold text-gray-800 bg-amber-50 p-3 rounded-xl">
              <span>{texts.total}:</span>
              <span className="text-amber-600">${formatearPrecio(calcularTotal())}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de confirmación */}
      <div className="card bg-white shadow-xl border-2 border-gray-100 rounded-2xl">
        <div className="card-body">
          <button
            onClick={confirmarPedido}
            className="btn btn-lg w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white border-0"
          >
            {procesando ? (
              <>
                <span className="loading loading-spinner"></span>
                {texts.processing}
              </>
            ) : (
              `${texts.confirmOrder} - $${formatearPrecio(calcularTotal())}`
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
