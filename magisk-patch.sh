#!/bin/dash

[ -z "$1" ] && echo "Usage: $0 <boot.img>" && exit 1

bootimg="$1"

adb push "$bootimg" /sdcard/

newbootimg=`adb shell "su -c '/data/adb/magisk/boot_patch.sh /sdcard/$bootimg'" 2>&1 | grep 'Repack to boot image:' | cut -d'[' -f2 | sed 's/]//'`

[ -z "$newbootimg" ] && echo "no new boot image found" && exit 1
echo "newbootimg = $newbootimg"

adb shell "su -c 'mv /data/adb/magisk/$newbootimg /sdcard/'"
adb pull "/sdcard/$newbootimg" ./"magisk-$newbootimg"

