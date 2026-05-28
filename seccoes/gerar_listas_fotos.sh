#!/bin/bash

# Caminho base onde estão as pastas de fotos
BASE_DIR="/var/www/html/webpage/seccoes/fotografia"

# Array que associa o ficheiro txt à pasta correspondente
declare -A PASTAS=(
    ["lista-ultimas.txt"]="ultimas"
    ["lista-favoritas.txt"]="favoritas"
)

echo "--- A gerar listas de fotos: $(date) ---"

# Percorrer cada item do array
for arquivo_txt in "${!PASTAS[@]}"; do
    pasta="${PASTAS[$arquivo_txt]}"
    caminho_completo="$BASE_DIR/$pasta"
    destino="$BASE_DIR/$arquivo_txt"

    # Limpa o ficheiro txt antigo (para remover fotos que tenhas apagado)
    > "$destino"

    # Procura ficheiros de imagem e escreve o nome deles no txt
    # -maxdepth 1: não procura em subpastas
    # -printf "%f\n": escreve apenas o nome do ficheiro (sem o caminho da pasta)
    # sort: ordena alfabeticamente
    find "$caminho_completo" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) -printf "%f\n" | sort > "$destino"

    echo "Ficheiro $arquivo_txt atualizado com sucesso ($(wc -l < "$destino") fotos encontradas em '$pasta')."
done