/* eslint-disable no-undef */
document.addEventListener('DOMContentLoaded', () => {
    var arrLines = [
        ["test", "1"],
        ["testing", "2"],
        ["ex", "3"]
    ];
    var test = "test title";

    JSUIVarManager.createSetVar("test", test);
    JSUIVarManager.createSetVar("arrLines", arrLines);

    initShards();
    insertShard(document.body, "evalBlock");
    insertShard(document.getElementById("tableParent"), "table");
    arrLines = [
        ["test", "a", "b", "c", "d"],
        ["new ", "111"]
    ];
    JSUIVarManager.setVar("arrLines", arrLines);
    insertShard(document.getElementById("tableParent"), "table");
}, false);