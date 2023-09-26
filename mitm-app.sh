#!/bin/sh

[ "$#" -ne 2 ] && echo "Usage: $0 <app_pattern> <mitm-proxy-port>" && echo "Example: com.f00.android 8080" && exit 1

app_pattern="$1"
mitm_proxy_port="$2"

#app_uid=$(adb shell "ps -A -o UID,NAME" | grep "$app_pattern" | cut -d' ' -f1)
app_uid=$(adb shell "pm list packages -U | grep $app_pattern | cut -d':' -f3")
[ -z $app_uid ] && echo "[!] no app found with pattern = $app_pattern" && exit 1

echo "Found app UID = $app_uid for $app_pattern"

adb shell "su -c 'iptables -t nat -A OUTPUT -m owner --uid-owner $app_uid -p tcp --dport 80  -j DNAT --to-destination 127.0.0.1:$mitm_proxy_port'"
adb shell "su -c 'iptables -t nat -A OUTPUT -m owner --uid-owner $app_uid -p tcp --dport 443  -j DNAT --to-destination 127.0.0.1:$mitm_proxy_port'"

adb reverse tcp:$mitm_proxy_port tcp:$mitm_proxy_port

echo "Added new iptables rule for the app and forward port $mitm_proxy_port via adb to the device.\nAll TCP traffic from port 80 and 443 from UID = $app_uid will now be forwarded to $127.0.0.1:mitm_proxy_port on the android device."

echo "\niptables:"
adb shell "su -c 'iptables -t nat -L'" | grep DNAT
echo "\nreverse port forwarding:"
adb reverse --list

read -p "Hit any key to revert all changes" XXX

adb shell "su -c 'iptables -t nat -D OUTPUT -m owner --uid-owner $app_uid -p tcp --dport 80  -j DNAT --to-destination 127.0.0.1:$mitm_proxy_port'"
adb shell "su -c 'iptables -t nat -D OUTPUT -m owner --uid-owner $app_uid -p tcp --dport 443  -j DNAT --to-destination 127.0.0.1:$mitm_proxy_port'"
adb reverse --remove tcp:$mitm_proxy_port
