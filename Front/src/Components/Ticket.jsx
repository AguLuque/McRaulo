import { forwardRef, useEffect } from 'react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from './Idioma/Language';
import { formatearPrecio } from './Utils/FormatearPrecio';
export { TicketComponent };

// Componente interno del ticket (para imprimir)
const TicketComponent = forwardRef(({ carrito, total, metodoPago, tipoConsumo, numeroOrden }, ref) => {
    const { texts } = useLanguage();

    const fecha = new Date().toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div ref={ref} className="p-8 bg-white text-gray-800 shadow-lg rounded-2xl border-2 border-gray-100" style={{ width: '80mm', fontFamily: 'monospace' }}>
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">McRaulo</h1>
                <p className="text-xs text-gray-400 mt-2">--------------------------------</p>
            </div>

            {/* Info del pedido */}
            <div className="mb-6 text-sm bg-gray-50 p-3 rounded-lg">
                <p className="mb-1"><strong className="text-gray-700">Orden #:</strong> <span className="text-gray-600">{numeroOrden}</span></p>
                <p className="mb-1"><strong className="text-gray-700">Fecha:</strong> <span className="text-gray-600">{fecha}</span></p>
                <p><strong className="text-gray-700">Tipo:</strong> <span className="text-gray-600">{tipoConsumo === 'llevar' ? texts.takeaway : texts.dinein}</span></p>
            </div>

            {/* Productos */}
            <div className="mb-6">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-2 text-gray-700">Producto</th>
                            <th className="text-center py-2 text-gray-700">Cant</th>
                            <th className="text-right py-2 text-gray-700">Precio</th>
                            <th className="text-right py-2 text-gray-700">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {carrito.map((item, index) => (
                            <React.Fragment key={`item-${index}`}>
                                <tr className="border-b border-gray-100">
                                    <td className="py-3 text-gray-700">{item.nombre}</td>
                                    <td className="text-center text-gray-600">{item.cantidad}</td>
                                    <td className="text-right text-gray-600">${formatearPrecio(item.precio)}</td>
                                    <td className="text-right font-semibold text-gray-800">${formatearPrecio(item.precio * item.cantidad)}</td>
                                </tr>
                                {/* Mostrar notas si existen */}
                                {item.notas && (
                                    <tr>
                                        <td colSpan="4" className="py-1 px-2 text-xs text-gray-600 italic bg-amber-50 border-l-2 border-amber-300">
                                            {item.notas}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totales */}
            <div className="mb-6 text-sm bg-amber-50 p-3 rounded-lg">
                <div className="flex justify-between py-1 text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${formatearPrecio(total)}</span>
                </div>
                <div className="flex justify-between py-2 text-xl font-bold text-amber-600 border-t-2 border-amber-200 mt-2 pt-2">
                    <span>TOTAL:</span>
                    <span>${formatearPrecio(total)}</span>
                </div>
            </div>

            {/* Método de pago */}
            <div className="mb-6 text-sm bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-700">
                    <strong>Método de Pago:</strong>{' '}
                    <span className="text-gray-600">
                        {metodoPago === 'Efectivo'
                            ? texts.cash
                            : metodoPago === 'Tarjeta'
                                ? texts.card
                                : metodoPago === 'mercadopago'
                                    ? 'Mercado Pago'
                                    : metodoPago}
                    </span>
                </p>
            </div>

            {/* Footer */}
            <div className="text-center text-xs mt-6 text-gray-500">
                <p className="mb-1">Gracias por su compra</p>
                <p className="mb-3">¡Vuelva pronto!</p>
                <p className="text-gray-400">McRaulo © 2025</p>
            </div>
        </div>
    );
});

TicketComponent.displayName = 'TicketComponent';

// Página principal del Ticket
const Ticket = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Recibir los datos desde el state de la navegación
    const {
        carrito,
        total,
        metodoPago,
        tipoConsumo,
        numeroOrden,
        cuponProximaCompra
    } = location.state || {};

    // 🔹 LIMPIAMOS EL CARRITO AUTOMÁTICAMENTE AL LLEGAR AL TICKET
    useEffect(() => {
        // Limpiamos el carrito del localStorage
        localStorage.removeItem('carrito');
        
        // Guardamos cupones si existen
        if (cuponProximaCompra) {
            const cupones = JSON.parse(localStorage.getItem('cupones') || '[]');
            cupones.push(cuponProximaCompra);
            localStorage.setItem('cupones', JSON.stringify(cupones));
        }
    }, []); // Se ejecuta solo una vez al montar el componente

    // Si no hay datos, redirigir al home
    if (!carrito || !numeroOrden) {
        navigate('/');
        return null;
    }

    const finalizarPedido = () => {
        // Ya limpiamos el carrito en el useEffect, solo navegamos
        navigate('/', { replace: true });
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl pt-6 pb-20 bg-gray-50 min-h-screen">
            <div className="text-center mb-6">
                <h1 className="text-4xl font-bold mb-4 text-gray-800">¡Pedido Confirmado!</h1>
                <p className="text-xl text-gray-600">Orden #{numeroOrden}</p>
            </div>

            <div className="flex justify-center mb-6">
                <div className="border-4 border-dashed border-gray-200 rounded-2xl p-4 bg-white">
                    <TicketComponent
                        carrito={carrito}
                        total={total}
                        metodoPago={metodoPago}
                        tipoConsumo={tipoConsumo}
                        numeroOrden={numeroOrden}
                    />
                </div>
            </div>

            {cuponProximaCompra && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-6">
                    <div>
                        <h3 className="font-bold text-green-700 text-lg">¡Cupón de descuento generado!</h3>
                        <p className="text-green-600">Código: <strong>{cuponProximaCompra.codigo}</strong></p>
                        <p className="text-green-600">{cuponProximaCompra.descuento}% OFF en tu próxima compra</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-4">
                <button
                    onClick={finalizarPedido}
                    className="btn bg-amber-500 hover:bg-amber-600 text-white border-0 btn-lg rounded-xl"
                >
                    Volver a Home
                </button>
            </div>
        </div>
    );
};

export default Ticket;