var arrLines = [
    ["test", "1"],
    ["testing", "2"],
    ["ex", "3"]
];
var test = "test title";

JSUIVarManager.createVar("test");
JSUIVarManager.createVar("arrLines");
JSUIVarManager.setVar("test", test);
JSUIVarManager.setVar("arrLines", arrLines);