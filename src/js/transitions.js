var screen = function (key) {
    var sizes = {
        xs: 375,
        sm: 768,
        md: 1024,
        lg: 1270,
        xl: 1600,
    };

    var w = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
    );
    var size = sizes[key] ? sizes[key] : 0;

    return size <= w;
};

var lang = function (key) {
    return document.documentElement.lang == key;
};

var transitions = {
    intro: {
        enter: function (tween) {
            var tl = new TimelineLite({ paused: true });
            var p = tween;
            var slide = p.find(".ysa-slider-item.-in");

            tl.staggerFromTo(
                slide.find(
                    ".ysa-intro-header h4, .ysa-intro-header h2, .ysa-intro-description"
                ),
                0.5,
                {
                    x: -300,
                    opacity: 0,
                },
                {
                    x: 0,
                    opacity: 1,
                    ease: Power2.easeInOut,
                    clearProps: "x,opacity",
                },
                0.1,
                "primary"
            );

            tl.staggerFromTo(
                slide.find(".ysa-intro-num"),
                0.5,
                {
                    y: 150,
                    opacity: 0,
                },
                {
                    y: 0,
                    opacity: 1,
                    ease: Power2.easeInOut,
                    clearProps: "y,opacity",
                },
                0.1,
                "primary+1"
            );

            tl.staggerFromTo(
                p.find(".ysa-slider-nav-item"),
                0.5,
                {
                    x: -300,
                    opacity: 0,
                },
                {
                    x: 0,
                    opacity: 1,
                    ease: Power2.easeInOut,
                    clearProps: "x,opacity",
                },
                0.1,
                "primary"
            );

            tl.staggerFromTo(
                slide.find(".ysa-intro-open"),
                0.5,
                {
                    opacity: 0,
                },
                {
                    opacity: 1,
                    ease: Power2.easeInOut,
                    clearProps: "opacity",
                },
                0.1,
                "primary+1"
            );

            return tl;
        },
        slider: {
            change: function (tween1, tween2) {
                var tl = new TimelineLite({ paused: true });
                var p1 = tween1;
                var p2 = tween2;

                tl.add(function () {
                    if (!tl.reversed()) {
                        p1.find(".ysa-intro-header h4, .ysa-intro-open").css({
                            opacity: 0,
                        });
                        p2.find(".ysa-intro-header h4, .ysa-intro-open").css({
                            opacity: 1,
                        });
                    }
                });

                tl.fromTo(
                    p1.find(".ysa-intro-header h2"),
                    0.5,
                    {
                        x: 0,
                        opacity: 1,
                    },
                    {
                        x: 300,
                        opacity: 0,
                        ease: Power2.easeInOut,
                    },
                    "prev"
                );

                tl.fromTo(
                    p1.find(".ysa-intro-description"),
                    0.5,
                    {
                        x: 0,
                        opacity: 1,
                    },
                    {
                        x: 250,
                        opacity: 0,
                        ease: Power2.easeInOut,
                    },
                    "-=0.3"
                );

                tl.fromTo(
                    p1.find(".ysa-intro-num"),
                    0.3,
                    {
                        x: 0,
                        opacity: 1,
                    },
                    {
                        x: 50,
                        opacity: 0,
                        ease: Power2.easeInOut,
                    },
                    "-=0.3"
                );

                tl.fromTo(
                    p2.find(".ysa-intro-header h2"),
                    0.5,
                    {
                        x: -300,
                        opacity: 0,
                    },
                    {
                        x: 0,
                        opacity: 1,
                        ease: Power2.easeInOut,
                    },
                    0.1,
                    "-=0.6"
                );

                tl.fromTo(
                    p2.find(".ysa-intro-description"),
                    0.5,
                    {
                        x: -250,
                        opacity: 0,
                    },
                    {
                        x: 0,
                        opacity: 1,
                        ease: Power2.easeInOut,
                    },
                    "-=0.5"
                );

                tl.fromTo(
                    p2.find(".ysa-intro-num"),
                    0.4,
                    {
                        x: -200,
                        opacity: 0,
                    },
                    {
                        x: 0,
                        opacity: 1,
                        ease: Power2.easeOut,
                    },
                    "-=0.3"
                );

                tl.add(function () {
                    if (tl.reversed()) {
                        p1.find(".ysa-intro-header h4, .ysa-intro-open").css({
                            opacity: 1,
                        });
                        p2.find(".ysa-intro-header h4, .ysa-intro-open").css({
                            opacity: 0,
                        });
                    }
                });

                return tl;
            },
        },
    },
    register: {
        enter: function (tween) {
            var tl = new TimelineLite({ paused: true });
            var p = tween;

            tl.fromTo(
                p.find(".ysa-regbox-header"),
                0.7,
                {
                    x: -450,
                    opacity: 0,
                },
                {
                    x: 0,
                    opacity: 1,
                    ease: Power2.easeInOut,
                    clearProps: "x,opacity",
                }
            );

            tl.staggerFromTo(
                p.find(
                    ".ysa-form-group, .ysa-form-submit, .ysa-form-agreement"
                ),
                0.5,
                {
                    y: 100,
                    opacity: 0,
                },
                {
                    y: 0,
                    opacity: 1,
                    ease: Power2.easeInOut,
                    clearProps: "y,opacity",
                },
                0.1,
                "-=0.4"
            );

            return tl;
        },
    },
};

module.exports = transitions;
