export const pageobjectUndo = { type: "PAGEOBJECT_UNDO" };

export const locatorUndo = (payload?: any) => ({ type: "LOCATOR_UNDO", payload });

export const locatorJump = (payload: number) => ({ type: "LOCATOR_JUMP", payload });
