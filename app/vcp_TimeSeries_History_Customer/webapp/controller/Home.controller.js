sap.ui.define(
    [
      "vcpapp/vcptimeserieshistoryv3/controller/BaseController",
      "sap/m/MessageToast",
      "sap/m/MessageBox",
      "sap/ui/model/json/JSONModel",
      "sap/ui/model/Filter",
      "sap/ui/model/FilterOperator",
      "sap/ui/Device",
      "sap/ui/core/Fragment",
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
      exportLibrary,
      Spreadsheet
    ) {
      "use strict";
      var that, oGModel;
      var aResults;
      var Verscena;
      var currentPage = 0;
  
      var EdmType = exportLibrary.EdmType;
      return BaseController.extend("vcpapp.vcptimeserieshistoryv3.controller.Home", {
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         */
        onInit: function () {
          that = this;
          that.skip = 0;
          that.oGModel = this.getOwnerComponent().getModel("oGModel");
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
              "vcpapp.vcptimeserieshistoryv3.view.LocDialog",
              this
            );
            this.getView().addDependent(this._valueHelpDialogLoc);
          }
          if (!this._valueHelpDialogProd) {
            this._valueHelpDialogProd = sap.ui.xmlfragment(
              "vcpapp.vcptimeserieshistoryv3.view.ProdDialog",
              this
            );
            this.getView().addDependent(this._valueHelpDialogProd);
          }
          if (!this._valueHelpDialogVers) {
            this._valueHelpDialogVers = sap.ui.xmlfragment(
              "vcpapp.vcptimeserieshistoryv3.view.CharacDes",
              this
            );
            this.getView().addDependent(this._valueHelpDialogVers);
          }
          if (!this._nameFragment) {
            this._nameFragment = sap.ui.xmlfragment(
              "vcpapp.vcptimeserieshistoryv3.view.NameVariant",
              this
            );
            this.getView().addDependent(this._nameFragment);
          }
          if (!this._popOver) {
            this._popOver = sap.ui.xmlfragment(
              "vcpapp.vcptimeserieshistoryv3.view.PopOver",
              this
            );
            this.getView().addDependent(this._popOver);
          }
          if (!this.CustGroupFrag) {
            this.CustGroupFrag = sap.ui.xmlfragment(
              "vcpapp.vcptimeserieshistoryv3.view.CustomerGrp",
              this
            );
            this.getView().addDependent(this.CustGroupFrag);
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
          that.oList = this.byId("orderListTHC");
          this.oLoc = this.byId("idlocTHC");
          this.oProd = this.byId("prodInputTHC");
          that.oCustList = that.byId("idCustTHC");  
          that._valueHelpDialogProd.setTitleAlignment("Center");
          that._valueHelpDialogLoc.setTitleAlignment("Center");
          that._valueHelpDialogVers.setTitleAlignment("Center");
          if (!this._manageVariant) {
            this._manageVariant = sap.ui.xmlfragment(
              "vcpapp.vcptimeserieshistoryv3.view.VariantNames",
              this
            );
            this.getView().addDependent(this._manageVariant);
          }

          that.oCustList = that._oCore.byId(
            that.CustGroupFrag.getId() + "-list"
          );
          this.oProdList = this._oCore.byId(
            this._valueHelpDialogProd.getId() + "-list"
          );
          this.oLocList = this._oCore.byId(
            this._valueHelpDialogLoc.getId() + "-list"
          );
          // this.oCompList = this._oCore.byId(
          //   this._valueHelpDialogVers.getId() + "-list"
          // );
  
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
              

            },
            error: function (oData, error) {
              console.log(error)
            },
          });
          // that.version();
          that.oGModel = this.getOwnerComponent().getModel("oGModel");
          sap.ui.core.BusyIndicator.show();
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
        },
        removeDuplicate: function (array, key) {
          var check = new Set();
          return array.filter(obj => !check.has(obj[key]) && check.add(obj[key]));
        },
        CustGroup:function(){
          var aSelectedLoc = that.oLocList.getSelectedItems();
            var aSelectedProd = that.oProdList.getSelectedItems();
            var  object = {}, finalArrya = [];
          for (var i = 0; i < aSelectedLoc.length; i++) {
            object = { LOCATION_ID: aSelectedLoc[i].getTitle(), FLAG: 'EC' }
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
                  that.CustData =  JSON.parse(oData.getTSData);
                  that.oCustModel = new JSONModel()
                  that.oCustModel.setData({
                    results:that.CustData
                  })
                  sap.ui.getCore().byId("idCustomerGrpTHC").setModel(that.oCustModel)
                  sap.ui.core.BusyIndicator.hide()
                }
                else {
                  sap.ui.core.BusyIndicator.hide()
                  MessageToast.show("No customer group available for the selected Location/Product")
                }
              },
              error: function (oData, error) {
                sap.ui.core.BusyIndicator.hide()
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
            if (that.byId("idlocTHC").getTokens().length <= 0) {
              MessageToast.show("Please select a Location")
            } else {
              that._valueHelpDialogProd.open();
            }
  
            // Component Dialog
          } 
          // else if (sId.includes("idChar")) {
          //   if (that.byId("idlocTHC").getTokens().length <= 0 || that.byId("prodInputTHC").getTokens().length <= 0) {
          //     MessageToast.show("Please select a Location  and Product")
          //   }
          //    else {
          //     that._valueHelpDialogVers.open();
          //   }  
          //   // Structure Dialog
          // }
          else if(sId.includes("idCustTHC")){
            if (that.byId("idlocTHC").getTokens().length <= 0 || that.byId("prodInputTHC").getTokens().length <= 0) {
              MessageToast.show("Please select a Location  and Product")
            }
             else {
            that.CustGroupFrag.open();
             }
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
            // Component Dialog
          } 
          // else if (sId.includes("idChar")) {
          //   that._oCore
          //     .byId(this._valueHelpDialogVers.getId() + "-searchField")
          //     .setValue("");
          //   if (that.oCompList.getBinding("items")) {
          //     that.oCompList.getBinding("items").filter([]);
          //   }
  
          //   // structure Dialog
          // }
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
            sap.ui.getCore().byId("varNameListTHC").getBinding("items").filter(oFilters);
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
            this.oProd = that.byId("idlocTHC");
            var aSelectedLoc = oEvent.getParameter("selectedItems");
            // Removing selections of component 
            this.oProdL = that.byId("prodInputTHC")
            // this.oComp = that.byId("idChar")
            that.byId("fromDateTHC").setEditable(false);
            that.oListtab = new JSONModel([]);
            that.byId("onTabSearchTHC").setValue("");  
            that.byId("orderListTHC").setModel(that.oListtab)
            this._valueHelpDialogVers
              .getAggregation("_dialog")
              .getContent()[1]
              .removeSelections();
  
            that.oProdL.removeAllTokens();
            // that.oComp.removeAllTokens();
            that.oProdList.removeSelections();
            // that.oCompList.removeSelections();
  
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
              var object = { LOCATION_ID: aSelectedLoc[i].getTitle(), FLAG: "PHC" }
            }
            that.getAllProducts(object);

  
            } else {
              that.oProd.removeAllTokens();
            }
          }
          else if (sId.includes("prod")) {
            that.oSelectedProd = oEvent.getParameter("selectedItems");
            that.loadCharNumData();
            that.CustGroup();
            // Component List
          }
          // else if (sId.includes("CharaDesTHC")) {
          //   sap.ui.core.BusyIndicator.show()
          //   // that.oComp = that.byId("idChar");
          //   that.oListtab = new JSONModel([]);
          //   that.byId("onTabSearchTHC").setValue("");
          //   that.byId("orderListTHC").setModel(that.oListtab)
          //   var aSelectedComp = oEvent.getParameter("selectedItems");
          //   if (aSelectedComp && aSelectedComp.length > 0) {
          //     // that.oComp.removeAllTokens();
          //     // aSelectedComp.forEach(function (oItem) {
          //     //   that.oComp.addToken(
          //     //     new sap.m.Token({
          //     //       key: oItem.getTitle(),
          //     //       text: oItem.getTitle(),
          //     //       editable: false
          //     //     })
          //     //   );
          //     // });  
          //     var aSelectedChar = that.oCompList.getSelectedItems();
          //     var dailyFullDates = [];
          //     var dates = that.oCharNumData.filter(id=>id.CHAR_NUM === aSelectedChar[0].getTitle());
          //     if(dates.length>0){
          //     dates.forEach((el, i) => {
          //       let value = el.CAL_DATE;
          //       // let value1 = `${value.getFullYear()}-${(value.getMonth() + 1).toString().padStart(2, '0')}-${value.getDate().toString().padStart(2, '0')}`;
          //       let obj = {};
          //       obj.DATE = value;
          //       obj.key = value;
          //       dailyFullDates.push(obj);
          //     });
          //     var totalArrya = dailyFullDates.sort((a, b) => new Date(a.DATE) - new Date(b.DATE));
          //     that.newDateModel.setData({ resultsCombos: totalArrya });
          //     that.byId("fromDateTHC").setModel(that.newDateModel);
          //     that.byId("fromDateTHC").setEditable(true);
          //   }
          //   else{
          //     MessageToast.show("No dates available for selected Characteristic number")
          //     that.newDateModel.setData({ resultsCombos: [] });
          //     that.byId("fromDateTHC").setModel(that.newDateModel);
          //     that.byId("fromDateTHC").setEditable(false);
          //   }
          //     sap.ui.core.BusyIndicator.hide()
          //   } else {
          //     sap.ui.core.BusyIndicator.hide()
          //     that.oComp.removeAllTokens();
          //   }
  
          // }
          else if(sId.includes("idCustomerGrpTHC")){            
            that.oComp = that.byId("idCustTHC");
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
            }
          }
          that.handleClose(oEvent);
         
        },
  
        loadCharNumData: function () {
       //   sap.ui.core.BusyIndicator.show()
          this.oProd = that.byId("prodInputTHC");
          // this.oComp = that.byId("idChar")
          that.oListtab = new JSONModel([]);
          // that.oComp.setModel(that.oListtab);
          // that.oComp.removeAllTokens()
          // that.oCompList.removeSelections();
          that.oListtab = new JSONModel([]);
          that.byId("onTabSearchTHC").setValue("")
  
          that.byId("orderListTHC").setModel(that.oListtab);
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
            object = { LOCATION_ID: aSelectedLoc[i].getTitle(), FLAG: 'DC' }
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
                if (JSON.parse(oData.getTSData).length) {
                  var dailyFullDates = [];
                  that.oCharNumData = JSON.parse(oData.getTSData);
                  // let uniqueArray1 = that.removeDuplicate(that.oCharNumData, 'CHAR_NUM');
                  let uniqueWeekData = that.removeDuplicate(that.oCharNumData, 'CAL_DATE')
                  // that.CompModel.setData({
                  //   results: uniqueArray1
                  // })
                  // that.oCompList.setModel(that.CompModel);
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
                  that.byId("fromDateTHC").setModel(that.newDateModel);
                  that.byId("fromDateTHC").setEditable(true);
                  sap.ui.core.BusyIndicator.hide()
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
          if (that.byId("idlocTHC").getTokens.length <= 0 && that.byId("prodInputTHC").getTokens().length <= 0) {
            MessageToast.show("Please select Location and Product ")
            return false
          }
          sap.ui.core.BusyIndicator.show()
          var oList = this.getView().byId("orderListTHC");
          oList.setModel(new sap.ui.model.json.JSONModel());
          var object = {}, finalArray = [];
          oList.setProperty("growingThreshold", 20);
          that.oList.removeSelections();
          var aSelectedLoc = that.oLocList.getSelectedItems();
          var aSelectedProd = that.byId("prodInputTHC").getTokens()[0].getText();
          // var aSelectedComp = that.oCompList.getSelectedItems();
          var aSelectedCust = that.oCustList.getSelectedItems();
  
          that.oFilters = [];
            object.LOCATION_ID = aSelectedLoc[0].getTitle();
            object.PRODUCT_ID = aSelectedProd;
  
          for (var i = 0; i < aSelectedCust.length; i++) {
            object.CUSTOMER_GROUP = aSelectedCust[0].getTitle();
          } 
  
          // for (var i = 0; i < aSelectedComp.length; i++) {
          //   object.CHAR_NUM = aSelectedComp[0].getTitle();
          // }
          if (that.byId("fromDateTHC").getSelectedItem()) {
            object.WEEK_DATE=that.byId("fromDateTHC").getSelectedItem().getText() ;
          }
          var Flag = "HC";
        object.FLAG = Flag;
        finalArray.push(object);
        object = {};
          this.getOwnerComponent().getModel("BModel").callFunction("/getTimeSeriesData", {
            method: "GET",
            urlParameters: {
              Skip:that.skip,
              TopCount:that.topCount,
              TSDATA: JSON.stringify(finalArray)
            },
            // sap.ui.core.BusyIndicator.show()
            success: function (oData) {
              sap.ui.core.BusyIndicator.show();
              if (Object.keys(oData).length) {
              var totalData = JSON.parse(oData.getTimeSeriesData);
              if (that.topCount == totalData.length) {
                that.skip += parseInt(that.topCount);
                that.TSData = that.TSData.concat(totalData);
                that.onGetData();
              }
              else{
              //   sap.ui.core.BusyIndicator.hide()              
              that.skip = 0;
              that.oWeekly = that.TSData.concat(JSON.parse(oData.getTimeSeriesData));
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
  
        },
        onSearch: function (oEvent) {
          var TFilter = []
          var stnlist = that.getView().byId("orderListTHC")
          var oItemBind = stnlist.getBinding("items")
          var sValue = oEvent.getSource().getValue();
          var NewFilter = new sap.ui.model.Filter("CHAR_NUM", sap.ui.model.FilterOperator.Contains, sValue)
          TFilter.push(NewFilter)
          oItemBind.filter(TFilter)
        },
        getWeekDates: function () {
          var aSelectedLoc = that.oLocList.getSelectedItems()
          var aSelectedProd = that.oProdList.getSelectedItems();
          // var aSelectedComp = that.oCompList.getSelectedItems();
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
  
          // for (var i = 0; i < aSelectedComp.length; i++) {
          //   sFilter = new sap.ui.model.Filter({
          //     path: "CHAR_NUM",
          //     operator: sap.ui.model.FilterOperator.EQ,
          //     value1: aSelectedComp[i].getTitle(),
          //   });
          //   oFilters.push(sFilter);
          // }
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
              that.byId("fromDateTHC").setModel(that.newDateModel);
              that.byId("fromDateTHC").setEditable(true);
              sap.ui.core.BusyIndicator.hide()
            },
            error: function (oData, error) {
              MessageToast.show("error");
              sap.ui.core.BusyIndicator.hide()
            },
          });
        },
        removeDuplicate: function (array, key) {
          var check = new Set();
          return array.filter(obj => !check.has(obj[key]) && check.add(obj[key]));
        },
        createColumnConfig: function (oData) {
          var aCols = [];
          var col = that.getView().byId("orderListTHC").getColumns();
          if (col[0].getVisible(true)) {
            aCols.push({
              label: "Date",
              property: "CAL_DATE",
              type: EdmType.String
            });
          }
  
          if (col[1].getVisible(true)) {
            aCols.push({
              label: "Location",
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
            this._oTable = that.getView().byId("orderListTHC");
          }
          oTable = this._oTable;
          var data = oTable.getModel().getData();
        if (data.length > 0) {
          var searchData = that.byId("onTabSearchTHC").getValue();
          if (searchData) {
            data = data.filter(row => row.CHAR_NUM.toString().includes(searchData));
          }
          oRowBinding = data;
          aCols = this.createColumnConfig();
  
          var BATCH_SIZE = 500000; // Process data in chunks of 5 lakh rows
          var totalRows = data.length;
          var chunks = Math.ceil(totalRows / BATCH_SIZE);
          var fileName = "Time Series History Customer.xlsx";

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
          that.byId("orderListTHC").removeSelections();
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
                // that.oCompList.setModel(that.CompModel);
                for (var i = 0; i < compTokens.length; i++) {
                  // for (var k = 0; k < that.oCompList.getItems().length; k++) {
                  //   if (that.oCompList.getItems()[k].getTitle() === compTokens[i].getText()) {
                  //     that.oCompList.getItems()[k].setSelected(true);
                  //   }
                  // }
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
         * Checking if view name already exists.
         * @param {*} oEvent 
         */
        checkName: function (oEvent) {
          var sQuery = oEvent.getParameter("value") || oEvent.getParameter("newValue");
          var uniqueNames = that.oGModel.getProperty("/viewNames");
          for (var i = 0; i < uniqueNames.length; i++) {
            if (sQuery === uniqueNames[i].VARIANTNAME) {
              sap.ui.getCore().byId("idInputTHC").setValueState("Error");
              break;
            }
            else {
              sap.ui.getCore().byId("idInputTHC").setValueState("None");
              sap.ui.getCore().byId("idSaveBtnTHC").setEnabled(true);
            }
          }
          if (sap.ui.getCore().byId("idInputTHC").getValueState() === "Error") {
            sap.ui.getCore().byId("idSaveBtnTHC").setEnabled(false);
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
          that.byId("idlocTHC").removeAllTokens()
          that.byId("prodInputTHC").removeAllTokens();
          // that.byId("idChar").removeAllTokens();
          that.byId("idCustTHC").removeAllTokens();
          that.oLocList.removeSelections();
          that.oProdList.removeSelections();
          // that.oCompList.removeSelections();
          that.oCustList.removeSelections();
          var oEmpModel = new sap.ui.model.json.JSONModel([]);
          that.byId("orderListTHC").setModel(oEmpModel);
          // that.byId("idIconTabBar").setVisible(false);
          // that.byId("idIconTabBar").setSelectedKey("Weekly")
          that.byId("onTabSearchTHC").setValue("");
          that.byId("fromDateTHC").setModel(oEmpModel);
          that.byId("fromDateTHC").setEditable(false);
        },
        getAllProducts: function (object) {
          that.productsData = [];
          var tsArray = [];
          tsArray.push(object)
          this.getModel("BModel").callFunction("/getTSData", {
            method: "GET",
            urlParameters: {
              TSDATA: JSON.stringify(tsArray)
            },
            success: function (oData) {
              if (JSON.parse(oData.getTSData).length) {
                that.productsData = JSON.parse(oData.getTSData);
                var prodDetails = that.removeDuplicate(that.productsData, 'PRODUCT_ID');
                that.prodModel.setData({ results: prodDetails });
                that.oProdList.setModel(that.prodModel);
                sap.ui.core.BusyIndicator.hide()
              }else{
                sap.ui.core.BusyIndicator.hide();
                MessageToast.show("No Products available for selected location");
              }
              // }
            },
            error: function (oData, error) {
              sap.ui.core.BusyIndicator.hide()
              MessageToast.show("error");
            },
          });
        },
  
      });
    }
  );
  