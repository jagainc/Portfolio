import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function SilverOrbScene() {
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
                100
            );
            camera.position.set(0, 0, 3);

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

            // Lighting setup
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
            scene.add(ambientLight);

            // Key light
            const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
            keyLight.position.set(2, 3, 5);
            keyLight.castShadow = true;
            keyLight.shadow.mapSize.width = 2048;
            keyLight.shadow.mapSize.height = 2048;
            scene.add(keyLight);

            // Rim lights for extra shine
            const rimLight1 = new THREE.PointLight(0x88ccff, 0.8);
            rimLight1.position.set(-3, 1, -2);
            scene.add(rimLight1);

            const rimLight2 = new THREE.PointLight(0xffaa88, 0.6);
            rimLight2.position.set(3, -1, 2);
            scene.add(rimLight2);

            // Create main silver orb
            const orbGroup = new THREE.Group();

            // Main orb geometry with high detail for smooth reflections
            const orbGeometry = new THREE.SphereGeometry(1, 64, 64);
            const orbMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xf0f0f0,
                metalness: 1.0,
                roughness: 0.05,
                clearcoat: 1.0,
                clearcoatRoughness: 0.0,
                reflectivity: 1.0,
                envMapIntensity: 1.5,
            });
            const mainOrb = new THREE.Mesh(orbGeometry, orbMaterial);
            mainOrb.castShadow = true;
            mainOrb.receiveShadow = true;
            orbGroup.add(mainOrb);

            // Create environment map for reflections
            const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
            const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
            scene.add(cubeCamera);
            orbMaterial.envMap = cubeRenderTarget.texture;

            // Add smaller orbiting orbs
            const smallOrbs = [];
            for (let i = 0; i < 6; i++) {
                const smallOrbGeometry = new THREE.SphereGeometry(0.1, 32, 32);
                const smallOrbMaterial = new THREE.MeshPhysicalMaterial({
                    color: 0xe8e8e8,
                    metalness: 0.9,
                    roughness: 0.1,
                    clearcoat: 1.0,
                });
                const smallOrb = new THREE.Mesh(smallOrbGeometry, smallOrbMaterial);
                
                const angle = (i / 6) * Math.PI * 2;
                const radius = 2;
                smallOrb.position.set(
                    Math.cos(angle) * radius,
                    Math.sin(angle * 0.5) * 0.5,
                    Math.sin(angle) * radius
                );
                
                smallOrb.castShadow = true;
                orbGroup.add(smallOrb);
                smallOrbs.push({
                    mesh: smallOrb,
                    angle: angle,
                    radius: radius,
                    speed: 0.5 + Math.random() * 0.5
                });
            }

            scene.add(orbGroup);

            // Create floating particles
            const particlesGroup = new THREE.Group();
            const particles = [];

            for (let i = 0; i < 30; i++) {
                const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
                const particleMaterial = new THREE.MeshBasicMaterial({
                    color: new THREE.Color().setHSL(0.6, 0.3, 0.8),
                    transparent: true,
                    opacity: 0.6,
                });
                const particle = new THREE.Mesh(particleGeometry, particleMaterial);
                
                const radius = 3 + Math.random() * 2;
                const angle = Math.random() * Math.PI * 2;
                const height = (Math.random() - 0.5) * 4;
                
                particle.position.set(
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                );
                
                particlesGroup.add(particle);
                particles.push({
                    mesh: particle,
                    originalPosition: particle.position.clone(),
                    floatSpeed: 0.3 + Math.random() * 0.4,
                    floatOffset: Math.random() * Math.PI * 2
                });
            }

            scene.add(particlesGroup);

            // Ground for reflections
            const groundGeometry = new THREE.PlaneGeometry(10, 10);
            const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.4 });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.position.y = -1.5;
            ground.receiveShadow = true;
            scene.add(ground);

            // Interactive controls
            let isDragging = false;
            let previousMousePosition = { x: 0, y: 0 };
            let targetRotation = { x: 0, y: 0 };
            let currentRotation = { x: 0, y: 0 };
            let isHovered = false;
            let mousePosition = { x: 0, y: 0 };

            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();

            const handleMouseDown = (event) => {
                isDragging = true;
                previousMousePosition = {
                    x: event.clientX,
                    y: event.clientY
                };
                mountRef.current.style.cursor = 'grabbing';
            };

            const handleMouseMove = (event) => {
                const rect = mountRef.current.getBoundingClientRect();
                mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

                // Update mouse position for orb responsiveness
                mousePosition.x = mouse.x;
                mousePosition.y = mouse.y;

                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObject(orbGroup, true);

                if (intersects.length > 0 && !isDragging) {
                    if (!isHovered) {
                        mountRef.current.style.cursor = 'grab';
                        isHovered = true;
                        orbGroup.scale.set(1.1, 1.1, 1.1);
                    }
                } else if (!isDragging) {
                    if (isHovered) {
                        mountRef.current.style.cursor = 'default';
                        isHovered = false;
                        orbGroup.scale.set(1, 1, 1);
                    }
                }

                if (isDragging) {
                    const deltaMove = {
                        x: event.clientX - previousMousePosition.x,
                        y: event.clientY - previousMousePosition.y
                    };

                    targetRotation.y += deltaMove.x * 0.01;
                    targetRotation.x += deltaMove.y * 0.01;

                    targetRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotation.x));

                    previousMousePosition = {
                        x: event.clientX,
                        y: event.clientY
                    };
                }
            };

            const handleMouseUp = () => {
                isDragging = false;
                mountRef.current.style.cursor = isHovered ? 'grab' : 'default';
            };

            const handleMouseLeave = () => {
                isDragging = false;
                isHovered = false;
                mountRef.current.style.cursor = 'default';
                orbGroup.scale.set(1, 1, 1);
                mousePosition = { x: 0, y: 0 };
            };

            const handleClick = (event) => {
                const rect = mountRef.current.getBoundingClientRect();
                mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObject(orbGroup, true);

                if (intersects.length > 0) {
                    // Orb click effect - pulse and color change
                    orbMaterial.color.setHex(0xaaccff);
                    orbGroup.scale.set(1.2, 1.2, 1.2);
                    
                    setTimeout(() => {
                        orbMaterial.color.setHex(0xf0f0f0);
                        orbGroup.scale.set(isHovered ? 1.1 : 1, isHovered ? 1.1 : 1, isHovered ? 1.1 : 1);
                    }, 300);
                }
            };

            // Add event listeners
            mountRef.current.addEventListener('mousedown', handleMouseDown);
            mountRef.current.addEventListener('mousemove', handleMouseMove);
            mountRef.current.addEventListener('mouseup', handleMouseUp);
            mountRef.current.addEventListener('mouseleave', handleMouseLeave);
            mountRef.current.addEventListener('click', handleClick);

            // Animation loop
            const animate = () => {
                animationRef.current = requestAnimationFrame(animate);

                const time = Date.now() * 0.001;

                // Smooth rotation interpolation
                currentRotation.x += (targetRotation.x - currentRotation.x) * 0.1;
                currentRotation.y += (targetRotation.y - currentRotation.y) * 0.1;

                // Apply rotation with auto-rotation when not dragging
                if (!isDragging) {
                    orbGroup.rotation.y = currentRotation.y + time * 0.3;
                    orbGroup.rotation.x = currentRotation.x + Math.sin(time * 0.5) * 0.1;
                } else {
                    orbGroup.rotation.y = currentRotation.y;
                    orbGroup.rotation.x = currentRotation.x;
                }

                // Responsive orb movement based on mouse position
                mainOrb.position.x = mousePosition.x * 0.2;
                mainOrb.position.y = mousePosition.y * 0.2;

                // Animate orbiting small orbs
                smallOrbs.forEach((orbData, index) => {
                    const { mesh, angle, radius, speed } = orbData;
                    const currentAngle = angle + time * speed;
                    mesh.position.set(
                        Math.cos(currentAngle) * radius,
                        Math.sin(currentAngle * 0.5) * 0.5 + Math.sin(time * 2 + index) * 0.2,
                        Math.sin(currentAngle) * radius
                    );
                    mesh.rotation.y = time * 2;
                });

                // Animate particles
                particlesGroup.rotation.y = time * 0.1;
                particles.forEach((particleData) => {
                    const { mesh, originalPosition, floatSpeed, floatOffset } = particleData;
                    mesh.position.y = originalPosition.y + Math.sin(time * floatSpeed + floatOffset) * 0.3;
                    mesh.material.opacity = 0.3 + Math.sin(time * 2 + floatOffset) * 0.3;
                });

                // Update environment map for reflections
                if (time % 0.1 < 0.016) { // Update every few frames for performance
                    cubeCamera.position.copy(mainOrb.position);
                    cubeCamera.update(renderer, scene);
                }

                // Dynamic lighting based on orb position
                rimLight1.intensity = 0.8 + Math.sin(time * 2) * 0.3;
                rimLight2.intensity = 0.6 + Math.cos(time * 1.5) * 0.2;

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
                    mountRef.current.removeEventListener('mousedown', handleMouseDown);
                    mountRef.current.removeEventListener('mousemove', handleMouseMove);
                    mountRef.current.removeEventListener('mouseup', handleMouseUp);
                    mountRef.current.removeEventListener('mouseleave', handleMouseLeave);
                    mountRef.current.removeEventListener('click', handleClick);
                }
                window.removeEventListener('resize', handleResize);
                renderer.dispose();

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
            console.error('SilverOrbScene error:', err);
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
                background: '#0a0a0a',
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
            background: 'radial-gradient(circle at center, #111, #000)',
            overflow: 'hidden'
        }}>
            <div
                ref={mountRef}
                style={{
                    width: '100%',
                    height: '100%',
                    cursor: 'default',
                    userSelect: 'none'
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
                    Loading Silver Orb...
                </div>
            )}
            <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '12px',
                textAlign: 'center',
                pointerEvents: 'none'
            }}>
                Move mouse to interact • Click to pulse
            </div>
        </div>
    );
}