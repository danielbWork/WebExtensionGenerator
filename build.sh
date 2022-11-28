#!/bin/bash

mkdir -p output

cd output

targets=(x86_64-unknown-linux-gnu x86_64-pc-windows-msvc x86_64-apple-darwin aarch64-apple-darwin)
names=(linux windows.exe x86_64-apple-darwin aarch64-apple-darwin)

for i in ${!targets[@]}; do
  deno compile --allow-run --allow-write --allow-read --allow-net --target ${targets[$i]} --output "webExtensionGenerator-${names[$i]}" ../cli.ts 
done

# 
# deno compile --allow-run --allow-write --allow-read --allow-net --target  ../cli.ts 
# deno compile --allow-run --allow-write --allow-read --allow-net --target  ../cli.ts 
# deno compile --allow-run --allow-write --allow-read --allow-net --target  ../cli.ts 

# output/webExtensionGenerator-linux