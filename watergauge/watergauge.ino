#include "HX711.h"

// HX711 circuit wiring
const int LOADCELL_DOUT_PIN = 2;
const int LOADCELL_SCK_PIN = 3;


HX711 scale;

void setup() {
  Serial.begin(9600);
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(171.2);
  scale.tare();
}

float cup_weight = 0.0;
float current_weight = 0.0;
float weight_difference = 0.0;
float water_consumed = 0.0;
bool cup_present = false;

void status() {
  Serial.print(cup_present);
  Serial.print(";");
  Serial.print(current_weight);
  Serial.print(";");
  Serial.print(cup_weight);
  Serial.print(";");
  Serial.print(weight_difference);
  Serial.print(";");
  Serial.print(water_consumed);
  Serial.print("\n");
}

void loop() {
  current_weight = scale.get_units(10);
  if(!cup_present && current_weight > 100) {
    // a cup is present
    cup_present = true;
    status();
    // wait for things to settle down, then measure again
    delay(5000);
    current_weight = scale.get_units(10);
    if(current_weight < cup_weight) {
      // cup is lighter than before, you drank something!
      weight_difference = cup_weight - current_weight;
      water_consumed += weight_difference;
    }
    cup_weight = current_weight;
  } else if(cup_present && current_weight < 100) {
    // the cup has been removed
    cup_present = false;
  } else if (current_weight < -100) {
    // we started up with a cup probably
    // wait for things to settle down, then measure again
    delay(1000);
    cup_weight = -scale.get_units(10);
    scale.tare();
  }
  status();
  delay(1000);
}
