document.addEventListener('DOMContentLoaded', main, false);

function main() {
    console.log(jsui_variables);
    var varManager = new JSUIVarManager(jsui_variables);

    parseHtml(document.body, varManager);

    // var variables = document.getElementsByTagName("jsui:var");
    // for (const variable of variables) {
    //     console.log(variable);
    //     var jsuiVar = new JSUIVarParser(variable);
    // }
}

/**
 * 
 * @param {Element} node 
 * @param {JSUIVarManager} varManager
 */
function parseHtml(node, varManager) {
    var varName = null;
    if ((varName = node.getAttribute("@jsui:for")) !== null) {
        var split = varName.split(':');
        var loopVar = split[0].trim(); 
        var globalVar = split[1].trim();

        if (split.length != 2) {
            throw new Error(`Expected <loop_var>:<var> format but got '${varName}' !`);
        }

        varManager.createVar(loopVar);
        var newNode;
        for (const item of varManager.getVar(globalVar)) {
            varManager.setVar(loopVar, item);
            newNode = node.cloneNode(true);
            newNode.removeAttribute("@jsui:for");

            parseHtml(newNode, varManager);

            node.parentNode.appendChild(newNode);
        }
        varManager.delVar(loopVar);
        node.remove();
        return;
    } 
    
    if ((varName = node.getAttribute("@jsui:var")) !== null) {
        node.removeAttribute("@jsui:var");
        node.innerHTML = varManager.getVar(varName);
    } 

    for (const child of node.children) {
        parseHtml(child, varManager);
    }
}

/**
 * 
 * @param {string} toEval 
 */
function evaluate(toEval) {
    var reg = new RegExp(/@[a-zA-Z_][0-9a-zA-Z_]*/g);
    for (const match of Array.from(toEval.matchAll(reg)).reverse()) {
        var toAdd = "varManager.getObject()['" + match[0] + "']";

        toEval = toEval.slice(0, match.index) + toAdd + toEval.slice(match.index + match[0].length);
    }
    return toEval;
}

class JSUIVarManager {
    #jsui_vars = new Object();

    /**
     * The constructor of JSUIVarManager
     * @param {any | null} jsuiVars The variables
     * @returns {JSUIVarManager} Variables manager
     */
    constructor(jsuiVars) {
        if (jsuiVars === null || jsuiVars === undefined) {
            return;
        }
        this.#jsui_vars = jsuiVars;
    }

    /**
     * Sets the value of an existing variable
     * @param {string} name 
     * @param {any} value 
     */
    setVar(name, value) {
        if (!this.exists(name)) {
            throw new Error(`Could not find the variable '${name}' !`);
        }
        Reflect.set(this.#jsui_vars, name, value);
    }

    /**
     * Gets the value of a variable
     * @param {string} name The name of the variable
     * @returns {any} The value of the variable
     */
    getVar(name) {
        if (!this.exists(name)) {
            throw new Error(`Could not find the variable '${name}' !`);
        }
        return Reflect.get(this.#jsui_vars, name);
    }

    /**
     * Create a new variable
     * @param {string} name The name of the variable
     */
    createVar(name) {
        if (this.exists(name)) {
            throw new Error(`The variable '${name}' already exists !`);
        }
        Reflect.set(this.#jsui_vars, name);
    }

    /**
     * Deletes the specified variable
     * @param {string} name The name of the variable
     */
    delVar(name) {
        if (!this.exists(name)) {
            throw new Error(`Could not find the variable '${name}' !`);
        }
        Reflect.deleteProperty(this.#jsui_vars, name);
    }

    /**
     * Lists the names of all the variables
     * @returns {string[]} The variables names
     */
    listVarNames() {
        return Reflect.ownKeys(this.#jsui_vars);
    }

    /**
     * Checks if a varaible exists
     * @param {*} name The name of the variable
     * @returns {boolean} Whether the variable exists
     */
    exists(name) {
        return Reflect.has(this.#jsui_vars, name);
    }

    /**
     * Returns the object used to store all the variables
     * @returns {Object} The object
     */
    getObject() {
        return this.#jsui_vars;
    }
}