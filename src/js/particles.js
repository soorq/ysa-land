import { initGL } from "./gl";
initGL();

export default function (parent, callback) {
    var THIS = this;
    THIS.loaded = false;
    THIS.parent = parent;

    var xA = vec3(1, 0, 0);
    var yA = vec3(0, 1, 0);
    var zA = vec3(0, 0, 1);

    THIS.renderer = new THREE.WebGLRenderer({ antialias: true });
    THIS.renderer.setSize(THIS.parent.offsetWidth, THIS.parent.offsetHeight);
    THIS.renderer.setClearColor(0x00092b);
    THIS.renderer.domElement.style.position = "absolute";
    THIS.orbit = new Orbit(
        new THREE.PerspectiveCamera(
            60,
            THIS.parent.offsetWidth / THIS.parent.offsetHeight,
            1,
            100000
        )
    );
    THIS.orbit.translation.z = 200;

    var data_0 = new THREE.WebGLRenderTarget(
        THIS.parent.offsetWidth / 20,
        THIS.parent.offsetHeight / 10,
        {
            type: THREE.FloatType,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            anisotropy: 0,
        }
    );
    var data_1 = [
        new THREE.WebGLRenderTarget(64, 64, { type: THREE.FloatType }),
        new THREE.WebGLRenderTarget(64, 64, { type: THREE.FloatType }),
    ];
    var currData = 0;

    var particlesNumber = 4096;

    var geometryData = getColladaData(
        "/assets/models/models.DAE",
        0,
        function () {
            var sources = [];

            for (var j = 0; j < 5; j++) {
                sources.push({
                    vertices: geometryData.array[j].position,
                    normals: geometryData.array[j].normal,
                    faces: geometryData.array[j].face,
                    positions: [],
                    normals: [],
                    tPositions: [],
                    transform: new THREE.Matrix4().premultiply(
                        J.rotate(xA, -Math.PI * 0.5)
                    ),
                });
            }

            // sources[ 0 ].transform.premultiply( J.rotate( yA, Math.PI ) );
            // sources[ 0 ].transform.premultiply( J.rotate( zA, Math.PI * .015 ) );
            // sources[ 0 ].transform.premultiply( J.translate( vec3( 0, - .74, 0 ) ) );
            // sources[ 0 ].transform.premultiply( J.rotate( yA, Math.PI  * .15 ) );
            // sources[ 0 ].transform.premultiply( J.scale( xA, 100 ) );
            // sources[ 0 ].transform.premultiply( J.scale( yA, 100 ) );
            // sources[ 0 ].transform.premultiply( J.scale( zA, 100 ) );

            sources[0].transform.premultiply(J.rotate(yA, Math.PI));
            sources[0].transform.premultiply(J.rotate(zA, Math.PI * 0.015));
            sources[0].transform.premultiply(J.translate(vec3(15, -74, 10)));
            sources[0].transform.premultiply(J.rotate(yA, Math.PI * 0.15));

            sources[1].transform.premultiply(J.rotate(yA, Math.PI * 1.2));

            sources[2].transform.premultiply(J.rotate(yA, Math.PI * 1.1));
            sources[2].transform.premultiply(J.rotate(zA, Math.PI * 0.01));
            sources[2].transform.premultiply(J.scale(xA, 0.95));
            sources[2].transform.premultiply(J.scale(yA, 0.95));
            sources[2].transform.premultiply(J.scale(zA, 0.95));

            sources[3].transform.premultiply(J.rotate(yA, Math.PI * 1.1));
            sources[3].transform.premultiply(J.translate(vec3(0, -76, 0)));
            sources[3].transform.premultiply(J.scale(xA, 1.06));
            sources[3].transform.premultiply(J.scale(yA, 1.06));
            sources[3].transform.premultiply(J.scale(zA, 1.06));

            sources[4].transform.premultiply(J.rotate(yA, Math.PI * 0.4));
            sources[4].transform.premultiply(J.rotate(xA, -Math.PI * 0.03));
            sources[4].transform.premultiply(J.translate(vec3(-10, 10, 0)));
            sources[4].transform.premultiply(J.scale(xA, 0.85));
            sources[4].transform.premultiply(J.scale(yA, 0.85));
            sources[4].transform.premultiply(J.scale(zA, 0.85));

            var geometry = new THREE.Geometry();
            var triangleRandom = [];
            var triangleIndex = [];
            var trianglePosition = [];

            for (var k = 0; k < sources.length; k++) {
                let _faces = sources[k].faces.slice(0);
                for (var i = 0; i < particlesNumber; i++) {
                    let faceIndex = Math.floor(Math.random() * _faces.length);
                    if (_faces[faceIndex]) {
                        let face = _faces[faceIndex];

                        let v1 = sources[k].vertices[face.a]
                            .clone()
                            .applyMatrix4(sources[k].transform);
                        let v2 = sources[k].vertices[face.b]
                            .clone()
                            .applyMatrix4(sources[k].transform);
                        let v3 = sources[k].vertices[face.c]
                            .clone()
                            .applyMatrix4(sources[k].transform);
                        let n = face.normal
                            .clone()
                            .applyMatrix4(
                                new THREE.Matrix4().extractRotation(
                                    sources[k].transform
                                )
                            );
                        let p = face.center
                            .clone()
                            .applyMatrix4(sources[k].transform);

                        sources[k].positions.push(
                            v1.x,
                            v1.y,
                            v1.z,
                            p.length(),
                            v2.x,
                            v2.y,
                            v2.z,
                            p.length(),
                            v3.x,
                            v3.y,
                            v3.z,
                            p.length()
                        );
                        sources[k].normals.push(
                            n.x,
                            n.y,
                            n.z,
                            n.x,
                            n.y,
                            n.z,
                            n.x,
                            n.y,
                            n.z
                        );
                        sources[k].tPositions.push(
                            p.x,
                            p.y,
                            p.z,
                            p.x,
                            p.y,
                            p.z,
                            p.x,
                            p.y,
                            p.z
                        );
                        _faces.splice(faceIndex, 1);
                    } else {
                        sources[k].positions.push(
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0
                        );
                        sources[k].normals.push(0, 0, 0, 0, 0, 0, 0, 0, 0);
                        sources[k].tPositions.push(0, 0, 0, 0, 0, 0, 0, 0, 0);
                    }

                    if (!k) {
                        geometry.vertices.push(vec3(), vec3(), vec3());
                        geometry.faces.push(
                            new THREE.Face3(i * 3, i * 3 + 1, i * 3 + 2)
                        );
                        let r1 = Math.random() * 0.5 + 0.5;
                        let r2 = Math.random() * 0.5 + 0.5;
                        let r3 = Math.random() * 0.5 + 0.5;
                        triangleRandom.push(r1, r2, r3, r1, r2, r3, r1, r2, r3);
                        triangleIndex.push(i, i, i);
                    }
                }
            }

            geometry = new THREE.BufferGeometry().fromGeometry(geometry);
            for (var i = 0; i < sources.length; i++) {
                geometry.addAttribute(
                    "G" + i + "_aVertexPosition",
                    new THREE.BufferAttribute(
                        new Float32Array(sources[i].positions),
                        4
                    )
                );
                geometry.addAttribute(
                    "G" + i + "_aNormal",
                    new THREE.BufferAttribute(
                        new Float32Array(sources[i].normals),
                        3
                    )
                );
                geometry.addAttribute(
                    "G" + i + "_aTrianglePosition",
                    new THREE.BufferAttribute(
                        new Float32Array(sources[i].tPositions),
                        3
                    )
                );
            }
            geometry.addAttribute(
                "aTriangleIndex",
                new THREE.BufferAttribute(new Float32Array(triangleIndex), 1)
            );
            geometry.addAttribute(
                "aTriangleRandom",
                new THREE.BufferAttribute(new Float32Array(triangleRandom), 3)
            );

            var dataMaterial_0 = new THREE.RawShaderMaterial({
                uniforms: {
                    time: { type: "fv", value: globalTime },
                    k: { type: "f", value: 0 },
                    _k: { type: "f", value: 0 },
                    meshRot: { type: "f", value: 0 },
                },
                vertexShader: [
                    "precision highp float;",
                    "precision highp int;",
                    "attribute vec4 G0_aVertexPosition;",
                    "attribute vec3 G0_aNormal;",
                    "attribute vec4 G1_aVertexPosition;",
                    "attribute vec3 G1_aNormal;",
                    "attribute vec4 G2_aVertexPosition;",
                    "attribute vec3 G2_aNormal;",
                    "attribute vec4 G3_aVertexPosition;",
                    "attribute vec3 G3_aNormal;",
                    "attribute vec4 G4_aVertexPosition;",
                    "attribute vec3 G4_aNormal;",
                    "attribute float aTriangleIndex;",
                    "attribute vec3 aTriangleRandom;",
                    "uniform float time[1];",
                    "uniform float k;",
                    "uniform float _k;",
                    "uniform float meshRot;",
                    "uniform mat4 projectionMatrix;",
                    "uniform mat4 viewMatrix;",
                    "uniform mat4 modelMatrix;",
                    "varying float vIndex;",
                    "mat4 rotation( vec3 n, float a ) {",
                    "return mat4(",
                    "cos( a ) + n.x * n.x * ( 1. - cos( a ) ), n.x * n.y * ( 1. - cos( a ) ) - n.z * sin( a ), n.x * n.z * ( 1. - cos( a ) ) + n.y * sin( a ), 0.,",
                    "n.y * n.x * ( 1. - cos( a ) ) + n.z * sin( a ),       cos( a ) + n.y * n.y * ( 1. - cos( a ) ), n.y * n.z * ( 1. - cos( a ) ) - n.x * sin( a ), 0.,",
                    "n.z * n.x * ( 1. - cos( a ) ) - n.y * sin( a ), n.z * n.y * ( 1. - cos( a ) ) + n.x * sin( a ),       cos( a ) + n.z * n.z * ( 1. - cos( a ) ), 0.,",
                    "0.,                                             0.,                                             0., 1.",
                    ");",
                    "}",
                    "void main() {",
                    "vIndex = aTriangleIndex;",
                    "float k0 = smoothstep( 0., 1., k );",
                    "float k1 = smoothstep( 0., 1., k - 1. );",
                    "float k2 = smoothstep( 0., 1., k - 2. );",
                    "float k3 = smoothstep( 0., 1., k - 3. );",
                    "mat4 rot3 = rotation( vec3( 0., 1., 0. ), meshRot );",
                    "vec3 vNormal = mix( G0_aNormal, mix( G1_aNormal, mix( G2_aNormal, mix( G3_aNormal, G4_aNormal, k3 ), k2 ), k1 ), k0 );",
                    "vNormal = ( modelMatrix * vec4( vNormal, 1. ) ).xyz;",
                    "vNormal = ( rot3 * vec4( vNormal, 1. ) ).xyz;",
                    "vNormal = normalize( vNormal );",
                    "vec3 vPosition = ( mix( G0_aVertexPosition, mix( G1_aVertexPosition, mix( G2_aVertexPosition, mix( G3_aVertexPosition, G4_aVertexPosition, k3 ), k2 ), k1 ), k0 ) ).xyz;",
                    "vPosition = ( modelMatrix * vec4( vPosition, 1. ) ).xyz;",
                    "vPosition = ( rot3 * vec4( vPosition, 1. ) ).xyz;",
                    "vPosition += vNormal * sin( time[0] * .001 * ( aTriangleRandom.r ) ) * pow( pow( sin( _k * 3.14 ), .5 ) * 2., 7.2 * aTriangleRandom.r ) * .75;",
                    "gl_Position = projectionMatrix * viewMatrix * vec4( vPosition, 1. );",
                    "}",
                ].join("\n"),
                fragmentShader: [
                    "precision highp float;",
                    "precision highp int;",
                    "varying float vIndex;",
                    "void main() {",
                    "gl_FragColor = vec4( vIndex, 1., 0., 0. );",
                    "}",
                ].join("\n"),
            });

            var dataMaterial_1 = (THIS.dataMaterial_1 =
                new THREE.RawShaderMaterial({
                    uniforms: {
                        data_0: { type: "t", value: data_0.texture },
                        data_1: { type: "t", value: data_1[0].texture },
                        mouse: { type: "v2", value: vec2() },
                        move: { type: "f", value: 0 },
                    },
                    vertexShader: [
                        "precision highp float;",
                        "precision highp int;",
                        "attribute vec3 position;",
                        "attribute vec2 uv;",
                        "varying vec2 vUv;",
                        "void main() {",
                        "vUv = uv;",
                        "gl_Position = vec4( position, 1. );",
                        "}",
                    ].join("\n"),
                    fragmentShader: [
                        "precision highp float;",
                        "precision highp int;",
                        "uniform sampler2D data_0;",
                        "uniform sampler2D data_1;",
                        "uniform vec2 mouse;",
                        "uniform float move;",
                        "varying vec2 vUv;",
                        "void main() {",
                        "vec4 rgba_0_0 = texture2D( data_0, mouse );",
                        "vec4 rgba_0_1 = texture2D( data_0, mouse + vec2( .02, 0 ) );",
                        "vec4 rgba_0_2 = texture2D( data_0, mouse + vec2( - .02, 0 ) );",
                        "vec4 rgba_0_3 = texture2D( data_0, mouse + vec2( 0., .02 ) );",
                        "vec4 rgba_0_4 = texture2D( data_0, mouse + vec2( 0., - .02 ) );",

                        "vec4 rgba_1 = texture2D( data_1, vUv );",
                        "float index = floor( vUv.x * 64. ) + 64. * floor( vUv.y * 64. );",
                        "if ( rgba_0_0.r > index - .001 && rgba_0_0.r < index + .001 && move == 1. && rgba_0_0.g == 1. ) rgba_1.g = 1. * .01;",
                        "if ( rgba_0_1.r > index - .001 && rgba_0_1.r < index + .001 && move == 1. && rgba_0_1.g == 1. ) rgba_1.g = 1. * .01;",
                        "if ( rgba_0_2.r > index - .001 && rgba_0_2.r < index + .001 && move == 1. && rgba_0_2.g == 1. ) rgba_1.g = 1. * .01;",
                        "if ( rgba_0_3.r > index - .001 && rgba_0_3.r < index + .001 && move == 1. && rgba_0_3.g == 1. ) rgba_1.g = 1. * .01;",
                        "if ( rgba_0_4.r > index - .001 && rgba_0_4.r < index + .001 && move == 1. && rgba_0_4.g == 1. ) rgba_1.g = 1. * .01;",

                        "rgba_1.r += rgba_1.g;",
                        "rgba_1.g *= .99;",
                        "rgba_1.r *= .95;",
                        "gl_FragColor = rgba_1;",
                        "}",
                    ].join("\n"),
                }));

            var dataPlane = new THREE.Mesh(
                new THREE.PlaneGeometry(2, 2),
                dataMaterial_1
            );

            var material = new THREE.RawShaderMaterial({
                uniforms: {
                    data_1: { type: "t", value: data_1[0].texture },
                    time: { type: "fv", value: globalTime },
                    color: { type: "c", value: new THREE.Color(0x0a57f4) },
                    k: { type: "f", value: 0 },
                    _k: { type: "f", value: 0 },
                    meshRot: { type: "f", value: 0 },
                    camMat: { type: "m4", value: new THREE.Matrix4() },
                    random: { type: "f", value: Math.random() },
                },
                vertexShader: [
                    "precision highp float;",
                    "precision highp int;",
                    "attribute vec3 position;",
                    "uniform mat4 projectionMatrix;",
                    "uniform mat4 viewMatrix;",
                    "uniform mat4 modelMatrix;",
                    "attribute vec4 G0_aVertexPosition;",
                    "attribute vec3 G0_aNormal;",
                    "attribute vec4 G1_aVertexPosition;",
                    "attribute vec3 G1_aNormal;",
                    "attribute vec4 G2_aVertexPosition;",
                    "attribute vec3 G2_aNormal;",
                    "attribute vec4 G3_aVertexPosition;",
                    "attribute vec3 G3_aNormal;",
                    "attribute vec4 G4_aVertexPosition;",
                    "attribute vec3 G4_aNormal;",
                    "attribute vec3 aTriangleRandom;",
                    "attribute float aTriangleIndex;",
                    "uniform sampler2D data_1;",
                    "uniform float time[1];",
                    "uniform float k;",
                    "uniform float _k;",
                    "uniform float meshRot;",
                    "uniform float random;",
                    "varying vec3 vPosition;",
                    "varying vec3 vNormal;",
                    "varying vec4 rgba;",
                    "mat4 rotation( vec3 n, float a ) {",
                    "return mat4(",
                    "cos( a ) + n.x * n.x * ( 1. - cos( a ) ), n.x * n.y * ( 1. - cos( a ) ) - n.z * sin( a ), n.x * n.z * ( 1. - cos( a ) ) + n.y * sin( a ), 0.,",
                    "n.y * n.x * ( 1. - cos( a ) ) + n.z * sin( a ),       cos( a ) + n.y * n.y * ( 1. - cos( a ) ), n.y * n.z * ( 1. - cos( a ) ) - n.x * sin( a ), 0.,",
                    "n.z * n.x * ( 1. - cos( a ) ) - n.y * sin( a ), n.z * n.y * ( 1. - cos( a ) ) + n.x * sin( a ),       cos( a ) + n.z * n.z * ( 1. - cos( a ) ), 0.,",
                    "0.,                                             0.,                                             0., 1.",
                    ");",
                    "}",
                    "void main() {",
                    "vec2 tCoords = vec2( fract( aTriangleIndex / 64. ) + .5 / 64., floor( aTriangleIndex / 64. ) / 64. + .5 / 64. );",
                    "rgba = texture2D( data_1, tCoords );",
                    "float k0 = smoothstep( 0., 1., k );",
                    "float k1 = smoothstep( 0., 1., k - 1. );",
                    "float k2 = smoothstep( 0., 1., k - 2. );",
                    "float k3 = smoothstep( 0., 1., k - 3. );",

                    "mat4 rot3 = rotation( vec3( 0., 1., 0. ), meshRot );",

                    "vNormal = mix( G0_aNormal, mix( G1_aNormal, mix( G2_aNormal, mix( G3_aNormal, G4_aNormal, k3 ), k2 ), k1 ), k0 );",
                    "vNormal = ( modelMatrix * vec4( vNormal, 1. ) ).xyz;",
                    "vNormal = ( rot3 * vec4( vNormal, 1. ) ).xyz;",
                    "vNormal = normalize( vNormal );",

                    "vPosition = ( mix( G0_aVertexPosition, mix( G1_aVertexPosition, mix( G2_aVertexPosition, mix( G3_aVertexPosition, G4_aVertexPosition, k3 ), k2 ), k1 ), k0 ) ).xyz;",
                    "vPosition = ( modelMatrix * vec4( vPosition, 1. ) ).xyz;",
                    "vPosition = ( rot3 * vec4( vPosition, 1. ) ).xyz;",
                    "vPosition += vNormal * sin( time[0] * .001 * ( aTriangleRandom.x ) ) * pow( pow( sin( _k * 3.14 ), .5 ) * 2., 7.2 * aTriangleRandom.x ) * .75;",
                    "vPosition += vNormal * rgba.r * 8.;",
                    "gl_Position = projectionMatrix * viewMatrix * vec4( vPosition, 1. );",
                    "}",
                ].join("\n"),
                fragmentShader: [
                    "precision highp float;",
                    "precision highp int;",
                    "uniform vec3 cameraPosition;",
                    "uniform mat4 camMat;",
                    "uniform vec3 color;",
                    "varying vec3 vPosition;",
                    "varying vec3 vNormal;",
                    "uniform float _k;",
                    "varying vec4 rgba;",
                    "void main() {",
                    "vec3 lightPos = ( camMat * vec4( 100., 50., 100., 1. ) ).xyz;",
                    "vec3 lightDir = normalize( lightPos - vPosition );",
                    "vec4 diffuse = max( pow( dot( vNormal, lightDir ), 2. ), 0. ) * vec4( 1. );",
                    "vec4 l = vec4( .1 ) + diffuse;",
                    "gl_FragColor = vec4( l.xyz * color * .95, 1. );",
                    "float ll = sin( _k * 3.14 );",
                    "if ( ll < .01 ) ll = 0.;",
                    "if ( ll > .99 ) ll = 1.;",
                    "if ( dot( vNormal, cameraPosition - vPosition ) < 0. ) gl_FragColor = mix( vec4( vec3( color * 2. ), 1. ), gl_FragColor, pow( ll, .1 ) );",
                    "}",
                ].join("\n"),
                side: THREE.DoubleSide,
                transparent: true,
            });

            var mesh = new THREE.Mesh(geometry, material);
            mesh.matrixAutoUpdate = false;

            var timeVelo = { value: 1 };
            timeVelo.setDependency = setDependency;
            timeVelo.setDependency();

            material.uniforms.meshRot.setDependency = setDependency;
            material.uniforms.meshRot.setDependency();
            material.uniforms.k.setDependency = setDependency;
            material.uniforms.k.setDependency();
            material.uniforms._k.setDependency = setDependency;
            material.uniforms._k.setDependency();
            THIS.orbit.rotation.setDependency = setDependency;
            THIS.orbit.rotation.setDependency(["x", "y"]);

            var currRot = 0;
            var currScat = 0;
            THIS.goTo = function (index) {
                currRot -=
                    Math.PI * 2 * Math.sign(index - material.uniforms.k.value);
                currScat = 1 - currScat;
                material.uniforms.k.setProcess([
                    {
                        func: function (time) {
                            return bezierCubicCurve(time, 0.5, 0, 0, 1);
                        },
                        value: index,
                        time: 338,
                        delay: 188,
                    },
  
              ]);
                material.uniforms.meshRot.setProcess([
                    {
                        func: function (time) {
                            return bezierCubicCurve(time, 0.5, 0, 0, 1);
                        },
                        value: currRot,
                        time: 1125,
                    },
                ]);
                material.uniforms._k.setProcess([
                    {
                        func: function (time) {
                            return bezierCubicCurve(time, 0, 0, 0.75, 1);
                        },
                        value: currScat,
                        time: 600,
                        delay: 188,
                    },
                ]);
                timeVelo.setProcess([
                    {
                        func: function (time) {
                            return bezierCubicCurve(time, 0.75, 0, 0, 1);
                        },
                        value: 0.15,
                        time: 113,
                        delay: 300,
                    },
                    {
                        func: function (time) {
                            return bezierCubicCurve(time, 0.75, 0, 0, 1);
                        },
                        value: 1,
                        time: 75,
                    },
                ]);
            };

            THIS.mouseMove = vec2();
            THIS.lastMove = vec2();

            var render = function () {
                frameTime[0] = parseInt(new Date() - lastTime) * timeVelo.value;
                lastTime = new Date();
                globalTime[0] += parseInt(frameTime);

                if (
                    THIS.lastMove.x == THIS.mouseMove.x &&
                    THIS.lastMove.y == THIS.mouseMove.y
                )
                    dataMaterial_1.uniforms.move.value = 0;
                else dataMaterial_1.uniforms.move.value = 1;
                THIS.lastMove.x = THIS.mouseMove.x;
                THIS.lastMove.y = THIS.mouseMove.y;

                dataMaterial_0.uniforms.k.value = material.uniforms.k.value;
                dataMaterial_0.uniforms._k.value = material.uniforms._k.value;
                dataMaterial_0.uniforms.meshRot.value =
                    material.uniforms.meshRot.value;

                mesh.material = dataMaterial_0;
                THIS.renderer.render(mesh, THIS.orbit.camera, data_0, true);
                dataMaterial_1.uniforms.data_0.value = data_0.texture;
                mesh.material = material;

                dataMaterial_1.uniforms.data_1.value = data_1[currData].texture;
                material.uniforms.data_1.value = data_1[currData].texture;
                currData = 1 - currData;
                THIS.renderer.render(
                    dataPlane,
                    THIS.orbit.camera,
                    data_1[currData],
                    true
                );

                material.uniforms.camMat.value =
                    new THREE.Matrix4().extractRotation(
                        THIS.orbit.camera.matrixWorld
                    );
                material.uniforms.random.value = Math.random();

                THIS.orbit.update();
                updates.forEach(function (item) {
                    item();
                });
                THIS.renderer.render(mesh, THIS.orbit.camera);
                render ? requestAnimationFrame(render) : null;
            };

            var animationFrame = requestAnimationFrame(render);

            THIS.destroy = function () {
                cancelAnimationFrame(animationFrame);
                render = null;
            };

            THIS.fff = function () {
                alert();
            };

            globalTime[0] = 999999;
            lastTime = new Date();
            render();
            parent.appendChild(THIS.renderer.domElement);
            callback();
        }
    );
}
