export default class Model {
  constructor() {
    this.isGameStarted = false;
    this.isGamePaused = false;

    this.country = null;
    this.interval = null;
    this.timer = 60;
    this.level = 1;
    this.lang = "en";
    this.stage = "easy";
    this.stageOrder = ["easy", "medium", "insane", "hardcore"];

    this.dataset = [];
    this.stageCategory = [];
    this.takenDataset = [];
  }

  isGivenCountryNameCorrect(val) {
    return this.country.toLowerCase() === val.toLowerCase();
  }

  getRandomCountry() {
    const availableCountry = this.stageCategory[this.stage];
    const remaining = availableCountry.filter((iso) => !this.takenDataset.includes(iso));

    if (remaining.length === 0) {
      const currentStageIndex = this.stageOrder.indexOf(this.stage);
      const nextStage = this.stageOrder[currentStageIndex + 1];

      if (nextStage) {
        this.stage = nextStage;
        return this.getRandomCountry();
      } else {
        return null;
      }
    }

    const randomIndex = Math.floor(Math.random() * remaining.length);
    const pickedCountry = remaining[randomIndex];
    this.takenDataset.push(pickedCountry);

    const countryData = this.dataset.find((item) => item.iso === pickedCountry);

    return {
      iso: countryData.iso,
      name: countryData.name[this.lang],
      hint: countryData.hint[this.lang],
      landmark: countryData.landmark[this.lang],
      food: countryData.food[this.lang],
      continent: countryData.continent[this.lang],
    };
  }

  reset() {
    this.isGamePaused = false;
    this.isGameStarted = false;
    this.country = null;
    this.timer = 60;
    this.level = 1;
    this.interval = null;
    this.takenDataset.length = 0;
  }
}
