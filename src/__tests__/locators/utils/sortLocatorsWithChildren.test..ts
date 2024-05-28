import { ILocator } from '../../../features/locators/types/locator.types';
import { sortLocatorsWithChildren } from '../../../features/locators/utils/sortLocators';

describe('sortLocatorsWithChildren', () => {
  const input = [
    {
      elementId: '1',
      is_shown: true,
      children: ['2', '5'],
    },
    {
      elementId: '4',
      is_shown: true,
      children: [],
    },
    {
      elementId: '2',
      is_shown: true,
      children: ['3'],
      parent_id: '1',
    },
    {
      elementId: '3',
      is_shown: true,
      children: [],
      parent_id: '2',
    },
    {
      elementId: '5',
      is_shown: true,
      children: ['8'],
      parent_id: '1',
    },
    {
      elementId: '6',
      is_shown: true,
      children: [],
      parent_id: '7',
    },
  ];
  const expectedOutput = [
    {
      elementId: '1',
      is_shown: true,
      children: ['2', '5'],
    },
    {
      elementId: '2',
      is_shown: true,
      children: ['3'],
      parent_id: '1',
    },
    {
      elementId: '3',
      is_shown: true,
      children: [],
      parent_id: '2',
    },
    {
      elementId: '5',
      is_shown: true,
      children: ['8'],
      parent_id: '1',
    },
    {
      elementId: '4',
      is_shown: true,
      children: [],
    },
    {
      elementId: '6',
      is_shown: true,
      children: [],
      parent_id: '7',
    },
  ];

  test('should sort locators with children', () => {
    const output = sortLocatorsWithChildren(input as ILocator[]);
    expect(output).toEqual(expectedOutput);
  });
});
