## Guía de despliegue en AWS (Django + React)

Esta guía documenta un despliegue recomendado usando:

- Backend (Django/DRF) en ECS Fargate detrás de un Application Load Balancer (ALB) con TLS en ACM
- Base de datos en RDS PostgreSQL
- Frontend (React build) en S3 distribuido por CloudFront
- Estáticos y media en S3 mediante `django-storages`
- Secretos/vars en SSM Parameter Store o Secrets Manager

Puedes optar por una variante más simple en EC2 (sin ECS). Abajo incluyo ambas.

---

### 0) Prerrequisitos

- Dominio (opcional, recomendado) gestionado en Route 53
- Cuenta AWS con permisos para ECR, ECS, RDS, S3, CloudFront, ACM, SSM/Secrets Manager
- AWS CLI configurado localmente y credenciales en GitHub (para CI/CD)
- Repositorio con este proyecto

---

### 1) Variables de entorno (lista sugerida)

- DJANGO_SECRET_KEY
- DJANGO_DEBUG=false
- DJANGO_ALLOWED_HOSTS="api.midominio.com,alb-dns.amazonaws.com"
- DJANGO_CORS_ALLOWED_ORIGINS="https://midominio.com,https://dxxxxx.cloudfront.net"
- DJANGO_CSRF_TRUSTED_ORIGINS="https://midominio.com,https://dxxxxx.cloudfront.net,https://api.midominio.com"
- DATABASE_URL o variables separadas:
  - POSTGRES_DB
  - POSTGRES_USER
  - POSTGRES_PASSWORD
  - POSTGRES_HOST
  - POSTGRES_PORT=5432
- AWS_STORAGE_BUCKET_NAME_STATIC (p.ej. coadelpa-static)
- AWS_STORAGE_BUCKET_NAME_MEDIA (p.ej. coadelpa-media)
- AWS_S3_REGION_NAME (p.ej. us-east-1)
- DJANGO_ALLOWED_CIDR (opcional para internal use)

Guárdalas en SSM Parameter Store (SecureString) o Secrets Manager. Evita `.env` en producción.

---

### 2) Cambios en Django `settings.py`

Instala dependencias (si no están):

```bash
pip install django-cors-headers django-storages[boto3] psycopg2-binary
```

Ejemplo de ajustes clave:

```python
# settings.py (extracto)
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DEBUG = os.getenv("DJANGO_DEBUG", "false").lower() == "true"
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "CHANGE_ME")

ALLOWED_HOSTS = [h.strip() for h in os.getenv("DJANGO_ALLOWED_HOSTS", "").split(",") if h.strip()]

INSTALLED_APPS = [
    # ...
    "corsheaders",
    "storages",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    # ... el resto de middlewares
]

# CORS / CSRF
CORS_ALLOWED_ORIGINS = [o.strip() for o in os.getenv("DJANGO_CORS_ALLOWED_ORIGINS", "").split(",") if o.strip()]
CSRF_TRUSTED_ORIGINS = [o.strip() for o in os.getenv("DJANGO_CSRF_TRUSTED_ORIGINS", "").split(",") if o.strip()]

# Base de datos (PostgreSQL RDS)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB"),
        "USER": os.getenv("POSTGRES_USER"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD"),
        "HOST": os.getenv("POSTGRES_HOST"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}

# Estáticos locales (para collectstatic)
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# S3 (django-storages)
USE_S3 = os.getenv("USE_S3", "true").lower() == "true"
if USE_S3:
    AWS_S3_REGION_NAME = os.getenv("AWS_S3_REGION_NAME", "us-east-1")
    AWS_DEFAULT_ACL = None
    AWS_S3_OBJECT_PARAMETERS = {"CacheControl": "max-age=86400"}

    AWS_STORAGE_BUCKET_NAME_STATIC = os.getenv("AWS_STORAGE_BUCKET_NAME_STATIC")
    AWS_STORAGE_BUCKET_NAME_MEDIA = os.getenv("AWS_STORAGE_BUCKET_NAME_MEDIA")

    STATICFILES_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
    DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"

    # Opcionalmente separa estáticos y media con storages custom
    # STATICFILES_STORAGE = "project.storage_backends.StaticStorage"
    # DEFAULT_FILE_STORAGE = "project.storage_backends.MediaStorage"

    STATIC_URL = f"https://{AWS_STORAGE_BUCKET_NAME_STATIC}.s3.amazonaws.com/"
    MEDIA_URL = f"https://{AWS_STORAGE_BUCKET_NAME_MEDIA}.s3.amazonaws.com/"
else:
    MEDIA_URL = "/media/"
    MEDIA_ROOT = BASE_DIR / "media"
```

Si quieres buckets separados para estáticos y media con paths distintos, crea `storage_backends.py` y define dos clases con `location = "static"` y `location = "media"`.

---

### 3) Buckets S3

- Crea dos buckets: uno para `static` y otro para `media` (o uno con prefijos). Desactiva acceso público y usa políticas para CloudFront o presigned URLs.
- Crea otro bucket para el frontend (build React). Este sí suele permitir lectura pública a través de CloudFront (no directamente).

---

### 4) RDS PostgreSQL

- Crea instancia PostgreSQL (multiaz opcional). 
- Security Group: permite el puerto 5432 solo desde el SG del backend (ECS/EC2), no desde Internet.
- Guarda credenciales en SSM/Secrets.

---

### 5) Backend en ECS Fargate (recomendado)

1. ECR: crea un repositorio `coadelpa-backend`.
2. Build & push de la imagen:

```bash
aws ecr get-login-password --region <REGION> | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com
docker build -t coadelpa-backend -f apicola_lab/Dockerfile.backend .
docker tag coadelpa-backend:latest <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/coadelpa-backend:latest
docker push <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/coadelpa-backend:latest
```

3. Crea una Task Definition (Fargate) con contenedor:
   - Image: ECR `latest`
   - CPU/Mem según carga
   - Port mapping 8000->8000 (Gunicorn)
   - Env vars desde SSM/Secrets
   - Log driver: awslogs (CloudWatch)

4. Service ECS en subnets privadas con un ALB público delante:
   - ALB Listener 443 (ACM) -> Target Group (ECS)
   - Health check: `/` o `/api/health` (añade endpoint simple si no existe)
   - Security Groups: ALB permite 443 desde Internet; ECS solo desde ALB.

5. Command de contenedor (ejemplo):

```bash
gunicorn apicola_lab.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 60
```

6. Migraciones y collectstatic:
   - Primera vez: ejecuta tareas ad-hoc (ECS Run Task) o un initContainer:

```bash
python manage.py migrate
python manage.py collectstatic --noinput
```

---

### 6) Alternativa: Backend en EC2 (sin ECS)

- Lanza una instancia EC2 (Amazon Linux 2023). 
- Instala Docker y Docker Compose. 
- Ejecuta el contenedor del backend detrás de un ALB. 
- TLS termina en el ALB. Nginx no es obligatorio.

---

### 7) Frontend en S3 + CloudFront

1. Construye el frontend:

```bash
cd apicola_lab/frontend
npm ci
npm run build
```

2. Sube el contenido de `build/` al bucket S3 del frontend.
3. Crea una distribución CloudFront con origen el bucket S3 (OAI recomendado).
4. Configura tu dominio en CloudFront + ACM + Route 53 (opcional).
5. Ajusta en el frontend la variable de API (por ejemplo, `REACT_APP_API_URL`).

---

### 8) CI/CD con GitHub Actions

Guarda `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_ACCOUNT_ID`, `ECR_REPO`, `ECS_CLUSTER`, `ECS_SERVICE`, `CLOUDFRONT_DISTRIBUTION_ID`, `S3_FRONTEND_BUCKET` como secretos de GitHub.

Backend (construir y desplegar en ECS): `.github/workflows/deploy-backend.yml`

```yaml
name: Deploy Backend
on:
  push:
    paths:
      - "apicola_lab/backend/**"
      - "Dockerfile.backend"
      - ".github/workflows/deploy-backend.yml"

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}
      - uses: aws-actions/amazon-ecr-login@v2
      - name: Build image
        run: |
          docker build -t ${{ secrets.ECR_REPO }} -f apicola_lab/Dockerfile.backend .
          docker tag ${{ secrets.ECR_REPO }}:latest ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/${{ secrets.ECR_REPO }}:latest
      - name: Push image
        run: |
          docker push ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/${{ secrets.ECR_REPO }}:latest
      - name: Update ECS service
        uses: aws-actions/amazon-ecs-deploy-task-definition@v2
        with:
          task-definition: apicola_lab/.aws/taskdef.json # o genera on-the-fly
          service: ${{ secrets.ECS_SERVICE }}
          cluster: ${{ secrets.ECS_CLUSTER }}
          wait-for-service-stability: true
```

Frontend (build y sync a S3 + invalidación CloudFront): `.github/workflows/deploy-frontend.yml`

```yaml
name: Deploy Frontend
on:
  push:
    paths:
      - "apicola_lab/frontend/**"
      - ".github/workflows/deploy-frontend.yml"

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install & Build
        working-directory: apicola_lab/frontend
        run: |
          npm ci
          npm run build
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}
      - name: Sync to S3
        run: |
          aws s3 sync apicola_lab/frontend/build s3://${{ secrets.S3_FRONTEND_BUCKET }} --delete
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

Nota: Para `amazon-ecs-deploy-task-definition@v2` necesitas un `taskdef.json`. Puedes plantillarlo y reemplazar la imagen con `jq` en un paso previo, o mantenerlo versionado.

---

### 9) Health checks y hardening

- Añade endpoint `/health/` simple en Django para el ALB.
- `SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")` cuando usas ALB.
- Activa `SECURE_HSTS_SECONDS`, `SECURE_SSL_REDIRECT` en producción.
- Revisa CORS/CSRF para permitir únicamente dominios finales.

---

### 10) Observabilidad

- Logs del contenedor a CloudWatch Logs (group por servicio y stage).
- Alarmas CloudWatch: 5xx en ALB, Latencia alta, CPU/Memory ECS.
- Backups automáticos de RDS y Multi-AZ si es crítico.

---

### 11) Variante rápida en EC2 (sin ECS)

1. Lanza EC2 y asocia un ALB con certificado ACM.
2. Instala Docker y corre el backend con Gunicorn en puerto 8000.
3. ALB listener 443 -> Target group (puerto 8000 de EC2).
4. Migra/collectstatic igual que arriba. S3 para estáticos y media.
5. Frontend igual con S3+CloudFront.

---

### 12) Checklist final

- [ ] RDS creado y SGs restrictivos
- [ ] Buckets S3: static, media, frontend
- [ ] ACM para dominios de ALB y CloudFront
- [ ] ALB con listener 443 y target group saludable
- [ ] ECS Fargate o EC2 corriendo Gunicorn
- [ ] Migraciones ejecutadas, `collectstatic` hecho
- [ ] CloudFront sirve el frontend y consume la API
- [ ] CI/CD funcionando para backend y frontend

---

## Apéndice: CI/CD con GitHub Actions + ECR (pipeline sin servidores)

Esta es la ruta recomendada: cada push a `main` (o a rutas específicas) construye y publica la imagen del backend en ECR y actualiza el servicio de ECS; el frontend se compila y se sincroniza a S3 e invalida CloudFront. No necesitas conectarte a ningún servidor.

### Prerrequisitos
- Repositorio de ECR creado (por ejemplo `coadelpa-backend`).
- Cluster y Service de ECS (Fargate) ya creados, con Task Definition parametrizable por imagen.
- Bucket S3 del frontend y distribución CloudFront creados.
- Certificados en ACM listos (ALB y dominio de CloudFront si aplica).

### Secretos requeridos en GitHub (Settings > Secrets and variables > Actions)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
- `AWS_ACCOUNT_ID`
- Backend: `ECR_REPO`, `ECS_CLUSTER`, `ECS_SERVICE`
- Frontend: `S3_FRONTEND_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`

Usa un usuario/rol con permisos mínimos necesarios: ECR (push), ECS (Describe/UpdateService), CloudFront (CreateInvalidation), S3 (Put/Delete/Object), Logs (opcional).

### Flujo resumido (Backend)
1) Login en ECR, build Docker con `apicola_lab/Dockerfile.backend` y push a `:latest` (o tag con SHA).  
2) Actualiza la Task Definition para apuntar a la nueva imagen y aplica a ECS Service (deploy rolling).  
3) Espera estabilidad del servicio.

El workflow de ejemplo incluido en esta guía (`Deploy Backend`) ya cubre estos pasos. Si no versionas `taskdef.json`, puedes generarlo on-the-fly y reemplazar la imagen con `jq` antes del paso de deploy.

### Flujo resumido (Frontend)
1) `npm ci && npm run build` en `apicola_lab/frontend`.  
2) `aws s3 sync build/ s3://<bucket>` con `--delete`.  
3) Invalidación de CloudFront `/*`.

El workflow de ejemplo (`Deploy Frontend`) ya lo implementa. Si usas variables de entorno (como `REACT_APP_API_URL`), define `env:` en el job o usa `.env.production` al build.

### Notas prácticas
- Versiona las imágenes con `:sha-${{ github.sha }}` además de `:latest` para facilitar rollbacks.  
- Activa protección de rama y revisiones para merges a `main`.  
- Añade pasos de test/lint antes de desplegar (Django `manage.py test`, React `npm test -- --ci`).  
- Para rollback rápido: en ECS, selecciona la revisión previa de Task Definition o despliega la etiqueta de imagen anterior.



