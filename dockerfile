# --- ETAPA 1: Construcción (Builder) ---
    FROM node:20-alpine3.18 AS builder
    WORKDIR /app
    
    # Copiamos archivos de dependencias
    COPY package*.json ./
    
    # Instalamos dependencias
    RUN npm install && npm audit fix --force
    
    # Copiamos el resto del código
    COPY . .
    
    # IMPORTANTE: Definimos la variable de entorno para el build.
    # Esto "quema" la URL de la API en el código de React.
    ARG VITE_API_URL
    ENV VITE_API_URL=$VITE_API_URL
    # Construimos la aplicación (Genera la carpeta /dist)
    RUN npm run build
    
    # --- ETAPA 2: Servidor Producción (Nginx) ---
    FROM nginx:1.25.2-alpine3.18
    
    # 1. Copiamos TU archivo nginx.conf a la carpeta de configuración de Nginx
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # 2. Copiamos los archivos construidos de React (carpeta dist) a donde Nginx los busca
    COPY --from=builder /app/dist /usr/share/nginx/html
    
    # Exponemos el puerto 80 (que es el que configuraste en nginx.conf)
    EXPOSE 80
    
    # Arrancamos Nginx
    CMD ["nginx", "-g", "daemon off;"]