import { find } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { ReactSortable } from "react-sortablejs";

export const SortableList = ({ items, selectedItems, renderList, onChange }) => {
  const _items = items.map((item) => ({
    ...item,
  }));
  const [list, setList] = useState(_items);

  useEffect(() => {
    setList(_items);
  }, [items]);

  const content = useMemo(() => renderList(items, selectedItems), [items]);

  const changeHandler = (event) => {
    const { item, newIndex, oldIndex } = event;
    const beforeItem = list[newIndex - 1]; // newIndex === 0 handling is needed
    const nextItem = list[newIndex + 1];
    onChange(find(list, ["element_id", item.dataset.id]), newIndex, oldIndex, beforeItem, nextItem);
  };

  return (
    <ReactSortable {...{ list, setList }} onEnd={changeHandler} handle=".jdn__buttons--drag-handle">
      {content}
    </ReactSortable>
  );
};
