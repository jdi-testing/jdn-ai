import React from 'react';

import { LocatorValue } from '../types/locator.types';
import {
  ElementAttributes,
  ExtendedElementAttributes,
  locatorAttributesInitialState,
  LocatorType,
} from '../../../common/types/common';
import { mergeObjects } from './mergeObjects';
import { Tooltip } from 'antd';
import { evaluateLocator } from './utils';

interface IOptionsWithLabel {
  label: React.JSX.Element;
  value: string;
  desc: string;
  disabled?: boolean;
}

export interface ILocatorTypeOptions {
  value?: string;
  label: string;
  options?: IOptionsWithLabel[];
}

const generateOptionsWithLabel = (attributes: ElementAttributes): IOptionsWithLabel[] => {
  const generateLabel = (locatorType: string, attribute: string | null) => {
    if (attribute === null || attribute === '') {
      return (
        <Tooltip title="Disabled because no data">
          <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{locatorType}</span>
        </Tooltip>
      );
    }

    return <>{locatorType}</>;
  };

  return Object.keys(attributes).map((key) => {
    let locatorType = key;
    if (locatorType === 'cssSelector') locatorType = 'CSS Selector';
    const option: IOptionsWithLabel = {
      label: generateLabel(locatorType, attributes[key as keyof ElementAttributes] as string),
      value: locatorType,
      desc: attributes[key as keyof ElementAttributes] as string,
    };

    if (attributes[key as keyof ElementAttributes] === null) {
      option.disabled = true;
    }

    return option;
  });
};

const addRestAttributes = (
  attributes: ElementAttributes[],
  cssSelector: string | null,
  xPath: string | null,
  allLocatorAttributes: ElementAttributes | undefined = locatorAttributesInitialState,
): [ExtendedElementAttributes, ElementAttributes] => {
  const uniqueAttributes = attributes[0];
  const nonUniqueAttributes = attributes[1];
  const updatedUniqueAttributes: ExtendedElementAttributes = { ...uniqueAttributes, xPath, cssSelector };
  const updatedNonUniqueAttributes: ElementAttributes = nonUniqueAttributes;

  // Add noData fields:
  Object.entries(allLocatorAttributes).forEach(([key, value]) => {
    if (!updatedUniqueAttributes.hasOwnProperty(key) && !updatedNonUniqueAttributes.hasOwnProperty(key)) {
      updatedNonUniqueAttributes[key as keyof ElementAttributes] = value;
    }
  });

  return [updatedUniqueAttributes, updatedNonUniqueAttributes];
};

const getLocatorTypeOptions = (
  attributes: ElementAttributes[],
  cssSelector: string | null,
  xPath: string | null,
): ILocatorTypeOptions[] => {
  const [updatedUniqueAttributes, updatedNonUniqueAttributes] = addRestAttributes(attributes, cssSelector, xPath);

  const uniqueOptions = generateOptionsWithLabel(updatedUniqueAttributes)
    .slice()
    .sort((a, b) => a.value.localeCompare(b.value));
  const nonUniqueOptions = generateOptionsWithLabel(updatedNonUniqueAttributes)
    .slice()
    .sort((a, b) => a.value.localeCompare(b.value));

  return [
    {
      label: 'unique',
      options: uniqueOptions,
    },
    {
      label: 'non-unique',
      options: nonUniqueOptions,
    },
  ];
};

const splitUniqueAndNonUniqueAttributes = async (attributes: ElementAttributes): Promise<ElementAttributes[]> => {
  const uniqueAttributes: ElementAttributes = {};
  const nonUniqueAttributes: ElementAttributes = {};

  for (const [key, value] of Object.entries(attributes)) {
    const keyType = key as keyof ElementAttributes;
    const isValueEmpty = value === '' || value === null || value === undefined;

    if (keyType === 'dataAttributes' && value) {
      const dataAttributes: { [key: string]: string | null } = value;
      const uniqueDataAttributes: { [key: string]: string | null } = {};
      const nonUniqueDataAttributes: { [key: string]: string | null } = {};

      for (const [dataKey, dataValue] of Object.entries(dataAttributes)) {
        if (dataValue === '' || dataValue === null || dataValue === undefined) {
          nonUniqueDataAttributes[dataKey] = dataValue;
        } else {
          const res = JSON.parse(await evaluateLocator(dataValue, dataKey as LocatorType));
          const isDataAttributeUnique = res.length === 1;

          if (isDataAttributeUnique) {
            uniqueDataAttributes[dataKey] = dataValue;
          } else {
            nonUniqueDataAttributes[dataKey] = dataValue;
          }
        }
      }

      if (Object.keys(uniqueDataAttributes).length > 0) {
        mergeObjects(uniqueAttributes, uniqueDataAttributes);
      }
      if (Object.keys(nonUniqueDataAttributes).length > 0) {
        mergeObjects(nonUniqueAttributes, nonUniqueDataAttributes);
      }
    } else if (!isValueEmpty) {
      const res = JSON.parse(await evaluateLocator(value, key as LocatorType));
      const isAttributeUnique = res.length === 1;

      if (isAttributeUnique) {
        uniqueAttributes[keyType] = value;
      } else {
        nonUniqueAttributes[keyType] = value;
      }
    } else {
      nonUniqueAttributes[keyType] = value;
    }
  }

  return [uniqueAttributes, nonUniqueAttributes];
};

export const createLocatorTypeOptions = async (locatorValue: LocatorValue, isVividusFramework: boolean) => {
  const attributes: ElementAttributes = {};
  Object.assign(attributes, locatorValue.attributes);
  if (isVividusFramework) {
    delete attributes.dataAttributes;
  }

  const optionsData = await splitUniqueAndNonUniqueAttributes(attributes);
  return getLocatorTypeOptions(optionsData, locatorValue.cssSelector, locatorValue.xPath);
};
