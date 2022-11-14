/**
 * Searches for all the shards present in the document and
 * add them to the JSUIShardManager
 */
// eslint-disable-next-line no-unused-vars
function initShards() {
    var shards = document.getElementsByTagName("jsui:shard");

    while (shards.length > 0) {
        JSUIShardManager.initShard(shards[0]);
    }
}

/**
 * Inserts a shard as a child of the node
 * @param {Element} node The parent node of the shard
 * @param {string} name  The name of the shard
 */
// eslint-disable-next-line no-unused-vars
function insertShard(node, name) {
    var shardNode = JSUIShardManager.getShard(name).cloneNode(true);
    parseHtml(shardNode);

    for (const child of shardNode.children) {
        node.append(child);
    }
}

/**
 * Transforms the html where there are @jsui attributes
 * @param {Element} node The node to parse
 */
function parseHtml(node) {
    var varName = null;
    if ((varName = node.getAttribute("@jsui:for")) !== null) {
        var split = varName.split(':');
        var loopVar = split[0].trim(); 
        var globalVar = evaluateString('return ' + split[1].trim());

        if (split.length != 2) {
            throw new Error(`Expected <loop_var>:<var> format but got '${varName}' !`);
        }

        JSUIVarManager.createVar(loopVar);
        var newNode;
        for (const item of globalVar) {
            JSUIVarManager.setVar(loopVar, item);
            newNode = node.cloneNode(true);
            newNode.removeAttribute("@jsui:for");

            parseHtml(newNode);

            node.parentNode.appendChild(newNode);
        }
        JSUIVarManager.delVar(loopVar);
        node.remove();
        return;
    } 
    
    if (node.getAttribute("@jsui:eval") !== null || node.getAttribute("@jsui:eval:line") !== null) {
        node.removeAttribute("@jsui:eval:line");
        node.removeAttribute("@jsui:eval");
        node.innerHTML = evaluateString('return ' + node.innerHTML.trim());
    } else if (node.getAttribute("@jsui:eval:block") !== null) {
        node.removeAttribute("@jsui:eval:block");
        node.innerHTML = evaluateString(node.innerHTML.trim());
    }

    for (const child of node.children) {
        parseHtml(child);
    }
}

/**
 * Evaluates the expression toEval and returns the result
 * The variables inside the string starting with @ will be
 * interpreted as variables from JSUIVarManager
 * @param {string} toEval The string to evaluate
 * @returns The result of the evaluated string
 */
function evaluateString(toEval) {
    var reg = new RegExp(/@[a-zA-Z_][0-9a-zA-Z_]*/g);
    for (const match of Array.from(toEval.matchAll(reg)).reverse()) {
        if (match[0].startsWith("@jsui")) {
            continue;
        }
        var toAdd = "JSUIVarManager.getObject()." + match[0].substring(1);

        toEval = toEval.slice(0, match.index) + toAdd + toEval.slice(match.index + match[0].length);
    }
    
    return new Function(toEval.trim())();
}

class JSUIShardManager {
    static #shards = new Object();

    /**
     * Inits a shard from the node of the shard
     * @param {Element} node The shard node
     */
    static initShard(node) {
        var name;
        if ((name = node.getAttribute("name")) === null) {
            throw new Error("The shard must have a name attribute !");
        }

        if (JSUIShardManager.shardExists(name)) {
            throw new Error(`The shard '${name}' already exists !`);
        }

        Reflect.set(JSUIShardManager.#shards, name, node.cloneNode(true));
        node.remove();
    }

    /**
     * Returns the node
     * @param {string} name 
     * @returns {Element} The node 
     */
    static getShard(name) {
        if (!JSUIShardManager.shardExists(name)) {
            throw new Error(`The shard '${name}' doesn't exist !`);
        }

        return Reflect.get(JSUIShardManager.#shards, name).cloneNode(true);
    }

    /**
     * Returns whether a shard exists
     * @param {string} name The name of the shard
     * @returns {boolean} Whether the shard exists
     */
    static shardExists(name) {
        return Reflect.has(JSUIShardManager.#shards, name);
    }
}

class JSUIVarManager {
    static #jsui_vars = new Object();

    /**
     * Sets the value of an existing variable
     * @param {string} name 
     * @param {any} value 
     */
    static setVar(name, value) {
        if (!JSUIVarManager.exists(name)) {
            throw new Error(`Could not find the variable '${name}' !`);
        }
        Reflect.set(JSUIVarManager.#jsui_vars, name, value);
    }

    /**
     * Gets the value of a variable
     * @param {string} name The name of the variable
     * @returns {any} The value of the variable
     */
    static getVar(name) {
        if (!JSUIVarManager.exists(name)) {
            throw new Error(`Could not find the variable '${name}' !`);
        }
        return Reflect.get(JSUIVarManager.#jsui_vars, name);
    }

    /**
     * Create a new variable
     * @param {string} name The name of the variable
     */
    static createVar(name) {
        if (JSUIVarManager.exists(name)) {
            throw new Error(`The variable '${name}' already exists !`);
        }
        Reflect.set(JSUIVarManager.#jsui_vars, name);
    }

    /**
     * Creates and set a new variable
     * @param {string} name The name of the variable
     * @param {any} value   The value to set
     */
    static createSetVar(name, value) {
        JSUIVarManager.createVar(name);
        JSUIVarManager.setVar(name, value);
    }

    /**
     * Deletes the specified variable
     * @param {string} name The name of the variable
     */
    static delVar(name) {
        if (!JSUIVarManager.exists(name)) {
            throw new Error(`Could not find the variable '${name}' !`);
        }
        Reflect.deleteProperty(JSUIVarManager.#jsui_vars, name);
    }

    /**
     * Lists the names of all the variables
     * @returns {string[]} The variables names
     */
    static listVarNames() {
        return Reflect.ownKeys(JSUIVarManager.#jsui_vars);
    }

    /**
     * Checks if a varaible exists
     * @param {string} name The name of the variable
     * @returns {boolean} Whether the variable exists
     */
    static exists(name) {
        return Reflect.has(JSUIVarManager.#jsui_vars, name);
    }

    /**
     * Returns the object used to store all the variables
     * @returns {Object} The object
     */
    static getObject() {
        return JSUIVarManager.#jsui_vars;
    }
}