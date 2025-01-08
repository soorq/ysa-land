import config from "./config";

const page = {
    init: function () {
        // svg4everybody | Init
        svg4everybody();

        // FastClick | Init
        FastClick.attach(document.body);

        // AOS | Init
        AOS.init({
            duration: 800,
            delay: 100,
        });

        // Loader | Click coordinates
        $(window).on("click", function (e) {
            $(".ysa-loader_overlay-bg").css({
                left: e.clientX,
                top: e.clientY,
            });
        });

        this.refresh();
    },
    refresh: function () {
        // AOS | Reinit
        setTimeout(function () {
            AOS.refreshHard();
        }, 300);

        // Buttons | Hover
        $(".ysa-btn_open").hover(
            function () {
                var self = $(this);
                var shape = self.find(".ysa-btn_open-shape svg path");
                TweenLite.to(shape, 0.3, {
                    morphSVG:
                        "M138.5,72.5 C138.5,103.1518036156205,113.6518036156205,128,83,128,52.348196384379506,128,27.5,103.1518036156205,27.5,72.5,27.5,41.848196384379506,52.348196384379506,17,83,17,113.6518036156205,17,138.5,41.848196384379506,138.5,72.5z",
                });
            },
            function () {
                var self = $(this);
                var shape = self.find(".ysa-btn_open-shape svg path");
                TweenLite.to(shape, 0.3, {
                    morphSVG:
                        "M41,72.5 L41,0.3,103.5,36.4,166,72.5,103.5,108.6,41,144.7,41,72.5z",
                });
            }
        );

        $(".ysa-btn_back").hover(
            function () {
                var self = $(this);
                var shape = self.find(".ysa-btn_back-shape svg path");
                TweenLite.to(shape, 0.2, {
                    morphSVG:
                        "M37.5,19 C37.5,27.836555997296,30.336555997296,35,21.5,35,12.663444002704,35,5.5,27.836555997296,5.5,19,5.5,10.163444002704,12.663444002704,3,21.5,3,30.336555997296,3,37.5,10.163444002704,37.5,19z",
                });
            },
            function () {
                var self = $(this);
                var shape = self.find(".ysa-btn_back-shape svg path");
                TweenLite.to(shape, 0.2, {
                    morphSVG:
                        "M32.9,19 L32.9,0.1,16.5,9.5,0.1,19,16.5,28.5,32.9,37.9,32.9,19z",
                });
            }
        );

        // Dropdown Select | Init
        $(".ysa-dropdown_select")
            .not(".-inited")
            .each(function () {
                var container = $(this);
                var toggle = container.find(".ysa-dropdown_select-toggle");
                var toggleText = toggle.find(
                    ".ysa-dropdown_select-toggle-text"
                );
                var input = container.find(".ysa-dropdown_select-menu input");

                container.addClass("-inited");

                toggle.on("click", function () {
                    container.toggleClass("-open");
                });

                input
                    .change(function () {
                        container.removeClass("-open");
                        toggleText.text(this.value);

                        return false;
                    })
                    .filter(":checked")
                    .change();

                container.attr("tabindex", 0).on("blur", function () {
                    $(".ysa-dropdown_select").removeClass("-open");
                });
            });

        // Dropdown Main | Init
        $(".ysa-dropdown_main")
            .not(".-inited")
            .each(function () {
                var container = $(this);
                var toggle = container.find(".ysa-dropdown_main-toggle");
                var toggleText = toggle.find(".ysa-dropdown_main-toggle-text");
                var item = container.find(".ysa-dropdown_main-menu-item");

                container.addClass("-inited");

                toggle.on("click", function () {
                    container.toggleClass("-open");
                });

                item.on("click", function () {
                    const valueItem = $(this).text();

                    item.removeClass("-active");
                    $(this).addClass("-active");
                    container.removeClass("-open");
                    toggleText.text(valueItem);
                })
                    .filter(":checked")
                    .change();

                $(document).on("click", function (e) {
                    const container = $(".ysa-dropdown_main");
                    if (
                        !container.is(e.target) &&
                        container.has(e.target).length === 0
                    ) {
                        container.removeClass("-open");
                    }
                });
            });

        // When page loads...
        $(".ysa-price").each(function () {
            $(this).find(".ysa-price-body-item").hide();
            $(this)
                .find(".ysa-price-topbar-nav-item:first")
                .addClass("-active")
                .show();
            $(this).find(".ysa-price-body-item:first").show();
        });

        // Dropdown Nav | Init
        $(".ysa-dropdown_nav")
            .not(".-inited")
            .each(function () {
                const container = $(this);
                const toggle = container.find(".ysa-dropdown_nav-toggle");
                const toggleText = toggle.find(".ysa-dropdown_nav-toggle-text");
                const items = container.find(".ysa-dropdown_nav-menu-item");

                container
                    .addClass("-inited")
                    .on("update", () => {
                        const selected = items.filter(".-active");
                        toggleText.text(selected.text());
                    })
                    .attr("tabindex", "-1")
                    .on("blur", () => container.removeClass("-open"))
                    .focus();

                toggle.on("click", () => {
                    container.toggleClass("-open");
                });

                items.on("click", () => container.removeClass("-open"));
            });

        // Tabs
        $("[data-tab-toggle]").on("click", function () {
            const self = $(this);
            const name = self.data("tab-toggle");

            $("[data-tab-name]").fadeOut(300);
            $(`[data-tab-name=${name}]`).delay(300).fadeIn(700);
            $("[data-tab-toggle]").removeClass("-active");
            $(`[data-tab-toggle=${name}]`).addClass("-active");

            $(".ysa-dropdown_nav").trigger("update");
        });

        // Checkbox change price
        $("[data-radio-toggle]").on("click", function () {
            const self = $(this);
            const name = self.data("radio-toggle");

            $("[data-radio-name]").hide();
            $(`[data-radio-name=${name}]`).show();
            $("[data-radio-toggle]").removeClass("-active");
            $(`[data-radio-toggle=${name}]`).addClass("-active");
        });

        // Send form
        $(".ysa-price-tariff-form").each(function () {
            const self = $(this);
            const form = self.find("form");
            const formInput = form.find("input");
            const formBox = self.find(".ysa-price-tariff-form-box");
            const formMessage = self.find(".ysa-price-tariff-form-message");

            form.on("submit", function (e) {
                const formData = form.serializeArray();

                const formObject = {};
                formData.forEach((field) => {
                    formObject[field.name] = field.value;
                });
                formObject.site = window.location.host;

                const priceSend = $.ajax({
                    method: "POST",
                    url: config.priceAction,
                    data: JSON.stringify(formObject),
                    headers: {
                        "content-type": "application/json",
                    },
                });

                priceSend.done(function () {
                    formInput.val("");
                    formBox.removeClass("-visible");
                    formMessage.addClass("-visible");
                });

                priceSend.fail(function () {
                    console.log("Error!");
                });

                e.preventDefault();
            });
        });
    },
};

module.exports = page;
