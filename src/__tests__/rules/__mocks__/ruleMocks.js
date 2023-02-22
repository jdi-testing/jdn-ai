export const ruleMock1 = {
  tag: "button",
  classes: ["v-btn"],
};

export const ruleMock2 = {
  classes: ["v-btn", "primary"],
};

export const ruleMock3 = {
  tag: "i",
  classes: [],
};

export const ruleMock4 = {
  classes: ["v-picker--date"],
  children: [
    {
      classes: ["v-date-picker-table--date"],
    },
  ],
};

export const ruleMock5 = {
  classes: ["v-picker"],
  children: [
    {
      classes: ["v-picker--date", "v-input"],
    },
  ],
};

export const ruleMock6 = {
  classes: ["v-select"],
  excludingClasses: ["v-autocomplete", "v-overflow-btn"],
};
