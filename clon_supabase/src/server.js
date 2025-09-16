/*import "dotenv/config";
import express from "express";
import pgp from "pg-promise";*/

// server.js - CORREGIDO
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import pgp from "pg-promise";
import cors from "cors"; //Front

const app = express();
app.use(express.json());
 
// Configuración de CORS
// Esto permite peticiones desde http://localhost:5173
app.use(cors({
  origin: "http://localhost:5173"
}));

// Función de utilidad para manejar errores de forma consistente
const handleError = (res, error, message = "Error interno del servidor") => {
  console.error(message, error);
  res.status(500).json({ message, error: error.message });
};

// --- Configuración de la conexión a la base de datos con pg-promise ---
const initOptions = {};
const pgpromise = pgp(initOptions);

const db = pgpromise({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
}); 
// Configuración más robusta de pg-promise
/*const initOptions = {
  connect(client, dc, useCount) {
    console.log('🔗 Conectando a la base de datos...');
  },
  disconnect(client, dc) {
    console.log('🔌 Desconectado de la base de datos');
  },
  error(err, e) {
    console.log('❌ Error de base de datos:', err.message);
  }
};

const pgpromise = pgp(initOptions);

// Verifica que la variable de entorno existe
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida en las variables de entorno');
  process.exit(1);
}

console.log('🔍 Intentando conectar con:', process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@'));

const db = pgpromise({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // máximo de conexiones
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
*/
// --- Importar las rutas modularizadas y el middleware de autenticación ---
import clientesRoutes from "./routes/clientes.js";
import cuponesRoutes from "./routes/cupones.js";
import cuponesPredefinidosRoutes from "./routes/cupones_predefinidos.js";
import estadosPedidoRoutes from "./routes/estados_pedido.js";
import ingredientesRoutes from "./routes/ingredientes.js";
import pedidosRoutes from "./routes/pedidos.js";
import pedidosProductosRoutes from "./routes/pedidos_productos.js";
import pedidosProductosIngredientesRoutes from "./routes/pedidos_productos_ingredientes.js";
import productosRoutes from "./routes/productos.js";
import productosIngredientesBaseRoutes from "./routes/productos_ingredientes_base.js";
import tiposContribuyenteRoutes from "./routes/tipos_contribuyente.js";
import tiposPagoRoutes from "./routes/tipos_pago.js";
import authRoutes from './routes/auth.js';
import verifyToken from './middlewares/authmiddleware.js';

// --- Iniciar la conexión a la base de datos y luego el servidor ---
db.connect()
  .then((obj) => {
    console.log("✅ Conectado exitosamente a la base de datos PostgreSQL");
    obj.done();
    // Libera la conexión de prueba

    // 🔄 Mantener viva la conexión a Supabase con un ping cada 30 segundos
    setInterval(async () => {
      try {
        await db.one("SELECT 1");
        console.log("🔄 Ping a Supabase exitoso");
      } catch (error) {
        console.error("❌ Supabase no responde al ping:", error.message);
      }
    }, 30000); // cada 30 segundos

    // Usar las rutas en la aplicación Express
    app.use("/api/clientes", verifyToken, clientesRoutes(db, handleError));
    app.use("/api/cupones", cuponesRoutes(db, handleError));
    app.use("/api/cupones_predefinidos", cuponesPredefinidosRoutes(db, handleError));
    app.use("/api/estados_pedido", estadosPedidoRoutes(db, handleError));
    app.use("/api/ingredientes", ingredientesRoutes(db, handleError));
    app.use("/api/pedidos", pedidosRoutes(db, handleError));
    app.use("/api/pedidos_productos", pedidosProductosRoutes(db, handleError));
    app.use("/api/pedidos_productos_ingredientes", pedidosProductosIngredientesRoutes(db, handleError));
    app.use("/api/productos", productosRoutes(db, handleError));
    app.use("/api/productos_ingredientes_base", productosIngredientesBaseRoutes(db, handleError));
    app.use("/api/tipos_contribuyente", tiposContribuyenteRoutes(db, handleError));
    app.use("/api/tipos_pago", tiposPagoRoutes(db, handleError));
    app.use('/api/auth', authRoutes(db, handleError));

    // Endpoint de status
    app.get("/api/status", async (req, res) => {
      try {
        // Verifica si la DB responde correctamente
        await db.one("SELECT 1");
        res.json({
          express: "OK",
          supabase: "OK",
        });
      } catch (error) {
        // Supabase no respondió
        res.status(500).json({
          express: "OK",
          supabase: "ERROR",
          error: error.message,
        });
      }
    });

    // Iniciar el servidor SOLO después de que la conexión a la DB es exitosa y las rutas están cargadas
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error crítico al conectar:', error.message);
    console.log('💡 Verifica:');
    console.log('1. Que DATABASE_URL esté correcta en .env');
    console.log('2. Que la base de datos esté activa en Supabase');
    console.log('3. Que las credenciales sean correctas');
    console.log('4. Que tu IP esté en la allowlist de Supabase');
    process.exit(1);
  });