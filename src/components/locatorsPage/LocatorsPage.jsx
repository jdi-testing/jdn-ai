import React from "react";
import { LocatorsList } from "./LocatorsList";
import { PerceptionTreshold } from "../PerceptionTreshold/PerceptionTreshold";

export const LocatorsPage = () => {
  return (
    <React.Fragment>
      <LocatorsList />
      <PerceptionTreshold />
    </React.Fragment>
  );
};
