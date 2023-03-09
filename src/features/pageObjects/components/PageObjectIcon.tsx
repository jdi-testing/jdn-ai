import React from "react";
import Icon from "@ant-design/icons";
import {  PageObjectId } from "../types/pageObjectSlice.types";
import PageSvg from "../assets/page.svg";
import PageBaseSvg from "../assets/page-base.svg";
import PageExtendedSvg from "../assets/page-extended.svg";
import { isNil } from "lodash";

interface Props {
    isBaseClass?: boolean;
    extended?: PageObjectId;
}

export const PageObjectIcon: React.FC<Props> = ({isBaseClass, extended}) => {
    const getIcon = () => {
        if (isBaseClass) return PageBaseSvg;
        else if (!isNil(extended)) return PageExtendedSvg;
        else PageSvg;
    }

    return <Icon component={getIcon()} className="jdn__locatorsList-status" />
}