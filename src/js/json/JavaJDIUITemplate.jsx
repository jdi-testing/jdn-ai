const JavaJDIUITemplate = {
  package: "",
  siteName: "",
  nameCase: "camelCase",
  typeCase: "PascalCase",
  site: `package {{package}};
	
import {{package}}.pages.*;
import com.epam.jdi.uitests.web.selenium.elements.composite.WebSite;
import com.epam.jdi.uitests.web.selenium.elements.pageobjects.annotations.*;

@JSite("{{domain}}")
public class {{siteName}} extends WebSite {
{{pages}} 	
}`,

  siteElement: `    @JPage(url = "{{url}}", title = "{{title}}") 
    public static {{type}} {{name}};`,
  page: `package {{package}}.pages;

import com.epam.jdi.uitests.web.selenium.elements.common.*;
import com.epam.jdi.uitests.web.selenium.elements.complex.*;
import com.epam.jdi.uitests.web.selenium.elements.composite.*;
import com.epam.jdi.uitests.web.selenium.elements.composite.WebPage;
import com.epam.jdi.uitests.web.selenium.elements.pageobjects.annotations.objects.*;
import com.epam.jdi.uitests.web.selenium.elements.pageobjects.annotations.simple.*;
import com.epam.jdi.uitests.web.selenium.elements.pageobjects.annotations.FindBy;
import {{package}}.sections.*;

public class {{type}} extends WebPage {
{{elements}}	
}`,
  pageElementCss: `    @Css("{{locator}}") public {{type}} {{name}};`,
  pageElementXPath: `    @XPath("{{locator}}") public {{type}} {{name}};`,
  pageElementComplex: `    @J{{type}}({{locators}})
	public {{type}} {{name}};`,
  locatorCss: `{{type}} = @FindBy(css = "{{locator}}"),`,
  locatorXPath: `{{type}} = @FindBy(xpath = "{{locator}}"),`,

  section: `package {{package}}.sections;

import com.epam.jdi.uitests.web.selenium.elements.common.*;
import com.epam.jdi.uitests.web.selenium.elements.complex.*;
import com.epam.jdi.uitests.web.selenium.elements.composite.*;
import com.epam.jdi.uitests.web.selenium.elements.composite.WebPage;
import com.epam.jdi.uitests.web.selenium.elements.pageobjects.annotations.objects.*;
import com.epam.jdi.uitests.web.selenium.elements.pageobjects.annotations.simple.*;
import com.epam.jdi.uitests.web.selenium.elements.pageobjects.annotations.FindBy;

public class {{type}} extends Section {
{{elements}}	
}`,
  form: `package {{package}}.sections;

import com.epam.jdi.uitests.web.selenium.elements.common.*;
import com.epam.jdi.uitests.web.selenium.elements.complex.*;
import com.epam.jdi.uitests.web.selenium.elements.composite.*;
import com.epam.jdi.uitests.web.selenium.elements.composite.WebPage;
import com.epam.jdi.uitests.web.selenium.elements.pageobjects.annotations.objects.*;
import com.epam.jdi.uitests.web.selenium.elements.pageobjects.annotations.simple.*;
import com.epam.jdi.uitests.web.selenium.elements.pageobjects.annotations.FindBy;
import {{package}}.entities.*;

public class {{type}} extends Form<{{data}}> {
{{elements}}	
}`,
  data: `package {{package}}.entities;

import com.epam.jdi.tools.DataClass;

public class {{type}} extends DataClass<{{type}}> {
{{elements}}
}`,
  dataElement: `    public String {{name}};`,
};

export { JavaJDIUITemplate };
