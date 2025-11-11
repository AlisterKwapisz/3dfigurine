# 3D Silver Figurine Website

An interactive 3D website featuring a realistic silver figurine that tracks your cursor movement.

## Features

- **Interactive 3D Figurine**: A silver humanoid figure that follows your mouse cursor
- **Realistic PBR Shaders**: Physically-based rendering with metallic silver material
- **Dynamic Lighting**: Multiple light sources for realistic reflections and shadows
- **Smooth Animations**: Fluid head and body tracking with damped motion
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

Move your mouse cursor around the screen to see the figurine's head and body track your movements.

## Browser Compatibility

Works best in modern browsers with WebGL support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

