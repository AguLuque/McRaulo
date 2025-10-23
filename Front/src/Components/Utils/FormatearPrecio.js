/**
 * @param {number} precio 
 * @returns {string} 
 */
export const formatearPrecio = (precio) => {
  const precioRedondeado = Math.round(precio * 100) / 100;
  
  // Si el precio es un número entero (sin decimales), formatea sin decimales
  if (precioRedondeado % 1 === 0) {
    return precioRedondeado.toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
  
  // Si tiene decimales, los muestra
  return precioRedondeado.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
