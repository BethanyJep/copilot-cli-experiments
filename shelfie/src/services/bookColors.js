// Keywords to color mapping for genre/topic-based colors - BRIGHT versions
const colorKeywords = {
  // Tech/Programming - Vibrant Blues and Cyans
  programming: '#5BA3E8',
  code: '#5BA3E8',
  javascript: '#FFE847',
  python: '#4B8BBE',
  java: '#FF9B2B',
  software: '#6DB3F2',
  computer: '#5BA3E8',
  algorithm: '#00D4E8',
  data: '#00C8D9',
  machine: '#FF47AB',
  learning: '#FF47AB',
  ai: '#FF47AB',
  artificial: '#FF47AB',
  intelligence: '#FF47AB',
  web: '#71E5FF',
  database: '#4A7DB8',
  
  // Science - Vibrant Greens and Teals
  science: '#5ED85E',
  biology: '#9ED84E',
  chemistry: '#00E8C5',
  physics: '#9B6DFF',
  math: '#B84DDB',
  mathematics: '#B84DDB',
  engineering: '#FFB347',
  
  // Fiction/Literature - Warm vibrant colors
  fiction: '#FF7A7A',
  novel: '#FF6B6B',
  romance: '#FF9EC4',
  love: '#FF5A8A',
  mystery: '#7A8AFF',
  thriller: '#6B6B6B',
  horror: '#4A4A4A',
  fantasy: '#9B71E8',
  magic: '#C76BDB',
  dragon: '#9B71E8',
  
  // History/Social - Warm earth tones
  history: '#B8907A',
  war: '#8B6B5A',
  world: '#4BD8C8',
  philosophy: '#9BB8C8',
  psychology: '#D88BE8',
  mind: '#D88BE8',
  
  // Business/Finance - Professional bright colors
  business: '#47A3FF',
  finance: '#5ABD5A',
  money: '#5ED85E',
  economics: '#2BB89B',
  management: '#3B8BDB',
  marketing: '#FF6B47',
  
  // Self-help/Lifestyle - Bright, positive colors
  health: '#7BD87B',
  fitness: '#FF8B5A',
  cooking: '#FF9B7A',
  food: '#FFBBA0',
  travel: '#47C8FF',
  art: '#FF8B5A',
  design: '#FF7247',
  music: '#FF5A8A',
  
  // Children's books - Bright primary colors
  children: '#FFED5A',
  kids: '#FFF06B',
  
  // Default genre colors by common words
  introduction: '#5AB8FF',
  guide: '#7BD87B',
  complete: '#7A8ADB',
  essential: '#4BD8B8',
  advanced: '#9B71E8',
  beginner: '#9BD89B',
};

// Generate a color based on book title/subject
export function generateBookColor(book) {
  const title = (book.title || '').toLowerCase();
  const subjects = (book.subjects || []).join(' ').toLowerCase();
  const searchText = `${title} ${subjects}`;
  
  // Check for keyword matches
  for (const [keyword, color] of Object.entries(colorKeywords)) {
    if (searchText.includes(keyword)) {
      return color;
    }
  }
  
  // Fallback: generate a bright, saturated color from title hash
  const str = book.title || 'book';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate bright, highly saturated colors
  const hue = Math.abs(hash % 360);
  const saturation = 70 + (Math.abs(hash >> 8) % 20); // 70-90%
  const lightness = 55 + (Math.abs(hash >> 16) % 15); // 55-70%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function generateSpineTextColor(bgColor) {
  // Parse color and determine if light or dark text needed
  if (bgColor.startsWith('hsl')) {
    const match = bgColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      const lightness = parseInt(match[3]);
      return lightness > 60 ? '#1a1a1a' : '#ffffff';
    }
  }
  
  // For hex colors, calculate relative luminance
  if (bgColor.startsWith('#')) {
    const hex = bgColor.slice(1);
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55 ? '#1a1a1a' : '#ffffff';
  }
  
  return '#ffffff';
}
