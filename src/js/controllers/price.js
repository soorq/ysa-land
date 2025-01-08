import transitions from "transitions";

const priceController = {
    init: function () {
        const deffer = $.Deferred();
        const navbar = $(".ysa-navbar");
        const priceItem = navbar.find(".ysa-navbar-nav-item.-price");

        priceItem.addClass("-invisible");

        deffer.resolve();
        return deffer;
    },
};

module.exports = priceController;
