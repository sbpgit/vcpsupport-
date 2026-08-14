sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/m/MessageToast',
    "sap/ui/core/library",
    "sap/ui/model/Sorter",
    "jquery.sap.global",
    "sap/m/Dialog",
    "sap/m/library",
    "sap/m/Text",
    "sap/m/Button",
    "sap/m/MessageBox",
    "sap/ui/export/Spreadsheet"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Filter, FilterOperator, MessageToast, library, Sorter, jquery, Dialog, mobileLibrary, Text, Button, formatter, MessageBox, Spreadsheet) {
        "use strict";
        var that;

        var aResult;
        var aggregatedData
        var aAddData = [];
        var Week;
        var nextSetOfDates;
        var count = 2;
        var Verscena;
        var oAddObjectDep;
        var mergedObjects;
        var HandsontableKey;

        return Controller.extend("vcpapp.vcppredictions.controller.Home", {
            onInit: function () {
                that = this;
                that.count = 0;
                that.oLocat = []; 
                that.onTimeZone()
                that.loadHotKey();
                that.locModel = new sap.ui.model.json.JSONModel();
                that.prodModel = new sap.ui.model.json.JSONModel();
                that.oNewModel = new sap.ui.model.json.JSONModel();
                that.variantModel = new sap.ui.model.json.JSONModel();
                that.oErrorModel = new sap.ui.model.json.JSONModel();
                that.viewDetails = new sap.ui.model.json.JSONModel();

                that.locModel.setSizeLimit(1000);
                that.prodModel.setSizeLimit(1000);
                that.variantModel.setSizeLimit(5000);
                that.oErrorModel.setSizeLimit(1200);

                that.oGModel = that.getOwnerComponent().getModel("oGModel");
                sap.ui.core.BusyIndicator.show();
                that.getCalenderWeek();
             //   that.getData();
               
                that.getOwnerComponent().getModel("oModel").read("/getUserPreferences", {
                    filters: [
                        new Filter("PARAMETER", FilterOperator.EQ, "MAX_RECORDS")
                    ],
                    success: function (oData) {
                        that.oGModel.setProperty("/MaxCount", oData.results[0].PARAMETER_VALUE);
                  
                        that.onValueHelp()

                    },
                    error: function (oData, error) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show(error)
                    },
                });
                //  that.fetch()
                that.byId("onLeftPS").setVisible(false);
                if (!this._popOver) {
                    this._popOver = sap.ui.xmlfragment(
                        "vcpapp.vcppredictions.view.PopOver",
                        this
                    );
                    this.getView().addDependent(this._popOver);
                }
                if (!this._nameFragment) {
                    this._nameFragment = sap.ui.xmlfragment(
                        "vcpapp.vcppredictions.view.NameVariant",
                        this
                    );
                    this.getView().addDependent(this._nameFragment);
                }

                if (!this._downFragment) {
                    this._downFragment = sap.ui.xmlfragment(
                        "vcpapp.vcppredictions.view.download",
                        this
                    );
                    this.getView().addDependent(this._downFragment);
                }
                // that.byId("DRS1PS").setValue("10/30/2023 - 02/27/2024")
               

            },
            loadHotKey: async function () {
                HandsontableKey = await that.getHandsontableKey();
            },
            onPres: function () {
                function addMonths(date, months) {
                    const newDate = new Date(date);
                    newDate.setMonth(newDate.getMonth() + months);
                    return newDate;
                }

                // Calculate today's date and the date two months later
                const today = new Date();
                const twoMonthsLater = addMonths(today, 2);

                // Format dates to the pattern 'yyyy/MM/dd'
                const formatDate = (date) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}/${month}/${day}`;
                };

                const startDate = formatDate(today);
                const endDate = formatDate(twoMonthsLater);
            
                sap.ui.getCore().byId("DRS2PS").setDateValue(new Date(startDate))
                sap.ui.getCore().byId("DRS2PS").setSecondDateValue(new Date(endDate))
                this._downFragment.open()
            },
            getHandsontableKey: function (params) {
                var promise = new Promise((resolve, reject) => {
                    var model = that.getOwnerComponent().getModel("oModel");
                    model.callFunction("/getHandsontableKey", {
                        success: function (params) {
                            resolve(params.getHandsontableKey);
                        },
                        error: function (err) {
                            reject(err.message);
                        }
                    })
                });
                return promise;
            },
            onTimeZone: function () {
                that.getOwnerComponent().getModel("oModel").read("/getUserPreferences", {
                    filters: [
                        new Filter("PARAMETER", FilterOperator.EQ, "TIMEZONE")
                    ],
                    success: function (oData) {
                        if (oData.results[0].PARAMETER_VALUE.includes("(")) {
                            var length = oData.results[0].PARAMETER_VALUE.length - 1;
                            that.timezone = oData.results[0].PARAMETER_VALUE.slice(1, length);
                        } else {
                            that.timezone = oData.results[0].PARAMETER_VALUE;
                        }
                        that.oGModel.setProperty("/timezone", that.timezone);
                    },
                    error: function (oData, error) {
                        console.log(error)
                    },
                });
            },
            // Search Filter function
            handleSearch1: function (oEvent) {
                var oLocList = sap.ui.getCore().byId("oLocationPS");
                var oProdList = sap.ui.getCore().byId("oProductPS");
                var oVersList = sap.ui.getCore().byId("oVersionPS");
                var oScenList = sap.ui.getCore().byId("oScenarioPS");
                var oNamVariant = sap.ui.getCore().byId("varNameListPS");
                var sQuery =
                    oEvent.getParameter("value") || oEvent.getParameter("newValue"),
                    sId = oEvent.getParameter("id"),
                    oFilters = [];
                // Check if search filter is to be applied
                sQuery = sQuery ? sQuery.trim() : "";
                if (sId.includes("Loc")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new sap.ui.model.Filter({
                                filters: [
                                    new sap.ui.model.Filter("LOCATION_ID", sap.ui.model.FilterOperator.Contains, sQuery),
                                    new sap.ui.model.Filter("LOCATION_DESC", sap.ui.model.FilterOperator.Contains, sQuery)
                                ],
                                and: false
                            })
                        );
                    }

                    oLocList.getBinding("items").filter(oFilters);

                }
                else if (sId.includes("oProd")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new sap.ui.model.Filter({
                                filters: [
                                    new sap.ui.model.Filter("PRODUCT_ID", sap.ui.model.FilterOperator.Contains, sQuery),
                                    new sap.ui.model.Filter("PRODUCT_DESC", sap.ui.model.FilterOperator.Contains, sQuery)
                                ],
                                and: false
                            })
                        );
                    }
                    oProdList.getBinding("items").filter(oFilters);
                }
                else if (sId.includes("oVer")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new sap.ui.model.Filter({
                                filters: [
                                    new sap.ui.model.Filter("VERSION_NAME", sap.ui.model.FilterOperator.Contains, sQuery),
                                    new sap.ui.model.Filter("VERSION", sap.ui.model.FilterOperator.Contains, sQuery)
                                ],
                                and: false
                            })
                        );
                    }
                    oVersList.getBinding("items").filter(oFilters);
                }
                else if (sId.includes("oSce")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new sap.ui.model.Filter({
                                filters: [
                                    new sap.ui.model.Filter("SCENARIO_NAME", sap.ui.model.FilterOperator.Contains, sQuery),
                                    new sap.ui.model.Filter("SCENARIO", sap.ui.model.FilterOperator.Contains, sQuery)
                                ],
                                and: false
                            })
                        );
                    }
                    oScenList.getBinding("items").filter(oFilters);
                }
                else if (sId.includes("GenSearch")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new sap.ui.model.Filter({
                                filters: [
                                    new sap.ui.model.Filter("VARIANTNAME", sap.ui.model.FilterOperator.Contains, sQuery),
                                    new sap.ui.model.Filter("USER", sap.ui.model.FilterOperator.Contains, sQuery)

                                ],
                                and: false,
                            })
                        );
                    }
                    oNamVariant.getBinding("items").filter(oFilters);
                }

            },
            /**
          * Save the current view if any changes in the existing properties.
          */
            onSave: function () {
                var updatedDetails = {};
                var updatedArray = [];
                var selectedItem = sap.ui.getCore().byId("idMatListPS");
                if (selectedItem.getSelectedItem() !== null) {
                    var Default = selectedItem.getSelectedItem().getBindingContext().getObject().DEFAULT;
                    var VariantId = selectedItem.getSelectedItem().getBindingContext().getObject().VARIANTID;
                    var VariantName = selectedItem.getSelectedItem().getBindingContext().getObject().VARIANTNAME;
                    // var Scope = selectedItem.getSelectedItem().getBindingContext().getObject().SCOPE;

                } else {
                    var defaulDetails1 = that.oGModel.getProperty("/defaultDetails");
                    var VariantId = defaulDetails1[0].VARIANTID;
                    var VariantName = defaulDetails1[0].VARIANTNAME;
                    // var Scope = defaulDetails1[0].SCOPE;
                    var Default = "Y";
                    // that.oGModel.setProperty("/defFromFunc","");

                }


                var Field1 = that.byId("oLocPS").getParent().getItems()[0].getText();
                var sLocation = that.byId("oLocPS").getValue();
                var Field2 = that.byId("oProdPS").getParent().getItems()[0].getText();
                var sProduct = that.byId("oProdPS").getValue();
                var sVersion = that.byId("oVersPS").getValue();
                var Field3 = that.byId("oVersPS").getParent().getItems()[0].getText();
                var sScenario = that.byId("oScenPS").getValue();
                var Field4 = that.byId("oScenPS").getParent().getItems()[0].getText();
                if (VariantName) {
                    updatedDetails = {
                        Field: Field1,
                        FieldCenter: (1).toString(),
                        Value: sLocation,
                        FAVOURITE: "N",
                        Default: Default
                    }
                    updatedArray.push(updatedDetails);
                    // }

                    // for (var k = 0; k < sProduct.length; k++) {
                    updatedDetails = {
                        Field: Field2,
                        FieldCenter: (1).toString(),
                        Value: sProduct,
                        FAVOURITE: "N",
                        Default: Default
                    }
                    updatedArray.push(updatedDetails);
                    // }
                    updatedDetails = {
                        Field: Field3,
                        FieldCenter: (1).toString(),
                        Value: sVersion,
                        FAVOURITE: "N",
                        Default: Default
                    }
                    updatedArray.push(updatedDetails);

                    updatedDetails = {
                        Field: Field4,
                        FieldCenter: (1).toString(),
                        Value: sScenario,
                        FAVOURITE: "N",
                        Default: Default
                    }
                    updatedArray.push(updatedDetails);

                    for (var j = 0; j < updatedArray.length; j++) {
                        // var ID = that.oGModel.getProperty("/Id");
                        // if (ID === undefined) {
                        //   ID = 0;
                        // }
                        // ID = ID + 1;
                        updatedArray[j].ID = VariantId;
                        updatedArray[j].IDNAME = VariantName;
                        updatedArray[j].App_Name = "Predictions"
                    }


                    that.getView().getModel("oModel").callFunction("/createVariant", {
                        method: "GET",
                        urlParameters: {
                            Flag: "E",
                            USER: that.oGModel.getProperty("/UserId"),
                            VARDATA: JSON.stringify(updatedArray)
                        },
                        success: function (oData) {
                            that.oGModel.setProperty("/newVariant", oData.results);
                            that.oGModel.setProperty("/newVaraintFlag", "X");
                            that.onAfterRendering();
                            that._popOver.close();
                            that.byId("idDropDownPS").setPressed(false);
                        },
                        error: function (error) {

                            sap.m.MessageToast.show("Failed to update variant");
                        },
                    });
                } else {
                    sap.m.MessageToast.show("Please fill View Name");
                }
            },

            onVariantSave: function () {
                that.byId("idDropDownPS").setPressed(false);
                that._popOver.close();
                that._nameFragment.open();
                sap.ui.getCore().byId("idInputPS").setValue();
                sap.ui.getCore().byId("idInputPS").setValueState("None");
                sap.ui.getCore().byId("idSaveBtnPS").setEnabled(true);
            },

            onSaveClose: function () {
                // sap.ui.getCore().byId("idInputPS").setValue("");
                // that.byId("idloc").setValue("");
                // that.byId("prodInput").setTokens([]);
                that._nameFragment.close();
            },
            /**
         * Creating a new VIEW on press of save in NameVariant fragment
         * @param {*} oEvent 
         */
            onCreate: function (oEvent) {

                that.byId("idDropDownPS").setPressed(false);
                var oEntry = {
                    RTRCHAR: []
                };
                var array = [];
                var details = {};
                var sLocation = that.byId("oLocPS").getValue();
                var Field1 = that.byId("oLocPS").getParent().getItems()[0].getText();
                var sProduct = that.byId("oProdPS").getValue();
                var Field2 = that.byId("oProdPS").getParent().getItems()[0].getText();
                var sVersion = that.byId("oVersPS").getValue();
                var Field3 = that.byId("oVersPS").getParent().getItems()[0].getText();
                var sScenario = that.byId("oScenPS").getValue();
                var Field4 = that.byId("oScenPS").getParent().getItems()[0].getText();

                var varName = sap.ui.getCore().byId("idInputPS").getValue();

                var sDefault = sap.ui.getCore().byId("_IDGenCheckBox1PS").getSelected();
                if (varName) {
                    if (sDefault && that.oGModel.getProperty("/defaultDetails").length > 0) {
                        var defaultChecked = "Y";
                        that.getModel("oModel").callFunction("/updateVariant", {
                            method: "GET",
                            urlParameters: {
                                VARDATA: JSON.stringify(that.oGModel.getProperty("/defaultDetails"))
                            },
                            success: function (oData) {
                                sap.m.MessageToast.show(oData);
                            },
                            error: function (error) {
                                sap.m.MessageToast.show("Failed to create variant");
                            },
                        });

                    } else if (sDefault && that.oGModel.getProperty("/defaultDetails").length === 0) {
                        var defaultChecked = "Y";
                    } else {
                        var defaultChecked = "N";
                    }
                    // for (var i = 0; i < sLocation.length; i++) {
                    details = {
                        Field: Field1,
                        FieldCenter: (1).toString(),
                        Value: sLocation,
                        FAVOURITE: "N",
                        // Scope: Scope,
                        Default: defaultChecked
                    }
                    array.push(details);
                    // }

                    // for (var k = 0; k < sProduct.length; k++) {
                    details = {
                        Field: Field2,
                        FieldCenter: (1).toString(),
                        Value: sProduct,
                        FAVOURITE: "N",
                        // Scope: Scope,
                        Default: defaultChecked
                    }
                    array.push(details);
                    details = {
                        Field: Field3,
                        FieldCenter: (1).toString(),
                        Value: sVersion,
                        FAVOURITE: "N",
                        // Scope: Scope,
                        Default: defaultChecked
                    }
                    array.push(details);
                    details = {
                        Field: Field4,
                        FieldCenter: (1).toString(),
                        Value: sScenario,
                        FAVOURITE: "N",
                        // Scope: Scope,
                        Default: defaultChecked
                    }
                    array.push(details);

                    for (var j = 0; j < array.length; j++) {
                        var ID = that.oGModel.getProperty("/Id");
                        if (ID === undefined) {
                            ID = 0;
                        }
                        ID = ID + 1;
                        array[j].ID = ID;
                        array[j].IDNAME = varName;
                        array[j].App_Name = "Predictions"
                    }
                    // oEntry.RTRCHAR.push(array);

                    that.getOwnerComponent().getModel("oModel").callFunction("/createVariant", {
                        method: "GET",
                        urlParameters: {
                            Flag: "X",
                            USER: that.oGModel.getProperty("/UserId"),
                            VARDATA: JSON.stringify(array)
                        },
                        success: function (oData) {
                            that.oGModel.setProperty("/newVariant", oData.results);
                            that.oGModel.setProperty("/newVaraintFlag", "X");
                            sap.ui.getCore().byId("_IDGenCheckBox1PS").setSelected(false);
                            sap.ui.getCore().byId("idInputPS").setValue();
                            that._nameFragment.close();
                            that.onAfterRendering();
                        },
                        error: function (error) {

                            sap.m.MessageToast.show("Failed to create variant");
                        },
                    });
                } else {
                    sap.m.MessageToast.show("Please fill View Name");
                }

            },

            onDropDownPress: function (oEvent) {
                var count = 0;
                if (oEvent.getSource().getPressed()) {
                    this._popOver.openBy(oEvent.getSource());
                    var locDetails = that.byId("oLocPS").getValue();
                    var productDetails = that.byId("oProdPS").getValue();
                    var versionDetails = that.byId("oVersPS").getValue();
                    var ScenarioDetails = that.byId("oScenPS").getValue();
                    var locDefault = that.oGModel.getProperty("/selectedLocation");
                    var itemsDefault = that.oGModel.getProperty("/defaultProducts");
                    // var selectedID = that.byId("idVariantNamePS").getText();
                    if (selectedID !== "Standard" && that.oGModel.getProperty("/saveBtn") !== "X") {
                        sap.ui.getCore().byId("idSavePS").setVisible(true);
                        sap.ui.getCore().byId("idSavePS").setType("Emphasized");
                    }

                } else {
                    this._popOver.close();
                }
                // }
            },
            // delete variant
            deleteVariant: function () {
                that.getView().getModel("oModel").callFunction("/createVariant", {
                    method: "GET",
                    urlParameters: {
                        Flag: "D",
                        USER: that.oGModel.getProperty("/UserId"),
                        VARDATA: JSON.stringify(that.deletedArray)
                    },
                    success: function (oData) {
                        sap.m.MessageToast.show("Delete succesfully");
                        that.deletedArray = [];
                    },
                    error: function (error) {
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageToast.show("Failed to delete variant");
                    },
                });
            },
            
            getUser: function () {
                let vUser;
                if (sap.ushell.Container) {
                    let email = sap.ushell.Container.getService("UserInfo").getUser().getEmail();
                    vUser = (email) ? email : "";
                }
                return vUser;
            },

            /*Getting variant view data*/
            getData: function () {
                var aData = [];
                var bData = [];
                var dData = [];
                var publicData = [];
                var details = {};
                var defaultDetails = [];
                var uniqueName = [];

                sap.ui.core.BusyIndicator.show();
                var variantUser = "Testing" //this.getUser();
                that.oGModel.setProperty("/UserId", variantUser);

                // that.getOwnerComponent().getModel("oModel").read("/getLocation", {
                //     success: function (oData) {
                //         sap.ui.core.BusyIndicator.hide();
                //         that.locData = oData.results;
                //         that.locModel.setData(oData);
                //         that.oLocList.setModel(that.locModel);
                //     },
                //     error: function (oData, error) {
                //         sap.ui.core.BusyIndicator.hide();
                //         MessageToast.show("error");
                //     },
                // });
                // Calling service to get Products data
                // that.getOwnerComponent().getModel("oModel").read("/getProducts", {
                //     success: function (oData) {
                //         // sap.ui.core.BusyIndicator.hide();
                //         that.prodData = oData.results;
                //     },
                //     error: function (oData, error) {
                //         // sap.ui.core.BusyIndicator.hide();
                //         MessageToast.show("error");
                //     },
                // });



                that.getOwnerComponent().getModel("oModel").read("/getVariant", {
                    success: function (oData) {
                      //  sap.ui.core.BusyIndicator.hide();
                        var IDlength = oData.results.length
                        if (IDlength === 0) {
                            that.oGModel.setProperty("/Id", 0);
                            that.oGModel.setProperty("/variantDetails", "");
                            that.oGModel.setProperty("/fromFunction", "X");
                            uniqueName.unshift({
                                "VARIANTNAME": "Standard",
                                "VARIANTID": "0",
                                "DEFAULT": "Y",
                                // "SCOPE": "Public"
                            })
                            that.oGModel.setProperty("/viewNames", uniqueName);
                            that.oGModel.setProperty("/defaultDetails", "");
                            that.viewDetails.setData({
                                items1: uniqueName
                            });
                            that.varianNames = uniqueName;
                            sap.ui.getCore().byId("idMatListPS").setModel(that.viewDetails);
                            sap.ui.getCore().byId("idMatListPS").removeSelections(true);
                            sap.ui.getCore().byId("varNameListPS").setModel(that.viewDetails);

                            Default = "Standard";
                            if (that.oGModel.getProperty("/newVaraintFlag") === "X") {
                                var newVariant = that.oGModel.getProperty("/newVariant");
                                that.handleSelectPress(newVariant[0].VARIANTNAME);
                                that.oGModel.setProperty("/newVaraintFlag", "");
                            }
                            else {
                                that.handleSelectPress(Default);
                            }
                        } else {
                            that.oGModel.setProperty("/Id", oData.results[IDlength - 1].VARIANTID);
                            that.oGModel.setProperty("/variantDetails", oData.results);
                            for (var i = 0; i < oData.results.length; i++) {
                                if (that.oGModel.getProperty("/UserId").toUpperCase() === oData.results[i].USER.toUpperCase() &&
                                    oData.results[i].APPLICATION_NAME === "Predictions") {
                                    aData.push({
                                        "VARIANTNAME": oData.results[i].VARIANTNAME,
                                        "VARIANTID": oData.results[i].VARIANTID,
                                        "DEFAULT": oData.results[i].DEFAULT,
                                        "USER": that.oGModel.getProperty("/UserId"),
                                    });
                                }

                            }

                            if (aData.length > 0) {
                                uniqueName = aData.filter((obj, pos, arr) => {
                                    return (
                                        arr.map((mapObj) => mapObj.VARIANTNAME).indexOf(obj.VARIANTNAME) == pos
                                    );
                                });
                                that.oGModel.setProperty("/saveBtn", "");
                                for (var k = 0; k < uniqueName.length; k++) {
                                    if (uniqueName[k].DEFAULT === "Y") {
                                        var Default = uniqueName[k].VARIANTNAME;
                                        details = {
                                            "VARIANTNAME": uniqueName[k].VARIANTNAME,
                                            "VARIANTID": uniqueName[k].VARIANTID,
                                            "USER": uniqueName[k].USER,
                                            "DEFAULT": "N",
                                            // "SCOPE": uniqueName[k].SCOPE
                                        };
                                        defaultDetails.push(details);
                                        details = {};
                                    }
                                }
                            }

                            that.oGModel.setProperty("/fromFunction", "X");
                            // that.oGModel.setProperty("/defFromFunc","Y")
                            if (Default) {
                                uniqueName.unshift({
                                    "VARIANTNAME": "Standard",
                                    "VARIANTID": "0",
                                    "DEFAULT": "N",
                                    // "SCOPE": "Public"
                                })
                                that.oGModel.setProperty("/viewNames", uniqueName);
                                that.variantModel.setData({
                                    items1: uniqueName
                                });
                                that.varianNames = uniqueName;
                                that.oGModel.setProperty("/defaultDetails", defaultDetails);
                                sap.ui.getCore().byId("idMatListPS").setModel(that.variantModel);
                                sap.ui.getCore().byId("idMatListPS").removeSelections(true);
                                sap.ui.getCore().byId("varNameListPS").setModel(that.variantModel);

                                // that.byId("idVariantNamePS").setText(Default);
                                if (that.oGModel.getProperty("/newVaraintFlag") === "X") {
                                    var newVariant = that.oGModel.getProperty("/newVariant");
                                    that.handleSelectPress(newVariant[0].VARIANTNAME);
                                    that.oGModel.setProperty("/newVaraintFlag", "");
                                }
                                else {
                                    that.handleSelectPress(Default);
                                }
                            } else {
                                uniqueName.unshift({
                                    "VARIANTNAME": "Standard",
                                    "VARIANTID": "0",
                                    "DEFAULT": "Y",
                                    // "SCOPE": "Public"
                                })
                                that.oGModel.setProperty("/viewNames", uniqueName);
                                that.oGModel.setProperty("/defaultDetails", "");
                                that.viewDetails.setData({
                                    items1: uniqueName
                                });
                                that.varianNames = uniqueName;
                                sap.ui.getCore().byId("idMatListPS").setModel(that.viewDetails);
                                sap.ui.getCore().byId("idMatListPS").removeSelections(true);
                                sap.ui.getCore().byId("varNameListPS").setModel(that.viewDetails);

                                Default = "Standard";
                                if (that.oGModel.getProperty("/newVaraintFlag") === "X") {
                                    var newVariant = that.oGModel.getProperty("/newVariant");
                                    that.handleSelectPress(newVariant[0].VARIANTNAME);
                                    that.oGModel.setProperty("/newVaraintFlag", "");
                                }
                                else {
                                    that.handleSelectPress(Default);
                                }
                            }
                        }
                    },
                    error: function (oData, error) {
                        sap.m.MessageToast.show("error while loading variant details");
                        sap.ui.core.BusyIndicator.hide();
                    },
                });

                that.getOwnerComponent().getModel("oModel").read("/getVariantHeader", {
                    success: function (oData) {
                        for (var i = 0; i < oData.results.length; i++) {
                            if (oData.results[i].DEFAULT === "Y" &&
                                that.oGModel.getProperty("/UserId").toUpperCase() === oData.results[i].USER.toUpperCase() &&
                                oData.results[i].APPLICATION_NAME === "Predictions") {
                                dData.push(oData.results[i]);
                            }
                        }

                        if (dData.length > 0) {
                            that.oGModel.setProperty("/defaultVariant", dData);
                        } else {
                            that.oGModel.setProperty("/defaultVariant", "");
                        }
                    },
                    error: function (oData, error) {
                        sap.m.MessageToast.show("error while loading variant details");
                        sap.ui.core.BusyIndicator.hide();
                    },
                });


            },
            /**
             * On selection of VIEW in POPOVER fragment.
             * @param {*} oEvent 
             */
            handleSelectPress: function (oEvent) {
                that.version();
                that.onReset();
                var oLoct, oProd, oVersi, oScena, oDate, oTokens = {},
                    finalToken = [];
                var oTableItems = that.oGModel.getProperty("/variantDetails");
                // var selectedApp = oEvent;
                if (that.oGModel.getProperty("/fromFunction") === "X") {
                    that.oGModel.setProperty("/fromFunction", "");
                    var selectedApp = oEvent;
                    var listItems = sap.ui.getCore().byId("idMatListPS").getItems();
                    for (var i = 0; i < listItems.length; i++) {
                        if (listItems[i].getTitle() === oEvent) {
                            listItems[i].setSelected(true);
                        }
                    }
                    // that.byId("idVariantNamePS").setText(selectedApp);
                    that.oGModel.setProperty("/variantName", selectedApp);
                } else {
                    // var selectedApp = oEvent.getSource().getTitle();
                    var selectedApp = oEvent.getSource().getSelectedItem().getTitle();
                    // that.byId("idVariantNamePS").setText(selectedApp);
                    that.oGModel.setProperty("/variantName", selectedApp);
                }
                if (selectedApp !== "Standard") {
                    for (var i = 0; i < oTableItems.length; i++) {
                        if (selectedApp === oTableItems[i].VARIANTNAME && oTableItems[i].APPLICATION_NAME === "Predictions") {
                            if (oTableItems[i].FIELD.includes("Loc")) {
                                oLoct = oTableItems[i].VALUE;
                                that.oGModel.setProperty("/selectedLocation", oLoct);
                            }
                            else if (oTableItems[i].FIELD.includes("Prod")) {
                                oProd = oTableItems[i].VALUE;
                                that.oGModel.setProperty("/selectedProduct", oProd);
                            }
                            // else if (oTableItems[i].FIELD.includes("Prod")) {
                            //     var oItemTemplate = new sap.m.Token({
                            //         key: i,
                            //         text: oTableItems[i].VALUE
                            //     });
                            //     finalToken.push(oItemTemplate);
                            //     oItemTemplate = {};
                            // }
                            else if (oTableItems[i].FIELD.includes("Vers")) {
                                oVersi = oTableItems[i].VALUE;
                                that.oGModel.setProperty("/selectedVersion", oVersi);
                            }
                            else if (oTableItems[i].FIELD.includes("Scen")) {
                                oScena = oTableItems[i].VALUE;
                                that.oGModel.setProperty("/selectedScenario", oScena);
                            }
                        }
                    }

                    that.byId("oLocPS").setValue(oLoct);
                    that.byId("oProdPS").setValue(oProd);
                    that.byId("oVersPS").setValue(oVersi);
                    that.byId("oScenPS").setValue(oScena);
                    that.onGo();
                    that._popOver.close();
                    //  that.oGModel.setProperty("/defaultProducts", finalToken);
                    that.byId("idDropDownPS").setPressed(false);
                }
                else {
                    that.byId("idDropDownPS").setPressed(false);
                    that.byId("oProdPS").setValue("");
                    //  that.oProdList.removeSelections();
                    that.byId("oLocPS").setValue("");
                    sap.ui.getCore().byId("idSavePS").setVisible(false);
                    that._popOver.close();
                    // that.onResetDate();
                }
            },

            onAfterRendering: function () {
                that = this;
                that.skip = 0;
             
                that.deletedArray = [];
                that.oGModel = that.getOwnerComponent().getModel("oGModel");

                this.oLocPS = this.byId("oLocPS");
                this.oProd = this.byId("oProdPS");

                if (!this._manageVariant) {
                    this._manageVariant = sap.ui.xmlfragment(
                        "vcpapp.vcppredictions.view.VariantNames",
                        this
                    );
                    this.getView().addDependent(this._manageVariant);
                }
                // Function to add months to a given date
                function addMonths(date, months) {
                    const newDate = new Date(date);
                    newDate.setMonth(newDate.getMonth() + months);
                    return newDate;
                }

                // Calculate today's date and the date two months later
                const today = new Date();
                const twoMonthsLater = addMonths(today, 2);

                // Format dates to the pattern 'yyyy/MM/dd'
                const formatDate = (date) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}/${month}/${day}`;
                };

                const startDate = formatDate(today);
                const endDate = formatDate(twoMonthsLater);


                that.byId("DRS1PS").setDateValue(new Date(startDate))
                that.byId("DRS1PS").setSecondDateValue(new Date(endDate))


                this.oProdList = sap.ui.getCore().byId("prodSlctList");
                this.oLocList = sap.ui.getCore().byId("LocSlctList");
                // that.weekDate = that.getView().byId("DRS1PS");
                // that.weekDate.setMinDate(new Date());
                // var oDateL = new Date();
                // var oDateH = new Date();
                // oDateH.setMonth(oDateL.getMonth() + 2)
                // that.weekDate.setDateValue(oDateL);
                // that.weekDate.setSecondDateValue(oDateH);
                // var oModel = that.getOwnerComponent().getModel('oDataModel');
                // oModel.read('/getPredictions', {
                //     success: function (aData) {
                //         //   debugger;
                //         aResult = aData.results
                //         that.oGModel.setProperty("/oMaindata", aData.results);
                //         that.getData();
                //     },
                //     error: function (error) {
                //         console.log(error)
                //     }
                // })
                // that.ConvertedTime(that.getOwnerComponent().getModel("GLOBAL").oData.allData)

            },

  
            // onValueHelp: function () {
            //     var omodel1 = that.getOwnerComponent().getModel('oModel')
            //     omodel1.read('/genPartialProd', {
            //         success: function (aData) {
            //             that.oGModel.setProperty("/o_Prod", aData.results)
            //         },
            //         error: function (error) {
            //             console.log(error)
            //         }
            //     })
            // },

            onValueHelp: function () {
                var topCount = that.oGModel.getProperty("/MaxCount");
                that.getOwnerComponent().getModel("oModel").read("/genPartialProd", {
                    urlParameters: {
                        "$skip": that.skip,
                        "$top": topCount
                    },
                    success: function (oData) {
                        if (topCount == oData.results.length) {
                            that.skip += parseInt(topCount);
                            that.oLocat = that.oLocat.concat(oData.results);
                            that.onValueHelp();
                        } else {
                            that.skip = 0;
                            that.oLocat = that.oLocat.concat(oData.results);
                            that.oGModel.setProperty("/o_Prod", that.oLocat)
                          
                        }
                        sap.ui.core.BusyIndicator.hide();

                    },
                    error: function (err) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Error Loading Products Data");
                    }
                });
            },

            onLocation: function (oEvent) {
                that.byId("oProdPS").setValue("");
                that.byId("oVersPS").setValue("");
                that.byId("oScenPS").setValue("");

                //  that.onReset();
           //     that.onValueHelp();
                if (!that.newLocDialog) {
                    that.newLocDialog = sap.ui.xmlfragment("vcpapp.vcppredictions.view.Location", that);
                }
                var oData = that.getOwnerComponent().getModel("oGModel").getData();
                var o_Order = oData.o_Prod
                var Location = oData.o_Prod

                var o_FilterLocation = [];
                Location.forEach((item1) => {
                    if (o_Order.some((item2) => item2.LOCATION_ID === item1.LOCATION_ID
                        && item2.PRODUCT_ID === item1.PRODUCT_ID)) {
                        o_FilterLocation.push({
                            LOCATION_ID: item1.LOCATION_ID,
                            LOCATION_DESC: item1.LOCATION_DESC
                        })
                    }
                })

                var LOCATION_ID = new Set(o_FilterLocation);
                var jsonObject = [];
                jsonObject = o_FilterLocation.map(JSON.stringify);
                var uniqueSet = new Set(jsonObject);
                var uniqueArray = Array.from(uniqueSet).map(JSON.parse)
                // var oJSONModel = new sap.ui.model.json.JSONModel();
                // oJSONModel.setData({
                //     aItems: uniqueArray
                // })
                // that.locModel.setData(uniqueArray)
                // sap.ui.getCore().byId("oLocationPS").setModel(that.locModel)
                var oJSONModel = new sap.ui.model.json.JSONModel();
                oJSONModel.setData({
                    aItems: uniqueArray
                })
                //  that.locModel.setData(uniqueArray)
                sap.ui.getCore().byId("oLocationPS").setModel(oJSONModel)


                that.newLocDialog.open();
            },

            onLocationSelect: function (oEvent) {

                var oSelectedItem = oEvent.getParameter("selectedItem");
                var LocItem = that.oGModel.setProperty("/oLocItem", oSelectedItem)
                if (!oSelectedItem) {
                    return;
                }
                that.byId("oLocPS").setValue(oSelectedItem.getTitle());
                //  that.getView().byId("oLocPS").setEditable(false);
                //      that.byId("oProdPS").setValue("");
            },

            onProduct: function (oEvent) {
                count = 2;
                mergedObjects = []
                nextSetOfDates = []
                aggregatedData = [];
                that.byId("onLeftPS").setVisible(false);
                // that.byId("oLocPS").setValue("");
                that.byId("oProdPS").setValue("");
                that.byId("oVersPS").setValue("");
                that.byId("oScenPS").setValue("");
                var excel = document.querySelector("[id*=excelGridPS]").id;
                document.getElementById(excel).innerHTML = " ";
                that.byId("idSelectionPS").setSelectedKeys("")

                that.byId("oVersPS").setValue("");
                that.byId("oScenPS").setValue("");
                // that.byId("DRS1PS").setValue("");
                if (that.byId("oLocPS").getValue() === "") {
                    sap.m.MessageToast.show("Please Select Location")
                }
                else {
                    if (!that.newProdDialog) {
                        that.newProdDialog = sap.ui.xmlfragment("vcpapp.vcppredictions.view.Product", that);
                    }
                    // that.byId("DRS1PS").setValue("");

                    var excel = document.querySelector("[id*=excelGridPS]").id;
                    document.getElementById(excel).innerHTML = "";
                    var sValue1 = that.byId("oLocPS").getValue();
                    var oData = that.getOwnerComponent().getModel("oGModel").getData();
                    var o_Order = oData.o_Prod
                    var Product = oData.o_Prod

                    var o_FilterProduct = [];
                    Product.forEach((item1) => {
                        if (o_Order.some((item2) => item2.LOCATION_ID === item1.LOCATION_ID
                            && item2.PRODUCT_ID === item1.PRODUCT_ID)) {
                            o_FilterProduct.push({
                                LOCATION_ID: item1.LOCATION_ID,
                                LOCATION_DESC: item1.LOCATION_DESC,
                                PRODUCT_ID: item1.PRODUCT_ID,
                                PRODUCT_DESC: item1.PROD_DESC
                            })
                        }
                    })
                    var o_Product = [];
                    for (var i = 0; i < o_FilterProduct.length; i++) {
                        if (o_FilterProduct[i].LOCATION_ID === sValue1) {
                            o_Product.push({
                                PRODUCT_ID: o_FilterProduct[i].PRODUCT_ID,
                                PRODUCT_DESC: o_FilterProduct[i].PRODUCT_DESC
                            })
                        }
                    }

                    // var LOCATION_ID = new Set(o_Product);
                    // var jsonObject = [];
                    // jsonObject = o_Product.map(JSON.stringify);
                    // var uniqueSet = new Set(jsonObject);
                    // var uniqueArray = Array.from(uniqueSet).map(JSON.parse)
                    var oJSONModel = new sap.ui.model.json.JSONModel();
                    oJSONModel.setData({
                        aItems: o_Product
                    })
                    sap.ui.getCore().byId("oProductPS").setModel(oJSONModel)

                    that.newProdDialog.open();
                    that.version();
                }
            },

            onProductSelect: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                var ProdItem = that.oGModel.setProperty("/oProdItem", oSelectedItem)
                if (!oSelectedItem) {
                    return;
                }
                that.byId("oProdPS").setValue(oSelectedItem.getTitle());
                //     that.byId("oProdPS").setValue("");
            },

            version: function () {
                this.getView().getModel("oModel").read("/getIbpVerScn", {
                    success: function (oData) {
                        var Overs = oData.results
                        Verscena = Array.from(new Set(Overs.map(item => item.VERSION)))
                            .map(VERSION => Overs.find(item => item.VERSION === VERSION));
                        // null replaced code
                        for (var i = 0; i < Verscena.length; i++) {
                            if (Verscena[i].VERSION === null) {
                                Verscena[i].VERSION_NAME = Verscena[i].VERSION
                            }
                        }

                    },
                    error: function (oData, error) {
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageToast.show("error");
                    },
                });
            },

            onIBPVersion: function (oEvent) {
                count = 2;
                mergedObjects = []
                nextSetOfDates = []
                aggregatedData = [];
                that.byId("onLeftPS").setVisible(false);
                var excel = document.querySelector("[id*=excelGridPS]").id;
                document.getElementById(excel).innerHTML = " ";
                that.byId("idSelectionPS").setSelectedKeys("")
                that.byId("oScenPS").setValue("");
                // that.byId("DRS1PS").setValue("");
                if (that.byId("oProdPS").getValue() === "") {
                    sap.m.MessageToast.show("Please Select Product")
                }
                else {
                    if (!that.newVersionDialog) {
                        that.newVersionDialog = sap.ui.xmlfragment("vcpapp.vcppredictions.view.version", that);
                    }

                    var TFilter = []
                    var oTree = sap.ui.getCore().byId("oVersionPS")
                    var o_IbpModel = new sap.ui.model.json.JSONModel();
                    var LocItem = that.oGModel.getProperty("/oLocItem")
                    var ProdItem = that.oGModel.getProperty("/oProdItem")
                    var oFilters = [];

                    var sFilter = new sap.ui.model.Filter({
                        path: "LOCATION_ID",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: LocItem.getTitle(),
                    });
                    oFilters.push(sFilter);

                    var sFilter = new sap.ui.model.Filter({
                        path: "PRODUCT_ID",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: ProdItem.getTitle(),
                    });
                    oFilters.push(sFilter);



                    this.getView().getModel("oModel").read("/getIbpVerScn", {
                        filters: oFilters,

                        success: function (oData) {
                            var ver = oData.results
                            let uniqueArray1 = Array.from(new Set(ver.map(item => item.VERSION)))
                                .map(VERSION => ver.find(item => item.VERSION === VERSION));

                            for (var i = 0; i < uniqueArray1.length; i++) {
                                if (uniqueArray1[i].VERSION_NAME === null) {
                                    uniqueArray1[i].VERSION_NAME = uniqueArray1[i].VERSION
                                }
                            }
                            o_IbpModel.setData({
                                aItems: uniqueArray1
                            })
                            oTree.setModel(o_IbpModel)
                            that.newVersionDialog.open();

                        },
                        error: function (oData, error) {
                            sap.ui.core.BusyIndicator.hide();
                            sap.m.MessageToast.show("error");
                        },
                    });

                }
            },

            onVersionSelect: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                var VerItem = that.oGModel.setProperty("/oVerItem", oSelectedItem)
                if (!oSelectedItem) {
                    return;
                }
                that.byId("oVersPS").setValue(oSelectedItem.getTitle());
                // that.byId("oScenPS").setValue("");
            },

            onIBPScenHelpRequest: function (oEvent) {
                count = 2;
                mergedObjects = []
                nextSetOfDates = []
                aggregatedData = [];
                that.byId("onLeftPS").setVisible(false);
                // that.byId("DRS1PS").setValue("");
                var excel = document.querySelector("[id*=excelGridPS]").id;
                document.getElementById(excel).innerHTML = " ";
                that.byId("idSelectionPS").setSelectedKeys("")

                if (that.byId("oVersPS").getValue() === "") {
                    sap.m.MessageToast.show("Please Select IBP Version")
                }
                else {
                    if (!that.newScenarioDialog1) {
                        that.newScenarioDialog1 = sap.ui.xmlfragment("vcpapp.vcppredictions.view.Scenario", that);
                    }
                    var oTree1 = sap.ui.getCore().byId("oScenarioPS")
                    var o_IbpModel = new sap.ui.model.json.JSONModel();
                    var LocItem = that.oGModel.getProperty("/oLocItem")
                    var ProdItem = that.oGModel.getProperty("/oProdItem")
                    var VerItem = that.oGModel.getProperty("/oVerItem")
                    var oFilters = [];

                    var sFilter = new sap.ui.model.Filter({
                        path: "LOCATION_ID",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: LocItem.getTitle(),
                    });
                    oFilters.push(sFilter);

                    var sFilter = new sap.ui.model.Filter({
                        path: "PRODUCT_ID",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: ProdItem.getTitle(),
                    });
                    oFilters.push(sFilter);

                    var sFilter = new sap.ui.model.Filter({
                        path: "VERSION",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: VerItem.getDescription(),
                    });
                    oFilters.push(sFilter);

                    this.getView().getModel("oModel").read("/getIbpVerScn", {
                        filters: oFilters,

                        success: function (oData) {
                            var scen = oData.results
                            let uniqueArray1 = Array.from(new Set(scen.map(item => item.SCENARIO)))
                                .map(SCENARIO => scen.find(item => item.SCENARIO === SCENARIO));

                            for (var i = 0; i < uniqueArray1.length; i++) {
                                if (uniqueArray1[i].SCENARIO_NAME === null) {
                                    uniqueArray1[i].SCENARIO_NAME = uniqueArray1[i].SCENARIO
                                }
                            }
                            o_IbpModel.setData({
                                aItems: uniqueArray1
                            })
                            oTree1.setModel(o_IbpModel)
                            that.newScenarioDialog1.open();

                        },
                        error: function (oData, error) {
                            sap.ui.core.BusyIndicator.hide();
                            sap.m.MessageToast.show("error");
                        },
                    });

                    //  var TFilter = []
                    // var oTree1 = sap.ui.getCore().byId("oScenarioPS")
                    // var o_IbpModel = new sap.ui.model.json.JSONModel();
                    // let uniqueArray1 = Array.from(new Set(Verscena.map(item => item.SCENARIO)))
                    //     .map(SCENARIO => Verscena.find(item => item.SCENARIO === SCENARIO));

                    // for (var i = 0; i < uniqueArray1.length; i++) {
                    //     if (uniqueArray1[i].SCENARIO_NAME === null) {
                    //         uniqueArray1[i].SCENARIO_NAME = uniqueArray1[i].SCENARIO
                    //     }
                    // }
                    // o_IbpModel.setData({
                    //     aItems: uniqueArray1
                    // })
                    // oTree1.setModel(o_IbpModel)


                    // that.newScenarioDialog1.open();
                }
            },

            onScenarioSelect: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (!oSelectedItem) {
                    return;
                }
                that.byId("oScenPS").setValue(oSelectedItem.getTitle());
                //   that.byId("oScenPS").setValue("");
            },


                      /**
            * Closing the VariantNames fragment
            */
                      handleManageClose: function () {
                        sap.ui.getCore().byId("_IDGenSearchField1PS").setValue();
                        if (this._manageVariant) {
                            that._manageVariant.destroy(true);
                            that._manageVariant = "";
                            that.oGModel.setProperty('/deletedFlag', "X");
                        }
                    },
                    /**
                    * Deleting the selected view in VariantNames fragment
                    */
                    onViewDelete: function (oEvent) {
                        var details = {};
                        var deletedItem = parseInt(oEvent.getSource().getParent().getCells()[3].getText());
                        var deletedItemName = oEvent.getSource().getParent().getCells()[0].getText();
                        details = {
                            ID: deletedItem,
                            NAME: deletedItemName
                        }
                        that.deletedArray.push(details);
                        details = {};
                        var selectedItem = oEvent.getSource().getParent();
                        var source = sap.ui.getCore().byId("varNameListPS");
                        // source.removeItem(selectedItem);
                        that.oGModel.setProperty('/deletedFlag', "X");
                        sap.ui.getCore().byId("_IDGenSearchField1PS").setValue("");
        
                        var arr = []
                        for (var i = 0; i < that.varianNames.length; i++) {
                            if (that.varianNames[i].VARIANTNAME != selectedItem.getCells()[0].getText()) {
                                arr.push(that.varianNames[i])
                            }
                        }
                        var onModel = new JSONModel();
                        that.emptyModel = new JSONModel([]);
                        onModel.setData({ items1: arr });
                        source.setModel(onModel);
                    },
                    /**
                       /**
                     * Opening the VariantNames fragment on press of "Manage" in popover fragment
                     * @param {*} oEvent 
                     */
                    onManageOpen: function (oEvent) {
                        that.getData();
                        that.onAfterRendering();
                        that._popOver.close();
                        that.byId("idDropDownPS").setPressed(false);
                        if (that.oGModel.getProperty("/deletedFlag") === "X") {
                            if (!this._manageVariant) {
                                this._manageVariant = sap.ui.xmlfragment(
                                    "vcpapp.vcppredictions.view.VariantNames",
                                    this
                                );
                                this.getView().addDependent(this._manageVariant);
                            }
                            that.newModel = new sap.ui.model.json.JSONModel();
                            that.emptyModel = new sap.ui.model.json.JSONModel([]);
                            // sap.ui.getCore().byId("varNameListPS").destroyItems();
                            that.newModel.setData({ items1: that.varianNames });
                            sap.ui.getCore().byId("varNameListPS").setModel(that.newModel);
                            that._manageVariant.open();
                            that.oGModel.setProperty('/deletedFlag', "");
                            that.deletedArray = [];
                        }
                        else {
                            this._manageVariant.open();
                        }
                    },
                    /**
                   * Saving the public/private property on click of save in VariantNames fragment. 
                   */
                    onManage: function () {
                        var newSelection = {};
                        var newDefault = [];
                        var initalDetails = that.oGModel.getProperty("/defaultVariant");
                        var oTable = sap.ui.getCore().byId("varNameListPS").getItems();
                        if (that.deletedArray.length > 0) {
                            that.deleteVariant();
        
                        }
        
                        for (var i = 0; i < oTable.length; i++) {
                            if (oTable[i].getCells()[1].getSelected()) {
                                newSelection.VARIANTID = (oTable[i].getCells()[3].getText());
                                newSelection.VARIANTNAME = oTable[i].getCells()[0].getText();
                                newSelection.DEFAULT = "Y";
                                newDefault.push(newSelection);
                                newSelection = {};
                                break;
                            }
                        }
                        if (newDefault.length === 0) {
                            newSelection.VARIANTID = (oTable[0].getCells()[3].getText());
                            newSelection.VARIANTNAME = oTable[0].getCells()[0].getText();
                            newSelection.DEFAULT = "Y";
                            newDefault.push(newSelection);
                            newSelection = {};
                        }
                        if (initalDetails.length > 0) {
                            if (parseInt(newDefault[0].VARIANTID) === initalDetails[0].VARIANTID) {
                                // MessageToast.show("Updated Successfully");
                                that.handleManageClose();
                            } else if (newDefault[0].VARIANTNAME === "Standard") {
                                for (i in initalDetails) {
                                    initalDetails[i].DEFAULT = "N"
                                }
                                that.getModel("oModel").callFunction("/updateVariant", {
                                    method: "GET",
                                    urlParameters: {
                                        VARDATA: JSON.stringify(initalDetails)
                                    },
                                    success: function (oData) {
                                        // MessageToast.show("Updated Successfully");
                                        that.handleManageClose();
                                        that.onAfterRendering();
                                        // MessageToast.show(oData);
                                    },
                                    error: function (error) {
                                        sap.m.MessageToast.show("Failed to update variant");
                                    },
                                });
                            } else {
        
                                that.getModel("oModel").callFunction("/updateVariant", {
                                    method: "GET",
                                    urlParameters: {
                                        VARDATA: JSON.stringify(newDefault)
                                    },
                                    success: function (oData) {
                                        // sap.m.MessageToast.show("Updated Successfully");
                                        that.handleManageClose();
                                        that.onAfterRendering();
                                        // sap.m.MessageToast.show(oData);
                                    },
                                    error: function (error) {
                                        sap.m.MessageToast.show("Failed to update variant");
                                    },
                                });
                                for (i in initalDetails) {
                                    initalDetails[i].DEFAULT = "N"
                                }
                                that.getModel("oModel").callFunction("/updateVariant", {
                                    method: "GET",
                                    urlParameters: {
                                        VARDATA: JSON.stringify(initalDetails)
                                    },
                                    success: function (oData) {
                                        // sap.m.MessageToast.show("Updated Successfully");
                                        that.handleManageClose();
                                        that.onAfterRendering();
                                        // sap.m.MessageToast.show(oData);
                                    },
                                    error: function (error) {
                                        sap.m.MessageToast.show("Failed to update variant");
                                    },
                                });
        
                            }
                        } else {
                            that.getOwnerComponent().getModel("oModel").callFunction("/updateVariant", {
                                method: "GET",
                                urlParameters: {
                                    VARDATA: JSON.stringify(newDefault)
                                },
                                success: function (oData) {
                                    // sap.m.MessageToast.show("Updated Successfully");
                                    that.handleManageClose();
                                    that.onAfterRendering();
                                    // sap.m.MessageToast.show(oData);
                                },
                                error: function (error) {
                                    sap.m.MessageToast.show("Failed to update variant");
                                },
                            });
                        }
        
                    },
        

            // ongo
            handleChange: function () {
                count = 2;
                mergedObjects = []
                nextSetOfDates = []
                aggregatedData = [];
                // that.byId("onLeftPS").setVisible(false);
                var excel = document.querySelector("[id*=excelGridPS]").id;
                document.getElementById(excel).innerHTML = " ";
                that.byId("idSelectionPS").setSelectedKeys("")
            },

            ///fetching overall data
            fetch: function (allData) {
                var that = this;
                var oModel = that.getOwnerComponent().getModel('oDataModel');
                var pageSize = 900; // Set your desired page size
                var skip = 0; // Initial skip value
                var allData = [];
                function fetchData() {
                    sap.ui.core.BusyIndicator.show();
                    oModel.read('/getPredictions', {
                        urlParameters: {
                            $top: pageSize,
                            $skip: skip
                        },
                        success: function (aData) {
                            var aResult = aData.results;

                            if (aResult.length > 0) {
                                allData = allData.concat(aResult);
                                skip += pageSize;
                                fetchData();

                                var oGblModel = that.getOwnerComponent().getModel("GLOBAL")
                                oGblModel.setData({
                                    allData
                                })
                            }

                            else {
                                if (aResult.length == 0) {
                                    // sap.ui.core.BusyIndicator.show()
                                    that.ConvertedTime(allData)
                                    sap.ui.core.BusyIndicator.hide()
                                }
                            }


                        },
                        error: function (error) {
                            console.log(error);
                        }
                    });
                }
                fetchData();
            },

            //Function to get Mondays of next 8 weeks
            getMondays: function () {
                var startDate = new Date();
                var endDate = new Date();
                endDate.setMonth(endDate.getMonth() + 2);
                var mondays = [];
                while (startDate <= endDate) {
                    if (startDate.getDay() === 1) { // Monday
                        var formattedDate = that.convertDate(startDate, "-");
                        mondays.push(formattedDate);
                    }
                    startDate.setDate(startDate.getDate() + 1);
                }
                return mondays;
            },
            //Function to Convert date in dd-mm-yyyy format based on joinby
            convertDate: function (inputFormat, joinBy) {
                function pad(s) {
                    return (s < 10) ? '0' + s : s;
                }
                var d = new Date(inputFormat)
                return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join(joinBy)
            },

            onDateRangeChange: function (oEvent) {

                //  var oDateRangeSelection = oEvent.getSource();
                if (oEvent) {
                    that.count = 0;
                }
                var oStartDate = that.byId("DRS1PS").getDateValue() //oDateRangeSelection.getDateValue();
                var oEndDate = that.byId("DRS1PS").getSecondDateValue() //oDateRangeSelection.getSecondDateValue();
                var aAllDates = [];
                var oStartDateInstance = new Date(oStartDate);
                var oCurrentDate = oStartDateInstance;
                while (oCurrentDate <= oEndDate) {
                    if (oCurrentDate.getDay() === 1) {
                        var weekNum = that.convertDate(oCurrentDate, "-");
                        aAllDates.push(weekNum);
                    }
                    oCurrentDate.setDate(oCurrentDate.getDate() + 1);
                }
                that.mondays = aAllDates;
            },


            onGo: function () {
                that.onDateRangeChange();
                var oModel = that.getOwnerComponent().getModel('oDataModel');
                var pageSize = 900; // Set your desired page size
                var skip = 0; //
                if (that.byId("oLocPS").getValue() === "") {
                    sap.m.MessageToast.show("Please Select Location")
                    return false;
                }
                if (that.byId("oProdPS").getValue() === "") {
                    sap.m.MessageToast.show("Please Select Product")
                    return false;
                }
                if (that.byId("oVersPS").getValue() === "") {
                    sap.m.MessageToast.show("Please Select Version")
                    return false;
                }
                if (that.byId("oScenPS").getValue() === "") {
                    sap.m.MessageToast.show("Please Select Scenario")
                    return false;
                }
                if (that.byId("DRS1PS").getValue() === "") {
                    sap.m.MessageToast.show("No Dates are Selected")
                    return false;
                }
                // var excel = document.querySelector("[id*=excelGridPS]").id;
                // document.getElementById(excel).innerHTML = " ";
                // that.byId("onLeftPS").setVisible(true);
                // that.byId("onLeftPS").setEnabled(true);

                var LI = that.byId("oLocPS").getValue();
                var CP = that.byId("oProdPS").getValue();
                var IBPV = that.byId("oVersPS").getValue();

                //  var IBPS = that.byId("oScenPS").getValue();
                for (var i = 0; i < Verscena.length; i++) {
                    var IBPPS = that.byId("oVersPS").getValue();
                    if (IBPPS === Verscena[i].VERSION_NAME) {
                        var IBPV = Verscena[i].VERSION
                        break;
                    }
                }

                for (var n = 0; n < Verscena.length; n++) {
                    var IBPPV = that.byId("oScenPS").getValue();
                    if (IBPPV === Verscena[n].SCENARIO_NAME) {
                        var IBPS = Verscena[n].SCENARIO
                        break;
                    }
                }
                var dateId1 = that.byId("DRS1PS").getDateValue();
                var DateId2 = that.byId("DRS1PS").getSecondDateValue();
                var dArray = []
                while (DateId2 > dateId1) {
                    var newd1 = new Date(dateId1.setDate(dateId1.getDate() + 1))
                    dArray.push(newd1);
                }
                dateId1.setDate(dateId1.getDate() - dArray.length);
                dArray.pop()
                dArray.splice(0, 0, dateId1)
                var afrm1 = []
                Week = []
                var idModelVer = that.byId("idModelVerPS").getSelectedKey()
                var mondays = that.mondays;

                this.totalPages = Math.ceil(mondays.length / 8);
                //  var filters = that.getFilters();
                that.dynamicDates = mondays.slice(0, 8); // Get dates for the first page (first 8 weeks)
                this.currentPage = that.count;
                var startIndex = this.currentPage * 8;
                var endIndex = Math.min(startIndex + 8, mondays.length);
                that.startIndex = startIndex;
                that.endIndex = endIndex
                that.dynamicDates = mondays.slice(startIndex, endIndex);
                var vFromDate = that.dynamicDates[0]; //this.byId("DRS1PS").getDateValue();
                var vToDate = that.dynamicDates[that.dynamicDates.length - 1]; //this.byId("DRS1PS").getSecondDateValue();
                oModel.read('/getPredictions', {
                    filters: [
                        new Filter(
                            "LOCATION_ID",
                            FilterOperator.EQ,
                            LI

                        ),
                        new Filter(
                            "PRODUCT_ID",
                            FilterOperator.EQ,
                            CP

                        ),
                        new Filter(
                            "VERSION",
                            FilterOperator.EQ,
                            IBPV

                        ),
                        new Filter(
                            "SCENARIO",
                            FilterOperator.EQ,
                            IBPS

                        ),
                        new Filter(
                            "MODEL_VERSION",
                            FilterOperator.EQ,
                            idModelVer

                        ),
                        new Filter(
                            "CAL_DATE",
                            FilterOperator.BT,
                            vFromDate,
                            vToDate

                        ),
                    ],
                    success: function (aData) {
                        that.ConvertedTime(aData.results)
                        that.oMianData = aData.results
                        sap.ui.core.BusyIndicator.hide();
                        if (that.oMianData.length === 0) {
                            sap.m.MessageToast.show("No more data")
                            that.byId("onLeftPS").setVisible(false)
                            return false;
                        }
                        that.oMainFunc();
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });


            },

            oMainFunc: function () {
                var dArray = []
                var dateId1 = that.oMianData[0].CAL_DATE
                var DateId2 = that.oMianData.length - 1
                while (that.oMianData[DateId2].CAL_DATE >= that.oMianData[0].CAL_DATE) {
                    var newd1 = new Date(that.oMianData[0].CAL_DATE.setDate(that.oMianData[0].CAL_DATE.getDate() + 1))
                    dArray.push(newd1);
                }
                dateId1.setDate(dateId1.getDate() - dArray.length);
                dArray.pop()
                dArray.splice(0, 0, dateId1)
                var afrm1 = []
                Week = []
                for (var i = 0; i < dArray.length; i++) {
                    if (dArray[i].toDateString().split(" ")[0] === "Mon") {
                        afrm1.push(dArray[i])
                        Week.push(dArray[i])
                    }
                }
                var LI = that.byId("oLocPS").getValue(),
                    CP = that.byId("oProdPS").getValue()

                for (var i = 0; i < Verscena.length; i++) {
                    var IBPPS = that.byId("oVersPS").getValue();
                    if (IBPPS === Verscena[i].VERSION_NAME) {
                        var IBPV = Verscena[i].VERSION
                        break;
                    }
                }

                for (var n = 0; n < Verscena.length; n++) {
                    var IBPPV = that.byId("oScenPS").getValue();
                    if (IBPPV === Verscena[n].SCENARIO_NAME) {
                        var IBPS = Verscena[n].SCENARIO
                        break;
                    }
                }

                if (LI === "" || CP === "" || IBPV === "" || IBPS === "") {
                    sap.m.MessageToast.show("Please Select mandatory fields")
                }
                else {
                    var oAllData = that.oMianData //that.getOwnerComponent().getModel("GLOBAL").oData.allData
                    // that.ConvertedTime(oAllData);
                    if (oAllData.length) {
                        var o_Predictions = that.oGModel.getData().o_Prod
                        var oD = [];
                        o_Predictions.forEach((item1) => {
                            //   Orders.forEach((item1) => {
                            if (oAllData.some((item2) => item2.LOCATION_ID === item1.LOCATION_ID
                                && item2.PRODUCT_ID === item1.PRODUCT_ID)) {
                                oD.push({
                                    LOCATION_ID: item1.LOCATION_ID,
                                    LOCATION_DESC: item1.LOCATION_DESC,
                                    PRODUCT_ID: item1.PRODUCT_ID,
                                    PROD_DESC: item1.PROD_DESC
                                })
                            }
                        })
                        var cDArray = [];
                        for (var i = 0; i < oAllData.length; i++) {
                            var number = oAllData[i].PREDICTED
                            const numStr = number.toString();
                            const regex = /-\d+(\.\d+)?/g;
                            if (number === 0) {
                                oAllData[i].PREDICTED = number;
                                cDArray.push(oAllData[i])
                            }
                            if (numStr.includes('.')) {
                                // Split the string at the decimal point
                                const parts = numStr.split('.');
                                if (parts[1].length > 3) {
                                    if (number.startsWith('-')) {
                                        var pred = oAllData[i].PREDICTED.match(regex)[0]
                                        oAllData[i].PREDICTED = pred;
                                        cDArray.push(oAllData[i])
                                    }
                                    else if (!number.startsWith('-')) {
                                        // Return the length of the second part
                                        var pred = oAllData[i].PREDICTED.match(/^(\d+\.\d{3})/)[0]
                                        // var pred = parseFloat(oAllData[i].PREDICTED).toFixed(3)
                                        oAllData[i].PREDICTED = pred;
                                        cDArray.push(oAllData[i])
                                    }
                                    else {
                                        var pred = oAllData[i].PREDICTED
                                        oAllData[i].PREDICTED = pred;
                                        cDArray.push(oAllData[i])
                                    }
                                }
                                else {
                                    var pred = oAllData[i].PREDICTED
                                    oAllData[i].PREDICTED = pred;
                                    cDArray.push(oAllData[i])
                                }
                            }
                            else {
                                var pred = oAllData[i].PREDICTED
                                oAllData[i].PREDICTED = pred;
                                cDArray.push(oAllData[i])
                            }
                        }
                        for (var j = 0; j < afrm1.length; j++) {
                            afrm1[j] = afrm1[j].toLocaleDateString("en-GB").split("/").join("-")
                        }
                        afrm1 = afrm1.slice(0, 8)
                        var modifiedDates = [...afrm1];

                        var setOfDates = []
                        if (count > 2) {
                            for (var i = 0; i < nextSetOfDates.length; i++) {
                                setOfDates.push(nextSetOfDates[i].toLocaleDateString("en-GB").split("/").join("-"))
                            }
                            modifiedDates = setOfDates
                        }
                        if (Week.length == nextSetOfDates.length) {
                            that.byId("onLeftPS").setVisible(false);
                            // that.byId("onLeftPS").setEnabled(false);
                        }
                        else {
                            that.byId("onLeftPS").setVisible(true);
                            // that.byId("onLeftPS").setEnabled(true);
                        }
                        // var modifiedDates = [...afrm1];
                        var aBind = cDArray;
                        var idModelVer = that.byId("idModelVerPS").getSelectedKey()
                        that.oCompareSuccess = cDArray
                        var aDis = []
                        var Non_Week = [];
                        //  var aDup = ["Location", "Location_Desc", "Product", "Product_Desc", "ModelProfile", "Predicted Time", "Opt Algorithm"]
                        var aDup = ["Location", "Location_Desc", "Product", "Product_Desc", "ModelProfile", "Predicted Time", "Opt Algorithm"]
                        var aDate = []
                        var DOC = ["Location", "Location_Desc", "Product", "Product_Desc", "ModelProfile", "Predicted Time", "Opt Algorithm"]
                        for (var i = 0; i < modifiedDates.length; i++) {
                            for (var j = 0; j < cDArray.length; j++) {
                                var date = aBind[j].CAL_DATE.toLocaleDateString("en-GB").replaceAll("/", "-")
                                var pdate = aBind[j].PREDICTED_TIME.toLocaleString("en-GB").replaceAll("/", "-")
                                var PRE_OPTIMIZED_TIME = aBind[j].PRE_OPTIMIZED_TIME.toLocaleString("en-GB").replaceAll("/", "-")

                                // if(i < 8){
                                if (date == modifiedDates[i] && aBind[j].LOCATION_ID == LI && aBind[j].PRODUCT_ID == CP && aBind[j].VERSION == IBPV && aBind[j].SCENARIO == IBPS && aBind[j].MODEL_VERSION == idModelVer) {
                                    Non_Week.push(aBind[j].CAL_DATE)
                                    DOC.push(date)
                                    aDis.push({
                                        LOCATION_ID: aBind[j].LOCATION_ID,
                                        LOCATION_DESC: aBind[j].LOCATION_DESC,
                                        PRODUCT_ID: aBind[j].PRODUCT_ID,
                                        PRODUCT_DESC: aBind[j].PROD_DESC,
                                        MODEL_PROFILE: aBind[j].MODEL_PROFILE,
                                        PREDICTED: aBind[j].PREDICTED,

                                        PREDICTED_TIME: pdate,
                                        // PRE_OPTIMIZED_TIME: PRE_OPTIMIZED_TIME,
                                        OPT_ALGORITHM: aBind[j].OPT_ALGORITHM,
                                        OBJ_COUNTER: aBind[j].OBJ_COUNTER,
                                        OBJ_DEP: aBind[j].OBJ_DEP,
                                        OBJ_TYPE: aBind[j].OBJ_TYPE,
                                        CAL_DATE: date


                                        //    PREDICTED_STATUS: aBind[j].PREDICTED_STATUS
                                    })
                                    aDate.push({
                                        LOCATION_ID: aBind[j].LOCATION_ID,
                                        LOCATION_DESC: aBind[j].LOCATION_DESC,
                                        PRODUCT_ID: aBind[j].PRODUCT_ID,
                                        PRODUCT_DESC: aBind[j].PROD_DESC,
                                        // CLASS_NAME: Orders[j].CLASS_NAME,
                                        MODEL_PROFILE: aBind[j].MODEL_PROFILE,
                                        PREDICTED_TIME: pdate,
                                        // PRE_OPTIMIZED_TIME: PRE_OPTIMIZED_TIME,
                                        OPT_ALGORITHM: aBind[j].OPT_ALGORITHM,
                                        OBJ_COUNTER: aBind[j].OBJ_COUNTER,
                                        OBJ_DEP: aBind[j].OBJ_DEP,
                                        OBJ_TYPE: aBind[j].OBJ_TYPE,
                                        PREDICTED: aBind[j].PREDICTED,
                                        CAL_DATE: date

                                        //  PREDICTED_STATUS: aBind[j].PREDICTED_STATUS
                                    })
                                }
                            }
                        }
                        for (var i = 0; i < aDis.length; i++) {
                            for (var j = 0; j < oD.length; j++) {
                                if (aDis[i].LOCATION_ID === oD[j].LOCATION_ID && aDis[i].PRODUCT_ID === oD[j].PRODUCT_ID) {
                                    aDis[i].LOCATION_DESC = oD[j].LOCATION_DESC
                                    aDis[i].PRODUCT_DESC = oD[j].PROD_DESC
                                }
                            }
                        }
                        for (var j = 0; j < aDate.length; j++) {
                            for (var i = 0; i < oD.length; i++) {
                                if (aDate[j].LOCATION_ID === oD[i].LOCATION_ID && aDate[j].PRODUCT_ID === oD[i].PRODUCT_ID) {
                                    aDate[j].LOCATION_DESC = oD[i].LOCATION_DESC
                                    aDate[j].PRODUCT_DESC = oD[i].PROD_DESC
                                }
                            }
                        }
                        var UniWeek = {};
                        var NOC = Non_Week.filter(function (key) {
                            if (!UniWeek[key]) {
                                UniWeek[key] = true;
                                return true;
                            }
                            return false;
                        });
                        var aLong = (aDup.concat(modifiedDates))
                        var UniDuple = {};
                        var WOC = DOC.filter(function (key) {
                            if (!UniDuple[key]) {
                                UniDuple[key] = true;
                                return true;
                            }
                            return false;
                        });
                        var UniDup = {};
                        var suncrete = aDis.filter(function (item) {
                            var key = item.PRODUCT_ID + item.LOCATION_ID +
                                item.LOCATION_DESC +
                                item.PRODUCT_DESC +
                                item.MODEL_PROFILE +
                                item.PREDICTED_TIME +
                                item.PRE_OPTIMIZED_TIME +
                                item.OPT_ALGORITHM +
                                item.OBJ_COUNTER +
                                item.OBJ_DEP +
                                item.OBJ_TYPE +
                                item.CAL_DATE;
                            if (!UniDup[key]) {
                                UniDup[key] = true;
                                return true;
                            }
                            return false;
                        });
                        var UniSing = {};
                        var discrete = aDate.filter(function (item) {
                            var key = item.PRODUCT_ID + item.LOCATION_ID +
                                item.LOCATION_DESC +
                                item.PRODUCT_DESC +
                                item.MODEL_PROFILE +
                                item.PREDICTED_TIME +
                                item.PRE_OPTIMIZED_TIME +
                                item.OPT_ALGORITHM +
                                item.OBJ_COUNTER +
                                item.OBJ_DEP +
                                item.OBJ_TYPE +
                                item.CAL_DATE;
                            ;
                            if (!UniSing[key]) {
                                UniSing[key] = true;
                                return true;
                            }
                            return false;
                        });
                        for (var i = 0; i < suncrete.length; i++) {
                            if (suncrete[i].PREDICTED) {
                                delete suncrete[i].PREDICTED;
                                delete suncrete[i].CAL_DATE
                            }
                        }
                        //Selecting Zeros & non-Zeros
                        if (that.byId("chkboxPS").getSelected() === false) {
                            var excel = document.querySelector("[id*=excelGridPS]").id;
                            document.getElementById(excel).innerHTML = " ";
                            for (var i = 0; i < suncrete.length; i++) {
                                for (var l = 10; l < aLong.length; l++) {
                                    suncrete[i][aLong[l]] = null;
                                }
                            }
                            for (var i = 0; i < discrete.length; i++) {
                                for (var j = 10; j < Object.keys(suncrete[i]).length; j++) {
                                    var key = Object.keys(suncrete[i])[j];
                                    if (key === discrete[i].CAL_DATE) {
                                        suncrete[i][key] = discrete[i].PREDICTED;
                                    } else {
                                        suncrete[i][key] = 0;
                                    }
                                }
                            }
                        }
                        else {
                            var excel = document.querySelector("[id*=excelGridPS]").id;
                            document.getElementById(excel).innerHTML = " ";
                            for (var i = 0; i < suncrete.length; i++) {
                                for (var l = 7; l < WOC.length; l++) {
                                    suncrete[i][WOC[l]] = null;
                                }
                            }
                            for (var i = 0; i < suncrete.length; i++) {
                                if (suncrete[i].PREDICTED) {
                                    delete suncrete[i].PREDICTED;
                                    delete suncrete[i].CAL_DATE
                                }
                            }
                            for (var i = 0; i < suncrete.length; i++) {
                                for (var l = 7; l < WOC.length; l++) {
                                    suncrete[i][WOC[l]] = null;
                                }
                            }
                            for (var i = 0; i < discrete.length; i++) {
                                for (var j = 10; j < Object.keys(suncrete[i]).length; j++) {
                                    var key = Object.keys(suncrete[i])[j];
                                    if (key === discrete[i].CAL_DATE) {
                                        suncrete[i][key] = discrete[i].PREDICTED
                                    } else {
                                        suncrete[i][key] = 0;
                                    }
                                }
                            }
                        }
                        aggregatedData = {};
                        that.aTableDownLoad = {};
                        for (var i = 0; i < suncrete.length; i++) {
                            var obj = suncrete[i];

                            // var key = obj.MODEL_PROFILE + obj.OBJ_COUNTER + obj.PRODUCT_ID + obj.LOCATION_ID +
                            //     obj.OBJ_DEP + obj.OBJ_TYPE + obj.OPT_ALGORITHM

                                var key = obj.MODEL_PROFILE + obj.OBJ_COUNTER + obj.PRODUCT_ID + obj.LOCATION_ID +
                                obj.OBJ_DEP + obj.OBJ_TYPE 

                            // var key = result.replace(/[\s,]/g, '');
                            if (!aggregatedData[key]) {

                                aggregatedData[key] = {
                                    ...obj
                                };
                                that.aTableDownLoad[key] = {
                                    ...obj
                                };
                            }
                            if (that.byId("AlgorithmPS").getSelected() === true) {
                                for (var date in obj) {
                                    // if (date !== "MODEL_PROFILE" && date !== "OBJ_COUNTER" && date !== "PRODUCT_ID" &&
                                    //     date !== "LOCATION_ID" && date !== "OBJ_DEP" && date !== "OBJ_TYPE" && date !== "PREDICTED_TIME" && date !== "OPT_ALGORITHM") {

                                    if ( date !== "OBJ_COUNTER" && date !== "PRODUCT_ID" &&
                                        date !== "LOCATION_ID" && date !== "OBJ_DEP" && date !== "OBJ_TYPE"){
                                        if (!aggregatedData[key][date]) {
                                            aggregatedData[key][date] = "0";
                                            that.aTableDownLoad[key][date] = "0";
                                        }

                                        if (obj[date] > 0 || obj[date] < 0) {
                                            // Example property value
                                            // var predictedTime = obj.PREDICTED_TIME; // "Sep 16, 2024, 2:27:39 PM"

                                            // // Split the string by the comma and get the second part
                                            // var timePart = predictedTime.split(',')[2].trim();

                                            // // Show the result
                                            // //   console.log(timePart); // Outputs: "2:27:39 PM"

                                            aggregatedData[key][date] = obj[date] + "\n" + obj.OPT_ALGORITHM + "\n" + obj.PREDICTED_TIME;
                                            that.aTableDownLoad[key][date] = obj[date];

                                            // Add color based on OPT_ALGORITHM
                                            //    aggregatedData[key][date + "_Color"] = that.getColorForAlgorithm(obj.OPT_ALGORITHM);
                                        }
                                    }
                                }
                            } else {
                                for (var date in obj) {
                                    if (date !== "MODEL_PROFILE" && date !== "OBJ_COUNTER" && date !== "PRODUCT_ID" &&
                                        date !== "LOCATION_ID" && date !== "OBJ_DEP" && date !== "OBJ_TYPE" && date !== "PREDICTED_TIME" && date !== "OPT_ALGORITHM") {
                                        if (!aggregatedData[key][date]) {
                                            aggregatedData[key][date] = parseInt(0);
                                            that.aTableDownLoad[key][date] = parseInt(0);
                                        }
                                        if (obj[date] > 0) {
                                            aggregatedData[key][date] = obj[date]
                                            that.aTableDownLoad[key][date] = obj[date];
                                        }
                                        // aggregatedData[key][date] = obj[date];
                                    }
                                }
                            }

                        }

                        // if (mergedObjects) {
                        console.log(that.aTableDownLoad)

                        var aKey = []

                        var aFilD = ["Location", "Product", "ModelProfile"];
                        var aLCOl = ["Location", "Product", "ModelProfile"];
                        for (var j = 0; j < that.byId("idSelectionPS").getSelectedItems().length; j++) {
                            aKey.push(that.byId("idSelectionPS").getSelectedItems()[j].mProperties.key)
                        }
                        // that.aDown = Object.values(aggregatedData)
                        var mergedObjects = Object.values(aggregatedData);
                        for (var i = 0; i < mergedObjects.length; i++) {
                            if (that.byId("idSelectionPS").getSelectedItems().length > 0) {
                                var select = that.byId("idSelectionPS").getSelectedItems()
                                if (that.byId("idSelectionPS").getSelectedItems().length === 3) {
                                    aLCOl.push("Obj Counter");
                                    aLCOl.push("ObjDep");
                                    aLCOl.push("ObjType");
                                }
                                else if (that.byId("idSelectionPS").getSelectedItems().length == 2) {
                                    if (that.byId("idSelectionPS").getSelectedItems().length == 2) {
                                        if ((aKey[0] == "1" && aKey[1] == "2") || (aKey[0] == "2" && aKey[1] == "1")) {
                                            aLCOl.push("Obj Counter")
                                            aLCOl.push("ObjDep")
                                            delete mergedObjects[i].OBJ_TYPE
                                        }
                                        else if ((aKey[0] == "2" && aKey[1] == "3") || (aKey[0] == "3" && aKey[1] == "2")) {
                                            aLCOl.push("ObjDep")
                                            aLCOl.push("ObjType")
                                            delete mergedObjects[i].OBJ_COUNTER
                                        }
                                        else if ((aKey[0] == "1") && (aKey[1] == "3") || (aKey[0] == "3") && (aKey[1] == "1")) {
                                            aLCOl.push("Obj Counter")
                                            aLCOl.push("ObjType")
                                            delete mergedObjects[i].OBJ_DEP
                                        }
                                        else {
                                            aLCOl.push("ObjDep")
                                            aLCOl.push("ObjType")
                                            delete mergedObjects[i].OBJ_COUNTER
                                        }

                                    }
                                }
                                else {
                                    if (that.byId("idSelectionPS").getSelectedItems()[0].mProperties.text == "OBJ_COUNTER"
                                    ) {
                                        //   aLCOl.push("Obj Counter")
                                        aLCOl.push("OBJ_COUNTER")
                                        delete mergedObjects[i].OBJ_DEP
                                        delete mergedObjects[i].OBJ_TYPE
                                    }
                                    else if (that.byId("idSelectionPS").getSelectedItems()[0].mProperties.text == "OBJ_TYPE") {
                                        aLCOl.push("OBJ_TYPE")
                                        delete mergedObjects[i].OBJ_COUNTER
                                        delete mergedObjects[i].OBJ_DEP
                                    }
                                    else if (that.byId("idSelectionPS").getSelectedItems()[0].mProperties.text == "OBJ_DEP"
                                        || that.byId("idSelectionPS").getSelectedItems()[1].mProperties.text == "OBJ_DEP") {
                                        aLCOl.push("OBJ_DEP")
                                        delete mergedObjects[i].OBJ_COUNTER
                                        delete mergedObjects[i].OBJ_TYPE
                                    }
                                    else if (
                                        that.byId("idSelectionPS").getSelectedItems()[1].mProperties.text == "OBJ_TYPE" ||
                                        that.byId("idSelectionPS").getSelectedItems()[2].mProperties.text == "OBJ_TYPE") {
                                        aLCOl.push("OBJ_TYPE")
                                        delete mergedObjects[i].OBJ_COUNTER
                                        delete mergedObjects[i].OBJ_DEP
                                    }
                                }

                            }
                            else {
                                delete mergedObjects[i].OBJ_COUNTER;
                                delete mergedObjects[i].OBJ_TYPE
                                delete mergedObjects[i].OBJ_DEP;
                            }
                        }


                        for (var i = 0; i < mergedObjects.length; i++) {
                            var Obj = mergedObjects[i]
                            Obj.PRODUCT_ID = Obj.PRODUCT_ID + "\n" + Obj.PRODUCT_DESC;
                            Obj.LOCATION_ID = Obj.LOCATION_ID + "\n" + Obj.LOCATION_DESC;
                            // var predictedTime = obj.PREDICTED_TIME; // "Sep 16, 2024, 2:27:39 PM"

                            // // Split the string by the comma
                            // var parts = predictedTime.split(',');

                            // // Join the first two parts with a comma, ensuring to trim any leading/trailing spaces
                            // var datePart = parts.slice(0, 2).join(',').trim();
                            // Obj.PREDICTED_TIME = datePart

                            delete Obj.PRODUCT_DESC;
                            delete Obj.LOCATION_DESC;
                            delete Obj.PREDICTED_TIME;
                            delete Obj.OPT_ALGORITHM

                        }


                        var aCOLs = {};
                        var aLCOl = aLCOl.filter(function (key) {
                            if (!aCOLs[key]) {
                                aCOLs[key] = true;
                                return true;
                            }
                            return false;
                        });
                        //   aLCOl.push("Predicted Time")
                        if (mergedObjects.length > 0) {
                            that.byId("idDownloadPS").setVisible(true)
                            // that.byId("onLeftPS").setVisible(true);
                            if (NOC !== undefined) {
                                if (that.byId("chkboxPS").getSelected() === true) {

                                    for (var i = 0; i < NOC.length; i++) {
                                        var dCurrentDate = NOC[i];
                                        const date = new Date(dCurrentDate);
                                        // Get the year, month, and day
                                        const year = date.getFullYear();
                                        // Month is zero-based, so add 1 to get the correct month
                                        const month = (date.getMonth() + 1).toString().padStart(2, "0");
                                        const day = date.getDate().toString().padStart(2, "0");

                                        // Form the desired date format
                                        const formattedDate = `${year}-${month}-${day}`;
                                        var iWeek = that.getWeekNumber(formattedDate);
                                        aLCOl.push(iWeek)

                                    }
                                }
                            }
                            else {
                                if (that.byId("chkboxPS").getSelected() === true) {
                                    var COl = ["Location", "Product", "ModelProfile"];
                                    for (var i = 0; i < NOC.length; i++) {
                                        var dCurrentDate = NOC[i];
                                        const date = new Date(dCurrentDate);
                                        const year = date.getFullYear();
                                        const month = (date.getMonth() + 1).toString().padStart(2, "0");
                                        const day = date.getDate().toString().padStart(2, "0");
                                        const formattedDate = `${year}-${month}-${day}`;
                                        var iWeek = that.getWeekNumber(formattedDate);
                                        COl.push(iWeek)
                                    }
                                }
                                else {
                                    var COl = ["Location", "Product", "ModelProfile"];

                                    for (var i = 0; i < Week.length; i++) {
                                        var dCurrentDate = Week[i];
                                        const date = new Date(dCurrentDate);
                                        const year = date.getFullYear();
                                        const month = (date.getMonth() + 1).toString().padStart(2, "0");
                                        const day = date.getDate().toString().padStart(2, "0");
                                        const formattedDate = `${year}-${month}-${day}`;
                                        var iWeek = that.getWeekNumber(formattedDate);
                                        COl.push(iWeek)

                                    }
                                }
                            }
                            if (aKey.length > 0) {
                                aFilD = aFilD.concat(aKey.length)
                            }
                            if (aLCOl !== undefined && mergedObjects !== undefined) {
                                // aFilD = aFilD.concat(aKey.length)
                                var container = document.querySelector("[id*='excelGridPS']");
                                var button = document.querySelector("[id*='idDownloadPS']");
                                // Define custom renderer function for the "Success" cells
                                const hot = new Handsontable(container, {
                                    colHeaders: aLCOl,
                                    // data: 'Location', renderer: 'html',
                                    currentHeaderClassName: 'ht__highlight',
                                    data: mergedObjects,
                                    rowHeaders: true,
                                    noData: 'No data available',
                                    columnHeaderHeight: 50,
                                    readOnly: true,
                                    colWidths: 160,
                                    rowHeights: 50,
                                    manualColumnResize: true,
                                    filters: true,
                                    dropdownMenu: ['filter_by_condition', 'filter_by_value', 'filter_action_bar'],
                                    height: '56vh',
                                    width: 'auto',
                                    stretchH: 'all',
                                    fixedColumnsLeft: 3,
                                    fixedRowsLeft: 3,
                                    contextMenu: true,
                                    comments: true,
                                    manualColumnMove: true,
                                    renderer: customRenderer1,
                                    licenseKey: 'non-commercial-and-evaluation',
                                });


                                function customRenderer1(instance, td, row, col, prop, value, cellProperties) {
                                    Handsontable.renderers.TextRenderer.apply(this, arguments);

                                    if (prop == "LOCATION_ID" || prop == "PRODUCT_ID" || prop == "MODEL_PROFILE" ||
                                        prop == "PREDICTED_TIME" || prop == "PRE_OPTIMIZED_TIME" || prop == "OPT_ALGORITHM" ||
                                        prop == "OBJ_COUNTER" || prop == "OBJ_DEP" || prop == "OBJ_TYPE") {
                                        if (col === 0 || col === 1) {
                                            var parts = value.split("\n");
                                            //  var formattedText = '<b>' + '<a href="url">' +parts[1] + '</a>' + '</b>' + "-"+  parts[0];
                                            var formattedText = '<b>' + parts[1] + '</b>' + "-" + parts[0];
                                            var o_Text = formattedText.split("-")
                                            td.innerHTML = o_Text.join('\n');
                                            td.style.width = "20px"
                                        }
                                    }

                                }

                            }
                            else {
                                var container = document.querySelector("[id*='excelGridPS']");
                                // Define custom renderer function for the "Success" cells
                                const hot = new Handsontable(container, {
                                    colHeaders: COl,
                                    // data: 'Location', renderer: 'html',
                                    currentHeaderClassName: 'ht__highlight',
                                    data: mergedObjects,
                                    rowHeaders: true,
                                    noData: 'No data available',
                                    columnHeaderHeight: 50,
                                    readOnly: true,
                                    colWidths: 160,
                                    rowHeights: 50,
                                    manualColumnResize: true,
                                    className: 'htCenter',
                                    filters: true,
                                    dropdownMenu: ['filter_by_condition', 'filter_by_value', 'filter_action_bar'],
                                    height: '500',
                                    width: 'auto',
                                    stretchH: 'all',
                                    fixedColumnsLeft: 4,
                                    fixedRowsLeft: 3,
                                    contextMenu: true,
                                    comments: true,
                                    manualColumnMove: true,
                                    renderer: customRenderer1,
                                    licenseKey: 'non-commercial-and-evaluation',
                                });
                                document.querySelector('.htCommentTextArea').style.height = '500px';
                                document.querySelector('.htCommentTextArea').style.width = '400px';
                                function customRenderer1(instance, td, row, col, prop, value, cellProperties) {
                                    Handsontable.renderers.TextRenderer.apply(this, arguments);
                                    if (col >= 3) {
                                        if (value === 0) {
                                            td.style.backgroundColor = 'Light Grey';
                                        } else if (value.startsWith('1')) {
                                            td.innerHTML = `<span class="sap-icon">&#x2717;     </span> ${value}`;
                                            td.style.backgroundColor = '#EAC8C3';
                                        } else if (value.startsWith('3') || value.startsWith('4')) {
                                            td.innerHTML = `<span class="sap-icon">&#x26A0;     </span> ${value}`;
                                            td.style.backgroundColor = '#F7F3D6';
                                        } else if (value.startsWith('2') || value.startsWith('6')) {
                                            td.innerHTML = `<span class="sap-icon">&#x2713;     </span> ${value}`;
                                            td.style.backgroundColor = '#DEF2D7';
                                        }
                                    }
                                    else if (col === 0 || col === 1) {
                                        var parts = value.split("\n");
                                        //  var formattedText = '<b>' + '<a href="url">' +parts[1] + '</a>' + '</b>' + "-"+  parts[0];
                                        var formattedText = '<b>' + parts[1] + '</b>' + "-" + parts[0];
                                        var o_Text = formattedText.split("-")
                                        td.innerHTML = o_Text.join('\n');
                                    }
                                }

                            }
                        }
                        else {
                            sap.m.MessageToast.show("No data is available for selected dates");
                        }
                    }

                }
            },
            //  getColorForAlgorithm: function(optAlgorithm) {
            //     switch (optAlgorithm) {

            //         default: return '#ffffff';            // Default color
            //     }
            // },

            onAlogorithm: function () {
                that.oMainFunc();
            },

            GoLeft: function () {
                sap.ui.core.BusyIndicator.show();
                var length = this.totalPages
                if (this.totalPages > length) {
                    that.byId("onLeftPS").setVisible(false)
                    that.byId("onRightPS").setVisible(true)
                }
                that.count++
                that.onGo();
                that.byId("onRightPS").setVisible(true)

            },
            onGoRight: function () {
                if (that.count == 0) {
                    that.byId("onRightPS").setVisible(false)
                    that.onGo();
                } else {
                    that.count--
                    that.onGo();
                }
                // that.byId("onRightPS").setVisible(true)
            },

            getCalenderWeek: function () {
                that.getOwnerComponent().getModel("oModel").read("/getIBPCalenderWeek", {
                    success: function (oData) {
                        that.oGModel.setProperty("/CalenderWeek", oData.results);
                    },
                    error: function (oData, error) {
                        MessageToast.show("error");
                    },
                });
            },

            getWeekNumber: function (dCurrDate) {
                var dReqDate = new Date(dCurrDate);
                var aCalenderWeek = that.oGModel.getProperty("/CalenderWeek");
                for (var i = 0; i < aCalenderWeek.length; i++) {
                    if (dReqDate >= aCalenderWeek[i].WEEK_STARTDATE && dReqDate <= aCalenderWeek[i].WEEK_ENDDATE) {
                        return aCalenderWeek[i].PERIODDESC;
                        break;
                    }
                }
            },
            
            checkLeapYear: function (iYear) {
                return (iYear % 100 === 0) ? (iYear % 400 === 0) : (iYear % 4 === 0);
            },

            onReset: function () {
                // that.onAfterRendering();
                that.byId("idDownloadPS").setVisible(false)
                that.count = 0;
                //  count = 2;
                mergedObjects = []
                nextSetOfDates = []
                aggregatedData = [];
                that.aTableDownLoad = [];
                // that.byId("idVariantNamePS").setText("Standard");
                //  that.onDropDownPress();
                // that.handleSelectPress();
                that.byId("onRightPS").setVisible(false);
                that.byId("onLeftPS").setVisible(false);
                that.byId("oLocPS").setValue("");
                that.byId("oProdPS").setValue("");
                that.byId("oVersPS").setValue("");
                that.byId("oScenPS").setValue("");
                function addMonths(date, months) {
                    const newDate = new Date(date);
                    newDate.setMonth(newDate.getMonth() + months);
                    return newDate;
                }

                // Calculate today's date and the date two months later
                const today = new Date();
                const twoMonthsLater = addMonths(today, 2);

                // Format dates to the pattern 'yyyy/MM/dd'
                const formatDate = (date) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}/${month}/${day}`;
                };

                const startDate = formatDate(today);
                const endDate = formatDate(twoMonthsLater);


                that.byId("DRS1PS").setDateValue(new Date(startDate))
                that.byId("DRS1PS").setSecondDateValue(new Date(endDate))
                // that.byId("DRS1PS").setValue("10/30/2023 - 02/27/2024")

                var excel = document.querySelector("[id*=excelGridPS]");
                excel.innerHTML = " ";
                //  excel.classList.add("custom-excel"); // Add a custom CSS class


                that.byId("idSelectionPS").setSelectedKeys("")
            },

            handleSelectionFinish: function () {
                that.onGo();
            },
            closeTemplate: function () {
                var oDateRangeSelection = sap.ui.getCore().byId("DRS2PS");
                oDateRangeSelection.setValue(""); // Reset value to clear the field

                this._downFragment.close();
            },

            onDownload: function () {
                var that = this;
                var oModel = that.getOwnerComponent().getModel('oDataModel');
                var pageSize = 900; // Set the page size (number of records per request)
                var skip = 0; // Initialize skip for pagination
                var mainDataArray = []; // Array to store all the fetched data

                if (that.byId("oLocPS").getValue() === "") {
                    sap.m.MessageToast.show("Please Select Location");
                    return false;
                }
                if (that.byId("oProdPS").getValue() === "") {
                    sap.m.MessageToast.show("Please Select Product");
                    return false;
                }
                if (that.byId("oVersPS").getValue() === "") {
                    sap.m.MessageToast.show("Please Select Version");
                    return false;
                }
                if (that.byId("oScenPS").getValue() === "") {
                    sap.m.MessageToast.show("Please Select Scenario");
                    return false;
                }
                if (sap.ui.getCore().byId("DRS2PS").getValue() === "") {
                    sap.m.MessageToast.show("No Dates are Selected");
                    return false;
                }
                var dateId1 = sap.ui.getCore().byId("DRS2PS").getDateValue();
                var DateId2 = sap.ui.getCore().byId("DRS2PS").getSecondDateValue();
                var dArray = []
                while (DateId2 > dateId1) {
                    var newd1 = new Date(dateId1.setDate(dateId1.getDate() + 1))
                    dArray.push(newd1);
                }
                dateId1.setDate(dateId1.getDate() - dArray.length);
                dArray.pop()
                dArray.splice(0, 0, dateId1)
                var afrm1 = []
                Week = []
                var idModelVerPS = that.byId("idModelVerPS").getSelectedKey()
                var oStartDate = sap.ui.getCore().byId("DRS2PS").getDateValue() //oDateRangeSelection.getDateValue();
                var oEndDate = sap.ui.getCore().byId("DRS2PS").getSecondDateValue() //oDateRangeSelection.getSecondDateValue();
                var oDowndates = [];
                var oStartDateInstance = new Date(oStartDate);
                var oCurrentDate = oStartDateInstance;
                while (oCurrentDate <= oEndDate) {
                    if (oCurrentDate.getDay() === 1) {
                        var weekNum = that.convertDate(oCurrentDate, "-");
                        oDowndates.push(weekNum);
                    }
                    oCurrentDate.setDate(oCurrentDate.getDate() + 1);
                }
                // that.mondays = oDowndates;
                var mondays = oDowndates;
                that.dynamicDates = mondays //.slice(0, 8); // Get dates for the first page (first 8 weeks)

                var vFromDate = that.dynamicDates[0];
                var vToDate = that.dynamicDates[that.dynamicDates.length - 1];

                var LI = that.byId("oLocPS").getValue();
                var CP = that.byId("oProdPS").getValue();
                for (var i = 0; i < Verscena.length; i++) {
                    var IBPPS = that.byId("oVersPS").getValue();
                    if (IBPPS === Verscena[i].VERSION_NAME) {
                        var IBPV = Verscena[i].VERSION
                        break;
                    }
                }

                for (var n = 0; n < Verscena.length; n++) {
                    var IBPPV = that.byId("oScenPS").getValue();
                    if (IBPPV === Verscena[n].SCENARIO_NAME) {
                        var IBPS = Verscena[n].SCENARIO
                        break;
                    }
                }
                var idModelVer = that.byId("idModelVerPS").getSelectedKey();
                //   sap.ui.core.BusyIndicator.show();
                that.oBusyDialog = new sap.m.BusyDialog({
                    text: "Downloading process start, please wait..."
                });

                // Show the BusyDialog
                that.oBusyDialog.open();
                // Function to fetch data page by page
                function fetchData(skip, successCallback) {
                    oModel.read('/getPredictions', {
                        filters: [
                            new Filter("LOCATION_ID", FilterOperator.EQ, LI),
                            new Filter("PRODUCT_ID", FilterOperator.EQ, CP),
                            new Filter("VERSION", FilterOperator.EQ, IBPV),
                            new Filter("SCENARIO", FilterOperator.EQ, IBPS),
                            new Filter("MODEL_VERSION", FilterOperator.EQ, idModelVer),
                            new Filter("CAL_DATE", FilterOperator.BT, vFromDate, vToDate),
                        ],
                        urlParameters: {
                            "$skip": skip,
                            "$top": pageSize
                        },
                        success: function (aData) {
                            if (aData.results.length > 0) {
                                // Append new data to main array
                                mainDataArray = mainDataArray.concat(aData.results);
                                //   that.ConvertedTime(aData.results)
                                // Fetch the next page
                                fetchData(skip + pageSize, successCallback);
                            } else {
                                // No more data, proceed with the callback
                                successCallback(mainDataArray);
                            }
                        },
                        error: function (error) {
                            sap.m.MessageToast.show("Error fetching data");
                            console.log(error);
                        }
                    });
                }

                // Fetch the data page by page and store it in mainDataArray
                fetchData(skip, function (allData) {

                    that.ConvertedTime(allData)
                    that.oForDownload = allData;
                    sap.ui.core.BusyIndicator.hide();
                    that.onDownloadExcel1()

                });
            },
            onDownloadExcel1: function () {
                that.closeTemplate();
                that.oBusyDialog.close();
                //  sap.ui.core.BusyIndicator.hide();

                var aCols, oSettings, oSheet;
                var sFileName = "Predictions"
                //  var oEvt = oEvent.getSource()
                var aCols = []
                var oStore = [];



                for (var i = 0; i < that.oForDownload.length; i++) {
                    // Format the CAL_DATE property
                    that.oForDownload[i].CAL_DATE = that.oForDownload[i].CAL_DATE.toLocaleDateString();

                    // Remove the __metadata property
                    delete that.oForDownload[i].__metadata;
                }



                var aDown = Object.values(that.oForDownload)
                for (var j = 0; j < Object.keys(aDown[0]).length; j++) {
                    aCols.push({
                        property: Object.keys(aDown[0])[j]
                    });
                }
                var oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: that.oForDownload,
                    fileName: sFileName,
                    worker: true
                };
                var oSheet = new sap.ui.export.Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });



            },


            ConvertedTime: function (oAllData) {
                that.zone = new Date().getTimezoneOffset().toString();
                that.opr = that.zone.slice(0, 1);
                that.opr = new Date().toString().split("GMT")[1].slice(0, 1);
                if (that.zone.includes("-")) {
                    that.zHours = (Math.floor(that.zone.slice(1) / 60)) * 60 * 60 * 1000;
                    that.zMin = (that.zone.slice(1) % 60) * 60 * 1000;
                } else {
                    that.zHours = (Math.floor(that.zone / 60)) * 60 * 60 * 1000;
                    that.zMin = (that.zone % 60) * 60 * 1000;
                }
                const targetTimeZone = that.timezone;
                oAllData.forEach(ele => {
                    var PREDICTED_TIME = (ele.PREDICTED_TIME);
                    var PRE_OPTIMIZED_TIME = (ele.PRE_OPTIMIZED_TIME);
                    if (that.opr == "-") {
                        PREDICTED_TIME.setTime(PREDICTED_TIME.getTime() + (that.zHours + that.zMin));
                        PRE_OPTIMIZED_TIME.setTime(PRE_OPTIMIZED_TIME.getTime() + (that.zHours + that.zMin));
                    }
                    else {
                        PREDICTED_TIME.setTime(PREDICTED_TIME.getTime() - (that.zHours + that.zMin));
                        PRE_OPTIMIZED_TIME.setTime(PRE_OPTIMIZED_TIME.getTime() - (that.zHours + that.zMin));
                    }
                    var opr = (targetTimeZone.split("UTC")[1]).slice(0, 1);
                    var hours = ((targetTimeZone.split("UTC")[1]).slice(1)).split(":")[0];
                    var min = ((targetTimeZone.split("UTC")[1]).slice(1)).split(":")[1];
                    var mHours = hours * 60 * 60 * 1000;
                    var mMins = min * 60 * 1000;
                    if (opr == "-") {
                        PREDICTED_TIME.setTime(PREDICTED_TIME.getTime() - (mHours + mMins));
                        PRE_OPTIMIZED_TIME.setTime(PRE_OPTIMIZED_TIME.getTime() - (mHours + mMins));
                    }
                    else {
                        PREDICTED_TIME.setTime(PREDICTED_TIME.getTime() + (mHours + mMins));
                        PRE_OPTIMIZED_TIME.setTime(PRE_OPTIMIZED_TIME.getTime() + (mHours + mMins));
                    }
                    const convertedDate1 = PREDICTED_TIME.toLocaleString('en-US', { dateStyle: "medium", timeStyle: "medium", hour12: true });
                    const convertedDate2 = PRE_OPTIMIZED_TIME.toLocaleString('en-US', { dateStyle: "medium", timeStyle: "medium", hour12: true });
                    // return convertedDate
                    ele.PREDICTED_TIME = convertedDate1;
                    ele.PRE_OPTIMIZED_TIME = convertedDate2

                });
            },

        });
    });
