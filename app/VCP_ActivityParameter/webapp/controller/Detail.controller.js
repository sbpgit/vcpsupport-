sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";
        var that;

        return Controller.extend("vcpapps.vcpactivityparameter.controller.Detail", {


            onInit: function () {
                that = this;
                // that.listParameters;
                that.oGModel = that.getOwnerComponent().getModel("oGModel")
                that.layoutModel = that.getOwnerComponent().getModel("layoutModel");
            },
            onAfterRendering: function () {
                if(that.oGModel.getProperty("/aid") == undefined){
                    that.layoutModel.setProperty("/layout", "OneColumn");
        that.getOwnerComponent().getRouter().navTo("Home");
                }
                else{
                var Id = that.oGModel.getProperty("/aid").activityid;
                sap.ui.core.BusyIndicator.show();
                var sActId = Id;
                var oModel = that.getOwnerComponent().getModel("BModel");
                oModel.read("/getParametersByActivity", {
                    success: function (oData) {
                        let aData = oData.results;
                        if (aData.length > 0) {
                            aData = aData.filter(el => el.ACTIVITY_ID == sActId)        
                            var oModel = new sap.ui.model.json.JSONModel();
                            oModel.setData({
                                results: aData
                            })
                            that.getView().byId("idparameterAP").setModel(oModel);
                        }else{
                           
                                var oEmptyModel = new sap.ui.model.json.JSONModel([]);
                                // oModel.setData({
                                //     results: aData
                                // })
                                that.getView().byId("idparameterAP").setModel(oEmptyModel);
                            
                        }
                        sap.ui.core.BusyIndicator.hide();
                    },
                    error: function () {
                        sap.ui.core.BusyIndicator.hide();
                        toast.show("error");
                    },
                });
            }
    

            },

            onNavBack:function(){
                var oFCL = this.oView.getParent().getParent();
                var oFirstController = sap.ui.controller("vcpapps.vcpactivityparameter.controller.Home");
                oFirstController.deSelect();
                that.layoutModel.setProperty("/layout", "OneColumn");
                that.getOwnerComponent().getRouter().navTo("Home")
            }



        });
    });
