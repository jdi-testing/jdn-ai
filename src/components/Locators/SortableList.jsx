import React, { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";

export const SortableList = ({ items, selectedItems, renderList }) => {
  const _items = items.map((item) => ({
    ...item,
  }));
  const [list, setList] = useState(_items);

  useEffect(() => {
    setList(_items);
  }, [items]);

  const setListHandler = (values) => {
    console.log(values);
  };

  return (
    <ReactSortable {...{ list, setList }} onEnd={setListHandler} handle=".jdn__buttons--drag-handle">
      {renderList(list, selectedItems)}
    </ReactSortable>
  );
};
