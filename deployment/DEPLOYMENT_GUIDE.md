# Guía de Deployment - Cloud Server

## Requisitos del Servidor

**Especificaciones mínimas:**
- CPU: 4 cores
- RAM: 8GB mínimo (16GB recomendado)
- Storage: 50GB SSD
- OS: Ubuntu 22.04 LTS o superior
- Node.js: v20.x o superior
- PostgreSQL: 15.x o superior
- Redis: 7.x (opcional, tiene fallback in-memory)

---

## 1. Preparación del Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 (process manager)
sudo npm install -g pm2

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Instalar Redis (opcional)
sudo apt install -y redis-server

# Instalar Nginx
sudo apt install -y nginx

# Instalar certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

---

## 2. Configuración de PostgreSQL

```bash
# Crear usuario y base de datos
sudo -u postgres psql

# En psql:
CREATE USER blaniel WITH PASSWORD 'tu-password-seguro';
CREATE DATABASE blaniel OWNER blaniel;
GRANT ALL PRIVILEGES ON DATABASE blaniel TO blaniel;
\q

# Verificar conexión
psql -U blaniel -d blaniel -h localhost
```

---

## 3. Clonar y Configurar Proyecto

```bash
# Crear directorio para la aplicación
sudo mkdir -p /var/www/blaniel
sudo chown $USER:$USER /var/www/blaniel

# Clonar repositorio
cd /var/www/blaniel
git clone https://github.com/tu-usuario/blaniel.git .

# Instalar dependencias
npm install --production

# Copiar variables de entorno
cp .env.example .env

# IMPORTANTE: Editar .env con valores de producción
nano .env
```

**Variables críticas en .env:**
```bash
# Base
NODE_ENV=production
NEXTAUTH_URL=https://tu-dominio.com

# Database
DATABASE_URL="postgresql://blaniel:password@localhost:5432/blaniel"
MESSAGE_ENCRYPTION_KEY="generar-con-openssl-rand-hex-32"

# Redis (Upstash o local)
UPSTASH_REDIS_REST_URL="..."  # Si usas Upstash
USE_LOCAL_REDIS=true          # Si usas Redis local
REDIS_URL="redis://localhost:6379"

# Secrets
NEXTAUTH_SECRET="generar-con-openssl-rand-hex-32"
CRON_SECRET="generar-con-openssl-rand-hex-32"

# AI
GOOGLE_AI_API_KEY="..."
VENICE_API_KEY="..."

# Email
ENVIALOSIMPLE_API_KEY="..."
SMTP_HOST="..."
SMTP_PORT="587"
SMTP_USER="..."
SMTP_PASS="..."

# Storage
S3_ENDPOINT="..."
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."

# Pagos
PADDLE_API_KEY="..."
MERCADOPAGO_ACCESS_TOKEN="..."
```

---

## 4. Setup de Base de Datos

```bash
# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

# (Opcional) Seed data inicial
npm run db:seed
```

---

## 5. Build de Producción

```bash
# Build Next.js
NODE_OPTIONS='--max-old-space-size=8192' npm run build

# Verificar que build fue exitoso
ls -la .next/standalone
```

---

## 6. Configurar PM2

```bash
# Crear ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'blaniel',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '2G',
    error_file: '/var/log/blaniel/pm2-error.log',
    out_file: '/var/log/blaniel/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
EOF

# Crear directorio de logs
sudo mkdir -p /var/log/blaniel
sudo chown $USER:$USER /var/log/blaniel

# Iniciar con PM2
pm2 start ecosystem.config.js

# Guardar configuración PM2
pm2 save

# Configurar inicio automático
pm2 startup
# Ejecutar el comando que PM2 te muestra
```

---

## 7. Configurar Nginx

```bash
# Crear configuración de Nginx
sudo nano /etc/nginx/sites-available/blaniel
```

```nginx
# Upstream para Next.js
upstream blaniel_backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Redirigir a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;

    # SSL (certbot lo configurará)
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;

    # Proxy a Next.js
    location / {
        proxy_pass http://blaniel_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Rate limit para API
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://blaniel_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }

    # WebSocket support
    location /api/socketio {
        proxy_pass http://blaniel_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Static files
    location /_next/static {
        proxy_pass http://blaniel_backend;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Max upload size
    client_max_body_size 10M;

    # Logs
    access_log /var/log/nginx/blaniel-access.log;
    error_log /var/log/nginx/blaniel-error.log;
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/blaniel /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## 8. Configurar Cron Jobs

```bash
# Editar crontab
crontab -e

# Copiar contenido de deployment/CRON_SCHEDULE.txt
# Cambiar /path/to/ por /var/www/blaniel/

# Verificar crons configurados
crontab -l
```

---

## 9. Configurar Firewall

```bash
# UFW (Ubuntu Firewall)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Verificar status
sudo ufw status
```

---

## 10. Monitoring

```bash
# Ver logs de PM2
pm2 logs blaniel

# Ver status
pm2 status

# Ver uso de recursos
pm2 monit

# Reiniciar app
pm2 restart blaniel

# Ver logs de Nginx
sudo tail -f /var/log/nginx/blaniel-error.log
```

---

## 11. Mantenimiento

### Actualizaciones

```bash
cd /var/www/blaniel

# Pull cambios
git pull origin main

# Instalar dependencias nuevas
npm install --production

# Migrar base de datos (si hay cambios)
npx prisma migrate deploy

# Rebuild
NODE_OPTIONS='--max-old-space-size=8192' npm run build

# Reiniciar
pm2 restart blaniel

# Verificar
pm2 logs blaniel --lines 100
```

### Backups

```bash
# Backup automático de DB (ya configurado en cron)
# Manual backup:
pg_dump -U blaniel blaniel > /var/backups/blaniel/db-$(date +%Y%m%d).sql

# Backup de uploads (si están en servidor)
tar -czf /var/backups/blaniel/uploads-$(date +%Y%m%d).tar.gz /var/www/blaniel/public/uploads
```

---

## Troubleshooting

### App no inicia
```bash
# Ver logs
pm2 logs blaniel --lines 100

# Verificar puerto
sudo netstat -tlnp | grep 3000

# Verificar variables de entorno
pm2 env 0
```

### Database connection failed
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Verificar conexión
psql -U blaniel -d blaniel -h localhost

# Ver logs de PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### High memory usage
```bash
# Ver uso
pm2 monit

# Reiniciar instancia
pm2 restart blaniel

# Si persiste, revisar memory leaks en logs
```

---

## Checklist Pre-Launch

- [ ] SSL configurado y renovación automática activa
- [ ] Firewall configurado
- [ ] Database backups automatizados
- [ ] Cron jobs configurados y verificados
- [ ] PM2 auto-restart en boot
- [ ] Logs rotando correctamente
- [ ] Health check endpoint respondiendo
- [ ] Variables de entorno de producción configuradas
- [ ] Nginx rate limiting activo
- [ ] Monitoring configurado (opcional: Sentry, DataDog)
- [ ] Email dmca@tu-dominio.com configurado
