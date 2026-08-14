sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/ui/Device",
  "sap/ui/core/Fragment",
  'sap/ui/export/library',
  'sap/ui/export/Spreadsheet'
],
  function (Controller, JSONModel, Filter, FilterOperator, MessageToast,exportLibrary,Spreadsheet) {
    "use strict";
    var that, oGModel;
    var EdmType = exportLibrary.EdmType;

    return Controller.extend("vcpapp.vcpmodelversion.controller.Home", {
      onInit: function () {
        that = this;
        that.oTable = that.byId("orderListMV")
        that.TimeZone()
        //  that.oGModel = this.getOwnerComponent().getModel("oGModel");
        that.oGModel = that.getOwnerComponent().getModel("oGModel");
        that.byId("orderListMV")

        that.oListModel = new sap.ui.model.json.JSONModel();
        that.locModel = new sap.ui.model.json.JSONModel();

        that.locModel.setSizeLimit(1000);
        that.oListModel.setSizeLimit(5000);

        if (!that.newLocDialog) {
          that.newLocDialog = sap.ui.xmlfragment(
            "vcpapp.vcpmodelversion.view.LocFrag", that);
          this.getView().addDependent(this.newLocDialog);
        }
        if (!that.newProdDialog) {
          that.newProdDialog = sap.ui.xmlfragment(
            "vcpapp.vcpmodelversion.view.ProdFrag", that);
          this.getView().addDependent(this.newProdDialog);
        }
        if (!that.newTypeDialog) {
          that.newTypeDialog = sap.ui.xmlfragment(
            "vcpapp.vcpmodelversion.view.Type", that);
          this.getView().addDependent(this.newTypeDialog);
        }


        if (!that.newModel) {
          that.newModel = sap.ui.xmlfragment(
            "vcpapp.vcpmodelversion.view.Model", that);
          this.getView().addDependent(this.newModel);
        }


        //  sap.ui.core.BusyIndicator.show();
        // that.getOwnerComponent().getModel("BModel").read("/getUserPreferences", {
        //   filters: [
        //     new Filter("PARAMETER", FilterOperator.EQ, "TIMEZONE")
        //   ],
        //   success: function (oData) {
        //     if (oData.results[0].PARAMETER_VALUE.includes("(")) {
        //       var length = oData.results[0].PARAMETER_VALUE.length - 1;
        //       that.timezone = oData.results[0].PARAMETER_VALUE.slice(1, length);
        //     } else {
        //       that.timezone = oData.results[0].PARAMETER_VALUE;
        //     }
        //     if (that.timezone === "" || that.timezone === undefined || that.timezone === null) {
        //       that.timezone = "UTC+00:00"
        //     }
        //     that.oGModel.setProperty("/timezone", that.timezone);
        //   },
        //   error: function (oData, error) {
        //     console.log(error)
        //   },
        // });
        that.getData();
        that.fetch();

      },
      onAfterRendering() {
        that.deletedArray = [];
        that.oGModel = that.getOwnerComponent().getModel("oGModel");
        that.oGModelDef = that.getOwnerComponent().getModel("oGModelDef");
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
        if (!this._popOver) {
          this._popOver = sap.ui.xmlfragment(
            "vcpapp.vcpmodelversion.view.PopOver",
            this
          );
          this.getView().addDependent(this._popOver);
        }
        if (!this._nameFragment) {
          this._nameFragment = sap.ui.xmlfragment(
            "vcpapp.vcpmodelversion.view.NameVariant",
            this
          );
          this.getView().addDependent(this._nameFragment);
        }
        if (!this._manageVariant) {
          this._manageVariant = sap.ui.xmlfragment(
            "vcpapp.vcpmodelversion.view.VariantNames",
            this
          );
          this.getView().addDependent(this._manageVariant);
        }
        that.getVariantData();
      },
      TimeZone: function () {
        that.getOwnerComponent().getModel("BModel").read("/getUserPreferences", {
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
            that.oGModelDef.setProperty("/timezone", that.timezone);
          },
          error: function (oData, error) {
            console.log(error)
          },
        });
      },
      fetch: function (allData) {
        var that = this;
        var oModel = that.getOwnerComponent().getModel('PModel');
        var pageSize = 900; // Set your desired page size
        var skip = 0; // Initial skip value
        var allData = [];
        function fetchData() {
          sap.ui.core.BusyIndicator.show();
          oModel.read('/getODModelVersions', {
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
              }
              else {
                sap.ui.core.BusyIndicator.hide()
              }
              var oGblModel = that.getOwnerComponent().getModel("oGModel")
              oGblModel.setData({
                allData
              })
            },
            error: function (error) {
              console.log(error);
            }
          });
        }
        fetchData();
      },
      onDownLoadPress: function () {
        var aCols, oRowBinding, oSettings, oSheet, oTable;
        if (!this._oTable) {
          this._oTable = that.getView().byId("orderListMV");
        }
        // oTable = this._oTable;
        // var data = oTable.getModel().getData();
       var data =  that.getView().byId("orderListMV").getModel().getData();
      //  var oModel = oTable.getModel();
  //  var data = oModel.getData();
        if (data.aItems.length > 0) {
          // var searchData = that.byId("onTabSearch").getValue();
          // if (searchData) {
          //   data = data.filter(row => row.CHAR_NUM.toString().includes(searchData));
          // }
          var exportData = data.aItems.slice()
          // data = data.aItems.filter(row => row.LOCATION_ID.toString());
          oRowBinding = exportData;
          aCols = this.createColumnConfig();
          aCols.pop();

          // oSettings = {
          //   workbook: {
          //     columns: aCols,
          //     hierarchyLevel: "Level"
          //   },
          //   dataSource: oRowBinding,
          //   fileName: "Time Series History.xlsx"
          // };

          // oSheet = new Spreadsheet(oSettings);
          // oSheet.build().finally(function () {
          //   oSheet.destroy();
          //   sap.ui.core.BusyIndicator.hide();
          // });
          var BATCH_SIZE = 500000; // Process data in chunks of 5 lakh rows
          var totalRows = exportData.length;
          var chunks = Math.ceil(totalRows / BATCH_SIZE);
          var fileName = "Model Versions.xlsx";

          var processChunk = function (chunkIndex) {
            if (chunkIndex >= chunks) {
              sap.ui.core.BusyIndicator.hide();
              MessageToast.show("Excel Export Completed!");
              return;
            }

            var start = chunkIndex * BATCH_SIZE;
            var end = Math.min(start + BATCH_SIZE, totalRows);
            var chunkData = exportData.slice(start, end);

            var oSettings = {
              workbook: {
                columns: aCols,
                hierarchyLevel: "Level"
              },
              dataSource: chunkData,
              fileName: fileName
            };

            var oSheet = new sap.ui.export.Spreadsheet(oSettings);
            oSheet.build().finally(function () {
              oSheet.destroy();
              processChunk(chunkIndex + 1); // Process the next chunk
            });
          };

          // Start exporting in chunks
          processChunk(0);
        }
        else {
          sap.ui.core.BusyIndicator.hide();
          MessageToast.show("No data to download");
        }
      },
      // download function
      createColumnConfig: function () {
        var aCols = [];
        // var col = that.getView().byId("orderListMV").getColumns();
        var data =  that.getView().byId("orderListMV").getModel().getData();
        var noOfCols = Object.keys(data.aItems[0]);
        for (var i = 0; i < noOfCols.length; i++) {
          // if (i === 9) 
          //   continue; // Skip the 10th column (index 9)
          
          aCols.push({
            property: Object.keys(data.aItems[0])[i]
          })
        }
       
        return aCols;
      },
      onLocation: function (oEvent) {

        var oJSONModel = new sap.ui.model.json.JSONModel([]);
        that.oTable.setModel(oJSONModel)

        var oJSONModel = new sap.ui.model.json.JSONModel();
        var oLoc = that.getOwnerComponent().getModel("oGModel").getData().allData;
        that.oLocat = that.removeDuplicate(oLoc, "LOCATION_ID")
        oJSONModel.setData({
          aItems: that.oLocat
        })

        sap.ui.getCore().byId("LocSlctListMV").setModel(oJSONModel)
        var locItems = sap.ui.getCore().byId("LocSlctListMV").getItems();
        var selectedLoc = that.byId("idlocMV").getValue();
        if (selectedLoc) {
          locItems.forEach(items => {
            if (items.getTitle() === selectedLoc) {
              items.setSelected(true);
            }
          })
        }
       
        that.newLocDialog.open();
      },

      onLocationSelect: function (oEvent) {

        var oSelectedItem = oEvent.getParameter("selectedItem");
        that.oGModelDef.setProperty("/oLocItem", oSelectedItem)
        if (!oSelectedItem) {
          return;
        }
        that.byId("idlocMV").setValue(oSelectedItem.getTitle());
        that.byId("prodInputMV").setValue("");
        that.byId("idTypeMV").setValue("");
        that.byId("idModelMV").setValue("");
      },

      onProduct: function (oEvent) {
        var oLocation = that.byId("idlocMV").getValue()
        if (oLocation == "") {
          MessageToast.show("Select location field");
          return false;
        }

        var oJSONModel = new sap.ui.model.json.JSONModel([]);
        that.oTable.setModel(oJSONModel)

        var sValue1 = that.byId("idlocMV").getValue();
        var oData = that.getOwnerComponent().getModel("oGModel").getData();
        var o_Order = that.oLocation
        var Product = that.getOwnerComponent().getModel("oGModel").getData().allData

        var o_FilterProduct = [];
        Product.forEach((item1) => {
          if (o_Order.some((item2) => item2.DEMAND_LOC === item1.LOCATION_ID)) {
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
        that.oProdc = that.removeDuplicate(o_Product, "PRODUCT_ID")

        var oJSONModel = new sap.ui.model.json.JSONModel();
        oJSONModel.setData({
          aItems: that.oProdc
        })
        sap.ui.getCore().byId("oProductMV").setModel(oJSONModel)
        var prodItems = sap.ui.getCore().byId("oProductMV").getItems();
        var selectedProd = that.byId("prodInputMV").getValue();
        if (selectedProd) {
          prodItems.forEach(items => {
            if (items.getTitle() === selectedProd) {
              items.setSelected(true);
            }
          })
        }
        that.newProdDialog.open();

      },

      onProductSelect: function (oEvent) {
        var oSelectedItem = oEvent.getParameter("selectedItem");
        that.oGModelDef.setProperty("/oProdItem", oSelectedItem)
        if (!oSelectedItem) {
          return;
        }
        that.byId("prodInputMV").setValue(oSelectedItem.getTitle());
        that.byId("idTypeMV").setValue("");
        that.byId("idModelMV").setValue("");
      },
      oBjectType: function () {
        var oLocation = that.byId("idlocMV").getValue(),
          oProduct = that.byId("prodInputMV").getValue(),
          oMdel = that.byId("idModelMV").getValue();
        if (oLocation == "" || oProduct == "" || oMdel == "") {
          MessageToast.show("Select location, product & model version fields");
          return false;
        }

        var oJSONModel = new sap.ui.model.json.JSONModel([]);
        that.oTable.setModel(oJSONModel)

        var oBjectType = that.getOwnerComponent().getModel("oGModel").getData().allData
        var oBType = [];
        for (var i = 0; i < oBjectType.length; i++) {
          if (oBjectType[i].LOCATION_ID === oLocation && oBjectType[i].PRODUCT_ID === oProduct) {
            oBType.push({ OBJ_TYPE: oBjectType[i].OBJ_TYPE })
          }
        }
        that.oType = that.removeDuplicate(oBType, "OBJ_TYPE")

        var oJSONModel = new sap.ui.model.json.JSONModel();
        oJSONModel.setData({
          aItems: that.oType
        })
        sap.ui.getCore().byId("oTypeMV").setModel(oJSONModel)
        var ObjectItems = sap.ui.getCore().byId("oTypeMV").getItems();
        var selectedObject = that.byId("idTypeMV").getValue();
        if (selectedObject) {
          ObjectItems.forEach(items => {
            if (items.getTitle() === selectedObject) {
              items.setSelected(true);
            }
          })
        }
        that.newTypeDialog.open();
      },

      onTypeSelect: function (oEvent) {
        var oSelectedItem = oEvent.getParameter("selectedItem");
        that.oGModelDef.setProperty("/oTypeItem", oSelectedItem)
        if (!oSelectedItem) {
          return;
        }
        that.byId("idTypeMV").setValue(oSelectedItem.getTitle());

      },

      oModelVersion: function (oEvent) {
        var oLocation = that.byId("idlocMV").getValue(),
          oProduct = that.byId("prodInputMV").getValue();

        if (oLocation == "" || oProduct == "") {
          MessageToast.show("Select location, product fields");
          return false;
        }

        var oJSONModel = new sap.ui.model.json.JSONModel([]);
        that.oTable.setModel(oJSONModel)

        that.oModelversion = [
          {
            "MODEL_VERSION": "Active"
          },
          {
            "MODEL_VERSION": "Simulation"
          },

        ]
        var oJSONModel = new sap.ui.model.json.JSONModel();
        oJSONModel.setData({
          aItems: that.oModelversion
        })
        sap.ui.getCore().byId("oModelMV").setModel(oJSONModel)
        var versItems = sap.ui.getCore().byId("oModelMV").getItems();
        var selectedVers = that.byId("idModelMV").getValue();
        if (selectedVers) {
          versItems.forEach(items => {
            if (items.getTitle() === selectedVers) {
              items.setSelected(true);
            }
          })
        }
        that.newModel.open();
      },

      onModelSelect: function (oEvent) {
        var oSelectedItem = oEvent.getParameter("selectedItem");
        that.oGModelDef.setProperty("/oModelItem", oSelectedItem)
        if (!oSelectedItem) {
          return;
        }
        that.byId("idModelMV").setValue(oSelectedItem.getTitle());
        that.byId("idTypeMV").setValue("");
      },

      handleSearch: function (oEvent) {
        var oLocList = sap.ui.getCore().byId("LocSlctListMV");
        var oProdList = sap.ui.getCore().byId("oProductMV");
        var oTypeList = sap.ui.getCore().byId("oTypeMV");
        var oModel = sap.ui.getCore().byId("oModelMV");
        var oNamVariant = sap.ui.getCore().byId("varNameListMV");
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
                  // new sap.ui.model.Filter("LOCATION_DESC", sap.ui.model.FilterOperator.Contains, sQuery)
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
                  // new sap.ui.model.Filter("PRODUCT_DESC", sap.ui.model.FilterOperator.Contains, sQuery)
                ],
                and: false
              })
            );
          }
          oProdList.getBinding("items").filter(oFilters);
        }
        else if (sId.includes("oTypeMV")) {
          if (sQuery !== "") {
            oFilters.push(
              new sap.ui.model.Filter({
                filters: [
                  new sap.ui.model.Filter("OBJ_TYPE", sap.ui.model.FilterOperator.Contains, sQuery),
                  // new sap.ui.model.Filter("PRODUCT_DESC", sap.ui.model.FilterOperator.Contains, sQuery)
                ],
                and: false
              })
            );
          }
          oTypeList.getBinding("items").filter(oFilters);
        }
        else if (sId.includes("oMod")) {
          if (sQuery !== "") {
            oFilters.push(
              new sap.ui.model.Filter({
                filters: [
                  new sap.ui.model.Filter("MODEL_VERSION", sap.ui.model.FilterOperator.Contains, sQuery)
                ],
                and: false
              })
            );
          }
          oModel.getBinding("items").filter(oFilters);
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
* This function is called when click on Value help on Input box.
* In this function based in sId will open the dialogs.
* @param {object} oEvent -the event information.
*/
      handleValueHelp: function (oEvent) {
        var sId = oEvent.getParameter("id");
        // Loc Dialog
        if (sId.includes("loc")) {

          that._valueHelpDialogLoc.open();
          // Prod Dialog
        } else if (sId.includes("prod")) {

          that._valueHelpDialogProd.open();
          // Component Dialog
        }

      },

      handleSelection: function (oEvent) {
        var oList = this.getView().byId("orderListMV");
        oList.setModel(new sap.ui.model.json.JSONModel());
        var sId = oEvent.getParameter("id");
        this.oLocation = that.byId("idlocMV");
        this.oProd = that.byId("prodInputMV");
        this.oVers = that.byId("idver");
        this.oScen = that.byId("idscen");
        if (sId.includes("Loc")) {
          var aSelectedLoc = oEvent.getParameter("selectedItems");
          // Removing selections of component 
          //   that.oProd.removeAllTokens();
          //   that.oVers.removeAllTokens();
          //   that.oScen.removeAllTokens();
          //       that.oVers.removeAllTokens();
          //   this._valueHelpDialogProd
          //     .getAggregation("_dialog")
          //     .getContent()[1]
          //     .removeSelections();
          //   this._valueHelpDialogVers
          //     .getAggregation("_dialog")
          //     .getContent()[1]
          //     .removeSelections();
          //   this._valueHelpDialogScen
          //     .getAggregation("_dialog")
          //     .getContent()[1]
          //     .removeSelections();

          if (aSelectedLoc && aSelectedLoc.length > 0) {
            that.oLocation.removeAllTokens();
            aSelectedLoc.forEach(function (oItem) {
              that.oLocation.addToken(
                new sap.m.Token({
                  key: oItem.getTitle(),
                  text: oItem.getTitle(),
                  editable: false
                })
              );
            });

            var aSelectedLoc = that.oLocList.getSelectedItems();

            // Declaration of filters
            var oFilters = [];
            for (var i = 0; i < aSelectedLoc.length; i++) {
              sFilter = new sap.ui.model.Filter({
                path: "LOCATION_ID",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: aSelectedLoc[i].getTitle(),
              });
              oFilters.push(sFilter);
            }

            // Calling service to get the component list
            this.getOwnerComponent().getModel("BModel").read("/genPartialProd", {
              filters: oFilters,
              success: function (oData) {
                var resultsProd = that.removeDuplicate(oData.results, "PRODUCT_ID")
                that.prodModel.setData({ results: resultsProd });
                // that.prodModel.setData(oData);
                that.oProdList.setModel(that.prodModel);
              },
              error: function (oData, error) {
                MessageToast.show("error");
              },
            });

          } else {
            that.oLocation.removeAllTokens();
            that.byId("prodInputMV").removeAllTokens();
            //  that.oProd.removeAllTokens();
          }
          // Component List
        }
        // else if (sId.includes("prod")) {
        //   var oList = this.getView().byId("orderListMV");
        //   oList.setModel(new sap.ui.model.json.JSONModel());
        //   var aSelectedProd = oEvent.getParameter("selectedItems");
        //   // Removing selections of component 
        //   that.oVers.removeAllTokens();
        //   that.oScen.removeAllTokens();
        //   this._valueHelpDialogVers
        //     .getAggregation("_dialog")
        //     .getContent()[1]
        //     .removeSelections();
        //   this._valueHelpDialogScen
        //     .getAggregation("_dialog")
        //     .getContent()[1]
        //     .removeSelections();

        //   if (aSelectedProd && aSelectedProd.length > 0) {
        //     that.oProd.removeAllTokens();
        //     aSelectedProd.forEach(function (oItem) {
        //       that.oProd.addToken(
        //         new sap.m.Token({
        //           key: oItem.getTitle(),
        //           text: oItem.getTitle(),
        //           editable: false
        //         })
        //       );
        //     });

        //     var aSelectedLoc = that.oLocList.getSelectedItems()
        //     var aSelectedProd = that.oProdList.getSelectedItems();

        //     // Declaration of filters
        //     var oFilters = [];
        //     for (var i = 0; i < aSelectedLoc.length; i++) {
        //       sFilter = new sap.ui.model.Filter({
        //         path: "LOCATION_ID",
        //         operator: sap.ui.model.FilterOperator.EQ,
        //         value1: aSelectedLoc[i].getTitle(),
        //       });
        //       oFilters.push(sFilter);
        //     }

        //     for (var i = 0; i < aSelectedProd.length; i++) {
        //       sFilter = new sap.ui.model.Filter({
        //         path: "PRODUCT_ID",
        //         operator: sap.ui.model.FilterOperator.EQ,
        //         value1: aSelectedProd[i].getTitle(),
        //       });
        //       oFilters.push(sFilter);
        //     }

        //     // Calling service to get the component list
        //     this.getOwnerComponent().getModel("BModel").read("/getIbpVerScn", {
        //       filters: oFilters,
        //       success: function (oData) {
        //         that.odCondData = oData.results;
        //         let uniqueArray1 = Array.from(new Set(oData.results.map(item => item.VERSION)))
        //           .map(VERSION => oData.results.find(item => item.VERSION === VERSION));

        //         for (var i = 0; i < uniqueArray1.length; i++) {
        //           if (uniqueArray1[i].VERSION_NAME === null) {
        //             uniqueArray1[i].VERSION_NAME = uniqueArray1[i].VERSION
        //           }
        //         }
        //         that.VersModel.setData({
        //           results: uniqueArray1
        //         })

        //         that.oVersList.setModel(that.VersModel);

        //       },
        //       error: function (oData, error) {
        //         MessageToast.show("error");
        //       },
        //     });

        //   } else {
        //     that.oProd.removeAllTokens();
        //   }
        //   // Component List
        // }
        // else if (sId.includes("Ver")) {
        //   var oList = this.getView().byId("orderListMV");
        //   oList.setModel(new sap.ui.model.json.JSONModel());
        //   var aSelectedComp = oEvent.getParameter("selectedItems");
        //   if (aSelectedComp && aSelectedComp.length > 0) {
        //     that.oVers.removeAllTokens();
        //     that.oScen.removeAllTokens();
        //     this._valueHelpDialogScen
        //       .getAggregation("_dialog")
        //       .getContent()[1]
        //       .removeSelections();
        //     aSelectedComp.forEach(function (oItem) {
        //       that.oVers.addToken(
        //         new sap.m.Token({
        //           key: oItem.getTitle(),
        //           text: oItem.getTitle(),
        //           editable: false
        //         })
        //       );
        //     });


        //     var aSelectedLoc = that.oLocList.getSelectedItems()
        //     var aSelectedProd = that.oProdList.getSelectedItems();
        //     var aSelectedComp = that.oVersList.getSelectedItems();

        //     // Declaration of filters
        //     var oFilters = [];

        //     for (var i = 0; i < aSelectedLoc.length; i++) {
        //       var sFilter = new sap.ui.model.Filter({
        //         path: "LOCATION_ID",
        //         operator: sap.ui.model.FilterOperator.EQ,
        //         value1: aSelectedLoc[i].getTitle(),
        //       });
        //       oFilters.push(sFilter);
        //     }

        //     for (var i = 0; i < aSelectedProd.length; i++) {
        //       sFilter = new sap.ui.model.Filter({
        //         path: "PRODUCT_ID",
        //         operator: sap.ui.model.FilterOperator.EQ,
        //         value1: aSelectedProd[i].getTitle(),
        //       });
        //       oFilters.push(sFilter);
        //     }

        //     for (var i = 0; i < aSelectedComp.length; i++) {
        //       sFilter = new sap.ui.model.Filter({
        //         path: "VERSION",
        //         operator: sap.ui.model.FilterOperator.EQ,
        //         value1: aSelectedComp[i].getDescription(),
        //       });
        //       oFilters.push(sFilter);
        //     }

        //     // Calling service to get the Structure Node data
        //     this.getOwnerComponent().getModel("BModel").read("/getIbpVerScn", {
        //       filters: oFilters,
        //       success: function (oData) {
        //         let oscenArray = Array.from(new Set(oData.results.map(item => item.SCENARIO)))
        //           .map(SCENARIO => oData.results.find(item => item.SCENARIO === SCENARIO));
        //         // null replaced code
        //         for (var i = 0; i < oscenArray.length; i++) {
        //           if (oscenArray[i].SCENARIO_NAME === null) {
        //             oscenArray[i].SCENARIO_NAME = oscenArray[i].SCENARIO
        //           }
        //         }

        //         that.ScenModel.setData({
        //           results: oscenArray,
        //         });
        //         that.oScenList.setModel(that.ScenModel);
        //       },
        //       error: function (oData, error) {
        //         MessageToast.show("error");
        //       },
        //     });

        //   } else {
        //     that.oVers.removeAllTokens();
        //   }

        // }

        // else if (sId.includes("Scen")) {
        //   var oList = this.getView().byId("orderListMV");
        //   oList.setModel(new sap.ui.model.json.JSONModel());
        //   var aSelectedScen = oEvent.getParameter("selectedItems");
        //   if (aSelectedScen && aSelectedScen.length > 0) {
        //     that.oScen.removeAllTokens();
        //     aSelectedScen.forEach(function (oItem) {
        //       that.oScen.addToken(
        //         new sap.m.Token({
        //           key: oItem.getTitle(),
        //           text: oItem.getTitle(),
        //           editable: false
        //         })
        //       );
        //     });


        //     var aSelectedLoc = that.oLocList.getSelectedItems();
        //     var aSelectedProd = that.oProdList.getSelectedItems();
        //     var aSelectedComp = that.oVersList.getSelectedItems();
        //     var aSelectedScen = that.oScenList.getSelectedItems()

        //     // Declaration of filters
        //     var oFilters = [];

        //     for (var i = 0; i < aSelectedLoc.length; i++) {
        //       var sFilter = new sap.ui.model.Filter({
        //         path: "LOCATION_ID",
        //         operator: sap.ui.model.FilterOperator.EQ,
        //         value1: aSelectedLoc[i].getTitle(),
        //       });
        //       oFilters.push(sFilter);
        //     }


        //     for (var i = 0; i < aSelectedProd.length; i++) {
        //       sFilter = new sap.ui.model.Filter({
        //         path: "PRODUCT_ID",
        //         operator: sap.ui.model.FilterOperator.EQ,
        //         value1: aSelectedProd[i].getTitle(),
        //       });
        //       oFilters.push(sFilter);
        //     }

        //     for (var i = 0; i < aSelectedComp.length; i++) {
        //       sFilter = new sap.ui.model.Filter({
        //         path: "VERSION",
        //         operator: sap.ui.model.FilterOperator.EQ,
        //         value1: aSelectedComp[i].getTitle(),
        //       });
        //       oFilters.push(sFilter);
        //     }

        //     for (var i = 0; i < aSelectedScen.length; i++) {
        //       sFilter = new sap.ui.model.Filter({
        //         path: "SCENARIO",
        //         operator: sap.ui.model.FilterOperator.EQ,
        //         value1: aSelectedScen[i].getTitle(),
        //       });
        //       oFilters.push(sFilter);
        //     }
        //     // Calling service to get the Structure Node data
        //     this.getOwnerComponent().getModel("BModel").read("/getIbpVerScn", {
        //       filters: oFilters,
        //       success: function (oData) {
        //         var aData = [];
        //         for (var i = 0; i < oData.results.length; i++) {
        //           // that.ScenModel.setData(aData);
        //           that.ScenModel.setData({
        //             results: aData,
        //           });
        //           that.oScenList.setModel(that.ScenModel);
        //         }
        //       },
        //       error: function (oData, error) {
        //         MessageToast.show("error");
        //       },
        //     });

        //   } else {
        //     that.oScen.removeAllTokens();
        //   }

        // }
        // that.handleClose(oEvent);
      },
      getUser: function () {
        let vUser;
        if (sap.ushell.Container) {
          let email = sap.ushell.Container.getService("UserInfo").getUser().getEmail();
          vUser = (email) ? email : "";
        }
        return vUser;
      },
      getData: function () {
        that.oList = this.byId("orderListMV");
        that.oGModel = this.getOwnerComponent().getModel("oGModel");
        sap.ui.core.BusyIndicator.show();
        that.uniqueName = [];
        that.getOwnerComponent().getModel("BModel").read("/getDemandLoc", {
          success: function (oData) {
            that.oLocation = oData.results
            sap.ui.core.BusyIndicator.hide();
          },
          error: function (oData, error) {
            MessageToast.show("error");
          },
        });

        this.getOwnerComponent().getModel("BModel").read("/genPartialProd", {
          success: function (oData) {
            that.oProdData = oData.results

            sap.ui.core.BusyIndicator.hide();
          },
          error: function (oData, error) {
            MessageToast.show("error");
          },
        });

        this.getOwnerComponent().getModel("PModel").read("/getODModelVersions", {
          success: function (oData) {
            var oRes = oData.results
            that.oGModelDef.setProperty("/oModelData", oRes)
            sap.ui.core.BusyIndicator.hide();
          },
          error: function (oData, error) {
            MessageToast.show("error");
          },
        });
      },

      onGetData: function () {
        var oLocation = that.byId("idlocMV").getValue()     //that.oGModel.getProperty("/oLocItem")
        var oProduct = that.byId("prodInputMV").getValue() //that.oGModel.getProperty("/oProdItem")
        var oType = that.byId("idTypeMV").getValue();
        var oModel = that.byId("idModelMV").getValue()   //that.oGModel.getProperty("/oModelItem")
        var oFilters = []

        if (oLocation == "" || oProduct == "" || oModel == "") {
          MessageToast.show("Select location, product & model version fields");
          return false;
        }

        if (oLocation.length > 0) {
          var sFilter = new sap.ui.model.Filter({
            path: "LOCATION_ID",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: oLocation,
          });
          oFilters.push(sFilter);
        }


        if (oProduct.length > 0) {
          var sFilter = new sap.ui.model.Filter({
            path: "PRODUCT_ID",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: oProduct,
          });
          oFilters.push(sFilter);
        }

        if (oType.length > 0) {
          var sFilter = new sap.ui.model.Filter({
            path: "OBJ_TYPE",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: oType,
          });
          oFilters.push(sFilter);
        }

        if (oModel.length > 0) {
          var sFilter = new sap.ui.model.Filter({
            path: "MODEL_VERSION",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: oModel,
          });
          oFilters.push(sFilter);
        }

        sap.ui.core.BusyIndicator.show();
        this.getOwnerComponent().getModel("PModel").read("/getODModelVersions", {
          filters: oFilters,
          success: function (oData) {
            sap.ui.core.BusyIndicator.hide();
            that.oModel = oData.results
            that.ConvertedDate(that.oModel)
            var oJSONModel = new sap.ui.model.json.JSONModel();
            oJSONModel.setData({
              aItems: that.oModel  //oAllData
            })
            //     that.locModel.setData(uniqueArray)
            that.byId("orderListMV").setModel(oJSONModel)

            sap.ui.core.BusyIndicator.hide();
          },
          error: function (oData, error) {
            MessageToast.show("error");
          },
        });

      },

      removeDuplicate: function (array, key) {
        var check = new Set();
        return array.filter(obj => !check.has(obj[key]) && check.add(obj[key]));
      },

      onResetData: function () {
        that.byId("idlocMV").setValue("");
        that.byId("prodInputMV").setValue("");
        that.byId("idTypeMV").setValue("");
        that.byId("idModelMV").setValue("");
        var oJSONModel = new sap.ui.model.json.JSONModel([]);
        that.oTable.setModel(oJSONModel)
      },
      ConvertedDate: function (aData) {
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
        that.oModel.forEach(ele => {
          const originalDate = ele.TIMESTAMP;
          const targetTimeZone = that.timezone;

          if (that.opr == "-") {
            originalDate.setTime(originalDate.getTime() + (that.zHours + that.zMin));
          }
          else {
            originalDate.setTime(originalDate.getTime() - (that.zHours + that.zMin));
          }

          var opr = (targetTimeZone.split("UTC")[1]).slice(0, 1);
          var hours = ((targetTimeZone.split("UTC")[1]).slice(1)).split(":")[0];
          var min = ((targetTimeZone.split("UTC")[1]).slice(1)).split(":")[1];
          var mHours = hours * 60 * 60 * 1000;
          var mMins = min * 60 * 1000;

          if (opr == "-") {
            originalDate.setTime(originalDate.getTime() - (mHours + mMins));
          }
          else {
            originalDate.setTime(originalDate.getTime() + (mHours + mMins));
          }
          const convertedDate = originalDate.toLocaleString('en-US', { dateStyle: "medium", timeStyle: "medium", hour12: true });
          ele.TIMESTAMP = convertedDate;
        });
      },
      /*Getting variant view data*/
      getVariantData: function () {
        var ndData = [];
        var dData = [], uniqueName = [];
        that.uniqueName = [];
        var oModel = that.getOwnerComponent().getModel('oModel');
        sap.ui.core.BusyIndicator.show();
        that.oGModelDef = that.getOwnerComponent().getModel("oGModelDef");
        var variantUser = this.getUser();
        // var variantUser = 'pradeepkumardaka@sbpcorp.in';
        that.oGModelDef.setProperty("/UserId", variantUser);
        this.getView().getModel("BModel").read("/getVariantHeader", {
          filters: [
            new Filter(
              "USER",
              FilterOperator.EQ,
              variantUser
            ),
            new Filter(
              "APPLICATION_NAME",
              FilterOperator.EQ,
              "Model Logs"
            ),
          ],
          success: function (oData) {
            if (oData.results.length === 0) {
              that.oGModelDef.setProperty("/variantDetails", "");
              that.oGModelDef.setProperty("/fromFunction", "X");
              uniqueName.unshift({
                "VARIANTNAME": "Standard",
                "VARIANTID": "0",
                "DEFAULT": "Y",
              })
              that.oGModelDef.setProperty("/viewNames", uniqueName);
              that.oGModelDef.setProperty("/defaultDetails", "");
              that.viewDetails.setData({
                items1: uniqueName
              });
              that.varianNames = uniqueName;
              sap.ui.getCore().byId("idMatListMV").setModel(that.viewDetails);
              sap.ui.getCore().byId("idMatListMV").removeSelections(true);
              if (sap.ui.getCore().byId("varNameListMV")) {
                sap.ui.getCore().byId("varNameListMV").setModel(that.viewDetails);
              }
              var Default = "Standard";
              if (that.oGModelDef.getProperty("/newVaraintFlag") === "X") {
                var newVariant = that.oGModelDef.getProperty("/newVariant");
                that.handleSelectPress(newVariant[0].VARIANTNAME);
                that.oGModelDef.setProperty("/newVaraintFlag", "");
              } else {
                that.handleSelectPress(Default);
              }
              sap.ui.getCore().byId("idSaveMV").setVisible(false);
            }
            else {
              for (var i = 0; i < oData.results.length; i++) {
                if (oData.results[i].DEFAULT === "Y") {
                  dData.push(oData.results[i]);
                }
                ndData.push(oData.results[i]);
              }

              if (dData.length > 0) {
                that.oGModelDef.setProperty("/defaultVariant", dData);
              }
              that.oGModelDef.setProperty("/VariantData", ndData);

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
        var headerData = that.oGModelDef.getProperty("/VariantData");
        if (headerData.length > 0) {
          for (var i = 0; i < headerData.length; i++) {
            oFilters.push(new Filter("VARIANTID", FilterOperator.EQ, headerData[i].VARIANTID));
          }
        }
        this.getOwnerComponent().getModel("BModel").read("/getVariant", {
          filters: [oFilters],
          success: function (oData) {
            var variantNewData = oData.results;
            aData = variantNewData.map(item1 => {
              const item2 = headerData.find(item2 => item2.VARIANTID === item1.VARIANTID);
              return item2 ? { ...item1, ...item2 } : { ...item1 };
            });
            that.oGModelDef.setProperty("/variantDetails", aData);
            if (aData.length > 0) {
              uniqueName = that.removeDuplicate(aData, "VARIANTNAME");
              that.oGModelDef.setProperty("/saveBtn", "");
              for (var k = 0; k < uniqueName.length; k++) {
                if (uniqueName[k].DEFAULT === "Y") {
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

            that.oGModelDef.setProperty("/fromFunction", "X");
            if (Default) {
              uniqueName.unshift({
                "VARIANTNAME": "Standard",
                "VARIANTID": "0",
                "DEFAULT": "N"
              })
              that.oGModelDef.setProperty("/viewNames", uniqueName);
              that.variantModel.setData({
                items1: uniqueName
              });
              that.varianNames = uniqueName;
              that.oGModelDef.setProperty("/defaultDetails", defaultDetails);
              sap.ui.getCore().byId("idMatListMV").setModel(that.variantModel);
              sap.ui.getCore().byId("idMatListMV").removeSelections(true);
              if (sap.ui.getCore().byId("varNameListMV")) {
                sap.ui.getCore().byId("varNameListMV").setModel(that.variantModel);
              }
              if (that.oGModelDef.getProperty("/newVaraintFlag") === "X") {
                var newVariant = that.oGModelDef.getProperty("/newVariant");
                that.handleSelectPress(newVariant[0].VARIANTNAME);
                that.oGModelDef.setProperty("/newVaraintFlag", "");
              } else {
                that.handleSelectPress(Default);
              }
            } else {
              uniqueName.unshift({
                "VARIANTNAME": "Standard",
                "VARIANTID": "0",
                "DEFAULT": "Y"
              })
              that.oGModelDef.setProperty("/viewNames", uniqueName);
              that.oGModelDef.setProperty("/defaultDetails", "");

              that.viewDetails.setData({
                items1: uniqueName
              });
              that.varianNames = uniqueName;
              sap.ui.getCore().byId("idMatListMV").setModel(that.viewDetails);
              sap.ui.getCore().byId("idMatListMV").removeSelections(true);
              if (sap.ui.getCore().byId("varNameListMV")) {
                sap.ui.getCore().byId("varNameListMV").setModel(that.viewDetails);
              }
              var Default = "Standard";
              if (that.oGModelDef.getProperty("/newVaraintFlag") === "X") {
                var newVariant = that.oGModelDef.getProperty("/newVariant");
                that.handleSelectPress(newVariant[0].VARIANTNAME);
                that.oGModelDef.setProperty("/newVaraintFlag", "");
              } else {
                that.handleSelectPress(Default);
              }
            }
            sap.ui.getCore().byId("idSaveMV").setVisible(false);

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

        var oLoct, oProd, oVersi, oScena;
        that.locProdFilters = [], that.prodFilters = [];
        that.finaloTokens = [];
        that.byId("idlocMV").setValue();
        that.byId("prodInputMV").setValue();
        that.byId("idModelMV").setValue();
        that.byId("idTypeMV").setValue();
        that.oGModelDef.setProperty("/oLocItem", "");
        that.oGModelDef.setProperty("/oProdItem", "");
        that.oGModelDef.setProperty("/oModelItem", "");
        that.oGModelDef.setProperty("/oScenItem", "");
        var oTableItems = that.oGModelDef.getProperty("/variantDetails");
        if (that.oGModelDef.getProperty("/fromFunction") === "X") {
          that.oGModelDef.setProperty("/fromFunction", "");
          var selectedApp = oEvent;
          var listItems = sap.ui.getCore().byId("idMatListMV").getItems();
          for (var i = 0; i < listItems.length; i++) {
            if (listItems[i].getTitle() === oEvent) {
              listItems[i].setSelected(true);
            }
          }
          that.byId("idVariantNameMV").setText(selectedApp);
          that.oGModelDef.setProperty("/variantName", selectedApp);
        } else {
          var selectedApp = oEvent.getSource().getSelectedItem().getTitle();
          that.byId("idVariantNameMV").setText(selectedApp);
          that.oGModelDef.setProperty("/variantName", selectedApp);
        }
        if (selectedApp !== "Standard") {
          for (var i = 0; i < oTableItems.length; i++) {
            if (selectedApp === oTableItems[i].VARIANTNAME && oTableItems[i].APPLICATION_NAME === "Model Logs") {
              if (oTableItems[i].FIELD.includes("Loc")) {
                oLoct = oTableItems[i].VALUE;
                that.oGModelDef.setProperty("/oLocItem", oLoct);
              }
              else if (oTableItems[i].FIELD.includes("Prod")) {
                oProd = oTableItems[i].VALUE;
                that.oGModelDef.setProperty("/oProdItem", oProd);
              }

              else if (oTableItems[i].FIELD.includes("Vers")) {
                oVersi = oTableItems[i].VALUE;
                that.oGModelDef.setProperty("/oVerItem", oVersi);
              }
              else if (oTableItems[i].FIELD.includes("Type")) {
                oScena = oTableItems[i].VALUE;
                that.oGModelDef.setProperty("/oScenItem", oScena);
              }
            }
          }

          that.byId("idlocMV").setValue(oLoct);
          that.byId("prodInputMV").setValue(oProd);
          that.byId("idModelMV").setValue(oVersi);
          that.byId("idTypeMV").setValue(oScena);
          that._popOver.close();
          that.byId("idDropDownMV").setPressed(false);
          sap.ui.core.BusyIndicator.hide();
        }
        else {
          that.byId("idDropDownMV").setPressed(false);
          sap.ui.getCore().byId("idSaveMV").setVisible(false);
          that.onResetData();
          that._popOver.close();
          sap.ui.core.BusyIndicator.hide();
        }
      },
      /**
          * Closing the VariantNames fragment
          */
      handleManageClose: function () {
        sap.ui.getCore().byId("_IDGenSearchField1MV").setValue();
        if (this._manageVariant) {
          that._manageVariant.destroy(true);
          that._manageVariant = "";
          that.oGModelDef.setProperty('/deletedFlag', "X");
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
        var source = sap.ui.getCore().byId("varNameListMV");
        source.removeItem(selectedItem);
        that.oGModelDef.setProperty('/deletedFlag', "X");
      },
      /**
               /**
             * Opening the VariantNames fragment on press of "Manage" in popover fragment
             * @param {*} oEvent 
             */
      onManageOpen: function (oEvent) {
        that._popOver.close();
        that.byId("idDropDownMV").setPressed(false);
        if (that.oGModelDef.getProperty("/deletedFlag") === "X") {
          if (!this._manageVariant) {
            this._manageVariant = sap.ui.xmlfragment(
              "vcpapp.vcppredictions.view.VariantNames",
              this
            );
            this.getView().addDependent(this._manageVariant);
          }
          that.newModel = new sap.ui.model.json.JSONModel();
          that.emptyModel = new sap.ui.model.json.JSONModel([]);
          that.newModel.setData({ items1: that.varianNames });
          sap.ui.getCore().byId("varNameListMV").setModel(that.newModel);
          that._manageVariant.open();
          that.oGModelDef.setProperty('/deletedFlag', "");
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
        var initalDetails = that.oGModelDef.getProperty("/defaultVariant");
        var oTable = sap.ui.getCore().byId("varNameListMV").getItems();
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
        if (initalDetails) {
          if (parseInt(newDefault[0].VARIANTID) === initalDetails[0].VARIANTID) {
            that.handleManageClose();
          } else if (newDefault[0].VARIANTNAME === "Standard") {
            for (i in initalDetails) {
              initalDetails[i].DEFAULT = "N"
            }
            that.getView().getModel("BModel").callFunction("/updateVariant", {
              method: "GET",
              urlParameters: {
                VARDATA: JSON.stringify(initalDetails)
              },
              success: function (oData) {
                that.handleManageClose();
                that.onAfterRendering();
              },
              error: function (error) {
                sap.m.MessageToast.show("Failed to update variant");
              },
            });
          } else {

            that.getView().getModel("BModel").callFunction("/updateVariant", {
              method: "GET",
              urlParameters: {
                VARDATA: JSON.stringify(newDefault)
              },
              success: function (oData) {
                that.handleManageClose();
                that.onAfterRendering();
              },
              error: function (error) {
                sap.m.MessageToast.show("Failed to update variant");
              },
            });
            for (i in initalDetails) {
              initalDetails[i].DEFAULT = "N"
            }
            that.getView().getModel("BModel").callFunction("/updateVariant", {
              method: "GET",
              urlParameters: {
                VARDATA: JSON.stringify(initalDetails)
              },
              success: function (oData) {
                that.handleManageClose();
                that.onAfterRendering();
              },
              error: function (error) {
                sap.m.MessageToast.show("Failed to update variant");
              },
            });

          }
        } else {
          that.getView().getModel("BModel").callFunction("/updateVariant", {
            method: "GET",
            urlParameters: {
              VARDATA: JSON.stringify(newDefault)
            },
            success: function (oData) {
              that.handleManageClose();
              that.onAfterRendering();
            },
            error: function (error) {
              sap.m.MessageToast.show("Failed to update variant");
            },
          });
        }

      },
      // delete variant
      deleteVariant: function () {
        that.getView().getModel("BModel").callFunction("/createVariant", {
          method: "GET",
          urlParameters: {
            Flag: "D",
            USER: that.oGModelDef.getProperty("/UserId"),
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
      onDropDownPress: function (oEvent) {
        var count = 0;
        if (oEvent.getSource().getPressed()) {
          this._popOver.openBy(oEvent.getSource());
          var locDetails = that.byId("idlocMV").getValue();
          var productDetails = that.byId("prodInputMV").getValue();
          var versionDetails = that.byId("idModelMV").getValue();
          var ObjectTypeDetails = that.byId("idTypeMV").getValue();
          var locDefault = that.oGModelDef.getProperty("/oLocItem");
          var itemsDefault = that.oGModelDef.getProperty("/oProdItem");
          var versDefault = that.oGModelDef.getProperty("/oVerItem");
          var typeDefault = that.oGModelDef.getProperty("/oScenItem");
          var selectedID = that.byId("idVariantNameMV").getText();
          if (selectedID !== "Standard" && that.oGModelDef.getProperty("/saveBtn") !== "X") {
            if (productDetails === itemsDefault && versionDetails === versDefault
              && locDetails === locDefault && ObjectTypeDetails === typeDefault
            ) {
              sap.ui.getCore().byId("idSaveMV").setVisible(false);
            }
            else {
              sap.ui.getCore().byId("idSaveMV").setVisible(true);
              sap.ui.getCore().byId("idSaveMV").setType("Emphasized");
            }
          }
        } else {
          this._popOver.close();
        }
      },
      /**
       * Creating a new VIEW on press of save in NameVariant fragment
       * @param {*} oEvent 
       */
      onCreate: function (oEvent) {
        that.byId("idDropDownMV").setPressed(false);
        var array = [];
        var details = {};
        var sLocation = that.byId("idlocMV").getValue();
        var Field1 = that.byId("idlocMV").getParent().getLabel();
        var sProduct = that.byId("prodInputMV").getValue();
        var Field2 = that.byId("prodInputMV").getParent().getLabel();
        var sVersion = that.byId("idModelMV").getValue();
        var Field3 = that.byId("idModelMV").getParent().getLabel();
        var sScenario = that.byId("idTypeMV").getValue();
        var Field4 = that.byId("idTypeMV").getParent().getLabel();

        var varName = sap.ui.getCore().byId("idInputMV").getValue();
        if(!sLocation && !sProduct && !sVersion && !sScenario){
          sap.ui.getCore().byId("_IDGenCheckBox1MV").setSelected(false);
          sap.ui.getCore().byId("idInputMV").setValue();
          that._nameFragment.close();
          return MessageToast.show("No values selected in filters Location, Product, IBP Version & IBP Scenario ");
      }
        var sDefault = sap.ui.getCore().byId("_IDGenCheckBox1MV").getSelected();
        if (varName) {
          if (sDefault && that.oGModelDef.getProperty("/defaultDetails").length > 0) {
            var defaultChecked = "Y";
            that.getView().getModel("BModel").callFunction("/updateVariant", {
              method: "GET",
              urlParameters: {
                VARDATA: JSON.stringify(that.oGModelDef.getProperty("/defaultDetails"))
              },
              success: function (oData) {
                sap.m.MessageToast.show(oData);
              },
              error: function (error) {
                sap.m.MessageToast.show("Failed to create variant");
              },
            });

          } else if (sDefault && that.oGModelDef.getProperty("/defaultDetails").length === 0) {
            var defaultChecked = "Y";
          } else {
            var defaultChecked = "N";
          }
          // for (var i = 0; i < sLocation.length; i++) {
          if(sLocation){
          details = {
            Field: Field1,
            FieldCenter: sLocation,
            Value: sLocation,
            FAVOURITE: "N",
            Default: defaultChecked
          }
          array.push(details);
          }

          // for (var k = 0; k < sProduct.length; k++) {
          if(sProduct){
          details = {
            Field: Field2,
            FieldCenter: sProduct,
            Value: sProduct,
            FAVOURITE: "N",
            Default: defaultChecked
          }
          array.push(details);
        }
        if(sVersion){
          details = {
            Field: Field3,
            FieldCenter: sVersion,
            Value: sVersion,
            FAVOURITE: "N",
            Default: defaultChecked
          }
          array.push(details);
        }
        if(sScenario){
          details = {
            Field: Field4,
            FieldCenter: sScenario,
            Value: sScenario,
            FAVOURITE: "N",
            Default: defaultChecked
          }
          array.push(details);
        }
          for (var j = 0; j < array.length; j++) {
            array[j].IDNAME = varName;
            array[j].App_Name = "Model Logs"
          }
          that.getView().getModel("BModel").callFunction("/createVariant", {
            method: "GET",
            urlParameters: {
              Flag: "X",
              USER: that.oGModelDef.getProperty("/UserId"),
              VARDATA: JSON.stringify(array)
            },
            success: function (oData) {
              that.oGModelDef.setProperty("/newVariant", oData.results);
              that.oGModelDef.setProperty("/newVaraintFlag", "X");
              sap.ui.getCore().byId("_IDGenCheckBox1MV").setSelected(false);
              sap.ui.getCore().byId("idInputMV").setValue();
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
      onVariantSave: function () {
        that.byId("idDropDownMV").setPressed(false);
        that._popOver.close();
        that._nameFragment.open();
        sap.ui.getCore().byId("idInputMV").setValue();
        sap.ui.getCore().byId("idInputMV").setValueState("None");
        sap.ui.getCore().byId("idSaveBtnMV").setEnabled(true);
      },
      onSaveClose: function () {
        that._nameFragment.close();
      },
      /**
            * Save the current view if any changes in the existing properties.
            */
      onSave: function () {
        var updatedDetails = {};
        var updatedArray = [];
        var selectedItem = sap.ui.getCore().byId("idMatListMV");
        if (selectedItem.getSelectedItem() !== null) {
          var Default = selectedItem.getSelectedItem().getBindingContext().getObject().DEFAULT;
          var VariantId = selectedItem.getSelectedItem().getBindingContext().getObject().VARIANTID;
          var VariantName = selectedItem.getSelectedItem().getBindingContext().getObject().VARIANTNAME;
        } else {
          var defaulDetails1 = that.oGModelDef.getProperty("/defaultDetails");
          var VariantId = defaulDetails1[0].VARIANTID;
          var VariantName = defaulDetails1[0].VARIANTNAME;
          var Default = "Y";
        }
        var Field1 = that.byId("idlocMV").getParent().getLabel();
        var sLocation = that.byId("idlocMV").getValue();
        var Field2 = that.byId("prodInputMV").getParent().getLabel();
        var sProduct = that.byId("prodInputMV").getValue();
        var sVersion = that.byId("idModelMV").getValue();
        var Field3 = that.byId("idModelMV").getParent().getLabel();
        var sScenario = that.byId("idTypeMV").getValue();
        var Field4 = that.byId("idTypeMV").getParent().getLabel();
        if (VariantName) {
          if(sLocation){
          updatedDetails = {
            Field: Field1,
            FieldCenter: sLocation,
            Value: sLocation,
            FAVOURITE: "N",
            Default: Default
          }
          updatedArray.push(updatedDetails);
          }

          // for (var k = 0; k < sProduct.length; k++) {
          if(sProduct){
          updatedDetails = {
            Field: Field2,
            FieldCenter: sProduct,
            Value: sProduct,
            FAVOURITE: "N",
            Default: Default
          }
          updatedArray.push(updatedDetails);
          }
          if(sVersion){
          updatedDetails = {
            Field: Field3,
            FieldCenter: sVersion,
            Value: sVersion,
            FAVOURITE: "N",
            Default: Default
          }
          updatedArray.push(updatedDetails);
        }
        if(sScenario){
          updatedDetails = {
            Field: Field4,
            FieldCenter: sScenario,
            Value: sScenario,
            FAVOURITE: "N",
            Default: Default
          }
          updatedArray.push(updatedDetails);
        }
          for (var j = 0; j < updatedArray.length; j++) {
            updatedArray[j].ID = VariantId;
            updatedArray[j].IDNAME = VariantName;
            updatedArray[j].App_Name = "Model Logs"
          }


          that.getView().getModel("BModel").callFunction("/createVariant", {
            method: "GET",
            urlParameters: {
              Flag: "E",
              USER: that.oGModelDef.getProperty("/UserId"),
              VARDATA: JSON.stringify(updatedArray)
            },
            success: function (oData) {
              that.oGModelDef.setProperty("/newVariant", oData.results);
              that.oGModelDef.setProperty("/newVaraintFlag", "X");
              that.onAfterRendering();
              that._popOver.close();
              that.byId("idDropDownMV").setPressed(false);
            },
            error: function (error) {

              sap.m.MessageToast.show("Failed to update variant");
            },
          });
        } else {
          sap.m.MessageToast.show("Please fill View Name");
        }
      },
    });
  });

