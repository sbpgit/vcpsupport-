sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/export/library",
	"sap/ui/export/Spreadsheet"
], (Controller, Filter, FilterOperator, exportLibrary, Spreadsheet) => {
    "use strict";
    var that;

    return Controller.extend("vcpapp.vcpclusteringdistance.controller.Home", {
        onInit() {
            that=this;
            that.oDataModel = that.getOwnerComponent().getModel();

            that.palModel = that.getOwnerComponent().getModel("palModel");
            that.oGModel = that.getOwnerComponent().getModel("oGModel");

            if (!this.locCsDialog) {
                this.locCsDialog = sap.ui.xmlfragment("vcpapp.vcpclusteringdistance.fragments.locCs", this);
            }
            if (!this.prodCsDialog) {
                this.prodCsDialog = sap.ui.xmlfragment("vcpapp.vcpclusteringdistance.fragments.prodCs", this);
            }
            if (!this.rowSelectDialog) {
                this.rowSelectDialog = sap.ui.xmlfragment("vcpapp.vcpclusteringdistance.fragments.rowSelect", this);
            }
//  calling service to get data
            that.callService();
        },

        onAfterRendering:function(){
            that.skip = 0;
        
        },

        callService: function () {

            that.oDataModel.read("/getLocation", {
                success: function (aData) {

                    that.aLocations = aData.results;

                },
                error: function () { }
            })

        },
        onLocCSValueHelpRequest:function(){
            if(that.byId("idProdCs").getValue() !== ""){
                that.byId("idProdCs").setValue("")
            }
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({
                items:that.aLocations
            })

            sap.ui.getCore().byId("idLocCsFrag").setModel(oModel);
            that.locCsDialog.open();


        },
        onLocCsValueHelpDialogClose:function(oEvent){
            var oSelectedItem = oEvent.getParameters().selectedItem.mProperties.description;
			 var oInput = that.byId("idLocCs");


			oInput.setValue(oSelectedItem);
        },
        onProdCSValueHelpRequest:function(){
            var oSelLoc = that.byId("idLocCs").getValue();
            var aProducts;
            var oModel = new sap.ui.model.json.JSONModel();
            if(oSelLoc == ""){
                sap.m.MessageToast.show("Please select a Location")
            }
            else{
                that.oDataModel.read("/genPartialProd", {
                    filters: [
                        new Filter("LOCATION_ID", FilterOperator.EQ, oSelLoc),
                    ],
                    urlParameters: {
                        "$skip": 0,
                        "$top": 20000
                    },
                    success: function (aData) {
    
                        aProducts = aData.results;
                        oModel.setData({
                            items:aProducts
                        })
                        sap.ui.getCore().byId("idProdCsFrag").setModel(oModel);
                that.prodCsDialog.open();
    
                    },
                    error: function () { }
                })
        }
    },
    onProdValueHelpDialogClose:function(oEvent){
        var oSelectedItem = oEvent.getParameters().selectedItem.mProperties.title;
			 var oInput = that.byId("idProdCs");


			oInput.setValue(oSelectedItem);
    },
    onSearchLocFrag:function(oEvent){
        var aFilters = [];
			var sQuery = oEvent.getParameter("value");
            aFilters.push(new Filter({
                filters: [
                    new Filter("LOCATION_ID", sap.ui.model.FilterOperator.Contains, sQuery),
                    new Filter("LOCATION_DESC", sap.ui.model.FilterOperator.Contains, sQuery)

                ],
                and: false
            }));
        
			// update list binding
			var oList = sap.ui.getCore().byId("idLocCsFrag");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters);
    },
    onSearchProdFrag:function(oEvent){
        var aFilters = [];
			var sQuery = oEvent.getParameter("value");
            aFilters.push(new Filter({
                filters: [
                    new Filter("PRODUCT_ID", sap.ui.model.FilterOperator.Contains, sQuery),
                    new Filter("PROD_DESC", sap.ui.model.FilterOperator.Contains, sQuery)

                ],
                and: false
            }));
        
			// update list binding
			var oList = sap.ui.getCore().byId("idProdCsFrag");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters);
    },
    onReset:function(){
        that.byId("idLocCs").setValue("");
        that.byId("idProdCs").setValue("");
        that.onGo();
    },

    onGo:function(){
        var loc = that.byId("idLocCs").getValue();
        var prod = that.byId("idProdCs").getValue();
        that.byId("idTableCS").setVisible(true);
        var oModel = new sap.ui.model.json.JSONModel();
        that.oDataModel.read("/getClusterDistance", {
            filters: [
                new Filter( "LOCATION_ID", FilterOperator.EQ, loc),
                new Filter( "PRODUCT_ID", FilterOperator.EQ, prod),

            ],
            urlParameters: {
                "$skip": 0,
                "$top": 30000
            },
           

           
            success: function (aData) {

                aData.results.sort((a, b) => {
                    if (a.PRPID !== b.PRPID) {
                        return a.PRPID - b.PRPID;  // PRPID is numeric, so direct subtraction works
                      }
                    if (a.CLUSTER_ID !== b.CLUSTER_ID) {
                        return a.CLUSTER_ID - b.CLUSTER_ID;
                      }
                      
                      return parseFloat(a.DISTANCE) - parseFloat(b.DISTANCE);
                    });

                  
                  // Convert PRPID to string
                  that.aClusters = aData.results.map(item => ({
                    ...item,
                    PRPID: item.PRPID.toString()
                  }));

                 

                
                oModel.setData({
                    items:that.aClusters

                })
                that.byId("idTableCS").setModel(oModel);
                // that.byId("idTable").setSizeLimit(that.aClusters.length);


            },
            error: function () { }
        })
    },

    onSearch:function(){
        if(that.byId("idTableCS").getVisible() == false){
            sap.m.MessageToast.show("No Items to search")
        }
        else{
        var sQuery = that.byId("idSearchCS").getValue();
        var aFilters = [];
        var table = that.byId("idTableCS");
        var oBinding = table.getBinding("items");

        if (sQuery) {


            aFilters.push(new Filter({
                filters: [
                    new Filter("PRPID", sap.ui.model.FilterOperator.EQ, sQuery),
                    new Filter("CLUSTER_ID", sap.ui.model.FilterOperator.EQ, sQuery)

                ],
                and: false,
            }));
        }
        oBinding.filter(aFilters);
    }
    },
    onCell:function(oEvent){

        sap.ui.core.BusyIndicator.show();
        var loc = that.byId("idLocCs").getValue();
        var prod = that.byId("idProdCs").getValue();
        var prpId = oEvent.getSource().getText();
        that.oGModel.setProperty("/selPrimaryId",prpId);
       
        that.newArr = [];

        that.oDataModel.callFunction("/getClusterPIDChars", {

            method: "GET",
            urlParameters : {
                LOCATION_ID:loc,
                PRODUCT_ID:prod,
                PRIMARY_ID:prpId
            },
            
            success: function (aData) {
                
               that.newArr = aData.results;
                
               that.oGModel.setProperty("/primaryIdModel",that.newArr);
               that.getOwnerComponent().getRouter().navTo("Detail");
               sap.ui.core.BusyIndicator.hide();

            },
            error: function (e) {

                MessageBox.error("Error");

            }

        });
        
    },
    onRowSelect:function(){
        sap.ui.core.BusyIndicator.show();
        var emptyModel = new sap.ui.model.json.JSONModel();
        var eArr = [];
        emptyModel.setData({
            items:eArr
        });
        sap.ui.getCore().byId("idRowSelTableCS").setModel(emptyModel);
        
        var oModel = new sap.ui.model.json.JSONModel();
        var selItem = that.byId("idTableCS").getSelectedItem().getBindingContext().getObject();
        var loc = selItem.LOCATION_ID;
        var prod = selItem.PRODUCT_ID;
        var clustId = selItem.CLUSTER_ID;
        var TarClustId = selItem.TARGET_CLUSTER_ID;

        that.palModel.read("/clusterGroupDistances", {

            filters: [
                new Filter( "LOCATION_ID", FilterOperator.EQ, loc),
                new Filter( "PRODUCT_ID", FilterOperator.EQ, prod),
                new Filter( "SOURCE_CLUSTER_ID", FilterOperator.EQ, clustId),
                new Filter( "TARGET_CLUSTER_ID", FilterOperator.EQ, TarClustId)

            ],
                success: function (aData) {
                    sap.ui.core.BusyIndicator.hide();

                    that.palData = aData.results;
                    oModel.setData({
                        items : that.palData
                    })
                    sap.ui.getCore().byId("idRowSelTableCS").setModel(oModel);

                },
                error: function () { }
            })
        that.rowSelectDialog.open();
    },
    onCancel:function(){
        that.rowSelectDialog.close(); 
    },
    onDownload:function(){

        var aCols, oSettings, oSheet, oData = [];

    
            var sFileName = "ClusterGroupDistances";   
        
        // that.tableData = sap.ui.getCore().byId("idRowSelTableCS").getItems();

        that.palData.forEach(e =>{
            delete e.__metadata;
            oData.push(e)
            
        })
     
        var aCols = []
        var aDown = oData;
        for (var j = 0; j < Object.keys(aDown[0]).length; j++) {
            aCols.push({
                property: Object.keys(aDown[0])[j]
            });
        }
       

        var oSettings = {
            workbook: {
                columns: aCols
            },
            dataSource: aDown,
            fileName: sFileName,
            worker: true
        };
        var oSheet = new sap.ui.export.Spreadsheet(oSettings);
        oSheet.build().finally(function () {
            oSheet.destroy();
        });
        sap.m.MessageToast.show("File Downloaded Successfully")
        // that.onCancel();
    }
    
 });
});