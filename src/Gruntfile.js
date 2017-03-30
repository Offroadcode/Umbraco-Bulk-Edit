module.exports = function(grunt) {
    require("load-grunt-tasks")(grunt);
    var path = require("path");

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        pkgMeta: grunt.file.readJSON("config/meta.json"),
        dest: grunt.option("target") || "dist",
        basePath: path.join(
            "<%= dest %>",
            "App_Plugins",
            "<%= pkgMeta.name %>"
        ),

        watch: {
            options: {
                spawn: false,
                atBegin: true
            },
            dll: {
                files: ["BulkEdit/Umbraco/UmbracoBulkEdit/**/*.cs"],
                tasks: ["msbuild:dist", "copy:dll"]
            },
            js: {
                files: ["BulkEdit/**/*.js"],
                tasks: ["concat:dist"]
            },
            html: {
                files: ["BulkEdit/**/*.html"],
                tasks: ["copy:html"]
            },
            lang: {
                files: ["BulkEdit/lang/*.xml"],
                tasks: ["copy:lang"]
            },
            sass: {
                files: ["BulkEdit/**/*.scss"],
                tasks: ["sass", "copy:css"]
            },
            css: {
                files: ["BulkEdit/**/*.css"],
                tasks: ["copy:css"]
            },
            manifest: {
                files: ["BulkEdit/package.manifest"],
                tasks: ["copy:manifest"]
            }
        },

        concat: {
            options: {
                stripBanners: false
            },
            dist: {
                src: [
                    "BulkEdit/bulkEdit.namespaces.js",
                    "BulkEdit/bulkEdit.api.js",
                    "BulkEdit/controllers/bulkEdit.dashboard.controller.js"
                ],
                dest: "<%= basePath %>/js/BulkEdit.js"
            }
        },

        copy: {
            dll: {
                cwd: "BulkEdit/Umbraco/UmbracoBulkEdit/bin/debug/",
                src: ["UmbracoBulkEdit.dll"],
                dest: "<%= dest %>/bin/",
                expand: true
            },
            html: {
                cwd: "BulkEdit/views/",
                src: ["*.html"],
                dest: "<%= basePath %>/views/",
                expand: true,
                rename: function(dest, src) {
                    return dest + src;
                }
            },
            lang: {
                cwd: "BulkEdit/lang",
                src: ["en.xml", "en-US.xml"],
                dest: "<%= basePath %>/lang/",
                expand: true,
                rename: function(dest, src) {
                    return dest + src;
                }
            },
            treeHtml: {
                cwd: "BulkEdit/views/backoffice/bulkEditTree/",
                src: ["edit.html"],
                dest: "<%= basePath %>/backoffice/bulkEditTree/",
                expand: true,
                rename: function(dest, src) {
                    return dest + src;
                }
            },
            css: {
                cwd: "BulkEdit/css/",
                src: ["BulkEdit.css"],
                dest: "<%= basePath %>/css/",
                expand: true,
                rename: function(dest, src) {
                    return dest + src;
                }
            },
            manifest: {
                cwd: "BulkEdit/",
                src: ["package.manifest"],
                dest: "<%= basePath %>/",
                expand: true,
                rename: function(dest, src) {
                    return dest + src;
                }
            },
            umbraco: {
                cwd: "<%= dest %>",
                src: "**/*",
                dest: "tmp/umbraco",
                expand: true
            }
        },

        umbracoPackage: {
            options: {
                name: "<%= pkgMeta.name %>",
                version: "<%= pkgMeta.version %>",
                url: "<%= pkgMeta.url %>",
                license: "<%= pkgMeta.license %>",
                licenseUrl: "<%= pkgMeta.licenseUrl %>",
                author: "<%= pkgMeta.author %>",
                authorUrl: "<%= pkgMeta.authorUrl %>",
                manifest: "config/package.xml",
                readme: "config/readme.txt",
                sourceDir: "tmp/umbraco",
                outputDir: "pkg"
            }
        },

        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            src: {
                src: ["app/**/*.js", "lib/**/*.js"]
            }
        },

        sass: {
            dist: {
                options: {
                    style: "compressed"
                },
                files: {
                    "BulkEdit/css/BulkEdit.css": "BulkEdit/sass/BulkEdit.scss"
                }
            }
        },

        clean: {
            build: '<%= grunt.config("basePath").substring(0, 4) == "dist" ? "dist/**/*" : "null" %>',
            tmp: ["tmp"]
        },

        msbuild: {
            options: {
                stdout: true,
                verbosity: "quiet",
                maxCpuCount: 4,
                version: 4.0,
                buildParameters: {
                    WarningLevel: 2,
                    NoWarn: 1607
                }
            },
            dist: {
                src: ["BulkEdit/Umbraco/UmbracoBulkEdit/UmbracoBulkEdit.csproj"],
                options: {
                    projectConfiguration: "Debug",
                    targets: ["Clean", "Rebuild"]
                }
            }
        }
    });

    grunt.registerTask("default", [
        "concat",
        "sass:dist",
        "copy:html",
        "copy:lang",
        "copy:treeHtml",
        "copy:manifest",
        "copy:css",
        "msbuild:dist",
        "copy:dll"
    ]);

    grunt.registerTask("umbraco", [
        "clean:tmp",
        "default",
        "copy:umbraco",
        "umbracoPackage",
        "clean:tmp"
    ]);
};
