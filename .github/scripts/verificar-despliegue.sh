#!/usr/bin/env bash
set -euo pipefail

componente=$1
url=${2%/}
sha=$3

if [[ "$url" != https://* || ! "$sha" =~ ^[0-9a-f]{40}$ ]]; then
  echo "::error::URL HTTPS o SHA esperado inválido."
  exit 1
fi

case "$componente" in
  backend) ruta=/estado/despliegue ;;
  frontend) ruta=/ ;;
  *) exit 1 ;;
esac

limite=$((SECONDS + 180))
validar_respuesta() {
  if [[ "$componente" == backend ]]; then
    jq -e --arg sha "$sha" '.sha == $sha and .sql == true' >/dev/null
  else
    grep -Fq "<meta name=\"version-despliegue\" content=\"$sha\">"
  fi
}

while (( SECONDS < limite )); do
  if respuesta=$(curl --fail --silent --connect-timeout 5 --max-time 10 \
    --header 'Cache-Control: no-cache' \
    "$url$ruta?sha=$sha&verificacion=$SECONDS") &&
    validar_respuesta <<< "$respuesta"; then
    echo "Versión $sha disponible en $url."
    exit 0
  fi
  sleep 5
done

echo "::error::No se verificó la versión $sha de $componente en $url."
exit 1
