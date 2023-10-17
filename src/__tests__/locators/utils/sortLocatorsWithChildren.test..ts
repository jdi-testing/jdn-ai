import { ILocator } from '../../../features/locators/types/locator.types';
import { sortLocatorsWithChildren } from '../../../features/locators/utils/sortLocators';

describe('sortLocatorsWithChildren', () => {
  const input = [
    {
      element_id: '1',
      is_shown: true,
      children: ['2', '5'],
    },
    {
      element_id: '4',
      is_shown: true,
      children: [],
    },
    {
      element_id: '2',
      is_shown: true,
      children: ['3'],
      parent_id: '1',
    },
    {
      element_id: '3',
      is_shown: true,
      children: [],
      parent_id: '2',
    },
    {
      element_id: '5',
      is_shown: true,
      children: ['8'],
      parent_id: '1',
    },
    {
      element_id: '6',
      is_shown: true,
      children: [],
      parent_id: '7',
    },
  ];
  const expectedOutput = [
    {
      element_id: '1',
      is_shown: true,
      children: ['2', '5'],
    },
    {
      element_id: '2',
      is_shown: true,
      children: ['3'],
      parent_id: '1',
    },
    {
      element_id: '3',
      is_shown: true,
      children: [],
      parent_id: '2',
    },
    {
      element_id: '5',
      is_shown: true,
      children: ['8'],
      parent_id: '1',
    },
    {
      element_id: '4',
      is_shown: true,
      children: [],
    },
    {
      element_id: '6',
      is_shown: true,
      children: [],
      parent_id: '7',
    },
  ];

  test('should sort locators with childs', () => {
    const output = sortLocatorsWithChildren(input as ILocator[]);
    expect(output).toEqual(expectedOutput);
  });
});
