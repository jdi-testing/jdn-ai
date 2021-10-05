import React from "react";
import { Locator } from "./Locator";

export const DeletedList = ({ elements, toggleElementGeneration }) => {
  const renderList = () => {
    if (!elements) return null;
    return elements.map((element) => {
      return <Locator key={element.element_id} onChange={toggleElementGeneration} {...{ element }} />;
    });
  };

  return <React.Fragment>{renderList()}</React.Fragment>;
};
