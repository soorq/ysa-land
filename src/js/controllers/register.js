import transitions from "transitions";

var registerController = {
    init: function (view) {
        var deffer = $.Deferred();

        // Form Sending
        $(view)
            .find(".ysa-form")
            .on("submit", function (e) {
                var self = $(this);

                self.find("button[type=submit]").attr("disabled", "disabled");

                var req = $.ajax({
                    type: self.attr("method") || "POST",
                    url: self.attr("action"),
                    data: self.serialize(),
                });

                req.always(function () {
                    self.find("button[type=submit]").removeAttr("disabled");
                    $(view).find("#regbox-reg").hide();
                });

                req.done(function () {
                    self.trigger("reset");
                    $(view).find("#regbox-success").fadeIn();
                });

                req.fail(function () {
                    $(view).find("#regbox-error").fadeIn();
                });

                e.preventDefault();
            });

        // Close message
        $(view)
            .find("#regbox-success button")
            .on("click", function () {
                $(view).find("#regbox-reg").fadeIn();
                $(view).find("#regbox-error").hide();
            });

        $(view)
            .find("#regbox-error button")
            .on("click", function () {
                $(view).find("#regbox-reg").fadeIn();
                $(view).find("#regbox-error").hide();
            });

        deffer.resolve();
        return deffer;
    },
    enter: function (view) {
        var deffer = $.Deferred();
        var tl = transitions.register.enter(view);

        // Reset
        $(view).find("#regbox-reg").show();
        $(view).find("#regbox-success,#regbox-error").hide();

        tl.eventCallback("onComplete", function () {
            deffer.resolve();
        });

        tl.play();

        return deffer.promise();
    },
};

module.exports = registerController;
