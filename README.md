# 3D Highly Detailed Low-Poly White Robot Website

An interactive 3D website featuring an incredibly detailed, low-poly white robot with soft beveling, enhanced lighting, and extensive geometric details that tracks your cursor movement.

## Features

- **Ultra-Detailed Low-Poly Design**: Highly detailed white robot with soft beveled edges:
  - Multi-segment limbs (shoulder → upper arm → elbow → lower arm → wrist → hand)
  - Detailed joints and connection points
  - Complex head assembly with multiple parts and antenna
  - Articulated leg sections (hip → thigh → knee → calf → ankle)
  - Detailed feet with toes and sole details
  - Soft beveling through high-segment geometry (8-16 segments)

- **Interactive Cursor Tracking**: The robot's head and neck follow your mouse cursor with smooth, realistic movement

- **Enhanced Polished White Material**:
  - Pure white surface with low metalness (0.05) and roughness (0.08)
  - Clearcoat layer for glossy finish
  - Environment mapping for realistic reflections
  - Multiple material variants for depth and contrast

- **Advanced Geometric Details**:
  - **Head**: Crown rings, face panels, multi-section antenna, detailed eyes
  - **Body**: Chest vents, indicator lights, shoulder pads, torso belt, hip panels
  - **Arms**: Multiple joint segments, detailed fingers, realistic proportions
  - **Legs**: Hip joints, thigh/calf sections, knee/ankle joints
  - **Feet**: Toes, sole details, realistic foot geometry

- **Dramatically Enhanced Lighting System**:
  - Main directional light with soft shadows (4096x4096 resolution)
  - Multiple fill lights (cool blue, warm orange)
  - Three accent point lights with realistic decay
  - Spotlight for dramatic highlighting
  - Hemisphere light for natural ambient illumination
  - Enhanced shadow mapping with radius blur

- **Glowing Elements**: Cyan LED eyes, green chest indicators, and antenna tip with emissive materials and point lights

- **Advanced Animations**:
  - Smooth head and neck tracking with proper lerping
  - Subtle breathing effect
  - Pulsing eye glow animation
  - Realistic joint rotations

- **Technical Excellence**: High-performance rendering with optimized geometry and materials

## Technologies Used

- **Three.js**: 3D graphics library
- **WebGL**: Hardware-accelerated 3D rendering
- **ES6 Modules**: Modern JavaScript

## How to Run

Simply open `index.html` in a modern web browser. The application loads Three.js from a CDN, so an internet connection is required.

Alternatively, you can serve it with a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server
npx http-server
```

Then navigate to `http://localhost:8000`

## Interaction

Move your mouse cursor around the screen and watch as the robot:
- Turns its head to look at your cursor
- Rotates its neck to follow
- Subtly rotates its body toward you
- Continues idle animations (breathing, eye pulsing)

The robot cannot be rotated manually - it only responds to cursor movement!

## Browser Compatibility

Works best in modern browsers with WebGL support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

