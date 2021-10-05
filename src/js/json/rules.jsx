const rulesJson = {
  ListOfSearchAttributes: ["id"],
  SimpleRules: {
    Button: [{ Locator: "button[type=submit]", uniqueness: "text", id: 0 }],
    Checkbox: [{ Locator: "input[type=checkbox]", id: 0, uniqueness: "name" }],
    Image: [{ Locator: "img", id: 0, uniqueness: "id" }],
    Label: [
      { Locator: "h1", id: 0, uniqueness: "name" },
      { Locator: "h2", id: 1, uniqueness: "name" },
      { Locator: "h3", id: 2, uniqueness: "name" },
    ],
    Link: [{ Locator: "", uniqueness: "", id: 0 }],
    Text: [{ Locator: ".main-txt", id: 0, uniqueness: "name" }],
    TextField: [
      { Locator: "input[type=text]", id: 0, uniqueness: "id" },
      { Locator: "input[type=password]", id: 1, uniqueness: "id" },
    ],
    TextArea: [{ Locator: "textarea", id: 0, uniqueness: "id" }],
    DataPicker: [{ Locator: "", id: 0, uniqueness: "" }],
    FileInput: [{ Locator: "", id: 0, uniqueness: "" }],
    Selector: [{ Locator: "", id: 0, uniqueness: "" }],
    CheckList: [{ Locator: "", id: 0, uniqueness: "" }],
    RadioButtons: [{ Locator: "", id: 0, uniqueness: "" }],
    Tabs: [{ Locator: "", id: 0, uniqueness: "" }],
    Menu: [{ Locator: ".sidebar-menu", id: 0, uniqueness: "class" }],
    Dropdown: [{ Locator: "[ui=dropdown]", id: 0, uniqueness: "id" }],
  },
  ComplexRules: {
    Combobox: [
      {
        Root: "div[ui=combobox]",
        uniqueness: "id",
        Value: "input",
        List: "li",
        Expand: ".caret",
        id: 0,
      },
      {
        Root: "select[ui=combobox]",
        uniqueness: "id",
        Value: "",
        List: "",
        Expand: "",
        id: 1,
      },
    ],
    Table: [
      {
        Root: "table",
        Header: "",
        RowHeader: "",
        Cell: "",
        Column: "",
        Row: "",
        Footer: "",
        id: 0,
        uniqueness: "class",
      },
    ],
  },
  CompositeRules: {
    Section: [
      { Locator: ".section", id: 0, uniqueness: "class" },
      { Locator: "header", id: 1, uniqueness: "tag" },
      { Locator: "footer", id: 2, uniqueness: "tag" },
      { Locator: ".main-form", id: 3, uniqueness: "tag" },
    ],
    Form: [{ Locator: "form", id: 0, uniqueness: "id" }],
  },
};

export default rulesJson;
