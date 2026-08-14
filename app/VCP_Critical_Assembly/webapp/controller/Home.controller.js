sap.ui.define([
    "vcpapp/vcpcriticalcomp/controller/BaseController",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/Device",
    "../model/formatter"
],
    function (
        BaseController,
        MessageToast,
        JSONModel,
        Filter,
        FilterOperator,
        MessageBox,
        Device,
        formatter
    ) {
        "use strict";
        var that, oGModel;

        return BaseController.extend("vcpapp.vcpcriticalcomp.controller.Home", {
            /**
              * Called when a controller is instantiated and its View controls (if available) are already created.
              * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
              */
            formatter: formatter,
            onInit: function () {
                that = this;
                // Declaring JSON Model and size limit
                that.oModel = new JSONModel();
                this.locModel = new JSONModel();
                this.prodModel = new JSONModel();
                that.emptyModel = new JSONModel();

                // that.locModel.setSizeLimit(1000);
                // that.prodModel.setSizeLimit(1000);
                // this.oModel.setSizeLimit(1000);
                that.skip = 0;
                that.prod = [],that.prodFull=[],that.prodData=[];
                  that.toggleFooter(false);
                that.getOwnerComponent().getModel("BModel").read("/getUserPreferences", {
                    filters: [
                        new Filter("PARAMETER", FilterOperator.EQ, "MAX_RECORDS")
                    ],
                    success: function (oData) {
                        that.getOwnerComponent().getModel("oGModel").setProperty("/MaxCount", oData.results[0].PARAMETER_VALUE);
                        that.getLocation();
                        that.getAsmblyData()
                    },
                    error: function (oData, error) {
                        console.log(error)
                    },
                });

                this.viewDetails = new JSONModel();
                // that.viewDetails.setSizeLimit(5000);
                this.variantModel = new JSONModel();
                // that.variantModel.setSizeLimit(5000);

                // Declaring value help dialogs
                this._oCore = sap.ui.getCore();
                if (!this._valueHelpDialogLoc) {
                    this._valueHelpDialogLoc = sap.ui.xmlfragment(
                        "vcpapp.vcpcriticalcomp.view.LocDialog",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialogLoc);
                }
                if (!this._valueHelpDialogProd) {
                    this._valueHelpDialogProd = sap.ui.xmlfragment(
                        "vcpapp.vcpcriticalcomp.view.ProdDialog",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialogProd);
                }
                

            },
            // User authentication
            getUser: function () {
                let vUser;
                if (sap.ushell.Container) {
                    let email = sap.ushell.Container.getService("UserInfo").getUser().getEmail();
                    vUser = (email) ? email : "";
                }
                 if(!vUser){
                vUser='null';
            }
                return vUser;
            },

            /**
             * Called after the view has been rendered
             */
            onAfterRendering: function () {
                that = this;
                that.deletedArray = [];
                that.oLoc = this.byId("idlocCCT");
                that.oProd = this.byId("prodInputCCT");
                that._valueHelpDialogLoc.setTitleAlignment("Center");
                that._valueHelpDialogProd.setTitleAlignment("Center");
              
                this.oProdList = sap.ui.getCore().byId("prodSlctListCCT");
                this.oLocList = sap.ui.getCore().byId("LocSlctListCCT");

                this.oLoc = this.byId("idlocCCT");
                this.oProd = this.byId("prodInputCCT");

                that.oGModel = this.getModel("oGModel");
                sap.ui.core.BusyIndicator.show();

                // that.getLocation();
                // that.getAsmblyData()



               

                // this.getModel("BModel").read("/getFactoryLocation", {
                //     success: function (oData) {
                //         sap.ui.core.BusyIndicator.hide();
                //         that.locModel.setData(oData);
                //         that.oLocList.setModel(that.locModel);

                //     },
                //     error: function (oData, error) {
                //         sap.ui.core.BusyIndicator.hide();
                //         MessageToast.show("error");
                //     },
                // });
                // this.getModel("BModel").read("/getasmblyData", {
                //     success: function (oData) {
                //         sap.ui.core.BusyIndicator.hide();
                //         that.CriticalCompTabData = oData.results;
                //     },
                //     error: function (oData, error) {
                //         sap.ui.core.BusyIndicator.hide();
                //         MessageToast.show("error");
                //     },
                // });
                // that.getVariantData();
            },

            /**
             * This function is called when click on Input box Value Help.
             * Dialogs will be open based on sId.
             * @param {object} oEvent -the event information.
             */
            handleValueHelp: function (oEvent) {
                // oGModel = this.getModel("oGModel");
                var sId = oEvent.getParameter("id");
                // Loc Dialog
                if (sId.includes("loc")) {
                    that._valueHelpDialogLoc.open();
                    // Prod Dialog
                } else if (sId.includes("prod")) {
                    if (that.byId("idlocCCT").getTokens().length > 0) {
                        that._valueHelpDialogProd.open();
                    } else {
                        MessageToast.show("Select Location");
                    }
                }
            },

            /**
             * Called when 'Close/Cancel' button in any dialog is pressed.
             * Dialogs will be closed based on sId
             */
            handleClose: function (oEvent) {
                // var sId = oEvent.getParameter("id");
                // var sId = oEvent.getSource().getParent().mAssociations.initialFocus.split("-")[0];
                var sId = oEvent.getParameters().id
                // Loc Dialog
                if (sId.includes("LocSlctListCCT")) {
                    // sap.ui.getCore().byId("LocSearch").setValue("");
                    // that._oCore.byId(this._valueHelpDialogLoc.getId() + "-searchField").setValue("");
                    if (that.oLocList.getBinding("items")) {
                        that.oLocList.getBinding("items").filter([]);
                    }
                    // sap.ui.getCore().byId("LocSlctListCCT").removeSelections();
                    // that._valueHelpDialogLoc.close();
                    // Prod Dialog
                } else if (sId.includes("prodSlctListCCT")) {
                    // sap.ui.getCore().byId("ProdSearch").setValue("");
                    // that._oCore.byId(this._valueHelpDialogProd.getId() + "-searchField").setValue("");
                    if (that.oProdList.getBinding("items")) {
                        that.oProdList.getBinding("items").filter([]);
                    }
                    // sap.ui.getCore().byId("prodSlctListCCT").removeSelections();
                    // that._valueHelpDialogProd.close();
                }
            },

            /**
             * Called when something is entered into the search field.
             * @param {object} oEvent -the event information.
             */
            handleSearch: function (oEvent) {
                var sQuery =
                    oEvent.getParameter("value") || oEvent.getParameter("newValue"),
                    sId = oEvent.getParameter("id"),
                    oFilters = [];
                // Check if search filter is to be applied
                sQuery = sQuery ? sQuery.trim() : "";
                // Location
                if (sId.includes("Loc")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("FACTORY_LOC", FilterOperator.Contains, sQuery),
                                    new Filter("LOCATION_DESC", FilterOperator.Contains, sQuery),
                                ],
                                and: false,
                            })
                        );
                    }
                    that.oLocList.getBinding("items").filter(oFilters);
                    // Product
                } else if (sId.includes("prodSlctListCCT")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("REF_PRODID", FilterOperator.Contains, sQuery),
                                    new Filter("REFPROD_DESC", FilterOperator.Contains, sQuery),
                                ],
                                and: false,
                            })
                        );
                    }
                    that.oProdList.getBinding("items").filter(oFilters);
                }
                else if (sId.includes("GenSearch")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("VARIANTNAME", FilterOperator.Contains, sQuery),
                                    new Filter("USER", FilterOperator.Contains, sQuery),
                                    // new Filter("SCOPE", FilterOperator.Contains, sQuery)
                                ],
                                and: false,
                            })
                        );
                    }
                    sap.ui.getCore().byId("varNameListCCT").getBinding("items").filter(oFilters);
                }
            },

            /**
             * This function is called when selection of values in dialogs.
             * after selecting value, based on selection get data of other filters.
             * @param {object} oEvent -the event information.
             */
            handleSelection: function (oEvent) {
                var oTokenLoc = {}, newToken = [];
                // oGModel = this.getModel("oGModel");
                var sId = oEvent.getParameter("id"),
                    aSelectedItems;
                this.oLoc = that.byId("idlocCCT");
                this.oProd = that.byId("prodInputCCT");
                //Location list
                if (sId.includes("Loc")) {
                    aSelectedItems = oEvent.getParameter("selectedContexts");
                    that.oLoc.removeAllTokens();
                    // that.oLoc.setValue(oEvent.getParameters().listItem.getCells()[0].getTitle());
                    that.oLoc.addToken(
                        new sap.m.Token({
                            key: oEvent.getParameters().selectedItem.getDescription(),
                            text: oEvent.getParameters().selectedItem.getTitle(),
                            editable: false
                        })
                    );
                    oTokenLoc ={
                        FIELD:"Manfacturing Location",
                        VALUE:oEvent.getParameters().selectedItem.getTitle(),
                    }
                    newToken.push(oTokenLoc)



                    sap.ui.getCore().byId("LocSlctListCCT").getBinding("items").filter([]);
                    newToken = newToken.sort(that.dynamicSortMultiple("VALUE"));
                    // if (that.finaloTokens.length > 0) {
                    //     that.finaloTokens = that.finaloTokens.sort(that.dynamicSortMultiple("VALUE"));
                    // }
                    // if (JSON.stringify(newToken) !== JSON.stringify(that.finaloTokens)) {
                    //     that.byId("idMatList123CCT").setModified(true);
                    // }

                    that.oProd.removeAllTokens();
                    sap.ui.core.BusyIndicator.show();

                    var oLoc1 = oEvent.getParameters().selectedItem.getTitle();

                    that.getLocProdDet(oLoc1)
                    // this.getModel("BModel").read("/getLocProdDet", {
                    //     filters: [
                    //         new Filter(
                    //             "LOCATION_ID",
                    //             FilterOperator.EQ,
                    //             oEvent.getParameters().listItem.getCells()[0].getTitle()
                    //         ),
                    //     ],
                    //     success: function (oData) {
                    //         sap.ui.core.BusyIndicator.hide();
                    //         that.prodModel.setData(oData);

                    //         that.oProdList.setModel(that.prodModel);

                    //     },
                    //     error: function (oData, error) {
                    //         sap.ui.core.BusyIndicator.hide();
                    //         MessageToast.show("error");
                    //     },
                    // });

                    // Prod list
                } else if (sId.includes("prod")) {
                    // this.oProd = that.byId("prodInputCCT");
                    aSelectedItems = oEvent.getParameter("selectedItems");
                    that.oProd.removeAllTokens();
                    // that.oProd.setValue(oEvent.getParameters().listItem.getCells()[0].getTitle());
                    that.oProd.addToken(
                        new sap.m.Token({
                            key: oEvent.getParameters().selectedItem.getDescription(),
                            text: oEvent.getParameters().selectedItem.getTitle(),
                            editable: false
                        })
                    );
                    oTokenLoc ={
                        FIELD:"Manfacturing Location",
                        VALUE:oEvent.getParameters().selectedItem.getTitle(),
                    }
                    newToken.push(oTokenLoc)

                    sap.ui.getCore().byId("prodSlctListCCT").getBinding("items").filter([]);
                    newToken = newToken.sort(that.dynamicSortMultiple("VALUE"));
                    // if (that.finaloTokens.length > 0) {
                    //     that.finaloTokens = that.finaloTokens.sort(that.dynamicSortMultiple("VALUE"));
                    // }
                    // if (JSON.stringify(newToken) !== JSON.stringify(that.finaloTokens)) {
                    //     that.byId("idMatList123CCT").setModified(true);
                    // }

                }
                that.handleClose(oEvent);
                 that.toggleFooter(false);
            },

            onRefresh: function () {
                var oSloc = "",
                    oSprod = "";
                oSloc = that.oLoc.getTokens()[0].getText(),
                    oSprod = that.oProd.getTokens()[0].getText();

                var oFilters = [];
                // getting the filters
                oFilters.push(
                    new Filter({
                        filters: [
                            new Filter("FLAG", FilterOperator.EQ, "R"),
                            new Filter("LOCATION_ID", FilterOperator.EQ, oSloc),
                            new Filter("PRODUCT_ID", FilterOperator.EQ, oSprod),
                        ],
                        and: true,
                    })
                );

                sap.ui.core.BusyIndicator.show();
                this.getModel("BModel").callFunction("/getCriticalComp", {
                    method: "GET",
                    urlParameters: {
                        FLAG: "R",
                        LOCATION_ID: oSloc,
                        PRODUCT_ID: oSprod
                    },
                    success: function (oData) {
                        sap.ui.core.BusyIndicator.hide();
                        that.oModel = new JSONModel();

                        that.totalData = oData.results;

                        // that.oGModel.setProperty("/treeTabData", oData.results);
                        // that.aTreeTableData();

                        // var oTreeData = that.oGModel.getProperty("/treeData");

                        // for (var i = 0; i < oTreeData.History.length; i++) {
                        //     var childLength = oTreeData.History[i].children.length;
                        //     //     // oTreeData.History[i] = delete (oTreeData.History[i].CRITICALKEY);
                        //     var count = 0;
                        //     if (childLength) {
                        //         for (var j = 0; j < childLength; j++) {
                        //             if (oTreeData.History[i].children[j].ASSEMBLY_CRITICALKEY === "X") {
                        //                 count = count + 1;
                        //             }
                        //         }

                        //         if (count > 0) {
                        //             oTreeData.History[i].ASSEMBLY_CRITICALKEY = "X";
                        //             oTreeData.History[i].Flag = "X";
                        //         } else {
                        //             oTreeData.History[i].ASSEMBLY_CRITICALKEY = "";
                        //             oTreeData.History[i].Flag = "";
                        //         }

                        //     }
                        // }

                        // oTreeData.History = oTreeData.History.sort((a, b) => a.ITEM_NUM - b.ITEM_NUM);

                        if (oData.results !== undefined && oData.results.length > 0) {
                            that.oGModel.setProperty("/treeTabData", oData.results);
                            that.aTreeTableData();

                            var oTreeData = that.oGModel.getProperty("/treeData");
                            oTreeData.History = oTreeData.History.sort((a, b) => a.ITEM_NUM - b.ITEM_NUM);
                            that.oModel.setData({
                                results: oTreeData.History,
                            });
                            that.byId("idCriticalComp").setModel(that.oModel);

                        } else {
                            that.oModel.setData({
                                results: [],
                            });
                            that.byId("idCriticalComp").setModel(that.oModel);
                            MessageToast.show("No data for the selected Location Product");
                        }
                    },
                    error: function () {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Failed to get data");
                    },
                });

            },

            /**
             * This function is called when click on Go button.
             * @param {object} oEvent -the event information.
             */
            onGetData: function (oEvent) {
                that.oGModel.setProperty("/searchFlag", "");
                // sap.ui.core.BusyIndicator.show();
                if (that.oLoc.getTokens().length > 0 && that.oProd.getTokens().length > 0) {
                    var oSloc = that.oLoc.getTokens()[0].getText(),
                        oSprod = that.oProd.getTokens()[0].getText();
                }
                else {
                    return MessageToast.show("Please select Location and Product");
                }
                var oFilters = [];
                // getting the filters
                oFilters.push(
                    new Filter({
                        filters: [
                            new Filter("FLAG", FilterOperator.EQ, "G"),
                            new Filter("LOCATION_ID", FilterOperator.EQ, oSloc),
                            new Filter("PRODUCT_ID", FilterOperator.EQ, oSprod),
                        ],
                        and: true,
                    })
                );

                // if (oSloc !== "" && oSprod !== "") {
                this.byId("idCompSearchCCT").setValue("");
                // if(that.byId("idCriticalComp").getItems().length){
                //     that.byId("idCriticalComp").getBinding("items").filter(oFilters);
                // }
                sap.ui.core.BusyIndicator.show();
                this.getModel("BModel").callFunction("/getCriticalComp", {
                    method: "GET",
                    urlParameters: {
                        FLAG: "G",
                        LOCATION_ID: oSloc,
                        PRODUCT_ID: oSprod
                    },
                    success: function (oData) {
                        sap.ui.core.BusyIndicator.hide();
                        that.oModel = new JSONModel();

                        that.totalData = oData.results;

                        // that.oGModel.setProperty("/treeTabData", oData.results);
                        // that.aTreeTableData();

                        // var oTreeData = that.oGModel.getProperty("/treeData");

                        // oTreeData.History = oTreeData.History.sort((a, b) => a.ITEM_NUM - b.ITEM_NUM);

                        // for (var i = 0; i < oTreeData.History.length; i++) {
                        //     var childLength = oTreeData.History[i].children.length;
                        //     //     // oTreeData.History[i] = delete (oTreeData.History[i].CRITICALKEY);
                        //     var count = 0;
                        //     if (childLength) {
                        //         for (var j = 0; j < childLength; j++) {
                        //             if (oTreeData.History[i].children[j].ASSEMBLY_CRITICALKEY === "X") {
                        //                 count = count + 1;
                        //             }
                        //         }

                        //         if (count > 0) {
                        //             oTreeData.History[i].ASSEMBLY_CRITICALKEY = "X";
                        //             oTreeData.History[i].Flag = "X";
                        //         } else {
                        //             oTreeData.History[i].ASSEMBLY_CRITICALKEY = "";
                        //             oTreeData.History[i].Flag = "";
                        //         }

                        //     }
                        // }

                        if (oData.results !== undefined && oData.results.length > 0) {
                            that.getModel("BModel").read("/getRolesAccess", {
                                filters: [
                                    new Filter("FACTORY_LOC", FilterOperator.EQ, oSloc),
                                    new Filter("REF_PRODID", FilterOperator.EQ, oSprod),
                                    new Filter("USER", FilterOperator.EQ, that.getUser()),
                                ],
                                success: function (oResponse) {
                                    if(oResponse.results.length >0){
                                        let bUpdate = false;
                                         if(oResponse.results.findIndex(ind=>ind.UPDATE == true) !=-1){//Any of them has UPDATE as true
                                           bUpdate = true;
                                        }
                                    that.byId("criticalColumn").setVisible(bUpdate);
                                    }
                                      that.toggleFooter(true);    
                            that.oGModel.setProperty("/treeTabData", oData.results);
                            that.aTreeTableData();

                            var oTreeData = that.oGModel.getProperty("/treeData");

                            oTreeData.History = oTreeData.History.sort((a, b) => a.ITEM_NUM - b.ITEM_NUM);
                            that.oModel.setData({
                                results: oTreeData.History,
                            });
                            that.byId("idCriticalComp").setModel(that.oModel);
                                                            },
                                error: function (oError) {
                                    that.oModel.setData({
                                        results: [],
                                    });
                                    that.byId("idCriticalComp").setModel(that.oModel);
                                    MessageToast.show("No data for the selected Location Product");
                                }
                            })

                        } else {
                            that.oModel.setData({
                                results: [],
                            });
                            that.byId("idCriticalComp").setModel(that.oModel);
                            MessageToast.show("No data for the selected Location Product");
                        }
                        // that.saveDefaulVariant();
                    },
                    error: function () {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Failed to get data");
                    },
                });
                // } else {
                //     MessageToast.show("Please select Location and Product");
                // }
            },

            aTreeTableData: function (oData) {
                var aData = that.oGModel.getProperty("/treeTabData"),
                    oFinData = {
                        History: []
                    },
                    aFoundReq = [],
                    iIndex, oItem, oNewItem,
                    // Function to calculate the parent values
                    fnAddTime = function (oParent, oChild) {
                        var oNewParent = JSON.parse(JSON.stringify(oParent)),
                            oNewChild = JSON.parse(JSON.stringify(oChild)),
                            oOldParent = JSON.parse(JSON.stringify(oParent));


                        oNewChild._isParent = false;
                        aData[i].AssbCRITICALKEY = "";

                        if (oNewChild.CRITICALKEY === "X") {
                            oNewChild.Flag = "X";
                        } else {
                            oNewChild.Flag = "";
                        }

                        // Push the parent data item as well as it is part of the breakdown also. Do this only once
                        if (oNewParent.children.length === 0) {
                            oOldParent._isParent = false;
                            if (oOldParent.CRITICALKEY === "X") {
                                oOldParent.Flag = "X";
                            } else {
                                oOldParent.Flag = "";
                            }
                            oNewParent.children.push(oOldParent);
                        }
                        oNewParent.children.push(oNewChild);
                        return oNewParent;
                    };

                var fnAddChild = function (oParent, oChild) {
                    var oNewParent = JSON.parse(JSON.stringify(oParent)),
                        oNewChild = JSON.parse(JSON.stringify(oChild)),
                        oOldParent = JSON.parse(JSON.stringify(oParent));

                    oNewChild._isParent = false;

                    if (oNewChild.CRITICALKEY === "X") {
                        oNewChild.Flag = "X";
                    } else {
                        oNewChild.Flag = "";
                    }
                    oNewParent.children.push(oNewChild);
                    return oNewParent;
                };

                // If there is data in the table
                if (aData.length) {
                    // for (var i = aData.length - 1; i >= 0; i--) {
                    for (var i = 0; i < aData.length; i++) {
                        // History
                        iIndex = aFoundReq.indexOf(aData[i].ASSEMBLY);
                        // If data not found previously
                        if (iIndex === -1) {
                            aFoundReq.push(aData[i].ASSEMBLY);
                            aData[i].children = [];
                            // aData[i].Point = +aData[i].Point;
                            aData[i]._isParent = true;
                            aData[i].AssbCRITICALKEY = "";

                            if (aData[i].ASSEMBLY_CRITICALKEY === "X") {
                                aData[i].Flag = "X";
                            } else {
                                aData[i].Flag = "";
                            }


                            oFinData.History.push(aData[i]);

                            var liTemp = aData.filter(function (aComp) {
                                return aComp.ASSEMBLY === aData[i].ASSEMBLY;
                            });

                            if (liTemp.length === 1) {
                                iIndex = aFoundReq.indexOf(aData[i].ASSEMBLY);
                                oItem = oFinData.History[iIndex];
                                oNewItem = fnAddChild(oItem, aData[i]);
                                oFinData.History[iIndex] = oNewItem;
                            }



                            // Push as children
                        } else {
                            oItem = oFinData.History[iIndex];
                            oNewItem = fnAddTime(oItem, aData[i]);
                            oFinData.History[iIndex] = oNewItem;
                        }
                    }
                }
                that.oGModel.setProperty("/treeData", oFinData);
            },
             toggleFooter(flag) { //Hide or show footer based on Table Data
                var oObjectPageLayout = this.byId("ObjectPageLayoutCCT");
                oObjectPageLayout.setShowFooter(flag);
            },
            /**
            * Called when something is entered into the search field.
            * @param {object} oEvent -the event information.
            */

            onSearch: function (oEvent) {
                var sQuery =
                    oEvent.getParameter("value") || oEvent.getParameter("newValue"),
                    oFilters = [],
                    filterData = [];

                var aData = that.totalData;

                // var filterData = aData.filter(function (aComp) {
                //     return aComp.ASSEMBLY.includes(sQuery) ||  aComp.ITEM_NUM.includes(sQuery);
                // });

                sQuery = sQuery.toUpperCase();
                if (that.oGModel.getProperty("/searchFlag") !== "X") {
                    for (var i = 0; i < aData.length; i++) {
                        var assem = aData[i].ASSEMBLY.toUpperCase(),
                            comp = aData[i].COMPONENT.toUpperCase(),
                            item = aData[i].ITEM_NUM.toUpperCase();
                        if (
                            assem.includes(sQuery) ||
                            // comp.includes(sQuery) || 
                            item.includes(sQuery)
                        ) {
                            filterData.push(aData[i]);
                        }
                    }


                    that.oGModel.setProperty("/treeTabData", filterData);
                    that.aTreeTableData();

                    var oTreeData = that.oGModel.getProperty("/treeData");

                    for (var i = 0; i < oTreeData.History.length; i++) {
                        var childLength = oTreeData.History[i].children.length;
                        // oTreeData.History[i] = delete (oTreeData.History[i].CRITICALKEY);
                        var count = 0;
                        if (childLength) {
                            for (var j = 0; j < childLength; j++) {
                                if (oTreeData.History[i].children[j].CRITICALKEY === "X") {
                                    count = count + 1;
                                }
                            }

                            if (count === childLength) {
                                // oTreeData.History[i].AssbCRITICALKEY === "A";
                                oTreeData.History[i].CRITICALKEY = "A";
                            } else {
                                oTreeData.History[i].CRITICALKEY = "";
                            }

                        }
                    }

                    

                    if (oTreeData.History.length) {
                        that.oModel.setData({
                            results: oTreeData.History,
                        });
                        that.byId("idCriticalComp").setModel(that.oModel);

                    } else {
                        that.oModel.setData({
                            results: [],
                        });
                        that.byId("idCriticalComp").setModel(that.oModel);
                        MessageToast.show("No data for the selected Location Product");
                    }
                }
            },

            onCriticalChange: function (oEvent) {

                var oItem, parent, child, key, asmbkey, path, aData, PNo;

                // path = oEvent.getSource().getParent().getBindingContext().getPath();
                oItem = oEvent.getSource().getBindingContext().getObject();
                parent = oItem._isParent;
                path = oEvent.getSource().getParent().getBindingContext().getPath();
                child = path.includes("children");
                var ParentData = oEvent.getSource().getParent().getBindingContext().oModel.oData.results;
                var state = oEvent.getSource().getState();
                that.event = oEvent.getSource();

                var oEntry = {
                    criticalComp: [],
                },
                    vRuleslist;
                var changeFlag = "",
                    CHANGE_FLAG;

                that.compareData = that.CriticalCompTabData;


                if (parent) {
                    // Getting the conformation popup before deleting		
                    var text = "Please Confirm to change the criticality of assembly " + " - " + oItem.ASSEMBLY;
                    sap.m.MessageBox.show(
                        text, {

                        title: "Conformation",
                        actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                        onClose: function (oAction) {
                            if (oAction === sap.m.MessageBox.Action.YES) {
                                if (oItem.ASSEMBLY_CRITICALKEY === "X") {
                                    key = "";
                                } else {
                                    key = "X";
                                }
                                vRuleslist = {
                                    LOCATION_ID: oItem.LOCATION_ID,
                                    PRODUCT_ID: oItem.PRODUCT_ID,
                                    ITEM_NUM: oItem.ITEM_NUM,
                                    ASSEMBLY: oItem.ASSEMBLY,
                                    COMPONENT: "",
                                    COMP_DESC: oItem.COMP_DESC,
                                    ASSEMBLY_CRITICALKEY: key,
                                };
                                oEntry.criticalComp.push(vRuleslist);

                                that.getModel("BModel").callFunction("/changeToCritical", {
                                    method: "GET",
                                    urlParameters: {
                                        criticalComp: JSON.stringify(oEntry.criticalComp)
                                    },
                                    success: function (oData) {
                                        sap.ui.core.BusyIndicator.hide();
                                        MessageToast.show(oData.changeToCritical);
                                        that.onGetData();
                                    },
                                    error: function (oData) {
                                        sap.ui.core.BusyIndicator.hide();
                                        MessageToast.show("Failed to changes the status");
                                    },
                                });

                            } else {
                                if (state) {
                                    that.event.setState(false);
                                } else {
                                    that.event.setState(true);
                                }
                            }

                        }
                    }
                    );

                } else {
                    if (oItem.ASSEMBLY_CRITICALKEY === "X") {
                        asmbkey = "X";
                    } else if (oEvent.getParameters().state === true) {
                        asmbkey = "X";
                    } else {
                        asmbkey = oItem.ASSEMBLY_CRITICALKEY;
                    }

                    if (oItem.CRITICALKEY === "X" && oEvent.getParameters().state === false) {
                        key = "";
                    } else {
                        key = "X";
                    }


                    vRuleslist = {
                        LOCATION_ID: oItem.LOCATION_ID,
                        PRODUCT_ID: oItem.PRODUCT_ID,
                        ITEM_NUM: oItem.ITEM_NUM,
                        ASSEMBLY: "",
                        COMPONENT: oItem.COMPONENT,
                        COMP_DESC: oItem.COMP_DESC,
                        CRITICALKEY: key,
                        ASSEMBLY_CRITICALKEY: asmbkey,
                    };
                    oEntry.criticalComp.push(vRuleslist);

                    that.getModel("BModel").callFunction("/changeToCritical", {
                        method: "GET",
                        urlParameters: {
                            criticalComp: JSON.stringify(oEntry.criticalComp)
                        },
                        success: function (oData) {
                            sap.ui.core.BusyIndicator.hide();
                            MessageToast.show(oData.changeToCritical);
                            that.onGetData();
                        },
                        error: function (oData) {
                            sap.ui.core.BusyIndicator.hide();
                            MessageToast.show("Failed to changes the status");
                        },
                    });


                }
            },

            onChange: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var oItem = oEvent.getSource().getBindingContext().getObject();
                var oCRITICALKEY;

                var oEntry = {
                    criticalComp: [],
                },
                    vRuleslist;

                if (oItem.CRITICALKEY === "X") {
                    oCRITICALKEY = '';//false;
                } else {
                    oCRITICALKEY = 'X';//true;
                }

                vRuleslist = {
                    LOCATION_ID: oItem.LOCATION_ID,
                    PRODUCT_ID: oItem.PRODUCT_ID,
                    ITEM_NUM: oItem.ITEM_NUM,
                    COMPONENT: oItem.COMPONENT,
                    CRITICALKEY: oCRITICALKEY,
                };
                oEntry.criticalComp.push(vRuleslist);




                that.getModel("BModel").callFunction("/changeToCritical", {
                    method: "GET",
                    urlParameters: {
                        criticalComp: JSON.stringify(oEntry.criticalComp)
                    },
                    success: function (oData) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show(oData.changeToCritical);
                        that.onGetData();
                    },
                    error: function (oData) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Failed to changes the status");
                    },
                });
            },
            onNavPress: function () {
if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
                    var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                    // generate the Hash to display 
                    var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                        target: {
                            semanticObject: "VCPDocument",
                            action: "Display"
                        }
                    })) || "";
                    var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
                    oStorage.put("nodeId",62);
                    //Generate a  URL for the second application
                    var url = window.location.href.split('#')[0] + hash;
                    //Navigate to second app
                    sap.m.URLHelper.redirect(url, true);
                }
            },

            //#Variant Code Start//
            getVariantData: function () {
                var ndData = [];
                var dData = [], uniqueName = [];
                that.uniqueName = [];
                sap.ui.core.BusyIndicator.show();
                var variantUser =   this.getUser();
                var appName = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                that.oGModel.setProperty("/UserId", variantUser);
                // Define the filters
                var oFilterAppName1 = new sap.ui.model.Filter("APPLICATION_NAME", sap.ui.model.FilterOperator.EQ, appName);
                var oFilterUser = new sap.ui.model.Filter("USER", sap.ui.model.FilterOperator.EQ, variantUser);

                var oFilterAppName2 = new sap.ui.model.Filter("APPLICATION_NAME", sap.ui.model.FilterOperator.EQ, appName);
                var oFilterScope = new sap.ui.model.Filter("SCOPE", sap.ui.model.FilterOperator.EQ, "Public");
                
                 var oFilterAppName3 = new sap.ui.model.Filter("APPLICATION_NAME", sap.ui.model.FilterOperator.EQ, 'DefaultSingle');
                var oFilterUser1 = new sap.ui.model.Filter("USER", sap.ui.model.FilterOperator.EQ, variantUser);

                var oFilterCondition1 = new sap.ui.model.Filter({
                    filters: [oFilterAppName1, oFilterUser],
                    and: true // Combine with AND
                });

                var oFilterCondition2 = new sap.ui.model.Filter({
                    filters: [oFilterAppName2, oFilterScope],
                    and: true // Combine with AND
                });

                var oFilterCondition3 = new sap.ui.model.Filter({
                    filters: [oFilterAppName3, oFilterUser1],
                    and: true // Combine with AND
                });

                var oFinalFilter = new sap.ui.model.Filter({
                    filters: [oFilterCondition1, oFilterCondition2, oFilterCondition3],
                    and: false // Combine with OR
                });

                this.getView().getModel("BModel").read("/getVariantHeader", {
                    filters: [oFinalFilter],
                    success: function (oData) {
                         that.oGModel.setProperty("/headerDetails", oData.results);
                        if (oData.results.length === 0) {
                            that.oGModel.setProperty("/variantDetails", "");
                            that.oGModel.setProperty("/fromFunction", "X");
                            uniqueName.unshift({
                                "VARIANTNAME": "Standard",
                                "VARIANTID": "0",
                                "DEFAULT": "Y",
                                "REMOVE": false,
                                "CHANGE": false,
                                "USER": "SAP",
                                "SCOPE": "Public"
                            })
                            that.oGModel.setProperty("/viewNames", uniqueName);
                            that.oGModel.setProperty("/defaultDetails", "");
                            that.viewDetails.setData({
                                items12: uniqueName
                            });
                            that.varianNames = uniqueName;
                            that.byId("idMatList123CCT").setModel(that.viewDetails);
                            that.UniqueDefKey = uniqueName[0].VARIANTID;
                            that.byId("idMatList123CCT").setDefaultKey(uniqueName[0].VARIANTID);
                            that.byId("idMatList123CCT").setSelectedKey(uniqueName[0].VARIANTID);
                            var Default = "Standard";
                            if (that.oGModel.getProperty("/newVaraintFlag") === "X") {
                                var newVariant = that.oGModel.getProperty("/newVariant");
                                that.handleSelectPress(newVariant[0].VARIANTNAME);
                                that.oGModel.setProperty("/newVaraintFlag", "");
                            } else {
                                that.handleSelectPress(Default);
                            }
                        }
                        else {
                            for (var i = 0; i < oData.results.length; i++) {
                                if (oData.results[i].DEFAULT === "Y" && oData.results[i].USER === variantUser) {
                                    dData.push(oData.results[i]);
                                    that.UniqueDefKey = oData.results[i].VARIANTID;
                                    that.byId("idMatList123CCT").setDefaultKey((oData.results[i].VARIANTID));
                                    that.byId("idMatList123CCT").setSelectedKey((oData.results[i].VARIANTID))
                                }
                                if(oData.results[i].USER !== variantUser){
                                    oData.results[i].CHANGE = false;
                                    oData.results[i].REMOVE = false;
                                    oData.results[i].ENABLE = false;
                                }
                                ndData.push(oData.results[i]);
                            }

                            if (dData.length > 0) {
                                that.oGModel.setProperty("/defaultVariant", dData);
                            }
                            that.oGModel.setProperty("/VariantData", ndData);

                            that.getTotalVariantDetails();
                        }
                    },
                    error: function (oData, error) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("error while loading variant details");
                    },
                });
            },
            getTotalVariantDetails: function () {
                var aData = [], uniqueName = [], details = {}, defaultDetails = [], oFilters = [];
                var headerData = that.oGModel.getProperty("/VariantData");
                if (headerData.length > 0) {
                    for (var i = 0; i < headerData.length; i++) {
                        oFilters.push(new Filter("VARIANTID", FilterOperator.EQ, headerData[i].VARIANTID));
                    }
                }
                var userVariant = that.oGModel.getProperty("/UserId");
                this.getOwnerComponent().getModel("BModel").read("/getVariant", {
                    filters: [oFilters],
                    success: function (oData) {
                        that.oGModel.setProperty("/fieldDetails", oData.results);
                        var variantNewData = oData.results;
                        aData = variantNewData.map(item1 => {
                            const item2 = headerData.find(item2 => item2.VARIANTID === item1.VARIANTID);
                            return item2 ? { ...item1, ...item2 } : { ...item1 };
                        });
                        that.oGModel.setProperty("/variantDetails", aData);
                        if (aData.length > 0) {
                            aData = aData.filter(id => id.VARIANTNAME !== "defaultSingle" && id.APPLICATION_NAME !== "DefaultSingle")
                            uniqueName = that.removeDuplicate(aData, "VARIANTNAME");
                            that.oGModel.setProperty("/saveBtn", "");
                            for (var k = 0; k < uniqueName.length; k++) {
                                if (uniqueName[k].DEFAULT === "Y" && uniqueName[k].USER === userVariant) {
                                    var Default = uniqueName[k].VARIANTNAME;
                                    details = {
                                        "VARIANTNAME": uniqueName[k].VARIANTNAME,
                                        "VARIANTID": uniqueName[k].VARIANTID,
                                        "USER": uniqueName[k].USER,
                                        "DEFAULT": "N"
                                    };
                                    defaultDetails.push(details);
                                    details = {};
                                }
                            }
                        }

                        that.oGModel.setProperty("/fromFunction", "X");
                        if (Default) {
                            uniqueName.unshift({
                                "VARIANTNAME": "Standard",
                                "VARIANTID": "0",
                                "DEFAULT": "N",
                                "REMOVE": false,
                                "CHANGE": false,
                                "USER": "SAP",
                                "SCOPE": "Public"
                            })
                            that.oGModel.setProperty("/viewNames", uniqueName);
                            that.variantModel.setData({
                                items12: uniqueName
                            });
                            that.varianNames = uniqueName;
                            that.oGModel.setProperty("/defaultDetails", defaultDetails);
                            that.byId("idMatList123CCT").setModel(that.variantModel);
                            if (that.oGModel.getProperty("/newVaraintFlag") === "X") {
                                var newVariant = that.oGModel.getProperty("/newVariant");
                                that.handleSelectPress(newVariant[0].VARIANTNAME);
                                if (newVariant[0].DEFAULT === "Y") {
                                    that.UniqueDefKey = newVariant[0].VARIANTID;
                                    that.byId("idMatList123CCT").setDefaultKey((newVariant[0].VARIANTID));
                                }
                                that.byId("idMatList123CCT").setSelectedKey((newVariant[0].VARIANTID))
                                that.oGModel.setProperty("/newVaraintFlag", "");
                            } else {
                                that.handleSelectPress(Default);
                            }
                        } else {
                            uniqueName.unshift({
                                "VARIANTNAME": "Standard",
                                "VARIANTID": "0",
                                "DEFAULT": "Y",
                                "REMOVE": false,
                                "CHANGE": false,
                                "USER": "SAP",
                                "SCOPE": "Public"
                            })
                            that.oGModel.setProperty("/viewNames", uniqueName);
                            that.oGModel.setProperty("/defaultDetails", "");

                            that.viewDetails.setData({
                                items12: uniqueName
                            });
                            that.varianNames = uniqueName;
                            that.byId("idMatList123CCT").setModel(that.viewDetails);
                            var Default = "Standard";
                            if (that.oGModel.getProperty("/newVaraintFlag") === "X") {
                                var newVariant = that.oGModel.getProperty("/newVariant");
                                that.handleSelectPress(newVariant[0].VARIANTNAME);
                                if (newVariant[0].DEFAULT === "Y") {
                                    that.UniqueDefKey = newVariant[0].VARIANTID;
                                    that.byId("idMatList123CCT").setDefaultKey((newVariant[0].VARIANTID));
                                }
                                that.byId("idMatList123CCT").setSelectedKey((newVariant[0].VARIANTID))
                                that.oGModel.setProperty("/newVaraintFlag", "");
                            } else {
                                that.UniqueDefKey = uniqueName[0].VARIANTID;
                                that.byId("idMatList123CCT").setDefaultKey((uniqueName[0].VARIANTID));
                                that.byId("idMatList123CCT").setSelectedKey((uniqueName[0].VARIANTID));
                                that.handleSelectPress(Default);
                            }
                        }

                    },
                    error: function (oData, error) {
                        sap.ui.core.BusyIndicator.hide()
                        MessageToast.show("error while loading variant details");
                    },
                });
            },
          
            removeDuplicate: function (array, key) {
                var check = new Set();
                return array.filter(obj => !check.has(obj[key]) && check.add(obj[key]));
            },
            /**
           * On selection of VIEW in POPOVER fragment.
           * @param {*} oEvent 
           */
            handleSelectPress: function (oEvent) {
                var oLoc, oProd,
                    oTokens = {};
                that.finaloTokens = [];
                that.oGModel.setProperty("/selectedLocation", '');
                that.oGModel.setProperty("/selectedProd", '');
                that.byId("idlocCCT").removeAllTokens();
                that.byId("prodInputCCT").removeAllTokens();
                var oTableItems = that.oGModel.getProperty("/variantDetails");
                that.byId("idMatList123CCT").setModified(false);
                var appName = this.getOwnerComponent().getManifestEntry("/sap.app/id");
               
                that.oGModel.setProperty("/setLocation", []);
                that.oGModel.setProperty("/setProduct", []);
                that.oGModel.setProperty("/defaultLocation", []);
                that.oGModel.setProperty("/defaultProduct", []);
                if (that.oGModel.getProperty("/fromFunction") === "X") {
                    that.oGModel.setProperty("/fromFunction", "");
                    that.selectedApp = oEvent;
                    that.oGModel.setProperty("/variantName", that.selectedApp);
                }
                else {
                    that.selectedApp = oEvent.getSource().getTitle().getText();
                    that.oGModel.setProperty("/variantName", that.selectedApp);
                }
                if (that.selectedApp !== "Standard") {
                    for (var i = 0; i < oTableItems.length; i++) {
                        if (that.selectedApp === oTableItems[i].VARIANTNAME && oTableItems[i].APPLICATION_NAME === appName) {
                            if (oTableItems[i].FIELD.includes("Location")) {
                                oLoc = oTableItems[i].VALUE;
                                var oManLocTemplate = new sap.m.Token({
                                    key: oTableItems[i].VALUE,
                                    text: oTableItems[i].VALUE,
                                    editable: false
                                });
                                that.byId("idlocCCT").addToken(oManLocTemplate);
                                oTokens = {
                                    FIELD: oTableItems[i].FIELD,
                                    VALUE: oTableItems[i].VALUE
                                }
                                that.finaloTokens.push(oTokens);
                                that.oGModel.setProperty("/selectedLocation", oLoc);
                            } else if (oTableItems[i].FIELD.includes("Product")) {
                                oProd = oTableItems[i].VALUE;
                                var oItemTemplate = new sap.m.Token({
                                    key: oTableItems[i].VALUE,
                                    text: oTableItems[i].VALUE,
                                    editable: false
                                });
                                that.byId("prodInputCCT").addToken(oItemTemplate);
                                oTokens = {
                                    FIELD: oTableItems[i].FIELD,
                                    VALUE: oTableItems[i].VALUE
                                }
                                that.finaloTokens.push(oTokens);
                                that.oGModel.setProperty("/selectedProd", oTableItems[i].VALUE);
                            }
                        }
                    }
                    if (oLoc) {
                        that.oLocList.getItems().forEach(item => {
                            if (that.oLocList.getItems()[0].mProperties.title === oLoc) {
                                item.setSelected(true);
                            }
                        })
                    }
                    that.getLocProdDet(oLoc)
                
                  
                 
                } else {
                    // let headerDetails = that.oGModel.getProperty("/headerDetails").filter(id => id.APPLICATION_NAME == "DefaultSingle" && id.VARIANTNAME == "defaultSingle");
                    // if (headerDetails.length > 0) {
                    //     var oTableItems = that.oGModel.getProperty("/fieldDetails").filter(id => id.VARIANTID == headerDetails[0].VARIANTID);
                    //     for (var i = 0; i < oTableItems.length; i++) {
                    //         if (oTableItems[i].FIELD.includes("Manufacturing Location")) {
                    //             oLoc = oTableItems[i].VALUE;
                    //             var oManLocTemplate = new sap.m.Token({
                    //                 key: oTableItems[i].VALUE,
                    //                 text: oTableItems[i].VALUE,
                    //                 editable: false
                    //             });
                    //             that.byId("idlocCCT").addToken(oManLocTemplate);
                    //             oTokens = {
                    //                 FIELD: oTableItems[i].FIELD,
                    //                 VALUE: oTableItems[i].VALUE
                    //             }
                    //             that.finaloTokens.push(oTokens);
                    //             that.oGModel.setProperty("/selectedLocation", oLoc);
                    //         } else if (oTableItems[i].FIELD.includes("Config Product")) {
                    //             oProd = oTableItems[i].VALUE;
                    //             var oItemTemplate = new sap.m.Token({
                    //                 key: oTableItems[i].VALUE,
                    //                 text: oTableItems[i].VALUE,
                    //                 editable: false
                    //             });
                    //             that.byId("prodInputCCT").addToken(oItemTemplate);
                    //             oTokens = {
                    //                 FIELD: oTableItems[i].FIELD,
                    //                 VALUE: oTableItems[i].VALUE
                    //             }
                    //             that.finaloTokens.push(oTokens);
                    //             that.oGModel.setProperty("/selectedProd", oTableItems[i].VALUE);
                    //         }
                    // }
                    // if (oLoc) {
                    //     that.oLocList.getItems().forEach(item => {
                    //         if (that.oLocList.getItems()[0].mProperties.title === oLoc) {
                    //             item.setSelected(true);
                    //         }
                    //     })
                    // }
                    // that.getLocProdDet(oLoc)
                    // }
                    //     else{
                    //do nothing
                    that.byId("prodInputCCT").removeAllTokens();
                    that.byId("idlocCCT").removeAllTokens();
                   
                   
                 
                    // that.onResetData();
                    if (that.oLocList.getItems().length > 0) {
                        that.oLocList.getItems().forEach(item => {
                            item.setSelected(false);
                        })
                    }
                    if (that.oProdList.getItems().length > 0) {
                        that.oProdList.getItems().forEach(item => {
                            item.setSelected(false);
                        })
                    }
                // }
                 sap.ui.core.BusyIndicator.hide();
                }
            },
           
            /**
            * Creating a new VIEW on press of save in NameVariant fragment
            * @param {*} oEvent 
            */
            onCreate: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var array = [];
                var details = {};
                if (that.oLoc.getTokens().length > 0) {
                    var sLocation = that.byId("idlocCCT").getTokens()[0].getText();
                }
                else {
                    var sLocation = "";
                }
                var Field1 = that.byId("idlocCCT").getParent().getItems()[0].getText();
                if (that.oProd.getTokens().length > 0) {
                    var sProd = that.byId("prodInputCCT").getTokens()[0].getText();
                }
                else {
                    var sProd = ""
                }
                var Field2 = that.byId("prodInputCCT").getParent().getItems()[0].getText();
                var varName = sap.ui.getCore().byId("idInputCCT").getValue();
               
                var varName = oEvent.getParameters().name;
                var sDefault = oEvent.getParameters().def;
                var appName = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                if (!sLocation && !sProd.length === 0) {
                    sap.ui.core.BusyIndicator.hide();
                    return MessageToast.show("No values selected in filters Configurable Product,Demand Location & Customer Group")
                }

                if (varName) {
                    if (sDefault && that.oGModel.getProperty("/defaultDetails").length > 0) {
                        var defaultChecked = "Y";
                        this.getOwnerComponent().getModel("BModel").callFunction("/updateVariant", {
                            method: "GET",
                            urlParameters: {
                                VARDATA: JSON.stringify(that.oGModel.getProperty("/defaultDetails"))
                            },
                            success: function (oData) {
                            },
                            error: function (error) {
                                MessageToast.show("Failed to create variant");
                            },
                        });

                    }
                    else if (sDefault && that.oGModel.getProperty("/defaultDetails").length === 0) {
                        var defaultChecked = "Y";
                    }
                    else {
                        var defaultChecked = "N";
                    }
                    if (oEvent.getParameters().public) {
                        var Scope = "Public";
                    }
                    else {
                        var Scope = "Private";
                    }
                    if (sLocation) {
                        details = {
                            Field: Field1,
                            FieldCenter: (1).toString(),
                            Value: sLocation,
                            Default: defaultChecked
                        }
                        array.push(details);
                    }
                    if (sProd) {
                        details = {
                            Field: Field2,
                            FieldCenter: (1).toString(),
                            Value: sProd,
                            Default: defaultChecked
                        }
                        array.push(details);
                    }
                    if (!oEvent.getParameters().overwrite) {
                        for (var j = 0; j < array.length; j++) {
                            array[j].IDNAME = varName;
                            array[j].App_Name = appName;
                            array[j].SCOPE = Scope;
                        }
                        var flag = "X";
                    }
                    else {
                        var flag = "E";
                        for (var j = 0; j < array.length; j++) {
                            array[j].ID = oEvent.getParameters().key;
                            array[j].IDNAME = varName;
                            array[j].App_Name = appName;
                            array[j].SCOPE = Scope;
                        }
                    }
                    //    console.log(JSON.stringify(array));
                    this.getOwnerComponent().getModel("BModel").callFunction("/createVariant", {
                        method: "GET",
                        urlParameters: {
                            Flag: flag,
                            USER: (that.oGModel.getProperty("/UserId")),
                            VARDATA: JSON.stringify(array)
                        },
                        success: function (oData) {
                            sap.ui.core.BusyIndicator.hide();
                            that.oGModel.setProperty("/newVariant", oData.results);
                            that.oGModel.setProperty("/newVaraintFlag", "X");
                            that.byId("idMatList123CCT").setModified(false);
                            that.onAfterRendering();
                        },
                        error: function (error) {
                            sap.ui.core.BusyIndicator.hide();
                            MessageToast.show("Failed to create variant");
                        },
                    });
                }
                else {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("Please fill View Name");
                }
            },
          
            /**
            * Saving the public/private property on click of save in VariantNames fragment. 
            */
            onManage: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var oDelted = {}, deletedArray = [], count=0;
                var totalVariantData = that.oGModel.getProperty("/VariantData");
                var selected = oEvent.getParameters();
                var variantUser = this.getUser();
                if(selected.def){
                    totalVariantData.filter(item1=>{
                        if(JSON.parse(selected.def) === item1.VARIANTID && item1.USER !== variantUser){
                            count++
                        }
                    })
                }
                if(count>0){
                    sap.ui.core.BusyIndicator.hide();
                    that.viewDetails.setData({
                        items12: that.varianNames
                    });
                    that.byId("idMatList123CCT").setModel(that.viewDetails);
                    that.byId("idMatList123CCT").setDefaultKey(that.UniqueDefKey);
                    return MessageToast.show("Variant doesn't belong to logged in user. Cannot make changes to this Variant");
                }
                //Delete the selected variant names
                if (selected.deleted) {
                    selected.deleted.forEach(item1 => {
                        totalVariantData.forEach(item2 => {
                            if (JSON.parse(item1) === item2.VARIANTID) {
                                oDelted = {
                                    ID: item2.VARIANTID,
                                    NAME: item2.VARIANTNAME
                                };
                                deletedArray.push(oDelted);
                            }
                        })
                    });
                    if (deletedArray.length > 0) {
                        that.deleteVariant(deletedArray)
                    }
                }
                //Updating the default variants
                if (selected.def) {
                    //If selected default is not standard
                    if (JSON.parse(selected.def) !== 0) {
                        //Update the existing default to a new default
                        var defaultVariant = totalVariantData.filter(item => item.DEFAULT === "Y");
                        if (defaultVariant.length > 0) {
                            defaultVariant[0].DEFAULT = "N";
                            that.getView().getModel("BModel").callFunction("/updateVariant", {
                                method: "GET",
                                urlParameters: {
                                    VARDATA: JSON.stringify(defaultVariant)
                                },
                                success: function (oData) {
                                    var newDefault = totalVariantData.filter(item => item.VARIANTID === JSON.parse(selected.def));
                                    newDefault[0].DEFAULT = "Y";
                                    that.getView().getModel("BModel").callFunction("/updateVariant", {
                                        method: "GET",
                                        urlParameters: {
                                            VARDATA: JSON.stringify(newDefault)
                                        },
                                        success: function (oData) {
                                            that.onAfterRendering();
                                            sap.ui.core.BusyIndicator.hide();
                                        },
                                        error: function (error) {
                                            MessageToast.show("Failed to update variant");
                                        },
                                    });
                                },
                                error: function (error) {
                                    sap.ui.core.BusyIndicator.hide();
                                    MessageToast.show("Failed to update variant");
                                },
                            });

                        }
                        else {
                            var selectedVariant = totalVariantData.filter(item => item.VARIANTID === JSON.parse(selected.def));
                            selectedVariant[0].DEFAULT = "Y";
                            that.getView().getModel("BModel").callFunction("/updateVariant", {
                                method: "GET",
                                urlParameters: {
                                    VARDATA: JSON.stringify(selectedVariant)
                                },
                                success: function (oData) {
                                    that.onAfterRendering();
                                    // sap.ui.core.BusyIndicator.hide();
                                },
                                error: function (error) {
                                    sap.ui.core.BusyIndicator.hide();
                                    MessageToast.show("Failed to update variant");
                                },
                            });
                        }
                    }
                    //If selected default is standard then remove the existing default variant
                    else {
                        var defaultItem = totalVariantData.filter(item => item.DEFAULT === "Y");
                        defaultItem[0].DEFAULT = "N";
                        that.getView().getModel("BModel").callFunction("/updateVariant", {
                            method: "GET",
                            urlParameters: {
                                VARDATA: JSON.stringify(defaultItem)
                            },
                            success: function (oData) {
                                that.onAfterRendering();
                                // sap.ui.core.BusyIndicator.hide();
                            },
                            error: function (error) {
                                sap.ui.core.BusyIndicator.hide();
                                MessageToast.show("Failed to update variant");
                            },
                        });
                    }
                }else{
                    that.onAfterRendering();
                }
                sap.ui.core.BusyIndicator.hide();
            },
            /**
            //**On click of reset button */
            onResetData: function () {
                that.byId("idlocCCT").removeAllTokens();
                that.byId("prodInputCCT").removeAllTokens();
                that.byId("idCompSearchCCT").setValue("");
                that.byId("idCriticalComp").setModel(that.emptyModel);
                that.oGModel.setProperty("/searchFlag", "X");
                that.toggleFooter(false);
            },

            /**
             * 
             */

            deleteVariant: function (oEvent) {
                var deletedItems = JSON.stringify(oEvent);
                that.getView().getModel("BModel").callFunction("/createVariant", {
                    method: "GET",
                    urlParameters: {
                        Flag: "D",
                        USER: that.oGModel.getProperty("/UserId"),
                        VARDATA: deletedItems
                    },
                    success: function (oData) {
                        that.deletedArray = [];
                        // that.onAfterRendering();
                    },
                    error: function (error) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Failed to delete variant");
                    },
                });
            },
            getLocation: function () {
                var topCount = parseInt(that.getOwnerComponent().getModel("oGModel").getProperty("/MaxCount"));
                // that.getOwnerComponent().getModel("BModel").read("/getfactorylocdesc", {
                   // Authentications added to getRolesLocProd service 
                that.getOwnerComponent().getModel("BModel").read("/getRolesLocProd", {
                      filters: [new Filter(
                        "USER",
                        FilterOperator.EQ,
                        this.getUser() 
                    )],
                    urlParameters: {
                        "$skip": that.skip,
                        "$top": topCount
                    },
                    success: function (aData) {
                        if (topCount == aData.results.length) {
                            that.skip += parseInt(topCount);
                            that.prod = that.prod.concat(aData.results);
                            that.getLocation();
                        }
                        else {
                            that.skip = 0;
                            that.prod = that.prod.concat(aData.results);
                            that.prodData = that.prod;
                            var locData = that.removeDuplicate(that.prod,'FACTORY_LOC')
                            locData.sort((a, b) => a.FACTORY_LOC.localeCompare(b.FACTORY_LOC, undefined, { numeric: true, sensitivity: 'base' }));
                            sap.ui.core.BusyIndicator.hide();
                            that.locModel.setData({results1:locData});
                            that.oLocList.setModel(that.locModel);
                            that.prod = []
                        }
                    },
                    error: function () {
                        MessageToast.show("Failed to get data");
                    }
                })
            },
            getAsmblyData:function(){
                var topCount = that.getOwnerComponent().getModel("oGModel").getProperty("/MaxCount");
                that.getOwnerComponent().getModel("BModel").read("/getasmblyData", {
                    urlParameters: {
                        "$skip": that.skip,
                        "$top": topCount
                    },
                    success: function (aData) {
                        if (topCount == aData.results.length) {
                            that.skip += parseInt(topCount);
                            that.prod = that.prod.concat(aData.results);
                            that.getAsmblyData();
                        }
                        else {
                            that.skip = 0;
                            that.prod = that.prod.concat(aData.results);
                            sap.ui.core.BusyIndicator.hide();
                            that.CriticalCompTabData = aData.results;
                            that.prod = []
                        }
                    },
                    error: function () {
                        MessageToast.show("Failed to get data");
                    }
                })
            },
            getLocProdDet: function (oLoc) {
                var topCount = that.getOwnerComponent().getModel("oGModel").getProperty("/MaxCount");
                if (oLoc) {
                    var filter = [new Filter("LOCATION_ID",FilterOperator.EQ,oLoc),]
                }
                
                // that.getOwnerComponent().getModel("BModel").read("/getLocProdDet", {
                //     filters: filter,
                //     urlParameters: {
                //         "$skip": that.skip,
                //         "$top": topCount
                //     },
                //     success: function (aData) {
                //         if (topCount == aData.results.length) {
                //             that.skip += parseInt(topCount);
                //             that.prod = that.prod.concat(aData.results);
                //             that.getLocProdDet();
                //         }
                //         else {
                            // that.skip = 0;
                            that.prodFull = that.prodData.filter(id=>id.FACTORY_LOC === oLoc);
                            that.prodFull = that.removeDuplicate(that.prodFull,'REF_PRODID');
                            that.prodFull.sort((a, b) => a.REF_PRODID.localeCompare(b.REF_PRODID, undefined, { numeric: true, sensitivity: 'base' }));
                            sap.ui.core.BusyIndicator.hide();
                            that.prodModel.setData({results1:that.prodFull});
                            that.oProdList.setModel(that.prodModel);
                //             that.prod = []
                //         }
                //     },
                //     error: function () {
                //         MessageToast.show("Failed to get data");
                //     }
                // })
            },
            dynamicSortMultiple: function () {
                let props = arguments;
                const that = this;
                return function (obj1, obj2) {
                    var i = 0,
                        result = 0,
                        numberOfProperties = props.length;
                    while (result === 0 && i < numberOfProperties) {
                        result = that.dynamicSort(props[i])(obj1, obj2);
                        i++;
                    }
                    return result;
                };
            },
            dynamicSort: function (property) {
                var sortOrder = 1;
                if (property[0] === "-") {
                    sortOrder = -1;
                    property = property.substr(1);
                }
                return function (a, b) {
                    var result =
                        a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
                    return result * sortOrder;
                };
            },
            saveDefaulVariant:function(){
                 sap.ui.core.BusyIndicator.show();
                var array = [];
                var details = {};
                if (that.oLoc.getTokens().length > 0) {
                    var sLocation = that.byId("idlocCCT").getTokens()[0].getText();
                }
                var Field1 = that.byId("idlocCCT").getParent().getItems()[0].getText();
                if (that.oProd.getTokens().length > 0) {
                    var sProd = that.byId("prodInputCCT").getTokens()[0].getText();
                }
                var Field2 = that.byId("prodInputCCT").getParent().getItems()[0].getText();
                if (!sLocation && !sProd.length === 0) {
                    sap.ui.core.BusyIndicator.hide();
                    return;
                }
                    if (sLocation) {
                        details = {
                            Field: Field1,
                            FieldCenter: (1).toString(),
                            Value: sLocation
                        }
                        array.push(details);
                    }
                    if (sProd) {
                        details = {
                            Field: Field2,
                            FieldCenter: (1).toString(),
                            Value: sProd
                        }
                        array.push(details);
                    
                        var flag = "N";
                        for (var j = 0; j < array.length; j++) {
                            array[j].IDNAME = "defaultSingle";
                            array[j].App_Name = "DefaultSingle";
                            array[j].SCOPE = "Global";
                        }
                    }
                    //    console.log(JSON.stringify(array));
                    this.getOwnerComponent().getModel("BModel").callFunction("/createVariant", {
                        method: "GET",
                        urlParameters: {
                            Flag: flag,
                            USER: (that.oGModel.getProperty("/UserId")),
                            VARDATA: JSON.stringify(array)
                        },
                        success: function (oData) {
                            sap.ui.core.BusyIndicator.hide();
                        },
                        error: function (error) {
                            sap.ui.core.BusyIndicator.hide();
                            MessageToast.show("Failed to create global variant");
                        },
                    });
            }
        });
    });
