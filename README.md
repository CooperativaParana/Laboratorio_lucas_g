# Laboratorio COADELPA - Aplicación Web

Repositorio de la aplicación web del laboratorio de COADELPA. Incluye backend en Django REST, frontend en React y configuración con Docker para desarrollo y despliegue.

---

## **Arquitectura del proyecto:**

### **Backend:**
- **Ruta/Carpeta:** `apicola_lab/backend/`
- **Tecnologías:**
  - **Python 3.x** - Lenguaje de programación
  - **Django 4.2.7** - Framework web
  - **Django REST Framework 3.14.0** - Framework para APIs REST
  - **Gunicorn 21.2.0** - Servidor WSGI para producción
  - **PostgreSQL** - Base de datos (mediante psycopg2-binary 2.9.7)

### **Frontend:**
- **Ruta/Carpeta:** `apicola_lab/frontend/`
- **Tecnologías:**
  - **React 18.2.0** - Biblioteca de JavaScript para interfaces de usuario
  - **React Router DOM 6.22.1** - Enrutamiento
  - **Chakra UI 2.8.1** - Biblioteca de componentes UI
  - **Axios 1.6.7** - Cliente HTTP para peticiones API
  - **Chart.js 4.5.0** + **React-Chartjs-2 5.3.0** - Visualización de datos
  - **React Hook Form 7.52.2** - Manejo de formularios
  - **jsPDF 3.0.2** - Generación de PDFs
  - **XLSX 0.18.5** - Manejo de archivos Excel

### **Base de datos:**
- **Tipo:** PostgreSQL 15
- **Ubicación:** 
  - **Desarrollo:** Local (Docker) - Puerto 5432
  - **Producción:** AWS RDS (PostgreSQL) - Cloud
- **Configuración:** Definida en `apicola_lab/backend/apicola_lab/settings.py`

---

## **Herramientas utilizadas:**

### **Control de versiones:**
- **Git** - Sistema de control de versiones
- **GitHub/GitLab** - Plataforma de hospedaje de repositorios (configurado en `.gitignore`)

### **IDE/Editor:**
- Compatible con cualquier editor de código (VS Code, PyCharm, etc.)

### **Librerías principales:**

#### **Backend (Python):**
- `Django==4.2.7` - Framework web principal
- `djangorestframework==3.14.0` - Framework REST API
- `djangorestframework-simplejwt==5.2.2` - Autenticación JWT
- `psycopg2-binary==2.9.7` - Adaptador PostgreSQL
- `django-cors-headers==4.3.1` - Manejo de CORS
- `drf-spectacular==0.26.5` - Documentación automática de API (Swagger/OpenAPI)
- `python-decouple==3.8` - Manejo de variables de entorno
- `reportlab==4.0.4` - Generación de PDFs
- `Pillow==10.1.0` - Procesamiento de imágenes
- `gunicorn==21.2.0` - Servidor WSGI para producción
- `django-extensions==3.2.3` - Extensiones útiles para desarrollo

#### **Frontend (JavaScript/React):**
- `react==18.2.0` - Biblioteca principal
- `react-dom==18.2.0` - Renderizado DOM
- `react-router-dom==6.22.1` - Enrutamiento
- `@chakra-ui/react==2.8.1` - Componentes UI
- `axios==1.6.7` - Cliente HTTP
- `chart.js==4.5.0` + `react-chartjs-2==5.3.0` - Gráficos
- `react-hook-form==7.52.2` - Formularios
- `yup==1.6.1` - Validación de esquemas
- `jspdf==3.0.2` + `jspdf-autotable==5.0.2` - Generación de PDFs
- `xlsx==0.18.5` - Manejo de Excel
- `react-select==5.10.2` - Selectores avanzados
- `framer-motion==10.16.4` - Animaciones

### **Herramientas de testing:**
- **Frontend:** 
  - `@testing-library/react==13.4.0` - Testing de componentes React
  - `@testing-library/jest-dom==5.17.0` - Utilidades de testing
  - `@testing-library/user-event==13.5.0` - Simulación de eventos de usuario
  - Jest (incluido con react-scripts)

### **Deployment:**
- **Docker** - Contenedorización
  - `Dockerfile.backend` - Imagen del backend
  - `Dockerfile.frontend` - Imagen del frontend
  - `Dockerfile.production` - Imagen para producción
  - `docker-compose.yml` - Orquestación de servicios
- **AWS Free Tier** - Infraestructura en la nube
  - **EC2** - Servidor de aplicación
  - **RDS PostgreSQL** - Base de datos gestionada
  - **S3** - Almacenamiento de archivos estáticos/media (opcional)
- **Nginx** - Servidor web reverse proxy (carpeta `nginx/`)
- **Gunicorn** - Servidor WSGI para Django en producción

---

## 📚 **Documentación:**

### **¿Dónde está?**
- **README.md** (este archivo) - Documentación principal del proyecto
- **DEPLOY_FREE_TIER.md** - Guía completa de despliegue en AWS Free Tier (922 líneas)

### **¿Qué incluye?**

#### **README.md:**
- Arquitectura del proyecto
- Herramientas y tecnologías utilizadas
- Estructura de carpetas
- Instrucciones básicas de instalación

#### **DEPLOY_FREE_TIER.md:**
- Guía paso a paso para desplegar en AWS Free Tier
- Configuración de EC2 (instancia Django)
- Configuración de RDS PostgreSQL
- Configuración de S3 (opcional)
- Configuración de seguridad (Security Groups)
- Instrucciones de despliegue y mantenimiento
- Troubleshooting común

#### **Documentación de API:**
- **Swagger UI:** Disponible en `/api/docs/` cuando el servidor está corriendo
- **ReDoc:** Disponible en `/api/redoc/` cuando el servidor está corriendo
- **Schema OpenAPI:** Disponible en `/api/schema/` (JSON/YAML)
- Generada automáticamente con `drf-spectacular`

---

## **Instalación rápida:**

### **Requisitos previos:**
- Docker y Docker Compose instalados
- Git instalado

### **Pasos:**
1. Clonar el repositorio
2. Navegar a la carpeta del proyecto: `cd apicola_lab`
3. Ejecutar: `docker-compose up --build`
4. Acceder a:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - Admin Django: http://localhost:8001/admin
   - Adminer (DB): http://localhost:8080
   - API Docs: http://localhost:8001/api/docs

---

## **Estructura del proyecto:**

```
Laboratorio_lucas_g/
├── apicola_lab/
│   ├── backend/              # Backend Django
│   │   ├── apicola_lab/      # Configuración Django
│   │   ├── modelos/          # App principal con modelos y APIs
│   │   ├── manage.py
│   │   └── requirements.txt
│   ├── frontend/             # Frontend React
│   │   ├── src/
│   │   │   ├── components/   # Componentes React
│   │   │   └── App.js
│   │   └── package.json
│   ├── docker-compose.yml    # Configuración Docker
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── Dockerfile.production
├── nginx/                    # Configuración Nginx
├── README.md                 # Este archivo
└── DEPLOY_FREE_TIER.md       # Guía de despliegue AWS
```

---

## **Autenticación:**

La aplicación utiliza **JWT (JSON Web Tokens)** para autenticación:
- Endpoint de login: `/api/token/`
- Endpoint de refresh: `/api/token/refresh/`
- Implementado con `djangorestframework-simplejwt`

---

## **Notas adicionales:**

- El proyecto está configurado para desarrollo y producción
- Las variables de entorno se manejan con `python-decouple`
- La base de datos puede configurarse localmente (Docker) o en la nube (AWS RDS)
- El frontend se comunica con el backend mediante Axios
- La documentación de API se genera automáticamente con drf-spectacular

## **EndPoints del Backend**

-"apicultores": "http://15.229.13.79:8000/api/apicultores/",
-"analistas": "http://15.229.13.79:8000/api/analistas/",
-"apiarios": "http://15.229.13.79:8000/api/apiarios/",
-"tambores": "http://15.229.13.79:8000/api/tambores/",
-"especies": "http://15.229.13.79:8000/api/especies/",
-"muestras": "http://15.229.13.79:8000/api/pools/",
-"analisis-palinologicos": "http://15.229.13.79:8000/api/analisis-palinologicos/",
-"analisis-fisicoquimicos": "http://15.229.13.79:8000/api/analisis-fisicoquimicos/",
-"pools": "http://15.229.13.79:8000/api/pools/",
-"contiene-pool": "http://15.229.13.79:8000/api/contiene-pool/",
-"tambor-apiario": "http://15.229.13.79:8000/api/tambor-apiario/"


