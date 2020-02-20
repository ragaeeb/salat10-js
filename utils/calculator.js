const SunCalc = require("suncalc");
const { CalculationMethod, PrayerTimes, Coordinates } = require("adhan");

const extractTime = data => data.getTime();

const calculate = (date, latitude, longitude) => {
  const {
    nauticalDawn: fajr,
    sunrise,
    sunset: maghrib,
    nauticalDusk: isha,
    solarNoon: dhuhr
  } = SunCalc.getTimes(date, latitude, longitude);
  const { asr } = new PrayerTimes(
    new Coordinates(latitude, longitude),
    date,
    CalculationMethod.MuslimWorldLeague()
  );

  return {
    fajr,
    sunrise,
    dhuhr,
    asr,
    maghrib,
    isha
  };
};

const calculateForCoordinates = (latitude, longitude) => {
  const now = new Date();
  now.setHours(0);
  now.setMinutes(0);
  now.setSeconds(0);
  now.setMilliseconds(0);

  const today = calculate(now, Number(latitude), Number(longitude));

  const tomorrow = calculate(
    new Date(now.getTime() + 24 * 3600 * 1000),
    Number(latitude),
    Number(longitude)
  );

  const halfNight = new Date(
    (today.maghrib.getTime() + tomorrow.fajr.getTime()) / 2
  );

  const diff = tomorrow.fajr.getTime() - today.maghrib.getTime();
  const lastThirdNight = new Date(tomorrow.fajr.getTime() - diff / 3);

  return {
    fajr: extractTime(today.fajr),
    sunrise: extractTime(today.sunrise),
    dhuhr: extractTime(today.dhuhr),
    asr: extractTime(today.asr),
    maghrib: extractTime(today.maghrib),
    isha: extractTime(today.isha),
    halfNight: extractTime(halfNight),
    lastThirdNight: extractTime(lastThirdNight)
  };
};

module.exports = calculateForCoordinates;
