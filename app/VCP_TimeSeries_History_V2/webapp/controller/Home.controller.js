sap.ui.define(
  [
    "vcpapp/vcptimeserieshistoryv2/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/Device",
    "sap/ui/core/Fragment",
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
    "../model/formatter"
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    BaseController,
    MessageToast,
    MessageBox,
    JSONModel,
    Filter,
    FilterOperator,
    Device,
    Fragment,
    exportLibrary,
    Spreadsheet,
    formatter
  ) {
    "use strict";
    var that, oGModel;
    var aResults;
    var Verscena;
    var currentPage = 0;

    var EdmType = exportLibrary.EdmType;
    return BaseController.extend("vcpapp.vcptimeserieshistoryv2.controller.Home", {
      formatter: formatter,
      /**
       * Called when a controller is instantiated and its View controls (if available) are already created.
       * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
       */
      onInit: function () {
        that = this;
        that.skip = 0;
        that.oGModel = this.getOwnerComponent().getModel("oGModel");

        that.byId("idIconTabBarTSH").setVisible(false)
        // Declaring JSON Models and size limits
        that.oListModel = new JSONModel();
        that.oProfileModel = new JSONModel();
        that.locModel = new JSONModel();
        that.prodModel = new JSONModel();
        that.CompModel = new JSONModel();
        that.StruNodeModel = new JSONModel();
        this.variantModel = new JSONModel();
        this.viewDetails = new JSONModel();
        this.newModel = new JSONModel();
        this.newDateModel = new JSONModel();

        this.oListModel.setSizeLimit(5000);
        that.locModel.setSizeLimit(1000);
        that.prodModel.setSizeLimit(1000);
        that.CompModel.setSizeLimit(1000);
        that.StruNodeModel.setSizeLimit(1000);
        that.variantModel.setSizeLimit(5000);
        that.viewDetails.setSizeLimit(5000);
        that.newDateModel.setSizeLimit(5000);

        // Declaring Value Help Dialogs
        this._oCore = sap.ui.getCore();
        if (!this._valueHelpDialogLoc) {
          this._valueHelpDialogLoc = sap.ui.xmlfragment(
            "vcpapp.vcptimeserieshistoryv2.view.LocDialog",
            this
          );
          this.getView().addDependent(this._valueHelpDialogLoc);
        }
        if (!this._valueHelpDialogProd) {
          this._valueHelpDialogProd = sap.ui.xmlfragment(
            "vcpapp.vcptimeserieshistoryv2.view.ProdDialog",
            this
          );
          this.getView().addDependent(this._valueHelpDialogProd);
        }
        if (!this._valueHelpDialogVers) {
          this._valueHelpDialogVers = sap.ui.xmlfragment(
            "vcpapp.vcptimeserieshistoryv2.view.CharacDes",
            this
          );
          this.getView().addDependent(this._valueHelpDialogVers);
        }
        //router
        this.getRouter()
          .getRoute("Home")
          .attachPatternMatched(this._onPatternMatched.bind(this));
        //  that.getEnable();

      },
      closeBatchFragment: function () {
        if (that.newDialogFragment) {
          that.newDialogFragment.destroy();
          that.newDialogFragment = "";
        }
      },


      /*
       * Called when the URL matches pattern "Home".
       */
      _onPatternMatched: function () {
        that = this;
        that.deletedArray = [];
        that.oList = this.byId("orderListTSH");
        this.oLoc = this.byId("idlocTSH");
        this.oProd = this.byId("prodInputTSH");
        this.oChar = this.byId("idCharTSH");
        that._valueHelpDialogProd.setTitleAlignment("Center");
        that._valueHelpDialogLoc.setTitleAlignment("Center");
        that._valueHelpDialogVers.setTitleAlignment("Center");
        this.oProdList = this._oCore.byId(
          this._valueHelpDialogProd.getId() + "-list"
        );
        this.oLocList = this._oCore.byId(
          this._valueHelpDialogLoc.getId() + "-list"
        );
        this.oCompList = this._oCore.byId(
          this._valueHelpDialogVers.getId() + "-list"
        );
        that.oList.removeSelections();
        // Calling function
        this.getData();
      },

      /**
       * Getting Data Initially and binding to Locations dialog
       */
      //get data;
      getData: function () {
        that.getOwnerComponent().getModel("BModel").read("/getUserPreferences", {
          filters: [
            new Filter("PARAMETER", FilterOperator.EQ, "MAX_RECORDS")
          ],
          success: function (oData) {
            that.oGModel.setProperty("/MaxCount", oData.results[0].PARAMETER_VALUE);

            // Class IBP Characteristics
            //     that.loadCharNumData();

          },
          error: function (oData, error) {
            console.log(error)
          },
        });
        // that.version();
        that.oGModel = this.getOwnerComponent().getModel("oGModel");
        sap.ui.core.BusyIndicator.show();
        //   var variantUser = this.getUser();
        //  that.oGModel.setProperty("/UserId", variantUser);
        this.getModel("BModel").read("/getDemandLoc", {
          success: function (oData) {
            that.locModel.setData(oData);
            that.oLocList.setModel(that.locModel);
            sap.ui.core.BusyIndicator.hide();
          },
          error: function (oData, error) {
            sap.ui.core.BusyIndicator.hide()
            MessageToast.show("error");

          },
        });
        that.skip = 0;
          that.topCount=50000;
        that.TSData = [];
        // that.getVariantData();
      },

      /**
       * This function is called when click on Value help on Input box.
       * In this function based in sId will open the dialogs.
       * @param {object} oEvent -the event information.
       */
      handleValueHelp: function (oEvent) {
        sap.ui.core.BusyIndicator.show();
        var sId = oEvent.getParameter("id");
        // Loc Dialog
        if (sId.includes("loc")) {
          var oLoc = that.oGModel.getProperty("/setLocation");
          if (oLoc) {
            for (var k = 0; k < that.oLocList.getItems().length; k++) {
              if (that.oLocList.getItems()[k].getTitle() === oLoc) {
                that.oLocList.getItems()[k].setSelected(true);
              }
            }
          }
          that._valueHelpDialogLoc.open();
          // Prod Dialog
        } else if (sId.includes("prod")) {
          if (that.byId("idlocTSH").getTokens().length <= 0) {
            MessageToast.show("Please select a Location")
          } else {
            var oProd = that.oGModel.getProperty("/setProduct");
            if (oProd) {
              for (var k = 0; k < that.oProdList.getItems().length; k++) {
                if (that.oProdList.getItems()[k].getTitle() === oProd) {
                  that.oProdList.getItems()[k].setSelected(true);
                }
              }
            }
            that._valueHelpDialogProd.open();
          }

          // Char Dialog
        } else if (sId.includes("idCharTSH")) {
          if (that.byId("idlocTSH").getTokens().length <= 0 && that.byId("prodInputTSH").getTokens().length <= 0) {
            MessageToast.show("Please select a Location  and Product")
          } else {
            var oChar = that.oGModel.getProperty("/setChar");
            if (oChar) {
              for (var k = 0; k < that.oCompList.getItems().length; k++) {
                if (that.oCompList.getItems()[k].getTitle() === oChar) {
                  that.oCompList.getItems()[k].setSelected(true);
                }
              }
            }
            that._valueHelpDialogVers.open();
          }

        }
        sap.ui.core.BusyIndicator.hide();
      },

      /**
       * Called when 'Close/Cancel' button in any dialog is pressed.
       * In this function based in sId will close the dialogs.
       */
      //close;
      handleClose: function (oEvent) {
        var sId = oEvent.getParameter("id");
        // Loc Dialog
        if (sId.includes("Loc")) {
          that._oCore
            .byId(this._valueHelpDialogLoc.getId() + "-searchField")
            .setValue("");
          if (that.oLocList.getBinding("items")) {
            that.oLocList.getBinding("items").filter([]);
          }
          // Prod Dialog
        } else if (sId.includes("prod")) {
          that._oCore
            .byId(this._valueHelpDialogProd.getId() + "-searchField")
            .setValue("");
          if (that.oProdList.getBinding("items")) {
            that.oProdList.getBinding("items").filter([]);
          }
          // Component Dialog
        } else if (sId.includes("idCharTSH")) {
          that._oCore
            .byId(this._valueHelpDialogVers.getId() + "-searchField")
            .setValue("");
          if (that.oCompList.getBinding("items")) {
            that.oCompList.getBinding("items").filter([]);
          }

          // structure Dialog
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
                  new Filter("DEMAND_LOC", FilterOperator.Contains, sQuery),
                  new Filter("DEMAND_DESC", FilterOperator.Contains, sQuery),
                ],
                and: false,
              })
            );
          }
          that.oLocList.getBinding("items").filter(oFilters);
          // Product
        } else if (sId.includes("prod")) {
          if (sQuery !== "") {
            oFilters.push(
              new Filter({
                filters: [
                  new Filter("PRODUCT_ID", FilterOperator.Contains, sQuery),
                  new Filter("PROD_DESC", FilterOperator.Contains, sQuery),
                ],
                and: false,
              })
            );
          }
          that.oProdList.getBinding("items").filter(oFilters);
          // Component
        } else if (sId.includes("Comp")) {
          if (sQuery !== "") {
            oFilters.push(
              new Filter({
                filters: [
                  new Filter("COMPONENT", FilterOperator.Contains, sQuery),
                  new Filter("ASMB_DESC", FilterOperator.Contains, sQuery),
                ],
                and: false,
              })
            );
          }
          that.oCompList.getBinding("items").filter(oFilters);

        }
        else if (sId.includes("StruSlctList")) {
          if (sQuery !== "") {
            oFilters.push(
              new Filter({
                filters: [
                  new Filter("STRUC_NODE", FilterOperator.Contains, sQuery),
                  new Filter("COMPONENT", FilterOperator.Contains, sQuery),
                ],
                and: false,
              })
            );
          }
          that.oStruNodeList.getBinding("items").filter(oFilters);

        }
        else if (sId.includes("GenSearch")) {
          if (sQuery !== "") {
            oFilters.push(
              new Filter({
                filters: [
                  new Filter("VARIANTNAME", FilterOperator.Contains, sQuery),
                  new Filter("USER", FilterOperator.Contains, sQuery)
                  // new Filter("SCOPE", FilterOperator.Contains, sQuery)
                ],
                and: false,
              })
            );
          }
          sap.ui.getCore().byId("varNameListTSH").getBinding("items").filter(oFilters);
        }
      },

      /**
       * This function is called when selection on dialogs list.
       * Selections will be made based on sId.
       * @param {object} oEvent -the event information.
       */
      handleSelection: function (oEvent) {
        var sId = oEvent.getParameter("id"),
          oItem = oEvent.getParameter("selectedItems"),
          aSelectedItems,
          aODdata = [];

        if (sId.includes("Loc")) {
          sap.ui.core.BusyIndicator.show()
          this.oProd = that.byId("idlocTSH");
          var aSelectedLoc = oEvent.getParameter("selectedItems");
          if (that.oGModel.getProperty("/defaultLocation") !== aSelectedLoc) {
            that.byId("idVariantTSH").setModified(true);
          }
          that.oGModel.setProperty("/setLocation", aSelectedLoc);
          // Removing selections of component 
          this.oProdL = that.byId("prodInputTSH")
          this.oComp = that.byId("idCharTSH")
          that.oListtab = new JSONModel([]);
          that.byId("fromDateTSH").setEditable(false);
          that.byId("fromDateTSH").setModel(that.oListtab);
          that.byId("onTabSearchTSH").setValue("");
          that.byId("orderListTSH").setModel(that.oListtab)
          this._valueHelpDialogVers
            .getAggregation("_dialog")
            .getContent()[1]
            .removeSelections();
          that.oProdL.removeAllTokens();
          that.oComp.removeAllTokens();
          that.oProdList.removeSelections();
          that.oCompList.removeSelections();
          if (aSelectedLoc && aSelectedLoc.length > 0) {
            that.oProd.removeAllTokens();
            aSelectedLoc.forEach(function (oItem) {
              that.oProd.addToken(
                new sap.m.Token({
                  key: oItem.getDescription(),
                  text: oItem.getTitle(),
                  editable: false
                })
              );
            });

            var aSelectedLoc = that.oLocList.getSelectedItems();
            var oFilters = [];
            for (var i = 0; i < aSelectedLoc.length; i++) {
              var object = { LOCATION_ID: aSelectedLoc[i].getTitle(), FLAG: "PH" }
            }
            // Calling service to get the component list
            that.getAllProducts(object);

          } else {
            that.oProd.removeAllTokens();
          }
          // Component List
        }
        else if (sId.includes("prod")) {
          that.oSelectedProd = oEvent.getParameter("selectedItems");
          that.loadCharNumData();
          // Component List
        }
        else if (sId.includes("CharaDesTSH")) {
          sap.ui.core.BusyIndicator.show()
          that.oComp = that.byId("idCharTSH");
          that.oListtab = new JSONModel([]);
          that.byId("onTabSearchTSH").setValue("");

          that.byId("orderListTSH").setModel(that.oListtab)
          that.byId("idIconTabBarTSH").setSelectedKey("Weekly")
          // this._valueHelpDialogProd.setRememberSelections(true)
          var aSelectedComp = oEvent.getParameter("selectedItems");
          if (aSelectedComp && aSelectedComp.length > 0) {
            that.oComp.removeAllTokens();
            aSelectedComp.forEach(function (oItem) {
              that.oComp.addToken(
                new sap.m.Token({
                  key: oItem.getTitle(),
                  text: oItem.getTitle(),
                  editable: false
                })
              );
            });


            // var aSelectedLoc = that.oLocList.getSelectedItems()
            // var aSelectedProd = that.oProdList.getSelectedItems();
            var aSelectedComp = that.oCompList.getSelectedItems();

            // // Declaration of filters
            // var oFilters = [];

            // for (var i = 0; i < aSelectedLoc.length; i++) {
            //   var sFilter = new sap.ui.model.Filter({
            //     path: "LOCATION_ID",
            //     operator: sap.ui.model.FilterOperator.EQ,
            //     value1: aSelectedLoc[i].getTitle(),
            //   });
            //   oFilters.push(sFilter);
            // }

            // for (var i = 0; i < aSelectedProd.length; i++) {
            //   sFilter = new sap.ui.model.Filter({
            //     path: "PRODUCT_ID",
            //     operator: sap.ui.model.FilterOperator.EQ,
            //     value1: aSelectedProd[i].getTitle(),
            //   });
            //   oFilters.push(sFilter);
            // }

            // for (var i = 0; i < aSelectedComp.length; i++) {
            //   sFilter = new sap.ui.model.Filter({
            //     path: "CHAR_NUM",
            //     operator: sap.ui.model.FilterOperator.EQ,
            //     value1: aSelectedComp[i].getTitle(),
            //   });
            //   oFilters.push(sFilter);
            // }
            // Calling service to get the component list
            // this.getOwnerComponent().getModel("BModel").read("/getHistoryVC", {
            //   filters: oFilters,
            //   success: function (oData) {
            //     if (oData.results.length > 0) {
            //       that.odCondData = oData.results;
            //       that.getWeekDates();
            //     }
            //     else {
            //       MessageToast.show("No Dates available for selected Location/Product/Characteristic")
            //     }

            //   },
            //   error: function (oData, error) {
            //     sap.ui.core.BusyIndicator.hide()
            //     MessageToast.show("error");
            //   },
            // });
            var dailyFullDates = [];
            that.data = that.oCharNumData;
            that.data = that.oCharNumData.filter(item => item.CHAR_NUM === aSelectedComp[0].getTitle());
            that.data.forEach((el, i) => {
              let value = el.CAL_DATE;
              // let value1 = `${value.getFullYear()}-${(value.getMonth() + 1).toString().padStart(2, '0')}-${value.getDate().toString().padStart(2, '0')}`;
              let obj = {};
              obj.DATE = value;
              obj.key = value;
              dailyFullDates.push(obj);
            });
            var totalArrya = dailyFullDates.sort((a, b) => new Date(a.DATE) - new Date(b.DATE));
            that.newDateModel.setData({ resultsCombos: totalArrya });
            that.byId("fromDateTSH").setModel(that.newDateModel);
            that.byId("fromDateTSH").setEditable(true);
            sap.ui.core.BusyIndicator.hide()

          } else {
            sap.ui.core.BusyIndicator.hide()
            that.oComp.removeAllTokens();
          }

        }
        that.handleClose(oEvent);
      },
      getAllProducts: function (object) {
        that.productsData = [];
        var tsArray = [];
        tsArray.push(object)
        // this.getOwnerComponent().getModel("BModel").read("/genPartialProd", {
        //   filters: filtersTotal,
        //   urlParameters: {
        //     "$skip": that.skip,
        //     "$top": topCount
        //   },
        this.getModel("BModel").callFunction("/getTSData", {
          method: "GET",
          urlParameters: {
            TSDATA: JSON.stringify(tsArray)
          },
          success: function (oData) {
            // sap.ui.core.BusyIndicator.hide();
            // if (topCount == oData.results.length) {
            //   that.skip += parseInt(topCount);
            //   that.productsData = that.productsData.concat(oData.results);
            //   that.getAllProducts(filtersTotal);
            // }else{
            if (oData) {
              that.productsData = JSON.parse(oData.getTSData);
              var prodDetails = that.removeDuplicate(that.productsData, 'PRODUCT_ID');
              that.prodModel.setData({ results: prodDetails });
              that.oProdList.setModel(that.prodModel);
              sap.ui.core.BusyIndicator.hide()
            }
            // }
          },
          error: function (oData, error) {
            sap.ui.core.BusyIndicator.hide()
            MessageToast.show("error");
          },
        });
      },
      loadCharNumData: function () {
        sap.ui.core.BusyIndicator.show()
        this.oProd = that.byId("prodInputTSH");
        this.oComp = that.byId("idCharTSH")
        that.oListtab = new JSONModel([]);
        that.oComp.setModel(that.oListtab);
        that.oComp.removeAllTokens()
        that.oCompList.removeSelections();
        that.oListtab = new JSONModel([]);
        that.byId("onTabSearchTSH").setValue("")

        that.byId("orderListTSH").setModel(that.oListtab)
        that.byId("idIconTabBarTSH").setSelectedKey("Weekly")

        var aSelectedProd = that.oSelectedProd //oEvent.getParameter("selectedItems");
        // Removing selections of component 

        if (aSelectedProd && aSelectedProd.length > 0) {
          that.oProd.removeAllTokens();
          aSelectedProd.forEach(function (oItem) {
            that.oProd.addToken(
              new sap.m.Token({
                key: oItem.getDescription(),
                text: oItem.getTitle(),
                editable: false
              })
            );
          });

          var aSelectedLoc = that.oLocList.getSelectedItems()
          var aSelectedProd = that.oProdList.getSelectedItems();

          // Declaration of filters
          var oFilters = [], object = {}, finalArrya = [];
          for (var i = 0; i < aSelectedLoc.length; i++) {
            object = { LOCATION_ID: aSelectedLoc[i].getTitle(), FLAG: 'CC' }
          }

          for (var i = 0; i < aSelectedProd.length; i++) {
            object.PRODUCT_ID = aSelectedProd[i].getTitle()
          }
          that.oCharNumData = [];
          finalArrya.push(object);
          this.getModel("BModel").callFunction("/getTSData", {
            method: "GET",
            urlParameters: {
              TSDATA: JSON.stringify(finalArrya)
            },
            success: function (oData) {
              if (oData.getTSData) {
                var dailyFullDates = [];
                that.oCharNumData = JSON.parse(oData.getTSData);
                // let uniqueArray1 = Array.from(new Set(that.oCharNumData.map(item => item.CHAR_NUM)))
                //   .map(CHAR_NUM => that.oCharNumData.find(item => item.CHAR_NUM === CHAR_NUM));
                let uniqueArray1 = that.removeDuplicate(that.oCharNumData, 'CHAR_NUM');
                let uniqueWeekData = that.removeDuplicate(that.oCharNumData, 'CAL_DATE')
                that.CompModel.setData({
                  results: uniqueArray1
                })
                that.oCompList.setModel(that.CompModel);
                uniqueWeekData.forEach((el, i) => {
                  let value = el.CAL_DATE;
                  // let value1 = `${value.getFullYear()}-${(value.getMonth() + 1).toString().padStart(2, '0')}-${value.getDate().toString().padStart(2, '0')}`;
                  let obj = {};
                  obj.DATE = value;
                  obj.key = value;
                  dailyFullDates.push(obj);
                });
                var totalArrya = dailyFullDates.sort((a, b) => new Date(a.DATE) - new Date(b.DATE));
                that.newDateModel.setData({ resultsCombos: totalArrya });
                that.byId("fromDateTSH").setModel(that.newDateModel);
                that.byId("fromDateTSH").setEditable(true);
                sap.ui.core.BusyIndicator.hide()
                // that.getWeekDates();
                // }
              }
              else {
                sap.ui.core.BusyIndicator.hide()
                MessageToast.show("No data available for the selected Location/Product")
              }
            },
            error: function (oData, error) {
              sap.ui.core.BusyIndicator.hide()
              MessageToast.show("error");
            },
          });

        } else {
          sap.ui.core.BusyIndicator.hide()
          that.oProd.removeAllTokens();
        }
      },

      /**
       * This function is called when click on "Go" button after filling all Input box values.
       * @param {object} oEvent -the event information.
       */

      onGetData: function () {
        if (that.byId("idlocTSH").getTokens.length <= 0 && that.byId("prodInputTSH").getTokens().length <= 0) {
          MessageToast.show("Please select Location and Product ")
          return false
        }
        sap.ui.core.BusyIndicator.show()
        var oList = this.getView().byId("orderListTSH");
        oList.setModel(new sap.ui.model.json.JSONModel());
        var object = {}, finalArray = [];
        // var oList = that.byId("orderListTSH");
        oList.setProperty("growingThreshold", 20);
        that.byId("idIconTabBarTSH").setVisible(true);
        // that.byId("idIconTabBarTSH").mProperties.selectedKey = "Weekly"
        that.byId("idIconTabBarTSH").setSelectedKey("Weekly");
        that.oList.removeSelections();
        var aSelectedLoc = that.oLocList.getSelectedItems();
        var aSelectedProd = that.byId("prodInputTSH").getTokens()[0].getText();
        var aSelectedComp = that.oCompList.getSelectedItems();

        that.oFilters = [];
        for (var i = 0; i < aSelectedLoc.length; i++) {
          // var sFilter = new sap.ui.model.Filter({
          //   path: "LOCATION_ID",
          //   operator: sap.ui.model.FilterOperator.EQ,
          //   value1: aSelectedLoc[i].getTitle(),
          // });
          // that.oFilters.push(sFilter);
          object.LOCATION_ID = aSelectedLoc[i].getTitle();

        }

        // for (var i = 0; i < aSelectedProd.length; i++) {
        // sFilter = new sap.ui.model.Filter({
        //   path: "PRODUCT_ID",
        //   operator: sap.ui.model.FilterOperator.EQ,
        //   value1: aSelectedProd[i].getTitle(),
        // });
        // that.oFilters.push(sFilter);
        object.PRODUCT_ID = aSelectedProd;
        // }


        for (var i = 0; i < aSelectedComp.length; i++) {
          // sFilter = new sap.ui.model.Filter({
          //   path: "CHAR_NUM",
          //   operator: sap.ui.model.FilterOperator.EQ,
          //   value1: aSelectedComp[i].getTitle()
          // });
          // that.oFilters.push(sFilter);
          object.CHAR_NUM = aSelectedComp[i].getTitle();
        }
        if (that.byId("fromDateTSH").getSelectedItem()) {
          // sFilter = new sap.ui.model.Filter({
          //   path: "CAL_DATE",
          //   operator: sap.ui.model.FilterOperator.EQ,
          //   value1: that.byId("fromDateTSH").getSelectedItem().getText()
          // });
          // that.oFilters.push(sFilter);
          object.WEEK_DATE = that.byId("fromDateTSH").getSelectedItem().getText();
        }
        var Flag = "H";
        object.FLAG = Flag;
        finalArray.push(object);
        object = {};

        // this.getOwnerComponent().getModel("BModel").read("/getHistoryDataVC", {
        //   filters: that.oFilters,
        //   urlParameters: {
        //     "$top": 1000,  // Adjust based on the number of records per page
        //     "$skip": currentPage * 50  // Adjust based on the current page
        //   },
        this.getOwnerComponent().getModel("BModel").callFunction("/getTimeSeriesData", {
          method: "GET",
          urlParameters: {
            Skip:that.skip,
            TopCount:that.topCount,
            TSDATA: JSON.stringify(finalArray)
          },
          // sap.ui.core.BusyIndicator.show()
          success: function (oData) {
            sap.ui.core.BusyIndicator.show()
            if (Object.keys(oData).length) {
              var totalData = JSON.parse(oData.getTimeSeriesData);
              if (that.topCount == totalData.length) {
                that.skip += parseInt(that.topCount);
                that.TSData = that.TSData.concat(totalData);
                that.onGetData();
              }
              else{
              that.oWeekly = that.TSData.concat(JSON.parse(oData.getTimeSeriesData));
              that.skip = 0;
              that.TSData=[];
              for (var i = 0; i < that.oWeekly.length; i++) {
                var dateString = that.oWeekly[i].CAL_DATE;

                // Create a Date object from the input string
                var dateObject = new Date(dateString);

                // Array of month names
                var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                // Extract month, day, and year from the date object
                var month = monthNames[dateObject.getMonth()];
                var day = dateObject.getDate();
                var year = dateObject.getFullYear();

                // Construct the desired output string
                var outputDateString = month + " " + day + ", " + year;

                // Update the CAL_DATE property in the object
                that.oWeekly[i].CAL_DATE = outputDateString;
              }
              if (that.oWeekly.length <= 0) {
                sap.ui.core.BusyIndicator.hide();
                MessageToast.show("No Data available for selected fields")
              }
              else {
                that.oListModel.setData(that.oWeekly);
                that.oList.setModel(that.oListModel);
                sap.ui.core.BusyIndicator.hide()
              }
            }
            }
            else {
              sap.ui.core.BusyIndicator.hide();
              MessageToast.show("No Data available for selected fields")
            }
          },
          error: function (oData, error) {
            sap.ui.core.BusyIndicator.hide();
            MessageToast.show("error");
          },

        });
        // that.getHistoryVCDaily();

      },

      getHistoryVCDaily: function (oDaily) {
        that.oList.removeSelections();
        var aSelectedLoc = that.oLocList.getSelectedItems();
        var aSelectedProd = that.oProdList.getSelectedItems();
        var aSelectedComp = that.oCompList.getSelectedItems();
        that.oFilters;
        var object = {}, finalArray = [];
        for (var i = 0; i < aSelectedLoc.length; i++) {
          object.LOCATION_ID = aSelectedLoc[i].getTitle();

        }

        for (var i = 0; i < aSelectedProd.length; i++) {
          object.PRODUCT_ID = aSelectedProd[i].getTitle();
        }


        for (var i = 0; i < aSelectedComp.length; i++) {
          object.CHAR_NUM = aSelectedComp[i].getTitle();
        }
        if (that.byId("fromDateTSH").getSelectedItem()) {
          object.CAL_DATE = that.byId("fromDateTSH").getSelectedItem().getText();
        }
        var Flag = "HD";
        object.FLAG = Flag;
        finalArray.push(object);
        object = {};
        // this.getOwnerComponent().getModel("BModel").read("/getHistoryDailyDataVC", {
        //   filters: that.oFilters,
        //   urlParameters: {
        //     "$top": 1000,
        //     "$skip": currentPage * 50
        //   },
        this.getOwnerComponent().getModel("BModel").callFunction("/getTimeSeriesData", {
          method: "GET",
          urlParameters: {
            Skip: 0,
            TopCount:0,
            TSDATA: JSON.stringify(finalArray)
          },
          success: function (oData) {
            sap.ui.core.BusyIndicator.hide();
            if (oData.getTimeSeriesData) {
              that.oDaily = JSON.parse(oData.getTimeSeriesData);
              for (var i = 0; i < that.oDaily.length; i++) {
                var dateString = that.oDaily[i].CAL_DATE;
                var dateObject = new Date(dateString);
                var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                var month = monthNames[dateObject.getMonth()];
                var day = dateObject.getDate();
                var year = dateObject.getFullYear();
                var outputDateString = month + " " + day + ", " + year;
                that.oDaily[i].CAL_DATE = outputDateString;
              }
              that.oListModel.setData([])
              that.oListModel.setData(that.oDaily);
              that.oList.setModel(that.oListModel);
              sap.ui.core.BusyIndicator.hide();
            }
            else {
              MessageToast.show("No Data available for selected fields");
              that.oListModel.setData({
                results: []
              });
              that.oList.setModel(that.oListModel);
              sap.ui.core.BusyIndicator.hide();
            }
          },
          error: function (oData, error) {
            sap.ui.core.BusyIndicator.hide();
            MessageToast.show("error");
          },
        });

      },
      onTabSelect: function () {
        sap.ui.core.BusyIndicator.show();
        if (that.byId("idIconTabBarTSH").mProperties.selectedKey == "Daily") {
          that.getHistoryVCDaily();
        } else {
          if (that.oWeekly.length <= 0) {
            MessageToast.show("No Data available for selected fields")
            that.oListModel.setData({
              results: []
            });
            that.oList.setModel(that.oListModel);
            sap.ui.core.BusyIndicator.hide();
            sap.ui.core.BusyIndicator.hide();
          } else {
            that.oListModel.setData(that.oWeekly);
            that.oList.setModel(that.oListModel);
            sap.ui.core.BusyIndicator.hide();
          }
        }
      },
      onSearch: function (oEvent) {
        var TFilter = []
        var stnlist = that.getView().byId("orderListTSH")
        var oItemBind = stnlist.getBinding("items")
        var sValue = oEvent.getSource().getValue();
        var NewFilter = new sap.ui.model.Filter("CHAR_NUM", sap.ui.model.FilterOperator.Contains, sValue)
        TFilter.push(NewFilter)
        oItemBind.filter(TFilter)
      },
      getWeekDates: function () {
        var aSelectedLoc = that.oLocList.getSelectedItems()
        var aSelectedProd = that.oProdList.getSelectedItems();
        var aSelectedComp = that.oCompList.getSelectedItems();
        // Declaration of filters
        var oFilters = [];

        for (var i = 0; i < aSelectedLoc.length; i++) {
          var sFilter = new sap.ui.model.Filter({
            path: "LOCATION_ID",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: aSelectedLoc[i].getTitle(),
          });
          oFilters.push(sFilter);
        }

        for (var i = 0; i < aSelectedProd.length; i++) {
          sFilter = new sap.ui.model.Filter({
            path: "PRODUCT_ID",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: aSelectedProd[i].getTitle(),
          });
          oFilters.push(sFilter);
        }

        for (var i = 0; i < aSelectedComp.length; i++) {
          sFilter = new sap.ui.model.Filter({
            path: "CHAR_NUM",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: aSelectedComp[i].getTitle(),
          });
          oFilters.push(sFilter);
        }
        // if(aSelectedComp.length===0){
        this.getOwnerComponent().getModel("BModel").read("/getHistoryVCDaily", {
          filters: oFilters,
          success: function (oData) {
            var weeklFullDates = [], dailyFullDates = [];
            that.dailyDates = oData.results;
            that.weeklyDates = that.odCondData;
            that.weeklyDates.forEach((el, i) => {
              let value = el.CAL_DATE;
              let value1 = `${value.getFullYear()}-${(value.getMonth() + 1).toString().padStart(2, '0')}-${value.getDate().toString().padStart(2, '0')}`;
              let obj = {};
              obj.DATE = value1;
              obj.key = value;
              weeklFullDates.push(obj);
            });
            if (that.dailyDates.length > 0) {
              that.dailyDates.forEach((el, i) => {
                let value = el.CAL_DATE;
                let value1 = `${value.getFullYear()}-${(value.getMonth() + 1).toString().padStart(2, '0')}-${value.getDate().toString().padStart(2, '0')}`;
                let obj = {};
                obj.DATE = value1;
                obj.key = value;
                dailyFullDates.push(obj);
              });
              that.dailyDates = that.removeDuplicate(dailyFullDates, 'DATE');
              that.weeklyDates = that.removeDuplicate(weeklFullDates, 'DATE');
              var totalArrya = that.weeklyDates.concat(that.dailyDates);
              totalArrya = that.removeDuplicate(totalArrya, 'DATE');
            }
            else {
              weeklFullDates = that.removeDuplicate(weeklFullDates, 'DATE')
              var totalArrya = weeklFullDates;
            }
            that.newDateModel.setData({ resultsCombos: totalArrya });
            that.byId("fromDateTSH").setModel(that.newDateModel);
            that.byId("fromDateTSH").setEditable(true);
            sap.ui.core.BusyIndicator.hide()
          },
          error: function (oData, error) {
            MessageToast.show("error");
            sap.ui.core.BusyIndicator.hide()
          },
        });
        // }
        // else{

        // }
      },
      removeDuplicate: function (array, key) {
        var check = new Set();
        // return new Set(array.map(obj => obj.CAL_DATE));
        return array.filter(obj => !check.has(obj[key]) && check.add(obj[key]));
      },
      createColumnConfig: function (oData) {
        var aCols = [];
        var col = that.getView().byId("orderListTSH").getColumns();
        if (col[0].getVisible(true)) {
          aCols.push({
            label: "Date",
            property: "CAL_DATE",
            type: EdmType.String
          });
        }

        if (col[1].getVisible(true)) {
          aCols.push({
            label: "Demand Location",
            type: EdmType.String,
            property: "LOCATION_ID",
            scale: 0
          });
        }

        if (col[2].getVisible(true)) {
          aCols.push({
            label: "Product",
            type: EdmType.String,
            property: "PRODUCT_ID"

          });
        }
        if (col[3].getVisible(true)) {
          aCols.push({
            label: "Char. Num",
            property: "CHAR_NUM",
            type: EdmType.String
          });
        }
        if (col[4].getVisible(true)) {
          aCols.push({
            label: "Char. Value",
            property: "CHAR_VALUE",
            type: EdmType.String
          });
        }
        if (col[5].getVisible(true)) {
          aCols.push({
            label: "Type",
            property: "TYPE",
            type: EdmType.String
          });
        }
        if (col[6].getVisible(true)) {
          aCols.push({
            label: "Group ID",
            property: "GROUP_ID",
            type: EdmType.String
          });
        }
        if (col[7].getVisible(true)) {
          aCols.push({
            label: "Row ID",
            property: "ROW",
            type: EdmType.String
          });
        }
        if (col[8].getVisible(true)) {
          aCols.push({
            label: "Char. Count",
            property: "CHAR_COUNT",
            type: EdmType.String
          });
        }
        if (col[9].getVisible(true)) {
          aCols.push({
            label: "Char. Count Rate",
            property: "CHAR_COUNT_RATE",
            type: EdmType.String
          });
        }
        if (col[10].getVisible(true)) {
          aCols.push({
            label: "Group Count",
            property: "GROUP_COUNT",
            type: EdmType.String
          });
        }
        if (col[11].getVisible(true)) {
          aCols.push({
            label: "Group Count Rate",
            property: "GROUP_COUNT_RATE",
            type: EdmType.String
          });
        }

        return aCols;
      },
      onDownLoadPress: function () {
        var aCols, oRowBinding, oSettings, oSheet, oTable;
        if (!this._oTable) {
          this._oTable = that.getView().byId("orderListTSH");
        }
        oTable = this._oTable;
        var data = oTable.getModel().getData();
        if (data.length > 0) {
          var searchData = that.byId("onTabSearchTSH").getValue();
          if (searchData) {
            data = data.filter(row => row.CHAR_NUM.toString().includes(searchData));
          }
          oRowBinding = data;
          aCols = this.createColumnConfig();

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
          var totalRows = data.length;
          var chunks = Math.ceil(totalRows / BATCH_SIZE);
          var fileName = "Time Series History.xlsx";

          var processChunk = function (chunkIndex) {
            if (chunkIndex >= chunks) {
              sap.ui.core.BusyIndicator.hide();
              MessageToast.show("Excel Export Completed!");
              return;
            }

            var start = chunkIndex * BATCH_SIZE;
            var end = Math.min(start + BATCH_SIZE, totalRows);
            var chunkData = data.slice(start, end);

            var oSettings = {
              workbook: {
                columns: aCols,
                hierarchyLevel: "Level"
              },
              dataSource: chunkData,
              fileName: fileName
            };

            var oSheet = new Spreadsheet(oSettings);
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
      /**
       * This function is called when click on Assign button.
       * In this function it will open the Profile dialog to select the profiles from list
       * @param {object} oEvent -the event information.
       */

      /**
       * Called when 'Close/Cancel' button in any dialog is pressed.
       */
      handleProfileClose: function () {
        that.byId("orderListTSH").removeSelections();
        sap.ui.getCore().byId("idProfSearch").setValue();
        if (that.oProfileList.getBinding("items")) {
          that.oProfileList.getBinding("items").filter([]);
        }
        that._onProfiles.close();
      },

      /**
       * Called when something is entered into the search field.
       * @param {object} oEvent -the event information.
       */
      handleprofileSearch: function (oEvent) {
        var sQuery =
          oEvent.getParameter("value") || oEvent.getParameter("newValue"),
          oFilters = [];

        if (sQuery !== "") {
          oFilters.push(
            new Filter({
              filters: [
                new Filter("PROFILE", FilterOperator.Contains, sQuery),
                new Filter("PRF_DESC", FilterOperator.Contains, sQuery),
              ],
              and: false,
            })
          );
        }
        that.oProfileList.getBinding("items").filter(oFilters);
      },

      /**
       * Called when something is entered into the search field.
       * @param {object} oEvent -the event information.
       */

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
          //Generate a  URL for the second application
          var url = window.location.href.split('#')[0] + hash;
          //Navigate to second app
          sap.m.URLHelper.redirect(url, true);
        }
      },

      //Variant Code//
      /**
       * Opening the NameVariant fragment on press of "SaveAs" in popover fragment.
       */
      onVariantSave: function () {
        that.byId("idDropDown").setPressed(false);
        that._popOver.close();
        that._nameFragment.open();
        sap.ui.getCore().byId("idInputTSH").setValue();
        sap.ui.getCore().byId("idInputTSH").setValueState("None");
        sap.ui.getCore().byId("idSaveBtn").setEnabled(true);
      },
      /**
       * Closing the namevariant fragment
       */
      onSaveClose: function () {
        // sap.ui.getCore().byId("idInputTSH").setValue("");
        // that.byId("idlocTSH").setValue("");
        // that.byId("prodInputTSH").setTokens([]);
        that._nameFragment.close();
      },
      /**
       * Saving the VIEW on press of save in NameVariant fragment
       * @param {*} oEvent 
       */
      onCreate: function (oEvent) {
        that.byId("idDropDown").setPressed(false);
        var oEntry = { RTRCHAR: [] };
        var array = [];
        var details = {};
        var sLocation = that.byId("idlocTSH").getTokens();
        var Field1 = that.byId("idlocTSH").getParent().getItems()[0].getText();
        var sProduct = that.byId("prodInputTSH").getTokens();
        var Field2 = that.byId("prodInputTSH").getParent().getItems()[0].getText();
        var sComponent = that.byId("idCharTSH").getTokens();
        var Field3 = that.byId("idCharTSH").getParent().getItems()[0].getText();
        var varName = sap.ui.getCore().byId("idInputTSH").getValue();
        var sDefault = sap.ui.getCore().byId("_IDGenCheckBox1TSH").getSelected();
        if (sLocation.length === 0 && sProduct.length === 0 && sComponent.length === 0) {
          sap.ui.getCore().byId("_IDGenCheckBox1TSH").setSelected(false);
          sap.ui.getCore().byId("idInputTSH").setValue();
          that._nameFragment.close();
          return MessageToast.show("No values selected in filters Location, Product and Characteristics")
        }
        if (varName) {
          if (sDefault && that.oGModel.getProperty("/defaultDetails").length > 0) {
            var defaultChecked = "Y";
            that.getModel("BModel").callFunction("/updateVariant", {
              method: "GET",
              urlParameters: {
                VARDATA: JSON.stringify(that.oGModel.getProperty("/defaultDetails"))
              },
              success: function (oData) {
                MessageToast.show(oData);
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
          for (var i = 0; i < sLocation.length; i++) {
            details = {
              Field: Field1,
              FieldCenter: sLocation[i].getKey(),
              Value: sLocation[i].getText(),
              Favourite: "N",
              Default: defaultChecked
            }
            array.push(details);
          }

          for (var k = 0; k < sProduct.length; k++) {
            details = {
              Field: Field2,
              FieldCenter: sProduct[k].getKey(),
              Value: sProduct[k].getText(),
              Favourite: "N",
              Default: defaultChecked
            }
            array.push(details);
          }
          for (var s = 0; s < sComponent.length; s++) {
            details = {
              Field: Field3,
              FieldCenter: sComponent[s].getKey(),
              Value: sComponent[s].getText(),
              Favourite: "N",
              Default: defaultChecked
            }
            array.push(details);
          }


          for (var j = 0; j < array.length; j++) {
            array[j].IDNAME = varName;
            array[j].App_Name = "Time Series History"
          }

          that.getModel("BModel").callFunction("/createVariant", {
            method: "GET",
            urlParameters: {
              Flag: "X",
              USER: that.oGModel.getProperty("/UserId"),
              VARDATA: JSON.stringify(array)
            },
            success: function (oData) {
              that.oGModel.setProperty("/newVariant", oData.results);
              that.oGModel.setProperty("/newVaraintFlag", "X");
              sap.ui.getCore().byId("_IDGenCheckBox1").setSelected(false);
              sap.ui.getCore().byId("idInputTSH").setValue();
              that._nameFragment.close();
              that._onPatternMatched();


            },
            error: function (error) {

              MessageToast.show("Failed to create variant");
            },
          });
        }
        else {
          MessageToast.show("Please fill View Name");
        }
      },
      getoCompdetails: function () {
        var compTokens = that.oGModel.getProperty("/finalCompTokens");
        this.getOwnerComponent().getModel("BModel").read("/getHistoryVC", {
          filters: [that.locProdFilters],
          success: function (oData) {
            if (oData.results.length > 0) {
              that.odCondData = oData.results;
              let uniqueArray1 = Array.from(new Set(oData.results.map(item => item.CHAR_NUM)))
                .map(CHAR_NUM => oData.results.find(item => item.CHAR_NUM === CHAR_NUM));

              that.CompModel.setData({
                results: uniqueArray1
              })
              that.oCompList.setModel(that.CompModel);
              for (var i = 0; i < compTokens.length; i++) {
                for (var k = 0; k < that.oCompList.getItems().length; k++) {
                  if (that.oCompList.getItems()[k].getTitle() === compTokens[i].getText()) {
                    that.oCompList.getItems()[k].setSelected(true);
                  }
                }
              }

              that.getWeekDates();
            }
            else {
              sap.ui.core.BusyIndicator.hide()
              MessageToast.show("No Characteristics available for the selected Location/Product")
            }

          },
          error: function (oData, error) {
            sap.ui.core.BusyIndicator.hide()
            MessageToast.show("error");
          },
        });
      }
      ,

      /**
       * 
       */
      //Function to reset
      onResetData: function () {
        that.byId("idlocTSH").removeAllTokens()
        that.byId("prodInputTSH").removeAllTokens();
        that.byId("idCharTSH").removeAllTokens();
        that.oLocList.removeSelections();
        that.oProdList.removeSelections();
        that.oCompList.removeSelections();
        var oEmpModel = new sap.ui.model.json.JSONModel([]);
        that.byId("orderListTSH").setModel(oEmpModel);
        that.byId("idIconTabBarTSH").setVisible(false);
        that.byId("idIconTabBarTSH").setSelectedKey("Weekly")
        that.byId("onTabSearchTSH").setValue("");
        that.byId("fromDateTSH").setModel(oEmpModel);
        that.byId("fromDateTSH").setEditable(false);
      },
      /*Getting variant view data*/
      getVariantData: function () {
        var ndData = [];
        var dData = [], uniqueName = [];
        that.uniqueName = [];
        sap.ui.core.BusyIndicator.show();
        var variantUser = this.getUser();
        // var variantUser = 'pradeepkumardaka@sbpcorp.in';
        var appName = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        that.oGModel.setProperty("/UserId", variantUser);
        // Define the filters
        var oFilterAppName1 = new sap.ui.model.Filter("APPLICATION_NAME", sap.ui.model.FilterOperator.EQ, appName);
        var oFilterUser = new sap.ui.model.Filter("USER", sap.ui.model.FilterOperator.EQ, variantUser);

        var oFilterAppName2 = new sap.ui.model.Filter("APPLICATION_NAME", sap.ui.model.FilterOperator.EQ, appName);
        var oFilterScope = new sap.ui.model.Filter("SCOPE", sap.ui.model.FilterOperator.EQ, "Public");

        var oFilterCondition1 = new sap.ui.model.Filter({
          filters: [oFilterAppName1, oFilterUser],
          and: true // Combine with AND
        });

        var oFilterCondition2 = new sap.ui.model.Filter({
          filters: [oFilterAppName2, oFilterScope],
          and: true // Combine with AND
        });
        var oFinalFilter = new sap.ui.model.Filter({
          filters: [oFilterCondition1, oFilterCondition2],
          and: false // Combine with OR
        });

        this.getView().getModel("BModel").read("/getVariantHeader", {
          filters: [oFinalFilter],
          success: function (oData) {
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
              that.byId("idVariantTSH").setModel(that.viewDetails);
              that.UniqueDefKey = uniqueName[0].VARIANTID;
              that.byId("idVariantTSH").setDefaultKey(uniqueName[0].VARIANTID);
              that.byId("idVariantTSH").setSelectedKey(uniqueName[0].VARIANTID);
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
                  that.byId("idVariantTSH").setDefaultKey((oData.results[i].VARIANTID));
                  that.byId("idVariantTSH").setSelectedKey((oData.results[i].VARIANTID))
                }
                if (oData.results[i].USER !== variantUser) {
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
            var variantNewData = oData.results;
            aData = variantNewData.map(item1 => {
              const item2 = headerData.find(item2 => item2.VARIANTID === item1.VARIANTID);
              return item2 ? { ...item1, ...item2 } : { ...item1 };
            });
            that.oGModel.setProperty("/variantDetails", aData);
            if (aData.length > 0) {
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
              that.byId("idVariantTSH").setModel(that.variantModel);
              if (that.oGModel.getProperty("/newVaraintFlag") === "X") {
                var newVariant = that.oGModel.getProperty("/newVariant");
                that.handleSelectPress(newVariant[0].VARIANTNAME);
                if (newVariant[0].DEFAULT === "Y") {
                  that.UniqueDefKey = newVariant[0].VARIANTID;
                  that.byId("idVariantTSH").setDefaultKey((newVariant[0].VARIANTID));
                }
                that.byId("idVariantTSH").setSelectedKey((newVariant[0].VARIANTID))
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
              that.byId("idVariantTSH").setModel(that.viewDetails);
              var Default = "Standard";
              if (that.oGModel.getProperty("/newVaraintFlag") === "X") {
                var newVariant = that.oGModel.getProperty("/newVariant");
                that.handleSelectPress(newVariant[0].VARIANTNAME);
                if (newVariant[0].DEFAULT === "Y") {
                  that.UniqueDefKey = newVariant[0].VARIANTID;
                  that.byId("idVariantTSH").setDefaultKey((newVariant[0].VARIANTID));
                }
                that.byId("idVariantTSH").setSelectedKey((newVariant[0].VARIANTID))
                that.oGModel.setProperty("/newVaraintFlag", "");
              } else {
                that.UniqueDefKey = uniqueName[0].VARIANTID;
                that.byId("idVariantTSH").setDefaultKey((uniqueName[0].VARIANTID));
                that.byId("idVariantTSH").setSelectedKey((uniqueName[0].VARIANTID));
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
      /**On Press of Variant Name */
      handleSelectPress: function (oEvent) {
        sap.ui.core.BusyIndicator.show();
        var oLoc, oProd, oChar, oWeek;
        that.locProdFilters = [];
        that.finaloTokens = [];
        var oTableItems = that.oGModel.getProperty("/variantDetails");
        that.byId("idVariantTSH").setModified(false);
        var appName = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        that.oGModel.setProperty("/setChar", '');
        that.oGModel.setProperty("/setWeekDate", '');
        that.oGModel.setProperty("/setLocation", '');
        that.oGModel.setProperty("/setProduct", '');
        that.oGModel.setProperty("/defaultLocation", "");
        that.oGModel.setProperty("/defaultProduct", "");
        that.oGModel.setProperty("/defaultWeekDate", '');
        that.oGModel.setProperty("/defaultChar", '');
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
              if (oTableItems[i].FIELD.includes("Loc")) {
                oLoc = oTableItems[i].VALUE;
                that.oGModel.setProperty("/defaultLocation", oLoc);
                var sFilter = new sap.ui.model.Filter({
                  path: "LOCATION_ID",
                  operator: sap.ui.model.FilterOperator.EQ,
                  value1: oTableItems[i].VALUE,
                });
                that.locProdFilters.push(sFilter);
                that.oLoc1.setValue(oLoc);
                that.oGModel.setProperty("/setLocation", oLoc);
              }
              else if (oTableItems[i].FIELD.includes("Prod")) {
                oProd = oTableItems[i].VALUE;
                that.oGModel.setProperty("/defaultProduct", oProd);
                var sFilter = new sap.ui.model.Filter({
                  path: "PRODUCT_ID",
                  operator: sap.ui.model.FilterOperator.EQ,
                  value1: oTableItems[i].VALUE,
                });
                that.locProdFilters.push(sFilter);
                that.oProd.setValue(oProd);
                that.oGModel.setProperty("/setProduct", oProd);
              }
              else if (oTableItems[i].FIELD.includes("Char")) {
                oChar = oTableItems[i].VALUE;
                that.oGModel.setProperty("/defaultChar", oChar);
                var sFilter = new sap.ui.model.Filter({
                  path: "CHAR_NUM",
                  operator: sap.ui.model.FilterOperator.EQ,
                  value1: oTableItems[i].VALUE,
                });
                that.locProdFilters.push(sFilter);
                that.oChar.setValue(oProd);
                that.oGModel.setProperty("/setChar", oProd);
              }
              else if (oTableItems[i].FIELD.includes("WEEK")) {
                oWeek = oTableItems[i].VALUE;
                that.oGModel.setProperty("/defaultWeekDate", oWeek);
                var sFilter = new sap.ui.model.Filter({
                  path: "CAL_DATE",
                  operator: sap.ui.model.FilterOperator.EQ,
                  value1: oTableItems[i].VALUE,
                });
                that.locProdFilters.push(sFilter);
                that.byId("fromDateTSH").setSelectedKey(oWeek);
                that.oGModel.setProperty("/setWeekDate", oWeek);
              }

            }
          }
          this._valueHelpDialogProd
            .getAggregation("_dialog")
            .getContent()[1]
            .removeSelections();
          this._valueHelpDialogVers
            .getAggregation("_dialog")
            .getContent()[1]
            .removeSelections();
          this._valueHelpDialogLoc
            .getAggregation("_dialog")
            .getContent()[1]
            .removeSelections();
          //     if (oLoc) {
          //           that.oLoc1.setValue(oLoc);
          //           that.oGModel.setProperty("/setLocation", oLoc);
          //           that.oProd.setValue();
          //       }
          //     if (oProd) {
          //         that.oProd.setValue(oProd);
          //         that.oGModel.setProperty("/setProduct", oProd);
          //     }
          //     if (oChar) {
          //       that.oProd.setValue(oProd);
          //       that.oGModel.setProperty("/setChar", oProd);
          //   }   
          //   if (oWeek) {
          //     that.byId("fromDateTSH").setSelectedKey(oWeek);
          //     that.oGModel.setProperty("/setWeekDate", oWeek);
          // }              

          sap.ui.core.BusyIndicator.hide();
        }
        else {
          sap.ui.core.BusyIndicator.hide();
          //do nothing
          // that.byId("prodInputTSH").setValue();
          // that.byId("idlocTSH").setValue();
          that.onResetData();
        }
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
      /**
       * Saving the VIEW on press of save in NameVariant fragment
       * @param {*} oEvent 
       */
      onCreate: function (oEvent) {
        sap.ui.core.BusyIndicator.show();
        var array = [];
        var details = {};
        var sLocation = that.byId("idlocTSH").getValue();
        var Field1 = that.byId("idlocTSH").getParent().getItems()[0].getText();
        var sProduct = that.byId("prodInputTSH").getValue();
        var Field2 = that.byId("prodInputTSH").getParent().getItems()[0].getText();
        var sCust = that.byId("idCustGrp").getTokens();
        var Field3 = that.byId("idCustGrp").getParent().getItems()[0].getText();
        var varName = oEvent.getParameters().name;
        var sDefault = oEvent.getParameters().def;
        var appName = this.getOwnerComponent().getManifestEntry("/sap.app/id");
        if (!sLocation && !sProduct && sCust.length === 0) {
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
          if (sProduct) {
            details = {
              Field: Field2,
              FieldCenter: (1).toString(),
              Value: sProduct,
              Default: defaultChecked
            }
            array.push(details);
          }
          for (var s = 0; s < sCust.length; s++) {
            details = {
              Field: Field3,
              FieldCenter: sCust[s].getKey(),
              Value: sCust[s].getText(),
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
              that.oGModel.setProperty("/newVariant", oData.results);
              that.oGModel.setProperty("/newVaraintFlag", "X");
              that.byId("idVariantTSH").setModified(false);
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
      /**On press of save in manage fragment */
      onManage: function (oEvent) {
        sap.ui.core.BusyIndicator.show();
        var oDelted = {}, deletedArray = [], count = 0;
        var totalVariantData = that.oGModel.getProperty("/VariantData");
        var selected = oEvent.getParameters();
        var variantUser = this.getUser();
        // var variantUser = 'pradeepkumardaka@sbpcorp.in';
        if (selected.def) {
          totalVariantData.filter(item1 => {
            if (JSON.parse(selected.def) === item1.VARIANTID && item1.USER !== variantUser) {
              count++
            }
          })
        }
        if (count > 0) {
          sap.ui.core.BusyIndicator.hide();
          that.viewDetails.setData({
            items12: that.varianNames
          });
          that.byId("idVariantTSH").setModel(that.viewDetails);
          that.byId("idVariantTSH").setDefaultKey(that.UniqueDefKey);
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
                      // sap.ui.core.BusyIndicator.hide();
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
        }
        sap.ui.core.BusyIndicator.hide();
      },
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
          },
          error: function (error) {
            sap.ui.core.BusyIndicator.hide();
            MessageToast.show("Failed to delete variant");
          },
        });
      }

    });
  }
);
