
/**
 * Scans for page scripts.
 * */

const fs = require('fs');
const path = require('path');

const pathToPages = ["js/application/pages"];

function getJsModuleNames(pathToFolder, modulePrefix, moduleSufix) {
    let modules = [];
    const files = fs.readdirSync(pathToFolder);
    files.forEach(function(f) {
        let pathToFile = pathToFolder + "/" +  f;
        if(fs.lstatSync(pathToFile).isDirectory()){
            modules = modules.concat(getJsModuleNames(pathToFile, (modulePrefix + "/" + f), moduleSufix))
        } else if (f.endsWith(moduleSufix)) {
            modules.push(modulePrefix + "/" + f.substring(0, f.lastIndexOf(".js")));
        }
    });
    return modules;
}

module.exports = {

    getModuleLocator: function(sourcePath) {

        let pageScripts = [];
        pathToPages.map((appPath)=>{
            pageScripts = pageScripts.concat(getJsModuleNames(sourcePath + "/" + appPath, appPath, "page.js"))
        });

        return {
            getPageEntries: function() {
                const entries = {};

                pageScripts.forEach(function(s) {
                    entries[s] = s;
                });

                return entries;
            }
        }
    }
};