#!/usr/bin/env bash
# registra un despliegue fallido como incidente y lo cierra cuando el servicio vuelve a operar
set -euo pipefail

accion=$1

case "$accion" in
  abrir)
    componente=$2
    entorno=$3
    sha=$4
    detectado=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    gh label create incidente --repo "$GITHUB_REPOSITORY" --color B60205 \
      --description "Despliegue fallido que requiere recuperar el servicio" --force >/dev/null
    url=$(gh issue create --repo "$GITHUB_REPOSITORY" --label incidente \
      --title "Incidente: despliegue fallido del $componente en $entorno (${sha:0:7})" \
      --body "$(printf 'El despliegue del commit `%s` no pasó la verificación de disponibilidad en %s.\n\n- Detectado: %s\n- Ejecución: %s/%s/actions/runs/%s' \
        "$sha" "$entorno" "$detectado" "$GITHUB_SERVER_URL" "$GITHUB_REPOSITORY" "$GITHUB_RUN_ID")")
    printf 'numero=%s\ndetectado=%s\n' "${url##*/}" "$detectado" >> "$GITHUB_OUTPUT"
    echo "Incidente registrado: $url"
    ;;
  cerrar)
    numero=$2
    detectado=$3
    sha=$4
    recuperado=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    segundos=$(( $(date -u -d "$recuperado" +%s) - $(date -u -d "$detectado" +%s) ))
    gh issue comment "$numero" --repo "$GITHUB_REPOSITORY" \
      --body "$(printf 'Servicio restablecido con la versión previa `%s`.\n\n- Detectado: %s\n- Recuperado: %s\n- Tiempo de recuperación: %d min %d s' \
        "$sha" "$detectado" "$recuperado" $((segundos / 60)) $((segundos % 60)))" >/dev/null
    gh issue close "$numero" --repo "$GITHUB_REPOSITORY" >/dev/null
    echo "Incidente #$numero cerrado. Tiempo de recuperación: $((segundos / 60)) min $((segundos % 60)) s"
    ;;
  *)
    echo "::error::Acción desconocida: $accion"
    exit 1
    ;;
esac
