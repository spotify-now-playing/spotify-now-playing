# spotify-now-playing

# Setting up the Raspberry Pi

Follow this guide: https://www.raspberrypi.com/tutorials/how-to-use-a-raspberry-pi-in-kiosk-mode/

But basically

```sh
$ sudo apt update
$ sudo apt full-upgrade

$ sudo reboot

$ sudo apt install xdotool unclutter

```

## raspi-config

```
sudo raspi-config
```

Simply set boot to Desktop Autologin

# kiosk.sh

```
$ sudo nano /home/pi/kiosk.sh
```

```
#!/bin/bash

xset s noblank
xset s off
xset -dpms

unclutter -idle 0.5 -root &

sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' /home/pi/.config/chromium/Default/Preferences
sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' /home/pi/.config/chromium/Default/Preferences

/usr/bin/chromium-browser --noerrdialogs --disable-infobars --kiosk https://spotify-now-playing.github.io/spotify-now-playing &

while true; do
   xdotool keydown ctrl+Tab; xdotool keyup ctrl+Tab;
   sleep 10
done
```

```
$ sudo nano /lib/systemd/system/kiosk.service
```

```
[Unit]
Description=Chromium Kiosk
Wants=graphical.target
After=graphical.target

[Service]
Environment=DISPLAY=:0.0
Environment=XAUTHORITY=/home/pi/.Xauthority
Type=simple
ExecStart=/bin/bash /home/pi/kiosk.sh
Restart=on-abort
User=pi
Group=pi

[Install]
WantedBy=graphical.target
```

```
$ sudo systemctl enable kiosk.service
$ sudo systemctl start kiosk.service
```
