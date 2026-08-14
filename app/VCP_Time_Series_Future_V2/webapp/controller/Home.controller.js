sap.ui.define(
  [
    "vcpapp/vcptimeseriesfuturev2/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/Device",
    "sap/ui/core/Fragment",
    "sap/ui/core/util/File",
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
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
    File,
    exportLibrary,
    Spreadsheet
  ) {
    "use strict";
    var that, oGModel;
    var aResults;
    var Verscena;

    return BaseController.extend("vcpapp.vcptimeseriesfuturev2.controller.Home", {
      /**
       * Called when a controller is instantiated and its View controls (if available) are already created.
       * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
       */
      onInit: function () {
        that = this;
        // Initialize currentPage
        that.oTable = that.byId("orderListTSF"); // Get reference to the table
        that.oGModel = this.getOwnerComponent().getModel("oGModel");
        // Declaring JSON Models and size limits
        that.oListModel = new sap.ui.model.json.JSONModel();
        that.oProfileModel = new sap.ui.model.json.JSONModel();
        that.locModel = new sap.ui.model.json.JSONModel();
        that.prodModel = new sap.ui.model.json.JSONModel();
        that.VersModel = new sap.ui.model.json.JSONModel();
        that.ScenModel = new sap.ui.model.json.JSONModel();
        this.variantModel = new sap.ui.model.json.JSONModel();
        this.viewDetails = new sap.ui.model.json.JSONModel();
        this.newModel = new sap.ui.model.json.JSONModel();
        this.variantFavModel = new sap.ui.model.json.JSONModel();
        this.oListModel.setSizeLimit(5000);
        that.locModel.setSizeLimit(1000);
        that.prodModel.setSizeLimit(1000);
        that.VersModel.setSizeLimit(1000);
        that.ScenModel.setSizeLimit(1000);
        that.variantModel.setSizeLimit(5000);
        that.viewDetails.setSizeLimit(5000);
        that.variantFavModel.setSizeLimit(5000);
        that.oGModel.setProperty("/Favourite", "");

        // Declaring Value Help Dialogs
        this._oCore = sap.ui.getCore();
        if (!this._valueHelpDialogLoc) {
          this._valueHelpDialogLoc = sap.ui.xmlfragment(
            "vcpapp.vcptimeseriesfuturev2.view.LocDialog",
            this
          );
          this.getView().addDependent(this._valueHelpDialogLoc);
        }
        if (!this._valueHelpDialogProd) {
          this._valueHelpDialogProd = sap.ui.xmlfragment(
            "vcpapp.vcptimeseriesfuturev2.view.ProdDialog",
            this
          );
          this.getView().addDependent(this._valueHelpDialogProd);
        }
        if (!this._valueHelpDialogVers) {
          this._valueHelpDialogVers = sap.ui.xmlfragment(
            "vcpapp.vcptimeseriesfuturev2.view.version",
            this
          );
          this.getView().addDependent(this._valueHelpDialogVers);
        }
        if (!this._valueHelpDialogScen) {
          this._valueHelpDialogScen = sap.ui.xmlfragment(
            "vcpapp.vcptimeseriesfuturev2.view.Scenario",
            this
          );
          this.getView().addDependent(this._valueHelpDialogScen);
        }
        if (!this._nameFragment) {
          this._nameFragment = sap.ui.xmlfragment(
            "vcpapp.vcptimeseriesfuturev2.view.NameVariant",
            this
          );
          this.getView().addDependent(this._nameFragment);
        }
        if (!this._popOver) {
          this._popOver = sap.ui.xmlfragment(
            "vcpapp.vcptimeseriesfuturev2.view.PopOver",
            this
          );
          this.getView().addDependent(this._popOver);
        }

        //router
        this.getRouter()
          .getRoute("Home")
          .attachPatternMatched(this._onPatternMatched.bind(this));
        //  that.version();
        //  that.getEnable();

      },


      /*
     * Called when the URL matches pattern "Home".
     */
      _onPatternMatched: function () {
        that = this;
        // var Footer = that.byId("ObjectPageLayout");
        // Footer.setShowFooter(false)
        // this.onGetData();
        that.oGModel.setProperty("/idSaveBtn", "");
        that.deletedArray = [];
        that.oList = this.byId("orderListTSF");
        this.oLoc = this.byId("idlocTSF");
        this.oProd = this.byId("prodInputTSF");
        this.oVers = this.byId("idverTSF");
        this.oScen = this.byId("idscenTSF");
        that.selectedKey = "Variants"
        that._valueHelpDialogProd.setTitleAlignment("Center");
        that._valueHelpDialogLoc.setTitleAlignment("Center");
        that._valueHelpDialogVers.setTitleAlignment("Center");
        that._valueHelpDialogScen.setTitleAlignment("Center");
        if (!this._manageVariant) {
          this._manageVariant = sap.ui.xmlfragment(
            "vcpapp.vcptimeseriesfuturev2.view.VariantNames",
            this
          );
          this.getView().addDependent(this._manageVariant);
        }

        this.oProdList = this._oCore.byId(
          this._valueHelpDialogProd.getId() + "-list"
        );
        this.oLocList = this._oCore.byId(
          this._valueHelpDialogLoc.getId() + "-list"
        );
        this.oVersList = this._oCore.byId(
          this._valueHelpDialogVers.getId() + "-list"
        );
        this.oScenList = this._oCore.byId(
          this._valueHelpDialogScen.getId() + "-list"
        );

        that.oList.removeSelections();

        // Calling function
        this.getData();

      },
      // fucntion works when click on Go 
      onGetData: function () {
        var oList = this.getView().byId("orderListTSF");
        oList.setModel(new sap.ui.model.json.JSONModel());
        this.skip = 0;
        // that.topCount = that.getOwnerComponent().getModel("oGModel").getProperty("/MaxCount");
        that.topCount=50000;
        that.scrollTop = 60;
        var oList = that.byId("orderListTSF");
        oList.setProperty("growingThreshold", 20);
        var aSelectedLoc = that.oLocList.getSelectedItems();
        var aSelectedProd = that.byId("prodInputTSF").getTokens()[0].getText();
        var aSelectedComp = that.oVersList.getSelectedItems();
        var aSelectedScen = that.oScenList.getSelectedItems()
        that.oFilters = [];
        var object = {}, finalArray = [];
        for (var i = 0; i < aSelectedLoc.length; i++) {
          object.LOCATION_ID = aSelectedLoc[i].getTitle();
        }
        object.PRODUCT_ID = aSelectedProd;
        for (var i = 0; i < aSelectedComp.length; i++) {
          object.VERSION = aSelectedComp[i].getDescription();
        }
        for (var i = 0; i < aSelectedScen.length; i++) {
          object.SCENARIO = aSelectedScen[i].getTitle();
        }
        var Flag = "F";
        object.FLAG = Flag;
        finalArray.push(object)
        that.loadTableData(that.skip, that.topCount, that.scrollTop, finalArray);

      },
      // scrolling event 
      // onTableUpdate: function (oEvent) {
      //   var that = this;
      //   var reason = oEvent.getParameters().reason;
      //   var iTotal = oEvent.getParameters().total;

      //   if (reason === "Growing") {
      //     if (iTotal !== that.skip) {
      //       var oList = that.getView().byId("orderListTSF");

      //       // Check if the table DOM reference exists
      //       if (oList && oList.getDomRef()) {

      //         var scrollTop = oList.getDomRef().scrollTop;
      //         //    console.log("Scroll Top:", scrollTop);

      //         that.skip = iTotal;
      //         that.loadTableData(that.skip, that.topCount, that.oFilters, scrollTop);
      //       } else {
      //         // do nothing
      //       }
      //     }
      //   }
      // },

      // Table load
      loadTableData: function (skip, topCount, scrollTop, finalArray) {
        sap.ui.core.BusyIndicator.show();
        var that = this;
        var oList = that.getView().byId("orderListTSF");
        this.getOwnerComponent().getModel("BModel").callFunction("/getTimeSeriesData", {
          method: "GET",
          urlParameters: {
            Skip: skip,
            TopCount: topCount,
            TSDATA: JSON.stringify(finalArray)
          },
          success: function (oData) {
            if (Object.keys(oData).length) {
              var totalData = JSON.parse(oData.getTimeSeriesData);
              if (topCount == totalData.length) {
                that.skip += parseInt(topCount);
                that.TSData = that.TSData.concat(totalData);
                that.loadTableData(that.skip, topCount, that.scrollTop, finalArray);
              }
              else if (oList && oList.getModel()) {
                that.skip = 0;
                var exeData = oList.getModel().getData();
                // var newData = oData.results;
                var newData = that.TSData.concat(JSON.parse(oData.getTimeSeriesData));
                that.TSData = [];
                var merData;

                if (!Array.isArray(exeData)) {
                  merData = newData;
                } else {
                  merData = exeData.concat(newData);
                }

                // Modify the date format if needed
                merData.forEach(function (result) {
                  var dateString = result.CAL_DATE;
                  var dateObject = new Date(dateString);
                  var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  var month = monthNames[dateObject.getMonth()];
                  var day = dateObject.getDate();
                  var year = dateObject.getFullYear();
                  result.CAL_DATE = month + " " + day + ", " + year;
                });

                // Set the new data to the model
                oList.getModel().setData(merData);
                //    oList.setModel(new sap.ui.model.json.JSONModel(merData));
                sap.ui.core.BusyIndicator.hide();
                // Restore the scroll position
                setTimeout(function () {
                  if (oList && oList.getDomRef()) {
                    oList.getDomRef().scrollTop = scrollTop;
                    //  console.log("Restored Scroll Top:", scrollTop);
                  } else {
                    //eat 5star
                    //  console.error("Table DOM reference is not available.");
                  }
                }, 0);
              }
            }
            else {
              sap.ui.core.BusyIndicator.hide();
              MessageToast.show("No Data available for the selected configuration");
            }
          },
          error: function (oError) {
            sap.ui.core.BusyIndicator.hide();
            MessageToast.show("Error loading data:", oError);

            // Ensure to enable scrolling in case of error
            if (oList) {
              oList.setBusy(false);
            } else {
              console.error("Table reference is not available to set busy state.");
            }
          }
        });
      },


      edit: function (oEvent) {
        sap.ui.core.BusyIndicator.show();
        that = this;
        if (!that.newDialogFragment) {
          that.newDialogFragment = sap.ui.xmlfragment(
            "vcpapp.vcptimeseriesfuturev2.view.CharacteristicValues",
            that
          );
          sap.ui.core.BusyIndicator.hide();
          // that.newDialogFragment.open();
        }
        else {
          sap.ui.core.BusyIndicator.hide();
          // that.newDialogFragment.open();
        }
        var sSelItem = oEvent.getSource().getBindingContext().getObject().OBJ_DEP;
        var rowId = oEvent.getSource().getBindingContext().getObject().ROW_ID;
        var aFilter = sSelItem + '_' + rowId;
        if (that.filter === aFilter) {
          that.newDialogFragment.open();
          sap.ui.getCore().byId("idCharTableTSF").setModel(that.oCharModel);
        }
        else {
          this.getModel("BModel").read("/getODcharval", {
            filters: [new Filter("OBJ_DEP", FilterOperator.EQ, aFilter)],

            success: function (oData) {
              that.oCharModel = new JSONModel();
              that.oCharModel.setData({
                items1: oData.results,
              });
              sap.ui.getCore().byId("idCharTableTSF").setModel(that.oCharModel);
              that.newDialogFragment.open();
              sap.ui.core.BusyIndicator.hide();
              that.filter = aFilter;
            },
            error: function () {
              sap.ui.core.BusyIndicator.hide();
              MessageToast.show("Failed to get data");
            },
          });
        }

      },
      closeBatchFragment: function () {
        if (that.newDialogFragment) {
          that.newDialogFragment.destroy();
          that.newDialogFragment = "";
        }
      },
      version: function () {
        var aSelectedLoc = that.oLocList.getSelectedItems();
        var aSelectedProd = that.oProdList.getSelectedItems();
        var aSelectedComp = that.oVersList.getSelectedItems();
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
          var sFilter = new sap.ui.model.Filter({
            path: "PRODUCT_ID",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: aSelectedProd[i].getTitle(),
          });
          oFilters.push(sFilter);
        }
        // Show loading spinner
        sap.ui.core.BusyIndicator.show();

        this.getOwnerComponent().getModel("BModel").read("/getIbpVerScn", {
          filters: oFilters,
          success: function (oData) {
            // Hide loading spinner
            sap.ui.core.BusyIndicator.hide();

            // Set the retrieved data to the model
            Verscena = oData.results;
            that.odCondData = oData.results;
            let oVersArr = that.removeDuplicate(oData.results, "VERSION")
            // let uniqueArr = Array.from(new Set(oData.results.map(item => item.VERSION)))
            //     .map(VERSION => oData.results.find(item => item.VERSION === VERSION));

            for (var i = 0; i < oVersArr.length; i++) {
              if (oVersArr[i].VERSION_NAME === null) {
                oVersArr[i].VERSION_NAME = oVersArr[i].VERSION
              }
            }

            that.VersModel.setData({
              results: oVersArr
            });
            //   that.oVersList.setModel(that.VersModel);
            //   that.byId("idverTSF").setModel(that.VersModel)
            sap.ui.getCore().byId("oVersionTSF").setModel(that.VersModel)

          },
          error: function (oData, error) {
            // Hide loading spinner
            sap.ui.core.BusyIndicator.hide();

            // Show error message
            sap.m.MessageToast.show("Error");
          }
        });
      },


      Scenario: function () {
        var aSelectedLoc = that.oLocList.getSelectedItems();
        var aSelectedProd = that.oProdList.getSelectedItems();
        var aSelectedComp = that.oVersList.getSelectedItems();
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
          var sFilter = new sap.ui.model.Filter({
            path: "PRODUCT_ID",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: aSelectedProd[i].getTitle(),
          });
          oFilters.push(sFilter);
        }

        for (var i = 0; i < aSelectedComp.length; i++) {
          var sFilter = new sap.ui.model.Filter({
            path: "VERSION",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: aSelectedComp[i].getDescription(),
          });
          oFilters.push(sFilter);
        }
        this.getOwnerComponent().getModel("BModel").read("/getIbpVerScn", {
          filters: oFilters,
          success: function (oData) {
            //  sap.ui.getCore().byId("oVersionTSF").setData("Loading..")
            let sceArray = that.removeDuplicate(oData.results, "SCENARIO")
            for (var i = 0; i < sceArray.length; i++) {
              if (sceArray[i].SCENARIO_NAME === null) {
                sceArray[i].SCENARIO_NAME = sceArray[i].SCENARIO
              }
            }
            that.ScenModel.setData({
              results: sceArray,
            });
            //  that.oScenList.setModel(that.ScenModel);
            sap.ui.getCore().byId("oScenarioTSF").setModel(that.ScenModel)
          },
          error: function (oData, error) {
            MessageToast.show("error");
          },
        });
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
        } else if (sId.includes("idverTSF")) {
          //  sap.ui.getCore().byId("version").setIcon("sap-icon://edit")
          var Loc = that.byId("idlocTSF").getValue()
          if (Loc === "") {
            that.version()
          }
          //  that.version();
          that._valueHelpDialogVers.open();


          // Structure Dialog
        } else if (sId.includes("idscenTSF")) {
          var Scen = that.byId("idscenTSF").getValue()
          if (Scen === "") {
            that.Scenario()
          }
          //    that.Scenario();
          that._valueHelpDialogScen.open();
        }
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
          // Version Dialog
        } else if (sId.includes("Ver")) {
          that._oCore
            .byId(this._valueHelpDialogVers.getId() + "-searchField")
            .setValue("");
          if (that.oVersList.getBinding("items")) {
            that.oVersList.getBinding("items").filter([]);
          }

          // Scenario Dialog
        } else if (sId.includes("Sce")) {
          that._oCore
            .byId(this._valueHelpDialogScen.getId() + "-searchField")
            .setValue("");
          if (that.oScenList.getBinding("items")) {
            that.oScenList.getBinding("items").filter([]);
          }
        }
      },

      /**
       * Getting Data Initially and binding to Locations dialog
       */
      //get data;
      getData: function () {
        that.Scenario();
        that.oGModel = this.getOwnerComponent().getModel("oGModel");
        sap.ui.core.BusyIndicator.show();
        this.getOwnerComponent().getModel("BModel").read("/getDemandLoc", {
          success: function (oData) {
            that.locModel.setData(oData);
            that.oLocList.setModel(that.locModel);

          },
          error: function (oData, error) {
            sap.ui.core.BusyIndicator.hide();
            MessageToast.show("error");
          },
        });
        this.getOwnerComponent().getModel("BModel").read("/genPartialProd", {
          success: function (oData) {
            var resultsProd = that.removeDuplicate(oData.results, "PRODUCT_ID")
            that.prodModel.setData({
              results: resultsProd
            });
            // that.prodModel.setData(oData);
            that.oProdList.setModel(that.prodModel);

          },
          error: function (oData, error) {
            sap.ui.core.BusyIndicator.hide();
            MessageToast.show("error");
          },
        });
        this.getOwnerComponent().getModel("BModel").read("/getIbpVerScn", {
          //  filters: oFilters,
          success: function (oData) {
            that.odCondData = oData.results;
            // let uniqueArr = Array.from(new Set(oData.results.map(item => item.VERSION)))
            // .map(VERSION => oData.results.find(item => item.VERSION === VERSION));

            that.VersModel.setData({
              results: oData.results
            })
            that.oVersList.setModel(that.VersModel);
            sap.ui.core.BusyIndicator.hide();
          },
          error: function (oData, error) {
            sap.ui.core.BusyIndicator.hide();
            MessageToast.show("error");
          },
        });
        that.skip = 0;
        that.TSData = [];
      },

      /**Getting variant config data */
      // getVariantData: function () {
      //   var ndData = [];
      //   var dData = [], uniqueName = [];
      //   that.uniqueName = [];
      //   // var variantUser = 'pradeepkumardaka@sbpcorp.in';
      //   var variantUser = this.getUser();
      //   that.oGModel.setProperty("/UserId", variantUser);
      //   this.getOwnerComponent().getModel("BModel").read("/getVariantHeader", {
      //     filters: [
      //       new Filter(
      //         "USER",
      //         FilterOperator.EQ,
      //         variantUser
      //       ),
      //       new Filter(
      //         "APPLICATION_NAME",
      //         FilterOperator.EQ,
      //         "Time Series Future"
      //       ),
      //     ],
      //     success: function (oData) {
      //       if (oData.results.length === 0) {
      //         that.oGModel.setProperty("/variantDetails", "");
      //         that.oGModel.setProperty("/fromFunction", "X");
      //         uniqueName.unshift({
      //           "VARIANTNAME": "Standard",
      //           "VARIANTID": "0",
      //           "DEFAULT": "Y",
      //         })
      //         that.oGModel.setProperty("/viewNames", uniqueName);
      //         that.oGModel.setProperty("/defaultDetails", "");
      //         that.viewDetails.setData({
      //           items1: uniqueName
      //         });
      //         that.varianNames = uniqueName;
      //         sap.ui.getCore().byId("idMatListTSF").setModel(that.viewDetails);
      //         sap.ui.getCore().byId("idMatListTSF").removeSelections(true);
      //         if (sap.ui.getCore().byId("varNameListTSF")) {
      //         sap.ui.getCore().byId("varNameListTSF").setModel(that.viewDetails);
      //         }

      //         var Default = "Standard";
      //         if (that.oGModel.getProperty("/newVaraintFlag") === "X") {
      //           var newVariant = that.oGModel.getProperty("/newVariant");
      //           that.handleSelectPress(newVariant[0].VARIANTNAME);
      //           that.oGModel.setProperty("/newVaraintFlag", "");
      //         } else {
      //           that.handleSelectPress(Default);
      //         }
      //         sap.ui.getCore().byId("idSaveTSF").setVisible(false);
      //       }
      //       else {
      //         for (var i = 0; i < oData.results.length; i++) {
      //           if (oData.results[i].DEFAULT === "Y") {
      //             dData.push(oData.results[i]);
      //           }
      //           ndData.push(oData.results[i]);
      //         }

      //         if (dData.length > 0) {
      //           that.oGModel.setProperty("/defaultVariant", dData);
      //         }
      //         that.oGModel.setProperty("/VariantData", ndData);

      //         that.getTotalVariantDetails();
      //       }
      //     },
      //     error: function (oData, error) {
      //       sap.ui.core.BusyIndicator.show()
      //       MessageToast.show("error while loading variant header");
      //     },
      //   });
      // },
      // getTotalVariantDetails: function () {
      //   var aData = [], uniqueName = [], details = {}, defaultDetails = [], oFilters = [];
      //   var headerData = that.oGModel.getProperty("/VariantData");
      //   if (headerData.length > 0) {
      //     for (var i = 0; i < headerData.length; i++) {
      //       oFilters.push(new Filter("VARIANTID", FilterOperator.EQ, headerData[i].VARIANTID));
      //     }
      //   }
      //   this.getOwnerComponent().getModel("BModel").read("/getVariant", {
      //     filters: [oFilters],
      //     success: function (oData) {
      //       var variantNewData = oData.results;
      //       aData = variantNewData.map(item1 => {
      //         const item2 = headerData.find(item2 => item2.VARIANTID === item1.VARIANTID);
      //         return item2 ? { ...item1, ...item2 } : { ...item1 };
      //       });
      //       that.oGModel.setProperty("/variantDetails", aData);
      //       if (aData.length > 0) {
      //         uniqueName = that.removeDuplicate(aData, "VARIANTNAME");
      //         that.oGModel.setProperty("/saveBtn", "");
      //         for (var k = 0; k < uniqueName.length; k++) {
      //           if (uniqueName[k].DEFAULT === "Y") {
      //             var Default = uniqueName[k].VARIANTNAME;
      //             details = {
      //               "VARIANTNAME": uniqueName[k].VARIANTNAME,
      //               "VARIANTID": uniqueName[k].VARIANTID,
      //               "USER": uniqueName[k].USER,
      //               "DEFAULT": "N"
      //             };
      //             defaultDetails.push(details);
      //             details = {};
      //           }
      //         }
      //       }

      //       that.oGModel.setProperty("/fromFunction", "X");
      //       if (Default) {
      //         uniqueName.unshift({
      //           "VARIANTNAME": "Standard",
      //           "VARIANTID": "0",
      //           "DEFAULT": "N"
      //         })
      //         that.oGModel.setProperty("/viewNames", uniqueName);
      //         that.variantModel.setData({
      //           items1: uniqueName
      //         });
      //         that.varianNames = uniqueName;
      //         that.oGModel.setProperty("/defaultDetails", defaultDetails);
      //         sap.ui.getCore().byId("idMatListTSF").setModel(that.variantModel);
      //         sap.ui.getCore().byId("idMatListTSF").removeSelections(true);
      //         if (sap.ui.getCore().byId("varNameListTSF")) {
      //           sap.ui.getCore().byId("varNameListTSF").setModel(that.variantModel);
      //         }
      //         if (that.oGModel.getProperty("/newVaraintFlag") === "X") {
      //           var newVariant = that.oGModel.getProperty("/newVariant");
      //           that.handleSelectPress(newVariant[0].VARIANTNAME);
      //           that.oGModel.setProperty("/newVaraintFlag", "");
      //         } else {
      //           that.handleSelectPress(Default);
      //         }
      //       } else {
      //         uniqueName.unshift({
      //           "VARIANTNAME": "Standard",
      //           "VARIANTID": "0",
      //           "DEFAULT": "Y"
      //         })
      //         that.oGModel.setProperty("/viewNames", uniqueName);
      //         that.oGModel.setProperty("/defaultDetails", "");

      //         that.viewDetails.setData({
      //           items1: uniqueName
      //         });
      //         that.varianNames = uniqueName;
      //         sap.ui.getCore().byId("idMatListTSF").setModel(that.viewDetails);
      //         sap.ui.getCore().byId("idMatListTSF").removeSelections(true);
      //         if (sap.ui.getCore().byId("varNameListTSF")) {
      //           sap.ui.getCore().byId("varNameListTSF").setModel(that.viewDetails);
      //         }
      //         var Default = "Standard";
      //         if (that.oGModel.getProperty("/newVaraintFlag") === "X") {
      //           var newVariant = that.oGModel.getProperty("/newVariant");
      //           that.handleSelectPress(newVariant[0].VARIANTNAME);
      //           that.oGModel.setProperty("/newVaraintFlag", "");
      //         } else {
      //           that.handleSelectPress(Default);
      //         }
      //       }
      //       sap.ui.getCore().byId("idSaveTSF").setVisible(false);

      //     },
      //     error: function (oData, error) {
      //       sap.ui.core.BusyIndicator.hide()
      //       MessageToast.show("error while loading variant details");
      //     },
      //   });
      // },

      oHomesearch: function (oEvent) {
        var sQuery =
          oEvent.getParameter("value") || oEvent.getParameter("newValue"),
          oFilters = [];

        if (sQuery !== "") {
          oFilters.push(
            new Filter({
              filters: [
                new Filter("CHAR_NUM", FilterOperator.Contains, sQuery),
                new Filter("CHAR_DESC", FilterOperator.Contains, sQuery)

              ],
              and: false,
            })
          );
        }
        that.oList.getBinding("items").filter(oFilters);
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
        } else if (sId.includes("Ver")) {
          if (sQuery !== "") {
            oFilters.push(
              new Filter({
                filters: [
                  new Filter("VERSION", FilterOperator.Contains, sQuery)
                ],
                and: false,
              })
            );
          }
          that.oVersList.getBinding("items").filter(oFilters);
        }
        else if (sId.includes("Sce")) {
          if (sQuery !== "") {
            oFilters.push(
              new Filter({
                filters: [
                  new Filter("SCENARIO", FilterOperator.Contains, sQuery)
                ],
                and: false,
              })
            );
          }
          that.oScenList.getBinding("items").filter(oFilters);

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
          sap.ui.getCore().byId("varNameListTSF").getBinding("items").filter(oFilters);
        }

      },

      /**
       * This function is called when selection on dialogs list.
       * Selections will be made based on sId.
       * @param {object} oEvent -the event information.
       */
      handleSelection: function (oEvent) {
        sap.ui.core.BusyIndicator.show();
        var oList = this.getView().byId("orderListTSF");
        oList.setModel(new sap.ui.model.json.JSONModel());
        var sId = oEvent.getParameter("id");
        this.oLocation = that.byId("idlocTSF");
        this.oProd = that.byId("prodInputTSF");
        this.oVers = that.byId("idverTSF");
        this.oScen = that.byId("idscenTSF");
        if (sId.includes("Loc")) {
          var aSelectedLoc = oEvent.getParameter("selectedItems");
          // Removing selections of component 
          that.oProd.removeAllTokens();
          that.oVers.removeAllTokens();
          that.oScen.removeAllTokens();
          //       that.oVers.removeAllTokens();
          this._valueHelpDialogProd
            .getAggregation("_dialog")
            .getContent()[1]
            .removeSelections();
          this._valueHelpDialogVers
            .getAggregation("_dialog")
            .getContent()[1]
            .removeSelections();
          this._valueHelpDialogScen
            .getAggregation("_dialog")
            .getContent()[1]
            .removeSelections();

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
            var oFilters = [], object = {};
            // for (var i = 0; i < aSelectedLoc.length; i++) {
            // sFilter = new sap.ui.model.Filter({
            //   path: "LOCATION_ID",
            //   operator: sap.ui.model.FilterOperator.EQ,
            //   value1: aSelectedLoc[i].getTitle(),
            // });
            // oFilters.push(sFilter);
            // }
            object.LOCATION_ID = aSelectedLoc[0].getTitle();
            object.FLAG = "PF";
            oFilters.push(object)
            // Calling service to get the component list
            // this.getOwnerComponent().getModel("BModel").read("/genPartialProd", {
            //   filters: oFilters,
            this.getModel("BModel").callFunction("/getTSData", {
              method: "GET",
              urlParameters: {
                TSDATA: JSON.stringify(oFilters)
              },
              success: function (oData) {
                if (oData) {
                  var resultsProd = that.removeDuplicate(JSON.parse(oData.getTSData), "PRODUCT_ID")
                  that.prodModel.setData({ results: resultsProd });
                  // that.prodModel.setData(oData);
                  that.oProdList.setModel(that.prodModel);
                  sap.ui.core.BusyIndicator.hide();
                }
              },
              error: function (oData, error) {
                sap.ui.core.BusyIndicator.hide();
                MessageToast.show("error");
              },
            });

          } else {
            that.oLocation.removeAllTokens();
            that.byId("prodInputTSF").removeAllTokens();
            sap.ui.core.BusyIndicator.hide();
            //  that.oProd.removeAllTokens();
          }
          // Component List
        }
        else if (sId.includes("prod")) {
          var oList = this.getView().byId("orderListTSF");
          oList.setModel(new sap.ui.model.json.JSONModel());
          var aSelectedProd = oEvent.getParameter("selectedItems");
          // Removing selections of component 
          that.oVers.removeAllTokens();
          that.oScen.removeAllTokens();
          this._valueHelpDialogVers
            .getAggregation("_dialog")
            .getContent()[1]
            .removeSelections();
          this._valueHelpDialogScen
            .getAggregation("_dialog")
            .getContent()[1]
            .removeSelections();

          if (aSelectedProd && aSelectedProd.length > 0) {
            that.oProd.removeAllTokens();
            aSelectedProd.forEach(function (oItem) {
              that.oProd.addToken(
                new sap.m.Token({
                  key: oItem.getTitle(),
                  text: oItem.getTitle(),
                  editable: false
                })
              );
            });

            var aSelectedLoc = that.oLocList.getSelectedItems()
            var aSelectedProd = that.oProdList.getSelectedItems();

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

            for (var i = 0; i < aSelectedProd.length; i++) {
              sFilter = new sap.ui.model.Filter({
                path: "PRODUCT_ID",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: aSelectedProd[i].getTitle(),
              });
              oFilters.push(sFilter);
            }

            // Calling service to get the component list
            this.getOwnerComponent().getModel("BModel").read("/getIbpVerScn", {
              filters: oFilters,
              success: function (oData) {
                that.odCondData = oData.results;
                let uniqueArray1 = Array.from(new Set(oData.results.map(item => item.VERSION)))
                  .map(VERSION => oData.results.find(item => item.VERSION === VERSION));

                for (var i = 0; i < uniqueArray1.length; i++) {
                  if (uniqueArray1[i].VERSION_NAME === null) {
                    uniqueArray1[i].VERSION_NAME = uniqueArray1[i].VERSION
                  }
                }
                that.VersModel.setData({
                  results: uniqueArray1
                })

                that.oVersList.setModel(that.VersModel);
                sap.ui.core.BusyIndicator.hide();
              },
              error: function (oData, error) {
                sap.ui.core.BusyIndicator.hide();
                MessageToast.show("error");
              },
            });

          } else {
            sap.ui.core.BusyIndicator.hide();
            that.oProd.removeAllTokens();
          }
          // Component List
        }
        else if (sId.includes("Ver")) {
          var oList = this.getView().byId("orderListTSF");
          oList.setModel(new sap.ui.model.json.JSONModel());
          var aSelectedComp = oEvent.getParameter("selectedItems");
          if (aSelectedComp && aSelectedComp.length > 0) {
            that.oVers.removeAllTokens();
            that.oScen.removeAllTokens();
            this._valueHelpDialogScen
              .getAggregation("_dialog")
              .getContent()[1]
              .removeSelections();
            aSelectedComp.forEach(function (oItem) {
              that.oVers.addToken(
                new sap.m.Token({
                  key: oItem.getTitle(),
                  text: oItem.getTitle(),
                  editable: false
                })
              );
            });


            var aSelectedLoc = that.oLocList.getSelectedItems()
            var aSelectedProd = that.oProdList.getSelectedItems();
            var aSelectedComp = that.oVersList.getSelectedItems();

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
                path: "VERSION",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: aSelectedComp[i].getDescription(),
              });
              oFilters.push(sFilter);
            }

            // Calling service to get the Structure Node data
            this.getOwnerComponent().getModel("BModel").read("/getIbpVerScn", {
              filters: oFilters,
              success: function (oData) {
                let oscenArray = Array.from(new Set(oData.results.map(item => item.SCENARIO)))
                  .map(SCENARIO => oData.results.find(item => item.SCENARIO === SCENARIO));
                // null replaced code
                for (var i = 0; i < oscenArray.length; i++) {
                  if (oscenArray[i].SCENARIO_NAME === null) {
                    oscenArray[i].SCENARIO_NAME = oscenArray[i].SCENARIO
                  }
                }

                that.ScenModel.setData({
                  results: oscenArray,
                });
                that.oScenList.setModel(that.ScenModel);
                sap.ui.core.BusyIndicator.hide();
              },
              error: function (oData, error) {
                sap.ui.core.BusyIndicator.hide();
                MessageToast.show("error");
              },
            });

          } else {
            sap.ui.core.BusyIndicator.hide();
            that.oVers.removeAllTokens();
          }

        }

        else if (sId.includes("Scen")) {
          var oList = this.getView().byId("orderListTSF");
          oList.setModel(new sap.ui.model.json.JSONModel());
          var aSelectedComp = oEvent.getParameter("selectedItems");
          if (aSelectedComp && aSelectedComp.length > 0) {
            that.oScen.removeAllTokens();
            aSelectedComp.forEach(function (oItem) {
              that.oScen.addToken(
                new sap.m.Token({
                  key: oItem.getTitle(),
                  text: oItem.getTitle(),
                  editable: false
                })
              );
            });


            var aSelectedLoc = that.oLocList.getSelectedItems();
            var aSelectedProd = that.oProdList.getSelectedItems();
            var aSelectedComp = that.oVersList.getSelectedItems();
            var aSelectedScen = that.oScenList.getSelectedItems()

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
                path: "VERSION",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: aSelectedComp[i].getTitle(),
              });
              oFilters.push(sFilter);
            }

            for (var i = 0; i < aSelectedScen.length; i++) {
              sFilter = new sap.ui.model.Filter({
                path: "SCENARIO",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: aSelectedScen[i].getTitle(),
              });
              oFilters.push(sFilter);
            }
            // Calling service to get the Structure Node data
            this.getOwnerComponent().getModel("BModel").read("/getIbpVerScn", {
              filters: oFilters,
              success: function (oData) {
                var aData = [];
                for (var i = 0; i < oData.results.length; i++) {
                  // that.ScenModel.setData(aData);
                  that.ScenModel.setData({
                    results: aData,
                  });
                  that.oScenList.setModel(that.ScenModel);
                }
                sap.ui.core.BusyIndicator.hide();
              },
              error: function (oData, error) {
                sap.ui.core.BusyIndicator.hide();
                MessageToast.show("error");
              },
            });

          } else {
            sap.ui.core.BusyIndicator.hide();
            that.oScen.removeAllTokens();
          }

        }
        that.handleClose(oEvent);
      },

      /**
       * This function is called when click on "Go" button after filling all Input box values.
       * @param {object} oEvent -the event information.
       */



      /**
       * This function is called when click on Assign button.
       * In this function it will open the Profile dialog to select the profiles from list
       * @param {object} oEvent -the event information.
       */

      /**
       * Called when 'Close/Cancel' button in any dialog is pressed.
       */
      handleProfileClose: function () {
        that.byId("orderListTSF").removeSelections();
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
      onTableSearch: function (oEvent) {
        var sQuery =
          oEvent.getParameter("value") || oEvent.getParameter("newValue"),
          oFilters = [];

        if (sQuery !== "") {
          oFilters.push(
            new Filter({
              filters: [
                new Filter("LOCATION_ID", FilterOperator.Contains, sQuery),
                new Filter("PRODUCT_ID", FilterOperator.Contains, sQuery),
                new Filter("COMPONENT", FilterOperator.Contains, sQuery),
                new Filter("STRUC_NODE", FilterOperator.Contains, sQuery),
                new Filter("PROFILE", FilterOperator.Contains, sQuery),
              ],
              and: false,
            })
          );
        }
        that.oList.getBinding("items").filter(oFilters);
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
        if (that.oGModel.getProperty("/Favourite") === "X") {
          sap.ui.getCore().byId("_IDGenCheckBox1").setVisible(false);
        }
        else {
          sap.ui.getCore().byId("_IDGenCheckBox1").setVisible(true);
        }
        sap.ui.getCore().byId("idInputTSF").setValue();
        sap.ui.getCore().byId("idInputTSF").setValueState("None");
        sap.ui.getCore().byId("idSaveBtn").setEnabled(true);
      },
      /**
       * Closing the namevariant fragment
       */
      onSaveClose: function () {
        // sap.ui.getCore().byId("idInputTSF").setValue("");
        // that.byId("idlocTSF").setValue("");
        // that.byId("prodInputTSF").setTokens([]);
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
        var sLocation = that.byId("idlocTSF").getTokens();
        var Field1 = that.byId("idlocTSF").getParent().getItems()[0].getText();
        var sProduct = that.byId("prodInputTSF").getTokens();
        var Field2 = that.byId("prodInputTSF").getParent().getItems()[0].getText();
        var sComponent = that.byId("idverTSF").getTokens();
        var Field3 = that.byId("idverTSF").getParent().getItems()[0].getText();
        var sStuNode = that.byId("idscenTSF").getTokens();
        var Field4 = that.byId("idscenTSF").getParent().getItems()[0].getText();
        var varName = sap.ui.getCore().byId("idInputTSF").getValue();
        var sDefault = sap.ui.getCore().byId("_IDGenCheckBox1").getSelected();
        if (sLocation.length === 0 && sProduct.length === 0 && sComponent.length === 0 && sStuNode.length === 0) {
          sap.ui.getCore().byId("_IDGenCheckBox1").setSelected(false);
          sap.ui.getCore().byId("idInputTSF").setValue();
          that._nameFragment.close();
          return MessageToast.show("No values selected in filters Location, Product IBPVersion & IBPScenario")
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
          if (that.oGModel.getProperty("/Favourite") === "X") {
            var Favourite = "Y";
          }
          else {
            var Favourite = "N";
          }
          for (var i = 0; i < sLocation.length; i++) {
            details = {
              Field: Field1,
              FieldCenter: sLocation[i].getKey(),
              Value: sLocation[i].getText(),
              Favourite: 'N',
              Default: defaultChecked
            }
            array.push(details);
          }

          for (var k = 0; k < sProduct.length; k++) {
            details = {
              Field: Field2,
              FieldCenter: sProduct[k].getKey(),
              Value: sProduct[k].getText(),
              Favourite: 'N',
              Default: defaultChecked
            }
            array.push(details);
          }
          for (var s = 0; s < sComponent.length; s++) {
            details = {
              Field: Field3,
              FieldCenter: sComponent[s].getKey(),
              Value: sComponent[s].getText(),
              Favourite: 'N',
              Default: defaultChecked
            }
            array.push(details);
          }
          for (var l = 0; l < sStuNode.length; l++) {
            details = {
              Field: Field4,
              FieldCenter: sStuNode[l].getKey(),
              Value: sStuNode[l].getText(),
              Favourite: 'N',
              Default: defaultChecked
            }
            array.push(details);
          }
          for (var j = 0; j < array.length; j++) {
            array[j].IDNAME = varName;
            array[j].App_Name = "Time Series Future";
            array[j].FAVOURITE = Favourite;
          }
          //    console.log(JSON.stringify(array));
          that.getModel("BModel").callFunction("/createVariant", {
            method: "GET",
            urlParameters: {
              Flag: "X",
              USER: (that.oGModel.getProperty("/UserId")),
              VARDATA: JSON.stringify(array)
            },
            success: function (oData) {
              that.oGModel.setProperty("/newVariant", oData.results);
              that.oGModel.setProperty("/newVaraintFlag", "X");
              sap.ui.getCore().byId("_IDGenCheckBox1").setSelected(false);
              sap.ui.getCore().byId("idInputTSF").setValue();
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
      /**
       * On selection of VIEW in POPOVER fragment.
       * @param {*} oEvent 
       */

      handleSelectPress: function (oEvent) {
        sap.ui.core.BusyIndicator.show();
        var oLoc, oTokens = {}, finalToken = [], locToken = [], verToken = [], scenToken = [];
        that.locFilters = [], that.prodFilters = [], that.verFilters = [], that.scenFilters = [];
        that.finaloTokens = [];
        var oTableItems = that.oGModel.getProperty("/variantDetails");
        that.oGModel.setProperty("/defaultLocation", "");
        that.oGModel.setProperty("/defaultProducts", "");
        that.oGModel.setProperty("/defaultVersion", "");
        that.oGModel.setProperty("/defaultScenario", "");
        that.oVersList.setModel(that.newModel);
        that.oScenList.setModel(that.newModel);
        if (that.oGModel.getProperty("/fromFunction") === "X") {
          that.oGModel.setProperty("/fromFunction", "");
          that.selectedApp = oEvent;
          var listItems = sap.ui.getCore().byId("idMatListTSF").getItems();
          for (var i = 0; i < listItems.length; i++) {
            if (listItems[i].getTitle() === oEvent) {
              listItems[i].setSelected(true);
            }
          }
          that.byId("idVariantName").setText(that.selectedApp);
          that.oGModel.setProperty("/variantName", that.selectedApp);
        }
        else {
          that.selectedApp = oEvent.getParameters().listItem.getTitle();
          that.byId("idVariantName").setText(that.selectedApp);
          that.oGModel.setProperty("/variantName", that.selectedApp);
        }
        if (that.selectedApp !== "Standard") {
          for (var i = 0; i < oTableItems.length; i++) {
            if (that.selectedApp === oTableItems[i].VARIANTNAME && oTableItems[i].APPLICATION_NAME === "Time Series Future") {
              if (oTableItems[i].FIELD.includes("Loc")) {
                var oLocTemplate = new sap.m.Token({
                  key: oTableItems[i].FIELD_CENTER,
                  text: oTableItems[i].VALUE
                });
                locToken.push(oLocTemplate);
                oTokens = {
                  FIELD: oTableItems[i].FIELD,
                  VALUE: oTableItems[i].VALUE
                }
                that.finaloTokens.push(oTokens);
                that.oGModel.setProperty("/finalLocTokens", locToken);
                oLocTemplate = {};
                var sFilter = new sap.ui.model.Filter({
                  path: "LOCATION_ID",
                  operator: sap.ui.model.FilterOperator.EQ,
                  value1: oTableItems[i].VALUE,
                });
                that.locFilters.push(sFilter);
              }
              else if (oTableItems[i].FIELD.includes("Prod")) {
                var oItemTemplate = new sap.m.Token({
                  key: oTableItems[i].FIELD_CENTER,
                  text: oTableItems[i].VALUE
                });
                finalToken.push(oItemTemplate);
                oTokens = {
                  FIELD: oTableItems[i].FIELD,
                  VALUE: oTableItems[i].VALUE
                }
                that.finaloTokens.push(oTokens);
                that.oGModel.setProperty("/finalProdTokens", finalToken);
                oItemTemplate = {};
                var sFilter = new sap.ui.model.Filter({
                  path: "PRODUCT_ID",
                  operator: sap.ui.model.FilterOperator.EQ,
                  value1: oTableItems[i].VALUE,
                });
                that.prodFilters.push(sFilter);
              }
              else if (oTableItems[i].FIELD.includes("Scen")) {
                var oScenTemplate = new sap.m.Token({
                  key: oTableItems[i].FIELD,
                  text: oTableItems[i].VALUE
                });
                scenToken.push(oScenTemplate);
                oTokens = {
                  FIELD: oTableItems[i].FIELD,
                  VALUE: oTableItems[i].VALUE
                }
                that.finaloTokens.push(oTokens);
                that.oGModel.setProperty("/finalScenTokens", scenToken);
                oScenTemplate = {};
                var sFilter = new sap.ui.model.Filter({
                  path: "SCENARIO",
                  operator: sap.ui.model.FilterOperator.EQ,
                  value1: oTableItems[i].VALUE,
                });
                that.scenFilters.push(sFilter);
              }
              else if (oTableItems[i].FIELD.includes("Vers")) {
                var oVersTemplate = new sap.m.Token({
                  key: oTableItems[i].FIELD,
                  text: oTableItems[i].VALUE
                });
                verToken.push(oVersTemplate);
                oTokens = {
                  FIELD: oTableItems[i].FIELD,
                  VALUE: oTableItems[i].VALUE
                }
                that.finaloTokens.push(oTokens);
                that.oGModel.setProperty("/finalVerTokens", verToken);
                oVersTemplate = {};
                var sFilter = new sap.ui.model.Filter({
                  path: "VERSION",
                  operator: sap.ui.model.FilterOperator.EQ,
                  value1: oTableItems[i].VALUE,
                });
                that.verFilters.push(sFilter);
              }

            }
          }

          that.byId("idlocTSF").setTokens(locToken);
          for (var i = 0; i < locToken.length; i++) {
            for (var k = 0; k < that.oLocList.getItems().length; k++) {
              if (that.oLocList.getItems()[k].getTitle() === locToken[i].getText()) {
                that.oLocList.getItems()[k].setSelected(true);
              }
            }
          }
          that.oGModel.setProperty("/defaultLocation", locToken);
          that.oProd.removeAllTokens();
          that.oVers.removeAllTokens();
          that.oScen.removeAllTokens();
          this._valueHelpDialogProd
            .getAggregation("_dialog")
            .getContent()[1]
            .removeSelections();
          this._valueHelpDialogVers
            .getAggregation("_dialog")
            .getContent()[1]
            .removeSelections();
          this._valueHelpDialogScen
            .getAggregation("_dialog")
            .getContent()[1]
            .removeSelections();
          if (finalToken.length > 0) {
            this.getOwnerComponent().getModel("BModel").read("/genPartialProd", {
              filters: [that.locFilters],
              success: function (oData) {
                var resultsProd = that.removeDuplicate(oData.results, "PRODUCT_ID")
                that.prodModel.setData({ results: resultsProd });
                that.oProdList.setModel(that.prodModel);
                that.oProdList.removeSelections();
                for (var i = 0; i < finalToken.length; i++) {
                  for (var k = 0; k < that.oProdList.getItems().length; k++) {
                    if (that.oProdList.getItems()[k].getTitle() === finalToken[i].getText()) {
                      that.oProdList.getItems()[k].setSelected(true);
                    }
                  }
                }

                that.byId("prodInputTSF").setTokens(finalToken);
                that.oGModel.setProperty("/defaultProducts", finalToken);
                // that.getoCompdetails();
                sap.ui.core.BusyIndicator.hide();
              },
              error: function (oData, error) {
                MessageToast.show("error");
                sap.ui.core.BusyIndicator.hide();
              },
            });
          }
          if (scenToken.length > 0 || verToken.length > 0) {
            that.getModel("BModel").read("/getIbpVerScn", {
              // filters: [that.locFilters],
              success: function (oData) {
                if (verToken.length > 0) {
                  // let uniqueArr = Array.from(new Set(oData.results.map(item => item.VERSION)))
                  // .map(VERSION => oData.results.find(item => item.VERSION === VERSION));
                  let uniqueArr = that.removeDuplicate(oData.results, "VERSION");

                  that.VersModel.setData({
                    results: uniqueArr
                  })
                  that.oVersList.setModel(that.VersModel);
                  for (var i = 0; i < verToken.length; i++) {
                    for (var k = 0; k < that.oVersList.getItems().length; k++) {
                      if (that.oVersList.getItems()[k].getTitle() === verToken[i].getText()) {
                        that.oVersList.getItems()[k].setSelected(true);
                      }
                    }
                  }
                  that.oGModel.setProperty("/defaultVersion", verToken);
                  that.byId("idverTSF").setTokens(verToken);
                }
                if (scenToken.length > 0) {
                  // let sceArray = Array.from(new Set(oData.results.map(item => item.SCENARIO)))
                  // .map(SCENARIO => oData.results.find(item => item.SCENARIO === SCENARIO));
                  let sceArray = that.removeDuplicate(oData.results, "SCENARIO");

                  that.ScenModel.setData({
                    results: sceArray,
                  });
                  that.oScenList.setModel(that.ScenModel);
                  for (var i = 0; i < scenToken.length; i++) {
                    for (var k = 0; k < that.oScenList.getItems().length; k++) {
                      if (that.oScenList.getItems()[k].getTitle() === scenToken[i].getText()) {
                        that.oScenList.getItems()[k].setSelected(true);
                      }
                    }
                  }
                  that.oGModel.setProperty("/defaultScenario", scenToken);
                  that.byId("idscenTSF").setTokens(scenToken);
                }
              },
              error: function (oData, error) {
                sap.ui.core.BusyIndicator.hide();
                sap.m.MessageToast.show("error");
              },
            });
          }
          that._popOver.close();
          that.byId("idDropDown").setPressed(false);
          sap.ui.core.BusyIndicator.hide();
        }
        else {
          sap.ui.core.BusyIndicator.hide();
          //do nothing
          that.byId("idDropDown").setPressed(false);
          that.byId("prodInputTSF").removeAllTokens();
          that.oProdList.removeSelections();
          that.byId("idlocTSF").removeAllTokens();
          that.byId("idscenTSF").removeAllTokens();
          that.byId("idverTSF").removeAllTokens();
          sap.ui.getCore().byId("idSaveTSF").setVisible(false);
          that._popOver.close();
          that.onResetData();
        }
      },
      /**
       * Opening the VariantNames fragment on press of "Manage" in popover fragment
       * @param {*} oEvent 
       */
      onManageOpen: function (oEvent) {
        that._popOver.close();
        that.byId("idDropDown").setPressed(false);
        if (that.oGModel.getProperty("/deletedFlag") === "X") {
          if (!this._manageVariant) {
            this._manageVariant = sap.ui.xmlfragment(
              "vcpapp.vcptimeseriesfuturev2.view.VariantNames",
              this
            );
            this.getView().addDependent(this._manageVariant);
          }
          that.newModel = new JSONModel();
          that.emptyModel = new JSONModel([]);
          if (that.oGModel.getProperty("/Favourite") === "X") {
            that.newModel.setData({ items1: that.uniqueFavName });
            sap.ui.getCore().byId("varNameListTSF").getColumns()[1].setVisible(false);
          }
          else {
            that.newModel.setData({ items1: that.varianNames });
            sap.ui.getCore().byId("varNameListTSF").getColumns()[1].setVisible(true);
          }
          sap.ui.getCore().byId("varNameListTSF").setModel(that.newModel);
          that._manageVariant.open();
          that.oGModel.setProperty("/deletedFlag", "");
          that.deletedArray = [];
        }
        else {
          that._manageVariant.open();
          if (that.oGModel.getProperty("/Favourite") === "X") {
            that.newModel.setData({ items1: that.uniqueFavName });
            sap.ui.getCore().byId("varNameListTSF").getColumns()[1].setVisible(false);
          }
          else {
            that.newModel.setData({ items1: that.varianNames });
            sap.ui.getCore().byId("varNameListTSF").getColumns()[1].setVisible(true);
          }
          sap.ui.getCore().byId("varNameListTSF").setModel(that.newModel);
        }
      },
      /**
       * Closing the VariantNames fragment
       */
      handleManageClose: function () {
        sap.ui.getCore().byId("_IDGenSearchField1TSF").setValue();
        if (this._manageVariant) {
          that._manageVariant.destroy(true);
          that._manageVariant = "";
          that.oGModel.setProperty('/deletedFlag', "X");
        }
      },
      /**
       * Deleting the selected view in VariantNames fragment
       * @param {*} oEvent 
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
        var source = sap.ui.getCore().byId("varNameListTSF");
        source.removeItem(selectedItem);
        that.oGModel.setProperty('/deletedFlag', "X");
      },
      /**
       * Saving the public/private property on click of save in VariantNames fragment.
       */
      onManage: function () {
        sap.ui.core.BusyIndicator.show();
        var newSelection = {};
        var newDefault = [];
        var initalDetails = that.oGModel.getProperty("/defaultVariant");
        var oTable = sap.ui.getCore().byId("varNameList").getItems();
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
          }
          else if (newDefault[0].VARIANTNAME === "Standard") {
            for (i in initalDetails) {
              initalDetails[i].DEFAULT = "N"
            }
            that.getOwnerComponent().getModel("BModel").callFunction("/updateVariant", {
              method: "GET",
              urlParameters: {
                VARDATA: JSON.stringify(initalDetails)
              },
              success: function (oData) {
                that.handleManageClose();
                that._onPatternMatched();
              },
              error: function (error) {
                MessageToast.show("Failed to update variant");
              },
            });
          }
          else {

            that.getOwnerComponent().getModel("BModel").callFunction("/updateVariant", {
              method: "GET",
              urlParameters: {
                VARDATA: JSON.stringify(newDefault)
              },
              success: function (oData) {
                that.handleManageClose();
                that._onPatternMatched();
              },
              error: function (error) {
                MessageToast.show("Failed to update variant");
              },
            });
            for (i in initalDetails) {
              initalDetails[i].DEFAULT = "N"
            }
            that.getModel("BModel").callFunction("/updateVariant", {
              method: "GET",
              urlParameters: {
                VARDATA: JSON.stringify(initalDetails)
              },
              success: function (oData) {
                that.handleManageClose();
                that._onPatternMatched();
              },
              error: function (error) {
                MessageToast.show("Failed to update variant");
              },
            });

          }
        }
        else {
          that.getOwnerComponent().getModel("BModel").callFunction("/updateVariant", {
            method: "GET",
            urlParameters: {
              VARDATA: JSON.stringify(newDefault)
            },
            success: function (oData) {
              that.handleManageClose();
              that._onPatternMatched();
            },
            error: function (error) {
              MessageToast.show("Failed to update variant");
            },
          });
        }
        sap.ui.core.BusyIndicator.hide();
      },
      /**
       * Save the current view if any changes in the existing properties.
       */
      onSave: function () {
        var updatedDetails = {};
        var updatedArray = [];
        var selectedItem = sap.ui.getCore().byId("idMatListTSF");
        if (selectedItem.getSelectedItem() !== null) {
          var Default = selectedItem.getSelectedItem().getBindingContext().getObject().DEFAULT;
          var VariantId = selectedItem.getSelectedItem().getBindingContext().getObject().VARIANTID;
          var VariantName = selectedItem.getSelectedItem().getBindingContext().getObject().VARIANTNAME;
        }
        else {
          var defaulDetails1 = that.oGModel.getProperty("/defaultDetails");
          var VariantId = defaulDetails1[0].VARIANTID;
          var VariantName = defaulDetails1[0].VARIANTNAME;
          var Default = "Y";

        }

        var sLocation = that.byId("idlocTSF").getTokens();
        var Field1 = that.byId("idlocTSF").getParent().getItems()[0].getText();
        var sProduct = that.byId("prodInputTSF").getTokens();
        var Field2 = that.byId("prodInputTSF").getParent().getItems()[0].getText();
        var sComponent = that.byId("idverTSF").getTokens();
        var Field3 = that.byId("idverTSF").getParent().getItems()[0].getText();
        var sStuNode = that.byId("idscenTSF").getTokens();
        var Field4 = that.byId("idscenTSF").getParent().getItems()[0].getText();
        var varName = sap.ui.getCore().byId("idInputTSF").getValue();
        if (sLocation.length === 0 && sProduct.length === 0 && sComponent.length === 0 && sStuNode.length === 0) {
          that._popOver.close();
          return MessageToast.show("No values in filters Location, Product,IBP Version & IBP Scenario");
        }
        if (VariantName) {
          if (that.oGModel.getProperty("/Favourite") === "X") {
            var Favourite = "Y";
          }
          else {
            var Favourite = "N";
          }
          for (var i = 0; i < sLocation.length; i++) {
            updatedDetails = {
              Field: Field1,
              FieldCenter: sLocation[i].getKey(),
              Value: sLocation[i].getText(),
              Favourite: 'N',
              Default: Default
            }
            updatedArray.push(updatedDetails);
          }

          // }

          for (var k = 0; k < sProduct.length; k++) {
            updatedDetails = {
              Field: Field2,
              FieldCenter: sProduct[k].getKey(),
              Value: sProduct[k].getText(),
              Favourite: 'N',
              Default: Default
            }
            updatedArray.push(updatedDetails);
          }
          for (var s = 0; s < sComponent.length; s++) {
            updatedDetails = {
              Field: Field3,
              FieldCenter: sComponent[s].getKey(),
              Value: sComponent[s].getText(),
              Default: Default
            }
            updatedArray.push(updatedDetails);
          }
          for (var l = 0; l < sStuNode.length; l++) {
            updatedDetails = {
              Field: Field4,
              FieldCenter: sStuNode[l].getKey(),
              Value: sStuNode[l].getText(),
              Favourite: 'N',
              Default: Default
            }
            updatedArray.push(updatedDetails);
          }

          for (var j = 0; j < updatedArray.length; j++) {
            updatedArray[j].ID = VariantId;
            updatedArray[j].IDNAME = VariantName;
            updatedArray[j].App_Name = "Time Series Future";
            updatedArray[j].FAVOURITE = Favourite;
          }


          that.getOwnerComponent().getModel("BModel").callFunction("/createVariant", {
            method: "GET",
            urlParameters: {
              Flag: "E",
              USER: (that.oGModel.getProperty("/UserId")),
              VARDATA: JSON.stringify(updatedArray)
            },
            success: function (oData) {
              that.oGModel.setProperty("/newVariant", oData.results);
              that.oGModel.setProperty("/newVaraintFlag", "X");
              that._onPatternMatched();
              that._popOver.close();
              that.byId("idDropDown").setPressed(false);
            },
            error: function (error) {

              MessageToast.show("Failed to update variant");
            },
          });
        }
        else {
          MessageToast.show("Please fill View Name");
        }
      },
      /**
       * Checking if view name already exists.
       * @param {*} oEvent 
       */
      checkName: function (oEvent) {
        var sQuery = oEvent.getParameter("value") || oEvent.getParameter("newValue");
        var uniqueNames = that.oGModel.getProperty("/viewNames");
        var uniqueFavourite = that.oGModel.getProperty("/viewFavNames");
        if (uniqueFavourite) {
          var combinedNames = uniqueNames.concat(uniqueFavourite);
        }
        else {
          var combinedNames = uniqueNames;
        }
        for (var i = 0; i < combinedNames.length; i++) {
          if (sQuery === combinedNames[i].VARIANTNAME) {
            sap.ui.getCore().byId("idInputTSF").setValueState("Error");
            break;
          }
          else {
            sap.ui.getCore().byId("idInputTSF").setValueState("None");
            sap.ui.getCore().byId("idSaveBtn").setEnabled(true);
          }
        }

        if (sap.ui.getCore().byId("idInputTSF").getValueState() === "Error") {
          sap.ui.getCore().byId("idSaveBtn").setEnabled(false);
        }
      },
      /**
       * on Press of drop down button
       * @param {*} oEvent 
       */
      onDropDownPress: function (oEvent) {
        var prodCount = 0, locCount = 0, verCount = 0, scenCount = 0;
        var countComp = 0;
        var selectedTab = that.oGModel.getProperty("/Favourite");
        var newTokens = {};
        that.newFinalToken = [];
        var tokenLabel = ["Demand Location", "Product", "IBP Version", "IBP Scenario"]
        var tokenId = ["idlocTSF", "prodInputTSF", "idverTSF", "idscenTSF"]
        if (oEvent.getSource().getPressed()) {
          this._popOver.openBy(oEvent.getSource());
          var productDetails = that.byId("prodInputTSF").getTokens();
          var locDetails = that.byId("idlocTSF").getTokens();
          var verDetails = that.byId("idverTSF").getTokens();
          var scenDetails = that.byId("idscenTSF").getTokens();
          var locDefault = that.oGModel.getProperty("/defaultLocation");
          var itemsDefault = that.oGModel.getProperty("/defaultProducts");
          var verDefault = that.oGModel.getProperty("/defaultVersion");
          var scenDefault = that.oGModel.getProperty("/defaultScenario");
          that.selectedID = that.byId("idVariantName").getText();
          if (that.selectedID !== "Standard" && that.oGModel.getProperty("/saveBtn") !== "X") {
            if (productDetails.length === itemsDefault.length && locDetails.length === locDefault.length
              && verDetails.length === verDefault.length && scenDefault.length === scenDetails.length) {
              for (var i = 0; i < tokenId.length; i++) {
                var localTokens = that.byId(tokenId[i]).getTokens();
                if (localTokens.length > 0) {
                  for (var j = 0; j < localTokens.length; j++) {
                    newTokens = {
                      FIELD: tokenLabel[i],
                      VALUE: localTokens[j].getText()
                    }
                    that.newFinalToken.push(newTokens);
                    newTokens = {};
                  }
                }
              }
              that.newFinalToken = that.newFinalToken.sort(that.dynamicSortMultiple("VALUE"));
              that.finaloTokens = that.finaloTokens.sort(that.dynamicSortMultiple("VALUE"));
              if (JSON.stringify(that.newFinalToken) !== JSON.stringify(that.finaloTokens)) {
                sap.ui.getCore().byId("idSaveTSF").setVisible(true);
                sap.ui.getCore().byId("idSaveTSF").setType("Emphasized");
              } else {
                sap.ui.getCore().byId("idSaveTSF").setVisible(false);
              }

            } else {
              sap.ui.getCore().byId("idSaveTSF").setVisible(true);
              sap.ui.getCore().byId("idSaveTSF").setType("Emphasized");
            }
          }
        }
        else {
          this._popOver.close();
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
       * 
       */
      //Function to reset
      onResetData: function () {
        // that.getData();
        this.getModel("BModel").read("/genPartialProd", {
          success: function (oData) {
            var resultsProd = that.removeDuplicate(oData.results, "PRODUCT_ID")
            that.prodModel.setData({ results: resultsProd });
            that.oProdList.setModel(that.prodModel);
            sap.ui.core.BusyIndicator.hide();
          },
          error: function (oData, error) {
            MessageToast.show("error");
          },
        });
        that.byId("headSearchTSH").setValue("")
        that.byId("idlocTSF").removeAllTokens()
        that.byId("prodInputTSF").removeAllTokens();
        that.byId("idverTSF").removeAllTokens();
        that.byId("idscenTSF").removeAllTokens();
        that.oLocList.removeSelections();
        that.oProdList.removeSelections();
        that.oVersList.removeSelections();
        that.oScenList.removeSelections();
        var oList = that.getView().byId("orderListTSF");
        oList.setModel(new sap.ui.model.json.JSONModel());
      },
      /**
       * 
       */
      deleteVariant: function () {
        that.getView().getModel("BModel").callFunction("/createVariant", {
          method: "GET",
          urlParameters: {
            Flag: "D",
            USER: (that.oGModel.getProperty("/UserId")),
            VARDATA: JSON.stringify(that.deletedArray)
          },
          success: function (oData) {
            that.deletedArray = [];
          },
          error: function (error) {
            sap.ui.core.BusyIndicator.hide();
            MessageToast.show("Failed to delete variant");
          }
        });
      },
      //**On click of Tab Filters */
      // onFilterSelect: function (oEvent) {
      //   var key = that.oGModel.getProperty("/idSaveBtn");
      //   that.selectedKey = oEvent.getParameters().selectedKey;
      //   sap.ui.getCore().byId("idIconTabBar").setSelectedKey(that.selectedKey);
      //   // }
      //   if (that.selectedKey === "Favourites") {
      //     if (that.uniqueFavName) {
      //       that.variantFavModel.setData({
      //         items1: that.uniqueFavName
      //       });
      //     }
      //     else {
      //       that.variantFavModel.setData({
      //         items1: []
      //       });
      //     }
      //     sap.ui.getCore().byId("idMatListTSF").setModel(that.variantFavModel);
      //     that.oGModel.setProperty("/Favourite", "X");
      //     if (key === "Y") {
      //       for (var i = 0; i < that.uniqueFavName.length; i++) {
      //         if (that.selectedID === that.uniqueFavName[i].VARIANTNAME) {
      //           sap.ui.getCore().byId("idSaveTSF").setVisible(true);
      //           sap.ui.getCore().byId("idSaveTSF").setType("Emphasized");
      //         }
      //         else {
      //           sap.ui.getCore().byId("idSaveTSF").setVisible(false);
      //         }
      //       }
      //     }
      //   }
      //   else {
      //     that.viewDetails.setData({
      //       items1: that.uniqueName
      //     });
      //     sap.ui.getCore().byId("idMatListTSF").setModel(that.viewDetails);
      //     that.oGModel.setProperty("/Favourite", "");
      //     if (key === "Y") {
      //       for (var i = 0; i < that.uniqueName.length; i++) {
      //         if (that.selectedID === that.uniqueName[i].VARIANTNAME) {
      //           sap.ui.getCore().byId("idSaveTSF").setVisible(true);
      //           sap.ui.getCore().byId("idSaveTSF").setType("Emphasized");
      //         }
      //         else {
      //           sap.ui.getCore().byId("idSaveTSF").setVisible(false);
      //         }
      //       }
      //     }
      //   }
      // },
      removeDuplicate: function (array, key) {
        var check = new Set();
        return array.filter(obj => !check.has(obj[key]) && check.add(obj[key]));
      },

      createColumnConfig: function (list) {
        var oCols = [];
        var noOfCols = Object.keys(list[0]);
        for (var i = 0; i < noOfCols.length; i++) {
          oCols.push({
            property: Object.keys(list[0])[i]
          })
        }
        return oCols;
      },

      downloadData: function () {
        // var data = that.byId("fileUploader").getValue();

        var oCols, oRowBinding, oSettings, oSheet, oTable;

        if (!this._oTable) {
          this._oTable = this.byId('orderListTSF');
        }

        oTable = this._oTable;
        oRowBinding = oTable.getBinding('items');
        var list = oRowBinding.oList;
        oCols = this.createColumnConfig(list);

        oSettings = {
          workbook: {
            columns: oCols,
            hierarchyLevel: 'Level'
          },
          dataSource: oRowBinding,
          fileName: "Time Series Future.xlsx",
          worker: false
        };

        var oSpreadsheet = new sap.ui.export.Spreadsheet(oSettings);
        oSpreadsheet.build();
      }
      //#endregion
    });
  }
);