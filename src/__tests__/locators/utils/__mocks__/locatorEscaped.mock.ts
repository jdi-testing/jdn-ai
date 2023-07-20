export const locatorMocks = [
  {
    input:
      '"//*[@data-nav-tracking-menu-navigate-down=\'[{"method":"submitEvent","dataContainer":{"nav_MenuAction":"down","nav_MenuRank":2,"nav_MenuLevel":1,"nav_MenuTitle":"Damen-Mode","nav_MenuType":"curated","nav_GlobalNavigation":"damen-mode"}}]\']"',
    output:
      '"//*[@data-nav-tracking-menu-navigate-down=\\\'[{\\\\"method\\\\":\\\\"submitEvent\\\\",\\\\"dataContainer\\\\":{\\\\"nav_MenuAction\\\\":\\\\"down\\\\",\\\\"nav_MenuRank\\\\":2,\\\\"nav_MenuLevel\\\\":1,\\\\"nav_MenuTitle\\\\":\\\\"Damen-Mode\\\\",\\\\"nav_MenuType\\\\":\\\\"curated\\\\",\\\\"nav_GlobalNavigation\\\\":\\\\"damen-mode\\\\"}}]\\\']"',
  },
  {
    input:
      '"[data-nav-tracking-menu-navigate-down=\'[{"method":"submitEvent","dataContainer":{"nav_MenuAction":"down","nav_MenuRank":2,"nav_MenuLevel":1,"nav_MenuTitle":"Damen-Mode","nav_MenuType":"curated","nav_GlobalNavigation":"damen-mode"}}]\']"',
    output:
      '"[data-nav-tracking-menu-navigate-down=\\\'[{\\\\"method\\\\":\\\\"submitEvent\\\\",\\\\"dataContainer\\\\":{\\\\"nav_MenuAction\\\\":\\\\"down\\\\",\\\\"nav_MenuRank\\\\":2,\\\\"nav_MenuLevel\\\\":1,\\\\"nav_MenuTitle\\\\":\\\\"Damen-Mode\\\\",\\\\"nav_MenuType\\\\":\\\\"curated\\\\",\\\\"nav_GlobalNavigation\\\\":\\\\"damen-mode\\\\"}}]\\\']"',
  },
  {
    input:
      '@FindBy(xpath = "//*[@data-nav-tracking-menu-navigate-down=\'[{"method":"submitEvent","dataContainer":{"nav_MenuAction":"down","nav_MenuRank":2,"nav_MenuLevel":1,"nav_MenuTitle":"Damen-Mode","nav_MenuType":"curated","nav_GlobalNavigation":"damen-mode"}}]\']")',
    output:
      '@FindBy(xpath = "//*[@data-nav-tracking-menu-navigate-down=\\\'[{\\\\"method\\\\":\\\\"submitEvent\\\\",\\\\"dataContainer\\\\":{\\\\"nav_MenuAction\\\\":\\\\"down\\\\",\\\\"nav_MenuRank\\\\":2,\\\\"nav_MenuLevel\\\\":1,\\\\"nav_MenuTitle\\\\":\\\\"Damen-Mode\\\\",\\\\"nav_MenuType\\\\":\\\\"curated\\\\",\\\\"nav_GlobalNavigation\\\\":\\\\"damen-mode\\\\"}}]\\\']")',
  },
  {
    input:
      '@FindBy(css = "[data-nav-tracking-menu-navigate-down=\'[{"method":"submitEvent","dataContainer":{"nav_MenuAction":"down","nav_MenuRank":2,"nav_MenuLevel":1,"nav_MenuTitle":"Damen-Mode","nav_MenuType":"curated","nav_GlobalNavigation":"damen-mode"}}]\']")',
    output:
      '@FindBy(css = "[data-nav-tracking-menu-navigate-down=\\\'[{\\\\"method\\\\":\\\\"submitEvent\\\\",\\\\"dataContainer\\\\":{\\\\"nav_MenuAction\\\\":\\\\"down\\\\",\\\\"nav_MenuRank\\\\":2,\\\\"nav_MenuLevel\\\\":1,\\\\"nav_MenuTitle\\\\":\\\\"Damen-Mode\\\\",\\\\"nav_MenuType\\\\":\\\\"curated\\\\",\\\\"nav_GlobalNavigation\\\\":\\\\"damen-mode\\\\"}}]\\\']")',
  },
  {
    input:
      '@UI("//*[@data-nav-tracking-menu-navigate-down=\'[{"method":"submitEvent","dataContainer":{"nav_MenuAction":"down","nav_MenuRank":2,"nav_MenuLevel":1,"nav_MenuTitle":"Damen-Mode","nav_MenuType":"curated","nav_GlobalNavigation":"damen-mode"}}]\']")',
    output:
      '@UI("//*[@data-nav-tracking-menu-navigate-down=\\\'[{\\\\"method\\\\":\\\\"submitEvent\\\\",\\\\"dataContainer\\\\":{\\\\"nav_MenuAction\\\\":\\\\"down\\\\",\\\\"nav_MenuRank\\\\":2,\\\\"nav_MenuLevel\\\\":1,\\\\"nav_MenuTitle\\\\":\\\\"Damen-Mode\\\\",\\\\"nav_MenuType\\\\":\\\\"curated\\\\",\\\\"nav_GlobalNavigation\\\\":\\\\"damen-mode\\\\"}}]\\\']")',
  },
  {
    input:
      '@UI("[data-nav-tracking-menu-navigate-down=\'[{"method":"submitEvent","dataContainer":{"nav_MenuAction":"down","nav_MenuRank":2,"nav_MenuLevel":1,"nav_MenuTitle":"Damen-Mode","nav_MenuType":"curated","nav_GlobalNavigation":"damen-mode"}}]\']")',
    output:
      '@UI("[data-nav-tracking-menu-navigate-down=\\\'[{\\\\"method\\\\":\\\\"submitEvent\\\\",\\\\"dataContainer\\\\":{\\\\"nav_MenuAction\\\\":\\\\"down\\\\",\\\\"nav_MenuRank\\\\":2,\\\\"nav_MenuLevel\\\\":1,\\\\"nav_MenuTitle\\\\":\\\\"Damen-Mode\\\\",\\\\"nav_MenuType\\\\":\\\\"curated\\\\",\\\\"nav_GlobalNavigation\\\\":\\\\"damen-mode\\\\"}}]\\\']")',
  },

  {
    input: "\"//*[contains(text(), 'Jetzt: GenialCard + 25€-Gutschein!')]\"",
    output: "\"//*[contains(text(), \\'Jetzt: GenialCard + 25€-Gutschein!\\')]\"",
  },
  {
    input: '"#\\35 8776894140b02029425a3e2 [style="display\\:\\ inline\\;"]"',
    output: '"#\\\\\\\\35 8776894140b02029425a3e2 [style=\\\\"display\\\\\\\\:\\\\\\\\ inline\\\\\\\\;\\\\"]"',
  },
  {
    input: '"[jsname="NNJLud"]:nth-child(3) [role="menuitem"]"',
    output: '"[jsname=\\\\"NNJLud\\\\"]:nth-child(3) [role=\\\\"menuitem\\\\"]"',
  },
  {
    input: "\"//*[@data-ved='0ahUKEwjs1sqi4JqAAxUUSkEAHfQZDjgQ4dUDCAk']\"",
    output: "\"//*[@data-ved=\\'0ahUKEwjs1sqi4JqAAxUUSkEAHfQZDjgQ4dUDCAk\\']\"",
  },
  {
    input: '".tm-navigation-filters__option:nth-child(6) > [tabindex="-\\31 "]"',
    output: '".tm-navigation-filters__option:nth-child(6) > [tabindex=\\\\"-\\\\\\\\31 \\\\"]"',
  },
  {
    input:
      '@UI("#\\37 49046 .tm-article-snippet__hubs-item:nth-child(2) > .tm-article-snippet__hubs-item-link")\npublic Label cLabel1;',
    output:
      '@UI("#\\\\\\\\37 49046 .tm-article-snippet__hubs-item:nth-child(2) > .tm-article-snippet__hubs-item-link")\\npublic Label cLabel1;',
  },
];
