const genRand = (name) => {
  return (
    name +
    (Math.floor(Math.random() * (1000 - 1)) + 1) +
    (Math.floor(Math.random() * (1000 - 1)) + 1)
  );
};

const cssToXPath = (css) => {
  function convertToClass(value) {
    return `contains(@class,'${value}')`;
  }
  function convertToAtribute(attr, value) {
    return `@${attr}='${value}'`;
  }
  function convertToId(value) {
    return convertToAtribute("id", value);
  }

  if (css === "") {
    return "";
  }
  let i = 0;
  let start;
  let result = "//";
  let length = css.length;
  while (i < length) {
    let symbol = css[i];
    if (symbol.match(/[a-z]/)) {
      start = i;
      while (i < length && css[i].match(/[a-z]/)) {
        i++;
      }
      if (i === length) {
        return result + css.substr(start);
      }
      result += css.substring(start, i);
      continue;
    }
    if (symbol === " ") {
      result += "//";
      i++;
      continue;
    }
    if (symbol.match(/[\.#\[]/)) {
      let attributes = [];
      while (i < length && css[i] !== " ") {
        switch (css[i]) {
          case ".":
            i++;
            start = i;
            while (i < length && css[i].match(/[a-z0-9A-Z0-9:\-_\.]/)) {
              i++;
            }
            attributes.push(
              convertToClass(
                i === length ? css.substr(start) : css.substring(start, i)
              )
            );
            break;
          case "#":
            i++;
            start = i;
            while (i < length && css[i].match(/[a-z0-9A-Z0-9:\-_\.]/)) {
              i++;
            }
            attributes.push(
              convertToId(
                i === length ? css.substr(start) : css.substring(start, i)
              )
            );
            break;
          case "[":
            i++;
            let attribute = "@";
            while (i < length && !css[i].match(/[=\]]/)) {
              attribute += css[i];
              i++;
            }
            if (css[i] === "=") {
              attribute += "=";
              i++;
              if (css[i] !== "'") {
                attribute += "'";
              }
              while (i < length && css[i] !== "]") {
                attribute += css[i];
                i++;
              }
              if (i === length) {
                return "Incorrect Css. No ']' symbol for '['";
              }
              if (attribute.slice(-1) !== "'") {
                attribute += "'";
              }
            } else if (css[i] !== "]") {
              return `Can't process Css. Unexpected symbol №${i + 1}(${
                css[i]
              }) in attributes`;
            }
            attributes.push(attribute);
            i++;
            break;
          default:
            return `Can't process Css. Unexpected symbol №${i}(${
              css[i - 1]
            }) in attributes`;
        }
      }
      if (result.slice(-1) === "/") {
        result += "*";
      }
      result += `[${attributes.join(" and ")}]`;
      continue;
    }
    return `Can't process Css. Unexpected symbol '${symbol}'`;
  }
  return result;
};

export { genRand, cssToXPath };
