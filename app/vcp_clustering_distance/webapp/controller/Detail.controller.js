sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Table",
    "sap/m/Column",
    "sap/m/Text",
    "sap/m/ObjectIdentifier",
    "sap/m/ColumnListItem",
    "sap/m/Label",
    "sap/ui/model/json/JSONModel"
   
], (Controller, Filter, FilterOperator,Table, Column, Text, ObjectIdentifier, ColumnListItem, Label, JSONModel) => {
    "use strict";
    var that;

    return Controller.extend("vcpapp.vcpclusteringdistance.controller.Detail", {
        onInit() {
            that =this;
            that.oGModel = that.getOwnerComponent().getModel("oGModel");

          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("Detail").attachMatched(this._onRouteMatched, this);
            
        },

        _onRouteMatched:function(){
            var newArr =  that.oGModel.getProperty("/primaryIdModel");
            that.generateTable(newArr);
        },

        generateTable:function (newArr) {
            
           var oGModel = that.getOwnerComponent().getModel('oGModel');
            var oColumn = {},
                oRowData = {},
                aColumns = [],
                aRowData = [];
            var aConfig = [];
            var aFilteredUniqueChars = [];
            var iCounter = 0, iTotal = 0, iCIRQty = 0;
            var columnName;
            var bVisible = true;
            var sCellIcon = "";
            var sCellIconPath;
            var sColumnName,
                sColDesc,
                sCharValPath,
                sCharValDescPath;
            var sWidth = "auto";
           

            that.oUniqueCharTable = that.getView().byId("idTableDetailCS");

            if (newArr.length > 0) {
                // Looping through the data to generate columns
                for (var i = 0; i < newArr.length; i++) {
                    oColumn = {};

                    if (i === 0) {
                        aConfig = newArr[i].CONFIG;
                        oColumn.PRIMARY_CHAR = 'Characteristic';
                        oColumn.TOTAL = newArr[i].TOTAL;
                        aColumns.push(oColumn);
                        oColumn = {};
                    }

                    oColumn.PRIMARY_CHAR = newArr[i].PRIMARY_ID;
                    oColumn.PRIMARY_ID_DESC = newArr[i].PRIMARY_ID_DESC;
                    oColumn.TOTAL = newArr[i].TOTAL;
                    aColumns.push(oColumn);
                }
                for (var j = 0; j < aConfig.length; j++) { // Base Configurations
                    oRowData = {};
                    oRowData['Characteristic'] = [{ CHAR_NAME: aConfig[j].CHAR_NAME, CHAR_DESC: aConfig[j].CHAR_DESC }];

                    for (var k = 1; k < aColumns.length; k++) {

                        aFilteredUniqueChars = [];
                        aFilteredUniqueChars = newArr.filter(function (aUniqChar) {
                            return aUniqChar.PRIMARY_ID === aColumns[k].PRIMARY_CHAR;
                        });
                        aFilteredUniqueChars = aFilteredUniqueChars[0].CONFIG;

                        for (var l = 0; l < aFilteredUniqueChars.length; l++) {
                            sCellIcon = "";
                            if (aConfig[j].CHAR_NAME === aFilteredUniqueChars[l].CHAR_NAME &&
                                aConfig[j].CHAR_DESC === aFilteredUniqueChars[l].CHAR_DESC &&
                                aConfig[j].CHAR_NUM === aFilteredUniqueChars[l].CHAR_NUM
                            ) {
                                if (aConfig[j].CHARVAL_NUM !== aFilteredUniqueChars[l].CHARVAL_NUM) {
                                    sCellIcon = "sap-icon://sys-cancel-2";
                                }
                                oRowData[aColumns[k].PRIMARY_CHAR] = [{ CHAR_VALUE: aFilteredUniqueChars[l].CHAR_VALUE, CHARVAL_DESC: aFilteredUniqueChars[l].CHARVAL_DESC, CHAR_NUM: aFilteredUniqueChars[l].CHAR_NUM, CHARVAL_NUM: aFilteredUniqueChars[l].CHARVAL_NUM, CELL_COLOR: sCellIcon }];
   
                                break;
                            }
                        }
                    }
                    aRowData.push(oRowData);
                    oRowData = {};
                }

                // Adding rows and columns data to JSON Model
                var selectId = oGModel.getProperty("/selPrimaryId"),
                    characteristicColumn = aColumns[0],
                    selectColumn = aColumns.find(obj => obj.PRIMARY_ID_DESC === selectId);
                aColumns = aColumns.filter(c => {
                    if (c.PRIMARY_CHAR == "Characteristic" || c.PRIMARY_ID_DESC === selectId)
                        return false
                    else
                        return true
                })
                var newaColumn = [characteristicColumn, selectColumn, ...aColumns.sort((a, b) => b.TOTAL - a.TOTAL)];
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({
                    rows: aRowData,
                    columns: newaColumn,
                });
                that.oUniqueCharTable.setModel(oModel);
                // Checking column names and applying sap.m.Link to column values
                that.oUniqueCharTable.bindColumns("/columns", function (sId, oContext) {
                    iTotal = 0;
                    iCounter = iCounter + 1;
                    columnName = oContext.getObject().PRIMARY_CHAR;

                    iTotal = oContext.getObject().TOTAL;
                    sColumnName = columnName.toString();
                    sColDesc = oContext.getObject().PRIMARY_ID_DESC + " (" + iTotal + ")" 

                    if (columnName === 'Characteristic') {
                        sCharValPath = columnName + "/0/CHAR_NAME";
                        sCharValDescPath = columnName + "/0/CHAR_DESC";
                        return new sap.ui.table.Column({
                            width: "10rem",
                            label: sColumnName,
                            // filterProperty: columnName,
                            template: new sap.m.ObjectIdentifier({
                                title: "{" + sCharValDescPath + "}",
                                text: "{" + sCharValPath + "}"
                            })
                        });

                    } else {
                        if (iCounter >20 ) {
                            bVisible = false;
                        }

                        if (iCounter === 1) {
                            sWidth = "14rem";
                        } else {
                            sWidth = "8rem";
                        }

                        sCharValPath = columnName + "/0/CHAR_VALUE";
                        sCharValDescPath = columnName + "/0/CHARVAL_DESC";
                        sCellIconPath = columnName + "/0/CELL_COLOR";

                        return new sap.ui.table.Column({
                            width: sWidth,
                            name: sColumnName,
                            label: sColDesc,
                            visible: bVisible,
                            template: new sap.m.HBox({
                                alignItems: "Center",
                                justifyContent: "SpaceBetween",
                                items: [
                                    new sap.m.ObjectIdentifier({
                                        title: "{" + sCharValDescPath + "}",
                                        text: "{" + sCharValPath + "}"
                                    }),
                                    new sap.ui.core.Icon({ src: "{" + sCellIconPath + "}", color: "Critical" })

                                ]
                            })
                        });
                    }
                });
                // sap.ui.core.BusyIndicator.hide();
                that.oUniqueCharTable.bindRows("/rows");

            }

        },

        onSelectRBCharFilter: function (oEvent) {
            var aFilter = [];
            var sSelText = oEvent.getSource().getSelectedButton().getText();
            var oTable = that.byId("idTableDetailCS");
            var aColumns = oTable.getColumns();
            var iColLength = aColumns.length;
            var aFilterUniqueIds = [];
            var sColLabel = '';
            var sPath = "";
            switch (sSelText) {
                case 'All':
                    oTable.getBinding().filter(aFilter);
                    break;
                case 'Matched':
                    for (var i = 2; i < aColumns.length; i++) {
                        sColLabel = aColumns[i].getName();
                        sPath = sColLabel + '/0/CELL_COLOR';
                        aFilterUniqueIds.push(new Filter(sPath, FilterOperator.EQ, ''));
                    }
                    aFilter = new Filter(aFilterUniqueIds, true);
                    oTable.getBinding().filter(aFilter);

                    break;
                case 'UnMatched':
                    for (var i = 2; i < aColumns.length; i++) {
                      
                        sColLabel = aColumns[i].getName();
                        sPath = sColLabel + '/0/CELL_COLOR';
                        aFilterUniqueIds.push(new Filter(sPath, FilterOperator.EQ, 'sap-icon://sys-cancel-2'));
                    }
                    aFilter = new Filter(aFilterUniqueIds, false);
                    oTable.getBinding().filter(aFilter);
                    break;
                default:
                    oTable.getBinding().filter(aFilter);
                    break;

            }

        },

        onBack:function(){
            this.getOwnerComponent().getRouter().navTo("Home");
        }
    });
});