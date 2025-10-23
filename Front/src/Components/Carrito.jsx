import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "./Idioma/Language";
import BarraMenu from "./BarraMenu";
import { formatearPrecio } from './Utils/FormatearPrecio';

const Carrito = () => {
  const { texts } = useLanguage();
  const [carrito, setCarrito] = useState([]);
  const [mostrarModalNotas, setMostrarModalNotas] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const [notasTemporal, setNotasTemporal] = useState("");
  const navigate = useNavigate();
  const imagenesLogo = import.meta.glob("../assets/imagenes/logo/*.webp", { eager: true });
  const logoSrc = imagenesLogo["../assets/imagenes/logo/Logo.webp"]?.default;
  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    }
  }, []);

  const actualizarCantidad = (index, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(index);
      return;
    }

    const nuevoCarrito = [...carrito];
    nuevoCarrito[index] = { ...nuevoCarrito[index], cantidad: nuevaCantidad };

    setCarrito(nuevoCarrito);
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
  };

  const eliminarDelCarrito = (index) => {
    const nuevoCarrito = carrito.filter((_, i) => i !== index);
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

  // Abrir modal para agregar/editar notas
  const abrirModalNotas = (item, index) => {
    setItemEditando({ ...item, index });
    setNotasTemporal(item.notas || "");
    setMostrarModalNotas(true);
  };

  // Guardar notas personalizadas
  const guardarNotas = () => {
    if (itemEditando === null) return;

    const nuevoCarrito = [...carrito];
    nuevoCarrito[itemEditando.index] = {
      ...nuevoCarrito[itemEditando.index],
      notas: notasTemporal.trim()
    };

    setCarrito(nuevoCarrito);
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));

    cerrarModalNotas();
  };

  // Cerrar modal
  const cerrarModalNotas = () => {
    setMostrarModalNotas(false);
    setItemEditando(null);
    setNotasTemporal("");
  };

  // Sugerencias rápidas de personalización
  const sugerenciasPersonalizacion = [
    "Sin cebolla",
    "Sin tomate",
    "Sin lechuga",
    "Sin pepinillos",
    "Extra queso",
    "Extra bacon",
    "Bien cocida",
    "Punto medio",
    "Sin mayonesa",
    "Extra salsa"
  ];

  const agregarSugerencia = (sugerencia) => {
    if (notasTemporal.includes(sugerencia)) return;

    const nuevaNota = notasTemporal
      ? `${notasTemporal}, ${sugerencia}`
      : sugerencia;

    setNotasTemporal(nuevaNota);
  };

  const cartCount = carrito.reduce((total, item) => total + item.cantidad, 0);

  if (carrito.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 bg-gray-50">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-800"> Tu Carrito está Vacío</h2>

          {/* Logo en lugar del emoji */}
          <div className="mb-4 flex justify-center">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt="Logo McRaulo"
                className="h-60 w-auto object-contain opacity-50"
              />
            ) : (
              <div className="text-6xl"></div>
            )}
          </div>

          <button
            onClick={volverAlMenu}
            className="btn bg-amber-500 hover:bg-amber-600 text-white border-0 btn-lg rounded-xl"
          >
            Volver al Menú
          </button>
        </div>

        <BarraMenu cartCount={cartCount} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl pt-6 pb-40 bg-gray-50 min-h-screen">

      {/* Modal de Personalización - DaisyUI */}
      {mostrarModalNotas && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg bg-white rounded-2xl shadow-2xl">

            {/* Header del Modal */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-amber-100">
              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-200">
                <img
                  src={itemEditando?.imagen}
                  alt={itemEditando?.nombre}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-800">
                  ✏️ Personaliza tu pedido
                </h3>
                <p className="text-sm text-gray-600">{itemEditando?.nombre}</p>
              </div>
            </div>




            {/* Textarea para notas personalizadas */}
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text font-semibold text-gray-700">
                  Escribe tu personalización:
                </span>
              </label>
              <textarea
                value={notasTemporal}
                onChange={(e) => setNotasTemporal(e.target.value)}
                placeholder="Ej: Sin cebolla, extra queso, bien cocida..."
                className="textarea textarea-bordered h-24 rounded-xl border-2 border-gray-200 focus:border-amber-400 resize-none"
                maxLength={150}
              />
              <label className="label">
                <span className="label-text-alt text-gray-500">
                  {notasTemporal.length}/150 caracteres
                </span>
              </label>
            </div>

            {/* Vista previa de las notas */}
            {notasTemporal && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 mb-4">
                <p className="text-sm font-semibold text-amber-800 mb-1">
                  Vista previa:
                </p>
                <p className="text-sm text-gray-700 italic">
                  "{notasTemporal}"
                </p>
              </div>
            )}

            {/* Botones de acción */}
            <div className="modal-action flex gap-3 mt-6">
              <button
                onClick={cerrarModalNotas}
                className="btn bg-white hover:bg-gray-100 text-gray-700 border-2 border-gray-300 flex-1 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={guardarNotas}
                className="btn bg-amber-500 hover:bg-amber-600 text-white border-0 flex-1 rounded-xl"
              >
                ✓ Guardar
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-black opacity-50" onClick={cerrarModalNotas}></div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {logoSrc && (
            <img
              src={logoSrc}
              alt="Logo McRaulo"
              className="h-25 w-auto object-contain"
            />
          )}
          <h1 className="text-4xl font-bold text-gray-800">{texts.cart}</h1>
        </div>
        <button
          onClick={volverAlMenu}
          className="btn bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 rounded-xl"
        >
          ← {texts.continueShopping}
        </button>
      </div>

      <div className="space-y-4 mb-6">
        {carrito.map((item, index) => (
          <div key={`${item.id}-${index}`} className="card bg-white shadow-lg border-2 border-gray-100 rounded-2xl">
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
                  <p className="text-lg font-bold mt-1 text-gray-700">${formatearPrecio(item.precio)}</p>
                  {/* Mostrar notas si existen */}
                  {item.notas && (
                    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block">
                      <p className="text-xs font-semibold text-amber-800 mb-1">
                        Personalización:
                      </p>
                      <p className="text-sm text-gray-700 italic">
                        {item.notas}
                      </p>
                    </div>
                  )}

                  {/* Botón para personalizar - SOLO para hamburguesas */}
                  {item.tipo === 'hamburguesa' && (
                    <button
                      onClick={() => abrirModalNotas(item, index)}
                      className="btn btn-sm bg-amber-100 hover:bg-amber-200 text-amber-700 border-0 rounded-lg mt-2"
                    >
                      {item.notas ? ' Editar' : ' Personalizar'}
                    </button>
                  )}
                </div>

                {/* Controles de cantidad - SOLO para papas y bebidas */}
                {item.tipo !== 'hamburguesa' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => actualizarCantidad(index, item.cantidad - 1)}
                      className="btn btn-circle btn-sm bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200"
                    >
                      -
                    </button>
                    <span className="mx-3 text-xl font-semibold min-w-[2rem] text-center text-gray-800">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => actualizarCantidad(index, item.cantidad + 1)}
                      className="btn btn-circle btn-sm bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <div className="badge badge-ghost">x1</div>
                )}

                {/* Subtotal */}
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-800">
                    ${formatearPrecio(item.precio * item.cantidad)}
                  </p>
                  <button
                    onClick={() => eliminarDelCarrito(index)}
                    className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50"
                  >
                     {texts.remove}
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
            <span className="text-amber-600">${formatearPrecio(calcularTotal())}</span>
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
