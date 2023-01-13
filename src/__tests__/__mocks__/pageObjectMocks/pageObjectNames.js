export const pageObjectsNames = [
  {
    input: "1 12 % 34abc",
    output: "Abc",
  },
  {
    input: "1 12! 34поиск",
    output: "PoiskPage",
  },
  {
    input: "1 12 !? 34Поиск*",
    output: "PoiskPage",
  },
  {
    input: "1 34поиск6",
    output: "Poisk6Page",
  },
  {
    input: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
    output: "LoremIpsumHasBeenTheIndustrysStandardDummyTextEverSincePage",
  },
  {
    input: "Lorem Ipsum has been page",
    output: "LoremIpsumHasBeenPage",
  },
  {
    input: "/dfgf - Поиск в Google",
    output: "DfgfPoiskVGooglePage",
  },
  {
    input: "**42**anyQuestion",
    output: "AnyQuestionPage",
  },
];
