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

## ✅ **Paso 6: Verificar funcionamiento**

### **6.1 Health check:**
```bash
curl http://localhost:8000/health/
# Debería devolver: {"status": "healthy", "service": "apicola_lab"}

# Desde tu navegador:
http://TU_IP_EC2:8000/health/
```

### **6.2 Ver logs:**
```bash
docker-compose logs -f backend
```

### **6.3 Verificar base de datos:**
```bash
# Conectar a RDS desde EC2
psql -h TU_ENDPOINT_RDS -U postgres -d apicola_lab_db
```

### **6.4 Probar desde el frontend:**
```bash
# Abre la URL de S3 (o CloudFront) del frontend
# Navega a una vista que llame a la API
# En la consola del navegador, verifica que las solicitudes vayan a REACT_APP_API_URL y respondan 200
```

---

## 🔒 **Paso 7: Seguridad básica**

### **7.1 Firewall (Security Groups):**
- **RDS**: Solo permitir acceso desde EC2
- **EC2**: Solo puertos necesarios (22, 80, 443, 8000)

### **7.2 Variables de entorno:**
- **NUNCA** commitear .env a Git
- Usar contraseñas seguras
- Rotar secretos regularmente

---

## 💰 **Costos estimados (Free Tier):**

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

## 🚨 **Limitaciones del Free Tier:**

### **EC2 t2.micro:**
- ⚠️ **1 GB RAM** - Puede ser poco para Django
- ⚠️ **1 vCPU** - Procesamiento limitado
- ⚠️ **EBS**: 30 GB gratis

### **RDS db.t3.micro:**
- ⚠️ **1 GB RAM** - Base de datos pequeña
- ⚠️ **20 GB** - Almacenamiento limitado
- ⚠️ **No Multi-AZ** - Sin alta disponibilidad

---

## 🔄 **Escalado después del Free Tier:**

### **Opción 1: EC2 más grande**
```
t3.small: 2 vCPU, 2 GB RAM (~$15/mes)
t3.medium: 2 vCPU, 4 GB RAM (~$30/mes)
```

### **Opción 2: RDS más grande**
```
db.t3.small: 2 vCPU, 2 GB RAM (~$25/mes)
db.t3.medium: 2 vCPU, 4 GB RAM (~$50/mes)
```

### **Opción 3: Load Balancer**
- **ALB**: ~$16/mes
- **Múltiples EC2** para alta disponibilidad

---

## 🧊 (Opcional) **CloudFront delante de S3 para HTTPS y caché**

### **CF.1 Crear distribución CloudFront:**
- Origin: tu bucket S3 del frontend (mejor el “Static website endpoint”)
- Viewer protocol policy: Redirect HTTP to HTTPS
- Cache policy: CachingOptimized (por defecto)

### **CF.2 Certificado SSL (si usas dominio propio):**
- En ACM (us-east-1) crea/valida un certificado para tu dominio `www.tu-frontend.com`
- Asócialo a la distribución

### **CF.3 Actualiza tu app:**
- Cambia los enlaces del frontend al dominio de CloudFront o tu dominio propio
- Actualiza `CSRF_TRUSTED_ORIGINS` y `CORS_ALLOWED_ORIGINS` en el backend con el dominio de CloudFront o tu dominio

---

## 📚 **Recursos adicionales:**

### **Documentación oficial:**
- [AWS Free Tier](https://aws.amazon.com/free/)
- [EC2 User Guide](https://docs.aws.amazon.com/ec2/latest/userguide/)
- [RDS User Guide](https://docs.aws.amazon.com/rds/latest/userguide/)

### **Videos tutoriales:**
- YouTube: "AWS Free Tier Tutorial"
- YouTube: "Deploy Django to EC2"

---

## 🎯 **Resumen de pasos:**

1. ✅ **Crear RDS PostgreSQL** (free tier)
2. ✅ **Crear EC2 t2.micro** (free tier)  
3. ✅ **Configurar Security Groups**
4. ✅ **Conectar por SSH**
5. ✅ **Instalar Docker + Docker Compose**
6. ✅ **Desplegar backend (Django) en EC2**
7. ✅ **Desplegar frontend (React) en S3**
8. ✅ **Configurar variables de entorno**
9. ✅ **Verificar funcionamiento (API y frontend)**
10. ✅ **Configurar dominio/CloudFront (opcional)**

---

## 🆘 **Solución de problemas comunes:**

### **No puedo conectar por SSH:**
- Verificar Security Group (puerto 22)
- Verificar archivo .pem
- Verificar IP pública de EC2

### **Django no responde:**
- Verificar puerto 8000 en Security Group
- Verificar logs: `docker-compose logs backend`
- Verificar variables de entorno

### **No puedo conectar a RDS:**
- Verificar Security Group de RDS
- Verificar endpoint de RDS
- Verificar credenciales

---

## 🎉 **¡Listo!**

Tu aplicación Django estará corriendo en AWS Free Tier usando:
- **EC2** para el backend
- **RDS** para la base de datos  
- **S3** para archivos estáticos/media

**Total costo: $0 por 12 meses** 🆓

¿Tienes alguna duda específica sobre algún paso?
