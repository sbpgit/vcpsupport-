sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    'sap/ui/export/Spreadsheet',
    "../model/formatter"
], (Controller, MessageToast, JSONModel, Filter, FilterOperator, MessageBox, formatter, Spreadsheet) => {
    "use strict";
    var that, oGModel;

    return Controller.extend("vcpapp.runtimeerrorlogs.controller.Home", {
        formatter: formatter,
        onInit() {
            that = this;
            if (!this._oMessageDialog) {
                this._oMessageDialog = sap.ui.xmlfragment(
                    "vcpapp.runtimeerrorlogs.view.MessageDialog",
                    this
                );
                this.getView().addDependent(this._oMessageDialog);
            }
            var oToday = new Date();
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
            var sToday = oDateFormat.format(oToday);

            // set today's date in both pickers
            this.byId("idValidFromREL").setValue(sToday);
            this.byId("idValidToREL").setValue(sToday);


        },


        // onAfterRendering
        onAfterRendering: function () {
            that = this
            that.skip = 0
            that.oGModel = that.getOwnerComponent().getModel("oGModel");
            if (!this._oMessageDialog) {
                this._oMessageDialog = sap.ui.xmlfragment(
                    "vcpapp.runtimeerrorlogs.view.MessageDialog",
                    this
                );
                this.getView().addDependent(this._oMessageDialog);
            }
            that.onGetData();
        },


        // Data Getting
        getLogData: function () {
            that.oGetLogs = [];
            var topCount = "30000" //that.oGModel.getProperty("/MaxCount");
            that.getOwnerComponent().getModel("BModel").read("/getErrorLogs", {
                // filters: oFilters,
                urlParameters: {
                    "$skip": that.skip,
                    "$top": topCount
                },
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();

                    oData.results.forEach(function (log) {
                        log.LOG_TIME = that.toUtcISOString(log.LOG_TIME);
                    });

                    if (topCount == oData.results.length) {
                        that.skip += parseInt(topCount);
                        that.oGetLogs = that.oGetLogs.concat(oData.results);
                        that.getLogData();
                    } else {
                        that.skip = 0;
                        that.oGetLogs = that.oGetLogs.concat(oData.results);
                        that.oGModel.setProperty("/oLogData", that.oGetLogs);
                        var oLogModel = new sap.ui.model.json.JSONModel();

                        oLogModel.setData({
                            Logs: that.oGetLogs
                        })
                        that.byId("idLogTable").setModel(oLogModel)

                    }
                },
                error: function (err) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("Error Loading Data");
                }
            });
        },

        // when click on go Data shown based on filters
        onGetData: function () {
            var that = this;
            if (that.oFCount === "X") {
                // DO NOTHING
            } else {
                that.oGetLogs = [];
            }
            var oValidFrom = that.byId("idValidFromREL").getDateValue();
            var oValidTo = that.byId("idValidToREL").getDateValue();

            var sType = that.byId("idTypeREL").getSelectedKey();
            if (sType === "All") {
                sType = ""
            }

            var aFilters = [];

            function toUtcDate(oDate, isEndOfDay) {
                if (!oDate) return null;

                if (isEndOfDay) {
                    oDate.setHours(23, 59, 59, 999);
                } else {
                    oDate.setHours(0, 0, 0, 0);
                }

                // shift local time to UTC without timezone offset messing
                const utcTime = oDate.getTime() - (oDate.getTimezoneOffset() * 60000);
                return new Date(utcTime).toISOString();
            }

            if (oValidFrom && oValidTo) {
                aFilters.push(
                    new sap.ui.model.Filter({
                        filters: [
                            new sap.ui.model.Filter("LOG_DATE", sap.ui.model.FilterOperator.GE, toUtcDate(oValidFrom, false)),
                            new sap.ui.model.Filter("LOG_DATE", sap.ui.model.FilterOperator.LE, toUtcDate(oValidTo, true))
                        ],
                        and: true
                    })
                );
            } else if (oValidFrom) {
                aFilters.push(new sap.ui.model.Filter("LOG_DATE", sap.ui.model.FilterOperator.GE, toUtcDate(oValidFrom, false)));
            } else if (oValidTo) {
                aFilters.push(new sap.ui.model.Filter("LOG_DATE", sap.ui.model.FilterOperator.LE, toUtcDate(oValidTo, true)));
            }


            if (sType) {
                aFilters.push(new sap.ui.model.Filter("TYPE", sap.ui.model.FilterOperator.EQ, sType));
            }

            var topCount = 30000;
            sap.ui.core.BusyIndicator.show(0);
            this.getOwnerComponent().getModel("BModel").read("/getErrorLogs", {
                filters: aFilters,
                urlParameters: {
                    "$skip": that.skip,
                    "$top": topCount
                },
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    oData.results.forEach(function (log) {
                        log.LOG_TIME = that.toUtcISOString(log.LOG_TIME);
                    });

                    if (topCount === oData.results.length) {
                        that.oFCount = "X"
                        that.skip += topCount;
                        that.oGetLogs = that.oGetLogs.concat(oData.results);
                        that.getLogData();
                    } else {
                        that.skip = 0;
                        that.oGetLogs = that.oGetLogs.concat(oData.results);
                        that.oGModel.setProperty("/oLogData", that.oGetLogs);
                        var oLogModel = new sap.ui.model.json.JSONModel({ Logs: that.oGetLogs });
                        oLogModel.setSizeLimit(that.oGetLogs.length)
                        that.byId("idLogTable").setModel(oLogModel);
                        if(that.oGetLogs.length == 0){
                            return sap.m.MessageToast.show("No logs were found for the selected date range")
                        }
                      
                    }
                },
                error: function () {
                    sap.ui.core.BusyIndicator.hide();
                    sap.m.MessageToast.show("Error Loading Data");
                }
            });
        },

        toISOString: function (oDate) {
            if (!oDate) return null;
            return oDate.toISOString(); // let JS handle UTC conversion
        },


        // toISOString: function (oDate) {
        //     if (!oDate) return null;
        //     // get IST offset in ms (5 hrs 30 mins ahead of UTC)
        //     var istOffset = 5.5 * 60 * 60 * 1000;
        //     var localTime = oDate.getTime() - (oDate.getTimezoneOffset() * 60000) + istOffset;
        //     return new Date(localTime).toISOString();
        // },

        toUtcISOString: function (sValue) {
            if (!sValue) return "";

            var oDate = new Date(sValue); // works for JS Date or Date string

            // Build manually in UTC
            var yyyy = oDate.getUTCFullYear();
            var MM = String(oDate.getUTCMonth() + 1).padStart(2, "0");
            var dd = String(oDate.getUTCDate()).padStart(2, "0");

            var HH = String(oDate.getUTCHours()).padStart(2, "0");
            var mm = String(oDate.getUTCMinutes()).padStart(2, "0");
            var ss = String(oDate.getUTCSeconds()).padStart(2, "0");
            var SSS = String(oDate.getUTCMilliseconds()).padStart(3, "0");

            return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}.${SSS}Z`;
        },


        // if msg column shows more data, data showd on fragment
        onShowMessageDetails: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var sMessage = oContext.getProperty("MESSAGE");

            if (!this._oMessageDialog) {
                this._oMessageDialog = sap.ui.xmlfragment(
                    "vcpapp.runtimeerrorlogs.view.MessageDialog",
                    this
                );
                this.getView().addDependent(this._oMessageDialog);
            }

            sap.ui.getCore().byId("idMessageTextREL").setText(sMessage);
            this._oMessageDialog.open();
        },

        // dialog close
        onCloseMessageDialog: function () {
            this._oMessageDialog.close();
        },


        // based on filters Excel data download
        onDownload: function () {
            var that = this;
            if (that.oFCount === "X") {
                // DO NOTHING
            } else {
                that.oGetLogs = [];
            }
            var oValidFrom = that.byId("idValidFromREL").getDateValue();
            var oValidTo = that.byId("idValidToREL").getDateValue();
            if (oValidFrom == "" || oValidFrom == null && oValidTo == "" | oValidTo == null) {
                MessageToast.show("Please select mandatory fields for download")
                return false
            }
            var sType = that.byId("idTypeREL").getSelectedKey();
            if (sType === "All") {
                sType = ""
            }

            var aFilters = [];


            function toUtcDate(oDate, isEndOfDay) {
                if (!oDate) return null;

                if (isEndOfDay) {
                    oDate.setHours(23, 59, 59, 999);
                } else {
                    oDate.setHours(0, 0, 0, 0);
                }

                // shift local time to UTC without timezone offset messing
                const utcTime = oDate.getTime() - (oDate.getTimezoneOffset() * 60000);
                return new Date(utcTime).toISOString();
            }

            if (oValidFrom && oValidTo) {
                aFilters.push(
                    new sap.ui.model.Filter({
                        filters: [
                            new sap.ui.model.Filter("LOG_DATE", sap.ui.model.FilterOperator.GE, toUtcDate(oValidFrom, false)),
                            new sap.ui.model.Filter("LOG_DATE", sap.ui.model.FilterOperator.LE, toUtcDate(oValidTo, true))
                        ],
                        and: true
                    })
                );
            } else if (oValidFrom) {
                aFilters.push(new sap.ui.model.Filter("LOG_DATE", sap.ui.model.FilterOperator.GE, toUtcDate(oValidFrom, false)));
            } else if (oValidTo) {
                aFilters.push(new sap.ui.model.Filter("LOG_DATE", sap.ui.model.FilterOperator.LE, toUtcDate(oValidTo, true)));
            }


            if (sType) {
                aFilters.push(new sap.ui.model.Filter("TYPE", sap.ui.model.FilterOperator.EQ, sType));
            }

            var topCount = 30000;
            this.getOwnerComponent().getModel("BModel").read("/getErrorLogs", {
                filters: aFilters,
                urlParameters: {
                    "$skip": that.skip,
                    "$top": topCount
                },
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    oData.results.forEach(function (log) {
                        log.LOG_TIME = that.toUtcISOString(log.LOG_TIME);
                        log.LOG_DATE = log.LOG_DATE.toISOString();
                    });

                    if (topCount === oData.results.length) {
                        that.oFCount = "X"
                        that.skip += topCount;
                        that.oGetLogs = that.oGetLogs.concat(oData.results);
                        that.getLogData();
                    } else {
                        that.skip = 0;
                        that.oGetLogs = that.oGetLogs.concat(oData.results);

                        if(that.oGetLogs.length == 0){
                            return  sap.m.MessageToast.show("There are no logs to download for this date range");
                        }
                        var aCols = [
                            { label: 'LOG_TIME', property: 'LOG_TIME', width: 30 },
                            { label: 'LOG_DATE', property: 'LOG_DATE', width: 25 },
                            { label: 'SERVICE', property: 'SERVICE', width: 25 },
                            { label: 'MESSAGE', property: 'MESSAGE', width: 60 },
                            { label: 'TYPE', property: 'TYPE', width: 25 }
                        ];

                        sap.ui.core.BusyIndicator.hide();
                        var oSettings = {
                            workbook: { columns: aCols },
                            dataSource: that.oGetLogs,
                            fileName: 'Run Time Error Logs.xlsx',
                            worker: true
                        };

                        var oSheet = new sap.ui.export.Spreadsheet(oSettings);
                        oSheet.build().then(function () {
                            sap.m.MessageToast.show('Download completed');
                        }).finally(function () {
                            oSheet.destroy();
                        });
                    }
                },
                error: function () {
                    sap.ui.core.BusyIndicator.hide();
                    sap.m.MessageToast.show("Error Loading Data");
                }
            });
        },


        // all reset
        onReset: function () {
            //    that.oFCount  = "";
            that.oGetLogs = []
            // that.byId("idValidFromREL").setValue("");
            // that.byId("idValidToREL").setValue("");
            var oToday = new Date();
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
            var sToday = oDateFormat.format(oToday);

            // set today's date in both pickers
            this.byId("idValidFromREL").setValue(sToday);
            this.byId("idValidToREL").setValue(sToday);
            that.byId("idTypeREL").setSelectedKey("All");
            that.onAfterRendering();
            // var oLogModel = new sap.ui.model.json.JSONModel({ Logs: [] });
            // that.byId("idLogTable").setModel(oLogModel);
        }



        // formatDateTime: function (sValue) {
        //     if (!sValue) return "";

        //     // Example: "2025-09-02T11:10:15.177Z"
        //     // Split into parts
        //     let datePart = sValue.split("T")[0];          // "2025-09-02"
        //     let timePart = sValue.split("T")[1].replace("Z", ""); // "11:10:15.177"

        //     // Pad milliseconds to 9 digits (nano style)
        //     let parts = timePart.split(".");
        //     let ms = parts[1] ? parts[1].padEnd(9, "0") : "000000000";

        //     return datePart + " " + parts[0] + "." + ms;
        // }


        // Custom date formatter
        // formatDateTime: function (oDate) {
        //     if (!oDate) return "";

        //     let pad = (n, z = 2) => ('00' + n).slice(-z);

        //     return oDate.getFullYear() + "-" +
        //         pad(oDate.getMonth() + 1) + "-" +
        //         pad(oDate.getDate()) + " " +
        //         pad(oDate.getHours()) + ":" +
        //         pad(oDate.getMinutes()) + ":" +
        //         pad(oDate.getSeconds()) + "." +
        //         pad(oDate.getMilliseconds(), 3) + "00000"; // extend to nano style
        // },



    });
});