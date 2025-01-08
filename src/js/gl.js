"use strict";

export var initGL = function () {
    window.J = {};

    J.rotate = function (n, a) {
        // rotation around arbitrary axis
        var m = new THREE.Matrix4();
        var sin = Math.sin(a);
        var cos = Math.cos(a);
        m.set(
            cos + n.x * n.x * (1 - cos),
            n.x * n.y * (1 - cos) - n.z * sin,
            n.x * n.z * (1 - cos) + n.y * sin,
            0,
            n.y * n.x * (1 - cos) + n.z * sin,
            cos + n.y * n.y * (1 - cos),
            n.y * n.z * (1 - cos) - n.x * sin,
            0,
            n.z * n.x * (1 - cos) - n.y * sin,
            n.z * n.y * (1 - cos) + n.x * sin,
            cos + n.z * n.z * (1 - cos),
            0,
            0,
            0,
            0,
            1
        );
        return m;
    };

    J.translate = function (n, s) {
        // translation along arbitrary axis
        var s_ = s || 1;
        var m = new THREE.Matrix4();
        m.set(
            1,
            0,
            0,
            n.x * s_,
            0,
            1,
            0,
            n.y * s_,
            0,
            0,
            1,
            n.z * s_,
            0,
            0,
            0,
            1
        );
        return m;
    };

    J.scale = function (n, s) {
        // scaling along arbitrary axis
        var s_ = s || 1;
        var m = new THREE.Matrix4();
        m.set(
            1 + (s - 1) * n.x * n.x,
            (s - 1) * n.x * n.y,
            (s - 1) * n.x * n.z,
            0,
            (s - 1) * n.y * n.x,
            1 + (s - 1) * n.y * n.y,
            (s - 1) * n.y * n.z,
            0,
            (s - 1) * n.z * n.x,
            (s - 1) * n.z * n.y,
            1 + (s - 1) * n.z * n.z,
            0,
            0,
            0,
            0,
            1
        );
        return m;
    };

    window.frameTime = [0];
    window.globalTime = [0];

    window.lastTime = 0;
    window.updates = [];

    window.linear = function (time) {
        return time;
    };
    window.bezierCubicCurve = function (time, x1, y1, x2, y2) {
        if (!time || time == 1) {
            return time;
        } else {
            // B(t) = (1-t)^3*p0 + 3*t*(1-t)^2*p1 + 3*t^2*(1-t)*p2 + t^3*p3
            // x(t) = (1-t)^3*x0 + 3*t*(1-t)^2*x1 + 3*t^2*(1-t)*x2 + t^3*x3
            // y(t) = (1-t)^3*y0 + 3*t*(1-t)^2*y1 + 3*t^2*(1-t)*y2 + t^3*y3
            // p0 = vec2(0,0), p3 = vec2(1,1)
            // x(t) = 3*t*(1-t)^2*x1 + 3*t^2*(1-t)*x2 + t^3
            var a = 3 * x1 - 3 * x2 + 1;
            var b = 3 * x2 - 6 * x1;
            var c = 3 * x1;
            var d = -time;
            // x(t) = a*t^3 + b*t^2 + c*t
            // x(t) = time => a*t^3 + b*t^2 + c*t - d = 0
            var A = b / a;
            var B = c / a;
            var C = d / a;
            var Q = (3 * B - A * A) / 9;
            var R = (9 * A * B - 27 * C - 2 * A * A * A) / 54;
            var D = Q * Q * Q + R * R; // discriminant
            var t;
            if (D >= 0) {
                var S =
                    Math.sign(R + Math.sqrt(D)) *
                    Math.pow(Math.abs(R + Math.sqrt(D)), 1 / 3);
                var T =
                    Math.sign(R - Math.sqrt(D)) *
                    Math.pow(Math.abs(R - Math.sqrt(D)), 1 / 3);
                t = -A / 3 + (S + T);
            } else {
                var th = Math.acos(R / Math.sqrt(-Math.pow(Q, 3)));
                var t1 = 2 * Math.sqrt(-Q) * Math.cos(th / 3) - A / 3;
                var t2 =
                    2 * Math.sqrt(-Q) * Math.cos(th / 3 + (2 * Math.PI) / 3) -
                    A / 3;
                var t3 =
                    2 * Math.sqrt(-Q) * Math.cos(th / 3 - (2 * Math.PI) / 3) -
                    A / 3;
                if (t1 >= 0 && t1 <= 1) t = t1;
                else if (t2 >= 0 && t2 <= 1) t = t2;
                else if (t3 >= 0 && t3 <= 1) t = t3;
            }
            var y;
            if (t == 0) y = 0;
            else if (t == 1) y = 1;
            else
                y =
                    3 * t * Math.pow(1 - t, 2) * y1 +
                    3 * t * t * (1 - t) * y2 +
                    t * t * t;
            return y;
        }
    };

    window.setDependency = function (properties) {
        var THIS = this;
        if (properties) {
            THIS.__processes__ = {};
            for (var i = 0; i < properties.length; i++) {
                THIS.__processes__[properties[i]] = {};
                let proc = THIS.__processes__[properties[i]];
                proc.clear = function () {
                    proc.property = null;
                    proc.is = false;
                    proc.currTime = null;
                    proc.endTime = null;
                    proc.startPropertyValue = null;
                    proc.currValue = null;
                    proc.endValue = null;
                    proc.func = null;
                };
                proc.clear();
                updates.push(function () {
                    if (proc.is) {
                        if (proc.currTime >= 0) {
                            if (proc.endTime - proc.currTime > 0) {
                                proc.currValue =
                                    proc.func(
                                        1 -
                                            (proc.endTime - proc.currTime) /
                                                proc.endTime
                                    ) * proc.endValue;
                                THIS[proc.property] =
                                    proc.startPropertyValue + proc.currValue;
                                proc.currTime += frameTime[0];
                            } else {
                                THIS[proc.property] =
                                    proc.startPropertyValue + proc.endValue;
                                proc.clear();
                            }
                        } else proc.currTime += frameTime[0];
                    }
                });
            }
            THIS.setProcess = function (property, func, value, time, delay) {
                var proc = THIS.__processes__[property];
                proc.property = property;
                proc.currTime = -delay || frameTime[0];
                proc.endTime = time;
                proc.startPropertyValue = THIS[property];
                proc.currValue = 0;
                proc.endValue = value - THIS[property];
                proc.func = func;
                proc.is = true;
                return THIS;
            };
        } else {
            THIS.__process__ = {};
            THIS.__process__.clear = function () {
                let p = THIS.__process__;
                p.is = false;
                p.currProc = false;
                p.currTime = false;
                p.endTime = false;
                p.startValue = false;
                p.currValue = false;
                p.endValue = false;
                p.func = false;
            };
            THIS.__process__.clear();
            updates.push(function () {
                let p = THIS.__process__;
                if (p.is) {
                    let i = p.currProc;
                    if (p.currTime[i] >= 0) {
                        if (p.endTime[i] - p.currTime[i] > 0) {
                            p.currValue[i] =
                                p.func[i](
                                    1 -
                                        (p.endTime[i] - p.currTime[i]) /
                                            p.endTime[i]
                                ) * p.endValue[i];
                            THIS.value = p.startValue[i] + p.currValue[i];
                            p.currTime[i] += frameTime[0];
                        } else {
                            THIS.value = p.startValue[i] + p.endValue[i];
                            if (i == p.currTime.length - 1) p.clear();
                            else p.currProc++;
                        }
                    } else p.currTime[i] += frameTime[0];
                }
            });
            THIS.setProcess = function (
                arr /*[ { func: func, value: value, time: time, delay: delay }, { ... } ]*/
            ) {
                let p = THIS.__process__;
                p.currProc = 0;
                p.currTime = [];
                p.endTime = [];
                p.startValue = [];
                p.currValue = [];
                p.endValue = [];
                p.func = [];
                for (var k = 0; k < arr.length; k++) {
                    let startValue = k
                        ? p.startValue[k - 1] + p.endValue[k - 1]
                        : THIS.value;
                    p.currTime[k] = -arr[k].delay || frameTime[0];
                    p.endTime[k] = arr[k].time;
                    p.startValue[k] = startValue;
                    p.currValue[k] = 0;
                    p.endValue[k] = arr[k].value - startValue;
                    p.func[k] = arr[k].func;
                }
                p.is = true;
                return THIS;
            };
        }
        return THIS;
    };
    window.vec2 = function (x, y) {
        return new THREE.Vector2(x || 0, y || 0);
    };
    window.vec3 = function (x, y, z) {
        return new THREE.Vector3(x || 0, y || 0, z || 0);
    };
    window.rotationAroundAxis = function (n, a) {
        // Returns Rotation ( Around Arbitrary Axis ) Matrix
        var m = new THREE.Matrix4();
        m.set(
            Math.cos(a) + n.x * n.x * (1 - Math.cos(a)),
            n.x * n.y * (1 - Math.cos(a)) - n.z * Math.sin(a),
            n.x * n.z * (1 - Math.cos(a)) + n.y * Math.sin(a),
            0,
            n.y * n.x * (1 - Math.cos(a)) + n.z * Math.sin(a),
            Math.cos(a) + n.y * n.y * (1 - Math.cos(a)),
            n.y * n.z * (1 - Math.cos(a)) - n.x * Math.sin(a),
            0,
            n.z * n.x * (1 - Math.cos(a)) - n.y * Math.sin(a),
            n.z * n.y * (1 - Math.cos(a)) + n.x * Math.sin(a),
            Math.cos(a) + n.z * n.z * (1 - Math.cos(a)),
            0,
            0,
            0,
            0,
            1
        );
        return m;
    };
    window.translationAlongAxis = function (n, s) {
        // Returns Translation ( Along Arbitrary Axis ) Matrix
        var s_ = s || 1;
        var m = new THREE.Matrix4();
        m.set(
            1,
            0,
            0,
            n.x * s_,
            0,
            1,
            0,
            n.y * s_,
            0,
            0,
            1,
            n.z * s_,
            0,
            0,
            0,
            1
        );
        return m;
    };

    window.parseCoords = function (type, data) {
        var _data = data.trim().split(/\s+/);
        var item = [];
        var items = [];
        for (var i = 0; i < _data.length; i++) {
            item.push(_data[i]);
            if (type == "uv" && item.length == 2) {
                items.push(vec2(parseFloat(item[0]), parseFloat(item[1])));
                item = [];
            } else if (
                (type == "vertex" || type == "normal") &&
                item.length == 3
            ) {
                items.push(
                    vec3(
                        parseFloat(item[0]),
                        parseFloat(item[1]),
                        parseFloat(item[2])
                    )
                );
                item = [];
            }
        }
        return items;
    };

    window.parseTriangleFacesModified = function (data, v, vOffset) {
        let triangles = data.getElementsByTagName("triangles"); // get <triangle> tag data
        let triangle = [];
        let sumS = 0;
        triangle.minS = 10e999999999;
        triangle.limit = 0;
        for (let k = 0; k < triangles.length; k++) {
            let offset = vOffset || 0;
            let p = triangles[k].getElementsByTagName("p")[0].innerHTML;
            if (triangles[k].getAttribute("count") != "0") {
                let _p = p.trim().split(/\s+/);
                for (var i = 0; i < _p.length; i += 3 + 3 * offset) {
                    let i0 = i + offset;
                    let i1 = i + 1 + offset * 2;
                    let i2 = i + 2 + offset * 3;

                    let a = vec3(
                        v[_p[i0]].x - v[_p[i1]].x,
                        v[_p[i0]].y - v[_p[i1]].y,
                        v[_p[i0]].z - v[_p[i1]].z
                    );
                    let b = vec3(
                        v[_p[i0]].x - v[_p[i2]].x,
                        v[_p[i0]].y - v[_p[i2]].y,
                        v[_p[i0]].z - v[_p[i2]].z
                    );
                    let c = vec3(
                        v[_p[i1]].x - v[_p[i2]].x,
                        v[_p[i1]].y - v[_p[i2]].y,
                        v[_p[i1]].z - v[_p[i2]].z
                    );

                    let abCross = vec3(
                        a.y * b.z - a.z * b.y,
                        a.z * b.x - a.x * b.z,
                        a.x * b.y - a.y * b.x
                    );
                    let abCrossLength = Math.sqrt(
                        abCross.x * abCross.x +
                            abCross.y * abCross.y +
                            abCross.z * abCross.z
                    );

                    // Определяем площадь каждого треугольника. Определяем минимальную и максимальную площади треугольников в модели.
                    let _a = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
                    let _b = Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z);
                    let _c = Math.sqrt(c.x * c.x + c.y * c.y + c.z * c.z);
                    let __p = (_a + _b + _c) * 0.5;
                    let _s = Math.sqrt(
                        __p * (__p - _a) * (__p - _b) * (__p - _c)
                    );
                    if (_s < triangle.minS) triangle.minS = _s;
                    sumS += _s;
                    //

                    triangle.push({
                        // triangle points indexes
  
                      a: _p[i0],
                        b: _p[i1],
                        c: _p[i2],

                        // triangle points
                        points: {
                            a: v[_p[i0]],
                            b: v[_p[i1]],
                            c: v[_p[i2]],
                        },

                        normal: vec3(
                            abCross.x / abCrossLength,
                            abCross.y / abCrossLength,
                            abCross.z / abCrossLength
                        ),
                        center: vec3(
                            (v[_p[i0]].x + v[_p[i1]].x + v[_p[i2]].x) / 3,
                            (v[_p[i0]].y + v[_p[i1]].y + v[_p[i2]].y) / 3,
                            (v[_p[i0]].z + v[_p[i1]].z + v[_p[i2]].z) / 3
                        ),
                        square: _s,
                        dataCount: 0,
                    });
                }
            }
        }
        triangle.limit = Math.floor(sumS / triangle.minS);
        return triangle;
    };

    window.getDataFromFile = function (
        url,
        onloadCallback,
        onprogressCallback
    ) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "document";
        xhr.overrideMimeType("text/xml");
        xhr.onload = function () {
            if (xhr.readyState == 4 && xhr.status == 200)
                onloadCallback(null, xhr.response);
            else console.error("COLLADA file was loaded but smthg went wrong");
        };
        xhr.onprogress = function (e) {
            onprogressCallback(e.loaded / e.total);
        };
        xhr.onerror = function () {
            console.error("COLLADA file not loaded");
        };
        xhr.send();
    };

    window.getColladaData = function (
        path,
        vOffset /* vertex offset */,
        callback
    ) {
        let G = {
            array: [],
            loaded: false,
        };
        getDataFromFile(
            path,
            function (err, data) {
                if (!err) {
                    let _g = data.getElementsByTagName("geometry");
                    for (let k = 0; k < _g.length; k++) {
                        G.array[k] = {
                            position: [],
                            normal: [],
                            uv: [],
                            face: [],
                        };
                        let _f = _g[k].getElementsByTagName("float_array");
                        for (let i = 0; i < _f.length; i++) {
                            if (_f[i].id.search(/position/i) + 1)
                                G.array[k].position = G.array[
                                    k
                                ].position.concat(
                                    parseCoords("vertex", _f[i].innerHTML)
                                );
                            if (_f[i].id.search(/normal/i) + 1)
                                G.array[k].normal = G.array[k].normal.concat(
                                    parseCoords("normal", _f[i].innerHTML)
                                );
                            if (_f[i].id.search(/uv/i) + 1)
                                G.array[k].uv = G.array[k].uv.concat(
                                    parseCoords("uv", _f[i].innerHTML)
                                );
                        }
                        G.array[k].face = parseTriangleFacesModified(
                            _g[k],
                            G.array[k].position,
                            vOffset
                        );
                    }
                    G.loaded = true;
                    callback();
                } else
                    console.error(
                        "COLLADA file was loaded but smthg went wrong in callback function"
                    );
            },
            function (loaded) {
                G.loaded = loaded;
            }
        );
        return G;
    };

    window.Orbit = function (camera) {
        let THIS = this;
        THIS.camera = camera;
        THIS.rotation = vec2();
        THIS.translation = vec3();
        THIS.camera.matrixAutoUpdate = false;
        THIS.update = function () {
            let transform = new THREE.Matrix4();
            let rY = rotationAroundAxis(vec3(0, 1, 0), THIS.rotation.y);
            let rX = rotationAroundAxis(
                vec3(1, 0, 0).applyMatrix4(rY),
                THIS.rotation.x
            );
            let t = new THREE.Matrix4().premultiply(rY).premultiply(rX);
            transform.premultiply(rY);
            transform.premultiply(rX);
            transform.premultiply(
                translationAlongAxis(
                    THIS.translation.clone().applyMatrix4(t),
                    1
                )
            );
            THIS.camera.matrixWorld = transform;
        };
        return THIS;
    };
};
