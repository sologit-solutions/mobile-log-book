import React from "react";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

export default function LightBackground() {
    return (
        <div className="bgShader bgShader--light" aria-hidden="true">
            <ShaderGradientCanvas
                style={{ position: "absolute", inset: 0 }}
                pixelDensity={1}
                fov={45}
            >
                <ShaderGradient
                animate="on"
                axesHelper="off"
                destination="onCanvas"
                embedMode="off"

                color1="#61c8ff"
                color2="#dbfffd"
                color3="#4a8bd4"

                bgColor1="#ffffff"
                bgColor2="#ffffff"
                brightness={1.0}
                reflection={0.15}
                envPreset="dawn"

                pixelDensity={1.5}
                frameRate={24}
                grain="off"

                cAzimuthAngle={180}
                cDistance={3.4}
                cPolarAngle={90}
                cameraZoom={1}
                fov={45}

                type="waterPlane"
                shader="defaults"
                uAmplitude={5.0}
                uDensity={1.2}
                uFrequency={5.0}
                uSpeed={0.25}
                uStrength={1.3}
                />
            </ShaderGradientCanvas>
        </div>
    );
}