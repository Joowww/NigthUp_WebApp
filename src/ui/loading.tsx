const Loadder = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[100px]">
      {/* Inyectamos los estilos aquí mismo para no depender de librerías externas 
         ni archivos CSS sueltos. 
      */}
      <style>
        {`
          .night-up-loader {
            height: 60px;
            aspect-ratio: 2;
            border-bottom: 3px solid transparent;
            /* Color de la línea base (grisáceo oscuro) */
            background: linear-gradient(90deg, #3f3f46 50%, transparent 0) -25% 100%/50% 3px repeat-x border-box;
            position: relative;
            animation: l3-0 0.75s linear infinite;
          }
          .night-up-loader:before {
            content: "";
            position: absolute;
            inset: auto 42.5% 0;
            aspect-ratio: 1;
            border-radius: 50%;
            /* AQUÍ ESTÁ EL CAMBIO: Color Rosa Neón (Primary) para que pegue con tu App */
            background: #ff0080; 
            box-shadow: 0 0 10px #ff0080; /* Brillo neón */
            animation: l3-1 0.75s cubic-bezier(0, 900, 1, 900) infinite;
          }
          @keyframes l3-0 {
            to {
              background-position: -125% 100%;
            }
          }
          @keyframes l3-1 {
            0%, 2% {
              bottom: 0%;
            }
            98%, to {
              bottom: 0.1%;
            }
          }
        `}
      </style>
      
      <div className="night-up-loader"></div>
    </div>
  );
};

export default Loadder;