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
    detectContent: true,
    priority: "low",
  },
  {
    jdnLabel: "avatar",
    rules: {
      classes: ["v-avatar"],
    },
  },
  {
    jdnLabel: "badge",
    rules: {
      classes: ["v-badge"],
    },
  },
  {
    jdnLabel: "banner",
    rules: {
      classes: ["v-banner"],
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
    jdnLabel: "breadcrumbs",
    rules: {
      classes: ["v-breadcrumbs"],
    },
  },
  {
    jdnLabel: "button",
    rules: {
      classes: ["v-btn"],
    },
  },
  {
    jdnLabel: "buttonGroup",
    rules: {
      classes: ["v-btn-toggle"],
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
    jdnLabel: "chipgroup",
    rules: {
      classes: ["v-chip-group"],
    },
  },
  {
    jdnLabel: "colorpicker",
    rules: {
      classes: ["v-color-picker"],
    },
  },
  {
    jdnLabel: "combobox",
    rules: {
      classes: ["v-autocomplete"],
    },
    excludingRules: {
      classes: ["v-overflow-btn"],
    },
  },
  {
    jdnLabel: "dataIterator",
    rules: {
      classes: ["v-data-iterator"],
    },
    detectContent: true,
  },
  {
    jdnLabel: "dataTable",
    rules: {
      classes: ["v-data-table"],
      children: [
        {
          tag: "colgroup",
        },
      ],
    },
  },
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
    jdnLabel: "divider",
    rules: {
      classes: ["v-divider"],
    },
  },
  {
    jdnLabel: "expansionPanel",
    rules: {
      classes: ["v-expansion-panel"],
    },
  },
  {
    jdnLabel: "expansionPanels",
    rules: {
      classes: ["v-expansion-panels"],
    },
  },
  {
    jdnLabel: "fileInput",
    rules: {
      classes: ["v-file-input"],
    },
  },
  {
    jdnLabel: "footer",
    rules: {
      classes: ["v-footer"],
    },
  },
  {
    jdnLabel: "grid",
    rules: {
      classes: ["container"],
      children: [
        {
          classes: ["row"],
        },
      ],
    },
    detectContent: true,
  },
  {
    jdnLabel: "icon",
    rules: {
      classes: ["v-icon"],
    },
  },
  {
    jdnLabel: "image",
    rules: {
      classes: ["v-img"],
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
    jdnLabel: "listGroup",
    rules: {
      classes: ["v-list-group"],
    },
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
    jdnLabel: "navigationDrawer",
    rules: {
      classes: ["v-navigation-drawer"],
    },
  },
  {
    jdnLabel: "otpInput",
    rules: {
      classes: ["v-otp-input"],
    },
  },
  {
    jdnLabel: "overflowButton",
    rules: {
      classes: ["v-overflow-btn"],
    },
  },
  {
    jdnLabel: "overlay",
    rules: {
      classes: ["v-overlay"],
    },
  },
  {
    jdnLabel: "pagination",
    rules: {
      classes: ["v-pagination"],
    },
  },
  {
    jdnLabel: "paginationPage",
    rules: {
      tag: "button",
      classes: ["v-pagination__item"],
    },
  },
  {
    jdnLabel: "parallax",
    rules: {
      classes: ["v-parallax"],
    },
  },
  {
    jdnLabel: "progressCircular",
    rules: {
      classes: ["v-progress-circular"],
    },
  },
  {
    jdnLabel: "progressLinear",
    rules: {
      classes: ["v-progress-linear"],
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
    jdnLabel: "rating",
    rules: {
      classes: ["v-rating"],
    },
  },
  {
    jdnLabel: "select",
    rules: {
      classes: ["v-select"],
    },
    excludingRules: {
      classes: ["v-autocomplete", "v-overflow-btn"],
    },
  },
  {
    jdnLabel: "simpleTable",
    rules: {
      classes: ["v-data-table"],
    },
    excludingRules: {
      children: [
        {
          tag: "colgroup",
        },
      ],
    },
  },
  {
    jdnLabel: "skeletonLoader",
    rules: {
      classes: ["v-skeleton-loader"],
    },
  },
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
    jdnLabel: "snackbar",
    rules: {
      classes: ["v-snackbar"],
    },
  },
  {
    jdnLabel: "stepper",
    rules: {
      classes: ["v-stepper"],
    },
  },
  {
    jdnLabel: "step",
    rules: {
      classes: ["v-stepper__step"],
    },
  },
  {
    jdnLabel: "subheader",
    rules: {
      classes: ["v-subheader"],
    },
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
    jdnLabel: "tabs",
    rules: {
      classes: ["v-tabs"],
    },
  },
  {
    jdnLabel: "tableCheckbox",
    rules: {
      classes: ["v-simple-checkbox"]
    }
  },
  {
    jdnLabel: "text",
    rules: {
      selector: `.text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6, .text-subtitle-1, 
      .text-subtitle-2, .text-body-1, .text-body-2, .text-button, .text-caption, .text-overline`,
    }
  },
  {
    jdnLabel: "textArea",
    rules: {
      classes: ["v-textarea"],
    },
  },
  {
    jdnLabel: "textfield",
    rules: {
      classes: ["v-text-field"],
    },
    priority: "low",
  },
  {
    jdnLabel: "timeline",
    rules: {
      classes: ["v-timeline"],
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
  {
    jdnLabel: "tooltip",
    rules: {
      classes: ["v-tooltip"],
    },
  },
  {
    jdnLabel: "treeview",
    rules: {
      classes: ["v-treeview"],
    },
  },
  {
    jdnLabel: "virtualscroller",
    rules: {
      classes: ["v-virtual-scroll"],
    },
  },
  {
    jdnLabel: "windows",
    rules: {
      classes: ["v-window"],
    },
    priority: "low",
    detectContent: true,
  },
];
