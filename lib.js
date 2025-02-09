
// MATRIX SUPPORT LIBRARY

let mInverse = m => {
   let d = [], de = 0, co = (c, r) => {
      let s = (i, j) => m[c+i & 3 | (r+j & 3) << 2];
      return (c+r & 1 ? -1 : 1) * ( (s(1,1) * (s(2,2) * s(3,3) - s(3,2) * s(2,3)))
                                  - (s(2,1) * (s(1,2) * s(3,3) - s(3,2) * s(1,3)))
                                  + (s(3,1) * (s(1,2) * s(2,3) - s(2,2) * s(1,3))) );
   }
   for (let n = 0 ; n < 16 ; n++) d.push(co(n >> 2, n & 3));
   for (let n = 0 ; n <  4 ; n++) de += m[n] * d[n << 2]; 
   for (let n = 0 ; n < 16 ; n++) d[n] /= de;
   return d;
}
let mxm = (a, b) => {
   let d = [];
   for (let n = 0 ; n < 16 ; n++)
      d.push(a[n&3]*b[n&12] + a[n&3|4]*b[n&12|1] + a[n&3|8]*b[n&12|2] + a[n&3|12]*b[n&12|3]);
   return d;
}
let C = t => Math.cos(t), S = t => Math.sin(t);
let mId = () => [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1 ];
let mPe = (fl, m) => mxm(m, [1,0,0,0, 0,1,0,0, 0,0,1,-1/fl, 0,0,0,1]);
let mRX = (t, m) => mxm(m, [1,0,0,0, 0,C(t),S(t),0, 0,-S(t),C(t),0, 0,0,0,1]);
let mRY = (t, m) => mxm(m, [C(t),0,-S(t),0, 0,1,0,0, S(t),0,C(t),0, 0,0,0,1]);
let mRZ = (t, m) => mxm(m, [C(t),S(t),0,0, -S(t),C(t),0,0, 0,0,1,0, 0,0,0,1]);
let mSc = (x,y,z, m) => mxm(m, [x,0,0,0, 0,y,0,0, 0,0,z,0, 0,0,0,1]);
let mTr = (x,y,z, m) => mxm(m, [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1]);
function Matrix() {
   let stack = [mId()], top = 0;
   let set = arg => { stack[top] = arg; return this; }
   let get = () => stack[top];
   this.identity = () => set(mId());
   this.perspective = fl => set(mPe(fl, get()));
   this.turnX = t => set(mRX(t, get()));
   this.turnY = t => set(mRY(t, get()));
   this.turnZ = t => set(mRZ(t, get()));
   this.scale = (x,y,z) => set(mSc(x,y?y:x,z?z:x, get()));
   this.move = (x,y,z) => set(mTr(x,y,z, get()));
   this.get = () => get();
   this.S = () => set(stack[top++].slice());
   this.R = () => --top;
   this.draw = (shape,color,opacity,texture,bumpTexture) => draw(shape,color,opacity,texture,bumpTexture);
}

// INITIALIZE WEBGL

let start_gl = (canvas, vertexShader, fragmentShader) => {
   let gl = canvas.getContext("webgl");
   let program = gl.createProgram();
   gl.program = program;
   let addshader = (type, src) => {
      let shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS))
         throw "Cannot compile shader:\n\n" + gl.getShaderInfoLog(shader);
      gl.attachShader(program, shader);
   };
   addshader(gl.VERTEX_SHADER  , vertexShader  );
   addshader(gl.FRAGMENT_SHADER, fragmentShader);
   gl.linkProgram(program);
   if (! gl.getProgramParameter(program, gl.LINK_STATUS))
      throw "Could not link the shader program!";
   gl.useProgram(program);
   gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
   gl.enable(gl.DEPTH_TEST);
   gl.enable(gl.BLEND);
   gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
   gl.depthFunc(gl.LEQUAL);
   let vertexAttribute = (name, size, position) => {
      let attr = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(attr);
      gl.vertexAttribPointer(attr, size, gl.FLOAT, false, vertexSize * 4, position * 4);
   }
   vertexAttribute('aPos', 3, 0);
   vertexAttribute('aNor', 3, 3);
   vertexAttribute('aUV' , 2, 6);
   vertexAttribute('aTan', 3, 8);
   return gl;
}

// IMPLEMENT VARIOUS 3D SHAPES

let createMesh = (nu, nv, p) => {
   let V = (u,v) => {
      let P = p(u,v);
      let Q = p(u+.001,v);
      let x = Q[0]-P[0], y = Q[1]-P[1], z = Q[2]-P[2], s = Math.sqrt(x*x + y*y + z*z);
      return P.concat([u, 1-v, x/s, y/s, z/s]);
   }

   let mesh = [];
   for (let j = nv-1 ; j >= 0 ; j--) {
      for (let i = 0 ; i <= nu ; i++)
         mesh.push(V(i/nu,(j+1)/nv),  V(i/nu,j/nv));
      mesh.push(V(1,j/nv), V(0,j/nv));
   }
   return new Float32Array(mesh.flat());
}
let sphere = (nu, nv) => createMesh(nu, nv, (u,v) => {
   let theta = 2 * Math.PI * u;
   let phi = Math.PI * (v - .5);
   let x = C(phi) * C(theta),
       y = C(phi) * S(theta),
       z = S(phi);
   return [ x,y,z, x,y,z ];
});
let tube = (nu, nv) => createMesh(nu, nv, (u,v) => {
   let x = C(2 * Math.PI * u),
       y = S(2 * Math.PI * u),
       z = 2 * v - 1;
   return [ x,y,z, x,y,0 ];
});
let disk = (nu, nv) => createMesh(nu, nv, (u,v) => {
   let x = v * C(2 * Math.PI * u),
       y = v * S(2 * Math.PI * u);
   return [ x,y,0, 0,0,1 ];
});
let cylinder = (nu, s) => createMesh(nu, 6, (u,v) => {
   s = s ? s : 1;
   let x = C(2 * Math.PI * u),
       y = S(2 * Math.PI * u);
   switch (5 * v >> 0) {
   case 0: return [ 0,0,-1, 0,0,-1 ];
   case 1: return [ x,y,-1, 0,0,-1 ];
   case 2: return [ x,y,-1, x,y, 0 ];
   case 3: return [ s*x,s*y, 1, x,y, 0 ];
   case 4: return [ s*x,s*y, 1, 0,0, 1 ];
   case 5: return [ 0,0, 1, 0,0, 1 ];
   }
});
let torus = (nu, nv, r, t) => createMesh(nu, nv, (u,v) => {
   r = r ? r : .5;
   t = t ? t : 1;
   let ct = C(2 * Math.PI * u);
   let st = S(2 * Math.PI * u);
   let cp = C(2 * Math.PI * v);
   let sp = S(2 * Math.PI * v);
   let x = (1 + r * cp) * ct,
       y = (1 + r * cp) * st,
       z =      r * Math.max(-t, Math.min(t, sp));
   return [ x,y,z, cp*ct,cp*st,sp ];
});
let strToTris = s => {
   let t = [], i;
   for (let n = 0 ; n < s.length ; n++)
      if ((i = 'N01'.indexOf(s.charAt(n))) >= 0)
         t.push(i-1);
   return new Float32Array(t);
}

let square = strToTris(`1N000111100 11000110100 N1000100100  N1000100100 NN000101100 1N000111100`);

let cube = strToTris(`1N100111100 11100110100 N1100100100  N1100100100 NN100101100 1N100111100
                      N1N00N01N00 11N00N11N00 1NN00N10N00  1NN00N10N00 NNN00N00N00 N1N00N01N00
                      11N10011010 11110010010 1N110000010  1N110000010 1NN10001010 11N10011010
                      NN1N00100N0 N11N00000N0 N1NN00010N0  N1NN00010N0 NNNN00110N0 NN1N00100N0
                      N1101011001 11101010001 11N01000001  11N01000001 N1N01001001 N1101011001
                      1NN0N00100N 1N10N01100N NN10N01000N  NN10N01000N NNN0N00000N 1NN0N00100N`);

// API FOR ACCESSING 3D SHAPES

let Cube     = ()      => { return { type: 0, mesh: cube }; }
let Cylinder = (n,s)   => { return { type: 1, mesh: cylinder(n,s) }; }
let Disk     = n       => { return { type: 1, mesh: disk    (n, 1) }; }
let Sphere   = n       => { return { type: 1, mesh: sphere  (n, n>>1) }; }
let Square   = ()      => { return { type: 0, mesh: square }; }
let Torus    = (n,r,t) => { return { type: 1, mesh: torus   (n, n, r, t) }; }
let Tube     = n       => { return { type: 1, mesh: tube    (n, 1) }; }

// GPU SHADERS

let vertexSize = 11;
let vertexShader = `
   attribute vec3 aPos, aNor, aTan;
   attribute vec2 aUV;
   uniform mat4 uMatrix, uInvMatrix;
   varying vec3 vPos, vNor, vTan;
   varying vec2 vUV;
   void main() {
      vec4 pos = uMatrix * vec4(aPos, 1.0);
      vec4 nor = vec4(aNor, 0.0) * uInvMatrix;
      vec4 tan = vec4(aTan, 0.0) * uInvMatrix;
      vPos = pos.xyz;
      vNor = nor.xyz;
      vTan = tan.xyz;
      vUV  = aUV;
      gl_Position = pos * vec4(1.,1.,-.1,1.);
   }
`;
let fragmentShader = `
   precision mediump float;
   uniform sampler2D uSampler[16];
   uniform vec3 uColor;
   uniform float uOpacity;
   uniform int uTexture, uBumpTexture;
   varying vec3 vPos, vNor, vTan;
   varying vec2 vUV;
   void main(void) {
      vec4 texture = vec4(1.);
      vec3 nor = normalize(vNor);
      for (int i = 0 ; i < 16 ; i++) {
         if (uTexture == i)
        texture = texture2D(uSampler[i], vUV);
         if (uBumpTexture == i) {
        vec3 b = 2. * texture2D(uSampler[i], vUV).rgb - 1.;
        vec3 tan = normalize(vTan);
        vec3 bin = cross(nor, tan);
        nor = normalize(b.x * tan + b.y * bin + b.z * nor);
         }
      }
      float c = .05 + max(0., dot(nor, vec3(.557)));
      vec3 color = sqrt(uColor * c) * texture.rgb;
      gl_FragColor = vec4(color, uOpacity * texture.a);
   }
`;


// const NQ = 6;

// let fragmentShader = ` 
// #define NQ ${NQ}
// precision highp float;

// // PERLIN NOISE FUNCTION
// float noise(vec3 point) { float r = 0.; for (int i=0;i<16;i++) {
// vec3 D, p = point + mod(vec3(i,i/4,i/8) , vec3(4.0,2.0,2.0)) +
//     1.7*sin(vec3(i,5*i,8*i)), C=floor(p), P=p-C-.5, A=abs(P);
// C += mod(C.x+C.y+C.z,2.) * step(max(A.yzx,A.zxy),A) * sign(P);
// D=34.*sin(987.*float(i)+876.*C+76.*C.yzx+765.*C.zxy);P=p-C-.5;
// r+=sin(6.3*dot(P,fract(D)-.5))*pow(max(0.,1.-2.*dot(P,P)),4.);
// } return .5 * sin(r); }

// uniform float uTime, uFL;
// uniform vec3 uCursor;
// uniform vec3 uL;
// uniform mat4 uA[NQ], uB[NQ], uC[NQ];
// varying vec3 vPos;
// uniform vec3 uMaterials[NQ];

// vec3 c_orange = vec3 (1,.8,0.0);
// vec3 c_orange_dark = vec3 (1,.7,.07);
// vec3 indigo = vec3 (.1,.5,.8);
// vec3 bgColor = indigo;


// mat4 formatQ(mat4 Q) {
//     vec4 c0 = vec4(Q[0].x, 0., 0., 0.);
//     vec4 c1 = vec4(0., Q[1].y, 0., 0.);
//     vec4 c2 = vec4(0., 0., Q[2].z, 0.);
//     vec4 c3 = vec4(0., 0., 0., Q[3].w);
//     c1.x = Q[1].x + Q[0].y;
//     c2.x = Q[2].x + Q[0].z;
//     c3.x = Q[3].x + Q[0].w;
//     c2.y = Q[2].y + Q[1].z;
//     c3.y = Q[3].y + Q[1].w;
//     c3.z = Q[3].z + Q[2].w;
//     return mat4(c0, c1, c2, c3);
// }

// //return tIn, tOut
// vec2 find_tin_tout(vec3 V, vec3 W, mat4 Q) {
//     float a = Q[0].x;
//     float b = Q[1].y;
//     float c = Q[2].z;
//     float d = Q[2].y;
//     float e = Q[2].x;
//     float f = Q[1].x;
//     float g = Q[3].x;
//     float h = Q[3].y;
//     float i = Q[3].z;
//     float j = Q[3].w;

//     float Vx = V.x; float Vy = V.y; float Vz = V.z;
//     float Wx = W.x; float Wy = W.y; float Wz = W.z;
//     float A = a*Wx*Wx + b*Wy*Wy + c*Wz*Wz + d*Wy*Wz + e*Wz*Wx + f*Wx*Wy;
//     float B = 2.*(a*Vx*Wx + b*Vy*Wy + c*Vz*Wz) + d*(Vy*Wz + Vz*Wy) + e*(Vz*Wx + Vx*Wz) + f*(Vx*Wy + Vy*Wx) + g*Wx + h*Wy + i*Wz;
//     float C = a*Vx*Vx + b*Vy*Vy + c*Vz*Vz + d*Vy*Vz + e*Vz*Vx + f*Vx*Vy + g*Vx + h*Vy + i*Vz + j;
   
//     //Find tIn, tOut with delta
//     //delta = B^2 - 4AC
//     float del = B*B - 4.*A*C;
//     if (del < 0.) {
//     return vec2(-1.);
//     }
//     float tIn  = (-B - sqrt(del)) / 2. / A;
//     float tOut = (-B + sqrt(del)) / 2. / A;
//     return vec2(tIn, tOut);
// }

// //With two intervals, return the intersect interval
// //return the max of tIn and the min of tOut
// //inter1 and inter2 are vec2 with [tIn, tOut]
// vec2 find_intersection(vec2 inter1, vec2 inter2) {
//     float tIn = max(inter1.x, inter2.x);
//     float tOut = min(inter1.y, inter2.y);
//     //If tIn is greater than tOut, there is no intersection
//     if (tIn > tOut) {
//     return vec2(-1.);
//     }
//     return vec2(tIn, tOut);
// }

// //Calculate the normal vector of the quadric at point P
// vec3 calculate_N(vec3 P, mat4 Q) {
//     float px = P.x;
//     float py = P.y;
//     float pz = P.z;
   
//     /*
//     vec3 N = normalize(vec3( 
//     2.*a*x + e*z + f*y + g,
//     2.*b*y + d*z + f*x + h,
// 	2.*c*z + d*y + e*x + i ) );
//     */

//     float a = Q[0].x;
//     float b = Q[1].y;
//     float c = Q[2].z;
//     float d = Q[2].y;
//     float e = Q[2].x;
//     float f = Q[1].x;
//     float g = Q[3].x;
//     float h = Q[3].y;
//     float i = Q[3].z;
//     float j = Q[3].w;

//     return normalize(vec3(2.* a* px + e * pz + f * py + g,
//                         2.* b * py + d * pz + f * px + h,
//                         2.* c * pz + d * py + e * px + i ));
// }

// mat3 rayQ3(vec3 V, vec3 W, mat4 Q1, mat4 Q2, mat4 Q3, int dir) {
//     int cur_Q = -1;
//     vec2 inter1 = vec2(find_tin_tout(V, W, Q1));
//     vec2 inter2 = vec2(find_tin_tout(V, W, Q2));
//     vec2 inter3 = vec2(find_tin_tout(V, W, Q3));
//     vec2 inter_all_3 = find_intersection(find_intersection(inter1, inter2), inter3);
//     //In
//     if (dir == 1) {
//         if (inter_all_3.x == inter1.x) cur_Q = 1;
//         if (inter_all_3.x == inter2.x) cur_Q = 2;
//         if (inter_all_3.x == inter3.x) cur_Q = 3;
//     } //Out
//         else {
//         if (inter_all_3.y == inter1.y) cur_Q = 1;
//         if (inter_all_3.y == inter2.y) cur_Q = 2;
//         if (inter_all_3.y == inter3.y) cur_Q = 3;
//     }
   
//     vec3 P;
//     //P = V + t * W
//     if (dir == 1){
//         P = V + inter_all_3.x * W;
//     } else {
//         P = V + inter_all_3.y * W;
//     }
//     //Calculate the normal vector of the quadric at point P
//     vec3 N;
//     if (cur_Q == 1) N = calculate_N(P, Q1);
//     if (cur_Q == 2) N = calculate_N(P, Q2);
//     if (cur_Q == 3) N = calculate_N(P, Q3);
//     //return tIn, tOut, P, N
//     mat3 res =  mat3(inter_all_3, 0., P, N);
//     return res;
// }

// vec3 get_refra_dir(vec3 W, vec3 N, int dir) {
//     float refra_idx1 = 1.;
//     float refra_idx2 = 2.;
//     vec3 C1 = dot(N, W) * N;
//     vec3 S1 = W - C1;
//     vec3 S2, C2;
//     if (dir == 1) {
//         S2 = refra_idx1/refra_idx2 * S1;
//     } else {
//         S2 = refra_idx2/refra_idx1 * S1;
//     }
//     if (dir == 1) {
//         C2 = -1. * sqrt(1. - dot(S2, S2)) * N;
//     } else {
//         C2 = 1. * sqrt(1. - dot(S2, S2)) * N;
//     }
//     vec3 W2 = C2 + S2;
//     return W2;
// }

// void main(void) {
//     //set the background
//     vec3 color = bgColor + .2 * sin(2. * vPos.x + 2. * vPos.y + 2. * uTime);
//     vec3 V = vec3(0.);
//     vec3 W = normalize(vec3(vPos.xy, -uFL));
//     vec3 L = normalize(vec3(1. * cos(uTime), 1. * cos(uTime), 1.)); 

//     vec3 material;

//     float opacity = .6; //how much light passes through the object
//     bool is_in_shadow = false;

//     float tMin = 1000.;
//     for (int i = 0 ; i < NQ; i++) {
//         mat4 Q1 = formatQ(uA[i]);
//         mat4 Q2 = formatQ(uB[i]);
//         mat4 Q3 = formatQ(uC[i]);
//         mat3 res = rayQ3(V, W, Q1, Q2, Q3, 1);
//         float tIn = res[0].x;
//         float tOut = res[0].y;
//         //Intersection point
//         vec3 P = res[1];
//         //Normal vector
//         vec3 N = res[2];
//         //track the nearest intersection
//         if(tIn > 0. && tIn < tMin) {
//             tMin = tIn;
//             //reflection
//             vec3 R = W - 2. * N * dot(N, W);
//             material = uMaterials[i];
//             color = material;
//             vec3 Win = get_refra_dir(W, N, 1);
//             mat3 refra_1 = rayQ3(P, Win, Q1, Q2, Q3, 0);
//             vec3 P_refra_out = refra_1[1];
//             vec3 N_refra_out = refra_1[2];
//             vec3 Wout = get_refra_dir(Win, N_refra_out, 0);
//             //Compute Refraction and repeat the process for all quadrics
//             float tRefractMin = 1000.;
//             vec3 color_refract = bgColor;
//             for(int j = 0; j < NQ; j++) if(j != i) {
//                 mat4 Q1_j = formatQ(uA[j]);
//                 mat4 Q2_j = formatQ(uB[j]);
//                 mat4 Q3_j = formatQ(uC[j]);
//                 mat3 refra_2 = rayQ3(P_refra_out, Wout, Q1_j, Q2_j, Q3_j, 1);
//                 float t_refra_in = refra_2[0].x;
//                 float t_refra_out = refra_2[0].y;
//                 //If the ray intersects with another quadric
//                 if (t_refra_in > 0. && t_refra_in < tRefractMin) {
//                     tRefractMin = t_refra_in;
//                     color_refract = uMaterials[j];
//                 }
//             }
           
//             color = mix(color_refract * sqrt(2.), color, opacity);

//             //reflection
//             float t_refle_min = 1000.;
//             vec3 color_reflect = bgColor;
//             for(int j = 0; j < NQ; j++) if(j != i) {
//                 mat4 Q1_j = formatQ(uA[j]);
//                 mat4 Q2_j = formatQ(uB[j]);
//                 mat4 Q3_j = formatQ(uC[j]);
//                 mat3 refle = rayQ3(P, R, Q1_j, Q2_j, Q3_j, 1);
//                 float reflect_tIn = refle[0].x;
//                 float reflect_tOut = refle[0].y;
//                 vec3 P_reflect = refle[1];
//                 vec3 N_reflect = refle[2];
//                 if (reflect_tIn > 0.) {is_in_shadow = true;}
               
//                 if (reflect_tIn > 0. && reflect_tOut < t_refle_min) {
//                     t_refle_min = reflect_tIn;
//                     color_reflect = uMaterials[j];
//                 }
//             }

//             color += color_reflect * material * .5; 

//             if(!is_in_shadow) {
//                 vec3 d = material * max(0., dot(N, L)) * c_orange;
//                 vec3 E = vec3(0., 0., 1.);
//                 vec3 R = W - 2. * N * dot(N, W);
//                 vec3 s = 1.2 * material * pow(max(0., dot(R, L)), 8.);
//                 color += opacity * (d + s);
//             }
//         }
//     }


//     gl_FragColor = vec4(pow(color, vec3(1. / 2.2)), 1.);
// }`;

// DECLARE GL-RELATED VARIABLES AND MATRIX OBJECT

let gl = start_gl(canvas1, vertexShader, fragmentShader);
let uColor       = gl.getUniformLocation(gl.program, "uColor"      );
let uInvMatrix   = gl.getUniformLocation(gl.program, "uInvMatrix"  );
let uMatrix      = gl.getUniformLocation(gl.program, "uMatrix"     );
let uOpacity     = gl.getUniformLocation(gl.program, "uOpacity"    );
let uSampler     = gl.getUniformLocation(gl.program, "uSampler"    );
let uTexture     = gl.getUniformLocation(gl.program, "uTexture"    );
let uBumpTexture = gl.getUniformLocation(gl.program, "uBumpTexture");
let M = new Matrix();

gl.uniform1iv(uSampler, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);

// LOAD A TEXTURE IMAGE

let animatedSource = [];

let texture = (index, source) => {
   if (typeof source == 'string') {

      // IF THE TEXTURE SOURCE IS AN IMAGE FILE, IT ONLY NEEDS TO BE SENT TO THE GPU ONCE.

      let image = new Image();
      image.onload = () => {
         gl.activeTexture (gl.TEXTURE0 + index);
         gl.bindTexture   (gl.TEXTURE_2D, gl.createTexture());
         gl.texImage2D    (gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
         gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_NEAREST);
         gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
         gl.generateMipmap(gl.TEXTURE_2D);
      }
      image.src = source;
   }
   else {

      // IF THE TEXTURE SOURCE IS ANYTHING ELSE, ITS CONTENT CAN CHANGE AT EVERY ANIMATION FRAME.

      gl.activeTexture (gl.TEXTURE0 + index);
      gl.bindTexture   (gl.TEXTURE_2D, gl.createTexture());
      gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      animatedSource[index] = source;
   }
}

// DRAW A SINGLE SHAPE TO THE WEBGL CANVAS

let draw = (Shape, color, opacity, texture, bumpTexture) => {

   // IF THIS IS AN ANIMATED TEXTURE SOURCE, SEND THE TEXTURE TO THE GPU AT EVERY ANIMATION FRAME.

   if (animatedSource[texture]) {
      gl.activeTexture(gl.TEXTURE0 + texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, animatedSource[texture]);
   }

   gl.uniform1f       (uOpacity    , opacity===undefined ? 1 : opacity);
   gl.uniform1i       (uTexture    , texture===undefined ? -1 : texture);
   gl.uniform1i       (uBumpTexture, bumpTexture===undefined ? -1 : bumpTexture);
   gl.uniform3fv      (uColor      , color );
   gl.uniformMatrix4fv(uInvMatrix  , false, mInverse(M.get()));
   gl.uniformMatrix4fv(uMatrix     , false, M.get()          );
   gl.bufferData(gl.ARRAY_BUFFER, Shape.mesh, gl.STATIC_DRAW);
   gl.drawArrays(Shape.type ? gl.TRIANGLE_STRIP : gl.TRIANGLES, 0, Shape.mesh.length / vertexSize);
   return M;
}

