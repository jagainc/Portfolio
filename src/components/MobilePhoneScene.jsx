import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function MobilePhoneScene() {
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
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
            scene.add(ambientLight);

            const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
            keyLight.position.set(2, 3, 5);
            keyLight.castShadow = true;
            keyLight.shadow.mapSize.width = 2048;
            keyLight.shadow.mapSize.height = 2048;
            scene.add(keyLight);

            const rimLight = new THREE.PointLight(0x88ccff, 0.6);
            rimLight.position.set(-2, 1, -3);
            scene.add(rimLight);

            // Create iPhone
            const phoneGroup = new THREE.Group();

            // iPhone body with rounded edges
            const phoneShape = new THREE.Shape();
            const width = 1.4;
            const height = 2.8;
            const radius = 0.15; // Corner radius

            // Create rounded rectangle shape
            phoneShape.moveTo(-width / 2 + radius, -height / 2);
            phoneShape.lineTo(width / 2 - radius, -height / 2);
            phoneShape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius);
            phoneShape.lineTo(width / 2, height / 2 - radius);
            phoneShape.quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2);
            phoneShape.lineTo(-width / 2 + radius, height / 2);
            phoneShape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - radius);
            phoneShape.lineTo(-width / 2, -height / 2 + radius);
            phoneShape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2);

            const extrudeSettings = {
                depth: 0.12,
                bevelEnabled: true,
                bevelSegments: 8,
                steps: 1,
                bevelSize: 0.02,
                bevelThickness: 0.02
            };

            const phoneGeometry = new THREE.ExtrudeGeometry(phoneShape, extrudeSettings);
            const phoneMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xf5f5f5,
                metalness: 0.8,
                roughness: 0.1,
                clearcoat: 1.0,
                clearcoatRoughness: 0.05,
            });
            const phone = new THREE.Mesh(phoneGeometry, phoneMaterial);
            phone.castShadow = true;
            phone.receiveShadow = true;
            phoneGroup.add(phone);

            // Screen (front glass) with rounded corners
            const screenShape = new THREE.Shape();
            const screenWidth = 1.25;
            const screenHeight = 2.6;
            const screenRadius = 0.12;

            // Create rounded rectangle for screen
            screenShape.moveTo(-screenWidth / 2 + screenRadius, -screenHeight / 2);
            screenShape.lineTo(screenWidth / 2 - screenRadius, -screenHeight / 2);
            screenShape.quadraticCurveTo(screenWidth / 2, -screenHeight / 2, screenWidth / 2, -screenHeight / 2 + screenRadius);
            screenShape.lineTo(screenWidth / 2, screenHeight / 2 - screenRadius);
            screenShape.quadraticCurveTo(screenWidth / 2, screenHeight / 2, screenWidth / 2 - screenRadius, screenHeight / 2);
            screenShape.lineTo(-screenWidth / 2 + screenRadius, screenHeight / 2);
            screenShape.quadraticCurveTo(-screenWidth / 2, screenHeight / 2, -screenWidth / 2, screenHeight / 2 - screenRadius);
            screenShape.lineTo(-screenWidth / 2, -screenHeight / 2 + screenRadius);
            screenShape.quadraticCurveTo(-screenWidth / 2, -screenHeight / 2, -screenWidth / 2 + screenRadius, -screenHeight / 2);

            const screenGeometry = new THREE.ShapeGeometry(screenShape);
            const screenMaterial = new THREE.MeshPhysicalMaterial({
                color: 0x0a0a0a,
                metalness: 0.5,
                roughness: 0.05,
                clearcoat: 1,
                reflectivity: 1,
                transparent: true,
                opacity: 0.95,
            });
            const screen = new THREE.Mesh(screenGeometry, screenMaterial);
            screen.position.z = 0.13;
            phone.add(screen);

            // Incoming Call Screen UI with white background
            const callScreenGroup = new THREE.Group();

            // White background for the entire call screen
            const callBackgroundGeometry = new THREE.PlaneGeometry(screenWidth * 0.95, screenHeight * 0.95);
            const callBackgroundMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.95
            });
            const callBackground = new THREE.Mesh(callBackgroundGeometry, callBackgroundMaterial);
            callBackground.position.set(0, 0, 0.001);
            callScreenGroup.add(callBackground);

            // Status bar area (top)
            const statusBarGeometry = new THREE.PlaneGeometry(screenWidth * 0.9, 0.08);
            const statusBarMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.8
            });
            const statusBar = new THREE.Mesh(statusBarGeometry, statusBarMaterial);
            statusBar.position.set(0, 1.2, 0.002);
            callScreenGroup.add(statusBar);

            // "Incoming call" text area
            const incomingTextGeometry = new THREE.PlaneGeometry(0.8, 0.12);
            const incomingTextMaterial = new THREE.MeshBasicMaterial({
                color: 0x666666,
                transparent: true,
                opacity: 0.9
            });
            const incomingText = new THREE.Mesh(incomingTextGeometry, incomingTextMaterial);
            incomingText.position.set(0, 0.9, 0.002);
            callScreenGroup.add(incomingText);

            // Contact avatar (profile picture area)
            const avatarGeometry = new THREE.CircleGeometry(0.4, 32);
            const avatarMaterial = new THREE.MeshBasicMaterial({
                color: 0x007AFF,
                transparent: true,
                opacity: 0.8
            });
            const avatar = new THREE.Mesh(avatarGeometry, avatarMaterial);
            avatar.position.set(0, 0.3, 0.002);
            callScreenGroup.add(avatar);

            // Contact initial/icon inside avatar
            const initialGeometry = new THREE.RingGeometry(0.18, 0.28, 8);
            const initialMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 1
            });
            const initial = new THREE.Mesh(initialGeometry, initialMaterial);
            initial.position.set(0, 0.3, 0.003);
            callScreenGroup.add(initial);

            // Contact name area
            const nameAreaGeometry = new THREE.PlaneGeometry(1.0, 0.15);
            const nameAreaMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.8
            });
            const nameArea = new THREE.Mesh(nameAreaGeometry, nameAreaMaterial);
            nameArea.position.set(0, -0.2, 0.002);
            callScreenGroup.add(nameArea);

            // Phone number area
            const phoneNumberGeometry = new THREE.PlaneGeometry(0.8, 0.08);
            const phoneNumberMaterial = new THREE.MeshBasicMaterial({
                color: 0x666666,
                transparent: true,
                opacity: 0.7
            });
            const phoneNumber = new THREE.Mesh(phoneNumberGeometry, phoneNumberMaterial);
            phoneNumber.position.set(0, -0.4, 0.002);
            callScreenGroup.add(phoneNumber);

            // Call action buttons area
            const buttonAreaGeometry = new THREE.PlaneGeometry(screenWidth * 0.9, 0.6);
            const buttonAreaMaterial = new THREE.MeshBasicMaterial({
                color: 0xf8f8f8,
                transparent: true,
                opacity: 0.5
            });
            const buttonArea = new THREE.Mesh(buttonAreaGeometry, buttonAreaMaterial);
            buttonArea.position.set(0, -0.9, 0.002);
            callScreenGroup.add(buttonArea);

            // Decline button (red) - left side
            const declineButtonGeometry = new THREE.CircleGeometry(0.28, 32);
            const declineButtonMaterial = new THREE.MeshBasicMaterial({
                color: 0xff3b30,
                transparent: true,
                opacity: 0.9
            });
            const declineButton = new THREE.Mesh(declineButtonGeometry, declineButtonMaterial);
            declineButton.position.set(-0.45, -0.9, 0.003);
            callScreenGroup.add(declineButton);

            // Answer button (green) - right side
            const answerButtonGeometry = new THREE.CircleGeometry(0.28, 32);
            const answerButtonMaterial = new THREE.MeshBasicMaterial({
                color: 0x4cd964,
                transparent: true,
                opacity: 0.9
            });
            const answerButton = new THREE.Mesh(answerButtonGeometry, answerButtonMaterial);
            answerButton.position.set(0.45, -0.9, 0.003);
            callScreenGroup.add(answerButton);

            // Phone icons on buttons
            const phoneIconGeometry = new THREE.RingGeometry(0.1, 0.15, 6);
            const phoneIconMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 1
            });

            // Decline icon (phone with X)
            const declineIcon = new THREE.Mesh(phoneIconGeometry, phoneIconMaterial);
            declineIcon.position.set(-0.45, -0.9, 0.004);
            declineIcon.rotation.z = Math.PI / 4; // Rotate to suggest decline
            callScreenGroup.add(declineIcon);

            // Answer icon (phone)
            const answerIcon = new THREE.Mesh(phoneIconGeometry, phoneIconMaterial);
            answerIcon.position.set(0.45, -0.9, 0.004);
            callScreenGroup.add(answerIcon);

            // Additional UI elements for realism
            // Message and remind buttons (smaller buttons above main buttons)
            const messageButtonGeometry = new THREE.CircleGeometry(0.15, 32);
            const messageButtonMaterial = new THREE.MeshBasicMaterial({
                color: 0xe0e0e0,
                transparent: true,
                opacity: 0.8
            });

            const messageButton = new THREE.Mesh(messageButtonGeometry, messageButtonMaterial);
            messageButton.position.set(-0.25, -0.65, 0.003);
            callScreenGroup.add(messageButton);

            const remindButton = new THREE.Mesh(messageButtonGeometry, messageButtonMaterial);
            remindButton.position.set(0.25, -0.65, 0.003);
            callScreenGroup.add(remindButton);

            // Small icons for message and remind buttons
            const smallIconGeometry = new THREE.RingGeometry(0.05, 0.08, 4);
            const smallIconMaterial = new THREE.MeshBasicMaterial({
                color: 0x666666,
                transparent: true,
                opacity: 0.8
            });

            const messageIcon = new THREE.Mesh(smallIconGeometry, smallIconMaterial);
            messageIcon.position.set(-0.25, -0.65, 0.004);
            callScreenGroup.add(messageIcon);

            const remindIcon = new THREE.Mesh(smallIconGeometry, smallIconMaterial);
            remindIcon.position.set(0.25, -0.65, 0.004);
            callScreenGroup.add(remindIcon);

            screen.add(callScreenGroup);

            // Triple Camera System (iPhone 13 Pro style)
            const cameraModuleGeometry = new THREE.BoxGeometry(0.45, 0.45, 0.08);
            const cameraModuleMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xe0e0e0,
                metalness: 0.9,
                roughness: 0.15,
            });
            const cameraModule = new THREE.Mesh(cameraModuleGeometry, cameraModuleMaterial);
            cameraModule.position.set(0.35, 1.0, -0.06);
            phone.add(cameraModule);

            // Main Camera (top left)
            const mainCameraGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 32);
            const mainCameraMaterial = new THREE.MeshPhysicalMaterial({
                color: 0x000000,
                metalness: 0.9,
                roughness: 0.1,
                clearcoat: 1,
                clearcoatRoughness: 0.0,
            });
            const mainCamera = new THREE.Mesh(mainCameraGeometry, mainCameraMaterial);
            mainCamera.rotation.x = Math.PI / 2;
            mainCamera.position.set(0.25, 1.15, -0.09);
            phone.add(mainCamera);

            // Ultra Wide Camera (top right)
            const ultraWideCamera = new THREE.Mesh(mainCameraGeometry, mainCameraMaterial);
            ultraWideCamera.rotation.x = Math.PI / 2;
            ultraWideCamera.position.set(0.45, 1.15, -0.09);
            phone.add(ultraWideCamera);

            // Telephoto Camera (bottom)
            const telephotoCamera = new THREE.Mesh(mainCameraGeometry, mainCameraMaterial);
            telephotoCamera.rotation.x = Math.PI / 2;
            telephotoCamera.position.set(0.35, 0.95, -0.09);
            phone.add(telephotoCamera);

            // Camera lens rings
            const lensRingGeometry = new THREE.RingGeometry(0.08, 0.095, 32);
            const lensRingMaterial = new THREE.MeshPhysicalMaterial({
                color: 0x333333,
                metalness: 1.0,
                roughness: 0.1,
            });

            const mainLensRing = new THREE.Mesh(lensRingGeometry, lensRingMaterial);
            mainLensRing.rotation.x = Math.PI / 2;
            mainLensRing.position.set(0.25, 1.15, -0.095);
            phone.add(mainLensRing);

            const ultraWideLensRing = new THREE.Mesh(lensRingGeometry, lensRingMaterial);
            ultraWideLensRing.rotation.x = Math.PI / 2;
            ultraWideLensRing.position.set(0.45, 1.15, -0.095);
            phone.add(ultraWideLensRing);

            const telephotoLensRing = new THREE.Mesh(lensRingGeometry, lensRingMaterial);
            telephotoLensRing.rotation.x = Math.PI / 2;
            telephotoLensRing.position.set(0.35, 0.95, -0.095);
            phone.add(telephotoLensRing);

            // Flash and LiDAR
            const flashGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 32);
            const flashMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffcc,
                transparent: true,
                opacity: 0.8
            });
            const flash = new THREE.Mesh(flashGeometry, flashMaterial);
            flash.rotation.x = Math.PI / 2;
            flash.position.set(0.15, 0.95, -0.09);
            phone.add(flash);

            // LiDAR sensor
            const lidarGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 32);
            const lidarMaterial = new THREE.MeshBasicMaterial({
                color: 0x1a1a1a,
                transparent: true,
                opacity: 0.9
            });
            const lidar = new THREE.Mesh(lidarGeometry, lidarMaterial);
            lidar.rotation.x = Math.PI / 2;
            lidar.position.set(0.55, 0.95, -0.09);
            phone.add(lidar);

            // Home button/notch area
            const notchGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.02, 32);
            const notchMaterial = new THREE.MeshPhysicalMaterial({
                color: 0x000000,
                metalness: 0.1,
                roughness: 0.9,
            });
            const notch = new THREE.Mesh(notchGeometry, notchMaterial);
            notch.rotation.x = Math.PI / 2;
            notch.position.set(0, 1.2, 0.062);
            phone.add(notch);

            // Side buttons
            const sideButtonGeometry = new THREE.BoxGeometry(0.05, 0.3, 0.08);
            const sideButtonMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xd0d0d0,
                metalness: 0.8,
                roughness: 0.2,
            });

            // Volume buttons
            const volumeUp = new THREE.Mesh(sideButtonGeometry, sideButtonMaterial);
            volumeUp.position.set(-0.725, 0.3, 0);
            phone.add(volumeUp);

            const volumeDown = new THREE.Mesh(sideButtonGeometry, sideButtonMaterial);
            volumeDown.position.set(-0.725, -0.1, 0);
            phone.add(volumeDown);

            // Power button
            const powerButton = new THREE.Mesh(sideButtonGeometry, sideButtonMaterial);
            powerButton.position.set(0.725, 0.1, 0);
            phone.add(powerButton);

            scene.add(phoneGroup);

            // Glass "Learn More" Button
            const buttonGroup = new THREE.Group();

            // Glass button background
            const glassButtonGeometry = new THREE.BoxGeometry(1.2, 0.4, 0.1);
            const glassButtonMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                metalness: 0.1,
                roughness: 0.05,
                clearcoat: 1.0,
                clearcoatRoughness: 0.0,
                transparent: true,
                opacity: 0.15,
                transmission: 0.9,
                thickness: 0.1,
                ior: 1.5,
            });
            const glassButton = new THREE.Mesh(glassButtonGeometry, glassButtonMaterial);
            glassButton.position.set(0, -2.5, 0);
            glassButton.castShadow = true;
            glassButton.receiveShadow = true;
            buttonGroup.add(glassButton);

            // Button border/frame
            const borderGeometry = new THREE.BoxGeometry(1.22, 0.42, 0.08);
            const borderMaterial = new THREE.MeshPhysicalMaterial({
                color: 0x8a8aff,
                metalness: 0.8,
                roughness: 0.2,
                transparent: true,
                opacity: 0.6,
                emissive: 0x4a4aff,
                emissiveIntensity: 0.1,
            });
            const buttonBorder = new THREE.Mesh(borderGeometry, borderMaterial);
            buttonBorder.position.set(0, -2.5, -0.01);
            buttonGroup.add(buttonBorder);

            // Button text background (for better text visibility)
            const textBackgroundGeometry = new THREE.PlaneGeometry(1.0, 0.2);
            const textBackgroundMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.8,
            });
            const textBackground = new THREE.Mesh(textBackgroundGeometry, textBackgroundMaterial);
            textBackground.position.set(0, -2.5, 0.051);
            buttonGroup.add(textBackground);

            // Button text using simple geometry shapes to spell "LEARN MORE"
            const textMaterial = new THREE.MeshBasicMaterial({
                color: 0x333333,
                transparent: true,
                opacity: 0.9,
            });

            // Create simple text representation using rectangles
            const letterGeometry = new THREE.PlaneGeometry(0.06, 0.12);

            // L
            const L1 = new THREE.Mesh(letterGeometry, textMaterial);
            L1.position.set(-0.42, -2.5, 0.052);
            L1.scale.set(0.3, 1, 1);
            buttonGroup.add(L1);
            const L2 = new THREE.Mesh(letterGeometry, textMaterial);
            L2.position.set(-0.38, -2.56, 0.052);
            L2.scale.set(0.8, 0.3, 1);
            buttonGroup.add(L2);

            // E
            const E1 = new THREE.Mesh(letterGeometry, textMaterial);
            E1.position.set(-0.32, -2.5, 0.052);
            E1.scale.set(0.3, 1, 1);
            buttonGroup.add(E1);
            const E2 = new THREE.Mesh(letterGeometry, textMaterial);
            E2.position.set(-0.28, -2.44, 0.052);
            E2.scale.set(0.8, 0.3, 1);
            buttonGroup.add(E2);
            const E3 = new THREE.Mesh(letterGeometry, textMaterial);
            E3.position.set(-0.28, -2.5, 0.052);
            E3.scale.set(0.6, 0.3, 1);
            buttonGroup.add(E3);
            const E4 = new THREE.Mesh(letterGeometry, textMaterial);
            E4.position.set(-0.28, -2.56, 0.052);
            E4.scale.set(0.8, 0.3, 1);
            buttonGroup.add(E4);

            // A
            const A1 = new THREE.Mesh(letterGeometry, textMaterial);
            A1.position.set(-0.22, -2.5, 0.052);
            A1.scale.set(0.3, 1, 1);
            buttonGroup.add(A1);
            const A2 = new THREE.Mesh(letterGeometry, textMaterial);
            A2.position.set(-0.18, -2.5, 0.052);
            A2.scale.set(0.3, 1, 1);
            buttonGroup.add(A2);
            const A3 = new THREE.Mesh(letterGeometry, textMaterial);
            A3.position.set(-0.2, -2.44, 0.052);
            A3.scale.set(0.8, 0.3, 1);
            buttonGroup.add(A3);
            const A4 = new THREE.Mesh(letterGeometry, textMaterial);
            A4.position.set(-0.2, -2.5, 0.052);
            A4.scale.set(0.6, 0.3, 1);
            buttonGroup.add(A4);

            // R
            const R1 = new THREE.Mesh(letterGeometry, textMaterial);
            R1.position.set(-0.12, -2.5, 0.052);
            R1.scale.set(0.3, 1, 1);
            buttonGroup.add(R1);
            const R2 = new THREE.Mesh(letterGeometry, textMaterial);
            R2.position.set(-0.08, -2.44, 0.052);
            R2.scale.set(0.8, 0.3, 1);
            buttonGroup.add(R2);
            const R3 = new THREE.Mesh(letterGeometry, textMaterial);
            R3.position.set(-0.08, -2.5, 0.052);
            R3.scale.set(0.6, 0.3, 1);
            buttonGroup.add(R3);
            const R4 = new THREE.Mesh(letterGeometry, textMaterial);
            R4.position.set(-0.06, -2.53, 0.052);
            R4.scale.set(0.5, 0.5, 1);
            R4.rotation.z = -0.3;
            buttonGroup.add(R4);

            // N
            const N1 = new THREE.Mesh(letterGeometry, textMaterial);
            N1.position.set(-0.02, -2.5, 0.052);
            N1.scale.set(0.3, 1, 1);
            buttonGroup.add(N1);
            const N2 = new THREE.Mesh(letterGeometry, textMaterial);
            N2.position.set(0.02, -2.5, 0.052);
            N2.scale.set(0.3, 1, 1);
            buttonGroup.add(N2);
            const N3 = new THREE.Mesh(letterGeometry, textMaterial);
            N3.position.set(0, -2.5, 0.052);
            N3.scale.set(0.8, 0.3, 1);
            N3.rotation.z = 0.5;
            buttonGroup.add(N3);

            // M
            const M1 = new THREE.Mesh(letterGeometry, textMaterial);
            M1.position.set(0.12, -2.5, 0.052);
            M1.scale.set(0.3, 1, 1);
            buttonGroup.add(M1);
            const M2 = new THREE.Mesh(letterGeometry, textMaterial);
            M2.position.set(0.16, -2.5, 0.052);
            M2.scale.set(0.3, 1, 1);
            buttonGroup.add(M2);
            const M3 = new THREE.Mesh(letterGeometry, textMaterial);
            M3.position.set(0.2, -2.5, 0.052);
            M3.scale.set(0.3, 1, 1);
            buttonGroup.add(M3);
            const M4 = new THREE.Mesh(letterGeometry, textMaterial);
            M4.position.set(0.14, -2.47, 0.052);
            M4.scale.set(0.4, 0.3, 1);
            M4.rotation.z = -0.3;
            buttonGroup.add(M4);
            const M5 = new THREE.Mesh(letterGeometry, textMaterial);
            M5.position.set(0.18, -2.47, 0.052);
            M5.scale.set(0.4, 0.3, 1);
            M5.rotation.z = 0.3;
            buttonGroup.add(M5);

            // O
            const O1 = new THREE.Mesh(letterGeometry, textMaterial);
            O1.position.set(0.3, -2.5, 0.052);
            O1.scale.set(0.3, 1, 1);
            buttonGroup.add(O1);
            const O2 = new THREE.Mesh(letterGeometry, textMaterial);
            O2.position.set(0.34, -2.5, 0.052);
            O2.scale.set(0.3, 1, 1);
            buttonGroup.add(O2);
            const O3 = new THREE.Mesh(letterGeometry, textMaterial);
            O3.position.set(0.32, -2.44, 0.052);
            O3.scale.set(0.8, 0.3, 1);
            buttonGroup.add(O3);
            const O4 = new THREE.Mesh(letterGeometry, textMaterial);
            O4.position.set(0.32, -2.56, 0.052);
            O4.scale.set(0.8, 0.3, 1);
            buttonGroup.add(O4);

            // R
            const R5 = new THREE.Mesh(letterGeometry, textMaterial);
            R5.position.set(0.4, -2.5, 0.052);
            R5.scale.set(0.3, 1, 1);
            buttonGroup.add(R5);
            const R6 = new THREE.Mesh(letterGeometry, textMaterial);
            R6.position.set(0.44, -2.44, 0.052);
            R6.scale.set(0.8, 0.3, 1);
            buttonGroup.add(R6);
            const R7 = new THREE.Mesh(letterGeometry, textMaterial);
            R7.position.set(0.44, -2.5, 0.052);
            R7.scale.set(0.6, 0.3, 1);
            buttonGroup.add(R7);
            const R8 = new THREE.Mesh(letterGeometry, textMaterial);
            R8.position.set(0.46, -2.53, 0.052);
            R8.scale.set(0.5, 0.5, 1);
            R8.rotation.z = -0.3;
            buttonGroup.add(R8);

            // E
            const E5 = new THREE.Mesh(letterGeometry, textMaterial);
            E5.position.set(0.52, -2.5, 0.052);
            E5.scale.set(0.3, 1, 1);
            buttonGroup.add(E5);
            const E6 = new THREE.Mesh(letterGeometry, textMaterial);
            E6.position.set(0.56, -2.44, 0.052);
            E6.scale.set(0.8, 0.3, 1);
            buttonGroup.add(E6);
            const E7 = new THREE.Mesh(letterGeometry, textMaterial);
            E7.position.set(0.56, -2.5, 0.052);
            E7.scale.set(0.6, 0.3, 1);
            buttonGroup.add(E7);
            const E8 = new THREE.Mesh(letterGeometry, textMaterial);
            E8.position.set(0.56, -2.56, 0.052);
            E8.scale.set(0.8, 0.3, 1);
            buttonGroup.add(E8);

            scene.add(buttonGroup);
            // Create Floating Orbs
            const orbsGroup = new THREE.Group();
            const orbs = [];

            for (let i = 0; i < 6; i++) {
                const radius = 3 + Math.random() * 1.5;
                const angle = (i / 6) * Math.PI * 2;
                const height = (Math.random() - 0.5) * 2;
                const size = 0.08 + Math.random() * 0.12;

                const orbGeometry = new THREE.SphereGeometry(size, 32, 32);
                const orbMaterial = new THREE.MeshStandardMaterial({
                    color: 0xe0e0e0,
                    metalness: 1.0,
                    roughness: 0.05,
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
                    floatOffset: Math.random() * Math.PI * 2
                });
            }

            scene.add(orbsGroup);

            // Ground reflection
            const groundGeometry = new THREE.PlaneGeometry(10, 10);
            const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.position.y = -1.4;
            ground.receiveShadow = true;
            scene.add(ground);

            // Interactive controls
            let isDragging = false;
            let previousMousePosition = { x: 0, y: 0 };
            let targetRotation = { x: 0, y: 0 };
            let currentRotation = { x: 0, y: 0 };
            let isHovered = false;

            // Raycaster for click detection
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

                // Update raycaster
                raycaster.setFromCamera(mouse, camera);
                const phoneIntersects = raycaster.intersectObject(phoneGroup, true);
                const buttonIntersects = raycaster.intersectObject(buttonGroup, true);

                if (buttonIntersects.length > 0 && !isDragging) {
                    // Glass button hover effect
                    mountRef.current.style.cursor = 'pointer';
                    buttonGroup.scale.set(1.05, 1.05, 1.05);
                    buttonBorder.material.emissiveIntensity = 0.2;
                } else if (phoneIntersects.length > 0 && !isDragging) {
                    if (!isHovered) {
                        mountRef.current.style.cursor = 'grab';
                        isHovered = true;
                        // Add hover effect
                        phoneGroup.scale.set(1.05, 1.05, 1.05);
                        // Reset button if it was hovered
                        buttonGroup.scale.set(1, 1, 1);
                        buttonBorder.material.emissiveIntensity = 0.1;
                    }
                } else if (!isDragging) {
                    if (isHovered) {
                        mountRef.current.style.cursor = 'default';
                        isHovered = false;
                        // Remove hover effect
                        phoneGroup.scale.set(1, 1, 1);
                    }
                    // Reset button hover
                    buttonGroup.scale.set(1, 1, 1);
                    buttonBorder.material.emissiveIntensity = 0.1;
                }

                if (isDragging) {
                    const deltaMove = {
                        x: event.clientX - previousMousePosition.x,
                        y: event.clientY - previousMousePosition.y
                    };

                    targetRotation.y += deltaMove.x * 0.01;
                    targetRotation.x += deltaMove.y * 0.01;

                    // Clamp vertical rotation
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
                phoneGroup.scale.set(1, 1, 1);
                buttonGroup.scale.set(1, 1, 1);
                buttonBorder.material.emissiveIntensity = 0.1;
            };

            const handleClick = (event) => {
                const rect = mountRef.current.getBoundingClientRect();
                mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

                raycaster.setFromCamera(mouse, camera);
                const phoneIntersects = raycaster.intersectObject(phoneGroup, true);
                const buttonIntersects = raycaster.intersectObject(buttonGroup, true);

                // Check if glass button was clicked
                if (buttonIntersects.length > 0) {
                    // Glass button click effect
                    glassButton.scale.set(0.95, 0.95, 0.95);
                    buttonBorder.material.emissiveIntensity = 0.3;
                    glassButtonMaterial.opacity = 0.3;

                    setTimeout(() => {
                        glassButton.scale.set(1, 1, 1);
                        buttonBorder.material.emissiveIntensity = 0.1;
                        glassButtonMaterial.opacity = 0.15;
                    }, 200);

                    // Open GitHub link
                    window.open('https://github.com/jagainc', '_blank');
                    return;
                }

                if (phoneIntersects.length > 0) {
                    const clickedObject = phoneIntersects[0].object;

                    // Check if call buttons were clicked
                    if (clickedObject === answerButton || clickedObject === answerIcon) {
                        // Answer call effect
                        answerButton.scale.set(0.85, 0.85, 0.85);
                        answerButtonMaterial.color.setHex(0x2ecc71);
                        // Flash the entire screen briefly
                        callBackground.material.color.setHex(0xe8f5e8);
                        setTimeout(() => {
                            answerButton.scale.set(1, 1, 1);
                            answerButtonMaterial.color.setHex(0x4cd964);
                            callBackground.material.color.setHex(0xffffff);
                        }, 200);
                    }

                    if (clickedObject === declineButton || clickedObject === declineIcon) {
                        // Decline call effect
                        declineButton.scale.set(0.85, 0.85, 0.85);
                        declineButtonMaterial.color.setHex(0xc0392b);
                        // Flash the entire screen briefly
                        callBackground.material.color.setHex(0xffe8e8);
                        setTimeout(() => {
                            declineButton.scale.set(1, 1, 1);
                            declineButtonMaterial.color.setHex(0xff3b30);
                            callBackground.material.color.setHex(0xffffff);
                        }, 200);
                    }

                    // Check if message or remind buttons were clicked
                    if (clickedObject === messageButton || clickedObject === messageIcon) {
                        messageButton.scale.set(0.8, 0.8, 0.8);
                        messageButtonMaterial.color.setHex(0xcccccc);
                        setTimeout(() => {
                            messageButton.scale.set(1, 1, 1);
                            messageButtonMaterial.color.setHex(0xe0e0e0);
                        }, 150);
                    }

                    if (clickedObject === remindButton || clickedObject === remindIcon) {
                        remindButton.scale.set(0.8, 0.8, 0.8);
                        remindButtonMaterial.color.setHex(0xcccccc);
                        setTimeout(() => {
                            remindButton.scale.set(1, 1, 1);
                            remindButtonMaterial.color.setHex(0xe0e0e0);
                        }, 150);
                    }

                    // Check if screen was clicked (but not buttons)
                    if (clickedObject === screen) {
                        // Screen click effect - change screen color briefly
                        screenMaterial.color.setHex(0x1a1a2e);
                        setTimeout(() => {
                            screenMaterial.color.setHex(0x0a0a0a);
                        }, 200);
                    }

                    // Check if buttons were clicked
                    if (clickedObject === volumeUp || clickedObject === volumeDown || clickedObject === powerButton) {
                        // Button press effect
                        clickedObject.scale.set(0.9, 0.9, 0.9);
                        setTimeout(() => {
                            clickedObject.scale.set(1, 1, 1);
                        }, 150);
                    }

                    // Phone shake effect on any click
                    phoneGroup.position.set(
                        Math.random() * 0.02 - 0.01,
                        Math.random() * 0.02 - 0.01,
                        Math.random() * 0.02 - 0.01
                    );
                    setTimeout(() => {
                        phoneGroup.position.set(0, 0, 0);
                    }, 100);
                }
            };

            // Touch events for mobile
            const handleTouchStart = (event) => {
                if (event.touches.length === 1) {
                    isDragging = true;
                    previousMousePosition = {
                        x: event.touches[0].clientX,
                        y: event.touches[0].clientY
                    };
                }
            };

            const handleTouchMove = (event) => {
                if (isDragging && event.touches.length === 1) {
                    const deltaMove = {
                        x: event.touches[0].clientX - previousMousePosition.x,
                        y: event.touches[0].clientY - previousMousePosition.y
                    };

                    targetRotation.y += deltaMove.x * 0.01;
                    targetRotation.x += deltaMove.y * 0.01;

                    targetRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotation.x));

                    previousMousePosition = {
                        x: event.touches[0].clientX,
                        y: event.touches[0].clientY
                    };
                }
                event.preventDefault();
            };

            const handleTouchEnd = () => {
                isDragging = false;
            };

            // Add event listeners
            mountRef.current.addEventListener('mousedown', handleMouseDown);
            mountRef.current.addEventListener('mousemove', handleMouseMove);
            mountRef.current.addEventListener('mouseup', handleMouseUp);
            mountRef.current.addEventListener('mouseleave', handleMouseLeave);
            mountRef.current.addEventListener('click', handleClick);
            mountRef.current.addEventListener('touchstart', handleTouchStart);
            mountRef.current.addEventListener('touchmove', handleTouchMove);
            mountRef.current.addEventListener('touchend', handleTouchEnd);

            // Animation loop
            const animate = () => {
                animationRef.current = requestAnimationFrame(animate);

                const time = Date.now() * 0.001;

                // Smooth rotation interpolation
                currentRotation.x += (targetRotation.x - currentRotation.x) * 0.1;
                currentRotation.y += (targetRotation.y - currentRotation.y) * 0.1;

                // Apply rotation with auto-rotation when not dragging
                if (!isDragging) {
                    phoneGroup.rotation.y = currentRotation.y + time * 0.2;
                    phoneGroup.rotation.x = currentRotation.x + Math.sin(time * 0.3) * 0.05;
                } else {
                    phoneGroup.rotation.y = currentRotation.y;
                    phoneGroup.rotation.x = currentRotation.x;
                }

                // Animate call screen elements
                if (callScreenGroup) {
                    // Pulsing avatar
                    avatar.scale.setScalar(1 + Math.sin(time * 2) * 0.03);

                    // Glowing buttons
                    answerButton.material.opacity = 0.85 + Math.sin(time * 3) * 0.1;
                    declineButton.material.opacity = 0.85 + Math.sin(time * 3 + Math.PI) * 0.1;

                    // Subtle floating animation for buttons
                    answerButton.position.y = -0.9 + Math.sin(time * 2) * 0.008;
                    declineButton.position.y = -0.9 + Math.sin(time * 2 + Math.PI) * 0.008;

                    // Animate icons with buttons
                    answerIcon.position.y = -0.9 + Math.sin(time * 2) * 0.008;
                    declineIcon.position.y = -0.9 + Math.sin(time * 2 + Math.PI) * 0.008;

                    // Subtle background pulsing
                    callBackground.material.opacity = 0.93 + Math.sin(time * 1.5) * 0.02;
                }

                // Animate glass button
                if (buttonGroup) {
                    // Subtle floating animation
                    buttonGroup.position.y = -2.5 + Math.sin(time * 1.5) * 0.02;

                    // Gentle glow pulsing
                    buttonBorder.material.emissiveIntensity = 0.1 + Math.sin(time * 2) * 0.05;

                    // Glass refraction effect
                    glassButtonMaterial.opacity = 0.15 + Math.sin(time * 3) * 0.03;
                }

                // Animate orbs
                orbsGroup.rotation.y = time * 0.15;
                orbs.forEach((orbData) => {
                    const { mesh, originalPosition, floatSpeed, floatOffset } = orbData;
                    mesh.position.y = originalPosition.y + Math.sin(time * floatSpeed + floatOffset) * 0.3;
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
                    mountRef.current.removeEventListener('click', handleClick);
                    mountRef.current.removeEventListener('touchstart', handleTouchStart);
                    mountRef.current.removeEventListener('touchmove', handleTouchMove);
                    mountRef.current.removeEventListener('touchend', handleTouchEnd);
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
            console.error('MobilePhoneScene error:', err);
            setError(err.message);
        }
    }, []);

    if (error) {
        return (
            <div style={{
                width: '100%',
                height: '500px',
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
            height: '500px',
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
                    Loading 3D iPhone...
                </div>
            )}
            <div style={{
                position: 'absolute',
                bottom: '60px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '12px',
                textAlign: 'center',
                pointerEvents: 'none'
            }}>
                Drag to rotate • Click screen & buttons
            </div>

            {/* Glass Learn More Button */}
            <button
                onClick={() => window.open('https://github.com/jagainc', '_blank')}
                style={{
                    position: 'absolute',
                    bottom: '15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '12px 24px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(138, 138, 255, 0.3)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(138, 138, 255, 0.2)',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    outline: 'none',
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.borderColor = 'rgba(138, 138, 255, 0.6)';
                    e.target.style.boxShadow = '0 6px 20px rgba(138, 138, 255, 0.4)';
                    e.target.style.transform = 'translateX(-50%) translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.borderColor = 'rgba(138, 138, 255, 0.3)';
                    e.target.style.boxShadow = '0 4px 15px rgba(138, 138, 255, 0.2)';
                    e.target.style.transform = 'translateX(-50%) translateY(0px)';
                }}
                onMouseDown={(e) => {
                    e.target.style.transform = 'translateX(-50%) translateY(1px)';
                    e.target.style.boxShadow = '0 2px 10px rgba(138, 138, 255, 0.3)';
                }}
                onMouseUp={(e) => {
                    e.target.style.transform = 'translateX(-50%) translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(138, 138, 255, 0.4)';
                }}
            >
                Learn More
            </button>
        </div>
    );
}