const contactsController = {
    init: function () {
        var deffer = $.Deferred();
        const windowWidth = $(window).width();
        const navbar = $(".ysa-navbar");
        const contactsItem = navbar.find(".ysa-navbar-nav-item.-contacts");

        contactsItem.addClass("-invisible");

        function initMap() {
            let map;
            let uluru = { lat: 59.98419663836166, lng: 30.231772830688453 };
            map = new google.maps.Map(document.getElementById("map"), {
                zoom: 13,
                center: uluru,
                mapTypeControl: false,
                scrollwheel: false,
                fullscreenControl: false,
                streetViewControl: false,
                styles: [
                    {
                        elementType: "geometry",
                        stylers: [
                            {
                                color: "#212121",
                            },
                        ],
                    },
                    {
                        elementType: "labels.icon",
                        stylers: [
                            {
                                visibility: "off",
                            },
                        ],
                    },
                    {
                        elementType: "labels.text.fill",
                        stylers: [
                            {
                                color: "#757575",
                            },
                        ],
                    },
                    {
                        elementType: "labels.text.stroke",
                        stylers: [
                            {
                                color: "#212121",
                            },
                        ],
                    },
                    {
                        featureType: "administrative",
                        elementType: "geometry",
                        stylers: [
                            {
                                color: "#757575",
                            },
                        ],
                    },
                    {
                        featureType: "administrative",
                        elementType: "labels",
                        stylers: [
                            {
                                color: "#000000",
                            },
                        ],
                    },
                    {
                        featureType: "administrative.country",
                        elementType: "labels.text.fill",
                        stylers: [
                            {
                                color: "#9e9e9e",
                            },
                        ],
                    },
                    {
                        featureType: "administrative.land_parcel",
                        stylers: [
                            {
                                visibility: "off",
                            },
                        ],
                    },
                    {
                        featureType: "administrative.locality",
                        elementType: "labels.text.fill",
                        stylers: [
                            {
                                color: "#bdbdbd",
                            },
                        ],
                    },
                    {
                        featureType: "administrative.neighborhood",
                        stylers: [
                            {
                                visibility: "off",
                            },
                        ],
                    },
                    {
                        featureType: "poi",
                        elementType: "labels.text.fill",
                        stylers: [
                            {
                                color: "#757575",
                            },
                        ],
                    },
                    {
                        featureType: "poi.park",
                        elementType: "geometry",
                        stylers: [
                            {
                                color: "#181818",
                            },
                        ],
                    },
                    {
                        featureType: "poi.park",
                        elementType: "labels.text.fill",
                        stylers: [
                            {
                                color: "#616161",
                            },
                        ],
                    },
                    {
                        featureType: "poi.park",
                        elementType: "labels.text.stroke",
                        stylers: [
                            {
                                color: "#1b1b1b",
                            },
                        ],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry.fill",
                        stylers: [
                            {
                                color: "#2c2c2c",
                            },
                        ],
                    },
                    {
                        featureType: "road",
                        elementType: "labels",
                        stylers: [
                            {
                                visibility: "off",
                            },
                        ],
                    },
                    {
                        featureType: "road",
                        elementType: "labels.text.fill",
                        stylers: [
                            {
                                color: "#8a8a8a",
                            },
                        ],
                    },
                    {
                        featureType: "road.arterial",
                        elementType: "geometry",
                        stylers: [
                            {
                                color: "#373737",
                            },
                        ],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "geometry",
                        stylers: [
                            {
                                color: "#3c3c3c",
                            },
                        ],
                    },
                    {
                        featureType: "road.highway.controlled_access",
                        elementType: "geometry",
                        stylers: [
                            {
                                color: "#4e4e4e",
                            },
                        ],
                    },
                    {
                        featureType: "road.local",
                        elementType: "labels.text.fill",
                        stylers: [
                            {
                                color: "#616161",
                            },
                        ],
                    },
                    {
                        featureType: "transit",
                        elementType: "labels.text.fill",
                        stylers: [
                            {
                                color: "#757575",
                            },
                        ],
                    },
                    {
                        featureType: "water",
                        elementType: "geometry",
                        stylers: [
                            {
                                color: "#000000",
                            },
                        ],
                    },
                    {
                        featureType: "water",
                        elementType: "labels.text",
                        stylers: [
                            {
                                visibility: "off",
                            },
                        ],
                    },
                    {
                        featureType: "water",
                        elementType: "labels.text.fill",
                        stylers: [
                            {
                                color: "#3d3d3d",
                            },
                        ],
                    },
                ],
            });

            let icon = {
                url: "../assets/img/marker.svg",
                origin: new google.maps.Point(0, 0),
                anchor:
                    windowWidth > 1200
                        ? new google.maps.Point(31, 31)
                        : new google.maps.Point(20, 20),
                scaledSize:
                    windowWidth > 1200
                        ? new google.maps.Size(63, 63)
                        : new google.maps.Size(40, 40),
            };

            let marker = new google.maps.Marker({
                position: uluru,
                icon: icon,
                optimized: false,
                map: map,
            });
        }

        initMap();

        deffer.resolve();
        return deffer;
    },
};

module.exports = contactsController;
