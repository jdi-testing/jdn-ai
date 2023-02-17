import { RulesMap } from "./rules.types";

export const VueRules: RulesMap[] = [
  {
    jdnLabel: "alert",
    rules: {
      classes: ["v-alert"],
    },
  },
  {
    jdnLabel: "appBar",
    rules: {
      classes: ["v-app-bar"],
    },
  },
  {
    jdnLabel: "aspectRatios",
    rules: {
      classes: ["v-responsive"],
    },
  },
  {
    jdnLabel: "button",
    rules: {
      classes: ["v-btn"],
    },
  },
  {
    jdnLabel: "autocomplete",
    rules: {
      classes: ["v-autocomplete"],
    },
  },
  {
    jdnLabel: "bottomnavigation",
    rules: {
      classes: ["v-bottom-navigation"],
    },
  },
  {
    jdnLabel: "bottomsheet",
    rules: {
      classes: ["v-bottom-sheet"],
    },
  },
  {
    jdnLabel: "card",
    rules: {
      classes: ["v-card"],
    },
    detectContent: true,
  },
  {
    jdnLabel: "calendar",
    rules: {
      classes: ["v-calendar"],
    },
  },
  {
    jdnLabel: "carousel",
    rules: {
      classes: ["v-carousel"],
    },
  },
  {
    jdnLabel: "checkbox",
    rules: {
      classes: ["v-input--checkbox"],
    },
  },
  {
    jdnLabel: "combobox",
    rules: {
      classes: ["v-select", "v-autocomplete"],
    },
  },
  {
    jdnLabel: "dataIterator",
    rules: {
      classes: ["v-data-iterator"],
    },
    detectContent: true,
  },
  // {
  //   jdnLabel: "dataTable",
  //   rules: {
  //     attributes: [["file", "v-data-table/usage"]],
  //   },
  // },
  {
    jdnLabel: "datePicker",
    rules: {
      classes: ["v-picker--date"],
      children: [
        {
          classes: ["v-date-picker-table--date"],
        },
      ],
    },
  },
  {
    jdnLabel: "datePickerMonth",
    rules: {
      classes: ["v-picker--date"],
      children: [
        {
          classes: ["v-date-picker-table--month"],
        },
      ],
    },
  },
  {
    jdnLabel: "dialog",
    rules: {
      classes: ["v-dialog"],
    },
    priority: "low",
  },
  {
    jdnLabel: "icon",
    rules: {
      classes: ["v-icon"],
    },
  },
  {
    jdnLabel: "input",
    rules: {
      classes: ["v-input"],
    },
    priority: "low",
  },
  {
    jdnLabel: "itemGroup",
    rules: {
      classes: ["v-item-group"],
    },
    priority: "low",
  },
  {
    jdnLabel: "listItemGoups",
    rules: {
      classes: ["v-list-item-group"],
    },
  },
  {
    jdnLabel: "menu",
    rules: {
      classes: ["v-menu__content"],
    },
  },
  {
    jdnLabel: "pagination",
    rules: {
      classes: ["v-pagination"],
    },
  },
  {
    jdnLabel: "radiobutton",
    rules: {
      classes: ["v-radio"],
    },
  },
  {
    jdnLabel: "radiobuttons",
    rules: {
      classes: ["v-input--radio-group"],
    },
  },
  {
    jdnLabel: "rangeSlider",
    rules: {
      classes: ["v-input--range-slider"],
    },
  },
  {
    jdnLabel: "select",
    rules: {
      classes: ["v-input", "v-select"],
    },
  },
  // {
  //   jdnLabel: "simpleTable",
  //   rules: {
  //     attributes: [["file", "v-simple-table/usage"]],
  //   },
  // },
  {
    jdnLabel: "slider",
    rules: {
      classes: ["v-input__slider"],
    },
  },
  {
    jdnLabel: "slideGroup",
    rules: {
      classes: ["v-slide-group"],
    },
  },
  {
    jdnLabel: "sheet",
    rules: {
      classes: ["v-sheet"],
    },
    detectContent: true,
    priority: "low",
  },
  {
    jdnLabel: "switch",
    rules: {
      classes: ["v-input--switch"],
    },
  },
  {
    jdnLabel: "systembar",
    rules: {
      classes: ["v-system-bar"],
    },
  },
  {
    jdnLabel: "textfield",
    rules: {
      classes: ["v-text-field"],
    },
  },
  {
    jdnLabel: "timepicker",
    rules: {
      classes: ["v-picker--time"],
    },
  },
  {
    jdnLabel: "toolbar",
    rules: {
      classes: ["v-toolbar"],
    },
  },
];
