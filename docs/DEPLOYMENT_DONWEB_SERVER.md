# 🚀 Deployment en Servidor Cloud (DonWeb)

Guía completa para deployar el sistema en un servidor cloud tradicional (VPS/Dedicated).

---

## 📋 Requisitos del Servidor

### Especificaciones Mínimas

```
OS: Ubuntu 20.04 LTS o superior
RAM: 4GB (recomendado 8GB)
CPU: 2 cores (recomendado 4 cores)
Disco: 20GB SSD
Node.js: v18.x o superior
PostgreSQL: 14 o superior
```

### Especificaciones Recomendadas para Producción

```
RAM: 8GB
CPU: 4 cores
Disco: 50GB SSD
+ Swap: 2GB (para embeddings)
```

---

## 🔧 Instalación Inicial en el Servidor

### 1. Conectar al Servidor

```bash
ssh tu_usuario@tu_servidor.donweb.com
```

### 2. Actualizar Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Instalar Node.js v18+

```bash
# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v18.x o superior
npm --version
```

### 4. Instalar PostgreSQL

```bash
# Instalar PostgreSQL 14
sudo apt install -y postgresql postgresql-contrib

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crear usuario y base de datos
sudo -u postgres psql

# En el shell de PostgreSQL:
CREATE DATABASE creador_inteligencias;
CREATE USER tu_usuario WITH ENCRYPTED PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE creador_inteligencias TO tu_usuario;
\q
```

### 5. Instalar PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Configurar PM2 para iniciar en boot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

### 6. Instalar Git

```bash
sudo apt install -y git
```

---

## 📦 Deployment de la Aplicación

### 1. Clonar Repositorio

```bash
cd /var/www  # o tu directorio preferido
sudo mkdir -p circuit-prompt-ai
sudo chown $USER:$USER circuit-prompt-ai
cd circuit-prompt-ai

git clone https://github.com/tu-usuario/circuit-prompt-ai.git .
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
nano .env
```

**Variables críticas a configurar:**

```bash
# Base de datos (PostgreSQL local)
DATABASE_URL="postgresql://tu_usuario:tu_password@localhost:5432/creador_inteligencias"

# NextAuth
NEXTAUTH_SECRET="genera_uno_con: openssl rand -base64 32"
NEXTAUTH_URL="https://tudominio.com"

# Upstash Redis (crear cuenta en upstash.com)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="tu_token_aqui"

# Cron Secret (ya generado)
CRON_SECRET="918f2f0b4aa41187b7a9d31a10e782bbed58e67ca9b5e10de0bbd8e24f1c989a"

# URL de la aplicación
APP_URL="https://tudominio.com"
# O para testing local:
# APP_URL="http://localhost:3000"

# Otras APIs según necesites...
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Descargar Modelo Qwen (Embeddings)

```bash
# Crear directorio del modelo
mkdir -p model

# Descargar modelo (639MB)
cd model
wget https://huggingface.co/Qwen/Qwen3-Embedding-0.6B-GGUF/resolve/main/qwen3-embedding-0.6b-q8_0.gguf -O Qwen3-Embedding-0.6B-Q8_0.gguf

# Verificar descarga
ls -lh Qwen3-Embedding-0.6B-Q8_0.gguf

cd ..
```

### 5. Aplicar Migraciones de Base de Datos

```bash
npx prisma db push
npx prisma generate
```

### 6. Build de Producción

```bash
npm run build
```

### 7. Crear Directorio de Logs

```bash
mkdir -p logs
chmod 755 logs
```

---

## 🚀 Iniciar Aplicación con PM2

### 1. Crear Archivo de Configuración PM2

```bash
nano ecosystem.config.js
```

**Contenido:**

```javascript
module.exports = {
  apps: [
    {
      name: 'circuit-prompt-ai',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
    },
  ],
};
```

### 2. Iniciar Aplicación

```bash
# Iniciar con PM2
pm2 start ecosystem.config.js

# Guardar configuración para auto-start
pm2 save

# Verificar que esté corriendo
pm2 status
pm2 logs circuit-prompt-ai
```

### 3. Comandos Útiles PM2

```bash
# Ver logs en tiempo real
pm2 logs

# Reiniciar aplicación
pm2 restart circuit-prompt-ai

# Detener aplicación
pm2 stop circuit-prompt-ai

# Recargar (zero-downtime)
pm2 reload circuit-prompt-ai

# Ver estadísticas
pm2 monit
```

---

## ⏰ Configurar Cron Jobs

### 1. Abrir Crontab

```bash
crontab -e
```

### 2. Agregar Jobs

```bash
# Análisis ML de moderación (3 AM diario)
0 3 * * * /var/www/circuit-prompt-ai/scripts/cron-ml-analysis.sh >> /var/www/circuit-prompt-ai/logs/cron.log 2>&1

# Health check cada hora
0 * * * * /var/www/circuit-prompt-ai/scripts/health-check.sh >> /var/www/circuit-prompt-ai/logs/health-check.log 2>&1

# Limpiar logs antiguos (semanal, domingos a las 4 AM)
0 4 * * 0 find /var/www/circuit-prompt-ai/logs -name "*.log" -mtime +30 -delete
```

**IMPORTANTE:** Ajusta las rutas según tu instalación.

### 3. Verificar Crontab

```bash
crontab -l
```

---

## 🌐 Configurar Nginx como Reverse Proxy

### 1. Instalar Nginx

```bash
sudo apt install -y nginx
```

### 2. Crear Configuración del Sitio

```bash
sudo nano /etc/nginx/sites-available/circuit-prompt-ai
```

**Contenido:**

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    # Redirigir a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tudominio.com www.tudominio.com;

    # SSL (configurar con Let's Encrypt - ver más abajo)
    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

    # Configuración SSL segura
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Tamaño máximo de upload
    client_max_body_size 10M;

    # Proxy a Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts (importante para embeddings)
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Logs
    access_log /var/log/nginx/circuit-prompt-ai-access.log;
    error_log /var/log/nginx/circuit-prompt-ai-error.log;
}
```

### 3. Habilitar Sitio

```bash
sudo ln -s /etc/nginx/sites-available/circuit-prompt-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tudominio.com -d www.tudominio.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

---

## ✅ Verificación del Deployment

### 1. Health Check Manual

```bash
cd /var/www/circuit-prompt-ai
./scripts/health-check.sh
```

**Salida esperada:**
```
======================================
   HEALTH CHECK - Sistema ML
======================================

🌐 Aplicación Next.js: ✅ CORRIENDO (HTTP 200)
🔴 Redis (Upstash): ✅ CONFIGURADO
🗄️  PostgreSQL: ✅ CONFIGURADO
🔐 CRON_SECRET: ✅ CONFIGURADO
🤖 Modelo Qwen (embeddings): ✅ DISPONIBLE (639M)
📋 Directorio de logs: ✅ EXISTE (5 archivos)
📊 API Embeddings Stats: ✅ DISPONIBLE

======================================
   FIN DEL HEALTH CHECK
======================================
```

### 2. Probar Endpoint de Cron

```bash
curl -H "Authorization: Bearer 918f2f0b4aa41187b7a9d31a10e782bbed58e67ca9b5e10de0bbd8e24f1c989a" \
  https://tudominio.com/api/cron/ml-moderation-analysis
```

### 3. Acceder al Dashboard

```
https://tudominio.com/dashboard/embeddings-monitor
```

---

## 🔄 Proceso de Actualización

### Para actualizar código:

```bash
cd /var/www/circuit-prompt-ai

# 1. Pull cambios
git pull origin main

# 2. Instalar nuevas dependencias (si hay)
npm install

# 3. Aplicar migraciones de BD (si hay)
npx prisma db push

# 4. Rebuild
npm run build

# 5. Reiniciar con PM2 (zero-downtime)
pm2 reload circuit-prompt-ai

# 6. Verificar
pm2 logs
```

---

## 📊 Monitoreo y Mantenimiento

### Ver Logs

```bash
# Logs de PM2
pm2 logs circuit-prompt-ai

# Logs de cron ML
tail -f /var/www/circuit-prompt-ai/logs/ml-analysis-$(date +%Y-%m-%d).log

# Logs de health check
tail -f /var/www/circuit-prompt-ai/logs/health-check.log

# Logs de Nginx
sudo tail -f /var/log/nginx/circuit-prompt-ai-access.log
sudo tail -f /var/log/nginx/circuit-prompt-ai-error.log
```

### Monitoreo de Recursos

```bash
# CPU y RAM
htop

# Espacio en disco
df -h

# Procesos Node.js
ps aux | grep node

# PM2 monitoring
pm2 monit
```

### Backups

```bash
# Backup de base de datos (manual)
pg_dump creador_inteligencias > backup-$(date +%Y-%m-%d).sql

# Backup automático configurado en:
# /api/cron/backup-database (ejecuta a las 3 AM)
```

---

## 🚨 Troubleshooting

### Aplicación no inicia

```bash
# Verificar logs de PM2
pm2 logs circuit-prompt-ai --lines 100

# Verificar puerto 3000
sudo netstat -tlnp | grep 3000

# Reiniciar PM2
pm2 restart circuit-prompt-ai
```

### Cron jobs no se ejecutan

```bash
# Verificar que crontab esté configurado
crontab -l

# Ver logs de cron del sistema
sudo tail -f /var/log/syslog | grep CRON

# Probar script manualmente
/var/www/circuit-prompt-ai/scripts/cron-ml-analysis.sh
```

### Embeddings lentos

```bash
# Verificar RAM disponible
free -h

# Si hay poca RAM, agregar swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Hacer swap permanente
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Base de datos lenta

```bash
# Verificar conexiones
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# Optimizar BD (si es necesario)
sudo -u postgres psql creador_inteligencias -c "VACUUM ANALYZE;"
```

---

## 📈 Optimizaciones para Producción

### 1. Configurar Swap (importante para embeddings)

```bash
# Crear swap de 2GB
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verificar
free -h
```

### 2. Limitar Logs de PM2

```bash
# Instalar módulo de rotación de logs
pm2 install pm2-logrotate

# Configurar
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 10
```

### 3. Configurar Firewall

```bash
# Habilitar UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Verificar
sudo ufw status
```

### 4. Monitoreo Automático con PM2 Plus (opcional)

```bash
# Crear cuenta en pm2.io
pm2 link <secret_key> <public_key>
```

---

## 🎯 Checklist de Deployment

- [ ] Servidor con Ubuntu 20.04+
- [ ] Node.js 18+ instalado
- [ ] PostgreSQL instalado y configurado
- [ ] PM2 instalado
- [ ] Repositorio clonado
- [ ] Variables de entorno configuradas (.env)
- [ ] Modelo Qwen descargado
- [ ] Migraciones de BD aplicadas
- [ ] Build de producción completado
- [ ] PM2 iniciado y guardado
- [ ] Cron jobs configurados
- [ ] Nginx instalado y configurado
- [ ] SSL/HTTPS configurado (Let's Encrypt)
- [ ] Health check pasa correctamente
- [ ] Dashboard accesible
- [ ] Logs rotando correctamente
- [ ] Backups configurados

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs: `pm2 logs`
2. Ejecuta health check: `./scripts/health-check.sh`
3. Verifica la documentación: `docs/ML_MODERATION_EMBEDDINGS_SYSTEM.md`
4. Crea un issue en GitHub

---

**Última actualización:** 2025-01-06
**Probado en:** Ubuntu 20.04 LTS, Ubuntu 22.04 LTS
