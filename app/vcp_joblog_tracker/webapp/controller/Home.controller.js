sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/export/Spreadsheet",
],
    function (Controller, JSONModel, Filter, FilterOperator, MessageToast,Spreadsheet) {
        "use strict";
        var that;

        return Controller.extend("vcpapp.vcpjoblog.controller.Home", {
            onInit: function () {
                
                that = this
                that.oGModel = that.getOwnerComponent().getModel("CModel");
                if (!that.newLocDialog) {
                    that.newLocDialog = sap.ui.xmlfragment(
                        "vcpapp.vcpjoblog.fragments.jobid", that);
                    this.getView().addDependent(this.newLocDialog);
                }
                if (!that.newNameDialog) {
                    that.newNameDialog = sap.ui.xmlfragment(
                        "vcpapp.vcpjoblog.fragments.jobname", that);
                    this.getView().addDependent(this.newNameDialog);
                }
                if (!that.newstateDialog) {
                    that.newstateDialog = sap.ui.xmlfragment(
                        "vcpapp.vcpjoblog.fragments.jobstate", that);
                    this.getView().addDependent(this.newstateDialog);
                }
                if (!that.newstatusDialog) {
                    that.newstatusDialog = sap.ui.xmlfragment(
                        "vcpapp.vcpjoblog.fragments.jobstatus", that);
                    this.getView().addDependent(this.newstatusDialog);
                }
                if (!that.runnextDialog) {
                    that.runnextDialog = sap.ui.xmlfragment(
                        "vcpapp.vcpjoblog.fragments.runtext", that);
                    this.getView().addDependent(this.runnextDialog);
                }
                if (!that.LocDialog) {
                    that.LocDialog = sap.ui.xmlfragment(
                        "vcpapp.vcpjoblog.fragments.Loc", that);
                    this.getView().addDependent(this.LocDialog);
                }
                if (!that.ProdDialog) {
                    that.ProdDialog = sap.ui.xmlfragment(
                        "vcpapp.vcpjoblog.fragments.Prod", that);
                    this.getView().addDependent(this.ProdDialog);
                }
                if (!this.settingsDialog) {
                    this.settingsDialog = sap.ui.xmlfragment("vcpapp.vcpjoblog.fragments.settings", this);
                }

                that.getOwnerComponent().getModel("CModel").read("/getUserPreferences", {
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
                        if (that.timezone === "" || that.timezone === undefined || that.timezone === null) {
                            that.timezone = "UTC+00:00"
                        }

                        that.oGModel.setProperty("/timezone", that.timezone);
                    },
                    error: function (oData, error) {
                        console.log(error)
                    },
                });
                that.IntialLoad()

            },
            onAfterRendering: function () {
                var dModel = that.getOwnerComponent().getModel("CModel").read("/getfactorylocdesc", {
                    success:function(oData){
                        var aLocResults = oData.results
                        if(aLocResults.length > 0){
                        var aLoc = that.removeDuplicates(aLocResults,"DEMAND_LOC")
                        var oJSONModel = new sap.ui.model.json.JSONModel();
                        oJSONModel.setSizeLimit(1000);
                        oJSONModel.setData({
                            aItems: aLoc

                        })
                        sap.ui.getCore().byId("idLocationJLT").setModel(oJSONModel)
                        }else{
                            // MessageToast.show("No data ")
                            // return false
                        }
                    },
                    error:function(error){
                        console.log(error)
                    }
                })
            },
            
            IntialLoad: function () {
                var oModel = that.getOwnerComponent().getModel('BModel');
                sap.ui.core.BusyIndicator.show();
                oModel.read('/getJobStatusNew', {
                    urlParameters:{
                        LOCATION_ID : "",
                        PRODUCT_ID:""
                    },
                    success: function (aData) {
                        that.data = JSON.parse(aData.getJobStatusNew)
                        that.data = that.data
                        sap.ui.core.BusyIndicator.hide()
                        that.cData = that.ConvertedTime(that.data)
                        var rows = that.removeDuplicates(that.data, "JOB_ID")
                        var oJSONModel = new sap.ui.model.json.JSONModel();
                        oJSONModel.setSizeLimit(1000);
                        oJSONModel.setData({
                            aItems: rows

                        })
                        sap.ui.getCore().byId("jobidJLT").setModel(oJSONModel)
                        //JOB_NAME
                        var Jnmes = that.removeDuplicates(that.data, "JOB_NAME")
                        var oJSONModel = new sap.ui.model.json.JSONModel();
                        oJSONModel.setData({
                            aItems: Jnmes
                        })
                        sap.ui.getCore().byId("jobnameJLT").setModel(oJSONModel)
                        //RUN_STATUS
                        var RunStatus = that.removeDuplicates(that.data, "RUN_STATUS")
                        var oJSONModel = new sap.ui.model.json.JSONModel();
                        oJSONModel.setData({
                            aItems: RunStatus
                        })
                        sap.ui.getCore().byId("jobstatusJLT").setModel(oJSONModel)
                        //RUN_STATE
                        var RunState = that.removeDuplicates(that.data, "RUN_STATE")
                        var oJSONModel = new sap.ui.model.json.JSONModel();
                        oJSONModel.setData({
                            aItems: RunState
                        })
                        sap.ui.getCore().byId("jstateJLT").setModel(oJSONModel)
                        var oModel = new sap.ui.model.json.JSONModel();
                        oModel.setData({
                            aItems:  that.data //that.data.sort((a, b) => b.JOB_ID - a.JOB_ID)

                        })
                        that.byId("TableListJLT").setModel(oModel)
                    }
                })
            },
            handleValueHelp: function (oEvent) {
                var id = oEvent.oSource.sId
                if (id.includes("JidJLT")) {
                    sap.ui.getCore().byId("jobidJLT").getBinding("items").filter([]);
                    that.newLocDialog.open()
                } else if(id.includes("lidLocJLT")){
                    sap.ui.getCore().byId("idLocationJLT").getBinding("items").filter([])
                    that.LocDialog.open()
                }
                else if(id.includes("liProdJLT")){
                    if(that.byId("lidLocJLT").getValue().length > 0){
                        sap.ui.getCore().byId("idProductJLT").getBinding("items").filter([])
                        that.ProdDialog.open()
                    }else{
                        MessageToast.show("Please select Location")
                    }
                  
                }
                else if (id.includes("JnameJLT")) {
                    sap.ui.getCore().byId("jobnameJLT").getBinding("items").filter([]);
                    that.newNameDialog.open()

                } else if (id.includes("JRunStatusJLT")) {
                    sap.ui.getCore().byId("jobstatusJLT").getBinding("items").filter([])
                    that.newstatusDialog.open()
                } else {
                    sap.ui.getCore().byId("jstateJLT").getBinding("items").filter([]);
                    that.newstateDialog.open()
                }
            },
            handleSelection: function (oEvent) {
                var id = oEvent.oSource.sId
                var aSelected = oEvent.getParameters().selectedItem.getTitle()
                var oTotal = []
                if (id.includes("jobidJLT")) {
                    that.byId("JidJLT").setValue(aSelected)
                    
                    // that.data.forEach(el =>{
                    //    if(el.JOB_ID == parseInt(that.byId("JidJLT").getValue(aSelected))){
                    //     oTotal.push(el)
                    //    }

                    // })
                    var sName = that.removeDuplicates(that.data, "JOB_NAME")
                    var oJSONModel = new sap.ui.model.json.JSONModel();
                    oJSONModel.setData({
                        aItems: sName
                    })
                    sap.ui.getCore().byId("jobnameJLT").setModel(oJSONModel)

                } else if(id.includes("idLocationJLT")){
                    that.byId("lidLocJLT").setValue(aSelected);
                    sap.ui.core.BusyIndicator.show()
                    that.getOwnerComponent().getModel("CModel").callFunction("/getAllProdNew",{
                        // that.getModel("BModel").callFunction("/getAllProdNew", {
                            method: "GET",
                            urlParameters: {
                                LOC: JSON.stringify([that.byId("lidLocJLT").getValue()]),
                            },
                        // filters:that.byId("lidLocJLT").getValue(),
                        success:function(oData){
                            sap.ui.core.BusyIndicator.hide()
                            var aProd = oData.results
                            if(aProd.length> 0){
                                var oProd = that.removeDuplicates(aProd, "PRODUCT_ID")
                                var oJSONModel = new sap.ui.model.json.JSONModel();
                                oJSONModel.setData({
                                    aItems: oProd
                                })
                                sap.ui.getCore().byId("idProductJLT").setModel(oJSONModel)

                            }
                        },error:function(e){
                            console.log(e)
                            sap.ui.core.BusyIndicator.hide()
                            MessageToast.show("Error While Products Loading")

                        }
                    })

                }
                else if(id.includes("idProductJLT")){
                    that.byId("liProdJLT").setValue(aSelected);
                }
                else if (id.includes("jobnameJLT")) {
                    that.byId("JnameJLT").setValue(aSelected)
                    var sStatus = that.removeDuplicates(that.data, "RUN_STATUS")
                    var oJSONModel = new sap.ui.model.json.JSONModel();
                    oJSONModel.setData({
                        aItems: sStatus
                    })
                    sap.ui.getCore().byId("jobstatusJLT").setModel(oJSONModel)

                } else if (id.includes("jobstatusJLT")) {
                    that.byId("JRunStatusJLT").setValue(aSelected)
                    var sState = that.removeDuplicates(that.data, "RUN_STATE")
                    var oJSONModel = new sap.ui.model.json.JSONModel();
                    oJSONModel.setData({
                        aItems: sState
                    })
                    sap.ui.getCore().byId("jstateJLT").setModel(oJSONModel)
                } else {
                    that.byId("JRunStateJLT").setValue(aSelected)
                }
            },
            onGetData: function () {
                var iLoc = that.byId("lidLocJLT").getValue()
                var sProd = that.byId("liProdJLT").getValue()
                var iJid = that.byId("JidJLT").getValue()
                var sJname = that.byId("JnameJLT").getValue()
                var sJrunStatus = that.byId("JRunStatusJLT").getValue()
                var sJrunState = that.byId("JRunStateJLT").getValue()
                if(iLoc == "" && sProd=="" && iJid=="" && sJname=="" && sJrunStatus=="" &&sJrunState== ""){
                    that.IntialLoad()

                    // var aModel = new sap.ui.model.json.JSONModel();
                    //     aModel.setData({
                    //         aItems: that.data
                    //     })
                    //     that.byId("TableListJLT").setModel(aModel)
                }else{
                    var aFilteredData = [];
                    let aTotalFilData = [];
                    if(iLoc.length > 0 || sProd.length > 0){
                        sap.ui.core.BusyIndicator.show()
                        that.getOwnerComponent().getModel("BModel").read('/getJobStatusNew', {
                            urlParameters:{
                                LOCATION_ID :iLoc,
                                PRODUCT_ID:sProd
                            },
                            success: function (aData) {
                                sap.ui.core.BusyIndicator.hide()
                                if(aData.length == 0){
                                    MessageToast.show("No data for this filters")
                                    return false
                                }
                                aFilteredData = JSON.parse(aData.getJobStatusNew)
                                that.ConvertedTime(aFilteredData)
                                if(aFilteredData.length >0){
                                    if(iJid.length == 0 && sJname.length == 0 && sJrunStatus.length == 0 && sJrunState.length == 0){
                                       aTotalFilData =  aFilteredData.concat(aTotalFilData)
                                    }
                                    else{
                                        aFilteredData.forEach(item => {
                                            if(item.JOB_ID == iJid){
                                                aTotalFilData.push(item)
                                            }
                                            else if(item.JOB_NAME == sJname){
                                                aTotalFilData.push(item)
                                            }
                                            else if (item.JOB_ID == iJid || item.JOB_NAME == sJname || item.RUN_STATUS == sJrunStatus || item.RUN_STATE == sJrunState) {
                                                aTotalFilData.push(item)
                                            } 
                                        })
                                    }
                                    if(aTotalFilData.length > 0){
                                        var aModel = new sap.ui.model.json.JSONModel();
                                        aModel.setData({
                                            aItems: aTotalFilData
                                        })
                                        that.byId("TableListJLT").setModel(aModel)
                                    }else{
                                        var aEmptyModel = new sap.ui.model.json.JSONModel([]);
                                        that.byId("TableListJLT").setModel(aEmptyModel)
                                        MessageToast.show("No data for this filters")
                                        return false;
                                    }
                                }else{
                                    var aEmptyModel = new sap.ui.model.json.JSONModel([]);
                                    that.byId("TableListJLT").setModel(aEmptyModel)
                                    MessageToast.show("No data for this filters")
                                    return false;
                                }
                            }
                        })
                    }
                    else{
                        that.data.forEach(item =>{
                            if(item.JOB_ID == iJid){
                                aTotalFilData.push(item)
                            }
                            else if(item.JOB_NAME == sJname){
                                aTotalFilData.push(item)
                            }
                            else if (item.JOB_ID == iJid || item.JOB_NAME == sJname || item.RUN_STATUS == sJrunStatus || item.RUN_STATE == sJrunState) {
                                aTotalFilData.push(item)
                            } 
                        })
                        if (aTotalFilData.length <= 0) {
                            var aEmptyModel = new sap.ui.model.json.JSONModel([]);
                            that.byId("TableListJLT").setModel(aEmptyModel)
                            MessageToast.show("No data for this filters")
                            return false;
                        }
                        else {
                            var aModel = new sap.ui.model.json.JSONModel();
                            aModel.setData({
                                aItems: aTotalFilData
                            })
                            that.byId("TableListJLT").setModel(aModel)
                        }
                    }
                }
               
            },
            removeDuplicates: function (array, key) {
                var check = new Set();
                return array.filter(obj => !check.has(obj[key]) && check.add(obj[key]));
            },
            onResetData: function () {
                that.byId("JidJLT").setValue("")
                that.byId("JnameJLT").setValue("")
                that.byId("JRunStatusJLT").setValue("")
                that.byId("JRunStateJLT").setValue("")
                that.byId("lidLocJLT").setValue("")
                that.byId("liProdJLT").setValue("")
                var aEmptyModel = new sap.ui.model.json.JSONModel([]);
                that.byId("TableListJLT").setModel(aEmptyModel)
                that.byId("headSearchJLT").setValue("")
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({
                    aItems: that.data
                })
                that.byId("TableListJLT").setModel(oModel)
                // that.IntialLoad()
                
            },
            ConvertedTime: function (aData) {
                // that.zone = new Date().getTimezoneOffset().toString();
                // that.opr = that.zone.slice(0,1);
                // that.opr = new Date().toString().split("GMT")[1].slice(0, 1);
                // if (that.zone.includes("-")) {
                //     that.zHours = (Math.floor(that.zone.slice(1) / 60)) * 60 * 60 * 1000;
                //     that.zMin = (that.zone.slice(1) % 60) * 60 * 1000;
                // } else {
                //     that.zHours = (Math.floor(that.zone / 60)) * 60 * 60 * 1000;
                //     that.zMin = (that.zone % 60) * 60 * 1000;
                // }
                aData.forEach(ele => {
                    const COMPLETED_TIMESTAMP = new Date(ele.COMPLETED_TIMESTAMP);
                    var SCHEDULED_TIMESTAMP = new Date(ele.SCHEDULED_TIMESTAMP);
                    var SCH_END_TIME = new Date(ele.SCH_END_TIME);
                    var SCH_NEXTRUN = new Date(ele.SCH_NEXTRUN);
                    var SCH_STARTTIME = new Date(ele.SCH_STARTTIME);
                    const targetTimeZone = that.timezone;
                    // if (that.opr == "-") {
                    //     COMPLETED_TIMESTAMP.setTime(COMPLETED_TIMESTAMP.getTime() + (that.zHours + that.zMin));
                    //     SCHEDULED_TIMESTAMP.setTime(SCHEDULED_TIMESTAMP.getTime() + (that.zHours + that.zMin));
                    //     SCH_END_TIME.setTime(SCH_END_TIME.getTime() + (that.zHours + that.zMin));
                    //     SCH_NEXTRUN.setTime(SCH_NEXTRUN.getTime() + (that.zHours + that.zMin));
                    //     SCH_STARTTIME.setTime(SCH_STARTTIME.getTime() + (that.zHours + that.zMin));
                    // }
                    // else {
                    //     COMPLETED_TIMESTAMP.setTime(COMPLETED_TIMESTAMP.getTime() - (that.zHours + that.zMin));
                    //     SCHEDULED_TIMESTAMP.setTime(SCHEDULED_TIMESTAMP.getTime() - (that.zHours + that.zMin));
                    //     SCH_END_TIME.setTime(SCH_END_TIME.getTime() - (that.zHours + that.zMin));
                    //     SCH_NEXTRUN.setTime(SCH_NEXTRUN.getTime() - (that.zHours + that.zMin));
                    //     SCH_STARTTIME.setTime(SCH_STARTTIME.getTime() - (that.zHours + that.zMin));
                    // }
                    var opr = (targetTimeZone.split("UTC")[1]).slice(0, 1);
                    var hours = ((targetTimeZone.split("UTC")[1]).slice(1)).split(":")[0];
                    var min = ((targetTimeZone.split("UTC")[1]).slice(1)).split(":")[1];
                    var mHours = hours * 60 * 60 * 1000;
                    var mMins = min * 60 * 1000;
                    if (opr == "-") {
                        COMPLETED_TIMESTAMP.setTime(COMPLETED_TIMESTAMP.getTime() - (mHours + mMins));
                        SCHEDULED_TIMESTAMP.setTime(SCHEDULED_TIMESTAMP.getTime() -  (mHours + mMins));
                        SCH_END_TIME.setTime(SCH_END_TIME.getTime() -  (mHours + mMins));
                        SCH_NEXTRUN.setTime(SCH_NEXTRUN.getTime() -  (mHours + mMins));
                        SCH_STARTTIME.setTime(SCH_STARTTIME.getTime() -  (mHours + mMins));
                    }
                    else {
                        COMPLETED_TIMESTAMP.setTime(COMPLETED_TIMESTAMP.getTime() + (mHours + mMins));
                        SCHEDULED_TIMESTAMP.setTime(SCHEDULED_TIMESTAMP.getTime() +  (mHours + mMins));
                        SCH_END_TIME.setTime(SCH_END_TIME.getTime() +  (mHours + mMins));
                        SCH_NEXTRUN.setTime(SCH_NEXTRUN.getTime() +  (mHours + mMins));
                        SCH_STARTTIME.setTime(SCH_STARTTIME.getTime() +  (mHours + mMins));
                    }

                    const convertedDate1 = COMPLETED_TIMESTAMP.toLocaleString('en-US', { dateStyle: "short", timeStyle: "medium", hour12: true });
                    const convertedDate2 = SCHEDULED_TIMESTAMP.toLocaleString('en-US', { dateStyle: "short", timeStyle: "medium", hour12: true });
                    const convertedDate3 = SCH_END_TIME.toLocaleString('en-US', { dateStyle: "short", timeStyle: "medium", hour12: true });
                    const convertedDate4 = SCH_NEXTRUN.toLocaleString('en-US', { dateStyle: "short", timeStyle: "medium", hour12: true });
                    const convertedDate5 = SCH_STARTTIME.toLocaleString('en-US', { dateStyle: "short", timeStyle: "medium", hour12: true });
                    // return convertedDate
                    ele.COMPLETED_TIMESTAMP = convertedDate1;
                    ele.SCHEDULED_TIMESTAMP = convertedDate2
                    ele.SCH_END_TIME = convertedDate3
                    ele.SCH_NEXTRUN = convertedDate4
                    ele.SCH_STARTTIME = convertedDate5
                });
            },
            onSearch: function (oEvent) {
                var sQuery =
                    oEvent.getParameter("value") || oEvent.getParameter("newValue"),
                    sId = oEvent.getParameter("id"),
                    oFilters = [];
                sQuery = sQuery ? sQuery.trim() : "";
                // if (sId.split("--")[2].includes("headSearchJLT")) {
                if (sQuery !== "") {
                    oFilters.push(
                        new Filter({
                            filters: [
                                new Filter("JOB_ID", FilterOperator.EQ, sQuery),
                                new Filter("JOB_NAME", FilterOperator.Contains, sQuery),
                                // new Filter("PRODUCT_ID", FilterOperator.Contains, sQuery),
                                // new Filter("PROD_DESC", FilterOperator.Contains, sQuery)
                                // new Filter("SCOPE", FilterOperator.Contains, sQuery)
                            ],
                            and: false,
                        })
                    );
                    that.byId("TableListJLT").getBinding("rows").filter(oFilters)
                }else{
                    that.byId("TableListJLT").getBinding("rows").filter([])
                }
                
                // }
            },
            handleSearch: function (oEvent) {
                var sQuery =
                    oEvent.getParameter("value") || oEvent.getParameter("newValue"),
                    sId = oEvent.getParameter("id"),
                    oFilters = [];
                sQuery = sQuery ? sQuery.trim() : "";
                // Location
                if (sId.includes("jobidJLT")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("JOB_ID", FilterOperator.EQ, parseInt(sQuery))
                                ],
                                and: false,
                            })
                        );
                    }
                    sap.ui.getCore().byId("jobidJLT").getBinding("items").filter(oFilters);
                    // JOB_NAME
                } else if (sId.includes("jobnameJLT")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("JOB_NAME", FilterOperator.Contains, sQuery),
                                ],
                                and: false,
                            })
                        );
                    }
                    sap.ui.getCore().byId("jobnameJLT").getBinding("items").filter(oFilters);
                    // RUNSTATUS
                } else if (sId.includes("jobstatusJLT")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("RUN_STATUS", FilterOperator.Contains, sQuery),
                                ],
                                and: false,
                            })
                        );
                    }
                    sap.ui.getCore().byId("jobstatusJLT").getBinding("items").filter(oFilters);
                }
                else if (sId.includes("jstateJLT")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("RUN_STATE", FilterOperator.Contains, sQuery),
                                ],
                                and: false,
                            })
                        );
                    }
                    sap.ui.getCore().byId("jstateJLT").getBinding("items").filter(oFilters);
                }
                else if(sId.includes("idLocationJLT")){
                    if(sQuery !==""){
                        oFilters.push(
                            new Filter({
                                filters:[
                                    new Filter("DEMAND_LOC", FilterOperator.Contains, sQuery),
                                ],
                                and: false,
                            })
                        )
                    }
                    sap.ui.getCore().byId("idLocationJLT").getBinding("items").filter(oFilters)
                }
                else if(sId.includes("idProductJLT")){
                    if(sQuery !==""){
                        oFilters.push(
                            new Filter({
                                filters:[
                                    new Filter("PRODUCT_ID", FilterOperator.Contains, sQuery),
                                ],
                                and: false,
                            })
                        )
                    }
                    sap.ui.getCore().byId("idProductJLT").getBinding("items").filter(oFilters)
                }
            },
            onDownLoad:function(oEvent){
                var aDown = that.byId("TableListJLT").oModels.undefined.oData.aItems
                var aCols, oSettings, oSheet;
                var sFileName = "Job Log Tracker - " + new Date().getTime();
                var aCols = []
                for(var j=0; j<Object.keys(aDown[0]).length; j++){
                    aCols.push({
                        property:Object.keys(aDown[0])[j]
                    });
                }
               var  oSettings = {
                            workbook: {
                                columns: aCols
                            },
                            dataSource: aDown,
                            fileName: sFileName,
                            worker: true
                        };
                        var oSheet = new Spreadsheet(oSettings);
                        oSheet.build().finally(function () {
                            oSheet.destroy();
                        });
            },
            onShowLog:function(oEvent){
               var aLogData = oEvent.getSource().getBindingContext().getObject()
               var RunText =  JSON.parse(aLogData.RUNTEXT);
               that.ConvertedTime1(RunText)
                var oJSONModel = new JSONModel();
                oJSONModel.setData({
                    aItems:RunText
                })
              
                sap.ui.getCore().byId("jobTableJLT").setModel(oJSONModel)
                that.runnextDialog.open()
                
                
               
            },
            ConvertedTime1: function (RunText) {
                // that.zone = new Date().getTimezoneOffset().toString();
                // that.opr = that.zone.slice(0,1);
                // that.opr = new Date().toString().split("GMT")[1].slice(0, 1);
                // if (that.zone.includes("-")) {
                //     that.zHours = (Math.floor(that.zone.slice(1) / 60)) * 60 * 60 * 1000;
                //     that.zMin = (that.zone.slice(1) % 60) * 60 * 1000;
                // } else {
                //     that.zHours = (Math.floor(that.zone / 60)) * 60 * 60 * 1000;
                //     that.zMin = (that.zone % 60) * 60 * 1000;
                // }
                RunText.forEach(ele => {
                    var time = new Date(ele.time);
                    const targetTimeZone = that.timezone;
                    // if (that.opr == "-") {
                    //     time.setTime(time.getTime() + (that.zHours + that.zMin));
                    // }
                    // else {
                    //     time.setTime(time.getTime() - (that.zHours + that.zMin));
                    // }
                    var opr = (targetTimeZone.split("UTC")[1]).slice(0, 1);
                    var hours = ((targetTimeZone.split("UTC")[1]).slice(1)).split(":")[0];
                    var min = ((targetTimeZone.split("UTC")[1]).slice(1)).split(":")[1];
                    var mHours = hours * 60 * 60 * 1000;
                    var mMins = min * 60 * 1000;
                    if (opr == "-") {
                        time.setTime(time.getTime() - (mHours + mMins));
                    }
                    else {
                        time.setTime(time.getTime() + (mHours + mMins));
                    }
                    const convertedDate1 = time.toLocaleString('en-US', { dateStyle: "medium", timeStyle: "medium", hour12: true });
                    // return convertedDate
                    ele.time = convertedDate1;
                   
                });
            },
            onClose:function(){
                that.runnextDialog.close()
            },
            onCancel:function(oEvent){
                let sId = oEvent.getSource().sId
                if(sId.includes("idLocationJLT")){
                    that.LocDialog.close
                }else{
                    that.ProdDialog.close
                }

            },
            formatTextAndCode:function(type, code){
                if(type == null || type == undefined){
                    type = ""
                    return type + "\n" + code;   
                }else{
                    return   type   + "\n" + code;
                }
                
            },
            onCreateJob: function () {
                // Define the URL and request body
                // const data = {
                //     PRODUCT_ID: that.selectProduct,
                //     PROJECT_ID: that.selectProject,
                //     DELFLAG: that.flag
                // };
                var data =[];            
                var aScheduleSEDT = {};
                // Get Job Schedule Start/End Date/Time
                aScheduleSEDT = that.getScheduleSEDT();
                var dCurrDateTime = new Date().getTime();
                var actionText = "/jobs/syncJobsOneTime";
                var JobName = "SYNC_JOB_ONETIME" + dCurrDateTime;
                sap.ui.core.BusyIndicator.show();
                var finalList = {
                    name: JobName,
                    description: "SYNC_JOB_ONETIME",
                    action: encodeURIComponent(actionText),
                    active: true,
                    httpMethod: "POST",
                    startTime: aScheduleSEDT.djSdate,
                    endTime: aScheduleSEDT.djEdate,
                    createdAt: aScheduleSEDT.djSdate,
                    schedules: [{
                        data: data,
                        cron: "",
                        time: aScheduleSEDT.oneTime,
                        active: true,
                        startTime: aScheduleSEDT.dsSDate,
                        endTime: aScheduleSEDT.dsEDate,
                    }]
                };
                this.getOwnerComponent().getModel("BModel").callFunction("/addMLJob", {
                    method: "GET",
                    urlParameters: {
                        jobDetails: JSON.stringify(finalList),
                    },
                    success: function (oData) {
                        // that.byId("idGenSeedOrder").setEnabled(false);
                        sap.m.MessageToast.show("Jobs Sync started please wait for sometime to finish the process." );
                        // that.IntialLoad()
                        sap.ui.core.BusyIndicator.hide();
                    },
                    error: function (error) {
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageToast.show("Failed to sync jobs.");
                    },
                });
            },
            getScheduleSEDT: function () {
                var aScheduleSEDT = {};
                var dDate = new Date();
                // 07-09-2022-1                
                var idSchTime = dDate.setSeconds(dDate.getSeconds() + 20);
                // 07-09-2022-1
                var idSETime = dDate.setHours(dDate.getHours() + 2);
                idSchTime = new Date(idSchTime);
                idSETime = new Date(idSETime);
                //var onetime = idSchTime;
                var djSdate = new Date(),
                    djEdate = idSETime,
                    dsSDate = new Date(),
                    dsEDate = idSETime,
                    tjStime,
                    tjEtime,
                    tsStime,
                    tsEtime;
 
                djSdate = djSdate.toISOString().split("T");
                tjStime = djSdate[1].split(":");
                djEdate = djEdate.toISOString().split("T");
                tjEtime = djEdate[1].split(":");
                dsSDate = dsSDate.toISOString().split("T");
                tsStime = dsSDate[1].split(":");
                dsEDate = dsEDate.toISOString().split("T");
                tsEtime = dsEDate[1].split(":");
 
                var dDate = new Date().toLocaleString().split(" ");
                aScheduleSEDT.djSdate = djSdate[0] + " " + tjStime[0] + ":" + tjStime[1] + " " + "+0000";
                aScheduleSEDT.djEdate = djEdate[0] + " " + tjEtime[0] + ":" + tjEtime[1] + " " + "+0000";
                aScheduleSEDT.dsSDate = dsSDate[0] + " " + tsStime[0] + ":" + tsStime[1] + " " + "+0000";
                aScheduleSEDT.dsEDate = dsEDate[0] + " " + tsEtime[0] + ":" + tsEtime[1] + " " + "+0000";
                aScheduleSEDT.oneTime = idSchTime;

                return aScheduleSEDT;
            },
            onSettings: function (oEvent) {
                that.settingsDialog.open();
                that.table = that.byId("TableListJLT");
                var aColumns = that.table.getColumns();
                var aVisFields = [];
                var aFieldNames =  [
                    {
                        "name": "JOB ID"
                    },
                    {
                        "name": "JOB NAME"
                    },
                    {
                        "name": "SCH START TIME"
                    },
                    {
                        "name": "COMPLETED TIME STAMP"
                    },
                    {
                        "name": "SCH END TIME"
                    },
                    {
                        "name": "RUN STATUS"
                    },
                    {
                        "name": "RUN STATE"
                    },
                    {
                        "name": "SCHEDULE NEXT RUN"
                    },
                    {
                        "name": "RUN TEXT"
                    },
                
                ]
                for (var i = 0; i < aColumns.length; i++) {
                    if (aColumns[i].mProperties.visible == true) {
                        aVisFields.push(aColumns[i].getHeader().mProperties.text)
                    }
                }
                aFieldNames.forEach(function (e) {
                    if (aVisFields.includes(e.name)) {
                        e["select"] = true
                    } else {
                        e["select"] = false
                    }
                });
                var oModel = new sap.ui.model.json.JSONModel({
                    items: aFieldNames
                });
                sap.ui.getCore().byId("idListJLT").setModel(oModel);
    
    
    
            },
            onOk: function (oEvent) {
                var selKey = sap.ui.getCore().byId("idIconTabJLT").getSelectedKey();
                if(selKey == "Columns"){
                 var aSelected = sap.ui.getCore().byId("idListJLT").getSelectedItems();
                 var aColumns = that.table.getColumns();
                 var aCommonValues = [];
                 for (var i = 0; i < aSelected.length; i++) {
                     aCommonValues.push(aSelected[i].mProperties.title)
                 }
                 aColumns.forEach(function (oColumn) {
                     var oHeader = oColumn.getHeader();
                     if (oHeader && aCommonValues.includes(oHeader.getText())) {
                         
                         oColumn.setVisible(true);
                     } else {
                      
                         oColumn.setVisible(false);
                     }
                 });
                 that.onCancel();
             }
             if(selKey == "Sort"){
                  that.selSortOrder = sap.ui.getCore().byId("idSortOrdListJLT").getSelectedItem().mProperties.title;
                  that.selSortBy = sap.ui.getCore().byId("idSortByListJLT").getSelectedItem().mProperties.title;
                  that._sortTable();
             }
     
             },
             _sortTable: function (bDescending) {

                if (that.selSortBy  == "JOB ID"){
                    that.colName = "JOB_ID"
                }
                if (that.selSortBy == "JOB NAME"){
                    that.colName = "JOB_NAME"
                }
                if (that.selSortBy == "SCH START TIME"){
                    that.colName = "SCH_START_TIME"
                }
                if (that.selSortBy == "COMPLETED TIME STAMP"){
                    that.colName = "COMPLETED_TIME_STAMP"
                }
                if (that.selSortBy == "SCH END TIME"){
                    that.colName = "SCH_END_TIME"
                }
                if (that.selSortBy == "RUN STATUS"){
                    that.colName = "RUN_STATUS"
                }
                if (that.selSortBy == "RUN STATE"){
                    that.colName = "RUN_STATE"
                }
                if (that.selSortBy == "SCHEDULE NEXT RUN"){
                    that.colName = "SCHEDULE_NEXT_RUN"
                }
                if (that.selSortBy == "RUN TEXT"){
                    that.colName = "RUN_TEXT"
                }
    
                if(that.selSortOrder == "Ascending"){
                    var bDescending = false;
                }
                if(that.selSortOrder == "Descending"){
                    var bDescending = true;
                }
                var oTable = this.getView().byId("TableListJLT"); 
                var oBinding = oTable.getBinding("items"); 
            
                var sSortField = that.colName; 
            
                if (oBinding) {
                    oBinding.sort(new sap.ui.model.Sorter(sSortField, bDescending));
                }
            
                this.settingsDialog.close();
            },
            onCancel: function () {
                if (that.settingsDialog) {
                    that.settingsDialog.close();
                }
            },
        });
    });
