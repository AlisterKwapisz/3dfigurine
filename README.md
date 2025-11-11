# 3D Low-Poly White Robot Website

An interactive 3D website featuring a cute, low-poly white robot made of flat hexagonal and triangular surfaces that tracks your cursor movement.

## Features

- **Low-Poly Design**: Clean white robot constructed entirely from flat geometric surfaces:
  - Hexagonal prisms for head, body, neck, arms, and legs
  - Triangular and hexagonal face details
  - Low-segment spheres for joints
  - Flat-shaded rendering for authentic low-poly aesthetic
- **Interactive Cursor Tracking**: The robot's head and neck follow your mouse cursor in real-time with correct directional tracking
- **Polished White Material**: 
  - Smooth white surface (low metalness, low roughness)
  - Environment mapping for subtle reflections
  - Flat shading for geometric definition
- **Glowing Cyan Eyes**: Low-poly spherical eyes with emissive cyan glow and point lights
- **Geometric Details**:
  - Hexagonal head with pyramid top
  - Hexagonal antenna with glowing tip
  - Triangular chest indicator light
  - All body parts use 6-8 sided geometry for clean facets
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

