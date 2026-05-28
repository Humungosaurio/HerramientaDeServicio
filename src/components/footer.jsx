import React, { useState } from 'react';

const Footer = () => {
  const [showOptions, setShowOptions] = useState(false);

  const contacto = {
    email: "pedrosequera52@gmail.com",
    whatsapp: "584228011646",
    mensajeWS: "Hola, necesito soporte con el sistema del Simoncito."
  };

  // Función para generar el enlace de Gmail Web
  const abrirGmail = () => {
    const asunto = encodeURIComponent("Soporte Sistema Simoncito");
    const cuerpo = encodeURIComponent("Hola, necesito ayuda con...");
    // Esta URL abre Gmail en el navegador y crea un nuevo correo
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${contacto.email}&su=${asunto}&body=${cuerpo}`;
  };

  return (
    <footer className="w-full bg-white/70 border-t border-gray-100 py-3 relative mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo e Identidad */}
          <div className="flex items-center gap-2">
            <img 
              src="/src/assets/LogoReceptoria.png" 
              alt="Logo" 
              className="w-9 h-9 object-contain"
            />
            <div className="hidden sm:block">
              <p className="font-black text-gray-800 text-[15px] leading-none uppercase">C.E.I SIMONCITO</p>
              <p className="text-[9px] text-gray-800 uppercase font-bold tracking-tighter">San Joaquín, Carabobo</p>
            </div>
          </div>

          {/* Botón Central de Soporte */}
          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="flex items-center gap-2 bg-red/0 text-red-600 px-3 py-1.5 rounded-full border border-black/5 text-[12px] font-bold hover:bg-red-100 transition-all shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              SOPORTE TÉCNICO
            </button>

            {showOptions && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-5 w-65 bg-white/90 border border-gray-200 shadow-xl rounded-xl p-2 z-50">
                <div className="flex flex-col gap-1">
                  {/* WHATSAPP */}
                  <a 
                    href={`https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(contacto.mensajeWS)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-200 text-green-600 transition-colors"
                  >
                    <span className="text-base">💬</span>
                    <span className="text-[10px] font-bold uppercase">WhatsApp</span>
                  </a>

                  {/* GMAIL EN NAVEGADOR */}
                  <a 
                    href={abrirGmail()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-200 text-red-600 transition-colors"
                  >
                    <span className="text-base">📧</span>
                    <span className="text-[10px] font-bold uppercase">Gmail Web</span>
                  </a>
                </div>
                {/* Flechita */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-gray-200 rotate-45"></div>
              </div>
            )}
          </div>

          {/* Copyright */}
          <div className="text-[13px] text-gray-800 font-bold uppercase tracking-widest">
            © 2026 Receptoría
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;