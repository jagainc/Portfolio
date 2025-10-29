/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import './MetallicText.css';

const defaultParams = {
  patternScale: 2,
  refraction: 0.015,
  edge: 1,
  patternBlur: 0.005,
  liquid: 0.07,
  speed: 0.3
};

const vertexShaderSource = `#version 300 es
precision mediump float;
in vec2 a_position;
out vec2 vUv;
void main() {
  vUv = .5 * (a_position + 1.);
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const liquidFragSource = `#version 300 es
precision mediump float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D u_image_texture;
uniform float u_time;
uniform float u_ratio;
uniform float u_img_ratio;
uniform float u_patternScale;
uniform float u_refraction;
uniform float u_edge;
uniform float u_patternBlur;
uniform float u_liquid;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

vec3 mod289(vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec2 mod289(vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec3 permute(vec3 x) { return mod289(((x*34.)+1.)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1., 0.) : vec2(0., 1.);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.);
  m = m*m;
  m = m*m;
  vec3 x = 2. * fract(p * C.www) - 1.;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130. * dot(m, g);
}

vec2 get_img_uv() {
  vec2 img_uv = vUv;
  img_uv -= .5;
  if (u_ratio > u_img_ratio) {
    img_uv.x = img_uv.x * u_ratio / u_img_ratio;
  } else {
    img_uv.y = img_uv.y * u_img_ratio / u_ratio;
  }
  float scale_factor = 1.;
  img_uv *= scale_factor;
  img_uv += .5;
  img_uv.y = 1. - img_uv.y;
  return img_uv;
}

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float get_color_channel(float c1, float c2, float stripe_p, vec3 w, float extra_blur, float b) {
  float ch = c2;
  float border = 0.;
  float blur = u_patternBlur + extra_blur;
  ch = mix(ch, c1, smoothstep(.0, blur, stripe_p));
  border = w[0];
  ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));
  b = smoothstep(.2, .8, b);
  border = w[0] + .4 * (1. - b) * w[1];
  ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));
  border = w[0] + .5 * (1. - b) * w[1];
  ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));
  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));
  float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
  float gradient = mix(c1, c2, smoothstep(0., 1., gradient_t));
  ch = mix(ch, gradient, smoothstep(border - blur, border + blur, stripe_p));
  return ch;
}

float get_img_frame_alpha(vec2 uv, float img_frame_width) {
  float img_frame_alpha = smoothstep(0., img_frame_width, uv.x) * smoothstep(1., 1. - img_frame_width, uv.x);
  img_frame_alpha *= smoothstep(0., img_frame_width, uv.y) * smoothstep(1., 1. - img_frame_width, uv.y);
  return img_frame_alpha;
}

void main() {
  vec2 uv = vUv;
  uv.y = 1. - uv.y;
  uv.x *= u_ratio;
  float diagonal = uv.x - uv.y;
  float t = .001 * u_time;
  vec2 img_uv = get_img_uv();
  vec4 img = texture(u_image_texture, img_uv);
  vec3 color = vec3(0.);
  float opacity = 1.;
  vec3 color1 = vec3(.92, .92, .92);
  vec3 color2 = vec3(.18, .18, .18);
  float edge = smoothstep(0.3, 0.7, img.r);
  vec2 grad_uv = uv;
  grad_uv -= .5;
  float dist = length(grad_uv + vec2(0., .2 * diagonal));
  grad_uv = rotate(grad_uv, (.25 - .2 * diagonal) * PI);
  float bulge = pow(1.8 * dist, 1.2);
  bulge = 1. - bulge;
  bulge *= pow(uv.y, .3);
  float cycle_width = u_patternScale;
  float thin_strip_1_ratio = .12 / cycle_width * (1. - .4 * bulge);
  float thin_strip_2_ratio = .07 / cycle_width * (1. + .4 * bulge);
  float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);
  float thin_strip_1_width = cycle_width * thin_strip_1_ratio;
  float thin_strip_2_width = cycle_width * thin_strip_2_ratio;
  opacity = 1. - smoothstep(.7 - .3 * u_edge, .9 - .3 * u_edge, edge);
  opacity *= get_img_frame_alpha(img_uv, 0.01);
  float noise = snoise(uv - t);
  edge += (1. - edge) * u_liquid * noise;
  float refr = 0.;
  refr += (1. - bulge);
  refr = clamp(refr, 0., 1.);
  float dir = grad_uv.x;
  dir += diagonal;
  dir -= 2. * noise * diagonal * (smoothstep(0., 1., edge) * smoothstep(1., 0., edge));
  bulge *= clamp(pow(uv.y, .1), .3, 1.);
  dir *= (.1 + (1.1 - edge) * bulge);
  dir *= smoothstep(1., .7, edge);
  dir += .18 * (smoothstep(.1, .2, uv.y) * smoothstep(.4, .2, uv.y));
  dir += .03 * (smoothstep(.1, .2, 1. - uv.y) * smoothstep(.4, .2, 1. - uv.y));
  dir *= (.5 + .5 * pow(uv.y, 2.));
  dir *= cycle_width;
  dir -= t;
  float refr_r = refr;
  refr_r += .01 * bulge * noise;
  float refr_b = 1.1 * refr;
  refr_r += 2. * (smoothstep(-.1, .2, uv.y) * smoothstep(.5, .1, uv.y)) * (smoothstep(.4, .6, bulge) * smoothstep(1., .4, bulge));
  refr_r -= diagonal * 0.5;
  refr_b += (smoothstep(0., .4, uv.y) * smoothstep(.8, .1, uv.y)) * (smoothstep(.4, .6, bulge) * smoothstep(.8, .4, bulge));
  refr_b -= .1 * edge;
  refr_r *= u_refraction;
  refr_b *= u_refraction;
  vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
  w[1] -= .02 * smoothstep(.0, 1., edge + bulge);
  float stripe = mod(dir, 1.);
  float metallic = get_color_channel(color1.r, color2.r, stripe, w, 0.01, bulge);
  float r = metallic;
  float g = metallic;
  float b = metallic;
  color = vec3(r, g, b);
  color *= opacity;
  fragColor = vec4(color, opacity);
}`;

function createTextTexture(text, fontSize = 200) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size with higher resolution for smoother edges
  const scale = 2;
  canvas.width = 1000 * scale;
  canvas.height = 400 * scale;
  
  // Scale context for high DPI
  ctx.scale(scale, scale);
  
  // Enable text smoothing
  ctx.textRenderingOptimization = 'optimizeQuality';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Clear canvas with white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 1000, 400);
  
  // Set text properties with rounded font
  ctx.fillStyle = 'black';
  ctx.font = `${fontSize}px "SF Pro Rounded", "Helvetica Neue", "Arial Rounded MT Bold", "Nunito Sans", "Poppins", -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Add subtle shadow for smoother edges
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  // Draw text multiple times with slight offsets for smoother edges
  const centerX = 500;
  const centerY = 200;
  
  // Main text
  ctx.fillText(text, centerX, centerY);
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  return imageData;
}

export default function MetallicText({ 
  text = "Jagadeesh", 
  fontSize = 200,
  params = defaultParams 
}) {
  const canvasRef = useRef(null);
  const [gl, setGl] = useState(null);
  const [uniforms, setUniforms] = useState({});
  const [textImageData, setTextImageData] = useState(null);
  const totalAnimationTime = useRef(0);
  const lastRenderTime = useRef(0);

  // Create text texture when component mounts or text changes
  useEffect(() => {
    const imageData = createTextTexture(text, fontSize);
    setTextImageData(imageData);
  }, [text, fontSize]);

  function updateUniforms() {
    if (!gl || !uniforms) return;
    gl.uniform1f(uniforms.u_edge, params.edge);
    gl.uniform1f(uniforms.u_patternBlur, params.patternBlur);
    gl.uniform1f(uniforms.u_time, 0);
    gl.uniform1f(uniforms.u_patternScale, params.patternScale);
    gl.uniform1f(uniforms.u_refraction, params.refraction);
    gl.uniform1f(uniforms.u_liquid, params.liquid);
  }

  useEffect(() => {
    function initShader() {
      const canvas = canvasRef.current;
      const gl = canvas?.getContext('webgl2', {
        antialias: true,
        alpha: true
      });
      
      if (!canvas || !gl) {
        return;
      }

      function createShader(gl, sourceCode, type) {
        const shader = gl.createShader(type);
        if (!shader) {
          return null;
        }
        gl.shaderSource(shader, sourceCode);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      }

      const vertexShader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
      const fragmentShader = createShader(gl, liquidFragSource, gl.FRAGMENT_SHADER);
      const program = gl.createProgram();
      
      if (!program || !vertexShader || !fragmentShader) {
        return;
      }
      
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        return null;
      }

      function getUniforms(program, gl) {
        let uniforms = {};
        let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
          let uniformName = gl.getActiveUniform(program, i)?.name;
          if (!uniformName) continue;
          uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
        }
        return uniforms;
      }

      const uniforms = getUniforms(program, gl);
      setUniforms(uniforms);

      const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
      const vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      gl.useProgram(program);
      const positionLocation = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      setGl(gl);
    }

    initShader();
    updateUniforms();
  }, []);

  useEffect(() => {
    if (!gl || !uniforms) return;
    updateUniforms();
  }, [gl, params, uniforms]);

  useEffect(() => {
    if (!gl || !uniforms) return;
    
    let renderId;
    function render(currentTime) {
      const deltaTime = currentTime - lastRenderTime.current;
      lastRenderTime.current = currentTime;
      totalAnimationTime.current += deltaTime * params.speed;
      
      gl.uniform1f(uniforms.u_time, totalAnimationTime.current);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      renderId = requestAnimationFrame(render);
    }
    
    lastRenderTime.current = performance.now();
    renderId = requestAnimationFrame(render);
    
    return () => {
      cancelAnimationFrame(renderId);
    };
  }, [gl, params.speed]);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl || !gl || !uniforms) return;

    function resizeCanvas() {
      if (!canvasEl || !gl || !uniforms || !textImageData) return;
      
      const imgRatio = textImageData.width / textImageData.height;
      gl.uniform1f(uniforms.u_img_ratio, imgRatio);
      
      const width = 800;
      const height = 320;
      canvasEl.width = width * devicePixelRatio;
      canvasEl.height = height * devicePixelRatio;
      canvasEl.style.width = width + 'px';
      canvasEl.style.height = height + 'px';
      
      gl.viewport(0, 0, canvasEl.width, canvasEl.height);
      gl.uniform1f(uniforms.u_ratio, width / height);
      gl.uniform1f(uniforms.u_img_ratio, imgRatio);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [gl, uniforms, textImageData]);

  useEffect(() => {
    if (!gl || !uniforms || !textImageData) return;

    const existingTexture = gl.getParameter(gl.TEXTURE_BINDING_2D);
    if (existingTexture) {
      gl.deleteTexture(existingTexture);
    }

    const imageTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

    try {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        textImageData.width,
        textImageData.height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        textImageData.data
      );
      gl.uniform1i(uniforms.u_image_texture, 0);
    } catch (e) {
      console.error('Error uploading texture:', e);
    }

    return () => {
      if (imageTexture) {
        gl.deleteTexture(imageTexture);
      }
    };
  }, [gl, uniforms, textImageData]);

  return <canvas ref={canvasRef} className="metallic-text-canvas" />;
}