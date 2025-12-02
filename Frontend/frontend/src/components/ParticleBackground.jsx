import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as random from 'maath/random'
import * as THREE from 'three'

function Particles({ count = 5000, size = 0.003, radius = 1.2, ...props }) {
    const ref = useRef()
    const [sphere] = useState(() => random.inSphere(new Float32Array(count * 3), { radius }))

    useFrame((state, delta) => {
        // Constant smooth rotation without mouse interaction
        // Rotate on X and Y axes at different slow speeds for a random-feeling drift
        ref.current.rotation.x -= delta / 50 // Much slower
        ref.current.rotation.y -= delta / 70 // Much slower
    })

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#2563EB" // Tailwind blue-600
                    size={size}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
        </group>
    )
}

export default function ParticleBackground() {
    return (
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-blue-50 pointer-events-none">
            <Canvas
                camera={{ position: [0, 0, 1] }}
                eventSource={document.getElementById('root')}
                style={{ pointerEvents: 'none' }} // Canvas itself shouldn't block clicks
            >
                {/* Main field of small particles */}
                <Particles count={4000} size={0.003} />
                {/* Secondary field of larger particles for variation */}
                <Particles count={150} size={0.008} radius={1.2} />
            </Canvas>
        </div>
    )
}
