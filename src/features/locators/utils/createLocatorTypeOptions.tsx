import React from 'react';

import { ILocator, LocatorValue } from '../types/locator.types';
import {
  ElementAttributes,
  ExtendedElementAttributes,
  locatorAttributesInitialState,
} from '../../../common/types/common';
import { mergeObjects } from './mergeObjects';
import { Tooltip } from 'antd';

interface IOptionsWithLabel {
  label: React.JSX.Element;
  value: string;
  disabled?: boolean;
}

interface ILocatorTypeOptions {
  label: string;
  options: IOptionsWithLabel[];
}

const generateOptionsWithLabel = (attributes: ElementAttributes): IOptionsWithLabel[] => {
  const generateLabel = (locatorType: string, attribute: string | null) => {
    if (attribute === null || attribute === '') {
      return <Tooltip title="Disabled because no data">{locatorType}</Tooltip>;
    }

    return (
      <>
        {locatorType} <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{`"${attribute}"`}</span>
      </>
    );
  };

  return Object.keys(attributes).map((key) => {
    let locatorType = key;
    if (locatorType === 'cssSelector') locatorType = 'CSS Selector';
    const option: IOptionsWithLabel = {
      label: generateLabel(locatorType, attributes[key as keyof ElementAttributes] as string),
      value: locatorType,
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

const createHashMap = (locators: LocatorValue[]): Map<string, Set<string | null>> => {
  const hashMap = new Map<string, Set<string | null>>();

  const updateHashMap = (key: string, value: string | null) => {
    if (!hashMap.has(key)) {
      hashMap.set(key, new Set<string | null>());
    }

    const valueSet = hashMap.get(key);
    if (value !== null && value !== undefined) {
      valueSet?.add(value);
    }
  };

  locators.forEach((locator) => {
    const attributes = locator.attributes;

    if (attributes) {
      Object.keys(attributes).forEach((key) => {
        if (key === 'dataAttributes' && attributes.dataAttributes) {
          const dataAttributes = attributes.dataAttributes;
          Object.keys(dataAttributes).forEach((dataKey) => {
            const value = dataAttributes[dataKey];
            updateHashMap(dataKey, value);
          });
        } else {
          const value = attributes[key as keyof Omit<ElementAttributes, 'dataAttributes'>];
          if (value) updateHashMap(key, value);
          else {
            throw new Error(`The key value of the ${key} value is undefined!`);
          }
        }
      });
    }
  });

  return hashMap;
};

const splitUniqueAndNonUniqueAttributes = (
  attributes: ElementAttributes,
  attributesHashMap: Map<string, Set<string | null>>,
): ElementAttributes[] => {
  const uniqueAttributes: ElementAttributes = {};
  const nonUniqueAttributes: ElementAttributes = {};

  Object.entries(attributes).forEach(([key, value]) => {
    const keyType = key as keyof ElementAttributes;
    const isValueEmpty = value === '' || value === null || value === undefined;

    if (keyType === 'dataAttributes' && value) {
      // Check and unpacked data-attributes:
      const dataAttributes: { [key: string]: string | null } = value;
      const uniqueDataAttributes: { [key: string]: string | null } = {};
      const nonUniqueDataAttributes: { [key: string]: string | null } = {};

      Object.entries(dataAttributes).forEach(([dataKey, dataValue]) => {
        const isDataValueEmpty = dataValue === '' || dataValue === null || dataValue === undefined;
        const isNonUnique =
          isDataValueEmpty || !attributesHashMap.has(dataKey) || !attributesHashMap.get(dataKey)?.has(dataValue);
        if (isNonUnique) {
          nonUniqueDataAttributes[dataKey] = dataValue;
        } else {
          uniqueDataAttributes[dataKey] = dataValue;
        }
      });

      if (Object.keys(uniqueDataAttributes).length > 0) {
        mergeObjects(uniqueAttributes, uniqueDataAttributes);
      }

      if (Object.keys(nonUniqueDataAttributes).length > 0) {
        mergeObjects(nonUniqueAttributes, nonUniqueDataAttributes);
      }
    } else {
      const isNonUnique = isValueEmpty || !attributesHashMap.has(key) || !attributesHashMap.get(key)?.has(value);
      if (isNonUnique) {
        nonUniqueAttributes[keyType] = value;
      } else {
        uniqueAttributes[keyType] = value;
      }
    }
  });

  return [uniqueAttributes, nonUniqueAttributes];
};

export const createLocatorTypeOptions = (
  locatorValue: LocatorValue,
  locators: ILocator[],
  currentElementId: string,
) => {
  const preparedData: LocatorValue[] = locators
    .filter((element) => element.element_id !== currentElementId)
    .map((element) => element.locatorValue);

  const hashMap: Map<string, Set<string | null>> = createHashMap(preparedData);
  const optionsData = splitUniqueAndNonUniqueAttributes(locatorValue.attributes, hashMap);

  return getLocatorTypeOptions(optionsData, locatorValue.cssSelector, locatorValue.xPath);
};
