// News Bias Detector Content Script
console.log('News Bias Detector loaded!');

// Bias detection patterns
const biasPatterns = {
  emotional: {
    keywords: [
      'shocking', 'outrageous', 'devastating', 'heartbreaking', 'terrifying', 'horrifying',
      'unbelievable', 'incredible', 'amazing', 'stunning', 'breathtaking', 'mind-blowing',
      'crisis', 'catastrophe', 'disaster', 'nightmare', 'scandal', 'outrage',
      'furious', 'livid', 'devastated', 'shocked', 'stunned', 'appalled'
    ],
    weight: 1.0
  },
  sensational: {
    keywords: [
      'breaking', 'exclusive', 'urgent', 'alert', 'warning', 'emergency',
      'must-read', 'you won\'t believe', 'shocking truth', 'hidden secret',
      'exposed', 'revealed', 'leaked', 'insider', 'confidential',
      'bombshell', 'explosive', 'controversial', 'scandalous'
    ],
    weight: 1.2
  },
  political: {
    keywords: [
      'left-wing', 'right-wing', 'liberal', 'conservative', 'progressive', 'traditional',
      'establishment', 'elite', 'mainstream', 'alternative', 'radical', 'extremist',
      'partisan', 'bipartisan', 'political agenda', 'political correctness',
      'woke', 'cancel culture', 'virtue signaling', 'identity politics'
    ],
    weight: 0.8
  },
  subjective: {
    keywords: [
      'obviously', 'clearly', 'undoubtedly', 'certainly', 'definitely', 'absolutely',
      'everyone knows', 'it\'s clear that', 'without question', 'beyond doubt',
      'should', 'must', 'need to', 'have to', 'ought to', 'supposed to',
      'good', 'bad', 'terrible', 'excellent', 'awful', 'wonderful'
    ],
    weight: 0.9
  },
  exaggerated: {
    keywords: [
      'always', 'never', 'all', 'every', 'none', 'nothing', 'everything',
      'completely', 'totally', 'entirely', 'absolutely', 'perfectly',
      'massive', 'huge', 'enormous', 'tiny', 'miniscule', 'gigantic',
      'revolutionary', 'game-changing', 'historic', 'unprecedented'
    ],
    weight: 1.1
  }
};

let biasAnalysis = {
  totalScore: 0,
  breakdown: {},
  highlightedElements: []
};

// Analyze text for bias
function analyzeText(text) {
  const analysis = {
    emotional: 0,
    sensational: 0,
    political: 0,
    subjective: 0,
    exaggerated: 0
  };

  const words = text.toLowerCase().split(/\s+/);
  
  Object.keys(biasPatterns).forEach(category => {
    const pattern = biasPatterns[category];
    pattern.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        analysis[category] += matches.length * pattern.weight;
      }
    });
  });

  return analysis;
}

// Highlight biased text
function highlightBiases() {
  // Remove existing highlights
  clearHighlights();
  
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
  let totalScore = 0;
  let breakdown = {};

  textElements.forEach(element => {
    const text = element.textContent;
    if (text.length < 20) return; // Skip short text

    const analysis = analyzeText(text);
    const elementScore = Object.values(analysis).reduce((sum, score) => sum + score, 0);
    
    if (elementScore > 0) {
      totalScore += elementScore;
      
      // Find the dominant bias type
      const dominantBias = Object.keys(analysis).reduce((a, b) => 
        analysis[a] > analysis[b] ? a : b
      );
      
      if (analysis[dominantBias] > 0) {
        breakdown[dominantBias] = (breakdown[dominantBias] || 0) + analysis[dominantBias];
        
        // Highlight the element
        element.classList.add('bias-highlight', dominantBias);
        
        // Add tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'bias-tooltip';
        tooltip.textContent = `${dominantBias.charAt(0).toUpperCase() + dominantBias.slice(1)} bias detected (${analysis[dominantBias].toFixed(1)} points)`;
        element.appendChild(tooltip);
        
        biasAnalysis.highlightedElements.push(element);
      }
    }
  });

  biasAnalysis.totalScore = totalScore;
  biasAnalysis.breakdown = breakdown;
  
  // Update UI
  updateBiasIndicator();
  updateBiasControls();
}

// Clear all highlights
function clearHighlights() {
  biasAnalysis.highlightedElements.forEach(element => {
    element.classList.remove('bias-highlight', 'emotional', 'sensational', 'political', 'subjective', 'exaggerated');
    const tooltip = element.querySelector('.bias-tooltip');
    if (tooltip) {
      tooltip.remove();
    }
  });
  biasAnalysis.highlightedElements = [];
}

// Update bias indicator
function updateBiasIndicator() {
  let indicator = document.getElementById('bias-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'bias-indicator';
    indicator.className = 'bias-indicator';
    document.body.appendChild(indicator);
  }

  const score = biasAnalysis.totalScore;
  let level = 'Low';
  let color = '#4caf50';
  
  if (score > 20) {
    level = 'High';
    color = '#f44336';
  } else if (score > 10) {
    level = 'Medium';
    color = '#ff9800';
  }

  indicator.innerHTML = `
    <div class="bias-score" style="color: ${color}">
      Bias Score: ${score.toFixed(1)} (${level})
    </div>
    <div class="bias-breakdown">
      ${Object.entries(biasAnalysis.breakdown).map(([type, value]) => 
        `<div>${type.charAt(0).toUpperCase() + type.slice(1)}: ${value.toFixed(1)}</div>`
      ).join('')}
    </div>
  `;
}

// Update bias controls
function updateBiasControls() {
  let controls = document.getElementById('bias-controls');
  if (!controls) {
    controls = document.createElement('div');
    controls.id = 'bias-controls';
    controls.className = 'bias-controls';
    document.body.appendChild(controls);
  }

  controls.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 10px;">Bias Controls</div>
    <button id="toggle-highlights">Toggle Highlights</button>
    <button id="clear-highlights">Clear All</button>
    <button id="show-breakdown">Show Breakdown</button>
  `;

  // Add event listeners
  document.getElementById('toggle-highlights').addEventListener('click', toggleHighlights);
  document.getElementById('clear-highlights').addEventListener('click', clearHighlights);
  document.getElementById('show-breakdown').addEventListener('click', showBreakdown);
}

// Toggle highlights visibility
function toggleHighlights() {
  const highlights = document.querySelectorAll('.bias-highlight');
  const isVisible = highlights[0] && highlights[0].style.display !== 'none';
  
  highlights.forEach(highlight => {
    highlight.style.display = isVisible ? 'none' : '';
  });
  
  const button = document.getElementById('toggle-highlights');
  button.textContent = isVisible ? 'Show Highlights' : 'Hide Highlights';
  button.classList.toggle('active', !isVisible);
}

// Show detailed breakdown
function showBreakdown() {
  const breakdown = Object.entries(biasAnalysis.breakdown)
    .sort(([,a], [,b]) => b - a)
    .map(([type, score]) => `${type.charAt(0).toUpperCase() + type.slice(1)}: ${score.toFixed(1)}`)
    .join('\n');
  
  alert(`Bias Breakdown:\n\n${breakdown}\n\nTotal Score: ${biasAnalysis.totalScore.toFixed(1)}`);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'analyzeBias') {
    highlightBiases();
    sendResponse({
      success: true,
      score: biasAnalysis.totalScore,
      breakdown: biasAnalysis.breakdown
    });
  } else if (request.action === 'clearBias') {
    clearHighlights();
    const indicator = document.getElementById('bias-indicator');
    const controls = document.getElementById('bias-controls');
    if (indicator) indicator.remove();
    if (controls) controls.remove();
    sendResponse({success: true});
  }
});

// Show popup indicator when page loads, but don't analyze until user clicks
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(showPopupIndicator, 1000);
  });
} else {
  setTimeout(showPopupIndicator, 1000);
}

// Show a subtle popup indicator
function showPopupIndicator() {
  const indicator = document.createElement('div');
  indicator.innerHTML = '🔍 News Bias Detector Ready';
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(102, 126, 234, 0.9);
    color: white;
    padding: 8px 15px;
    border-radius: 20px;
    font-size: 12px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    cursor: pointer;
    transition: all 0.3s ease;
  `;
  
  indicator.addEventListener('click', () => {
    indicator.style.display = 'none';
  });
  
  document.body.appendChild(indicator);
  
  // Remove indicator after 5 seconds
  setTimeout(() => {
    if (indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }
  }, 5000);
}
