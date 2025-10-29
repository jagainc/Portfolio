import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function TelephoneScene() {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const animationRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!mountRef.current) return;

        try {
            // Scene setup
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x0a0a0a);
            sceneRef.current = scene;

            // Camera setup
            const camera = new THREE.PerspectiveCamera(
                50,
                mountRef.current.clientWidth / mountRef.current.clientHeight,
                0.1,
                1000
            );
            camera.position.set(4, 2, 4);
            camera.lookAt(0, 0, 0);

            // Renderer setup
            const renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: false,
                powerPreference: "high-performance"
            });
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.setClearColor(0x0a0a0a);
            rendererRef.current = renderer;

            mountRef.current.appendChild(renderer.domElement);

            // Enhanced Lighting Setup
            const ambientLight = new THREE.AmbientLight(0xf0f0f0, 0.4);
            scene.add(ambientLight);

            // Key light (main illumination)
            const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
            keyLight.position.set(8, 8, 5);
            keyLight.castShadow = true;
            keyLight.shadow.mapSize.width = 4096;
            keyLight.shadow.mapSize.height = 4096;
            keyLight.shadow.camera.near = 0.5;
            keyLight.shadow.camera.far = 50;
            keyLight.shadow.camera.left = -10;
            keyLight.shadow.camera.right = 10;
            keyLight.shadow.camera.top = 10;
            keyLight.shadow.camera.bottom = -10;
            keyLight.shadow.bias = -0.0001;
            scene.add(keyLight);

            // Fill light (softer, cooler)
            const fillLight = new THREE.DirectionalLight(0x87ceeb, 1.2);
            fillLight.position.set(-5, 3, -5);
            fillLight.castShadow = true;
            fillLight.shadow.mapSize.width = 2048;
            fillLight.shadow.mapSize.height = 2048;
            scene.add(fillLight);

            // Rim light (from behind/below)
            const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
            rimLight.position.set(0, -2, -8);
            scene.add(rimLight);

            // Point light for close-up details
            const pointLight = new THREE.PointLight(0xffffff, 1.0, 10);
            pointLight.position.set(2, 3, 2);
            pointLight.castShadow = true;
            scene.add(pointLight);

            // Create Realistic Handset Only
            const handsetGroup = new THREE.Group();
            handsetGroup.position.set(0, 0, 0);

            // Main handset body (curved ergonomic design)
            const handsetBodyGeometry = new THREE.CapsuleGeometry(0.15, 1.8, 12, 24);
            const handsetMaterial = new THREE.MeshStandardMaterial({
                color: 0x2a2a2a,
                metalness: 0.05,
                roughness: 0.2,
                clearcoat: 0.8,
                clearcoatRoughness: 0.05
            });
            const handsetBody = new THREE.Mesh(handsetBodyGeometry, handsetMaterial);
            handsetBody.rotation.z = Math.PI / 2;
            handsetBody.castShadow = true;
            handsetGroup.add(handsetBody);

            // Earpiece (speaker end) - larger and more detailed
            const earpieceGeometry = new THREE.CylinderGeometry(0.22, 0.18, 0.12, 24);
            const earpieceMaterial = new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                metalness: 0.3,
                roughness: 0.6,
                clearcoat: 0.4
            });
            const earpiece = new THREE.Mesh(earpieceGeometry, earpieceMaterial);
            earpiece.position.set(-0.9, 0, 0);
            earpiece.rotation.z = Math.PI / 2;
            earpiece.castShadow = true;
            handsetGroup.add(earpiece);

            // Earpiece inner grille
            const earpieceInnerGeometry = new THREE.CylinderGeometry(0.16, 0.16, 0.02, 24);
            const earpieceInnerMaterial = new THREE.MeshStandardMaterial({
                color: 0x0a0a0a,
                metalness: 0.8,
                roughness: 0.3
            });
            const earpieceInner = new THREE.Mesh(earpieceInnerGeometry, earpieceInnerMaterial);
            earpieceInner.position.set(-0.9, 0, 0.07);
            earpieceInner.rotation.z = Math.PI / 2;
            handsetGroup.add(earpieceInner);

            // Microphone (speaking end) - tapered design
            const micGeometry = new THREE.CylinderGeometry(0.18, 0.22, 0.12, 24);
            const micMaterial = new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                metalness: 0.3,
                roughness: 0.6,
                clearcoat: 0.4
            });
            const microphone = new THREE.Mesh(micGeometry, micMaterial);
            microphone.position.set(0.9, 0, 0);
            microphone.rotation.z = Math.PI / 2;
            microphone.castShadow = true;
            handsetGroup.add(microphone);

            // Microphone grille holes (more realistic pattern)
            for (let ring = 0; ring < 3; ring++) {
                const ringRadius = 0.06 + ring * 0.03;
                const holesInRing = 6 + ring * 2;

                for (let i = 0; i < holesInRing; i++) {
                    const angle = (i / holesInRing) * Math.PI * 2;
                    const holeGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.03, 8);
                    const holeMaterial = new THREE.MeshStandardMaterial({
                        color: 0x000000,
                        metalness: 0.9,
                        roughness: 0.1
                    });
                    const hole = new THREE.Mesh(holeGeometry, holeMaterial);
                    hole.position.set(
                        0.9 + Math.cos(angle) * ringRadius,
                        Math.sin(angle) * ringRadius,
                        0.08
                    );
                    hole.rotation.z = Math.PI / 2;
                    handsetGroup.add(hole);
                }
            }

            // Speaker grilles on earpiece (circular pattern)
            for (let ring = 0; ring < 4; ring++) {
                const ringRadius = 0.04 + ring * 0.025;
                const holesInRing = ring === 0 ? 1 : 6 + ring * 2;

                for (let i = 0; i < holesInRing; i++) {
                    const angle = (i / holesInRing) * Math.PI * 2;
                    const grillGeometry = new THREE.CylinderGeometry(0.006, 0.006, 0.03, 8);
                    const grillMaterial = new THREE.MeshStandardMaterial({
                        color: 0x000000,
                        metalness: 0.9,
                        roughness: 0.1
                    });
                    const grill = new THREE.Mesh(grillGeometry, grillMaterial);

                    if (ring === 0) {
                        grill.position.set(-0.9, 0, 0.08);
                    } else {
                        grill.position.set(
                            -0.9 + Math.cos(angle) * ringRadius,
                            Math.sin(angle) * ringRadius,
                            0.08
                        );
                    }
                    grill.rotation.z = Math.PI / 2;
                    handsetGroup.add(grill);
                }
            }

            // Handset grip texture (subtle ridges)
            for (let i = 0; i < 8; i++) {
                const ridgeGeometry = new THREE.TorusGeometry(0.16, 0.005, 4, 16);
                const ridgeMaterial = new THREE.MeshStandardMaterial({
                    color: 0x1a1a1a,
                    metalness: 0.1,
                    roughness: 0.8
                });
                const ridge = new THREE.Mesh(ridgeGeometry, ridgeMaterial);
                ridge.position.set((i - 4) * 0.15, 0, 0);
                ridge.rotation.y = Math.PI / 2;
                handsetGroup.add(ridge);
            }

            // Cord connection point
            const cordConnectorGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.15, 12);
            const cordConnectorMaterial = new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                metalness: 0.4,
                roughness: 0.5
            });
            const cordConnector = new THREE.Mesh(cordConnectorGeometry, cordConnectorMaterial);
            cordConnector.position.set(0, 0, -0.2);
            cordConnector.castShadow = true;
            handsetGroup.add(cordConnector);

            // Brand marking on handset
            const brandGeometry = new THREE.BoxGeometry(0.3, 0.02, 0.08);
            const brandMaterial = new THREE.MeshStandardMaterial({
                color: 0x666666,
                metalness: 0.2,
                roughness: 0.4
            });
            const brand = new THREE.Mesh(brandGeometry, brandMaterial);
            brand.position.set(0, 0, 0.16);
            handsetGroup.add(brand);

            scene.add(handsetGroup);

            // Create Floating Orbs
            const orbsGroup = new THREE.Group();
            const orbs = [];

            for (let i = 0; i < 8; i++) {
                const radius = 2.5 + Math.random() * 1.5;
                const angle = (i / 8) * Math.PI * 2;
                const height = (Math.random() - 0.5) * 2;
                const size = 0.08 + Math.random() * 0.15;

                const orbGeometry = new THREE.SphereGeometry(size, 32, 32);
                const orbMaterial = new THREE.MeshStandardMaterial({
                    color: 0xe0e0e0,
                    metalness: 1.0,
                    roughness: 0.05,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.0
                });
                const orb = new THREE.Mesh(orbGeometry, orbMaterial);
                orb.position.set(
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                );
                orb.castShadow = true;
                orbsGroup.add(orb);
                orbs.push({
                    mesh: orb,
                    originalPosition: orb.position.clone(),
                    floatSpeed: 0.5 + Math.random() * 0.5,
                    floatOffset: Math.random() * Math.PI * 2,
                    rotationSpeed: 0.3 + Math.random() * 0.4
                });
            }

            scene.add(orbsGroup);

            // Realistic Reflective Ground
            const groundGeometry = new THREE.PlaneGeometry(30, 30);
            const groundMaterial = new THREE.MeshStandardMaterial({
                color: 0x0a0a0a,
                metalness: 0.9,
                roughness: 0.1
            });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.position.y = -1.2;
            ground.receiveShadow = true;
            scene.add(ground);

            // Mouse controls
            let mouseX = 0;
            let mouseY = 0;
            let targetRotationX = 0;
            let targetRotationY = 0;

            const handleMouseMove = (event) => {
                const rect = mountRef.current.getBoundingClientRect();
                mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
                targetRotationY = mouseX * 0.3;
                targetRotationX = mouseY * 0.2;
            };

            mountRef.current.addEventListener('mousemove', handleMouseMove);

            // Animation loop
            const animate = () => {
                animationRef.current = requestAnimationFrame(animate);

                const time = Date.now() * 0.001;

                // Animate handset (gentle floating and rotation)
                handsetGroup.rotation.y = Math.sin(time * 0.3) * 0.1 + targetRotationY * 0.1;
                handsetGroup.rotation.x = Math.sin(time * 0.2) * 0.05 + targetRotationX * 0.1;
                handsetGroup.position.y = Math.sin(time * 0.4) * 0.1;

                // Animate orbs
                orbsGroup.rotation.y = time * 0.15;
                orbs.forEach((orbData) => {
                    const { mesh, originalPosition, floatSpeed, floatOffset, rotationSpeed } = orbData;
                    mesh.position.y = originalPosition.y + Math.sin(time * floatSpeed + floatOffset) * 0.3;
                    mesh.rotation.x = time * rotationSpeed;
                    mesh.rotation.z = time * rotationSpeed * 0.7;
                });

                renderer.render(scene, camera);
            };

            animate();
            setIsLoaded(true);

            // Handle resize
            const handleResize = () => {
                if (!mountRef.current || !renderer || !camera) return;

                const width = mountRef.current.clientWidth;
                const height = mountRef.current.clientHeight;

                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            };

            window.addEventListener('resize', handleResize);

            // Cleanup function
            return () => {
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                }
                if (mountRef.current && renderer.domElement) {
                    mountRef.current.removeChild(renderer.domElement);
                }
                if (mountRef.current) {
                    mountRef.current.removeEventListener('mousemove', handleMouseMove);
                }
                window.removeEventListener('resize', handleResize);
                renderer.dispose();

                // Dispose geometries and materials
                scene.traverse((object) => {
                    if (object.geometry) object.geometry.dispose();
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach(material => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                });
            };

        } catch (err) {
            console.error('TelephoneScene error:', err);
            setError(err.message);
        }
    }, []);

    if (error) {
        return (
            <div style={{
                width: '100%',
                height: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#111',
                borderRadius: '15px',
                color: '#8a8aff',
                fontSize: '14px',
                textAlign: 'center'
            }}>
                <div>
                    <div>⚠️ 3D Scene Error</div>
                    <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '5px' }}>
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            width: '100%',
            height: '400px',
            position: 'relative',
            borderRadius: '15px',
            overflow: 'hidden',
            background: '#111'
        }}>
            <div
                ref={mountRef}
                style={{
                    width: '100%',
                    height: '100%',
                    cursor: 'grab'
                }}
            />
            {!isLoaded && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#8a8aff',
                    fontSize: '14px',
                    fontWeight: '500'
                }}>
                    Loading 3D Scene...
                </div>
            )}
        </div>
    );
}