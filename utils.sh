##!/usr/bin/env dash

pull_app() {
    app_pattern="$1"
    out_dir="$2"

    package=$(adb shell pm list packages -3 -f | grep "$app_pattern")
    p=$(echo "$package" | sed 's/package://')
    appid=$(echo "$p" | sed 's/.*base\.apk=//')
    apppath=$(echo "$p" | rev | cut -d'/' -f2- | rev )

    out="${out_dir}/${appid}"
    mkdir -p "$out"
    adb shell "ls ${apppath}/*.apk" | xargs -I{} adb pull {} "${out}/"
}

