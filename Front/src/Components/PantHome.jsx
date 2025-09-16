import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PantHome = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("es"); // idioma por defecto: español

  // Diccionario básico de idiomas
  const texts = {
    es: {
      start: "Iniciar Pedido",
      language: "Idioma",
      takeaway: "Para Llevar",
      dinein: "Consumir en el Local",
    },
    en: {
      start: "Start Order",
      language: "Language",
      takeaway: "Takeaway",
      dinein: "Dine In",
    },
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-6">
      {/* Contenedor principal para posicionamiento */}
      <div className="fixed top-6 right-6 z-10">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="select select-bordered select-sm md:select-md shadow-md"
        >
          <option value="es">🇪🇸 Español</option>
          <option value="en">🇬🇧 English</option>
        </select>
      </div>

      {/* Tarjeta de bienvenida centrada */}
      <div className="card w-full max-w-sm md:max-w-md bg-base-200 shadow-2xl rounded-2xl p-6 md:p-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary-content mb-8">
          Bienvenido
        </h1>
        
        {/* Botón principal grande y destacado */}
        <button
          onClick={() => navigate("/menu")}
          className="btn btn-warning btn-lg w-full mb-6 text-xl md:text-2xl"
        >
          {texts[language].start}
        </button>
        
        {/* Botones secundarios */}
        <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
          <button className="btn btn-outline btn-success flex-1">
            {texts[language].takeaway}
          </button>
          <button className="btn btn-outline btn-info flex-1">
            {texts[language].dinein}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PantHome;