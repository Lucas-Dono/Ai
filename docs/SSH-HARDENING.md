# Guía de SSH Hardening para Sistema Admin

Esta guía te ayudará a configurar SSH de forma segura para el sistema de recuperación de emergencia del panel admin.

## 📋 Tabla de Contenidos

1. [Configuración Básica](#configuración-básica)
2. [Autenticación por Clave Pública](#autenticación-por-clave-pública)
3. [Desactivar Password Authentication](#desactivar-password-authentication)
4. [Rate Limiting y Fail2Ban](#rate-limiting-y-fail2ban)
5. [IP Whitelist (Opcional)](#ip-whitelist-opcional)
6. [Configuración Recomendada Completa](#configuración-recomendada-completa)

---

## Configuración Básica

### 1. Editar configuración SSH

```bash
sudo nano /etc/ssh/sshd_config
```

### 2. Configuración mínima recomendada

```bash
# Puerto SSH (cambiar del default 22 agrega seguridad por oscuridad)
Port 22  # O cambia a otro puerto, ej: 2222

# Protocolo
Protocol 2  # Solo SSH2, SSH1 es inseguro

# Logging
SyslogFacility AUTH
LogLevel VERBOSE  # Logs detallados de intentos de acceso

# Autenticación
PermitRootLogin no  # No permitir login directo como root
MaxAuthTries 3      # Máximo 3 intentos de autenticación
MaxSessions 2       # Máximo 2 sesiones simultáneas

# Timeouts
ClientAliveInterval 300   # Ping al cliente cada 5 minutos
ClientAliveCountMax 2     # Desconectar si no responde 2 veces
LoginGraceTime 60         # 60 segundos para completar login

# Autenticación por password (DESACTIVAR después de configurar keys)
PasswordAuthentication no
PermitEmptyPasswords no
ChallengeResponseAuthentication no

# Autenticación por clave pública
PubkeyAuthentication yes

# X11 Forwarding (desactivar si no se usa)
X11Forwarding no

# No permitir archivos .rhosts
IgnoreRhosts yes
HostbasedAuthentication no

# No permitir login con usuario sin password
PermitEmptyPasswords no
```

### 3. Reiniciar SSH

```bash
sudo systemctl restart sshd
```

---

## Autenticación por Clave Pública

### 1. Generar par de claves (en tu máquina local)

```bash
# ED25519 (más seguro y rápido)
ssh-keygen -t ed25519 -C "admin@tu-dominio.com"

# O RSA 4096 (compatible con sistemas antiguos)
ssh-keygen -t rsa -b 4096 -C "admin@tu-dominio.com"
```

Guarda la clave en un lugar seguro:
- Clave privada: `~/.ssh/id_ed25519` (NUNCA compartir)
- Clave pública: `~/.ssh/id_ed25519.pub`

### 2. Copiar clave pública al servidor

```bash
# Método 1: ssh-copy-id (más fácil)
ssh-copy-id -i ~/.ssh/id_ed25519.pub admin@tu-servidor.com

# Método 2: Manual
cat ~/.ssh/id_ed25519.pub | ssh admin@tu-servidor.com "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### 3. Verificar permisos en el servidor

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 4. Probar conexión

```bash
ssh -i ~/.ssh/id_ed25519 admin@tu-servidor.com
```

Si funciona, puedes desactivar password authentication en `sshd_config`.

---

## Desactivar Password Authentication

**⚠️ IMPORTANTE:** Solo hacer esto después de verificar que la autenticación por clave funciona.

```bash
sudo nano /etc/ssh/sshd_config
```

Cambiar/agregar:

```bash
PasswordAuthentication no
PubkeyAuthentication yes
```

Reiniciar SSH:

```bash
sudo systemctl restart sshd
```

---

## Rate Limiting y Fail2Ban

### 1. Instalar Fail2Ban

```bash
sudo apt update
sudo apt install fail2ban
```

### 2. Configurar Fail2Ban para SSH

```bash
sudo nano /etc/fail2ban/jail.local
```

Agregar:

```ini
[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3        # Bloquear después de 3 intentos fallidos
bantime = 3600      # Banear por 1 hora
findtime = 600      # Ventana de 10 minutos
```

### 3. Iniciar Fail2Ban

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. Verificar estado

```bash
# Ver status
sudo fail2ban-client status sshd

# Ver IPs baneadas
sudo fail2ban-client get sshd banned
```

---

## IP Whitelist (Opcional)

Si tienes IPs fijas, puedes limitar el acceso SSH solo a esas IPs.

### Opción 1: Firewall (UFW)

```bash
# Bloquear todo SSH
sudo ufw deny 22

# Permitir solo tu IP
sudo ufw allow from TU.IP.AQUI to any port 22

# Habilitar firewall
sudo ufw enable
```

### Opción 2: SSH Config (Match)

```bash
sudo nano /etc/ssh/sshd_config
```

Agregar al final:

```bash
# Solo permitir desde IPs específicas
Match Address 1.2.3.4,5.6.7.8
    AllowUsers admin

# Bloquear todos los demás
Match Address *,!1.2.3.4,!5.6.7.8
    DenyUsers *
```

Reiniciar SSH:

```bash
sudo systemctl restart sshd
```

---

## Configuración Recomendada Completa

Archivo `/etc/ssh/sshd_config` optimizado para el sistema admin:

```bash
# Puerto
Port 22

# Protocolo y claves
Protocol 2
HostKey /etc/ssh/ssh_host_ed25519_key
HostKey /etc/ssh/ssh_host_rsa_key

# Logging
SyslogFacility AUTH
LogLevel VERBOSE

# Autenticación
PermitRootLogin no
MaxAuthTries 3
MaxSessions 2
PubkeyAuthentication yes
PasswordAuthentication no
PermitEmptyPasswords no
ChallengeResponseAuthentication no

# Usuarios permitidos (opcional - cambiar por tu usuario)
AllowUsers admin

# Timeouts
ClientAliveInterval 300
ClientAliveCountMax 2
LoginGraceTime 60

# Forwarding
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no
PermitTunnel no

# Otros
IgnoreRhosts yes
HostbasedAuthentication no
PermitUserEnvironment no
Compression no
UsePAM yes
PrintMotd no
PrintLastLog yes
TCPKeepAlive yes
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server
```

---

## 🔐 Checklist de Seguridad

- [ ] Autenticación por clave pública configurada y probada
- [ ] Password authentication desactivada
- [ ] Fail2Ban instalado y configurado
- [ ] Root login deshabilitado
- [ ] MaxAuthTries configurado a 3 o menos
- [ ] Logging verbose activado
- [ ] Firewall configurado (opcional)
- [ ] IP whitelist configurada (si aplica)
- [ ] Puerto SSH cambiado (opcional, seguridad por oscuridad)
- [ ] Backup de clave privada en lugar seguro

---

## 🆘 Recuperación de Emergencia

### Si te quedas fuera del servidor

1. **Acceso por consola del proveedor** (DigitalOcean, AWS, etc.)
   - Todos los proveedores tienen una consola web

2. **Revertir cambios en SSH**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Cambiar: PasswordAuthentication yes
   sudo systemctl restart sshd
   ```

3. **Verificar Fail2Ban**
   ```bash
   sudo fail2ban-client unban --all
   ```

### Logs útiles

```bash
# Ver intentos de login
sudo tail -f /var/log/auth.log

# Ver conexiones SSH activas
who

# Ver intentos fallidos
sudo grep "Failed password" /var/log/auth.log
```

---

## 📚 Referencias

- [Mozilla SSH Guidelines](https://infosec.mozilla.org/guidelines/openssh)
- [SSH Hardening Guide - CIS Benchmarks](https://www.cisecurity.org/)
- [Fail2Ban Documentation](https://www.fail2ban.org/)
