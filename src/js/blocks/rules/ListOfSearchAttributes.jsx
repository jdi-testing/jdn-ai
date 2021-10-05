import React from "react";
import injectSheet from "react-jss";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { observable, action } from "mobx";
import { headerStyle, internalDivStyle } from "../BlockStyles";
import { DeleteOutlined } from "@ant-design/icons";

import { Button, Input } from "antd";
import { add, close } from "../../../icons";

const styles = {
  headerStyle,
  smallBtn: {
    width: "24px",
    height: "24px",
    padding: 0,
  },
  containerStyle: {
    display: "flex",
    ...internalDivStyle,
  },
  textInput: {
    margin: "5px",
  },
};

@inject("mainModel")
@observer
class ListOfSearchAttributes extends React.Component {
  handleChangeAttribute = (value, index) => {
    const { ruleBlockModel } = this.props.mainModel;
    ruleBlockModel.changeListOfAttr(value, index);
  };

  handleDeleteItem = (index) => {
    const { ruleBlockModel } = this.props.mainModel;
    ruleBlockModel.deleteItemFromListOfAttr(index);
  };

  handleAddItem = () => {
    const { ruleBlockModel } = this.props.mainModel;
    ruleBlockModel.addItemToListOfAttr();
  };

  render() {
    const { classes, mainModel } = this.props;
    const list = mainModel.ruleBlockModel.rules.ListOfSearchAttributes || [];
    console.log(list);

    return (
      <div>
        <div>
          <span className={classes.headerStyle}>Unique attributes </span>
          <Button
            className={classes.smallBtn}
            icon={add}
            onclick={this.handleAddItem}
          />
        </div>
        {list.map((item, index) => (
          <div className={classes.containerStyle} key={`general${index}`}>
            <Input
              className={classes.textInput}
              type="text"
              placeholder="Attribute name"
              value={item}
              index={index}
              onChange={(value) => {
                this.handleChangeAttribute(value, index);
              }}
            />
            <Button
              type="link"
              icon={<DeleteOutlined />}
              onClick={() => {
                this.handleDeleteItem(index);
              }}
            />
          </div>
        ))}
      </div>
    );
  }
}

ListOfSearchAttributes.propTypes = {};

const ListOfSearchAttributesWrapper = injectSheet(styles)(
  ListOfSearchAttributes
);

export default ListOfSearchAttributesWrapper;
