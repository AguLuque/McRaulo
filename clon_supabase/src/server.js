import dotenv from "dotenv";
dotenv.config();

import express from "express";
import pgp from "pg-promise";
import cors from "cors";

const app = express();
app.use(express.json());
 
// Configuración de CORS
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

// --- Importar las rutas modularizadas y el middleware de autenticación ---
import estadosPedidoRoutes from "./routes/estados_pedido.js";
import ingredientesRoutes from "./routes/ingredientes.js";
import pedidosRoutes from "./routes/pedidos.js";
import pedidosProductosRoutes from "./routes/pedidos_productos.js";
import pedidosProductosIngredientesRoutes from "./routes/pedidos_productos_ingredientes.js";
import productosRoutes from "./routes/productos.js";
import productosIngredientesBaseRoutes from "./routes/productos_ingredientes_base.js";
import tiposPagoRoutes from "./routes/tipos_pago.js";
import authRoutes from './routes/auth.js';
import verifyToken from './middlewares/authmiddleware.js';
import sociosRoutes from "./routes/socios.js";

// --- Iniciar la conexión a la base de datos y luego el servidor ---
db.connect()
  .then((obj) => {
    console.log("✅ Conectado exitosamente a la base de datos PostgreSQL");
    obj.done();

    // 🔄 Mantener viva la conexión a Supabase con un ping cada 30 segundos
    setInterval(async () => {
      try {
        await db.one("SELECT 1");
        console.log("🔄 Ping a Supabase exitoso");
      } catch (error) {
        console.error("❌ Supabase no responde al ping:", error.message);
      }
    }, 30000);

    // ✅ Rutas limpias - Solo las que usás
    app.use("/api/estados_pedido", estadosPedidoRoutes(db, handleError));
    app.use("/api/ingredientes", ingredientesRoutes(db, handleError));
    app.use("/api/pedidos", pedidosRoutes(db, handleError));
    app.use("/api/pedidos_productos", pedidosProductosRoutes(db, handleError));
    app.use("/api/pedidos_productos_ingredientes", pedidosProductosIngredientesRoutes(db, handleError));
    app.use("/api/productos", productosRoutes(db, handleError));
    app.use("/api/productos_ingredientes_base", productosIngredientesBaseRoutes(db, handleError));
    app.use("/api/tipos_pago", tiposPagoRoutes(db, handleError));
    app.use('/api/auth', authRoutes(db, handleError));
    app.use("/api/socios", sociosRoutes(db, handleError));

    // Endpoint de status
    app.get("/api/status", async (req, res) => {
      try {
        await db.one("SELECT 1");
        res.json({
          express: "OK",
          supabase: "OK",
        });
      } catch (error) {
        res.status(500).json({
          express: "OK",
          supabase: "ERROR",
          error: error.message,
        });
      }
    });

    // Iniciar el servidor
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
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