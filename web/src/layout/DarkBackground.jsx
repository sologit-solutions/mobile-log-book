import React from "react";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

export default function DarkBackground() {
    return (
        <div className="bgShader" aria-hidden="true">
            <ShaderGradientCanvas
                style={{ position: "absolute", inset: 0 }}
                pixelDensity={1}
                fov={45}
            >
                <ShaderGradient
                    animate="on"
                    type="waterPlane"
                    brightness={0.3}
                    color1="#000000"
                    color2="#00008b"
                    color3="#508cad"
                    reflection={0.06}

                    uAmplitude={3.2}
                    uDensity={1.0}
                    uFrequency={3.0}
                    uSpeed={0.25}
                    uStrength={1.1}

                    cDistance={3.6}
                    cPolarAngle={90}
                    cAzimuthAngle={180}
                    rotationX={0}
                    rotationY={10}
                    rotationZ={50}

                    wireframe={false}
                    grain="off"
                />
            </ShaderGradientCanvas>
        </div>
    );
}

