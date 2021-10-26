/* eslint-disable indent */
import { filter, findIndex, isEmpty, mapValues, sortBy } from "lodash";
import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useContext } from "react";
import {
  getElements,
  highlightElements,
  runDocumentListeners,
  generatePageObject,
  requestGenerationData,
  stopGenerationHandler,
  runGenerationHandler,
  openSettingsMenu,
} from "./../utils/pageDataHandlers";
import { JDIclasses, getJdiClassName } from "./../utils/generationClassesMap";
import { connector, sendMessage } from "../utils/connector";

export const autoFindStatus = {
  noStatus: "",
  loading: "Loading...",
  success: "Successful!",
  removed: "Removed",
  error: "An error occured",
  blocked: "Script is blocked. Close all popups",
};

export const xpathGenerationStatus = {
  noStatus: "",
  started: "XPath generation is running in background...",
  complete: "XPathes generation is successfully completed",
};

const AutoFindContext = React.createContext();

const AutoFindProvider = inject("mainModel")(
  observer(({ mainModel, children }) => {
    const [predictedElements, setPredictedElements] = useState(null);
    const [status, setStatus] = useState(autoFindStatus.noStatus);
    const [allowIdentifyElements, setAllowIdentifyElements] = useState(true);
    const [allowRemoveElements, setAllowRemoveElements] = useState(false);
    const [perception, setPerception] = useState(0.5);
    const [unreachableNodes, setUnreachableNodes] = useState([]);
    const [locators, setLocators] = useState([]);
    const [xpathStatus, setXpathStatus] = useState(xpathGenerationStatus.noStatus);
    const [unactualPrediction, setUnactualPrediction] = useState(false);
    const [xpathConfig, setXpathConfig] = useState({
      maximum_generation_time: 10,
      allow_indexes_at_the_beginning: false,
      allow_indexes_in_the_middle: false,
      allow_indexes_at_the_end: true,
      limit_maximum_generation_time: true,
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    connector.onerror = () => {
      setStatus(autoFindStatus.error);
    };

    const clearElementsState = () => {
      setPredictedElements(null);
      setStatus(autoFindStatus.noStatus);
      setAllowIdentifyElements(true);
      setAllowRemoveElements(false);
      setUnreachableNodes([]);
      setLocators([]);
      setXpathStatus(xpathGenerationStatus.noStatus);
      setUnactualPrediction(false);
    };

    const toggleElementGeneration = (id) => {
      setLocators((previousValue) => {
        const toggled = previousValue.map((el) => {
          if (el.element_id === id) {
            el.generate = !el.generate;
            sendMessage.toggle(el);
          }
          return el;
        });
        return toggled;
      });
    };

    const toggleDeleted = (id) => {
      setLocators((previousValue) => {
        const deleted = previousValue.map((el) => {
          if (el.element_id === id) {
            el.deleted = !el.deleted;
            sendMessage.toggleDeleted(el);
          }
          return el;
        });
        return deleted;
      });
    };

    const changeType = ({ id, newType }) => {
      setLocators((previousValue) => {
        const changed = previousValue.map((el) => {
          if (el.element_id === id) {
            el.predicted_label = newType;
            el.jdi_class_name = getJdiClassName(newType);
            sendMessage.changeType(el);
          }
          return el;
        });
        return changed;
      });
    };

    const changeElementName = ({ id, name }) => {
      setLocators((previousValue) => {
        const renamed = previousValue.map((el) => {
          if (el.element_id === id) {
            el.jdi_custom_class_name = name;
            sendMessage.changeElementName(el);
          }
          return el;
        });
        return renamed;
      });
    };

    const updateLocator = (element) => {
      setLocators((prevState) => {
        const index = findIndex(prevState, { element_id: element.element_id });
        if (index === -1) {
          return [...prevState, element];
        } else {
          const newState = [...prevState];
          newState[index].locator = element.locator;
          return newState;
        }
      });
    };

    const changeElementSettings = (settings, ids) => {
      if (!ids) {
        setXpathConfig(param.settings);
        return;
      };
      setLocators((previousValue) => {
        const newValue = previousValue.map((el) => {
          if (ids.includes(el.element_id)) {
            if (isEmpty(el.locator.settings)) el.locator.settings = {};
            el.locator.settings = mapValues(settings, (value, key) => {
              return value === "indeterminate" ? el.locator.settings[key] || xpathConfig[key] : value;
            });
            sendMessage.changeXpathSettings(el);
            runXpathGeneration([el]);
          }
          return el;
        });
        return newValue;
      });
    };

    const updateElements = ([predicted]) => {
      const rounded = predicted.map((el) => ({
        ...el,
        jdi_class_name: getJdiClassName(el.predicted_label),
        predicted_probability: Math.round(el.predicted_probability * 100) / 100,
      }));
      setPredictedElements(rounded);
      setAllowRemoveElements(!allowRemoveElements);
    };

    const identifyElements = () => {
      setAllowIdentifyElements(!allowIdentifyElements);
      setStatus(autoFindStatus.loading);
      getElements(updateElements, setStatus);
    };

    const removeHighlighs = () => {
      const callback = () => {
        clearElementsState();
        setStatus(autoFindStatus.removed);
      };

      sendMessage.killHighlight(null, callback);
    };

    const generateAndDownload = () => {
      generatePageObject(
        filter(locators, (loc) => loc.generate && !loc.deleted),
        mainModel
      );
    };

    const onChangePerception = (value) => {
      setPerception(value);
    };

    const runXpathGeneration = (elements) => {
      runGenerationHandler(elements, xpathConfig, updateLocator);
    };

    const stopXpathGeneration = ({ element_id, locator }) => {
      setLocators((prevState) => {
        const stopped = prevState.map((el) => {
          if (el.element_id === element_id) {
            el.locator.stopped = true;
            stopGenerationHandler(el);
          }
          return el;
        });
        return stopped;
      });
    };

    const getPredictedElement = (id) => {
      setLocators((prevLocators) => {
        // walkaround to get access to locators state
        const element = prevLocators.find((e) => e.element_id === id);
        sendMessage.elementData({
          element,
          types: sortBy(
            Object.keys(JDIclasses).map((label) => {
              return { label, jdi: getJdiClassName(label) };
            }),
            ["jdi"]
          ),
        });
        return prevLocators;
      });
    };

    const filterByProbability = (elements) => {
      return elements.filter((e) => e.predicted_probability >= perception);
    };

    useEffect(() => {
      chrome.runtime.onMessage.addListener(({ message, param }) => {
        if (message === "CHANGE_XPATH_CONFIG") {
          changeElementSettings(param.settings, param.elementIds);
        }
        if (message === "IS_OPEN_XPATH_CONFIG_MODAL") {
          setIsModalOpen(param);
        }
      });
    }, []);

    useEffect(() => {
      if (predictedElements) {
        const onHighlighted = () => {
          setStatus(autoFindStatus.success);
          const availableForGeneration = filterByProbability(predictedElements);
          if (availableForGeneration.length) {
            const noLocator = availableForGeneration.filter(
              (element) => locators.findIndex((loc) => loc.element_id === element.element_id) === -1
            );
            if (noLocator.length) {
              requestGenerationData(noLocator, xpathConfig, ({ generationData }) => {
                setXpathStatus(xpathGenerationStatus.started);
                runXpathGeneration(generationData);
              });
            }
          }
        };

        highlightElements(predictedElements, onHighlighted, perception);
      }
    }, [predictedElements, perception]);

    useEffect(() => {
      if (status === autoFindStatus.success) {
        runDocumentListeners(actions);
      }
    }, [status]);

    // useEffect(() => {
    //   if (locators.length) {
    //     setXpathStatus(xpathGenerationStatus.complete);
    //   }
    // }, [locators]);

    // useEffect(() => {
    //   if (!unreachableNodes.length) return;
    //   sendMessage.highlightUnreached(unreachableNodes);
    // }, [unreachableNodes]);

    // messages, are sent from content scripts to plugin
    const actions = {
      GET_ELEMENT: getPredictedElement,
      TOGGLE_ELEMENT: toggleElementGeneration,
      HIGHLIGHT_OFF: clearElementsState,
      REMOVE_ELEMENT: toggleDeleted,
      CHANGE_TYPE: changeType,
      CHANGE_ELEMENT_NAME: changeElementName,
      PREDICTION_IS_UNACTUAL: () => setUnactualPrediction(true),
      CHANGE_XPATH_SETTINGS: changeElementSettings,
      OPEN_XPATH_CONFIG: (ids) => openSettingsMenu(xpathConfig, ids),
    };

    const data = [
      {
        predictedElements,
        status,
        allowIdentifyElements,
        allowRemoveElements,
        perception,
        unreachableNodes,
        locators,
        xpathStatus,
        unactualPrediction,
        xpathConfig,
        isModalOpen,
      },
      {
        identifyElements,
        removeHighlighs,
        generateAndDownload,
        onChangePerception,
        setXpathConfig,
        filterByProbability,
        toggleElementGeneration,
        toggleDeleted,
        runXpathGeneration,
        stopXpathGeneration,
        changeElementSettings,
      },
    ];

    return <AutoFindContext.Provider value={data}>{children}</AutoFindContext.Provider>;
  })
);

const useAutoFind = () => {
  const context = useContext(AutoFindContext);
  if (context === void 0) {
    throw new Error("useAutoFind can only be used inside AutoFindProvider");
  }
  return context;
};

export { AutoFindProvider, useAutoFind };
