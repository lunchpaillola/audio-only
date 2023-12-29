#!/bin/bash
set -e
set -x

project_path=$(pwd) 
dir=$(dirname "${0}")

cd android/app
cd src/main

cat <<EOF > /tmp/adalo-sed
/android.permission.INTERNET/a\\
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>\
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS"/>\
    <uses-permission android:name="android.permission.RECORD_AUDIO"/>\\
    <uses-permission android:name="android.permission.CAMERA" />\\
EOF

sed -i.bak "$(cat /tmp/adalo-sed)" AndroidManifest.xml

echo "configured Android settings"