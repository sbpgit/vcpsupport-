sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageBox",
  "sap/m/MessageToast"
],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, toast, Filter, FilterOperator, MessageBox, MessageToast) {
    "use strict";
    var that;
    var that, oGModel;
    var aResults;

    return Controller.extend("vcpapps.vcpactivityparameter.controller.Home", {
      onInit: function () {
        that = this;
        that.getActivityData();
        that.getParameters();
        that.layoutModel = that.getOwnerComponent().getModel("layoutModel");
        that.oGModel = that.getOwnerComponent().getModel("oGModel");
        if (!that.oActDialogFragment) {
          that.oActDialogFragment = sap.ui.xmlfragment(
            "vcpapps.vcpactivityparameter.view.actValueDialog",
            that
          );
          that.getView().addDependent(that.oActDialogFragment);
        }
        if (!that.oParDialogFragment) {
          that.oParDialogFragment = sap.ui.xmlfragment(
            "vcpapps.vcpactivityparameter.view.parameters",
            that
          );
          that.getView().addDependent(that.oParDialogFragment);
        }
        if (!that.pFragment) {
          that.pFragment = sap.ui.xmlfragment(
            "vcpapps.vcpactivityparameter.view.Parameterdialog",
            that
          );
          that.getView().addDependent(that.pFragment);
        }
        if (!that.oDialogFragment) {
          that.oDialogFragment = sap.ui.xmlfragment(
            "vcpapps.vcpactivityparameter.view.parametersdesc",
            that
          );
          that.getView().addDependent(that.oDialogFragment);
        }
        if (!this._nameFragment) {
          this._nameFragment = sap.ui.xmlfragment(
            "vcpapps.vcpactivityparameter.view.NameVariant",
            this
          );
          this.getView().addDependent(this._nameFragment);
        }
        if (!this._popOver) {
          this._popOver = sap.ui.xmlfragment(
            "vcpapps.vcpactivityparameter.view.PopOver",
            this
          );
          this.getView().addDependent(this._popOver);
        }

        that.getEnable();


      },
      // render fun
      onAfterRendering: function () {
        this.viewDetails = new JSONModel();
        that.viewDetails.setSizeLimit(5000);
        this.variantModel = new JSONModel();
        that.variantModel.setSizeLimit(5000);
        that.deletedArray = [];
        that.oGModel = that.getOwnerComponent().getModel("oGModel");
        that.oActivity = that.byId("idActIDAP");
        this.oActivityList = sap.ui.getCore().byId("ActSlctListAP");
        if (!this._manageVariant) {
          this._manageVariant = sap.ui.xmlfragment(
            "vcpapps.vcpactivityparameter.view.VariantNames",
            this
          );
          this.getView().addDependent(this._manageVariant);
        }
        // var oFCL = this.oView.getParent().getParent();
        // oFCL.setLayout(sap.f.LayoutType.TwoColumnsMidExpanded)


        // if (!that.oActDialogFragment) {
        //     that.oActDialogFragment = sap.ui.xmlfragment(
        //         "vcpapps.vcpactivityparameter.view.actValueDialog",
        //         that
        //     );
        //     that.getView().addDependent(that.oActDialogFragment);
        // }
        // if (!that.oParDialogFragment) {
        //     that.oParDialogFragment = sap.ui.xmlfragment(
        //         "vcpapps.vcpactivityparameter.view.parameters",
        //         that
        //     );
        //     that.getView().addDependent(that.oParDialogFragment);
        // }
        that.getVariantData();

      },
      getActivityData: function () {
        // that.aActivityData = [];
        // sap.ui.core.BusyIndicator.show();
        var oModel = that.getOwnerComponent().getModel("BModel");
        sap.ui.core.BusyIndicator.show();
        oModel.read("/getActivities", {
          success: function (oData) {
            that.aActivityData = oData.results;
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({
              items: that.aActivityData
            })
            that.getView().byId("idActivityAP").setModel(oModel);
            sap.ui.core.BusyIndicator.hide();
          },
          error: function () {
            sap.ui.core.BusyIndicator.hide();
            toast.show("error");
          },
        });

      },

      // },
      //#region  Events
      handleValueHelp: function () {
        that.oActDialogFragment.open();
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData({
          actitems: that.aActivityData
        })
        sap.ui.getCore().byId("ActSlctListAP").setModel(oModel);
      },

      getParameters: function (oevent) {
        // var selectedActivityId = oevent.getParameter("selectedItem").getKey(); // Assuming key is the activity ID

        // Now you have the selected activity ID, use it to fetch parameters
        var oModel = that.getOwnerComponent().getModel("BModel");
        sap.ui.core.BusyIndicator.show();
        oModel.read("/getParametersByActivity", {
          success: function (oData) {
            that.adata = oData.results;
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({
              results: that.adata
            });
            // Assuming that "oActParaListFragment" is your parameter list fragment
            // Set the model to your fragment's controls to display the parameter data
            // sap.ui.getCore().byId("idParaDialogAP").setModel(oModel);
            sap.ui.core.BusyIndicator.hide();

          },
          error: function () {
            sap.ui.core.BusyIndicator.hide();
            toast.show("error");
          },
        });
      },


      handleValueHelp2: function () {
        var selectedarray = [];
        var paraitems = that.oParDialogFragment.getItems();
        paraitems.forEach(e => {
          if (e.getSelected() == true) {
            selectedarray.push(e);
          }
        });

        if (selectedarray.length == 0) {
          // Now you have the selected activity ID, use it to fetch parameters
          var oModel = that.getOwnerComponent().getModel();
          sap.ui.core.BusyIndicator.show();

          oModel.read("/getActParameters", {
            // filters: oFilters,
            // urlParameters: {
            //     "activityId": selectedActivityId
            // },
            success: function (oData) {
              that.Data = oData.results;
              var oModel = new sap.ui.model.json.JSONModel();
              oModel.setData({
                paritems: that.Data
              });
              // Assuming that "oParDialogFragment" is your parameter list fragment
              // Set the model to your fragment's controls to display the parameter data
              sap.ui.getCore().byId("idParaDialogAP").setModel(oModel);
              sap.ui.core.BusyIndicator.hide();
              that.oParDialogFragment.open()
            },
            error: function () {
              sap.ui.core.BusyIndicator.hide();
              toast.show("error");
            },
          });
        } else {
          that.oParDialogFragment.open();
        }
      },

      handleSelection: function (oEvent) {
        var aSelectedItems = oEvent.getParameter("selectedItems");
        that.byId("idActIDAP").setValue(aSelectedItems[0].getTitle());
      },

      handleParaSelection: function (oevent) {
        var sId = oevent.getParameter("id"),
          oItem = oevent.getParameter("selectedItems");
        if (sId.includes("Para")) {
          that.parid = sap.ui.getCore().byId("idparidAP");
          var aSelectedLoc = oevent.getParameter("selectedItems");
          that.parid.removeAllTokens();
          if (aSelectedLoc && aSelectedLoc.length > 0) {
            aSelectedLoc.forEach(function (oItem) {
              that.parid.addToken(
                new sap.m.Token({
                  key: oItem.getTitle(),
                  text: oItem.getTitle(),
                  editable: false
                })
              );
            });
          }
          else {
            that.onGo();
          }
        }
      },

      handleSearch: function (oEvent) {
        var sQuery =
          oEvent.getParameter("value") || oEvent.getParameter("newValue"),
          oFilters = [];
        // Check if search filter is to be applied
        sQuery = sQuery ? sQuery.trim() : "";
        if (sQuery !== "") {
          oFilters.push(
            new Filter({
              filters: [
                new Filter("ACTIVITY_ID", FilterOperator.Contains, sQuery),
                new Filter("ACTIVITY_DESC", FilterOperator.Contains, sQuery),
              ],
              and: false,
            })
          );
        }
        sap.ui.getCore().byId("ActSlctListAP").getBinding("items").filter(oFilters);

      },
      onGo: function (evnt) {
        var parameteritems = sap.ui.getCore().byId("idparidAP").getTokens();
        var oFilters = [];
        for (var i = 0; i < parameteritems.length; i++) {
          var sFilter = new sap.ui.model.Filter({
            path: "PARAMETER_ID",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: parameteritems[i].getText(),
          });
          oFilters.push(sFilter);
        }
        var omodel = that.getOwnerComponent().getModel();
        omodel.read("/getActParameters", {
          filters: oFilters,
          success: function (oData) {
            var pdata = oData.results
            var omodel = new sap.ui.model.json.JSONModel();
            omodel.setData({
              items: pdata
            })
            sap.ui.getCore().byId("idpar1AP").setModel(omodel);
            sap.ui.core.BusyIndicator.hide();
          },
          error: function () {
            sap.ui.core.BusyIndicator.hide();
            toast.show("error");
          },
        });


      },
      rowSelection: function (oevnt) {
        // var reset = that.byId("filterbar").getText();
        // if(reset === "onResetDate"){
        //     var resetdata ={
        //             tabledata: that.getView().byId("idActivityAP").getItems()
        //             }
        //             that.oGModel.setProperty("/rid",resetdata)
        // }
        // if()  
        var idobj = {
          activityid: oevnt.getParameters().listItems[0].getCells()[0].getText(),
          activitydsc: oevnt.getParameters().listItems[0].getCells()[1].getText(),
          actaction: oevnt.getParameters().listItems[0].getCells()[2].getText()
        }
        that.oGModel.setProperty("/aid", idobj);
       
        that.layoutModel.setProperty("/layout", "TwoColumnsBeginExpanded");
        that.getOwnerComponent().getRouter().navTo("Detail");
        sap.ui.controller("vcpapps.vcpactivityparameter.controller.Detail").onAfterRendering();
      },
      onResetDate: function () {
        that.getView().byId("idActIDAP").setValue('');
        var oFCL = this.oView.getParent().getParent();
        oFCL.setLayout(sap.f.LayoutType.StartColumnFullScreen)
        if (that.aActivityData.length > 0) {
          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData({
            items: that.aActivityData
          })
          that.getView().byId("idActivityAP").setModel(oModel);
        }

        var resetdata = ""
        that.oGModel.setProperty("/aid", resetdata)
        that.oGModel.setProperty("/rid", resetdata)
        // that.layoutModel.setProperty("/layout", "TwoColumnsBeginExpanded");
        // that.getOwnerComponent().getRouter().navTo("Detail");
        // sap.ui.controller("vcpapps.vcpactivityparameter.controller.Detail").onAfterRendering();



      },
      onGoBtnPress: function () {
        // that.getView().byId("headSearch").setValue('');
        let sActId = that.getView().byId('idActIDAP').getValue();
        sap.ui.core.BusyIndicator.show();
        var oModel = that.getOwnerComponent().getModel("BModel");
        if (sActId != '') {
          oModel.read("/getActivities", {
            filters: [
              new Filter(
                "ACTIVITY_ID",
                FilterOperator.EQ,
                sActId
              )
            ],
            success: function (oData) {
              var oModel = new sap.ui.model.json.JSONModel();
              oModel.setData({
                items: oData.results
              })
              that.getView().byId("idActivityAP").setModel(oModel);
              sap.ui.core.BusyIndicator.hide();
            },
            error: function () {
              sap.ui.core.BusyIndicator.hide();
              toast.show("error");
            },
          });
        } else {
          oModel.read("/getActivities", {
            success: function (oData) {
              that.getView().byId('idActIDAP').setValue('');
              var oModel = new sap.ui.model.json.JSONModel();
              oModel.setData({
                items: oData.results
              })
              that.getView().byId("idActivityAP").setModel(oModel);
              sap.ui.core.BusyIndicator.hide();
            },
            error: function () {
              sap.ui.core.BusyIndicator.hide();
              toast.show("error");
            },
          });
        }
      },

      // listParameters: function (oEvent) {
      //     var oModel = that.getOwnerComponent().getModel("BModel");
      //     sap.ui.core.BusyIndicator.show();
      //     var sActId = oEvent.getSource().getParent().getCells()[0].getText();
      //     oModel.read("/getParametersByActivity", {
      //         success: function (oData) {
      //             let aData = oData.results;
      //             if (aData.length > 0) {
      //                 aData = aData.filter(el => el.ACTIVITY_ID == sActId)

      //                 var oModel = new sap.ui.model.json.JSONModel();
      //                 oModel.setData({
      //                     results: aData
      //                 })
      //                 // sap.ui.getCore().byId("paraListTable").setModel(oModel);
      //             }
      //             sap.ui.core.BusyIndicator.hide();
      //         },
      //         error: function () {
      //             sap.ui.core.BusyIndicator.hide();
      //             toast.show("error");
      //         },
      //     });

      // },

      onpress: function () {
        that.pFragment.open();
        var oModel = that.getOwnerComponent().getModel();
        oModel.read("/getActParameters", {
          success: function (oData) {
            that.aData = oData.results;
            // if (aData.length > 0) {
            //     aData = aData.filter(el => el.ACTIVITY_ID == sActId)

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({
              items: that.aData
            })
            sap.ui.getCore().byId("idpar1AP").setModel(oModel);
            // }
            sap.ui.core.BusyIndicator.hide();
          },
          error: function () {
            sap.ui.core.BusyIndicator.hide();
            toast.show("error");
          },
        });
        // that.pFragment.close();
        // that.layoutModel.setProperty("/layout", "TwoColumnsMidExpanded");
        // that.getOwnerComponent().getRouter().navTo("Detaildetail");
        // sap.ui.controller("vcpapps.vcpactivityparameter.controller.Detaildetail").onAfterRendering();

      },
      onEdit: function () {
        // that.oDialogFragment.open();     
        var otab = sap.ui.getCore().byId("idpar1AP").getSelectedItems();
        // for( var i=0; i<otab.length ;i++){

        var selectedItem = sap.ui.getCore().byId("idpar1AP").getSelectedItem(true);
        if (!that.oDialogFragment) {
          that.oDialogFragment = sap.ui.xmlfragment(
            "vcpapps.vcpactivityparameter.view.parametersdesc",
            that
          );
          that.getView().addDependent(that.oDialogFragment);
        }
        if (selectedItem === null) {
          sap.m.MessageToast.show("Please select a row");
          return false
        }
        //   else{
        var oparid = otab[0].getCells()[0].getText();
        var opardes = otab[0].getCells()[1].getText();
        that.oDialogFragment.open();
        sap.ui.getCore().byId("paraDialogAP").setTitle("Edit Parameter");
        sap.ui.getCore().byId("idParaAP").setEnabled(false);
        sap.ui.getCore().byId("idParaAP").setValue(oparid);
        sap.ui.getCore().byId("idParaDescAP").setValue(opardes);
        //     }
      },
      closeFragment: function () {
        var that = this;
        if (that.oDialogFragment) {
          sap.ui.getCore().byId("idParaAP").setValue('');
          sap.ui.getCore().byId("idParaDescAP").setValue('');
          that.oDialogFragment.close();
          that.oDialogFragment.destroy(true);
          that.oDialogFragment = "";
        }
      },
      saveParameter: function () {
        that = this;
        let sId = sap.ui.getCore().byId("idParaAP").getValue(),
          sDesc = sap.ui.getCore().byId("idParaDescAP").getValue();
        if (!sId || !sDesc) {
          sap.m.MessageToast.show("Please Enter ParameterID/ Description")
        }
        var Flag = 'C';
        if (sap.ui.getCore().byId("paraDialogAP").getTitle().toString().includes('Edit')) {
          Flag = 'U';
        }
        sap.ui.core.BusyIndicator.show();
        var User = "";
        if (sap.ushell.Container) {
          let email = sap.ushell.Container.getService("UserInfo").getUser().getEmail();
          User = (email) ? email : "";
        }
        const obj = {
          PARAMETER_ID: sId,
          PARAM_DESC: sDesc,
          CREATED_BY: User
        }
        var bModel = that.getOwnerComponent().getModel("oModel");
        bModel.callFunction("/maintainParameter", {
          method: "GET",
          urlParameters: {
            Flag: Flag,
            parameterData: JSON.stringify(obj)
          },
          success: function (oData) {
            sap.m.MessageToast.show("Updated Sucessfully")
            sap.ui.core.BusyIndicator.hide();
            that.onpress();
            that.onGo();
            if (oData.maintainParameter.error == false) {
              if (that.oDialogFragment) {
                that.oDialogFragment.close();
                that.oDialogFragment.destroy(true);
                that.oDialogFragment = "";
              }
              // var data = that.getView().byId("idpar1AP").getItems();
              // data.getBinding("items").refresh()
            }

            // MessageToast.show("Updated Sucessfully")
          },
          error: function (oData) {
            sap.ui.core.BusyIndicator.hide();
            sap.m.MessageToast.show("Error")
          },
        });
      },
      // saveParameter: function () {
      //   var selectedFilter = sap.ui.getCore().byId("idparidAP").getTokens();
      //   that = this;
      //   let sId = sap.ui.getCore().byId("idParaAP").getValue(),
      //     sDesc = sap.ui.getCore().byId("idParaDescAP").getValue();
      //   if (!sId || !sDesc) {
      //     sap.m.MessageToast.show("Please Enter ParameterID/ Description")
      //   }
      //   var Flag = 'C';
      //   if (sap.ui.getCore().byId("paraDialogAP").getTitle().toString().includes('Edit')) {
      //     Flag = 'U';
      //   }
      //   sap.ui.core.BusyIndicator.show();
      //   var User = "";
      //   if (sap.ushell.Container) {
      //     let email = sap.ushell.Container.getService("UserInfo").getUser().getEmail();
      //     User = (email) ? email : "";
      //   }
      //   const obj = {
      //     PARAMETER_ID: sId,
      //     PARAM_DESC: sDesc,
      //     CREATED_BY: User
      //   }
      //   var bModel = that.getOwnerComponent().getModel("oModel");
      //   // Assuming your filter property is "FilterPropertyName"
      //      var array2 =[];
      //      selectedFilter.forEach(a => {       
      //     array2.push(a);        
      //     var oFilter1 = new sap.ui.model.Filter("PARAMETER_ID", sap.ui.model.FilterOperator.EQ, a.getText());
      //   });  
      //   bModel.callFunction("/maintainParameter", {
      //     method: "GET",
      //     urlParameters: {
      //       Flag: Flag,
      //       parameterData: JSON.stringify(obj)
      //     },
      //     success: function (oData) {      
      //       var omodel = that.getOwnerComponent().getModel();
      //       omodel.read("/getActParameters", {
      //         filters: array2,
      //         success: function (oData) {
      //           var pdata = oData.results
      //           var omodel = new sap.ui.model.json.JSONModel();
      //           omodel.setData({
      //             items: pdata
      //           })
      //           sap.ui.getCore().byId("idpar1AP").setModel(omodel);
      //           sap.ui.core.BusyIndicator.hide();
      //         },
      //         error: function () {
      //           sap.ui.core.BusyIndicator.hide();
      //           toast.show("error");
      //         },
      //       });     
      //       sap.ui.core.BusyIndicator.hide();
      //       sap.m.MessageToast.show("Updated Sucessfully")
      //       // Refresh only the data based on the selected filter

      //       // that.onpress();

      //       if (oData.maintainParameter.error == false) {
      //         if (that.oDialogFragment) {
      //           that.oDialogFragment.close();
      //           that.oDialogFragment.destroy(true);
      //           that.oDialogFragment = "";
      //         }              
      //       }     
      //     },
      //     error: function (oData) {
      //       sap.ui.core.BusyIndicator.hide();
      //       sap.m.MessageToast.show("Error")
      //     },
      //   });
      // },
      closeFragment1: function () {
        that.pFragment.close();
        that.onReset();
      },

      onReset: function () {
        sap.ui.getCore().byId("idparidAP").removeAllTokens();
        //  that.oParDialogFragment.getAggregation("_dialog")
        that.oParDialogFragment
          .getAggregation("_dialog")
          .getContent()[1]
          .removeSelections();
        if (that.aData.length > 0) {
          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData({
            items: that.aData
          })
          sap.ui.getCore().byId("idpar1AP").setModel(oModel);
        }

      },

      getUserDetails: function () {
        let vUser;
        if(!sap.ushell.Container){
          vUser = "";
        }else{
          if (sap.ushell.Container) {
            let email = sap.ushell.Container.getService("UserInfo").getUser().getEmail();
            vUser = (email) ? email : "";
  
          }
        }
      
        return vUser;
      },
      getEnable: function () {
        that = this;
        var oModel = that.getOwnerComponent().getModel("BModel1");
        var vUser = this.getUserDetails();
        var oEntry = {
          USERDATA: []
        };
        let oParamVals = {
          USEREMAIL: vUser
        };
        oEntry.USERDATA.push(oParamVals);
        oModel.callFunction("/genUserAppVisibility", {
          method: "GET",
          urlParameters: {
            FLAG: 'G',
            USERDATA: JSON.stringify(oEntry.USERDATA)
          },
          success: function (oData) {

            var aResults = oData.results;
            if (aResults.length > 0) {
              var isUserLoggedIn = true;
            }
            if (isUserLoggedIn) {
              if (aResults[0].UPDATE_CHK == "disabled") {
                sap.ui.getCore().byId("onEditAP").setEnabled(false);
                MessageToast.show("User not authorised for this Edit action");
              }
            }
            else {
              sap.ui.getCore().byId("onEditAP").setEnabled(false);
            }
          },
          error: function (oData, error) {
            MessageToast.show("error");
          },
        });
      },

      handleParaSearch: function (oevnt) {
        var sQuery =
          oevnt.getParameter("value") || oevnt.getParameter("newValue"),
          sId = oevnt.getParameter("id"),
          oFilters = [];
        // Check if search filter is to be applied
        sQuery = sQuery ? sQuery.trim() : "";
        // Location
        if (sId.includes("idParaDialogAP")) {
          var idpara = sap.ui.getCore().byId("idParaDialogAP");
          if (sQuery !== "") {
            oFilters.push(
              new Filter({
                filters: [
                  new Filter("PARAMETER_ID", FilterOperator.Contains, sQuery),
                  new Filter("PARAM_DESC", FilterOperator.Contains, sQuery),
                ],
                and: false,
              })
            );
          }
          sap.ui.getCore().byId("idParaDialogAP").getBinding("items").filter(oFilters);
        }

      },
      //#Variant Code Start//
      getVariantData: function () {

        var ndData = [];
        var dData = [], uniqueName = [];
        that.uniqueName = [];
        var oModel = that.getOwnerComponent().getModel('GModel');
        sap.ui.core.BusyIndicator.show();
        var variantUser = this.getUserDetails();
        // var variantUser = "pradeepkumardaka@sbpcorp.in";
        that.oGModel.setProperty("/UserId", variantUser);

        this.getView().getModel("GModel").read("/getVariantHeader", {
          filters: [
            new Filter(
              "USER",
              FilterOperator.EQ,
              variantUser
            ),
            new Filter(
              "APPLICATION_NAME",
              FilterOperator.EQ,
              "Activity And Parameters"
            ),
          ],
          success: function (oData) {
            if (oData.results.length === 0) {
              that.oGModel.setProperty("/variantDetails", "");
              that.oGModel.setProperty("/fromFunction", "X");
              uniqueName.unshift({
                "VARIANTNAME": "Standard",
                "VARIANTID": "0",
                "DEFAULT": "Y",
              })
              that.oGModel.setProperty("/viewNames", uniqueName);
              that.oGModel.setProperty("/defaultDetails", "");
              that.viewDetails.setData({
                items1: uniqueName
              });
              that.varianNames = uniqueName;
              sap.ui.getCore().byId("idMatListAP").setModel(that.viewDetails);
              sap.ui.getCore().byId("idMatListAP").removeSelections(true);
              if (sap.ui.getCore().byId("varNameListAP")) {
                sap.ui.getCore().byId("varNameListAP").setModel(that.viewDetails);
              }
              var Default = "Standard";
              if (that.oGModel.getProperty("/newVaraintFlag") === "X") {
                var newVariant = that.oGModel.getProperty("/newVariant");
                that.handleSelectPress(newVariant[0].VARIANTNAME);
                that.oGModel.setProperty("/newVaraintFlag", "");
              } else {
                that.handleSelectPress(Default);
              }
              sap.ui.getCore().byId("idSaveAP").setVisible(false);
            }
            else {
              for (var i = 0; i < oData.results.length; i++) {
                if (oData.results[i].DEFAULT === "Y") {
                  dData.push(oData.results[i]);
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
        this.getOwnerComponent().getModel("GModel").read("/getVariant", {
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

            that.oGModel.setProperty("/fromFunction", "X");
            if (Default) {
              uniqueName.unshift({
                "VARIANTNAME": "Standard",
                "VARIANTID": "0",
                "DEFAULT": "N"
              })
              that.oGModel.setProperty("/viewNames", uniqueName);
              that.variantModel.setData({
                items1: uniqueName
              });
              that.varianNames = uniqueName;
              that.oGModel.setProperty("/defaultDetails", defaultDetails);
              sap.ui.getCore().byId("idMatListAP").setModel(that.variantModel);
              sap.ui.getCore().byId("idMatListAP").removeSelections(true);
              if (sap.ui.getCore().byId("varNameListAP")) {
                sap.ui.getCore().byId("varNameListAP").setModel(that.variantModel);
              }
              if (that.oGModel.getProperty("/newVaraintFlag") === "X") {
                var newVariant = that.oGModel.getProperty("/newVariant");
                that.handleSelectPress(newVariant[0].VARIANTNAME);
                that.oGModel.setProperty("/newVaraintFlag", "");
              } else {
                that.handleSelectPress(Default);
              }
            } else {
              uniqueName.unshift({
                "VARIANTNAME": "Standard",
                "VARIANTID": "0",
                "DEFAULT": "Y"
              })
              that.oGModel.setProperty("/viewNames", uniqueName);
              that.oGModel.setProperty("/defaultDetails", "");

              that.viewDetails.setData({
                items1: uniqueName
              });
              that.varianNames = uniqueName;
              sap.ui.getCore().byId("idMatListAP").setModel(that.viewDetails);
              sap.ui.getCore().byId("idMatListAP").removeSelections(true);
              if (sap.ui.getCore().byId("varNameListAP")) {
                sap.ui.getCore().byId("varNameListAP").setModel(that.viewDetails);
              }
              var Default = "Standard";
              if (that.oGModel.getProperty("/newVaraintFlag") === "X") {
                var newVariant = that.oGModel.getProperty("/newVariant");
                that.handleSelectPress(newVariant[0].VARIANTNAME);
                that.oGModel.setProperty("/newVaraintFlag", "");
              } else {
                that.handleSelectPress(Default);
              }
            }
            sap.ui.getCore().byId("idSaveAP").setVisible(false);

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
        var oAct,
          oTokens = {};
        that.finaloTokens = [];
        that.oGModel.setProperty("/selectedActivity", '');
        that.byId("idActIDAP").setValue();
        var oTableItems = that.oGModel.getProperty("/variantDetails");
        if (that.oGModel.getProperty("/fromFunction") === "X") {
          that.oGModel.setProperty("/fromFunction", "");
          var selectedApp = oEvent;
          var listItems = sap.ui.getCore().byId("idMatListAP").getItems();
          for (var i = 0; i < listItems.length; i++) {
            if (listItems[i].getTitle() === oEvent) {
              listItems[i].setSelected(true);
            }
          }
          that.byId("idVariantNameAP").setText(selectedApp);
          that.oGModel.setProperty("/variantName", selectedApp);
        } else {
          var selectedApp = oEvent.getSource().getSelectedItem().getTitle();
          that.byId("idVariantNameAP").setText(selectedApp);
          that.oGModel.setProperty("/variantName", selectedApp);
        }
        if (selectedApp !== "Standard") {
          for (var i = 0; i < oTableItems.length; i++) {
            if (selectedApp === oTableItems[i].VARIANTNAME && oTableItems[i].APPLICATION_NAME === "Activity And Parameters") {
              if (oTableItems[i].FIELD.includes("Activity")) {
                oAct = oTableItems[i].VALUE;
                that.byId("idActIDAP").setValue(oAct);
                oTokens = {
                  FIELD: oTableItems[i].FIELD,
                  VALUE: oTableItems[i].VALUE
                }
                that.finaloTokens.push(oTokens);
                that.oGModel.setProperty("/selectedActivity", oAct);
              }
            }
          }
          if (oAct) {
            that.oActivityList.getItems().forEach(item => {
              if (item.getTitle() === oAct) {
                item.setSelected(true);
              }
            })
          }

          that._popOver.close();
          sap.ui.core.BusyIndicator.hide();
          that.byId("idDropDownAP").setPressed(false);
        } else {
          //do nothing
          that.byId("idDropDownAP").setPressed(false);
          that.byId("idActIDAP").setValue();
          sap.ui.getCore().byId("idSaveAP").setVisible(false);
          that._popOver.close();
          that.onResetDate();
          if (that.oActivityList.getItems().length > 0) {
            that.oActivityList.getItems().forEach(item => {
              item.setSelected(false);
            })
          }
          sap.ui.core.BusyIndicator.hide();
        }
      },
      /**
                   * On Press of drop down button
                   * @param {*} oEvent 
                   */
      onDropDownPress: function (oEvent) {
        var count = 0;
        if (oEvent.getSource().getPressed()) {
          this._popOver.openBy(oEvent.getSource());
          var locDetails = that.byId("idActIDAP").getValue();
          var locDefault = that.oGModel.getProperty("/selectedActivity");
          var selectedID = that.byId("idVariantNameAP").getText();
          if (selectedID !== "Standard" && that.oGModel.getProperty("/saveBtn") !== "X") {
            if (locDetails !== locDefault) {
              sap.ui.getCore().byId("idSaveAP").setVisible(true);
              sap.ui.getCore().byId("idSaveAP").setType("Emphasized");
            }
            else {
              sap.ui.getCore().byId("idSaveAP").setVisible(false);
            }
          } else {
            sap.ui.getCore().byId("idSaveAP").setVisible(false);
            sap.ui.getCore().byId("idSaveAP").setType("Emphasized");
          }
        }
        else {
          this._popOver.close();
        }
      },
      /**
                 * Opening the NameVariant fragment on press of "SaveAs" in popover fragment
                 */
      onVariantSave: function () {
        that.byId("idDropDownAP").setPressed(false);
        that._popOver.close();
        that._nameFragment.open();
        sap.ui.getCore().byId("idInputAP").setValue();
        sap.ui.getCore().byId("idInputAP").setValueState("None");
        sap.ui.getCore().byId("idSaveBtnAP").setEnabled(true);
      },
      /**
                  * Closing the namevariant fragment
                  */
      onSaveClose: function () {
        that._nameFragment.close();
      },
      /**
                 * Creating a new VIEW on press of save in NameVariant fragment
                 * @param {*} oEvent 
                 */
      onCreate: function (oEvent) {
        that.byId("idDropDownAP").setPressed(false);
        var array = [];
        var details = {};
        if (that.oActivity.getValue()) {
          var sActivity = that.byId("idActIDAP").getValue();
        }
        var Field1 = that.byId("idActIDAP").getParent().getItems()[0].getText();
        var varName = sap.ui.getCore().byId("idInputAP").getValue();
        var sDefault = sap.ui.getCore().byId("_IDGenCheckBox1AP").getSelected();
        if (!sActivity) {
          sap.ui.getCore().byId("_IDGenCheckBox1AP").setSelected(false);
          sap.ui.getCore().byId("idInputAP").setValue();
          that._nameFragment.close();
          return MessageToast.show("No values for filters in Activity ID");
        }
        if (varName) {
          if (sDefault && that.oGModel.getProperty("/defaultDetails").length > 0) {
            var defaultChecked = "Y";
            this.getView().getModel("GModel").callFunction("/updateVariant", {
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

          } else if (sDefault && that.oGModel.getProperty("/defaultDetails").length === 0) {
            var defaultChecked = "Y";
          } else {
            var defaultChecked = "N";
          }
          if (that.oActivity.getValue()) {
            details = {
              Field: Field1,
              FieldCenter: (1).toString(),
              Value: sActivity,
              FAVOURITE: "N",
              Default: defaultChecked
            }
            array.push(details);
          }

          for (var j = 0; j < array.length; j++) {
            array[j].IDNAME = varName;
            array[j].App_Name = "Activity And Parameters"
          }
          this.getView().getModel("GModel").callFunction("/createVariant", {
            method: "GET",
            urlParameters: {
              Flag: "X",
              USER: that.oGModel.getProperty("/UserId"),
              VARDATA: JSON.stringify(array)
            },
            success: function (oData) {
              that.oGModel.setProperty("/newVariant", oData.results);
              that.oGModel.setProperty("/newVaraintFlag", "X");
              sap.ui.getCore().byId("_IDGenCheckBox1AP").setSelected(false);
              sap.ui.getCore().byId("idInputAP").setValue();
              that._nameFragment.close();
              that.onAfterRendering();
            },
            error: function (error) {
              MessageToast.show("Failed to create variant");
            },
          });
        } else {
          MessageToast.show("Please fill View Name");
        }
      },
      /**
            * Opening the VariantNames fragment on press of "Manage" in popover fragment
            * @param {*} oEvent 
            */
      onManageOpen: function (oEvent) {
        that._popOver.close();
        that.byId("idDropDownAP").setPressed(false);
        if (that.oGModel.getProperty("/deletedFlag") === "X") {
          if (!this._manageVariant) {
            this._manageVariant = sap.ui.xmlfragment(
              "vcpapps.vcpactivityparameter.view.VariantNames",
              this
            );
            this.getView().addDependent(this._manageVariant);
          }
          that.newModel = new JSONModel();
          that.emptyModel = new JSONModel([]);
          that.newModel.setData({ items1: that.varianNames });
          sap.ui.getCore().byId("varNameListAP").setModel(that.newModel);
          that._manageVariant.open();
          that.oGModel.setProperty('/deletedFlag', "");
          that.deletedArray = [];
        }
        else {
          that._manageVariant.open();
        }
      },
      /**
             * Closing the VariantNames fragment
             */
      handleManageClose: function () {
        sap.ui.getCore().byId("_IDGenSearchField1AP").setValue();
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
        var source = sap.ui.getCore().byId("varNameListAP");
        source.removeItem(selectedItem);
        that.oGModel.setProperty('/deletedFlag', "X");
      },
      /**
                * Saving the public/private property on click of save in VariantNames fragment. 
                */
      onManage: function () {
        var newSelection = {};
        var newDefault = [];
        var initalDetails = that.oGModel.getProperty("/defaultVariant");
        var oTable = sap.ui.getCore().byId("varNameListAP").getItems();
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
            this.getView().getModel("GModel").callFunction("/updateVariant", {
              method: "GET",
              urlParameters: {
                VARDATA: JSON.stringify(initalDetails)
              },
              success: function (oData) {
                that.handleManageClose();
                that.onAfterRendering();
              },
              error: function (error) {
                MessageToast.show("Failed to update variant");
              },
            });
          } else {

            this.getView().getModel("GModel").callFunction("/updateVariant", {
              method: "GET",
              urlParameters: {
                VARDATA: JSON.stringify(newDefault)
              },
              success: function (oData) {
                that.handleManageClose();
                that.onAfterRendering();
              },
              error: function (error) {
                MessageToast.show("Failed to update variant");
              },
            });
            for (i in initalDetails) {
              initalDetails[i].DEFAULT = "N"
            }
            this.getView().getModel("GModel").callFunction("/updateVariant", {
              method: "GET",
              urlParameters: {
                VARDATA: JSON.stringify(initalDetails)
              },
              success: function (oData) {
                that.handleManageClose();
                that.onAfterRendering();
              },
              error: function (error) {
                MessageToast.show("Failed to update variant");
              },
            });

          }
        } else {
          this.getView().getModel("GModel").callFunction("/updateVariant", {
            method: "GET",
            urlParameters: {
              VARDATA: JSON.stringify(newDefault)
            },
            success: function (oData) {
              that.handleManageClose();
              that.onAfterRendering();
            },
            error: function (error) {
              MessageToast.show("Failed to update variant");
            },
          });
        }
      },
      /**
                  * Save the current view if any changes in the existing properties.
                  */
      onSave: function () {
        var updatedDetails = {};
        var updatedArray = [];
        var selectedItem = sap.ui.getCore().byId("idMatListAP");
        if (selectedItem.getSelectedItem() !== null) {
          var Default = selectedItem.getSelectedItem().getBindingContext().getObject().DEFAULT;
          var VariantId = selectedItem.getSelectedItem().getBindingContext().getObject().VARIANTID;
          var VariantName = selectedItem.getSelectedItem().getBindingContext().getObject().VARIANTNAME;

        } else {
          var defaulDetails1 = that.oGModel.getProperty("/defaultDetails");
          var VariantId = defaulDetails1[0].VARIANTID;
          var VariantName = defaulDetails1[0].VARIANTNAME;
          var Default = "Y";
        }
        if (that.oActivity.getValue()) {
          var sActivity = that.byId("idActIDAP").getValue();
        }

        var Field1 = that.byId("idActIDAP").getParent().getItems()[0].getText();
        if (!sActivity) {
          that._popOver.close();
          return MessageToast.show("No values for filters in Manufacturing Location");
        }
        if (VariantName) {
          if (that.oActivity.getValue()) {
            updatedDetails = {
              Field: Field1,
              FieldCenter: (1).toString(),
              Value: sActivity,
              FAVOURITE: "N",
              Default: Default
            }
            updatedArray.push(updatedDetails);
          }
          for (var j = 0; j < updatedArray.length; j++) {
            updatedArray[j].ID = VariantId;
            updatedArray[j].IDNAME = VariantName;
            updatedArray[j].App_Name = "Activity And Parameters"
          }


          this.getView().getModel("GModel").callFunction("/createVariant", {
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
              that.byId("idDropDownAP").setPressed(false);
            },
            error: function (error) {

              MessageToast.show("Failed to update variant");
            },
          });
        } else {
          MessageToast.show("Please fill View Name");
        }
      },
         /**
            * Checking if view name already exists
            * @param {*} oEvent 
            */
         checkName: function (oEvent) {
          var sQuery = oEvent.getParameter("value") || oEvent.getParameter("newValue");
          var uniqueNames = that.oGModel.getProperty("/viewNames");
          for (var i = 0; i < uniqueNames.length; i++) {
              if (sQuery === uniqueNames[i].VARIANTNAME) {
                  sap.ui.getCore().byId("idInputAP").setValueState("Error");
                  break;
              } else {
                  sap.ui.getCore().byId("idInputAP").setValueState("None");
                  sap.ui.getCore().byId("idSaveBtnAP").setEnabled(true);
              }
          }
          if (sap.ui.getCore().byId("idInputAP").getValueState() === "Error") {
              sap.ui.getCore().byId("idSaveBtnAP").setEnabled(false);
          }
      },
       /**
       * 
       */

       deleteVariant: function () {
          that.getView().getModel("GModel").callFunction("/createVariant", {
              method: "GET",
              urlParameters: {
                  Flag: "D",
                  USER: that.oGModel.getProperty("/UserId"),
                  VARDATA: JSON.stringify(that.deletedArray)
              },
              success: function (oData) {
                  that.deletedArray = [];
              },
              error: function (error) {
                  sap.ui.core.BusyIndicator.hide();
                  MessageToast.show("Failed to delete variant");
              },
          });
      },
      deSelect:function(){
       that.byId("idActivityAP").removeSelections(true)
       
         
      }
    });
  });





