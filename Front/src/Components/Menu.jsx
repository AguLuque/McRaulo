import { useState, useEffect, useCallback, memo, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "./Idioma/Language";
import BarraMenu from "./BarraMenu";

// ---------------------------
// CarouselProductos (fuera de Menu, memoizado)
// ---------------------------
const CarouselProductos = memo(({ productos, tipo, titulo, emoji, texts, agregarAlCarrito, obtenerImagen }) => {
  const carouselRef = useRef(null);
  const scrollPositions = useRef({});

  const handleScroll = () => {
    if (carouselRef.current) {
      scrollPositions.current[tipo] = carouselRef.current.scrollLeft;
    }
  };

  useEffect(() => {
    const lastScroll = scrollPositions.current[tipo];
    if (carouselRef.current && lastScroll !== undefined) {
      carouselRef.current.scrollLeft = lastScroll;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, productos]);

  return (
    <section className="w-full max-w-6xl mb-12">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
        {emoji} {titulo}
      </h2>

      <div
        ref={carouselRef}
        onScroll={handleScroll}
        className="carousel carousel-center rounded-box max-w-full space-x-4 p-4 w-full"
      >
        {productos.map((producto) => {
          const imagenProducto = obtenerImagen(tipo, producto.nombre);

          return (
            <div key={producto.id_producto} className="carousel-item">
              <div className="card bg-white border-2 border-gray-100 shadow-lg w-80 flex-shrink-0 hover:shadow-xl transition-all duration-300 rounded-2xl">
                <figure className="h-48 w-full overflow-hidden bg-gray-50 rounded-t-2xl">
                  {imagenProducto ? (
                    <img
                      src={imagenProducto}
                      alt={producto.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <span className="text-4xl">{emoji}</span>
                    </div>
                  )}
                </figure>

                <div className="card-body">
                  <h3 className="card-title text-center text-gray-800">{producto.nombre}</h3>
                  <p className="text-sm text-center text-gray-500">{producto.descripcion}</p>
                  <p className="text-xl font-semibold mt-2 text-center text-gray-700">
                    {texts.price}: ${producto.precio_base}
                  </p>

                  <div className="card-actions justify-center mt-4">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        agregarAlCarrito(producto, tipo);
                      }}
                      className="btn bg-green-500 hover:bg-green-600 text-white border-0 btn-sm hover:scale-105 transition-transform rounded-xl"
                    >
                      {texts.addToCart}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-500">
          {texts.slideMore} {titulo.toLowerCase()} →
        </p>
      </div>
    </section>
  );
});
CarouselProductos.displayName = "CarouselProductos";

// ---------------------------
// Componente Menu
// ---------------------------
const Menu = () => {
  const { texts } = useLanguage();
  const [hamburguesas, setHamburguesas] = useState([]);
  const [papas, setPapas] = useState([]);
  const [bebidas, setBebidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carrito, setCarrito] = useState([]);

  const navigate = useNavigate();

  // Cargar imágenes dinámicamente
  const imagenesHamburguesas = import.meta.glob("../assets/imagenes/hamburguesas/*.webp", { eager: true });
  const imagenesBebidas = import.meta.glob("../assets/imagenes/bebidas/*.webp", { eager: true });
  const imagenesPapas = import.meta.glob("../assets/imagenes/papas/*.webp", { eager: true });

  const mapeoImagenes = {
    "McRaulo Cheese": "cheddar",
    "McRaulo Veggie": "vegana",
    "McRaulo Pollo": "pollo",
    "Papas fritas": "fritas",
    "Papas con cheddar": "fritascheddar",
    "Sprite": "sprite",
    "Fanta": "fanta",
    "Limonada": "limonada",
    "Agua mineral": "agua",
    "Coca-Cola": "coca",
  };

  const obtenerImagen = useCallback((tipo, nombreProducto) => {
    let imagenes;
    let carpeta;

    switch (tipo) {
      case "hamburguesa":
        imagenes = imagenesHamburguesas;
        carpeta = "hamburguesas";
        break;
      case "bebida":
        imagenes = imagenesBebidas;
        carpeta = "bebidas";
        break;
      case "papa":
        imagenes = imagenesPapas;
        carpeta = "papas";
        break;
      default:
        return null;
    }

    const nombreArchivo = mapeoImagenes[nombreProducto];
    if (!nombreArchivo) {
      console.warn(`No se encontró imagen para: ${nombreProducto}`);
      return null;
    }

    const rutaCompleta = `../assets/imagenes/${carpeta}/${nombreArchivo}.webp`;
    const imagenKey = Object.keys(imagenes).find((key) => key === rutaCompleta);
    return imagenKey ? imagenes[imagenKey].default : null;
  }, [imagenesHamburguesas, imagenesBebidas, imagenesPapas, mapeoImagenes]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const [hamburguesasRes, papasRes, bebidasRes] = await Promise.all([
          axios.get("http://localhost:3000/api/productos/hamburguesas"),
          axios.get("http://localhost:3000/api/productos/papas"),
          axios.get("http://localhost:3000/api/productos/bebidas"),
        ]);

        setHamburguesas(hamburguesasRes.data);
        setPapas(papasRes.data);
        setBebidas(bebidasRes.data);
        setLoading(false);
      } catch (err) {
        setError("No se pudo cargar el menú. Intenta de nuevo más tarde.");
        setLoading(false);
        console.error("Error fetching data: ", err);
      }
    };

    fetchProductos();

    const carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) setCarrito(JSON.parse(carritoGuardado));
  }, []);

  const agregarAlCarrito = useCallback(
    (producto, tipo) => {
      const productoCarrito = {
        id: producto.id_producto,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio_base,
        imagen: obtenerImagen(tipo, producto.nombre),
        cantidad: 1,
        tipo,
      };

      setCarrito((prev) => {
        const existe = prev.find((p) => p.id === producto.id_producto);
        const nuevo = existe
          ? prev.map((p) => (p.id === producto.id_producto ? { ...p, cantidad: p.cantidad + 1 } : p))
          : [...prev, productoCarrito];

        localStorage.setItem("carrito", JSON.stringify(nuevo));
        return nuevo;
      });

      // toast simple
      const toast = document.createElement("div");
      toast.className = "toast toast-top toast-center";
      toast.innerHTML = `<div class="alert alert-success bg-green-500 text-white border-0"><span>✓ ${producto.nombre} ${texts.addedToCart}</span></div>`;
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 2000);
    },
    [obtenerImagen, texts.addedToCart]
  );

  const cartCount = carrito.reduce((total, item) => total + item.cantidad, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <span className="loading loading-spinner text-amber-500 loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 p-4 space-y-8 pb-20">
      {/* Header con carrito */}
      <div className="flex justify-between items-center w-full max-w-6xl mb-8">
        <h1 className="text-4xl text-center font-bold flex-1 text-gray-800">{texts.menuTitle}</h1>
      </div>

      {/* Carousels */}
      <CarouselProductos
        productos={hamburguesas}
        tipo="hamburguesa"
        titulo={texts.hamburgers}
        texts={texts}
        agregarAlCarrito={agregarAlCarrito}
        obtenerImagen={obtenerImagen}
      />

      <CarouselProductos
        productos={papas}
        tipo="papa"
        titulo={texts.fries}
        texts={texts}
        agregarAlCarrito={agregarAlCarrito}
        obtenerImagen={obtenerImagen}
      />

      <CarouselProductos
        productos={bebidas}
        tipo="bebida"
        titulo={texts.drinks}
        texts={texts}
        agregarAlCarrito={agregarAlCarrito}
        obtenerImagen={obtenerImagen}
      />

      {/* Instrucciones */}
      <div className="text-center mt-8 p-6 bg-white rounded-2xl border-2 border-gray-100 shadow-lg max-w-2xl">
        <p className="text-lg font-semibold mb-2 text-gray-800">{texts.howToOrder}</p>
        <p className="text-gray-500">{texts.howToOrderText}</p>
      </div>

      {/* Barra de navegación */}
      <BarraMenu cartCount={cartCount} />
    </div>
  );
};

export default Menu;