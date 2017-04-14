const TutuLoader = require('./index');
const path = require('path');
const fs = require('fs');
const async = require('async');
const handlebars = require('handlebars');
const _ = require('lodash');

class TutuTemplateLoader extends TutuLoader {
    load(tutu) {
        var templatePath = this.templatePath;
        var componentsPath = path.join(templatePath, 'components');
        var loadFuncArray = [];

        var fileList = fs.readdirSync(templatePath);
        _.each(fileList, function(filename) {
            if (path.extname(filename) == '.html') {
                var name = filename.substr(0, _.lastIndexOf(filename, '.'));
                tutu.templates[name] = handlebars.compile(fs.readFileSync(path.join(templatePath, filename), "utf-8"));
                console.log('Load template:', name);
            } else if (path.extname(filename) == '.hbs') {
                handlebars.registerPartial('layout', fs.readFileSync(path.join(templatePath, filename), 'utf8'));
            }
        });

        if (fs.existsSync(componentsPath)) {
            fileList = fs.readdirSync(componentsPath);
            _.each(fileList, function(filename) {
                if (path.extname(filename) == '.html') {
                    var part = handlebars.compile(fs.readFileSync(path.join(componentsPath, filename), "utf-8"));
                    handlebars.registerPartial('components/' + filename, part);
                    console.log('Load partial:', filename);
                }
            });
        }
    }
}

module.exports = TutuTemplateLoader;