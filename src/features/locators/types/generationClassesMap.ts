import { HttpEndpoint } from "../../../services/backend";

export const defaultClass = "UIElement";

export enum HTML5classes {
  button = "Button",
  checkbox = "Checkbox",
  checklist = "Checklist",
  colorpicker = "ColorPicker",
  datalist = "Combobox",
  datetimeselector = "DateTimeSelector",
  dropdown = "Dropdown",
  fileinput = "FileInput",
  label = "Label",
  link = "Link",
  multidropdown = "MultiSelector",
  multiselector = "MultiSelector",
  numberselector = "NumberSelector",
  progressbar = "ProgressBar",
  radiobuttongroup = "RadioButtons",
  range = "Range",
  table = "Table",
  text = "Text",
  textarea = "TextArea",
  textfield = "TextField",
  title = "Title",
}

export enum MUIclasses {
  accordion = "Accordion",
  badge = "Badge",
  "bottom-navigation" = "BottomNavigation",
  button = "Button",
  "button-group" = "ButtonGroup",
  breadcrumbs = "Breadcrumbs",
  checkbox = "Checkbox",
  chip = "Chip",
  dialog = "Dialog",
  drawer = "Drawer",
  link = "Link",
  list = "List",
  menu = "Menu",
  progress = "ProgressBar",
  radiogroup = "RadioButtons",
  select = "Select",
  slider = "Slider",
  snackbar = "Snackbar",
  stepper = "Stepper",
  switch = "Switch",
  tabs = "Tabs",
  table = "Table",
  "textarea-autosize" = "TextArea",
  "text-field" = "TextField",
}

export enum NgMatClasses {
  autocomplete = "AutoComplete",
  badge = "Badge",
  "bottom-sheet" = "BottomSheet",
  button = "Button",
  buttontoggle = "ButtonToggle",
  card = "Card",
  checkbox = "Checkbox",
  chips = "Chips",
  datepicker = "Datepicker",
  dialog = "Dialog",
  "expansion-panel" = "ExpansionPanel",
  "form-field" = "FormField",
  "input-text-area" = "TextArea",
  "input-text-field" = "TextField",
  list = "JList<?>",
  menu = "NestedDropdownMenu",
  paginator = "Paginator",
  "progress-bar" = "ProgressBar",
  "radio-buttons" = "RadioButtons",
  "select-material-selector" = "MaterialSelector",
  "select-native-selector" = "NativeSelector",
  "side-nav" = "SideNav",
  slider = "Slider",
  "slide-toggle" = "SlideToggle",
  snackbar = "Snackbar",
  tabs = "Tabs",
  table = "Table",
  tree = "MaterialTree",
}

export enum VuetifyClasses {
  alert = "Alert",
  appBar = "AppBar",
  aspectRatios = "AspectRatios",
  autocomplete = "Autocomplete",
  avatar = "Avatar",
  badge = "Badge",
  banner = "Banner",
  bottomnavigation = "BottomNavigation",
  bottomsheet = "BottomSheet",
  breadcrumbs = "Breadcrumbs",
  button = "VuetifyButton",
  buttonGroup = "ButtonGroup", // conflicts with v-item-group
  calendar = "Calendar",
  card = "Card",
  carousel = "Carousel",
  checkbox = "Checkbox",
  chip = "Chip",
  chipgroup = "ChipGroup",
  colorpicker = "ColorPicker",
  combobox = "Combobox",
  dataIterator = "DataIterator",
  // dataTable = "DataTable", // need to update detector
  datePicker = "DatePicker",
  datePickerMonth = "DatePickerMonth",
  dialog = "Dialog",
  divider = "Divider",
  expansionPanel = "ExpansionPanel",
  expansionPanels = "ExpansionPanels",
  fileInput = "FileInput",
  footer = "Footer",
  // grid = "Grid", // what exactly?
  icon = "Icon",
  image = "Image",
  input = "Input",
  itemGroup = "ItemGroup",
  listGroup = "VuetifyListGroup",
  listItemGoups = "ListItemGroups",
  menu = "Menu",
  navigationDrawer = "NavigationDrawer",
  otpInput = "OtpInput",
  overflowButton = "OverflowButton",
  overlay = "Overlay",
  pagination = "Pagination",
  // paginationPage = "PaginationPage", // what is it?
  parallax = "Parallax",
  progressCircular = "ProgressCircular",
  progressLinear = "ProgressLinear",
  radiobutton = "RadioButton",
  radiobuttons = "RadioButtons",
  rangeSlider = "RangeSlider",
  rating = "Rating",
  select = "Select",
  // simpleTable = "SimpleTable", // need additional implementation
  skeletonLoader = "SkeletonLoader",
  slider = "Slider",
  slideGroup = "SlideGroup",
  sheet = "Sheet",
  snackbar = "Snackbar",
  // sparkline = "Sparkline", // need additional implementation
  // step = "Step", // item of a stepper?
  stepper = "Stepper",
  subheader = "Subheader",
  switch = "Switch",
  systembar = "SystemBar",
  // tableCheckbox = "TableCheckbox", // what is it?
  tabs = "VuetifyTabs",
  // text = "Text",   // what is it?
  textArea = "TextArea",
  textfield = "TextField",
  timeline = "TimeLine",
  timepicker = "TimePicker",
  toolbar = "ToolBar",
  tooltip = "Tooltip",
  treeview = "TreeView",
  virtualscroller = "VirtualScroller",
  windows = "Windows",
}

export type ElementLabel =
  | typeof MUIclasses
  | typeof HTML5classes
  | typeof NgMatClasses
  | typeof VuetifyClasses
  | typeof defaultClass;

export type ElementClass = MUIclasses | HTML5classes | NgMatClasses | typeof defaultClass;

export enum ElementLibrary {
  MUI = "MUI",
  HTML5 = "HTML5",
  NgMat = "NgMat",
  Vuetify = "Vuetify",
}

export const defaultLibrary = ElementLibrary.MUI;

export const libraryNames: Record<ElementLibrary, string> = {
  [ElementLibrary.MUI]: "Material UI",
  [ElementLibrary.HTML5]: "HTML 5",
  [ElementLibrary.NgMat]: "Angular Material",
  [ElementLibrary.Vuetify]: "Vuetify",
};

export const libraryClasses: Record<ElementLibrary, ElementLabel> = {
  [ElementLibrary.MUI]: MUIclasses,
  [ElementLibrary.HTML5]: HTML5classes,
  [ElementLibrary.NgMat]: NgMatClasses,
  [ElementLibrary.Vuetify]: VuetifyClasses,
};

export const predictEndpoints: Record<ElementLibrary, HttpEndpoint> = {
  [ElementLibrary.MUI]: HttpEndpoint.MUI_PREDICT,
  [ElementLibrary.HTML5]: HttpEndpoint.HTML5_PREDICT,
  [ElementLibrary.NgMat]: HttpEndpoint.NGMAT_PREDICT,
  [ElementLibrary.Vuetify]: HttpEndpoint.NGMAT_PREDICT,
};
