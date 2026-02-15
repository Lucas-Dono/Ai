# Configuración de CI/CD Automático

Este proyecto utiliza GitHub Actions para desplegar automáticamente a producción cuando se hace push a la rama `main`.

## 📋 Requisitos Previos

Antes de que el CI/CD funcione, debes configurar los siguientes **secrets** en tu repositorio de GitHub.

## 🔑 Configurar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Secrets and variables** > **Actions**
4. Click en **New repository secret** y agrega los siguientes secrets:

### Secrets Requeridos:

| Secret Name | Descripción | Valor para tu servidor |
|------------|-------------|----------------------|
| `PROD_SERVER_HOST` | IP o dominio del servidor de producción | `168.181.185.116` |
| `PROD_SERVER_USER` | Usuario SSH del servidor | `root` |
| `PROD_SERVER_PORT` | Puerto SSH del servidor | `5191` |
| `PROD_SERVER_SSH_KEY` | Clave privada SSH (ver instrucciones abajo) | Tu clave privada SSH |

### Cómo obtener la clave privada SSH:

#### Opción 1: Usar clave SSH existente

Si ya tienes acceso SSH al servidor, copia tu clave privada:

```bash
# En tu máquina local (Linux/Mac)
cat ~/.ssh/id_rsa

# O si usas otra clave
cat ~/.ssh/nombre_de_tu_clave
```

Copia **TODO** el contenido, incluyendo las líneas `-----BEGIN ... KEY-----` y `-----END ... KEY-----`.

#### Opción 2: Crear una nueva clave SSH dedicada para CI/CD

```bash
# Generar nueva clave SSH
ssh-keygen -t rsa -b 4096 -C "github-actions-ci" -f ~/.ssh/github_actions_rsa

# Ver la clave privada (esto es lo que pegas en PROD_SERVER_SSH_KEY)
cat ~/.ssh/github_actions_rsa

# Ver la clave pública (esto es lo que agregas al servidor)
cat ~/.ssh/github_actions_rsa.pub
```

Luego, agrega la clave pública al servidor:

```bash
# Conectarte al servidor
ssh -p5191 root@168.181.185.116

# Agregar la clave pública al servidor
echo "TU_CLAVE_PUBLICA_AQUI" >> ~/.ssh/authorized_keys

# Dar permisos correctos
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

## 🚀 Cómo Funciona

Una vez configurados los secrets, el workflow se ejecutará automáticamente cada vez que hagas push a `main`:

```bash
# Hacer cambios en tu código
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# GitHub Actions automáticamente:
# 1. ✅ Se conecta al servidor de producción
# 2. ✅ Hace pull del código más reciente
# 3. ✅ Limpia recursos de Docker si es necesario
# 4. ✅ Construye la nueva imagen Docker
# 5. ✅ Reinicia los servicios
# 6. ✅ Verifica que todo esté funcionando
```

## 📊 Monitorear Deployments

Puedes ver el progreso de los deploys en:
- GitHub > Tu Repositorio > **Actions**

Cada deploy mostrará:
- ✅ Estado (Success/Failure)
- 📝 Logs detallados de cada paso
- ⏱️ Tiempo de ejecución

## 🔧 Ejecutar Deploy Manualmente

También puedes ejecutar el deploy manualmente sin hacer push:

1. Ve a **Actions** en GitHub
2. Selecciona **Deploy to Production**
3. Click en **Run workflow**
4. Selecciona la rama `main`
5. Click en **Run workflow**

## 🛡️ Seguridad

- ✅ La clave SSH privada está encriptada en GitHub Secrets
- ✅ Solo se puede acceder desde GitHub Actions
- ✅ No se expone en los logs
- ✅ Se recomienda usar una clave SSH dedicada solo para CI/CD

## 🐛 Troubleshooting

### Error: "Permission denied (publickey)"
- Verifica que `PROD_SERVER_SSH_KEY` contenga la clave privada completa
- Asegúrate de que la clave pública correspondiente esté en el servidor
- Verifica los permisos de `.ssh` y `authorized_keys` en el servidor

### Error: "No space left on device"
- El workflow limpia automáticamente el espacio antes de cada build
- Si persiste, conéctate al servidor manualmente y ejecuta:
  ```bash
  docker system prune -a --volumes -f
  rm -rf /var/lib/docker/buildkit/*
  ```

### Error: "Build failed"
- Revisa los logs en GitHub Actions para ver el error específico
- Verifica que el código compile localmente antes de hacer push
- Asegúrate de que todas las variables de entorno estén configuradas en el servidor

## ✅ Checklist de Configuración

- [ ] Crear los 4 secrets en GitHub (HOST, USER, PORT, SSH_KEY)
- [ ] Verificar que la clave SSH funciona conectándote manualmente
- [ ] Hacer un push de prueba a `main` para probar el workflow
- [ ] Verificar que el deploy se completó exitosamente en GitHub Actions
- [ ] Verificar que la aplicación funciona correctamente en producción

## 📚 Recursos

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SSH Action Documentation](https://github.com/appleboy/ssh-action)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
