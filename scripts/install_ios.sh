#!/bin/bash
set -e
set -x


name=$PROJECT_NAME

if grep -q "<key>NSCameraUsageDescription" ios/$name/Info.plist; then
  echo "Camera already supported, nothing to do here."
else
  plutil -insert NSCameraUsageDescription -string 'Daily Playground needs camera access to work' ios/$name/Info.plist
fi

if grep -q "<key>NSMicrophoneUsageDescription" ios/$name/Info.plist; then
  echo "Microphone already supported, nothing to do here."
else
  plutil -insert NSMicrophoneUsageDescription -string 'Daily Playground needs microphone access to work' ios/$name/Info.plist
fi

if grep -q "<string>voip" ios/$name/Info.plist; then
    echo "Background voip already supported, nothing to do here."
elif grep -q UIBackgroundModes ios/$name/Info.plist
then
    plutil -insert UIBackgroundModes.0 -string 'voip' ios/$name/Info.plist
else
    plutil -insert UIBackgroundModes -xml "<array><string>voip</string></array>" ios/$name/Info.plist
fi

echo "configured iOS settings"