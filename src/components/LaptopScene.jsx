import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function LaptopScene() {
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
                45,
                mountRef.current.clientWidth / mountRef.current.clientHeight,
                0.1,
                100
            );
            camera.position.set(0, 1, 3);

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
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
            scene.add(ambientLight);

            const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
            keyLight.position.set(3, 4, 5);
            keyLight.castShadow = true;
            keyLight.shadow.mapSize.width = 2048;
            keyLight.shadow.mapSize.height = 2048;
            scene.add(keyLight);

            const rimLight = new THREE.PointLight(0x88ccff, 0.8);
            rimLight.position.set(-3, 2, -2);
            scene.add(rimLight);

            // Create Laptop
            const laptopGroup = new THREE.Group();

            // Laptop base (bottom part)
            const baseGeometry = new THREE.BoxGeometry(3.2, 0.15, 2.2);
            const baseMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xe8e8e8,
                metalness: 0.7,
                roughness: 0.2,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
            });
            const laptopBase = new THREE.Mesh(baseGeometry, baseMaterial);
            laptopBase.position.set(0, -0.5, 0);
            laptopBase.castShadow = true;
            laptopBase.receiveShadow = true;
            laptopGroup.add(laptopBase);

            // Laptop screen (lid)
            const screenGeometry = new THREE.BoxGeometry(3.0, 2.0, 0.1);
            const screenMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xe8e8e8,
                metalness: 0.7,
                roughness: 0.2,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
            });
            const laptopScreen = new THREE.Mesh(screenGeometry, screenMaterial);
            laptopScreen.position.set(0, 0.5, -1.0);
            laptopScreen.rotation.x = -Math.PI * 0.15; // Slight tilt
            laptopScreen.castShadow = true;
            laptopScreen.receiveShadow = true;
            laptopGroup.add(laptopScreen);

            // Screen display (black screen)
            const displayGeometry = new THREE.PlaneGeometry(2.8, 1.8);
            const displayMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.9,
            });
            const display = new THREE.Mesh(displayGeometry, displayMaterial);
            display.position.set(0, 0.5, -0.95);
            display.rotation.x = -Math.PI * 0.15;
            laptopGroup.add(display);

            // GitScroll interface on screen
            const interfaceGroup = new THREE.Group();

            // Terminal window
            const terminalGeometry = new THREE.PlaneGeometry(2.4, 1.4);
            const terminalMaterial = new THREE.MeshBasicMaterial({
                color: 0x1a1a1a,
                transparent: true,
                opacity: 0.9,
            });
            const terminal = new THREE.Mesh(terminalGeometry, terminalMaterial);
            terminal.position.set(0, 0, 0.001);
            interfaceGroup.add(terminal);

            // Terminal header
            const headerGeometry = new THREE.PlaneGeometry(2.4, 0.2);
            const headerMaterial = new THREE.MeshBasicMaterial({
                color: 0x333333,
                transparent: true,
                opacity: 0.9,
            });
            const header = new THREE.Mesh(headerGeometry, headerMaterial);
            header.position.set(0, 0.6, 0.002);
            interfaceGroup.add(header);

            // Git commit lines (simulating git log)
            const lineGeometry = new THREE.PlaneGeometry(2.0, 0.08);
            const lineMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                transparent: true,
                opacity: 0.8,
            });

            for (let i = 0; i < 8; i++) {
                const line = new THREE.Mesh(lineGeometry, lineMaterial);
                line.position.set(0, 0.3 - i * 0.15, 0.002);
                interfaceGroup.add(line);
            }

            // Add interface to display
            interfaceGroup.position.set(0, 0.5, -0.94);
            interfaceGroup.rotation.x = -Math.PI * 0.15;
            laptopGroup.add(interfaceGroup);

            // Keyboard
            const keyboardGeometry = new THREE.BoxGeometry(2.6, 0.05, 1.6);
            const keyboardMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xf0f0f0,
                metalness: 0.1,
                roughness: 0.8,
            });
            const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
            keyboard.position.set(0, -0.4, 0.2);
            keyboard.castShadow = true;
            laptopGroup.add(keyboard);

            // Individual keys
            const keyGeometry = new THREE.BoxGeometry(0.12, 0.02, 0.12);
            const keyMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                metalness: 0.1,
                roughness: 0.6,
            });

            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 12; col++) {
                    const key = new THREE.Mesh(keyGeometry, keyMaterial);
                    key.position.set(
                        (col - 5.5) * 0.15,
                        -0.37,
                        (row - 2) * 0.15 + 0.2
                    );
                    key.castShadow = true;
                    laptopGroup.add(key);
                }
            }

            // Trackpad
            const trackpadGeometry = new THREE.BoxGeometry(1.2, 0.02, 0.8);
            const trackpadMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xe0e0e0,
                metalness: 0.3,
                roughness: 0.4,
            });
            const trackpad = new THREE.Mesh(trackpadGeometry, trackpadMaterial);
            trackpad.position.set(0, -0.39, 0.6);
            trackpad.castShadow = true;
            laptopGroup.add(trackpad);

            scene.add(laptopGroup);

            // Create floating code particles
            const particlesGroup = new THREE.Group();
            const particles = [];

            for (let i = 0; i < 20; i++) {
                const particleGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
                const particleMaterial = new THREE.MeshBasicMaterial({
                    color: new THREE.Color().setHSL(0.3 + Math.random() * 0.4, 0.8, 0.6),
                    transparent: true,
                    opacity: 0.7,
                });
                const particle = new THREE.Mesh(particleGeometry, particleMaterial);

                const radius = 4 + Math.random() * 2;
                const angle = Math.random() * Math.PI * 2;
                const height = (Math.random() - 0.5) * 3;

                particle.position.set(
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                );

                particlesGroup.add(particle);
                particles.push({
                    mesh: particle,
                    originalPosition: particle.position.clone(),
                    floatSpeed: 0.5 + Math.random() * 0.5,
                    floatOffset: Math.random() * Math.PI * 2
                });
            }

            scene.add(particlesGroup);

            // Ground
            const groundGeometry = new THREE.PlaneGeometry(10, 10);
            const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.position.y = -1.0;
            ground.receiveShadow = true;
            scene.add(ground);

            // Interactive controls
            let isDragging = false;
            let previousMousePosition = { x: 0, y: 0 };
            let targetRotation = { x: 0, y: 0 };
            let currentRotation = { x: 0, y: 0 };
            let isHovered = false;

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

                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObject(laptopGroup, true);

                if (intersects.length > 0 && !isDragging) {
                    if (!isHovered) {
                        mountRef.current.style.cursor = 'grab';
                        isHovered = true;
                        laptopGroup.scale.set(1.05, 1.05, 1.05);
                    }
                } else if (!isDragging) {
                    if (isHovered) {
                        mountRef.current.style.cursor = 'default';
                        isHovered = false;
                        laptopGroup.scale.set(1, 1, 1);
                    }
                }

                if (isDragging) {
                    const deltaMove = {
                        x: event.clientX - previousMousePosition.x,
                        y: event.clientY - previousMousePosition.y
                    };

                    targetRotation.y += deltaMove.x * 0.01;
                    targetRotation.x += deltaMove.y * 0.01;

                    targetRotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetRotation.x));

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
                laptopGroup.scale.set(1, 1, 1);
            };

            // Add event listeners
            mountRef.current.addEventListener('mousedown', handleMouseDown);
            mountRef.current.addEventListener('mousemove', handleMouseMove);
            mountRef.current.addEventListener('mouseup', handleMouseUp);
            mountRef.current.addEventListener('mouseleave', handleMouseLeave);

            // Animation loop
            const animate = () => {
                animationRef.current = requestAnimationFrame(animate);

                const time = Date.now() * 0.001;

                // Smooth rotation interpolation
                currentRotation.x += (targetRotation.x - currentRotation.x) * 0.1;
                currentRotation.y += (targetRotation.y - currentRotation.y) * 0.1;

                // Apply rotation with auto-rotation when not dragging
                if (!isDragging) {
                    laptopGroup.rotation.y = currentRotation.y + time * 0.1;
                    laptopGroup.rotation.x = currentRotation.x + Math.sin(time * 0.5) * 0.02;
                } else {
                    laptopGroup.rotation.y = currentRotation.y;
                    laptopGroup.rotation.x = currentRotation.x;
                }

                // Animate git commit lines
                interfaceGroup.children.forEach((child, index) => {
                    if (index > 1) { // Skip terminal and header
                        child.material.opacity = 0.5 + Math.sin(time * 2 + index * 0.5) * 0.3;
                    }
                });

                // Animate particles
                particlesGroup.rotation.y = time * 0.1;
                particles.forEach((particleData) => {
                    const { mesh, originalPosition, floatSpeed, floatOffset } = particleData;
                    mesh.position.y = originalPosition.y + Math.sin(time * floatSpeed + floatOffset) * 0.2;
                    mesh.rotation.x = time * 0.5;
                    mesh.rotation.z = time * 0.3;
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
                    mountRef.current.removeEventListener('mousedown', handleMouseDown);
                    mountRef.current.removeEventListener('mousemove', handleMouseMove);
                    mountRef.current.removeEventListener('mouseup', handleMouseUp);
                    mountRef.current.removeEventListener('mouseleave', handleMouseLeave);
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
            console.error('LaptopScene error:', err);
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
                    Loading 3D Laptop...
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
                Drag to rotate •
            </div>
        </div>
    );
}