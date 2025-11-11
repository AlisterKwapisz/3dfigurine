# 3D Silver Robot Website

An interactive 3D website featuring a cute, soft-edged silver robot that tracks your cursor movement with realistic PBR shading.

## Features

- **Cute Soft-Edged Robot**: A friendly silver robot with rounded, low-poly aesthetics
- **Interactive Cursor Tracking**: The robot's head and neck follow your mouse cursor in real-time
- **Enhanced PBR Shaders**: Physically-based rendering with:
  - High metalness (0.95) and low roughness (0.15) for realistic silver
  - Clearcoat layer for added realism
  - Environment mapping for accurate light reflections
  - Multiple material variants for depth and detail
- **Glowing LED Eyes**: Cyan-colored eyes with emissive materials and point lights for authentic glow
- **Dynamic Lighting System**: 
  - Directional lights (main, fill, and rim)
  - Point lights for highlights
  - Hemisphere light for ambient illumination
  - High-quality shadow mapping
- **Idle Animations**: 
  - Subtle breathing effect
  - Pulsing eye animation
  - Smooth interpolated movements
- **Responsive Design**: Works across different screen sizes

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

