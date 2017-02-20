
const int switchPin = 11;
const int servoPin = 10;

/*
   Driving the servo needed a separate voltage regulator from
   the arduino. Using an adjustable LM317T regulator, I connected
   a basic circuit with no capacitors.
   R1=1K
   R2=2.18K (nominal 2.2K)
   The math doesn't check out, but the voltage does.
*/

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

void Dispense() {
  if (Serial) {
    Serial.println("Dispensing product");
  }
  Advance(3);
}

void DelayUntil(unsigned long deadline) {
  Serial.print("Sleeping until ");
  Serial.println(deadline, DEC);
  const unsigned long now = millis();
  Serial.print("Sleeping for ");
  Serial.println((deadline - now), DEC);
  delay(deadline - now);
}

unsigned long nextRunMillis;

void setup() {
  pinMode(switchPin, INPUT_PULLUP);
  pinMode(servoPin, OUTPUT);

  nextRunMillis = millis() + 2000;

  Serial.begin(9600);
  if (Serial) {
    Serial.println("Setup done");
  }
}

#define HOUR (1000UL * 60UL * 60UL)

void loop() {
  DelayUntil(nextRunMillis);
  Dispense();
  nextRunMillis += HOUR;
}

