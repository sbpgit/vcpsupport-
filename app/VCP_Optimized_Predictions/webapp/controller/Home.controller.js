sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    function (Controller) {
        "use strict";
        var that;
        return Controller.extend("vcpapp.vcpoptimizedpredictions.controller.Home", {
            onInit: function () {
                that = this;
                that.oModel = that.getOwnerComponent().getModel("oModel");
                that.getView().setModel(that.oModel);
                that.smartFilterBar = that.getView().byId("smartFilterBarOP");
            },


            
            onAfterRendering: function () {
                that.smartFilterBar.attachInitialized(() => {
                    that.smartFilterBar.getControlByKey("LOCATION_ID").setShowSelectAll(true);
                    that.smartFilterBar.getControlByKey("PRODUCT_ID").setShowSelectAll(true);
                    that.smartFilterBar.getControlByKey("MODEL_VERSION").setShowSelectAll(true);
                    that.smartFilterBar.getControlByKey("VERSION").setShowSelectAll(true);
                    that.smartFilterBar.getControlByKey("SCENARIO").setShowSelectAll(true);
                    that.smartFilterBar.getControlByKey("ALGORITHM").setShowSelectAll(true);
                })

            }
        });
    });
