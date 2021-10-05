/* eslint-disable indent */
import _, { sortBy } from "lodash";
import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useContext } from "react";
import {
  getElements,
  highlightElements,
  runDocumentListeners,
  generatePageObject,
  requestGenerationData,
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
    const [pageElements, setPageElements] = useState(null);
    const [predictedElements, setPredictedElements] = useState(null);
    const [status, setStatus] = useState(autoFindStatus.noStatus);
    const [allowIdentifyElements, setAllowIdentifyElements] = useState(true);
    const [allowRemoveElements, setAllowRemoveElements] = useState(false);
    const [perception, setPerception] = useState(0.5);
    const [unreachableNodes, setUnreachableNodes] = useState([]);
    const [availableForGeneration, setAvailableForGeneration] = useState([]);
    const [xpathStatus, setXpathStatus] = useState(xpathGenerationStatus.noStatus);
    const [unactualPrediction, setUnactualPrediction] = useState(false);
    const [xpathConfig, setXpathConfig] = useState({
      maximum_generation_time: 10,
      allow_indexes_at_the_beginning: false,
      allow_indexes_in_the_middle: false,
      allow_indexes_at_the_end: true,
    });

    connector.onerror = () => {
      setStatus(autoFindStatus.error);
    };

    const clearElementsState = () => {
      setPageElements(null);
      setPredictedElements(null);
      setStatus(autoFindStatus.noStatus);
      setAllowIdentifyElements(true);
      setAllowRemoveElements(false);
      setUnreachableNodes([]);
      setAvailableForGeneration([]);
      setXpathStatus(xpathGenerationStatus.noStatus);
      setUnactualPrediction(false);
    };

    const toggleElementGeneration = (id) => {
      setPredictedElements((previousValue) => {
        const toggled = previousValue.map((el) => {
          if (el.element_id === id) {
            el.skipGeneration = !el.skipGeneration;
            sendMessage.toggle(el);
          }
          return el;
        });
        return toggled;
      });
    };

    const hideElement = (id) => {
      setPredictedElements((previousValue) => {
        const hidden = previousValue.map((el) => {
          if (el.element_id === id) {
            el.hidden = true;
            sendMessage.hide(el);
          }
          return el;
        });
        return hidden;
      });
    };

    const changeType = ({ id, newType }) => {
      setPredictedElements((previousValue) => {
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
      setPredictedElements((previousValue) => {
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

    const updateElements = ([predicted, page]) => {
      const rounded = predicted.map((el) => ({
        ...el,
        jdi_class_name: getJdiClassName(el.predicted_label),
        predicted_probability: Math.round(el.predicted_probability * 100) / 100,
      }));
      setPredictedElements(rounded);
      setPageElements(page);
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
      generatePageObject(availableForGeneration, mainModel);
    };

    const onChangePerception = (value) => {
      setPerception(value);
    };

    const getPredictedElement = (id) => {
      const element = predictedElements.find((e) => e.element_id === id);
      sendMessage.elementData({
        element,
        types: sortBy(
          Object.keys(JDIclasses).map((label) => {
            return { label, jdi: getJdiClassName(label) };
          }),
          ["jdi"]
        ),
      });
    };

    const actions = {
      GET_ELEMENT: getPredictedElement,
      TOGGLE_ELEMENT: toggleElementGeneration,
      HIGHLIGHT_OFF: clearElementsState,
      REMOVE_ELEMENT: hideElement,
      CHANGE_TYPE: changeType,
      CHANGE_ELEMENT_NAME: changeElementName,
      PREDICTION_IS_UNACTUAL: () => setUnactualPrediction(true),
    };

    useEffect(() => {
      if (predictedElements) {
        const onHighlighted = () => {
          setStatus(autoFindStatus.success);
          setAvailableForGeneration(
            _.chain(predictedElements)
              .map((predicted) => {
                const el = _.find(availableForGeneration, { element_id: predicted.element_id });
                return { ...el, ...predicted };
              })
              .filter(
                (e) =>
                  e.predicted_probability >= perception &&
                  !e.skipGeneration &&
                  !e.hidden &&
                  !unreachableNodes.includes(e.element_id)
              )
              .value()
          );
        };

        highlightElements(predictedElements, onHighlighted, perception);
      }
    }, [predictedElements, perception]);

    useEffect(() => {
      if (status === autoFindStatus.success) {
        runDocumentListeners(actions);
      }
    }, [status]);

    useEffect(() => {
      if (!availableForGeneration) return;
      const noXpath = availableForGeneration.filter((element) => !element.xpath);
      if (!noXpath.length) return;
      setXpathStatus(xpathGenerationStatus.started);
      requestGenerationData(noXpath, xpathConfig, ({ generationData, unreachableNodes }) => {
        setAvailableForGeneration(
          _.chain(availableForGeneration)
            .map((el) => _.chain(generationData).find({ element_id: el.element_id }).merge(el).value())
            .differenceBy(unreachableNodes, "element_id")
            .value()
        );
        setUnreachableNodes(unreachableNodes);
        setXpathStatus(xpathGenerationStatus.complete);
      });
    }, [availableForGeneration]);

    useEffect(() => {
      if (!unreachableNodes.length) return;
      sendMessage.highlightUnreached(unreachableNodes);
    }, [unreachableNodes]);

    const data = [
      {
        pageElements,
        predictedElements,
        status,
        allowIdentifyElements,
        allowRemoveElements,
        perception,
        unreachableNodes,
        availableForGeneration,
        xpathStatus,
        unactualPrediction,
        xpathConfig,
      },
      {
        identifyElements,
        removeHighlighs,
        generateAndDownload,
        onChangePerception,
        setXpathConfig,
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
