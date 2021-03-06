'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay-sogou');
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
        this.log(yosay('Welcome to the groovy Sogou generator! now, let\'s config the manifest.json'));
        var prompts = [{
            name: 'name',
            message: 'name', //What would you like to call this extension?
            default: (this.appname) ? this.appname : 'SogouExplorerApp'
        }, {
            name: 'description',
            message: 'description', //How would you like to describe this extension?
            default: 'My SogouExplorerApp Extension'
        }, {
            name: 'author',
            message: 'author', //How would you like to describe this extension?
            default: 'Sogou'
        }, {
            type: 'list',
            name: 'action',//用 browser actions 可以在chrome主工具条的地址栏右侧增加一个图标;使用page actions把图标放置到地址栏里
            message: 'Would you like to use UI Action?', //Would you like to use UI Action? 
            choices: ['No', 'Browser', 'Page']
        }, {
            type: 'checkbox',
            name: 'uifeatures',
            message: 'Would you like more UI Features?', //Would you like more UI Features?
            choices: [{
                value: 'options',
                name: 'Options Page',
                checked: false
            }, {
                value: 'contentscript',
                name: 'Content Scripts',
                checked: false
            }, {
                value: 'omnibox',//需要指定像素为16x16的图标，以便当用户输入关键字时，在地址栏中显示。
                name: 'Omnibox',
                checked: false
            }]
        }, {
            type: 'checkbox',
            name: 'permissions',
            message: 'Would you like to use permissions?', //Would you like to use permissions
            choices: [{
                value: 'bookmarks',
                name: 'Bookmarks',
                checked: false
            }, {
                value: 'history',
                name: 'History',
                checked: false
            }, {
                value: 'management',
                name: 'Management',
                checked: false
            }, {
                value: 'idle',
                name: 'Idle',
                checked: false
            }, {
                value: 'sidebarAction',
                name: 'SidebarAction',
                checked: false
            }, {
                value: 'webNavigation',
                name: 'WebNavigation',
                checked: false
            }, {
                value: 'alarms',
                name: 'Alarms',
                checked: false
            }, {
                value: 'topSites',
                name: 'TopSites',
                checked: false
            }, {
                value: 'notifications',
                name: 'Notifications',
                checked: false
            }, {
                value: 'storage',
                name: 'Storage',
                checked: false
            }, {
                value: 'blueTip',
                name: 'BlueTip',
                checked: false
            }, {
                value: 'eWall',
                name: 'EWall',
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

            this.manifest.permissions.bookmarks = isChecked(answers.permissions, 'bookmarks');
            this.manifest.permissions.history = isChecked(answers.permissions, 'history');
            this.manifest.permissions.management = isChecked(answers.permissions, 'management');
            this.manifest.permissions.idle = isChecked(answers.permissions, 'idle');
            this.manifest.permissions.sidebarAction = isChecked(answers.permissions, 'sidebarAction');
            this.manifest.permissions.webNavigation = isChecked(answers.permissions, 'webNavigation');
            this.manifest.permissions.alarms = isChecked(answers.permissions, 'alarms');
            this.manifest.permissions.topSites = isChecked(answers.permissions, 'topSites');
            this.manifest.permissions.notifications = isChecked(answers.permissions, 'notifications');
            this.manifest.permissions.storage = isChecked(answers.permissions, 'storage');
            this.manifest.permissions.blueTip = isChecked(answers.permissions, 'blueTip');
            this.manifest.permissions.eWall = isChecked(answers.permissions, 'eWall');
            done();
        }.bind(this));
    },
    writing: {
        app: function() {
            this.dest.mkdir('app');
            this.src.copy('_package.json', 'package.json');
            this.src.copy('_bower.json', 'bower.json');
            this.src.copy('README.md', 'README.md');
        },
        projectfiles: function() {
            this.src.copy('editorconfig', '.editorconfig');
            this.src.copy('jshintrc', '.jshintrc');
        },
        gulp: function() {
            this.template('gulpfile.js');
        },
        manifest: function() {
            var manifest = {};
            var permissions = [];
            var items = [];
            var bg = {
                page: 'background.html'
            };

            function stringify(value) {
                return JSON.stringify(value, null, 2).replace(/\n/g, '\n  ');
            }
            if (this.manifest.name) {
                manifest['id'] = stringify('com.sogou.' + this.manifest.name);
                manifest['name'] = stringify(this.manifest.name);
            }
            if (this.manifest.description) {
                manifest['description'] = stringify(this.manifest.description);
            }
            if (this.manifest.author) {
                manifest['author'] = stringify(this.manifest.author);
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
                manifest[title] = stringify(action);
            }
            manifest['background'] = stringify(bg);
            // add options page field.
            if (this.manifest.options) {
                manifest.options_page = '"options.html"';
            }
            // add omnibox keyword field.
            if (this.manifest.omnibox) {
                manifest.omnibox = stringify({
                    keyword: this.manifest.name
                });
            }
            // add contentscript field.
            if (this.manifest.contentscript) {
                var contentscript = [{
                    matches: ['http://*/*', 'https://*/*'],
                    js: ['scripts/contentscript.js'],
                    run_at: 'document_end',
                    all_frames: false
                }];
                manifest.content_scripts = stringify(contentscript);
            }
            // add generate permission field.
            for (var p in this.manifest.permissions) {
                if (this.manifest.permissions[p]) {
                    permissions.push(p);
                }
            }
            if (permissions.length > 0) {
                manifest.permissions = stringify(permissions);
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
            this.src.copy('images/default.ico', 'app/default.ico');
            this.src.copy('images/default-big.png', 'app/default-big.png');
        }
    },
    end: function() {
        this.installDependencies();
    }
});
module.exports = SogouGenerator;