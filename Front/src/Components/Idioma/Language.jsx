import { createContext, useContext, useState, useEffect } from 'react';

const Language = createContext();

export const useLanguage = () => {
  const context = useContext(Language);
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('es');

  // Cargar idioma guardado al iniciar
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Guardar idioma cuando cambie
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Diccionario de traducciones
  const texts = {
    es: {
      // Home
      start: "Iniciar Pedido",
      language: "Idioma",
      takeaway: "Para Llevar",
      dinein: "Consumir en el Local",
      welcome: "Bienvenido a McRaulo",
      selectOption: "Selecciona una opción:",
      pleaseSelect: "Por favor, selecciona una opción primero",
      
      // Navegación
      home: "Inicio",
      menu: "Menú",
      cart: "Carrito",
      payment: "Pago",
      
      // Menu
      menuTitle: "Menú Completo",
      hamburgers: "Hamburguesas",
      fries: "Papas Fritas",
      drinks: "Bebidas",
      addToCart: "+ Agregar al carrito",
      viewCart: "Ver Carrito",
      howToOrder: "¿Cómo ordenar?",
      howToOrderText: "Haz clic en cualquier producto para agregarlo al carrito. Puedes combinar hamburguesas, papas y bebidas para armar tu combo perfecto.",
      slideMore: "Desliza horizontalmente para ver más",
      price: "Precio",
      
      // Carrito
      cartTitle: "Tu Carrito",
      emptyCart: "Tu carrito está vacío",
      startShopping: "Comienza a agregar productos",
      quantity: "Cantidad",
      total: "Total",
      continueShopping: "Seguir Comprando",
      proceedPayment: "Proceder al Pago",
      remove: "Eliminar",
      
      // Pago
      paymentTitle: "Método de Pago",
      cash: "Efectivo",
      card: "Tarjeta",
      orderSummary: "Resumen del Pedido",
      confirmOrder: "Confirmar Pedido",
      processing: "Procesando...",
      
      // Mensajes
      addedToCart: "agregado al carrito",
      removedFromCart: "eliminado del carrito",
    },
    en: {
      // Home
      start: "Start Order",
      language: "Language",
      takeaway: "Takeaway",
      dinein: "Dine In",
      welcome: "Welcome to McRaulo",
      selectOption: "Select an option:",
      pleaseSelect: "Please select an option first",
      
      // Navigation
      home: "Home",
      menu: "Menu",
      cart: "Cart",
      payment: "Payment",
      
      // Menu
      menuTitle: "Full Menu",
      hamburgers: "Burgers",
      fries: "French Fries",
      drinks: "Drinks",
      addToCart: "+ Add to cart",
      viewCart: "View Cart",
      howToOrder: "How to order?",
      howToOrderText: "Click on any product to add it to your cart. You can combine burgers, fries and drinks to create your perfect combo.",
      slideMore: "Slide horizontally to see more",
      price: "Price",
      
      // Cart
      cartTitle: "Your Cart",
      emptyCart: "Your cart is empty",
      startShopping: "Start adding products",
      quantity: "Quantity",
      total: "Total",
      continueShopping: "Continue Shopping",
      proceedPayment: "Proceed to Payment",
      remove: "Remove",
      
      // Payment
      paymentTitle: "Payment Method",
      cash: "Cash",
      card: "Card",
      orderSummary: "Order Summary",
      confirmOrder: "Confirm Order",
      processing: "Processing...",
      
      // Messages
      addedToCart: "added to cart",
      removedFromCart: "removed from cart",
    },
  };

  return (
    <Language.Provider value={{ language, changeLanguage, texts: texts[language] }}>
      {children}
    </Language.Provider>
  );
};