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

limite=$((SECONDS + 300))
respuesta=$(mktemp)
trap 'rm -f "$respuesta"' EXIT

while (( SECONDS < limite )); do
  restante=$((limite - SECONDS))
  if (( restante <= 0 )); then
    break
  fi
  max_peticion=$((restante < 10 ? restante : 10))
  if http=$(curl --silent --show-error --connect-timeout 5 --max-time "$max_peticion" \
    --output "$respuesta" --write-out '%{http_code}' \
    --header 'Cache-Control: no-cache' \
    "$url$ruta?sha=$sha&verificacion=$SECONDS"); then
    if [[ "$componente" == backend ]]; then
      if [[ "$http" == 200 ]] &&
        jq -e --arg sha "$sha" '.sha == $sha and .sql == true' "$respuesta" >/dev/null 2>&1; then
        echo "Versión $sha disponible en $url."
        exit 0
      elif jq -e --arg sha "$sha" '.sha == $sha and .sql == false' "$respuesta" >/dev/null 2>&1; then
        echo "HTTP $http: la versión esperada responde, pero SQL todavía no está disponible."
      elif [[ "$http" == 200 ]]; then
        echo "HTTP 200: la API todavía no confirma la versión esperada y su conexión a SQL."
      else
        echo "HTTP $http: la API todavía no está lista."
      fi
    elif [[ "$http" == 200 ]] && grep -Fq "<meta name=\"version-despliegue\" content=\"$sha\">" "$respuesta"; then
      echo "Versión $sha disponible en $url."
      exit 0
    elif [[ "$http" == 200 ]]; then
      echo "HTTP 200: el frontend todavía no sirve la versión esperada."
    else
      echo "HTTP $http: el frontend todavía no está listo."
    fi
  fi

  restante=$((limite - SECONDS))
  if (( restante > 0 )); then
    sleep "$((restante < 5 ? restante : 5))"
  fi
done

echo "::error::No se verificó la versión $sha de $componente en $url."
exit 1
