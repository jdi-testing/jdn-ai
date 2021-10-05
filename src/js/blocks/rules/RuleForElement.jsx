import React from "react";
import injectSheet from "react-jss";
import { inject, observer } from "mobx-react";
import { observable, action, toJS } from "mobx";
import { headerStyle, internalDivStyle } from "../BlockStyles";
import { add, close } from "../../../icons";
import { Button, Input } from "antd";
import {
  CaretRightOutlined,
  DeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";

@inject("mainModel")
@observer
export class RuleForElement extends React.Component {
  @observable isEditable = false;
  @observable show = true;

  @action
  handleShowList = () => {
    this.show = !this.show;
    this.setState({show: this.show});
  };

  handleEditRuleName = () => {
    this.isEditable = !this.isEditable;
  };

  getCurrentRuleFields = (rules, index) => {
    if (rules && rules.length) {
      return Object.keys(rules[index]);
    }
    return [];
  };

  handleDeleteRule = (e, { ruleSet, title, index }) => {
    e.stopPropagation();
    this.props.mainModel.ruleBlockModel.handleDeleteRuleItem(e, {
      ruleSet,
      title,
      index,
    });
  };

  handleAddRule = (event, { ruleSet, title, index }) => {
    this.props.mainModel.ruleBlockModel.handleAddRuleItem(event, {
      ruleSet,
      title,
      index,
    });
  };

  handleEditRule = (value, { ruleSet, title, field, index }) => {
    this.props.mainModel.ruleBlockModel.handleEditRuleName(value.target.value, {
      ruleSet, title, field, index
    });
  };

  render() {
    const { classes, mainModel, ruleSet, title, index } = this.props;
    const rules =
      (mainModel.ruleBlockModel.rules &&
        mainModel.ruleBlockModel.rules[ruleSet] &&
        mainModel.ruleBlockModel.rules[ruleSet][title]) ||
      [];

    return (
      <div>
        <div onClick={this.handleShowList}>
          <span className={"treeCounter"}>{rules.length}</span>
          <CaretRightOutlined
            rotate={this.show ? 0 : 90}
          />
          <span className={"link"}>{title}</span>
        </div>
        <div hidden={this.show} className={"posr"}>
          <Button
            onClick={(e) => {
              this.handleAddRule(e, { ruleSet, title, index });
              this.forceUpdate();
            }}
            className={"add"}
            type="link"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
            >
              <path
                fill="#008ACE"
                d="M8 14.531c1.221 0 2.352-.305 3.39-.916 1.04-.61 1.865-1.435 2.475-2.474.61-1.04.916-2.17.916-3.391s-.305-2.352-.916-3.39c-.61-1.04-1.435-1.865-2.474-2.475C10.35 1.275 9.22.969 8 .969s-2.352.305-3.39.916c-1.04.61-1.865 1.435-2.475 2.474-.61 1.04-.916 2.17-.916 3.391s.305 2.352.916 3.39c.61 1.04 1.435 1.865 2.474 2.475 1.04.61 2.17.916 3.391.916zm0-1.312c-.984 0-1.896-.246-2.734-.739-.839-.492-1.504-1.157-1.996-1.996-.493-.838-.739-1.75-.739-2.734s.246-1.896.739-2.734c.492-.839 1.157-1.504 1.996-1.996.838-.493 1.75-.739 2.734-.739s1.896.246 2.734.739c.839.492 1.504 1.157 1.996 1.996.493.838.739 1.75.739 2.734s-.246 1.896-.739 2.734c-.492.839-1.157 1.504-1.996 1.996-.838.493-1.75.739-2.734.739zm.438-1.969c.09 0 .168-.032.232-.096s.096-.141.096-.232V8.516h2.406c.091 0 .168-.032.232-.096s.096-.141.096-.232v-.876c0-.09-.032-.168-.096-.232s-.141-.096-.232-.096H8.766V4.578c0-.091-.032-.168-.096-.232s-.141-.096-.232-.096h-.876c-.09 0-.168.032-.232.096s-.096.141-.096.232v2.406H4.828c-.091 0-.168.032-.232.096s-.096.141-.096.232v.875c0 .092.032.17.096.233.064.064.141.096.232.096h2.406v2.406c0 .091.032.168.096.232s.141.096.232.096h.875z"
              />
            </svg>
          </Button>
          {rules.map((rule, index) => {
            return (
              <div
                className={"inputsRow"}
                key={title + this.props.index + rule + index}
              >
                <div className={"posr"}>
                  <span className={"field"}>&nbsp;</span>
                  <Button
                    className={"db"}
                    size="small"
                    icon={<DeleteOutlined />}
                    type="link"
                    onClick={(e) => {
                      this.handleDeleteRule(e, { ruleSet, title, index });
                      this.forceUpdate();
                    }}
                  />
                </div>
                {this.getCurrentRuleFields(rules, index).map((field) => {
                  if (field !== "id") {
                    return (
                      <div key={field.toString()}>
                        <span className={"field"}>{field}:</span>
                        <Input
                          size={"small"}
                          value={rules[index][field]}
                          onChange={(e) => {
                            this.handleEditRule(e, { ruleSet, title, field, index });
                            this.forceUpdate();
                          }}
                        />
                      </div>
                    );
                  }
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
