# Gnome Arduino water monitor

A Gnome Shell Extension to display the amount of water you're drinking, based on input from an Arduino.

![lego scale](ldraw/base_lc.png)

## Hardware

* An Arduino
* the [HX711 library](https://github.com/bogde/HX711)
* a [load cell](https://www.sparkfun.com/products/13329)
* a [load cell ampilifier](https://www.sparkfun.com/products/13879)
* some mechanical contraption to hold the cup

## Installation

```shell
$ git clone https://github.com/pepijndevos/gnome-water-status
$ ln -s /path/to/gnome-water-status ~/.local/share/gnome-shell/extensions/water-status@pepijndevos.nl
```
