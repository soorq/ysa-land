import Slider from "slider";
import Particles from "particles";
import transitions from "transitions";

var particles = null;

var introController = {
    init: function (view) {
        var deffer = $.Deferred();
        var sliderLastNum = this.sliderLastNum;

        if (this.mobile) {
            $(".ysa-slider-item").css({
                position: "relative",
                display: "block",
            });
            deffer.resolve();
        }

        if (!this.mobile) {
            // Particles
            particles = new Particles($(".ysa-slider-bg").get(0), function () {
                deffer.resolve();

                if (sliderLastNum) {
                    particles.goTo(sliderLastNum);
                }

                $(window).on("resize", function () {
                    if (particles) {
                        particles.renderer.setSize(
                            particles.parent.offsetWidth,
                            particles.parent.offsetHeight
                        );
                        particles.orbit = new Orbit(
                            new THREE.PerspectiveCamera(
                                60,
                                particles.parent.offsetWidth /
                                    particles.parent.offsetHeight,
                                1,
                                100000
                            )
                        );
                        particles.orbit.translation.z = 200;
                        particles.orbit.rotation.setDependency = setDependency;
                        particles.orbit.rotation.setDependency(["x", "y"]);
                    }
                });

                $(view).on("mousemove", function (e) {
                    if (particles) {
                        particles.orbit.rotation.setProcess(
                            "y",
                            function (time) {
                                return bezierCubicCurve(time, 0.25, 1, 1, 1);
                            },
                            (e.clientX / window.innerWidth - 0.5) *
                                Math.PI *
                                0.15,
                            1000
                        );
                        particles.orbit.rotation.setProcess(
                            "x",
                            function (time) {
                                return bezierCubicCurve(time, 0.25, 1, 1, 1);
                            },
                            (e.clientY / window.innerHeight - 0.5) *
                                Math.PI *
                                0.05,
                            1000
                        );

                        if (e.clientX > particles.parent.offsetLeft) {
                            var x =
                                (e.clientX - particles.parent.offsetLeft) /
                                particles.parent.offsetWidth;
                            var y =
                                1 - e.clientY / particles.parent.offsetHeight;

                            particles.mouseMove = vec2(x, y);
                            particles.dataMaterial_1.uniforms.mouse.value =
                                particles.mouseMove;
                        }
                    }
                });
            });

            // Slider
            var slider = new Slider({
                selector: ".ysa-slider",
                itemsSelector: ".ysa-slider-item",
                loop: true,
            });

            slider.on("init", function (e) {
                var self = this;

                // Get childs
                this.nav = this.container.find(".ysa-slider-nav");
                this.navItems = this.container.find(".ysa-slider-nav-item");

                // Slider Control Navigation
                this.navItems.on("click", function (event) {
                    event.preventDefault();
                    var index = $(this).index();
                    self.goTo(index);
                });
            });

            slider.on("slide", function (e) {
                var index = e.currentIndex;
                var num = index + 1;
                var firstFire = typeof e.prevIndex !== "number";
                var onComplete = () => {
                    this.container.addClass("-finished");
                    this.setBlock(false);
                };

                this.setBlock(true);
                this.navItems
                    .removeClass("-active")
                    .eq(index)
                    .addClass("-active");
                this.container.removeClass("-finished");

                $(".ysa-regbox-form input[name=role]")
                    .eq(index)
                    .prop("checked", true)
                    .change();

                // Transitions
                if (!firstFire) {
                    // Particles
                    if (particles && particles.goTo) {
                        particles.goTo(index);
                    }

                    if (e.currentIndex > e.prevIndex) {
                        // Next
                        var tl = transitions.intro.slider.change(
                            e.prevItem,
                            e.currentItem
                        );
                        tl.play();
                    } else {
                        // Prev
                        var tl = transitions.intro.slider.change(
                            e.currentItem,
                            e.prevItem
                        );
                        tl.reverse(0);
                    }
                }

                if (tl) {
                    tl.eventCallback("onComplete", onComplete);
                    tl.eventCallback("onReverseComplete", onComplete);
                } else {
                    onComplete();
                }
            });

            slider.init();
            slider.goTo(sliderLastNum || 0);

            transitions.intro.enter(this.view);
        }

        return deffer.promise();
    },
    enter: function () {
        var deffer = $.Deferred();
        var tl = transitions.intro.enter(this.view);

        tl.eventCallback("onComplete", function () {
            deffer.resolve();
        });

        tl.play();

        return deffer.promise();
    },
    leave: function () {
        var deffer = $.Deferred();

        if (particles) {
            particles.destroy();
        }

        deffer.resolve();
        return deffer.promise();
    },
};

module.exports = introController;
