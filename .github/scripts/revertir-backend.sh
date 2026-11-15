#!/usr/bin/env bash
# vuelve a desplegar la ultima version del backend que paso la verificacion en este entorno
set -euo pipefail

workflow=$1
artefacto=$2
grupo=$3
app=$4
url=$5

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

zip=$(find "$destino" -maxdepth 1 -name '*.zip' | head -n 1)
sha=$(unzip -p "$zip" version.txt)
echo "Volviendo a la versión $sha guardada por la ejecución $encontrada."

az webapp deploy \
  --resource-group "$grupo" \
  --name "$app" \
  --src-path "$zip" \
  --type zip \
  --clean true \
  --restart true \
  --track-status false \
  --timeout 600000 \
  --only-show-errors \
  --output none

bash "$(dirname "$0")/verificar-despliegue.sh" backend "$url" "$sha"
printf 'sha=%s\n' "$sha" >> "$GITHUB_OUTPUT"
