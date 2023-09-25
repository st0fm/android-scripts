#!/bin/sh

[ "$#" -ne 2 ] && echo "Usage: $0 <app_pattern> <mitm-proxy>" && echo "Example: com.f00.android 10.10.10.10:8080" && exit 1

app_pattern="$1"
mitm_proxy="$2"

app_uid=$(adb shell "ps -A -o UID,NAME" | grep "$app_pattern" | cut -d' ' -f1)
[ -z $app_uid ] && echo "[!] no app found with pattern = $app_pattern" && exit 1

echo "Found app UID = $app_uid for $app_pattern"

adb shell "su -c 'iptables -t nat -A OUTPUT -m owner --uid-owner $app_uid -p tcp --dport 80  -j DNAT --to-destination $mitm_proxy'"
adb shell "su -c 'iptables -t nat -A OUTPUT -m owner --uid-owner $app_uid -p tcp --dport 443  -j DNAT --to-destination $mitm_proxy'"

echo "Added new iptables rule for the app. All TCP traffic from port 80 and 443 from UID = $app_uid will now be forwarded to $mitm_proxy"
adb shell "su -c 'iptables -t nat -L'" | grep DNAT
