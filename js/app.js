// app.js

// Import statements using the import map
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

let data; // Variable to hold JSON data

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function () {

  // Declare variables here

  // Slider elements
  const xRange = document.getElementById('xRange');
  const yRange = document.getElementById('yRange');
  const zRange = document.getElementById('zRange');

  // Description Box
  const descriptionBox = document.getElementById('descriptionBox');

  // Axis Labels
  const xLabel = document.getElementById('xLabel');
  const yLabel = document.getElementById('yLabel');
  const zLabel = document.getElementById('zLabel');

  // Selection Buttons
  const selectionButtons = document.querySelectorAll('.selection-btn');

  // Current Selection
  let currentSelection = 'individual';

  // Initialize the 3D Cube using Three.js
  let scene, camera, renderer, cube, dot;

  // Load the JSON data
  fetch('data/smlc_data.json')
    .then(response => response.json())
    .then(jsonData => {
      data = jsonData;
      // Initialize the app after data is loaded
      init();
      updateDotPosition();
    })
    .catch(error => {
      console.error('Error loading JSON data:', error);
    });

  function init() {
    // Scene and Camera
    scene = new THREE.Scene();
    const width = document.getElementById('cube-container').clientWidth;
    const height = document.getElementById('cube-container').clientHeight;
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(300, 300, 300);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    document.getElementById('cube-container').appendChild(renderer.domElement);

    // Cube Edges
    const geometry = new THREE.BoxGeometry(200, 200, 200);
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x333333 });
    cube = new THREE.LineSegments(edges, lineMaterial);
    cube.position.set(0, 0, 0); // Ensure the cube is centered
    scene.add(cube);

    // Axes
    addAxes();

    // Dot
    const dotGeometry = new THREE.SphereGeometry(5, 32, 32);
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xff3300 });
    dot = new THREE.Mesh(dotGeometry, dotMaterial);
    scene.add(dot);

    // Light
    const light = new THREE.AmbientLight(0xffffff);
    scene.add(light);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Event listeners for sliders
    xRange.addEventListener('input', updateDotPosition);
    yRange.addEventListener('input', updateDotPosition);
    zRange.addEventListener('input', updateDotPosition);

    // Handle Selection Button Clicks
    selectionButtons.forEach(button => {
      button.addEventListener('click', function () {
        // Remove active class from all buttons
        selectionButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to the clicked button
        this.classList.add('active');
        // Update current selection
        currentSelection = this.getAttribute('data-type');
        // Update axis labels based on selection
        updateAxisLabels(currentSelection);
        // Reset sliders to middle position
        resetSliders();
        // Update description
        updateDescription(xRange.value, yRange.value, zRange.value);
      });
    });

    // Set initial axis labels
    updateAxisLabels(currentSelection);

    animate();
  }

  // Function to add axes lines
  function addAxes() {
    const axesLength = 150;
    const axesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

    // X Axis
    const xGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(axesLength, 0, 0)
    ]);
    const xAxis = new THREE.Line(xGeometry, axesMaterial);
    scene.add(xAxis);

    // Y Axis
    const yGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, axesLength, 0)
    ]);
    const yAxis = new THREE.Line(yGeometry, axesMaterial);
    scene.add(yAxis);

    // Z Axis
    const zGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, axesLength)
    ]);
    const zAxis = new THREE.Line(zGeometry, axesMaterial);
    scene.add(zAxis);

    // Axis Labels
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
      const xText = createTextLabel('X', font, axesLength + 10, 0, 0);
      const yText = createTextLabel('Y', font, 0, axesLength + 10, 0);
      const zText = createTextLabel('Z', font, 0, 0, axesLength + 10);
      scene.add(xText);
      scene.add(yText);
      scene.add(zText);
    });
  }

  // Function to create text labels for axes
  function createTextLabel(text, font, x, y, z) {
    const textGeometry = new TextGeometry(text, {
      font: font,
      size: 10,
      depth: 1 // Changed from 'height' to 'depth' to fix deprecation warning
    });
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const mesh = new THREE.Mesh(textGeometry, textMaterial);
    mesh.position.set(x, y, z);
    return mesh;
  }

  // Animate the scene
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  // Update the dot position based on slider values
  function updateDotPosition() {
    const xValue = (parseInt(xRange.value) - 3) * 50; // Scale to -100 to 100
    const yValue = (parseInt(yRange.value) - 3) * 50;
    const zValue = (parseInt(zRange.value) - 3) * 50;
    dot.position.set(xValue, yValue, zValue);
    updateDescription(xRange.value, yRange.value, zRange.value);
  }

  // Update the description based on slider values
  function updateDescription(xVal, yVal, zVal) {
    if (!data) {
      console.error('Data is not loaded yet');
      return;
    }
    const levelData = data.levels[currentSelection];
    const xAxis = levelData.axes.X;
    const yAxis = levelData.axes.Y;
    const zAxis = levelData.axes.Z;

    const xDesc = xAxis.values[xVal - 1];
    const yDesc = yAxis.values[yVal - 1];
    const zDesc = zAxis.values[zVal - 1];

    descriptionBox.innerHTML = `
      <strong>${capitalizeFirstLetter(currentSelection)} Level:</strong>
      ${xDesc}, ${yDesc}, ${zDesc}.<br>
      <em>Example:</em> ${levelData.descriptions.example}
    `;
  }

  // Function to update axis labels based on selection
  function updateAxisLabels(selection) {
    if (!data) {
      console.error('Data is not loaded yet');
      return;
    }
    const levelData = data.levels[selection];
    xLabel.textContent = levelData.axes.X.label;
    yLabel.textContent = levelData.axes.Y.label;
    zLabel.textContent = levelData.axes.Z.label;
  }

  // Function to reset sliders to default (middle) position
  function resetSliders() {
    xRange.value = 3;
    yRange.value = 3;
    zRange.value = 3;
    updateDotPosition();
  }

  // Helper function to capitalize the first letter
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

});
