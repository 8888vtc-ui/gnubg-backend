FROM node:18-alpine

# Installation dépendances système pour GNUBG
RUN apk add --no-cache \
    gcc \
    musl-dev \
    wget \
    tar \
    make \
    flex \
    bison \
    python3 \
    python3-dev \
    libffi-dev \
    openssl-dev

WORKDIR /app

# Télécharger et compiler GNUBG
RUN wget https://ftp.gnu.org/gnu/gnubg/gnubg-1.06.002.tar.gz \
    && tar -xzf gnubg-1.06.002.tar.gz \
    && cd gnubg-1.06.002 \
    && ./configure \
    && make \
    && make install \
    && cd .. \
    && rm -rf gnubg-1.06.002.tar.gz gnubg-1.06.002

# Copier fichiers package
COPY package*.json ./

# Installer dépendances Node.js
RUN npm ci --only=production

# Copier code source
COPY . .

# Créer utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Changer permissions
RUN chown -R nodejs:nodejs /app
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Exposer port
EXPOSE 3000

# Commande démarrage
CMD ["npm", "start"]
