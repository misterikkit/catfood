
const int dbgPins[] = {2, 3, 4, 5, 6, 7, 8, 9};

#define WRITEPIN(p) (digitalWrite(dbgPins[p], (val & (1 << p)) ? HIGH : LOW))

void debug(int val) {
  /*
  if (Serial) {
    Serial.write(val);
  }
  */
  WRITEPIN(0);
  WRITEPIN(1);
  WRITEPIN(2);
  WRITEPIN(3);
  WRITEPIN(4);
  WRITEPIN(5);
  WRITEPIN(6);
  WRITEPIN(7);
}

#undef WRITEPIN

void setupDbg() {
  pinMode(dbgPins[0], OUTPUT);
  pinMode(dbgPins[1], OUTPUT);
  pinMode(dbgPins[2], OUTPUT);
  pinMode(dbgPins[3], OUTPUT);
  pinMode(dbgPins[4], OUTPUT);
  pinMode(dbgPins[5], OUTPUT);
  pinMode(dbgPins[6], OUTPUT);
  pinMode(dbgPins[7], OUTPUT);
  debug(0);
}

void StartupAnimation() {
  for (int i = 0xff; i ; i >>= 1) {
    debug(i);
    delay(200);
  }
  debug(0);
}

