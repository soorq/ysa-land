import page from "page";
import introController from "controllers/intro";
import articleController from "controllers/article";
import registerController from "controllers/register";
import contactsController from "controllers/contacts";
import priceController from "controllers/price";

var app = {};

app.controllers = {
    introController: introController,
    articleController: articleController,
    registerController: registerController,
    contactsController: contactsController,
    priceController: priceController,
};

app.init = function () {
    this.getComponents();
    page.init();

    // Get page data
    this.mobile = this.html.hasClass("mobile") || this.html.hasClass("tablet");

    // Loader promises
    var wndload = $.Deferred();
    $(app.window).on("load", function () {
        wndload.resolve();
    });
    this.loaders = [wndload.promise()];

    // Firstfire controller
    var ctrl = this.view.data("controller");
    if (ctrl && app.controllers[ctrl]) {
        var controller = app.controllers[ctrl];
        var deff = controller.init.call(app, this.view);

        // Add loader
        if (deff) {
            this.loaders.push(deff);
        }
    }

    // Loader wait
    $.when.apply($, this.loaders).done(function () {
        app.loader.removeClass("-visible");

        // Enter animation
        if (ctrl && controller && controller.enter) {
            setTimeout(() => {
                controller.enter.call(app, app.view);
            }, 200);
        }
    });
};

app.getComponents = function () {
    this.window = window;
    this.html = $("html");
    this.body = $("body");
    this.loader = $(".ysa-loader_overlay:first");
    this.navbar = $(".ysa-navbar:first");
    this.view = $("#wrap-main:first");
};

app.updateTitle = function (title) {
    if (title) document.title = title;
};

app.updateContent = function (obj) {
    this.view.replaceWith(obj);
    this.getComponents();
};

app.updateNavbar = function (obj) {
    if (!this.navbar.get(0) || !obj) {
        return false;
    }

    this.navbar.replaceWith(obj);
    this.getComponents();
};

app.goTo = function (url) {
    app.window.history.pushState({}, "", url);
    app.loader.addClass("-visible");

    // Trigger leave
    var currentController = app.view.data("controller");
    if (
        currentController &&
        app.controllers[currentController] &&
        app.controllers[currentController].leave
    ) {
        app.controllers[currentController].leave.call(app);
    }

    setTimeout(function () {
        $.get(url, {}, function (data) {
            var html = $("<div>").html(data);
            var title = $(data).filter("title").text();
            var navbar = html.find(".ysa-navbar:first");
            var content = html.find("#wrap-main:first");
            var ctrl = content.data("controller");
            var loaders = [];

            app.updateNavbar(navbar);
            app.updateContent(content);
            app.updateTitle(title);

            // Refresh page
            app.body.scrollTop(0);
            app.body.find(".ysa-modal").modal("hide");
            page.refresh();

            // Handle controller
            if (ctrl && app.controllers[ctrl]) {
                var controller = app.controllers[ctrl];
                var deff = controller.init.call(app, app.view);

                if (deff) {
                    loaders.push(deff);
                }
            }

            $.when.apply($, loaders).done(function () {
                app.loader.removeClass("-visible");

                // Enter animation
                if (ctrl && controller && controller.enter) {
                    setTimeout(() => {
                        controller.enter.call(app, app.view);
                    }, 300);
                }
            });
        });
    }, 2000);
};

app.handleNavigation = function () {
    var checkDomain = function (url) {
        if (url.indexOf("//") === 0) {
            url = window.location.protocol + url;
        }
        return url
            .toLowerCase()
            .replace(/([a-z])?:\/\//, "$1")
            .split("/")[0];
    };

    var isExternal = function (url) {
        return (
            (url.indexOf(":") > -1 || url.indexOf("//") > -1) &&
            checkDomain(location.href) !== checkDomain(url)
        );
    };

    $("body").on("click", "a", function (e) {
        var self = $(this);
        var href = self.attr("href");

        if (
            href &&
            typeof href === "string" &&
            !isExternal(href) &&
            !href.match(/\.(.*)$/)
        ) {
            e.preventDefault();
            app.goTo(href);
            setTimeout(() => {
                $("html").animate(
                    {
                        scrollTop: 0,
                    },
                    0
                );
            }, 600);
        }
    });
};

app.handleHistory = function () {
    window.addEventListener("popstate", function (event) {
        var url = document.location;
        app.goTo(url);
    });
};

app.handleModals = function () {
    this.body.find(".ysa-modal").each(function () {
        var self = $(this);
        var ctrl = self.data("controller");

        if (ctrl && app.controllers[ctrl]) {
            var controller = app.controllers[ctrl];

            if (controller.init) {
                controller.init.call(app, self);
            }
        }
    });

    this.body.on("show.bs.modal", ".ysa-modal", function (e) {
        var self = $(this);
        var ctrl = self.data("controller");

        if (ctrl && app.controllers[ctrl]) {
            var controller = app.controllers[ctrl];

            if (controller.enter) {
                controller.enter.call(app, self);
            }
        }
    });

    this.body.on("hide.bs.modal", ".ysa-modal", function (e) {
        var self = $(this);
        var ctrl = self.data("controller");

        if (ctrl && app.controllers[ctrl]) {
            var controller = app.controllers[ctrl];

            if (controller.leave) {
                controller.leave.call(app, self);
            }
        }
    });
};

app.init();
app.handleHistory();
app.handleNavigation();
app.handleModals();
