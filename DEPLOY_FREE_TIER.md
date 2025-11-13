# 🆓 Guía de Despliegue en AWS Free Tier (EC2 + RDS)

## 📋 **¿Qué incluye el Free Tier?**

### **EC2 (12 meses gratis):**
- ✅ **1 instancia t2.micro** por mes
- ✅ **750 horas** por mes  
- ✅ **1 GB RAM, 1 vCPU**
- ✅ **Amazon Linux 2023** (recomendado)

### **RDS PostgreSQL (12 meses gratis):**
- ✅ **750 horas** por mes
- ✅ **db.t3.micro** (1 GB RAM, 1 vCPU)
- ✅ **20 GB** de almacenamiento
- ✅ **Multi-AZ: NO** (solo 1 AZ para free tier)

### **S3 (siempre gratis):**
- ✅ **5 GB** de almacenamiento
- ✅ **20,000 requests** GET
- ✅ **2,000 requests** PUT

---

## 🎯 **Arquitectura Simple (Free Tier)**

```
Internet → EC2 (Django) → RDS (PostgreSQL)
                ↓
            S3 (estáticos/media)
```

**Ventajas:**
- ✅ **100% gratis** por 12 meses
- ✅ **Simple** de entender y mantener
- ✅ **Escalable** después del free tier
- ✅ **Control total** sobre tu servidor

---

## 🚀 **Paso 1: Crear RDS PostgreSQL**

### **1.1 Ir a RDS en AWS Console**
- Busca "RDS" en la consola
- Click en "Create database"

### **1.2 Configuración básica:**
```
Database creation method: Standard create
Engine type: PostgreSQL
Version: 15.4 (recomendado)
Template: Free tier
```

### **1.3 Configuración de instancia:**
```
DB instance identifier: coadelpa-db
Master username: admincoadelpa
Master password: [CREAR CONTRASEÑA SEGURA]
```

### **1.4 Configuración de red:**
```
VPC: Default VPC
Public access: No
VPC security group: Create new
Security group name: coadelpa-db-sg
```

### **1.5 Configuración de seguridad:**
```
Security group rules:
- Type: PostgreSQL
- Port: 5432
- Source: 0.0.0.0/0 (solo para desarrollo)
```

**⚠️ IMPORTANTE:** En producción, restringe el acceso solo desde tu EC2.

---

## 🖥️ **Paso 2: Crear EC2 (Django)**

### **2.1 Ir a EC2 en AWS Console**
- Busca "EC2" en la consola
- Click en "Launch Instance"

### **2.2 Configuración básica:**
```
Name: coadelpa-backend
AMI: Amazon Linux 2023 (recomendado)
Instance type: t2.micro (Free tier eligible)
Key pair: Create new (guardar archivo .pem)
```

### **2.3 Configuración de red:**
```
VPC: Default VPC
Subnet: Default subnet
Auto-assign public IP: Enable
Security group: Create new
Security group name: coadelpa-backend-sg
```

### **2.4 Reglas de seguridad (Security Group):**
```
Inbound rules:
- SSH (22): 0.0.0.0/0 (tu IP)
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
- Custom TCP (8000): 0.0.0.0/0 (Django)
```

---

## 🔧 **Paso 3: Conectar y configurar EC2**

### **3.1 Conectar por SSH:**
```bash
# En Windows (PowerShell):
ssh -i "coadelpa-key.pem" ec2-user@TU_IP_EC2

# En Mac/Linux:
chmod 400 coadelpa-key.pem
ssh -i coadelpa-key.pem ec2-user@TU_IP_EC2
```

### **3.2 Actualizar sistema:**
```bash
sudo yum update -y
sudo yum install -y git docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user
```

### **3.3 Instalar Docker Compose:**
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### **3.4 Reiniciar sesión SSH:**
```bash
exit
# Conectar de nuevo
ssh -i "coadelpa-key.pem" ec2-user@TU_IP_EC2
```

---

## 📁 **Paso 4: Desplegar tu aplicación**

### **4.1 Clonar tu repositorio:**
```bash
git clone https://github.com/TU_USUARIO/TU_REPO.git
cd TU_REPO
```

### **4.2 Crear docker-compose.yml para producción:**
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.production
    ports:
      - "8000:8000"
    environment:
      - DJANGO_DEBUG=False
      - DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY}
      - DJANGO_ALLOWED_HOSTS=${DJANGO_ALLOWED_HOSTS}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - USE_S3=False
    volumes:
      - static_volume:/app/static
      - media_volume:/app/media
    restart: unless-stopped

volumes:
  static_volume:
  media_volume:
```

### **4.3 Crear archivo .env:**
```bash
# Crear archivo .env en EC2
nano .env
```

**Contenido del .env:**
```env
DJANGO_SECRET_KEY= coadelpalimitadachaneares2025
DJANGO_ALLOWED_HOSTS= 15.229.13.79,15.229.13.79:8000,ec2-15-229-13-79.sa-east-1.compute.amazonaws.com
DB_NAME= coadelpa-db
DB_USER= admincoadelpa
DB_PASSWORD= 9YsJZtOwhoyTTqC8s82U
DB_HOST= coadelpa-db.cte8002k4q33.sa-east-1.rds.amazonaws.com
DB_PORT= 5432
```

### **4.4 Construir y ejecutar:**
```bash
docker-compose up -d --build
```

---

## 🗂️ **Paso 4-FE: Desplegar frontend (React) en S3**

### **4-FE.1 Construir el frontend:**
```bash
cd apicola_lab/frontend

# Configurar la URL del backend ANTES del build
# Ejemplo (Windows PowerShell)
$env:REACT_APP_API_URL="http://15.229.13.79:8000"

# En Linux/Mac: export REACT_APP_API_URL=http://15.229.13.79:8000

npm ci
npm run build
# Se genera la carpeta build/
```

### **4-FE.2 Crear bucket S3 para hosting estático:**
- Ir a S3 → Create bucket
- Bucket name: `coadelpa-frontend` (único globalmente)
- Region: la misma de tu EC2/RDS si es posible
- Desactivar “Block all public access” (necesario para hosting estático)
- Crear bucket

### **4-FE.3 Habilitar Static website hosting:**
- En el bucket → Properties → Static website hosting → Enable
- Index document: `index.html`
- Error document: `index.html` (para SPA)
- Guarda la “Bucket website endpoint” (URL pública del sitio)

### **4-FE.4 Política pública de solo lectura (objetos):**
- En el bucket → Permissions → Bucket policy → Pegar:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::coadelpa-frontend/*"
    }
  ]
}
```
Reemplaza `coadelpa-frontend` por el nombre real de tu bucket.

### **4-FE.5 Subir el build al bucket:**
```bash
# Opción 1: Consola S3 → Upload → Arrastrar contenido de build/

# Opción 2: AWS CLI (si lo tienes configurado)
aws s3 sync build/ s3://coadelpa-frontend --delete
```

### **4-FE.6 Probar el sitio del frontend:**
- Abre la “Bucket website endpoint” (ej: `http://coadelpa-frontend.s3-website-us-east-1.amazonaws.com`)
- La app debe cargar y consumir `REACT_APP_API_URL` para hablar con el backend en EC2

---

## 🌐 **Paso 5: Configurar dominio (opcional)**

### **5.1 Si tienes dominio:**
- Ir a Route 53
- Crear zona hospedada
- Apuntar A record a tu IP de EC2

### **5.2 Si NO tienes dominio:**
- Usar directamente la IP de EC2
- Ejemplo: `http://TU_IP_EC2:8000`

---

## 🔗 **Paso 5-FE: Conectar frontend con backend**

### **5-FE.1 Variables en el frontend:**
- Usa `REACT_APP_API_URL` apuntando a tu backend (EC2 o dominio):
  - Ejemplo: `https://api.tu-dominio.com` o `http://TU_IP_EC2:8000`
- Recuerda: en React (CRA) estas variables se inyectan en tiempo de build. Cambios requieren nuevo `npm run build` y re-subida a S3.

### **5-FE.2 Configuración CORS/CSRF en Django:**
- En `DJANGO_ALLOWED_HOSTS` incluye tu IP/dominio del backend
- En `CSRF_TRUSTED_ORIGINS` y CORS permite el dominio del frontend (S3 o CloudFront)
```python
# settings.py (ejemplo)
ALLOWED_HOSTS = ["TU_IP_EC2", "api.tu-dominio.com"]

CSRF_TRUSTED_ORIGINS = [
    "https://coadelpa-frontend.s3-website-us-east-1.amazonaws.com",
    "https://tu-cloudfront-domain.cloudfront.net",
    "https://www.tu-frontend.com",
]

CORS_ALLOWED_ORIGINS = [
    "https://coadelpa-frontend.s3-website-us-east-1.amazonaws.com",
    "https://tu-cloudfront-domain.cloudfront.net",
    "https://www.tu-frontend.com",
]

# Si necesitas cookies/sesiones entre dominios
CORS_ALLOW_CREDENTIALS = True
```
Reemplaza las URLs por las tuyas reales. Asegúrate de tener `django-cors-headers` instalado y añadido al middleware si aún no lo está.

---

## 🔐 **Paso 6: Configurar HTTPS con Nginx (Para móviles y tablets)**

**⚠️ IMPORTANTE:** HTTPS es necesario para que funcione correctamente en dispositivos móviles y tablets, especialmente para funcionalidades como geolocalización, cámara, etc.

**📍 ¿Dónde se instala Nginx?**
- Nginx se instala **directamente en el sistema operativo de EC2** (Amazon Linux), **NO dentro de Docker**
- Tu Django sigue corriendo en Docker (puerto 8000)
- Nginx corre en el sistema operativo y hace de "puente" entre Internet (puertos 80/443) y Django (puerto 8000)

**📂 Estructura de archivos en EC2:**
```
/etc/nginx/                    ← Configuración principal de Nginx
  ├── nginx.conf               ← Config principal (no tocar)
  └── conf.d/
      └── apicola_lab.conf      ← Tu configuración (la creas tú)

/etc/nginx/ssl/                 ← Certificados SSL (lo creas tú)
  ├── nginx-selfsigned.crt     ← Certificado (si usas IP)
  └── nginx-selfsigned.key     ← Clave privada (si usas IP)

/var/log/nginx/                 ← Logs de Nginx
  ├── access.log               ← Peticiones recibidas
  └── error.log                ← Errores

/var/www/html/                  ← Archivos estáticos (si los sirves desde Nginx)
```

### **6.1 Conectar a tu instancia EC2:**
```bash
ssh -i "coadelpa-key.pem" ec2-user@TU_IP_EC2
```

### **6.2 Instalar Nginx:**
```bash
sudo yum update -y
sudo yum install -y nginx
```

### **6.3 Iniciar y habilitar Nginx:**
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### **6.4 Verificar que Nginx está corriendo:**
```bash
sudo systemctl status nginx
```

### **6.5 Crear configuración de Nginx para tu aplicación:**

Crea el archivo de configuración:
```bash
sudo nano /etc/nginx/conf.d/apicola_lab.conf
```

**Pega esta configuración (ajusta TU_IP_EC2 con tu IP real):**

```nginx
# Redirigir HTTP a HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name TU_IP_EC2 ec2-TU_IP_EC2.sa-east-1.compute.amazonaws.com;
    
    # Para Let's Encrypt (si usas dominio)
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirigir todo a HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# Configuración HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name TU_IP_EC2 ec2-TU_IP_EC2.sa-east-1.compute.amazonaws.com;

    # Certificados SSL (se configuran después)
    # Si usas dominio: ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    # Si usas IP: ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    # ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;

    # Configuración SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Tamaño máximo de archivos
    client_max_body_size 100M;

    # Proxy a Django (puerto 8000 en Docker)
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Guarda el archivo:** `Ctrl+O`, luego `Enter`, luego `Ctrl+X`

### **6.6 OPCIÓN A: Si tienes un dominio (Recomendado para producción):**

**✅ Certbot es SOLO necesario si tienes un dominio.** Si solo usas la IP de EC2, salta a la Opción B.

**¿Por qué Certbot?**
- Let's Encrypt (gratis) emite certificados SSL válidos, pero **SOLO para dominios**, no para IPs
- Certbot automatiza la obtención y renovación de estos certificados
- Los certificados son válidos y no mostrarán advertencias en navegadores

#### **6.6.1 Instalar Certbot:**
```bash
sudo yum install -y certbot python3-certbot-nginx
```

#### **6.6.2 Obtener certificado SSL gratuito de Let's Encrypt:**
```bash
# Reemplaza tu-dominio.com con tu dominio real
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

Sigue las instrucciones:
- Ingresa tu email
- Acepta los términos
- Certbot configurará automáticamente Nginx

#### **6.6.3 Verificar renovación automática:**
```bash
sudo certbot renew --dry-run
```

### **6.7 OPCIÓN B: Si NO tienes dominio (Solo para desarrollo/testing):**

**✅ Si solo usas la IP de EC2, NO necesitas Certbot.** Usa esta opción.

**¿Por qué no Certbot?**
- Let's Encrypt **NO emite certificados para IPs públicas**, solo para dominios
- Para IPs, debes usar un certificado autofirmado (generado localmente)
- El certificado autofirmado funcionará, pero mostrará una advertencia en el navegador (normal en desarrollo)

**⚠️ ADVERTENCIA:** Los certificados autofirmados mostrarán una advertencia en el navegador, pero funcionarán para desarrollo y permitirán que tu app funcione en móviles/tablets.

#### **6.7.1 Crear directorio para certificados:**
```bash
sudo mkdir -p /etc/nginx/ssl
```

**📍 ¿Dónde se crea esto?**
- Este directorio se crea **en el sistema operativo de EC2** (Amazon Linux)
- Ruta completa: `/etc/nginx/ssl/`
- Es un directorio del sistema, no está dentro de Docker
- Puedes verificar que se creó con: `ls -la /etc/nginx/ssl/`

#### **6.7.2 Generar certificado autofirmado:**
```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx-selfsigned.key \
    -out /etc/nginx/ssl/nginx-selfsigned.crt \
    -subj "/C=BR/ST=State/L=City/O=Organization/CN=TU_IP_EC2"
```

#### **6.7.3 Actualizar configuración de Nginx:**
Edita el archivo que creaste antes:
```bash
sudo nano /etc/nginx/conf.d/apicola_lab.conf
```

**Descomenta y ajusta estas líneas en el bloque `server` de HTTPS:**
```nginx
ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;
```

### **6.8 Verificar configuración de Nginx:**
```bash
sudo nginx -t
```

Si todo está bien, verás: `nginx: configuration file /etc/nginx/nginx.conf test is successful`

### **6.9 Reiniciar Nginx:**
```bash
sudo systemctl restart nginx
```

### **6.10 Verificar que funciona:**
```bash
# Desde EC2
curl -k https://localhost/health/

# Desde tu navegador (reemplaza TU_IP_EC2)
https://TU_IP_EC2/health/
```

**Nota:** Si usas certificado autofirmado, el navegador mostrará una advertencia. Haz clic en "Avanzado" → "Continuar al sitio" (esto es normal en desarrollo).

### **6.11 Actualizar Security Group de EC2:**
Asegúrate de que el Security Group permita tráfico HTTPS:
- Ve a EC2 → Security Groups → Tu security group
- Inbound rules debe tener:
  - **HTTPS (443)** desde `0.0.0.0/0`
  - **HTTP (80)** desde `0.0.0.0/0` (para redirección)

### **6.12 Actualizar configuración de Django (Backend):**

**Conecta a EC2 y edita el archivo de settings:**
```bash
ssh -i "coadelpa-key.pem" ec2-user@TU_IP_EC2
cd TU_REPO/apicola_lab/backend/apicola_lab
nano settings.py
```

**Agrega estas configuraciones (si no están):**
```python
# Al inicio del archivo, después de los imports
import os

# Si usas HTTPS, Django debe saberlo
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = False  # Nginx ya maneja la redirección

# CORS - Actualiza con tu dominio HTTPS o IP
CORS_ALLOWED_ORIGINS = [
    "https://TU_IP_EC2",
    "https://tu-dominio.com",  # Si tienes dominio
    "https://coadelpa-frontend.s3-website-us-east-1.amazonaws.com",  # Tu frontend
]

# CSRF
CSRF_TRUSTED_ORIGINS = [
    "https://TU_IP_EC2",
    "https://tu-dominio.com",  # Si tienes dominio
    "https://coadelpa-frontend.s3-website-us-east-1.amazonaws.com",
]
```

**Guarda y reinicia el contenedor Docker:**
```bash
cd ~/TU_REPO
docker-compose restart backend
```

### **6.13 Actualizar Frontend (Build y subir a S3):**

**En tu máquina local (NO en EC2):**
```bash
cd apicola_lab/frontend

# Cambiar la URL del backend a HTTPS
# Windows PowerShell:
$env:REACT_APP_API_URL="https://15.229.13.79"

# Linux/Mac:
export REACT_APP_API_URL="https://TU_IP_EC2"

# Si tienes dominio:
# $env:REACT_APP_API_URL="https://tu-dominio.com"

# Build
npm ci
npm run build
```

**Subir a S3:**
```bash
# Opción 1: Consola S3 → Upload → Arrastrar contenido de build/

# Opción 2: AWS CLI
aws s3 sync build/ s3://coadelpa-frontend --delete
```

### **6.14 Probar desde móvil/tablet:**
1. Abre el navegador en tu dispositivo móvil
2. Ve a la URL de tu frontend (S3 o CloudFront)
3. La app debe cargar y hacer peticiones HTTPS al backend
4. Verifica en la consola del navegador que las peticiones sean HTTPS

### **6.15 Verificar logs de Nginx (si hay problemas):**
```bash
# Ver logs de acceso
sudo tail -f /var/log/nginx/access.log

# Ver logs de errores
sudo tail -f /var/log/nginx/error.log
```

---

## ✅ **Paso 7: Verificar funcionamiento**

### **7.1 Health check:**
```bash
curl http://localhost:8000/health/
# Debería devolver: {"status": "healthy", "service": "apicola_lab"}

# Desde tu navegador:
```bash
http://15.229.13.79:8000/health/
```

### **7.2 Ver logs:**
```bash
docker-compose logs -f backend
```

### **7.3 Verificar base de datos:**
```bash
# Conectar a RDS desde EC2
psql -h TU_ENDPOINT_RDS -U postgres -d apicola_lab_db
```

### **7.4 Probar desde el frontend:**
```bash
# Abre la URL de S3 (o CloudFront) del frontend
# Navega a una vista que llame a la API
# En la consola del navegador, verifica que las solicitudes vayan a REACT_APP_API_URL y respondan 200
```

---

## 🔒 **Paso 8: Seguridad básica**

### **8.1 Firewall (Security Groups):**
- **RDS**: Solo permitir acceso desde EC2
- **EC2**: Solo puertos necesarios (22, 80, 443, 8000)

### **8.2 Variables de entorno:**
- **NUNCA** commitear .env a Git
- Usar contraseñas seguras
- Rotar secretos regularmente

---

## 💰 **Paso 9: Costos estimados (Free Tier):**

### **Mes 1-12:**
- ✅ **EC2 t2.micro**: $0 (750h gratis)
- ✅ **RDS db.t3.micro**: $0 (750h gratis)  
- ✅ **S3 5GB**: $0
- ✅ **Data transfer**: $0 (15GB gratis)

### **Después del free tier:**
- **EC2 t2.micro**: ~$8-12/mes
- **RDS db.t3.micro**: ~$12-15/mes
- **S3**: ~$0.023/GB/mes

---

## 🚨 **Paso 10: Limitaciones del Free Tier:**

### **EC2 t2.micro:**
- ⚠️ **1 GB RAM** - Puede ser poco para Django
- ⚠️ **1 vCPU** - Procesamiento limitado
- ⚠️ **EBS**: 30 GB gratis

### **RDS db.t3.micro:**
- ⚠️ **1 GB RAM** - Base de datos pequeña
- ⚠️ **20 GB** - Almacenamiento limitado
- ⚠️ **No Multi-AZ** - Sin alta disponibilidad

---

## 🧊 **Paso 11: CloudFront delante de S3 para HTTPS y caché**

**⚠️ IMPORTANTE:** S3 Static Website Hosting **NO soporta HTTPS directamente**. Solo funciona con HTTP. Para tener HTTPS en tu frontend, necesitas CloudFront delante de S3.

**¿Por qué CloudFront?**
- ✅ Proporciona HTTPS gratuito con certificados SSL de AWS
- ✅ Mejora la velocidad (CDN global)
- ✅ Reduce costos de transferencia de datos
- ✅ Caché automático de archivos estáticos

### **CF.1 Crear distribución CloudFront (paso a paso):**

#### **CF.1.1 Ir a CloudFront en AWS Console:**
- Busca "CloudFront" en la consola de AWS
- Click en "Create distribution"

#### **CF.1.2 Configurar Origin (Origen):**
- **Origin domain:** 
  - NO uses el nombre del bucket directamente
  - Usa el **"Static website endpoint"** de tu bucket S3
  - Ejemplo: `coadelpa-frontend.s3-website-sa-east-1.amazonaws.com`
  - Si no lo ves, ve a S3 → Tu bucket → Properties → Static website hosting → copia el "Bucket website endpoint"
  
- **Name:** Se llena automáticamente (puedes dejarlo así)

- **Origin path:** Deja vacío (a menos que tus archivos estén en una subcarpeta)

#### **CF.1.3 Configurar Default cache behavior:**
- **Viewer protocol policy:** 
  - Selecciona **"Redirect HTTP to HTTPS"** (importante para móviles/tablets)
  
- **Allowed HTTP methods:** 
  - Selecciona **"GET, HEAD, OPTIONS"** (suficiente para un sitio estático)
  
- **Cache policy:** 
  - Deja **"CachingOptimized"** (por defecto, está bien)

- **Compress objects automatically:** 
  - Marca **"Yes"** (reduce el tamaño de los archivos)

#### **CF.1.4 Configurar Distribution settings:**
- **Price class:** 
  - Selecciona **"Use only North America and Europe"** (más barato, suficiente para la mayoría de casos)
  
- **Alternate domain names (CNAMEs):** 
  - Deja vacío (a menos que tengas un dominio personalizado)

- **Custom SSL certificate:** 
  - Deja **"Default CloudFront certificate"** (gratis, funciona con el dominio de CloudFront)

- **Default root object:** 
  - Escribe: `index.html`

- **Comment:** 
  - Opcional: "Frontend Apicola Lab"

#### **CF.1.5 Crear la distribución:**
- Revisa la configuración
- Click en **"Create distribution"**
- ⏳ **Espera 10-15 minutos** mientras se despliega (estado: "In Progress" → "Deployed")

#### **CF.1.6 Obtener la URL de CloudFront:**
- Una vez desplegado, verás el **"Distribution domain name"**
- Ejemplo: `d1234567890abc.cloudfront.net`
- Esta URL **YA soporta HTTPS**: `https://d1234567890abc.cloudfront.net`

### **CF.2 Probar CloudFront:**

1. **Abre la URL de CloudFront en tu navegador:**
   ```
   https://TU_DOMINIO_CLOUDFRONT.cloudfront.net
   ```
   - Debe cargar tu frontend
   - Debe mostrar el candado verde (HTTPS activo)

2. **Verifica en la consola del navegador (F12):**
   - Las peticiones al backend deben seguir funcionando
   - No debe haber errores de CORS

### **CF.3 Actualizar configuración de Django (Backend):**

**Conecta a EC2 y edita settings.py:**
```bash
ssh -i "coadelpa-key.pem" ec2-user@TU_IP_EC2
cd ~/TU_REPO/apicola_lab/backend/apicola_lab
nano settings.py
```

**Agrega el dominio de CloudFront a CORS y CSRF:**
```python
# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://15.229.13.79",  # Tu backend
    "https://coadelpa-frontend.s3-website-sa-east-1.amazonaws.com",  # S3 (HTTP, pero por si acaso)
    "https://TU_DOMINIO_CLOUDFRONT.cloudfront.net",  # CloudFront (agrega esta línea)
]

# CSRF settings
CSRF_TRUSTED_ORIGINS = [
    "https://15.229.13.79",
    "https://coadelpa-frontend.s3-website-sa-east-1.amazonaws.com",
    "https://TU_DOMINIO_CLOUDFRONT.cloudfront.net",  # Agrega esta línea
]
```

**Guarda y reinicia:**
```bash
cd ~/TU_REPO
docker-compose restart backend
```

### **CF.4 Invalidar caché de CloudFront (cuando actualizas el frontend):**

**⚠️ IMPORTANTE:** Cuando subes un nuevo build a S3, CloudFront puede seguir mostrando la versión antigua (caché). Debes invalidar el caché:

1. Ve a CloudFront → Tu distribución
2. Click en la pestaña **"Invalidations"**
3. Click en **"Create invalidation"**
4. En **"Object paths"**, escribe: `/*`
5. Click en **"Create invalidation"**
6. Espera 2-5 minutos mientras se invalida

**Alternativa (más rápido para desarrollo):**
- En la configuración de CloudFront, puedes desactivar el caché temporalmente:
  - Cache policy: **"CachingDisabled"** (solo para desarrollo/testing)

### **CF.5 Actualizar enlaces/documentación:**

- Actualiza cualquier documentación o enlaces que apunten a S3
- Usa la URL de CloudFront en su lugar
- Ejemplo: `https://TU_DOMINIO_CLOUDFRONT.cloudfront.net`

### **CF.6 Costos de CloudFront (Free Tier):**

**Gratis (siempre):**
- ✅ **1 TB de transferencia de datos** por mes
- ✅ **10,000,000 requests HTTP/HTTPS** por mes
- ✅ **Certificados SSL** gratuitos

**Después del free tier:**
- ~$0.085 por GB de transferencia (primeros 10 TB)
- ~$0.0075 por 10,000 requests HTTP/HTTPS

**Para un sitio pequeño/mediano, generalmente es gratis o muy barato.**

### **CF.7 Opcional: Certificado SSL personalizado (si tienes dominio):**

Si tienes un dominio personalizado (ej: `www.tu-app.com`):

1. **Crear certificado en ACM (Certificate Manager):**
   - Ve a ACM (Certificate Manager) en la región **us-east-1** (N. Virginia)
   - Click en "Request certificate"
   - Domain name: `tu-dominio.com` y `www.tu-dominio.com`
   - Validación: Email o DNS
   - Espera a que se valide

2. **Asociar a CloudFront:**
   - Ve a tu distribución CloudFront → General → Edit
   - En "Custom SSL certificate", selecciona tu certificado
   - En "Alternate domain names", agrega: `tu-dominio.com` y `www.tu-dominio.com`
   - Guarda

3. **Configurar DNS (Route 53 o tu proveedor):**
   - Crea un registro CNAME apuntando a tu dominio de CloudFront
   - Ejemplo: `d1234567890abc.cloudfront.net`

### **CF.8 Resumen de URLs:**

- **S3 (HTTP):** `http://coadelpa-frontend.s3-website-sa-east-1.amazonaws.com` ❌ No HTTPS
- **CloudFront (HTTPS):** `https://TU_DOMINIO_CLOUDFRONT.cloudfront.net` ✅ HTTPS activo
- **Backend (HTTPS):** `https://15.229.13.79` ✅ HTTPS con Nginx

---

## 🆘 **Paso 12: Solución de problemas comunes:**

### **No puedo conectar por SSH:**
- Verificar Security Group (puerto 22)
- Verificar archivo .pem
- Verificar IP pública de EC2

### **Django no responde:**
- Verificar puerto 8000 en Security Group
- Verificar logs: `docker-compose logs backend`
- Verificar variables de entorno

### **HTTPS no funciona:**
- Verificar que Nginx esté corriendo: `sudo systemctl status nginx`
- Verificar configuración: `sudo nginx -t`
- Verificar Security Group (puertos 80 y 443 abiertos)
- Verificar certificados SSL: `sudo ls -la /etc/letsencrypt/live/` (si usas Let's Encrypt)
- Ver logs de Nginx: `sudo tail -f /var/log/nginx/error.log`

### **Frontend no puede conectar al backend HTTPS:**
- Verificar que `REACT_APP_API_URL` use `https://` (no `http://`)
- Hacer nuevo build del frontend después de cambiar la variable
- Verificar CORS en Django settings.py
- Verificar que el certificado SSL sea válido (no autofirmado en producción)

### **CloudFront muestra versión antigua del frontend:**
- Invalidar el caché: CloudFront → Invalidations → Create invalidation → `/*`
- O cambiar Cache policy a "CachingDisabled" temporalmente (solo desarrollo)
- Verificar que los archivos nuevos estén en S3

### **CloudFront no carga el frontend:**
- Verificar que el Origin use el "Static website endpoint" de S3 (no el nombre del bucket)
- Verificar que el bucket S3 tenga "Static website hosting" habilitado
- Verificar que la política del bucket permita acceso público
- Esperar 10-15 minutos después de crear la distribución

### **No puedo conectar a RDS:**
- Verificar Security Group de RDS
- Verificar endpoint de RDS
- Verificar credenciales

