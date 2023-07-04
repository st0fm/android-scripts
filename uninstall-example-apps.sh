#!/bin/sh

adb shell pm list packages | grep example | grep -v barcode | cut -d':' -f2 | while read p; do
    adb shell pm uninstall "$p"
done
