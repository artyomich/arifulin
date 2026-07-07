#!/bin/bash
# ============================================
# Deploy script for arifulin.ru
# Копирует файлы проекта на веб-сервер
# ============================================

set -e

# ----- Конфигурация -----
REMOTE_USER="artem"
REMOTE_HOST="arifulin.ru"
REMOTE_DIR="/var/www/arifulin_ru_usr/data/www/arifulin.ru"
SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"
SSH_KEY="${SSH_KEY_PATH:-$HOME/.ssh/id_ed25519}"

# ----- Цвета для вывода -----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ----- Проверка зависимостей -----
check_dependencies() {
    local missing=()
    for cmd in ssh rsync; do
        if ! command -v "$cmd" &>/dev/null; then
            missing+=("$cmd")
        fi
    done
    if [ ${#missing[@]} -gt 0 ]; then
        log_error "Отсутствуют зависимости: ${missing[*]}"
        log_info "Установите: sudo apt install openssh-client rsync"
        exit 1
    fi
}

# ----- Проверка SSH-ключей -----
setup_ssh_keys() {
    if [ ! -f "$SSH_KEY" ]; then
        log_warn "SSH-ключ не найден: $SSH_KEY"
        log_info "Создаём новый ключ..."
        ssh-keygen -t ed25519 -f "$SSH_KEY" -N "" -C "deploy@arifulin.ru"
    fi

    # Проверяем, добавлен ли ключ на сервер
    if ! ssh -o BatchMode=yes -o ConnectTimeout=5 "$REMOTE_USER@$REMOTE_HOST" "echo ok" 2>/dev/null; then
        log_warn "SSH-ключ не добавлен на сервер $REMOTE_USER@$REMOTE_HOST"
        log_info "Для автоматического деплоя выполните:"
        log_info "  ssh-copy-id -i $SSH_KEY.pub $REMOTE_USER@$REMOTE_HOST"
        log_info ""
        log_info "ИЛИ введите пароль вручную при следующем запуске."
        log_info ""

        # Спрашиваем, хотим ли ввести пароль сейчас
        read -rp "Использовать парольную авторизацию сейчас? [y/N]: " use_password
        if [[ "$use_password" =~ ^[Yy] ]]; then
            deploy_with_password
        else
            deploy_with_ssh
        fi
    else
        deploy_with_ssh
    fi
}

# ----- Деплой через SSH (с ключами) -----
deploy_with_ssh() {
    log_info "Деплой через SSH (ключевая авторизация)..."
    log_info "Источник: $SOURCE_DIR"
    log_info "Цель: $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR"

    # Создаём директорию на сервере
    ssh "$REMOTE_USER@$REMOTE_HOST" "mkdir -p $REMOTE_DIR"

    # Копируем файлы через rsync
    rsync -avz --delete \
        -e "ssh -i $SSH_KEY" \
        --exclude='.git/' \
        --exclude='.gitignore' \
        --exclude='deploy.sh' \
        --exclude='backup/' \
        --exclude='*.txt' \
        --exclude='.vscode/' \
        "$SOURCE_DIR/" \
        "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/"

    log_info "Деплой завершён!"
    log_info "Проверьте: http://$REMOTE_HOST"
}

# ----- Деплой через rsync с парольной авторизацией -----
deploy_with_password() {
    log_info "Деплой через rsync (парольная авторизация)..."
    log_info "Источник: $SOURCE_DIR"
    log_info "Цель: $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR"

    # Создаём директорию на сервере
    ssh "$REMOTE_USER@$REMOTE_HOST" "mkdir -p $REMOTE_DIR"

    # Копируем файлы через rsync с парольной авторизацией
    rsync -avz --delete \
        --exclude='.git/' \
        --exclude='.gitignore' \
        --exclude='deploy.sh' \
        --exclude='backup/' \
        --exclude='*.txt' \
        --exclude='.vscode/' \
        "$SOURCE_DIR/" \
        "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/"

    log_info "Деплой завершён!"
    log_info "Проверьте: http://$REMOTE_HOST"
}

# ----- Быстрый деплой через scp (если rsync недоступен) -----
deploy_with_scp() {
    log_info "Деплой через scp..."
    log_info "Источник: $SOURCE_DIR"
    log_info "Цель: $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR"

    ssh "$REMOTE_USER@$REMOTE_HOST" "mkdir -p $REMOTE_DIR"

    # Копируем основные файлы
    scp -r \
        index.html css/ js/ media/ \
        "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/"

    log_info "Деплой завершён!"
}

# ----- Главная функция -----
main() {
    log_info "Deploy for arifulin.ru"
    echo ""

    check_dependencies

    case "${1:-interactive}" in
        --ssh)
            deploy_with_ssh
            ;;
        --password)
            deploy_with_password
            ;;
        --scp)
            deploy_with_scp
            ;;
        --setup-ssh)
            setup_ssh_keys
            ;;
        *)
            setup_ssh_keys
            ;;
    esac
}

main "$@"