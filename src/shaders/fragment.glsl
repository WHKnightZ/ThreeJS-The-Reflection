uniform sampler2D uTexture;

varying vec2 vUv;

vec3 lerp(vec3 v1, vec3 v2, float t) {
    return v1 + (v2 - v1) * t;
}

const float threshold = 0.92f;
const float factor = 1.0f / ((1.0f - threshold) * (1.0f - threshold));

void main() {
    vec3 texture = texture2D(uTexture, vUv).rgb;
    vec3 white = vec3(0.95f, 0.95f, 1.00f);
    vec3 blue = vec3(0.12f, 0.44f, 1.00f);
    float newTime = (vUv.y - threshold) * (vUv.y - threshold) * factor;
    vec3 waterFilterColor = lerp(white, blue, vUv.y < threshold ? 1.0f : (1.0f - newTime));
    float waterOpacity = vUv.y > threshold ? 0.5f + 0.2f * newTime : 0.5f;
    float textureOpacity = 1.0f - waterOpacity;

    texture.x = waterFilterColor.x * waterOpacity + texture.x * textureOpacity;
    texture.y = waterFilterColor.y * waterOpacity + texture.y * textureOpacity;
    texture.z = waterFilterColor.z * waterOpacity + texture.z * textureOpacity;

    gl_FragColor = vec4(texture, 1.0f);
}