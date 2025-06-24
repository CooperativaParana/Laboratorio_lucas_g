# Laboratorio_lucas_g
app-web-para-laboratorio

# Levantar servicios
docker-compose up

# O en background
docker-compose up -d

# Parar servicios
docker-compose down

1. **Primer paso - Levantar los contenedores**:
   ```bash
   cd apicola_lab
   docker-compose up --build
   ```
   Este comando:
   - Construye las imágenes si no existen
   - Levanta todos los contenedores (backend, frontend, base de datos)
   - El backend ya ejecutará automáticamente `python manage.py runserver`
   - El frontend ya ejecutará automáticamente `npm start`

2. **No necesitas ejecutar manualmente**:
   - ❌ NO necesitas ejecutar `python manage.py runserver`
   - ❌ NO necesitas ejecutar `npm start`
   - ❌ NO necesitas instalar dependencias manualmente

3. **Acceso a las aplicaciones**:
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:8001`
   - Base de datos: `localhost:5432`

4. **Si necesitas detener todo**:
   ```bash
   docker-compose down
   ```

5. **Si necesitas ver los logs**:
   ```bash
   docker-compose logs -f
   ```
