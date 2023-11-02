#!/bin/sh

[ "$#" -ne 2 ] && echo "Usage: $0 <app_pattern> <port>" && echo "Example: com.f00.android 6667" && exit 1

app_pattern="$1"
port="$2"

pid=$(adb shell ps -A -o PID,NAME | grep "$app_pattern" | cut -d' ' -f1)
adb forward tcp:$port jdwp:$pid
adb forward --list

read -p "Hit any key to stop" XXX

adb forward --remove tcp:$port
