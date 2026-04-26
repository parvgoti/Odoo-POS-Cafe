#!/bin/bash
# =============================================
# DevOps Mastery — VPS Server Setup Script
# =============================================
# Run on a fresh Ubuntu 22.04+ / Debian 12+ VPS.
#
# Usage:
#   curl -fsSL https://example.com/setup.sh | bash
#   OR
#   chmod +x setup-server.sh && sudo ./setup-server.sh
#
# What this does:
#   1. System updates and essentials
#   2. Create deploy user
#   3. SSH hardening
#   4. Firewall setup (UFW)
#   5. Fail2ban
#   6. Docker + Docker Compose
#   7. Node.js 22 (optional)
#   8. Certbot (Let's Encrypt)
#   9. Auto-updates
# =============================================

set -euo pipefail

# ---- Configuration ----
DEPLOY_USER="${DEPLOY_USER:-deploy}"
SSH_PORT="${SSH_PORT:-22}"
TIMEZONE="${TIMEZONE:-UTC}"
SWAP_SIZE="${SWAP_SIZE:-2G}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()     { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn()    { echo -e "${YELLOW}⚠️  $1${NC}"; }

# ---- Check root ----
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root: sudo $0"
  exit 1
fi

echo ""
echo "================================================="
echo "   Server Setup — Production Ready"
echo "================================================="
echo ""


# ==========================================
# 1. SYSTEM UPDATES
# ==========================================
log "1/9 — Updating system packages..."

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq \
  curl wget git unzip htop ncdu \
  build-essential gcc g++ make \
  software-properties-common \
  apt-transport-https ca-certificates \
  gnupg lsb-release jq

# Set timezone
timedatectl set-timezone "$TIMEZONE"

success "System updated"


# ==========================================
# 2. CREATE DEPLOY USER
# ==========================================
log "2/9 — Creating deploy user..."

if ! id "$DEPLOY_USER" &>/dev/null; then
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
  usermod -aG sudo "$DEPLOY_USER"
  echo "$DEPLOY_USER ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$DEPLOY_USER

  # Copy SSH keys from root
  mkdir -p /home/$DEPLOY_USER/.ssh
  if [ -f /root/.ssh/authorized_keys ]; then
    cp /root/.ssh/authorized_keys /home/$DEPLOY_USER/.ssh/
  fi
  chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh
  chmod 700 /home/$DEPLOY_USER/.ssh
  chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys 2>/dev/null || true

  success "Deploy user '$DEPLOY_USER' created"
else
  warn "User '$DEPLOY_USER' already exists"
fi


# ==========================================
# 3. SSH HARDENING
# ==========================================
log "3/9 — Hardening SSH..."

# Backup original config
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

cat > /etc/ssh/sshd_config.d/hardened.conf << EOF
# SSH Hardening
Port $SSH_PORT
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
ChallengeResponseAuthentication no
UsePAM yes
X11Forwarding no
PrintMotd no
AcceptEnv LANG LC_*
MaxAuthTries 5
MaxSessions 10
ClientAliveInterval 300
ClientAliveCountMax 2
EOF

systemctl restart sshd

success "SSH hardened (Port: $SSH_PORT, Key-only auth)"


# ==========================================
# 4. FIREWALL (UFW)
# ==========================================
log "4/9 — Configuring firewall..."

apt-get install -y -qq ufw

ufw default deny incoming
ufw default allow outgoing
ufw allow "$SSH_PORT/tcp" comment "SSH"
ufw allow 80/tcp comment "HTTP"
ufw allow 443/tcp comment "HTTPS"

# Enable without prompt
echo "y" | ufw enable

success "Firewall configured (ports: $SSH_PORT, 80, 443)"


# ==========================================
# 5. FAIL2BAN
# ==========================================
log "5/9 — Installing Fail2ban..."

apt-get install -y -qq fail2ban

cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
ignoreip = 127.0.0.1/8

[sshd]
enabled = true
port = $SSH_PORT
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400
EOF

systemctl enable fail2ban
systemctl restart fail2ban

success "Fail2ban installed (SSH brute-force protection)"


# ==========================================
# 6. DOCKER + COMPOSE
# ==========================================
log "6/9 — Installing Docker..."

if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
  usermod -aG docker "$DEPLOY_USER"

  # Docker daemon config
  mkdir -p /etc/docker
  cat > /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-address-pools": [
    {"base": "172.17.0.0/16", "size": 24}
  ],
  "live-restore": true,
  "userland-proxy": false
}
EOF

  systemctl enable docker
  systemctl restart docker

  success "Docker installed"
else
  warn "Docker already installed"
fi


# ==========================================
# 7. NODE.JS 22 (Optional)
# ==========================================
log "7/9 — Installing Node.js 22..."

if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -qq nodejs
  npm install -g pm2
  success "Node.js $(node -v) installed"
else
  warn "Node.js $(node -v) already installed"
fi


# ==========================================
# 8. CERTBOT (Let's Encrypt)
# ==========================================
log "8/9 — Installing Certbot..."

if ! command -v certbot &>/dev/null; then
  apt-get install -y -qq certbot
  success "Certbot installed"
else
  warn "Certbot already installed"
fi


# ==========================================
# 9. SWAP + AUTO-UPDATES
# ==========================================
log "9/9 — Setting up swap and auto-updates..."

# Create swap if not exists
if ! swapon -s | grep -q "/swapfile"; then
  fallocate -l "$SWAP_SIZE" /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo "/swapfile none swap sw 0 0" >> /etc/fstab

  # Optimize swap
  sysctl vm.swappiness=10
  echo "vm.swappiness=10" >> /etc/sysctl.conf
  sysctl vm.vfs_cache_pressure=50
  echo "vm.vfs_cache_pressure=50" >> /etc/sysctl.conf

  success "Swap configured ($SWAP_SIZE)"
fi

# Automatic security updates
apt-get install -y -qq unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades 2>/dev/null || true

success "Auto-updates configured"


# ==========================================
# SETUP COMPLETE
# ==========================================
echo ""
echo "================================================="
echo "   ✅ Server Setup Complete!"
echo "================================================="
echo ""
echo "  Deploy user: $DEPLOY_USER"
echo "  SSH port:    $SSH_PORT"
echo "  Firewall:    UFW (ports $SSH_PORT, 80, 443)"
echo "  Docker:      $(docker --version 2>/dev/null || echo 'installed')"
echo "  Node.js:     $(node --version 2>/dev/null || echo 'installed')"
echo "  Swap:        $SWAP_SIZE"
echo ""
echo "  Next steps:"
echo "    1. Add your SSH key to /home/$DEPLOY_USER/.ssh/authorized_keys"
echo "    2. Upload your app: scp -r ./app $DEPLOY_USER@server:/app"
echo "    3. Deploy: cd /app && docker compose up -d"
echo "    4. Setup SSL: certbot certonly --standalone -d example.com"
echo ""
echo "================================================="
