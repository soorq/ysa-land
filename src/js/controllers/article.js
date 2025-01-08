import transitions from "transitions";

var articleController = {
    init: function () {
        var deffer = $.Deferred();

        // Get num
        var num = this.view.data("num") || 0;
        if (num) {
            this.sliderLastNum = num;
            $(".ysa-regbox-form input[name=role]")
                .eq(num)
                .prop("checked", true)
                .change();
        }

        deffer.resolve();
        return deffer;
    },
};

module.exports = articleController;
