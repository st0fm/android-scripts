#!/usr/bin/env dash

. "$(dirname $0)/utils.sh"

[ "$#" -ne 2 ] && echo "Usage: $0 <app_pattern> <out_dir>" && exit 1

app_pattern="$1"
out_dir="$2"

pull_app "$app_pattern" "$out_dir"

