sap.ui.define([], function () {
    "use strict";
    return {
        formatLogTime: function (sValue) {
            if (!sValue) return "";

            // parse OData ISO string
            var oDate = new Date(sValue);

            // helper for zero padding
            var pad = function (num, size) {
                var s = "000" + num;
                return s.substr(s.length - size);
            };

            return oDate.getFullYear() + "-" +
                pad(oDate.getMonth() + 1, 2) + "-" +
                pad(oDate.getDate(), 2) + " " +
                pad(oDate.getHours(), 2) + ":" +
                pad(oDate.getMinutes(), 2) + ":" +
                pad(oDate.getSeconds(), 2) + "." +
                pad(oDate.getMilliseconds(), 3) + "00000";
        },

        isMoreInfoVisible: function (sMessage) {
            if (!sMessage) {
                return false;
            }

            // Approximate: assume ~50 characters per line
            var maxCharsFor3Lines = 3 * 50;

            return sMessage.length > maxCharsFor3Lines;
        },
        // formatMoreInfoVisible: function (sMessage) {
        //     if (!sMessage) {
        //         return false;
        //     }
        //     return sMessage.split(/\r\n|\r|\n/).length > 3; // show if more than 3 lines
        // },
        formatMoreInfoVisible: function (sMessage) {
            // if (typeof sMessage !== "string") {
            //     return false;
            // }
            // Count explicit line breaks:
            //  - Windows: \r\n
            //  - Unix: \n
            //  - Old Mac: \r
            //  - Escaped backslash-n: \\n (two chars)
            //  - Some payloads use /n (slash-n)
            var breaks = (sMessage.match(/(\r\n|\\n|\n|\/n|\r)/g) || []).length;

            // Show "More Info" only if there are 3 or more breaks (i.e., 4+ lines)
            return breaks >= 3; // MUST return a boolean
        },


    };
});
