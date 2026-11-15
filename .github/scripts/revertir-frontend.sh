#!/usr/bin/env bash
# vuelve a publicar la ultima version del frontend que paso la verificacion en este entorno
set -euo pipefail

workflow=$1
artefacto=$2
url=$3

destino=$(mktemp -d)
trap 'rm -rf "$destino"' EXIT

# busca entre las ultimas ejecuciones exitosas la primera que guardo la version estable
ejecuciones=$(gh api "repos/$GITHUB_REPOSITORY/actions/workflows/$workflow/runs?status=success&per_page=20" \
  --jq ".workflow_runs[] | select(.id != $GITHUB_RUN_ID) | .id")
encontrada=""
for id in $ejecuciones; do
  if gh run download "$id" --repo "$GITHUB_REPOSITORY" --name "$artefacto" --dir "$destino" >/dev/null 2>&1; then
    encontrada=$id
    break
  fi
done

if [[ -z "$encontrada" ]]; then
  echo "::error::No hay una versión estable guardada para volver atrás. La recuperación debe hacerse manualmente."
  exit 1
fi

sha=$(grep -o '<meta name="version-despliegue" content="[0-9a-f]\{40\}">' "$destino/index.html" | grep -o '[0-9a-f]\{40\}')
echo "Volviendo a la versión $sha guardada por la ejecución $encontrada."

# testing usa la identidad del pipeline y los otros entornos la cadena de conexion
if [[ -n "${CADENA_CONEXION:-}" ]]; then
  az storage blob sync --connection-string "$CADENA_CONEXION" --container '$web' \
    --source "$destino" --delete-destination true --only-show-errors --output none
else
  az storage blob sync --account-name "$CUENTA_STORAGE" --auth-mode login --container '$web' \
    --source "$destino" --delete-destination true --only-show-errors --output none
fi

bash "$(dirname "$0")/verificar-despliegue.sh" frontend "$url" "$sha"
printf 'sha=%s\n' "$sha" >> "$GITHUB_OUTPUT"
