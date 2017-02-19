
const int switchPin = 11;
const int servoPin = 10;

// Bang my own bits to satisfy the requirements of the Parallax servo I have.
// https://www.parallax.com/sites/default/files/downloads/900-00008-Continuous-Rotation-Servo-Documentation-v2.2.pdf
// pin - digital pin to drive
// pulse - duration of high pulse in milliseconds
// iter - number of PWM periods
void Drive(int pin, float pulse, int iter) {
  debug(0x8);
  const int us = pulse * 1000;
  int i = 0;
  while (i++ < iter) {
    digitalWrite(pin, HIGH);
    delayMicroseconds(us);
    digitalWrite(pin, LOW);
    delay(20);
  }
}

// Drive forward at max speed for the specified duration.
void Forward(int pin, int durationMillis) {
  const float pulse = 1.3;
  int iter = durationMillis / (pulse + 20);
  Drive(pin, pulse, iter);
}

// Drive backward at max speed for the specified duration.
void Reverse(int pin, int durationMillis) {
  const float pulse = 1.7;
  int iter = durationMillis / (pulse + 20);
  Drive(pin, pulse, iter);
}

// Drive 'n' units forward. This does a little reversing along the way to help prevent jams I guess?
void Advance(int n) {
  for (int i = 0; i < n; ++i) {
    Forward(servoPin, 1500);
    Reverse(servoPin, 500);
  }
}

void setup() {
  pinMode(switchPin, INPUT_PULLUP);
  pinMode(servoPin, OUTPUT);

  Serial.begin(115200);
  Serial.write("\nSetting up\n");
  setupDbg();
  StartupAnimation();
}

void loop() {
  // When switch is closed, advance 3 times.
  if (!digitalRead(switchPin)) {
    Advance(3);
    debug(0x1);
    // Wait for switch to open. (It's fairly bouncy anyway, so whatever.)
    while (!digitalRead(switchPin)) {}
  }
}

