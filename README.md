# GeenenSerial
Communicate with LED display over serialport

Rest server listens to port 1337. Server expects json.

### Samples

Number and money (int and float)

    {
        "lineA": {
            "type": "number",
            "value": 12
        },
        "lineB": {
            "type": "money",
            "value": 0.12
        }
    }

Display time as string or give the amount of seconds

    {
        "lineA": {
            "type": "time",
            "value": "12:10:00"
        },
        "lineB": {
            "type": "time",
            "value": 3000
        }
    }
