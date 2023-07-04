#!/bin/sh

adb shell pm list packages -3 -f | while read p; do
    p=$(echo "$p" | sed 's/package://')
    appid=$(echo "$p" | sed 's/.*base\.apk=//')
    apppath=$(echo "$p" | rev | cut -d'=' -f2- | rev)
    echo "$appid ==> $apppath"
    adb pull "$apppath" "${appid}.apk"
done
