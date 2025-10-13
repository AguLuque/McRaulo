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
        <div ref={ref} className="p-8 bg-white text-black" style={{ width: '80mm', fontFamily: 'monospace' }}>
            {/* Header */}
            <div className="text-center mb-4">
                <h1 className="text-2xl font-bold">🍔 McRaulo</h1>
                <p className="text-xs">--------------------------------</p>
            </div>

            {/* Info del pedido */}
            <div className="mb-4 text-sm">
                <p><strong>Orden #:</strong> {numeroOrden}</p>
                <p><strong>Fecha:</strong> {fecha}</p>
                <p><strong>Tipo:</strong> {tipoConsumo === 'llevar' ? texts.takeaway : texts.dinein}</p>
                <p className="text-xs">--------------------------------</p>
            </div>

            {/* Productos */}
            <div className="mb-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="text-left">Producto</th>
                            <th className="text-center">Cant</th>
                            <th className="text-right">Precio</th>
                            <th className="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {carrito.map((item, index) => (
                            <tr key={index} className="border-b border-dashed border-gray-400">
                                <td className="py-2">{item.nombre}</td>
                                <td className="text-center">{item.cantidad}</td>
                                <td className="text-right">${item.precio}</td>
                                <td className="text-right">${(item.precio * item.cantidad).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totales */}
            <div className="mb-4 text-sm">
                <p className="text-xs">--------------------------------</p>
                <div className="flex justify-between py-1">
                    <span>Subtotal:</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 text-lg font-bold">
                    <span>TOTAL:</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                <p className="text-xs">--------------------------------</p>
            </div>

            {/* Método de pago */}
            <div className="mb-4 text-sm">
                <p>
                    <strong>Método de Pago:</strong>{' '}
                    {metodoPago === 'Efectivo'
                        ? texts.cash
                        : metodoPago === 'Tarjeta'
                            ? texts.card
                            : metodoPago === 'mercadopago'
                                ? 'Mercado Pago'
                                : metodoPago}
                </p>
            </div> 

            {/* Footer */}
            <div className="text-center text-xs mt-6">
                <p>Gracias por su compra...</p>
            <p>¡Vuelva pronto!</p>
                <p className="mt-2">McRaulo - 2025</p>
            </div>

        </div>

    );
});

Ticket.displayName = 'Ticket';

export default Ticket;