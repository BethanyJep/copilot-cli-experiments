import { useState, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import BookDetails from './BookDetails';
import './Bookshelf3D.css';

// 20-color warm, muted palette for book spines
const BOOK_PALETTE = [
  '#8B9A7C', // Sage green
  '#A3B18A', // Light sage
  '#6B8F71', // Deep sage
  '#7C9885', // Muted green
  '#6B8E9F', // Dusty blue
  '#5D7A8C', // Steel blue
  '#8BA4B4', // Soft blue
  '#4A6670', // Deep teal
  '#C17F59', // Terracotta
  '#B56B45', // Burnt sienna
  '#A67B5B', // Warm brown
  '#8B6F4E', // Muted brown
  '#D4A84B', // Mustard
  '#C9B267', // Soft gold
  '#BFA265', // Muted gold
  '#D4A88E', // Blush
  '#C9A192', // Dusty rose
  '#B8998C', // Warm taupe
  '#9A8578', // Warm neutral
  '#7A6B5E', // Deep neutral
];

// Generate color with slight brightness/saturation variation
function getBookColor(book, index) {
  const str = (book.id || '') + (book.title || '') + (index || 0);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  const colorIndex = Math.abs(hash * 31 + (index || 0) * 17) % BOOK_PALETTE.length;
  return BOOK_PALETTE[colorIndex];
}

// Apply slight variation to a color
function varyColor(hexColor, hash) {
  // Parse hex
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Vary brightness (-10 to +10) and saturation slightly
  const brightnessShift = ((hash % 21) - 10);
  const saturationMult = 0.9 + ((hash >> 4) % 20) / 100; // 0.9 to 1.1
  
  // Apply variation
  const avg = (r + g + b) / 3;
  const newR = Math.min(255, Math.max(0, Math.round((r - avg) * saturationMult + avg + brightnessShift)));
  const newG = Math.min(255, Math.max(0, Math.round((g - avg) * saturationMult + avg + brightnessShift)));
  const newB = Math.min(255, Math.max(0, Math.round((b - avg) * saturationMult + avg + brightnessShift)));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// Scene/wall background color
const SCENE_BG_COLOR = '#000000';

// Draggable wrapper component
function Draggable({ children, position, onDragEnd, enabled = true }) {
  const groupRef = useRef();
  const { camera, gl, raycaster } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [currentPos, setCurrentPos] = useState(position);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const intersection = useMemo(() => new THREE.Vector3(), []);

  const onPointerDown = useCallback((e) => {
    if (!enabled) return;
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.point.x, y: e.point.y });
    gl.domElement.style.cursor = 'grabbing';
  }, [enabled, gl]);

  const onPointerUp = useCallback((e) => {
    if (!isDragging) return;
    e.stopPropagation();
    setIsDragging(false);
    gl.domElement.style.cursor = 'auto';
    if (onDragEnd && groupRef.current) {
      onDragEnd([groupRef.current.position.x, groupRef.current.position.y, groupRef.current.position.z]);
    }
  }, [isDragging, onDragEnd, gl]);

  const onPointerMove = useCallback((e) => {
    if (!isDragging || !dragStart) return;
    e.stopPropagation();
    
    // Update plane to be at current depth
    plane.setFromNormalAndCoplanarPoint(
      camera.getWorldDirection(new THREE.Vector3()).negate(),
      groupRef.current.position
    );
    
    raycaster.setFromCamera(e.pointer, camera);
    raycaster.ray.intersectPlane(plane, intersection);
    
    if (groupRef.current) {
      groupRef.current.position.x = intersection.x;
      groupRef.current.position.y = Math.max(0.5, intersection.y); // Keep above floor
    }
  }, [isDragging, dragStart, camera, raycaster, plane, intersection]);

  useFrame(() => {
    if (!isDragging && groupRef.current) {
      // Smoothly return to resting position if not dragging
      // (optional: could snap to shelf positions)
    }
  });

  return (
    <group
      ref={groupRef}
      position={currentPos}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerUp}
    >
      {children}
    </group>
  );
}

function Book({ book, position, onClick, onPositionChange, isDragMode, bookIndex = 0 }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Generate deterministic variation from book id/title
  const hash = useMemo(() => {
    const str = book.id || book.title || 'book';
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = str.charCodeAt(i) + ((h << 5) - h);
    }
    return Math.abs(h);
  }, [book.id, book.title]);
  
  // Varied dimensions for realism
  const heightVariation = ((hash % 30) - 15) * 0.01;
  const widthVariation = ((hash >> 4) % 20 - 10) * 0.01;
  const depthVariation = ((hash >> 8) % 15 - 7) * 0.01;
  
  // width = thickness of book (spine width), height = tall dimension, depth = front-to-back
  const height = 2.0 + heightVariation + (book.numberOfPages ? Math.min(0.3, book.numberOfPages / 1000) : 0);
  const width = 0.32 + widthVariation; // spine thickness
  const depth = 1.5 + depthVariation; // book depth (front to back)
  
  // Get base color and apply variation
  const baseColorHex = getBookColor(book, bookIndex);
  const variedColorHex = varyColor(baseColorHex, hash);
  const color = useMemo(() => new THREE.Color(variedColorHex), [variedColorHex]);
  
  // Slightly lighter spine for contrast
  const spineColor = useMemo(() => {
    const c = new THREE.Color(variedColorHex);
    c.multiplyScalar(1.08);
    return c;
  }, [variedColorHex]);
  
  // Darker variant for gradient effect
  const darkColor = useMemo(() => {
    const c = new THREE.Color(variedColorHex);
    c.multiplyScalar(0.85);
    return c;
  }, [variedColorHex]);

  useFrame(() => {
    if (meshRef.current && !isDragMode) {
      const targetY = hovered ? 0.12 : 0;
      meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.1;
      
      const targetRotY = hovered ? -0.15 : 0;
      meshRef.current.rotation.y += (targetRotY - meshRef.current.rotation.y) * 0.1;
    }
  });

  // Create textured materials with cloth/paper feel
  // Materials: [+X, -X, +Y, -Y, +Z, -Z]
  const materials = useMemo(() => {
    // Determine texture type based on hash (cloth vs paper)
    const isCloth = hash % 3 !== 0; // 2/3 cloth, 1/3 paper
    const baseRoughness = isCloth ? 0.85 : 0.7;
    const baseMetalness = isCloth ? 0.0 : 0.02;
    
    return [
      // +X right side (cover)
      new THREE.MeshStandardMaterial({ 
        color: color, 
        roughness: baseRoughness, 
        metalness: baseMetalness,
      }),
      // -X left side (cover)
      new THREE.MeshStandardMaterial({ 
        color: darkColor, 
        roughness: baseRoughness, 
        metalness: baseMetalness,
      }),
      // +Y top (pages)
      new THREE.MeshStandardMaterial({ 
        color: '#f5f0e6', 
        roughness: 0.95, 
        metalness: 0,
      }),
      // -Y bottom (pages)
      new THREE.MeshStandardMaterial({ 
        color: '#e8e0d4', 
        roughness: 0.95, 
        metalness: 0,
      }),
      // +Z spine (faces viewer) - slightly worn look
      new THREE.MeshStandardMaterial({ 
        color: spineColor, 
        roughness: baseRoughness - 0.1, 
        metalness: baseMetalness + 0.02,
      }),
      // -Z back
      new THREE.MeshStandardMaterial({ 
        color: darkColor, 
        roughness: baseRoughness, 
        metalness: baseMetalness,
      }),
    ];
  }, [color, spineColor, darkColor, hash]);

  const textColor = useMemo(() => {
    const luminance = color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
    return luminance > 0.45 ? '#2a2420' : '#f5f0e6';
  }, [color]);

  // Truncate title for spine
  const spineTitle = book.title || 'Untitled';

  const handleClick = (e) => {
    if (!isDragMode) {
      e.stopPropagation();
      onClick(book);
    }
  };

  const bookContent = (
    <group
      ref={meshRef}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = isDragMode ? 'grab' : 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Soft contact shadow under the book */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -height / 2 - 0.01, 0]}
      >
        <planeGeometry args={[width * 0.9, depth * 0.9]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={0.2} 
          depthWrite={false}
        />
      </mesh>
      
      {/* Vertical book - spine faces viewer (+Z direction) */}
      <group>
        <mesh material={materials} castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
        </mesh>
        {/* Spine text - on +Z face, rotated to read vertically */}
        <Text
          position={[0, 0, depth / 2 + 0.01]}
          rotation={[0, 0, -Math.PI / 2]}
          fontSize={0.1}
          maxWidth={height * 0.85}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          textAlign="center"
        >
          {spineTitle}
        </Text>
      </group>
    </group>
  );

  if (isDragMode) {
    return (
      <Draggable 
        position={position} 
        onDragEnd={(newPos) => onPositionChange(book.id, newPos)}
        enabled={isDragMode}
      >
        {bookContent}
      </Draggable>
    );
  }

  return <group position={position}>{bookContent}</group>;
}

function Shelf({ position, width = 8.5, isInvisible = false }) {
  const woodColor = isInvisible ? SCENE_BG_COLOR : '#9B6B3D';
  const woodColorDark = isInvisible ? SCENE_BG_COLOR : '#7B522D';
  const woodColorLight = isInvisible ? SCENE_BG_COLOR : '#B87D4A';
  
  return (
    <group position={position}>
      {/* Main shelf board */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, 0.15, 2]} />
        <meshStandardMaterial color={woodColor} roughness={0.75} metalness={0.05} transparent={isInvisible} opacity={isInvisible ? 0.3 : 1} />
      </mesh>
      
      {/* Front lip/trim */}
      <mesh position={[0, 0.1, 0.95]} castShadow>
        <boxGeometry args={[width, 0.2, 0.12]} />
        <meshStandardMaterial color={woodColorDark} roughness={0.7} metalness={0.05} transparent={isInvisible} opacity={isInvisible ? 0.3 : 1} />
      </mesh>
      
      {/* Decorative groove on front */}
      <mesh position={[0, 0.02, 0.96]}>
        <boxGeometry args={[width - 0.2, 0.04, 0.02]} />
        <meshStandardMaterial color={woodColorLight} roughness={0.6} transparent={isInvisible} opacity={isInvisible ? 0.3 : 1} />
      </mesh>
    </group>
  );
}

function BookshelfFrame({ numShelves, shelfSpacing }) {
  const frameColor = '#6B4226';
  const frameColorDark = '#4A2F1A';
  const backColor = '#2A1A0F';
  const totalHeight = numShelves * shelfSpacing + 0.5;
  const width = 9;
  
  return (
    <group>
      {/* Back panel */}
      <mesh position={[0, totalHeight / 2 - 0.5, -1]} receiveShadow>
        <boxGeometry args={[width + 0.3, totalHeight + 0.5, 0.15]} />
        <meshStandardMaterial color={backColor} roughness={0.95} metalness={0} />
      </mesh>
      
      {/* Left side panel */}
      <mesh position={[-width / 2 - 0.1, totalHeight / 2 - 0.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, totalHeight + 0.5, 2.2]} />
        <meshStandardMaterial color={frameColor} roughness={0.75} metalness={0.05} />
      </mesh>
      
      {/* Right side panel */}
      <mesh position={[width / 2 + 0.1, totalHeight / 2 - 0.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, totalHeight + 0.5, 2.2]} />
        <meshStandardMaterial color={frameColor} roughness={0.75} metalness={0.05} />
      </mesh>
      
      {/* Top crown molding */}
      <mesh position={[0, totalHeight - 0.15, 0.2]} castShadow>
        <boxGeometry args={[width + 0.5, 0.25, 2.4]} />
        <meshStandardMaterial color={frameColorDark} roughness={0.7} metalness={0.05} />
      </mesh>
      
      {/* Bottom base */}
      <mesh position={[0, -0.2, 0.3]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.5, 0.3, 2.6]} />
        <meshStandardMaterial color={frameColorDark} roughness={0.75} metalness={0.05} />
      </mesh>
      
      {/* Base trim */}
      <mesh position={[0, -0.4, 0.4]} castShadow>
        <boxGeometry args={[width + 0.6, 0.15, 2.8]} />
        <meshStandardMaterial color={frameColor} roughness={0.7} metalness={0.05} />
      </mesh>
    </group>
  );
}

function DecorItem({ type, position, scale = 1.8, isDragMode, onPositionChange, id }) {
  const [hovered, setHovered] = useState(false);
  
  const renderDecor = () => {
    switch(type) {
      case 'plant':
        return (
          <group scale={scale}>
            {/* Pot */}
            <mesh position={[0, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.22, 0.5, 16]} />
              <meshStandardMaterial color="#C45C26" roughness={0.8} />
            </mesh>
            {/* Pot rim */}
            <mesh position={[0, 0.52, 0]} castShadow>
              <cylinderGeometry args={[0.32, 0.3, 0.08, 16]} />
              <meshStandardMaterial color="#B54D1A" roughness={0.75} />
            </mesh>
            {/* Soil */}
            <mesh position={[0, 0.48, 0]}>
              <cylinderGeometry args={[0.28, 0.28, 0.05, 16]} />
              <meshStandardMaterial color="#3D2517" roughness={0.95} />
            </mesh>
            {/* Plant leaves */}
            <mesh position={[0, 0.85, 0]} castShadow>
              <sphereGeometry args={[0.45, 16, 16]} />
              <meshStandardMaterial color="#2E8B2E" roughness={0.85} />
            </mesh>
            <mesh position={[0.2, 1.1, 0.1]} castShadow>
              <sphereGeometry args={[0.25, 12, 12]} />
              <meshStandardMaterial color="#3CB371" roughness={0.85} />
            </mesh>
            <mesh position={[-0.15, 1.05, -0.1]} castShadow>
              <sphereGeometry args={[0.2, 12, 12]} />
              <meshStandardMaterial color="#228B22" roughness={0.85} />
            </mesh>
          </group>
        );
      case 'globe':
        return (
          <group scale={scale}>
            {/* Base */}
            <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.25, 0.3, 0.2, 16]} />
              <meshStandardMaterial color="#5D4037" roughness={0.7} metalness={0.2} />
            </mesh>
            {/* Stand post */}
            <mesh position={[0, 0.35, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
              <meshStandardMaterial color="#8D6E63" roughness={0.6} metalness={0.3} />
            </mesh>
            {/* Arc */}
            <mesh position={[0, 0.7, 0]} castShadow rotation={[0, 0, 0.2]}>
              <torusGeometry args={[0.4, 0.02, 8, 32, Math.PI]} />
              <meshStandardMaterial color="#8D6E63" roughness={0.6} metalness={0.3} />
            </mesh>
            {/* Globe */}
            <mesh position={[0, 0.7, 0]} castShadow>
              <sphereGeometry args={[0.38, 32, 32]} />
              <meshStandardMaterial color="#5DADE2" roughness={0.4} metalness={0.1} />
            </mesh>
          </group>
        );
      case 'vase':
        return (
          <group scale={scale}>
            {/* Vase body */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.18, 0.28, 1, 16]} />
              <meshStandardMaterial color="#D4A574" roughness={0.5} metalness={0.2} />
            </mesh>
            {/* Vase neck */}
            <mesh position={[0, 1.05, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.18, 0.15, 16]} />
              <meshStandardMaterial color="#C9986C" roughness={0.5} metalness={0.2} />
            </mesh>
            {/* Flowers */}
            <mesh position={[0, 1.4, 0]} castShadow>
              <sphereGeometry args={[0.15, 12, 12]} />
              <meshStandardMaterial color="#E74C3C" roughness={0.8} />
            </mesh>
            <mesh position={[0.12, 1.5, 0.08]} castShadow>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshStandardMaterial color="#F39C12" roughness={0.8} />
            </mesh>
            <mesh position={[-0.1, 1.45, -0.05]} castShadow>
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshStandardMaterial color="#9B59B6" roughness={0.8} />
            </mesh>
          </group>
        );
      case 'clock':
        return (
          <group scale={scale}>
            {/* Clock body */}
            <mesh position={[0, 0.55, 0]} castShadow>
              <cylinderGeometry args={[0.35, 0.35, 0.12, 32]} />
              <meshStandardMaterial color="#8B4513" roughness={0.6} metalness={0.2} />
            </mesh>
            {/* Clock face */}
            <mesh position={[0, 0.55, 0.07]}>
              <circleGeometry args={[0.3, 32]} />
              <meshStandardMaterial color="#FFFEF0" roughness={0.9} />
            </mesh>
            {/* Stand */}
            <mesh position={[0, 0.15, 0]} castShadow>
              <boxGeometry args={[0.5, 0.3, 0.15]} />
              <meshStandardMaterial color="#6B4226" roughness={0.7} />
            </mesh>
          </group>
        );
      default:
        return null;
    }
  };

  const decorContent = (
    <group 
      scale={hovered ? 1.08 : 1}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {renderDecor()}
    </group>
  );

  if (isDragMode) {
    return (
      <Draggable 
        position={position} 
        onDragEnd={(newPos) => onPositionChange && onPositionChange(id, newPos)}
        enabled={isDragMode}
      >
        {decorContent}
      </Draggable>
    );
  }

  return <group position={position}>{decorContent}</group>;
}

function ScanButton3D({ position, onClick }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group position={position}>
      {/* Button base */}
      <mesh 
        castShadow
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        onClick={onClick}
        scale={hovered ? 1.05 : 1}
      >
        <cylinderGeometry args={[0.8, 0.9, 0.3, 32]} />
        <meshStandardMaterial 
          color={hovered ? '#D4A574' : '#B8956E'} 
          roughness={0.4} 
          metalness={0.3} 
        />
      </mesh>
      {/* Camera icon on top */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.6, 0.35, 0.4]} />
        <meshStandardMaterial color="#2A1A0F" roughness={0.7} />
      </mesh>
      {/* Camera lens */}
      <mesh position={[0.15, 0.2, 0.21]}>
        <cylinderGeometry args={[0.12, 0.12, 0.05, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Flash */}
      <mesh position={[-0.2, 0.35, 0.21]}>
        <boxGeometry args={[0.15, 0.08, 0.02]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.2} />
      </mesh>
      {/* Label */}
      <Html position={[0, -0.35, 0]} center>
        <div style={{
          background: 'rgba(42, 26, 15, 0.9)',
          color: '#D4A574',
          padding: '4px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          border: '1px solid #6B4226',
        }}>
          SCAN
        </div>
      </Html>
    </group>
  );
}

function BookshelfScene({ books, onBookClick, isDragMode, bookPositions, decorPositions, onBookPositionChange, onDecorPositionChange, onScanClick }) {
  const booksPerShelf = 5;
  const shelfSpacing = 2.9;
  const shelfSurfaceHeight = 0.15; // Height of the shelf board
  const numShelves = Math.max(3, Math.ceil(books.length / booksPerShelf));
  const controlsRef = useRef();
  
  const decorTypes = ['plant', 'globe', 'vase', 'clock'];
  
  // Calculate book dimensions for layout (matching Book component logic)
  const getBookDimensions = (book) => {
    const str = book.id || book.title || 'book';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    
    const heightVariation = ((hash % 30) - 15) * 0.01;
    const widthVariation = ((hash >> 4) % 20 - 10) * 0.01;
    
    const height = 2.0 + heightVariation + (book.numberOfPages ? Math.min(0.3, book.numberOfPages / 1000) : 0);
    const width = 0.32 + widthVariation;
    
    return { height, width, hash };
  };
  
  // Determine book layout - all books standing, packed closely together
  const bookLayout = useMemo(() => {
    const layout = [];
    const gap = 0.03; // Small gap between books
    
    // Group books by shelf
    const shelves = [];
    books.forEach((book, index) => {
      const shelfIndex = Math.floor(index / booksPerShelf);
      if (!shelves[shelfIndex]) shelves[shelfIndex] = [];
      shelves[shelfIndex].push({ book, index });
    });
    
    shelves.forEach((shelfBooks, shelfIndex) => {
      // Calculate total width of all books on this shelf
      const bookWidths = shelfBooks.map(({ book }) => getBookDimensions(book).width);
      const totalWidth = bookWidths.reduce((sum, w) => sum + w, 0) + (shelfBooks.length - 1) * gap;
      
      // Start position (centered on shelf)
      let currentX = -totalWidth / 2;
      
      shelfBooks.forEach(({ book }, i) => {
        const { height, width } = getBookDimensions(book);
        
        // Position at current X + half width (center of book)
        const x = currentX + width / 2;
        currentX += width + gap;
        
        layout.push({
          book,
          isHorizontal: false,
          x,
          shelfIndex,
          width,
          height,
        });
      });
    });
    
    return layout;
  }, [books, booksPerShelf]);
  
  // Disable orbit controls while dragging
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !isDragMode;
    }
  });
  
  // Index of shelf to make "invisible" (blends with background)
  const invisibleShelfIndex = 1;
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 10, 8]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-4, 5, 4]} intensity={0.4} color="#FFE4B5" />
      <pointLight position={[4, 3, 5]} intensity={0.3} color="#FFF8DC" />
      
      {/* Environment for reflections */}
      <Environment preset="apartment" />
      
      {/* Bookshelf frame (sides, top, bottom) */}
      <BookshelfFrame numShelves={numShelves} shelfSpacing={shelfSpacing} />
      
      {/* Shelves - one is invisible (blends with background) */}
      {Array.from({ length: numShelves }).map((_, shelfIndex) => {
        const shelfY = shelfIndex * shelfSpacing;
        return (
          <Shelf 
            key={shelfIndex} 
            position={[0, shelfY, 0]} 
            isInvisible={shelfIndex === invisibleShelfIndex}
          />
        );
      })}
      
      {/* Books - positioned based on saved positions or computed layout */}
      {bookLayout.map((item, index) => {
        const { book, x, shelfIndex, width, height } = item;
        
        const savedPos = bookPositions[book.id];
        let position;
        
        if (savedPos) {
          position = savedPos;
        } else {
          // Vertical standing book - grounded on shelf surface
          const shelfTop = shelfIndex * shelfSpacing + shelfSurfaceHeight / 2 + 0.08;
          const yPos = shelfTop + height / 2;
          position = [x, yPos, 0];
        }
        
        return (
          <Book
            key={book.id}
            book={book}
            bookIndex={index}
            position={position}
            onClick={onBookClick}
            isDragMode={isDragMode}
            onPositionChange={onBookPositionChange}
          />
        );
      })}
      
      {/* Decorative items */}
      {Array.from({ length: numShelves }).map((_, shelfIndex) => {
        const shelfY = shelfIndex * shelfSpacing;
        const shelfBooks = books.slice(shelfIndex * booksPerShelf, (shelfIndex + 1) * booksPerShelf);
        const items = [];
        
        if (shelfIndex % 2 === 0 || shelfBooks.length < 4) {
          const id = `decor-right-${shelfIndex}`;
          const savedPos = decorPositions[id];
          items.push(
            <DecorItem 
              key={id}
              id={id}
              type={decorTypes[shelfIndex % decorTypes.length]} 
              position={savedPos || [3.5, shelfY + 0.08, 0]} 
              scale={1.6}
              isDragMode={isDragMode}
              onPositionChange={onDecorPositionChange}
            />
          );
        }
        if (shelfIndex % 2 === 1 || shelfBooks.length < 3) {
          const id = `decor-left-${shelfIndex}`;
          const savedPos = decorPositions[id];
          items.push(
            <DecorItem 
              key={id}
              id={id}
              type={decorTypes[(shelfIndex + 2) % decorTypes.length]} 
              position={savedPos || [-3.8, shelfY + 0.08, 0]} 
              scale={1.6}
              isDragMode={isDragMode}
              onPositionChange={onDecorPositionChange}
            />
          );
        }
        return items;
      })}
      
      {/* Scan Button - positioned to the right of the shelf */}
      <ScanButton3D 
        position={[6, 2, 2]} 
        onClick={onScanClick}
      />
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 1]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#3D2B1F" roughness={0.85} />
      </mesh>
      
      {/* Camera controls */}
      <OrbitControls 
        ref={controlsRef}
        enablePan={false}
        minDistance={6}
        maxDistance={14}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, numShelves * shelfSpacing / 2 - 1, 0]}
      />
    </>
  );
}

export default function Bookshelf3D({ books, onRemove, onScanClick }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [isDragMode, setIsDragMode] = useState(false);
  const [bookPositions, setBookPositions] = useState(() => {
    try {
      const saved = localStorage.getItem('shelfie_book_positions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [decorPositions, setDecorPositions] = useState(() => {
    try {
      const saved = localStorage.getItem('shelfie_decor_positions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleBookPositionChange = useCallback((bookId, newPos) => {
    setBookPositions(prev => {
      const updated = { ...prev, [bookId]: newPos };
      try {
        localStorage.setItem('shelfie_book_positions', JSON.stringify(updated));
      } catch { /* ignore quota errors */ }
      return updated;
    });
  }, []);

  const handleDecorPositionChange = useCallback((decorId, newPos) => {
    setDecorPositions(prev => {
      const updated = { ...prev, [decorId]: newPos };
      try {
        localStorage.setItem('shelfie_decor_positions', JSON.stringify(updated));
      } catch { /* ignore quota errors */ }
      return updated;
    });
  }, []);

  const resetPositions = useCallback(() => {
    setBookPositions({});
    setDecorPositions({});
    localStorage.removeItem('shelfie_book_positions');
    localStorage.removeItem('shelfie_decor_positions');
  }, []);

  return (
    <div className="bookshelf-container">
      <div className="bookshelf-header">
        <h2 className="bookshelf-title">
          My Bookshelf <span className="book-count">({books.length} books)</span>
        </h2>
        <div className="bookshelf-controls">
          <button 
            className={`drag-toggle ${isDragMode ? 'active' : ''}`}
            onClick={() => setIsDragMode(!isDragMode)}
          >
            {isDragMode ? '✓ Done Arranging' : '↔ Arrange Items'}
          </button>
          {isDragMode && (
            <button className="reset-btn" onClick={resetPositions}>
              Reset Positions
            </button>
          )}
        </div>
      </div>
      
      {isDragMode && (
        <div className="drag-hint">
          Drag books and items to rearrange them on the shelf
        </div>
      )}
      
      <div className="canvas-container">
        <Canvas
          shadows
          camera={{ position: [0, 4, 11], fov: 45 }}
          gl={{ antialias: true }}
        >
          <BookshelfScene 
            books={books} 
            onBookClick={setSelectedBook}
            isDragMode={isDragMode}
            bookPositions={bookPositions}
            decorPositions={decorPositions}
            onBookPositionChange={handleBookPositionChange}
            onDecorPositionChange={handleDecorPositionChange}
            onScanClick={onScanClick}
          />
        </Canvas>
      </div>
      
      {books.length === 0 && (
        <div className="empty-overlay">
          <p>Your bookshelf is empty. Add some books!</p>
        </div>
      )}

      {selectedBook && (
        <BookDetails
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onRemove={() => {
            onRemove(selectedBook.id);
            setSelectedBook(null);
          }}
        />
      )}
    </div>
  );
}
