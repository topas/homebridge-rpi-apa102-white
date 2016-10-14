# Homebridge plugin for APA102 LED strip (white only)

Plugin for controlling APA102 LED strip connected to Raspberry PI using GPIO. It doesn't use SPI bus because SPI needs root access rights. Instead of use SPI bit banging on two GPIO pins. 

If you need RGB version just fork this repo and make it RGB, it should be easy. I have only white version of APA102 LED strip so I created this plugin only for that. 

## Wiring 

Because of Raspberry PI has 3.3V logic and APA102 LED stripes has 5V you need level shifter. I used 74HCT125 wired as follows: 

## Homebridge configuration 

 