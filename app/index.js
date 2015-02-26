'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var SogouGenerator = yeoman.generators.Base.extend({
    initializing: function() {
        this.pkg = require('../package.json');
        this.manifest = {
            permissions: {}
        };
        // set source root path to templates
        this.sourceRoot(path.join(__dirname, 'templates'));
    },
    prompting: function() {
        var done = this.async();
        // Have Yeoman greet the user.
        this.log(yosay('Welcome to the groovy Sogou generator!'));
        var prompts = [{
            name: 'name',
            message: '请给扩展起个名字', //What would you like to call this extension?
            default: (this.appname) ? this.appname : 'SogouExplorerApp'
        }, {
            name: 'description',
            message: '请给扩展写个备注', //How would you like to describe this extension?
            default: 'My SogouExplorerApp Extension'
        }, {
            name: 'author',
            message: '请填写搜狗ID (必填)', //How would you like to describe this extension?
            default: 'wangjianfeng'
        }, {
            type: 'list',
            name: 'action',
            message: '请选择您需要使用的UI Action', //Would you like to use UI Action?
            choices: ['No', 'Browser', 'Page']
        }, {
            type: 'checkbox',
            name: 'uifeatures',
            message: '请选择您需要使用到的具体UI模块', //Would you like more UI Features?
            choices: [{
                value: 'options',
                name: 'Options Page',
                checked: false
            }, {
                value: 'contentscript',
                name: 'Content Scripts',
                checked: false
            }, {
                value: 'omnibox',
                name: 'Omnibox',
                checked: false
            }]
        }, {
            type: 'checkbox',
            name: 'permissions',
            message: '请选择您要启用的权限（permissions）', //Would you like to use permissions
            choices: [{
                value: 'tabs',
                name: 'Tabs',
                checked: false
            }, {
                value: 'bookmark',
                name: 'Bookmarks',
                checked: false
            }, {
                value: 'cookie',
                name: 'Cookies',
                checked: false
            }, {
                value: 'history',
                name: 'History',
                checked: false
            }, {
                value: 'management',
                name: 'Management',
                checked: false
            }]
        }];
        this.prompt(prompts, function(answers) {
            var isChecked = function(choices, value) {
                return choices.indexOf(value) > -1;
            };
            this.appname = this.manifest.name = answers.name.replace(/\"/g, '\\"');
            this.manifest.description = answers.description.replace(/\"/g, '\\"');
            this.manifest.author = answers.author.replace(/\"/g, '\\"');
            this.manifest.action = (answers.action === 'No') ? 0 : (answers.action === 'Browser') ? 1 : 2;
            this.manifest.options = isChecked(answers.uifeatures, 'options');
            this.manifest.omnibox = isChecked(answers.uifeatures, 'omnibox');
            this.manifest.contentscript = isChecked(answers.uifeatures, 'contentscript');
            this.manifest.permissions.tabs = isChecked(answers.permissions, 'tabs');
            this.manifest.permissions.bookmarks = isChecked(answers.permissions, 'bookmarks');
            this.manifest.permissions.cookies = isChecked(answers.permissions, 'cookies');
            this.manifest.permissions.history = isChecked(answers.permissions, 'history');
            this.manifest.permissions.management = isChecked(answers.permissions, 'management');
            done();
        }.bind(this));
    },
    writing: {
        app: function() {
            this.dest.mkdir('app');
            this.src.copy('_package.json', 'package.json');
            this.src.copy('_bower.json', 'bower.json');
            this.src.copy('readme.md', 'readme.md');
        },
        projectfiles: function() {
            this.src.copy('editorconfig', '.editorconfig');
            this.src.copy('jshintrc', '.jshintrc');
        },
        gulp: function() {
            var done = this.async();
            // 安装gulp模块, this.npmInstall()会解决模块安装问题，对同一模块只安装一次  
            this.npmInstall(['gulp', 'gulp-connect'], {
                'saveDev': true
            }, done);
            this.template('gulpfile.js');
        },
        manifest: function() {
            var manifest = {};
            var permissions = [];
            var items = [];
            var bg = {
                page: 'background.html'
            }

            if (this.manifest.name) {               
                manifest['id'] = JSON.stringify('com.sogou.'+ this.manifest.name, null, 2).replace(/\n/g, '\n  ');
                manifest['name'] = JSON.stringify(this.manifest.name, null, 2).replace(/\n/g, '\n  ');
            }
            if (this.manifest.description) {
                manifest['description'] = JSON.stringify(this.manifest.description, null, 2).replace(/\n/g, '\n  ');
            }
            if (this.manifest.author) {
                manifest['author'] = JSON.stringify(this.manifest.author, null, 2).replace(/\n/g, '\n  ');
            }
            // add browser / page action field
            if (this.manifest.action > 0) {
                var action = {
                    default_icon: {
                        19: 'images/icon-19.png',
                        38: 'images/icon-38.png'
                    },
                    default_title: this.manifest.name,
                    default_popup: 'popup.html'
                };
                var title = (this.manifest.action === 1) ? 'browser_action' : 'page_action';
                bg.page = (this.manifest.action === 1) ? 'background_browseraction.html' : 'background_pageaction.html';
                manifest[title] = JSON.stringify(action, null, 2).replace(/\n/g, '\n  ');
            }
            manifest['background'] = JSON.stringify(bg, null, 2).replace(/\n/g, '\n  ');
            // add options page field.
            if (this.manifest.options) {
                manifest.options_page = '"options.html"';
            }
            // add omnibox keyword field.
            if (this.manifest.omnibox) {
                manifest.omnibox = JSON.stringify({
                    keyword: this.manifest.name
                }, null, 2).replace(/\n/g, '\n  ');
            }
            // add contentscript field.
            if (this.manifest.contentscript) {
                var contentscript = [{
                    matches: ['http://*/*', 'https://*/*'],
                    js: ['scripts/contentscript.js'],
                    run_at: 'document_end',
                    all_frames: false
                }];
                manifest.content_scripts = JSON.stringify(contentscript, null, 2).replace(/\n/g, '\n  ');
            }
            // add generate permission field.
            for (var p in this.manifest.permissions) {
                if (this.manifest.permissions[p]) {
                    permissions.push(p);
                }
            }
            // add generic match pattern field.
            if (this.manifest.permissions.tabs) {
                permissions.push('http://*/*');
                permissions.push('https://*/*');
            }
            if (permissions.length > 0) {
                manifest.permissions = JSON.stringify(permissions, null, 2).replace(/\n/g, '\n  ');
            }
            for (var i in manifest) {
                items.push(['  "', i, '": ', manifest[i]].join(''));
            }
            this.manifest.items = (items.length > 0) ? ',\n' + items.join(',\n') : '';
            this.template('manifest.json', 'app/manifest.json');
        },
        actions: function() {
            if (this.manifest.action === 0) {
                return;
            }
            this.src.copy('popup.html', 'app/popup.html');
            this.src.copy('scripts/popup.js', 'app/scripts/popup.js');
            this.src.copy('images/icon-19.png', 'app/images/icon-19.png');
            this.src.copy('images/icon-38.png', 'app/images/icon-38.png');
        },
        eventpage: function() {
            var backgroundjs = 'background.js',
                bgHtml = 'background.html';
            if (this.manifest.action === 2) {
                backgroundjs = 'background.pageaction.js', bgHtml = "background_pageaction.html";
            } else if (this.manifest.action === 1) {
                backgroundjs = 'background.browseraction.js', bgHtml = "background_browseraction.html";
            }
            this.src.copy(bgHtml, 'app/' + bgHtml);
            this.src.copy('scripts/' + backgroundjs, 'app/scripts/' + backgroundjs);
            this.src.copy('scripts/chromereload.js', 'app/scripts/chromereload.js');
        },
        options: function() {
            if (!this.manifest.options) {
                return;
            }
            this.src.copy('options.html', 'app/options.html');
            this.src.copy('scripts/options.js', 'app/scripts/options.js');
        },
        contentscript: function() {
            if (!this.manifest.contentscript) {
                return;
            }
            this.src.copy('scripts/contentscript.js', 'app/scripts/contentscript.js');
        },
        mainStylesheet: function() {
            if (this.manifest.action === 0 && !this.manifest.options) {
                return;
            }
            this.src.copy('styles/main.css', 'app/styles/main.css');
        },
        assets: function() {
            this.src.copy('images/icon-16.png', 'app/images/icon-16.png');
            this.src.copy('images/icon-128.png', 'app/images/icon-128.png');
        }
    },
    end: function() {
        this.installDependencies();
    }
});
module.exports = SogouGenerator;