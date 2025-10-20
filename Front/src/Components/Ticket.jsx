import { forwardRef } from 'react';
import { useLanguage } from './Idioma/Language';


const Ticket = forwardRef(({ carrito, total, metodoPago, tipoConsumo, numeroOrden }, ref) => {
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
                            <tr key={index} className="border-b border-gray-100">
                                <td className="py-3 text-gray-700">{item.nombre}</td>
                                <td className="text-center text-gray-600">{item.cantidad}</td>
                                <td className="text-right text-gray-600">${item.precio}</td>
                                <td className="text-right font-semibold text-gray-800">${(item.precio * item.cantidad).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totales */}
            <div className="mb-6 text-sm bg-amber-50 p-3 rounded-lg">
                <div className="flex justify-between py-1 text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 text-xl font-bold text-amber-600 border-t-2 border-amber-200 mt-2 pt-2">
                    <span>TOTAL:</span>
                    <span>${total.toFixed(2)}</span>
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

Ticket.displayName = 'Ticket';

export default Ticket;