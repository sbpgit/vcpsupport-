sap.ui.define([], function () {
    "use strict";

    return {        
        formatRemove: function (iValue) {
            if(iValue === undefined){
                return true;
            }
            else if(iValue === false){
                return false;
            }            
        },
        formatChange: function (iValue) {
            if(iValue === undefined){
                return true;
            }
            else if(iValue === false){
                return false;
            }            
        },
        formatScope: function (iValue) {
            if(iValue === "Public"){
                return sap.m.SharingMode.Public;
            }
            else if(iValue === "Private"){
                return sap.m.SharingMode.Private;
            }            
        },
        formatEnable: function (iValue) {
            if(iValue === undefined){
                return true;
            }
            else if(iValue === false){
                return false;
            }            
        }
    }  
});