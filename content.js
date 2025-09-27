// Advanced Bias Detection Extension
console.log('Advanced Bias Detection Extension loaded!');

// Comprehensive bias detection patterns
const biasPatterns = {
  // Emotional manipulation
  emotional: {
    keywords: [
      'shocking', 'outrageous', 'devastating', 'heartbreaking', 'terrifying', 'horrifying',
      'unbelievable', 'incredible', 'amazing', 'stunning', 'breathtaking', 'mind-blowing',
      'crisis', 'catastrophe', 'disaster', 'nightmare', 'scandal', 'outrage',
      'furious', 'livid', 'devastated', 'shocked', 'stunned', 'appalled',
      'dangerous', 'threat', 'unleash', 'strengthening', 'flood', 'panic',
      'fear', 'terror', 'horror', 'tragedy', 'devastation'
    ],
    weight: 1.0
  },
  // Sensationalism and clickbait
  sensational: {
    keywords: [
      'breaking', 'exclusive', 'urgent', 'alert', 'warning', 'emergency',
      'must-read', 'you won\'t believe', 'shocking truth', 'hidden secret',
      'exposed', 'revealed', 'leaked', 'insider', 'confidential',
      'bombshell', 'explosive', 'controversial', 'scandalous', 'viral',
      'trending', 'hot', 'buzz', 'sensation', 'phenomenon'
    ],
    weight: 1.2
  },
  // Political bias
  political: {
    keywords: [
      'left-wing', 'right-wing', 'liberal', 'conservative', 'progressive', 'traditional',
      'establishment', 'elite', 'mainstream', 'alternative', 'radical', 'extremist',
      'partisan', 'bipartisan', 'political agenda', 'political correctness',
      'woke', 'cancel culture', 'virtue signaling', 'identity politics',
      'socialist', 'capitalist', 'authoritarian', 'democratic', 'republican'
    ],
    weight: 0.8
  },
  // Subjective language
  subjective: {
    keywords: [
      'obviously', 'clearly', 'undoubtedly', 'certainly', 'definitely', 'absolutely',
      'everyone knows', 'it\'s clear that', 'without question', 'beyond doubt',
      'should', 'must', 'need to', 'have to', 'ought to', 'supposed to',
      'good', 'bad', 'terrible', 'excellent', 'awful', 'wonderful',
      'obviously', 'naturally', 'of course', 'surely', 'indeed'
    ],
    weight: 0.9
  },
  // Exaggeration and hyperbole
  exaggerated: {
    keywords: [
      'always', 'never', 'all', 'every', 'none', 'nothing', 'everything',
      'completely', 'totally', 'entirely', 'absolutely', 'perfectly',
      'massive', 'huge', 'enormous', 'tiny', 'miniscule', 'gigantic',
      'revolutionary', 'game-changing', 'historic', 'unprecedented',
      'incredible', 'amazing', 'stunning', 'breathtaking', 'mind-blowing'
    ],
    weight: 1.1
  },
  // Gender bias
  gendered: {
    keywords: [
      'aggressive', 'assertive', 'bossy', 'emotional', 'hysterical', 'shrill',
      'nagging', 'bitchy', 'catty', 'dramatic', 'overly sensitive',
      'strong', 'tough', 'decisive', 'confident', 'ambitious', 'competitive',
      'nurturing', 'caring', 'supportive', 'collaborative', 'team player',
      'he/she', 'him/her', 'his/her', 'man up', 'boys will be boys'
    ],
    weight: 1.3
  },
  // Racial/cultural bias
  racial: {
    keywords: [
      'thug', 'ghetto', 'urban', 'inner city', 'welfare queen', 'illegal alien',
      'model minority', 'exotic', 'articulate', 'well-spoken', 'surprisingly',
      'for a [race]', 'typically', 'usually', 'generally', 'most [race]',
      'all [race] people', 'they always', 'they never', 'those people'
    ],
    weight: 1.5
  },
  // Age bias
  ageist: {
    keywords: [
      'too old', 'too young', 'over the hill', 'past their prime', 'set in their ways',
      'millennial', 'boomer', 'gen z', 'entitled', 'lazy', 'out of touch',
      'digital native', 'tech-savvy', 'old-fashioned', 'behind the times',
      'energetic', 'fresh', 'experienced', 'mature', 'wise', 'naive'
    ],
    weight: 1.0
  },
  // Misleading statistics
  misleading: {
    keywords: [
      'studies show', 'research proves', 'scientists say', 'experts agree',
      'according to', 'data suggests', 'statistics indicate', 'figures show',
      'correlation', 'causation', 'linked to', 'associated with',
      'increases risk', 'decreases chance', 'more likely', 'less likely'
    ],
    weight: 1.2
  }
};

let biasAnalysis = {
  totalScore: 0,
  breakdown: {},
  highlightedElements: [],
  llmAnalysis: null,
  articleSummary: null,
  biasReasons: [],
  sentimentAnalysis: null,
  aiGenerated: false,
  emotionalDiet: { positive: 0, negative: 0, neutral: 0 },
  specificPhrases: []
};

// LLM Configuration
const LLM_CONFIG = {
  enabled: true,
  apiUrl: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
  fallbackToKeywords: true
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
        const score = matches.length * pattern.weight;
        analysis[category] += score;
        console.log(`Found "${keyword}" (${matches.length} times) in ${category}: +${score}`);
      }
    });
  });

  const totalScore = Object.values(analysis).reduce((sum, score) => sum + score, 0);
  if (totalScore > 0) {
    console.log('Total bias score for text:', totalScore, 'Breakdown:', analysis);
  }

  return analysis;
}

// Generate article summary using LLM
async function generateArticleSummary() {
  console.log('Starting summary generation...');
  
  try {
    // Focus on main article content, not navigation/privacy text
    const articleSelectors = [
      'article p', 'article div', 'article section',
      '.article p', '.article div', '.article-content p',
      '.story p', '.story div', '.post p', '.post div',
      '.content p', '.content div', '[role="main"] p',
      'main p', 'main div', '.entry p', '.entry div'
    ];
    
    let textElements = [];
    for (const selector of articleSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        textElements = Array.from(elements);
        console.log(`Found ${elements.length} elements with selector: ${selector}`);
        break;
      }
    }
    
    // Fallback to all paragraphs if no article-specific elements found
    if (textElements.length === 0) {
      textElements = Array.from(document.querySelectorAll('p'));
      console.log('Using fallback: all paragraphs');
    }
    
    // Filter out navigation, privacy, and company text
    const filteredText = textElements
      .map(el => el.textContent.trim())
      .filter(text => {
        // Skip very short text
        if (text.length < 100) return false;
        
        // Skip navigation/privacy/company text
        const lowerText = text.toLowerCase();
        const skipPatterns = [
          'privacy policy', 'terms of service', 'cookie policy',
          'subscribe to', 'newsletter', 'follow us', 'share this',
          'advertisement', 'sponsored', 'related articles',
          'copyright', 'all rights reserved', 'contact us',
          'about us', 'careers', 'press release', 'media kit',
          'sign up', 'log in', 'register', 'account',
          'navigation', 'menu', 'search', 'browse',
          'we use cookies', 'accept cookies', 'decline',
          'this website uses', 'by continuing to use'
        ];
        
        return !skipPatterns.some(pattern => lowerText.includes(pattern));
      })
      .slice(0, 8) // Limit to first 8 paragraphs
      .join(' ');

    console.log('Filtered article text length:', filteredText.length);
    console.log('Article text preview:', filteredText.substring(0, 300) + '...');

    if (filteredText.length < 200) {
      console.log('Article text too short for summary');
      return generateFallbackSummary();
    }

    // Try LLM summary first
    if (LLM_CONFIG.enabled) {
      try {
        const prompt = `Summarize this news article in 2-3 sentences, focusing on the main story and key facts:

${filteredText.substring(0, 1200)}

Summary:`;

        console.log('Sending summary request to LLM...');
        const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_length: 150,
              temperature: 0.3
            }
          })
        });

        console.log('LLM response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Summary API error: ${response.status}`);
        }

        const result = await response.json();
        console.log('LLM result:', result);
        
        const summary = result[0]?.generated_text || '';
        console.log('Raw LLM summary:', summary);
        
        const cleanSummary = summary.replace(/^Summary:\s*/i, '').trim();
        console.log('Cleaned summary:', cleanSummary);
        
        if (cleanSummary.length > 10) {
          return cleanSummary;
        }
      } catch (llmError) {
        console.log('LLM summary failed:', llmError.message);
      }
    }
    
    // Fallback to simple extraction
    return generateFallbackSummary();
    
  } catch (error) {
    console.log('Summary generation failed:', error.message);
    return generateFallbackSummary();
  }
}

// Generate a simple fallback summary
function generateFallbackSummary() {
  console.log('Generating fallback summary...');
  
  // Use the same filtering logic as the main function
  const articleSelectors = [
    'article p', 'article div', 'article section',
    '.article p', '.article div', '.article-content p',
    '.story p', '.story div', '.post p', '.post div',
    '.content p', '.content div', '[role="main"] p',
    'main p', 'main div', '.entry p', '.entry div'
  ];
  
  let textElements = [];
  for (const selector of articleSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      textElements = Array.from(elements);
      break;
    }
  }
  
  if (textElements.length === 0) {
    textElements = Array.from(document.querySelectorAll('p'));
  }
  
  const filteredParagraphs = textElements
    .map(el => el.textContent.trim())
    .filter(text => {
      if (text.length < 100) return false;
      
      const lowerText = text.toLowerCase();
      const skipPatterns = [
        'privacy policy', 'terms of service', 'cookie policy',
        'subscribe to', 'newsletter', 'follow us', 'share this',
        'advertisement', 'sponsored', 'related articles',
        'copyright', 'all rights reserved', 'contact us',
        'about us', 'careers', 'press release', 'media kit',
        'sign up', 'log in', 'register', 'account',
        'navigation', 'menu', 'search', 'browse',
        'we use cookies', 'accept cookies', 'decline',
        'this website uses', 'by continuing to use'
      ];
      
      return !skipPatterns.some(pattern => lowerText.includes(pattern));
    })
    .slice(0, 3);
  
  if (filteredParagraphs.length === 0) {
    return 'Summary not available - insufficient article content found.';
  }
  
  // Create a simple summary from first few paragraphs
  const summary = filteredParagraphs
    .map(p => p.split('.').slice(0, 2).join('.'))
    .join(' ')
    .substring(0, 300);
  
  console.log('Fallback summary generated:', summary);
  return summary + (summary.length >= 300 ? '...' : '');
}

// Generate detailed bias reasons
function generateBiasReasons(breakdown, llmAnalysis) {
  const reasons = [];
  
  // Add reasons based on breakdown scores
  Object.entries(breakdown).forEach(([type, score]) => {
    if (score > 5) {
      const typeNames = {
        emotional: 'Emotional Language',
        sensational: 'Sensationalism', 
        political: 'Political Bias',
        subjective: 'Subjective Language',
        exaggerated: 'Exaggeration'
      };
      
      reasons.push(`• High ${typeNames[type]} detected (${score.toFixed(1)} points)`);
    }
  });
  
  // Add LLM-specific reasons
  if (llmAnalysis && llmAnalysis.length > 0) {
    llmAnalysis.forEach(analysis => {
      if (analysis.analysis.explanation) {
        const explanation = analysis.analysis.explanation;
        if (explanation.includes('emotional') || explanation.includes('sensational')) {
          reasons.push(`• LLM detected biased language in: "${analysis.text.substring(0, 50)}..."`);
        }
      }
    });
  }
  
  // Add general reasons based on score
  const totalScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0);
  if (totalScore > 30) {
    reasons.push('• Overall high bias score indicates multiple problematic elements');
  }
  if (totalScore > 60) {
    reasons.push('• Very high bias score suggests significant editorial slant');
  }
  
  return reasons.slice(0, 5); // Limit to 5 reasons
}

// Sentiment analysis
function analyzeSentiment(text) {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'positive', 'happy', 'joy', 'love', 'best', 'better', 'improve', 'success', 'win', 'victory'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'negative', 'sad', 'angry', 'hate', 'worst', 'worse', 'fail', 'failure', 'lose', 'defeat', 'crisis', 'problem'];
  
  const words = text.toLowerCase().split(/\s+/);
  let positive = 0, negative = 0, neutral = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positive++;
    else if (negativeWords.includes(word)) negative++;
    else neutral++;
  });
  
  const total = positive + negative + neutral;
  return {
    positive: Math.round((positive / total) * 100),
    negative: Math.round((negative / total) * 100),
    neutral: Math.round((neutral / total) * 100)
  };
}

// AI-generated content detection
function detectAIGenerated(text) {
  const aiPatterns = [
    'as an ai', 'i am an ai', 'i cannot', 'i don\'t have', 'i\'m not able',
    'i apologize', 'i understand', 'let me help', 'i\'m here to',
    'based on my training', 'my knowledge', 'my understanding',
    'i\'m designed to', 'my purpose is', 'i\'m programmed'
  ];
  
  const lowerText = text.toLowerCase();
  return aiPatterns.some(pattern => lowerText.includes(pattern));
}

// Extract specific biased phrases
function extractBiasedPhrases(text, analysis) {
  const phrases = [];
  Object.entries(analysis).forEach(([type, score]) => {
    if (score > 1) {
      const keywords = biasPatterns[type].keywords;
      keywords.forEach(keyword => {
        if (text.toLowerCase().includes(keyword.toLowerCase())) {
          phrases.push(keyword);
        }
      });
    }
  });
  return [...new Set(phrases)]; // Remove duplicates
}

// LLM-based bias analysis using Hugging Face API
async function analyzeTextWithLLM(text) {
  if (!LLM_CONFIG.enabled) {
    return null;
  }

  try {
    // Create a prompt for bias analysis
    const prompt = `Analyze the following news text for bias. Rate each bias type from 0-10 and provide a brief explanation:

Text: "${text.substring(0, 500)}"

Rate these bias types:
- Emotional language (0-10): 
- Sensationalism (0-10): 
- Political bias (0-10): 
- Subjective language (0-10): 
- Exaggeration (0-10): 

Overall bias score (0-100): 
Explanation:`;

    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 200,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('LLM Analysis Result:', result);
    
    // Parse the LLM response (this is a simplified parser)
    return parseLLMResponse(result[0]?.generated_text || '');
    
  } catch (error) {
    console.log('LLM analysis failed, falling back to keyword detection:', error.message);
    return null;
  }
}

// Parse LLM response into structured bias analysis
function parseLLMResponse(response) {
  try {
    // Extract scores using regex patterns
    const emotionalMatch = response.match(/Emotional language.*?(\d+)/i);
    const sensationalMatch = response.match(/Sensationalism.*?(\d+)/i);
    const politicalMatch = response.match(/Political bias.*?(\d+)/i);
    const subjectiveMatch = response.match(/Subjective language.*?(\d+)/i);
    const exaggerationMatch = response.match(/Exaggeration.*?(\d+)/i);
    const overallMatch = response.match(/Overall bias score.*?(\d+)/i);

    const analysis = {
      emotional: emotionalMatch ? parseInt(emotionalMatch[1]) : 0,
      sensational: sensationalMatch ? parseInt(sensationalMatch[1]) : 0,
      political: politicalMatch ? parseInt(politicalMatch[1]) : 0,
      subjective: subjectiveMatch ? parseInt(subjectiveMatch[1]) : 0,
      exaggerated: exaggerationMatch ? parseInt(exaggerationMatch[1]) : 0,
      overall: overallMatch ? parseInt(overallMatch[1]) : 0,
      explanation: response
    };

    console.log('Parsed LLM Analysis:', analysis);
    return analysis;
    
  } catch (error) {
    console.log('Error parsing LLM response:', error);
    return null;
  }
}

// Enhanced bias analysis combining LLM and keyword detection
async function analyzeTextEnhanced(text) {
  // Try LLM analysis first
  const llmResult = await analyzeTextWithLLM(text);
  
  if (llmResult && llmResult.overall > 0) {
    console.log('Using LLM analysis result');
    return {
      method: 'llm',
      analysis: llmResult,
      score: llmResult.overall
    };
  }
  
  // Fallback to keyword detection
  console.log('Using keyword-based analysis');
  const keywordResult = analyzeText(text);
  const score = Object.values(keywordResult).reduce((sum, val) => sum + val, 0);
  
  return {
    method: 'keywords',
    analysis: keywordResult,
    score: score
  };
}

// Check if element is likely a navigation or UI element
function isNavigationElement(element) {
  const className = element.className.toLowerCase();
  const id = element.id.toLowerCase();
  const parentClassName = element.parentElement?.className?.toLowerCase() || '';
  const parentId = element.parentElement?.id?.toLowerCase() || '';
  
  // Common navigation/UI class patterns
  const navPatterns = [
    'nav', 'menu', 'header', 'footer', 'sidebar', 'advertisement', 'ad-',
    'banner', 'promo', 'social', 'share', 'comment', 'related', 'recommended',
    'newsletter', 'subscribe', 'login', 'signup', 'cookie', 'privacy',
    'terms', 'copyright', 'disclaimer', 'sponsor', 'partner'
  ];
  
  // Check element and parent classes/IDs
  const allText = `${className} ${id} ${parentClassName} ${parentId}`;
  
  return navPatterns.some(pattern => 
    allText.includes(pattern) || 
    element.closest(`.${pattern}, #${pattern}, [class*="${pattern}"]`)
  );
}

// Highlight specific biased phrases within an element
function highlightBiasedPhrases(element, biasType, score) {
  const text = element.textContent;
  const biasKeywords = biasPatterns[biasType].keywords;
  
  let highlightedText = text;
  let hasHighlights = false;
  
  // Find and highlight biased keywords/phrases
  biasKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(highlightedText)) {
      highlightedText = highlightedText.replace(regex, `<span class="bias-highlight ${biasType}">$&</span>`);
      hasHighlights = true;
    }
  });
  
  if (hasHighlights) {
    // Create wrapper with tooltip
    const wrapper = document.createElement('div');
    wrapper.innerHTML = highlightedText;
    wrapper.style.position = 'relative';
    
    // Add tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'bias-tooltip';
    tooltip.textContent = `${biasType.charAt(0).toUpperCase() + biasType.slice(1)} bias detected (${score.toFixed(1)} points)`;
    wrapper.appendChild(tooltip);
    
    // Replace original element content
    element.innerHTML = '';
    element.appendChild(wrapper);
    
    biasAnalysis.highlightedElements.push(element);
  }
}

// Highlight biased text
async function highlightBiases() {
  // Remove existing highlights
  clearHighlights();
  
  // Temporarily use all paragraphs for debugging
  const textElements = document.querySelectorAll('p');
  console.log('Found', textElements.length, 'paragraphs to analyze');
  let totalScore = 0;
  let breakdown = {};
  let llmAnalyses = [];

  // Process elements with enhanced analysis
  for (const element of textElements) {
    const text = element.textContent.trim();
    
    // Skip very short text
    if (text.length < 20) continue;
    
    console.log('Analyzing text:', text.substring(0, 100) + '...');
    
    // Use enhanced analysis (LLM + keywords)
    const result = await analyzeTextEnhanced(text);
    
    if (result.score > 0.5) { // Threshold for highlighting
      totalScore += result.score;
      
      if (result.method === 'llm') {
        // Store LLM analysis for detailed breakdown
        llmAnalyses.push({
          text: text.substring(0, 100),
          analysis: result.analysis,
          element: element
        });
        
        // Find dominant bias type from LLM analysis
        const llmAnalysis = result.analysis;
        const biasTypes = ['emotional', 'sensational', 'political', 'subjective', 'exaggerated'];
        const dominantBias = biasTypes.reduce((a, b) => 
          llmAnalysis[a] > llmAnalysis[b] ? a : b
        );
        
        if (llmAnalysis[dominantBias] > 3) { // LLM scores are 0-10
          breakdown[dominantBias] = (breakdown[dominantBias] || 0) + llmAnalysis[dominantBias];
          highlightBiasedPhrases(element, dominantBias, llmAnalysis[dominantBias]);
        }
      } else {
        // Keyword-based analysis
        const analysis = result.analysis;
        const dominantBias = Object.keys(analysis).reduce((a, b) => 
          analysis[a] > analysis[b] ? a : b
        );
        
        if (analysis[dominantBias] > 0.3) {
          breakdown[dominantBias] = (breakdown[dominantBias] || 0) + analysis[dominantBias];
          highlightBiasedPhrases(element, dominantBias, analysis[dominantBias]);
        }
      }
    }
  }

  // Cap the total score at 100
  biasAnalysis.totalScore = Math.min(totalScore, 100);
  biasAnalysis.breakdown = breakdown;
  biasAnalysis.llmAnalysis = llmAnalyses;
  
  // Generate article summary and bias reasons
  console.log('Generating article summary...');
  biasAnalysis.articleSummary = await generateArticleSummary();
  biasAnalysis.biasReasons = generateBiasReasons(breakdown, llmAnalyses);
  
  // Add sentiment analysis
  const allText = Array.from(textElements).map(el => el.textContent).join(' ');
  biasAnalysis.sentimentAnalysis = analyzeSentiment(allText);
  biasAnalysis.emotionalDiet = biasAnalysis.sentimentAnalysis;
  
  // Add AI detection
  biasAnalysis.aiGenerated = detectAIGenerated(allText);
  
  // Extract specific phrases
  biasAnalysis.specificPhrases = extractBiasedPhrases(allText, breakdown);
  
  console.log('Summary generation complete. Summary:', biasAnalysis.articleSummary);
  
  console.log('Final bias analysis:', biasAnalysis);
  
  // Update UI
  createBiasIndicator();
}

// Clear all highlights
function clearHighlights() {
  biasAnalysis.highlightedElements.forEach(element => {
    // Remove highlighted spans and restore original text
    const highlightedSpans = element.querySelectorAll('.bias-highlight');
    highlightedSpans.forEach(span => {
      span.replaceWith(span.textContent);
    });
    
    // Remove tooltips
    const tooltips = element.querySelectorAll('.bias-tooltip');
    tooltips.forEach(tooltip => tooltip.remove());
    
    // Remove wrapper divs if they exist
    const wrappers = element.querySelectorAll('div');
    wrappers.forEach(wrapper => {
      if (wrapper.parentElement === element) {
        wrapper.replaceWith(wrapper.innerHTML);
      }
    });
  });
  biasAnalysis.highlightedElements = [];
}

// Create main bias indicator popup
function createBiasIndicator() {
  // Remove existing indicator
  const existing = document.getElementById('bias-indicator');
  if (existing) existing.remove();

  const score = biasAnalysis.totalScore;
  let level = 'Low';
  let scoreClass = 'bias-score-low';
  let icon = '✓';
  
  if (score > 60) {
    level = 'High';
    scoreClass = 'bias-score-high';
    icon = '⚠';
  } else if (score > 30) {
    level = 'Medium';
    scoreClass = 'bias-score-medium';
    icon = '⚡';
  }

  const indicator = document.createElement('div');
  indicator.id = 'bias-indicator';
  indicator.className = 'bias-indicator';
  
  indicator.innerHTML = `
    <div class="bias-score">
      <div class="bias-score-icon ${scoreClass}">${icon}</div>
      <div>
        <div style="font-weight: 600;">Bias Score: ${score.toFixed(1)}</div>
        <div style="font-size: 11px; color: #666;">${level} Risk</div>
      </div>
    </div>
    <div class="bias-breakdown">
      ${Object.entries(biasAnalysis.breakdown).slice(0, 3).map(([type, value]) => 
        `<div><span>${type.charAt(0).toUpperCase() + type.slice(1)}</span><span>${value.toFixed(1)}</span></div>`
      ).join('')}
    </div>
    <div class="bias-toggles">
      <button id="show-summary" class="toggle-btn">📄 Summary</button>
      <button id="show-bias" class="toggle-btn">🔍 Bias Details</button>
      <button id="toggle-highlight" class="toggle-btn">🎯 Highlights</button>
      <button id="show-scope" class="toggle-btn">📊 Analysis</button>
    </div>
  `;
  
  document.body.appendChild(indicator);
  
  // Add event listeners
  setupIndicatorListeners();
}

// Setup event listeners for the main indicator
function setupIndicatorListeners() {
  const summaryBtn = document.getElementById('show-summary');
  const biasBtn = document.getElementById('show-bias');
  const highlightBtn = document.getElementById('toggle-highlight');
  const scopeBtn = document.getElementById('show-scope');
  
  if (summaryBtn) {
    summaryBtn.addEventListener('click', showSummaryPopup);
  }
  
  if (biasBtn) {
    biasBtn.addEventListener('click', showBiasPopup);
  }
  
  if (highlightBtn) {
    highlightBtn.addEventListener('click', toggleHighlights);
  }
  
  if (scopeBtn) {
    scopeBtn.addEventListener('click', showScopePopup);
  }
}

// Show summary popup (1-sentence analysis)
function showSummaryPopup() {
  const popup = createPopup('Article Summary', `
    <div style="font-size: 12px; line-height: 1.4; color: #333;">
      ${biasAnalysis.articleSummary || 'Generating summary...'}
    </div>
  `);
  document.body.appendChild(popup);
}

// Show bias details popup (4-5 bullet points)
function showBiasPopup() {
  const reasons = biasAnalysis.biasReasons.slice(0, 5);
  const popup = createPopup('Bias Analysis', `
    <div style="font-size: 11px; line-height: 1.3;">
      <div style="margin-bottom: 8px; font-weight: 600; color: #333;">Specific Biases Detected:</div>
      <ul style="margin: 0; padding-left: 15px;">
        ${reasons.map(reason => `<li style="margin-bottom: 4px; color: #666;">${reason}</li>`).join('')}
      </ul>
      ${biasAnalysis.specificPhrases.length > 0 ? `
        <div style="margin-top: 10px; font-weight: 600; color: #333;">Key Phrases:</div>
        <div style="font-size: 10px; color: #888;">
          ${biasAnalysis.specificPhrases.slice(0, 3).map(phrase => `"${phrase}"`).join(', ')}
        </div>
      ` : ''}
    </div>
  `);
  document.body.appendChild(popup);
}

// Show analysis scope popup
function showScopePopup() {
  const popup = createPopup('Analysis Scope', `
    <div style="font-size: 11px; line-height: 1.3;">
      <div style="margin-bottom: 8px; font-weight: 600; color: #333;">Detection Methods:</div>
      <ul style="margin: 0; padding-left: 15px;">
        <li style="margin-bottom: 3px; color: #666;">• NLP + Bias Detection Models</li>
        <li style="margin-bottom: 3px; color: #666;">• Sentiment Analysis</li>
        <li style="margin-bottom: 3px; color: #666;">• Gender/Racial/Age Bias Detection</li>
        <li style="margin-bottom: 3px; color: #666;">• Misleading Statistics Detection</li>
        <li style="margin-bottom: 3px; color: #666;">• AI-Generated Content Detection</li>
      </ul>
      <div style="margin-top: 10px; font-weight: 600; color: #333;">Emotional Diet:</div>
      <div style="font-size: 10px; color: #888;">
        Positive: ${biasAnalysis.emotionalDiet.positive}% | 
        Negative: ${biasAnalysis.emotionalDiet.negative}% | 
        Neutral: ${biasAnalysis.emotionalDiet.neutral}%
      </div>
      ${biasAnalysis.aiGenerated ? '<div style="margin-top: 8px; color: #dc3545; font-weight: 600;">⚠ Likely AI-Generated Content</div>' : ''}
    </div>
  `);
  document.body.appendChild(popup);
}

// Create reusable popup
function createPopup(title, content) {
  const popup = document.createElement('div');
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    z-index: 10001;
    max-width: 400px;
    max-height: 300px;
    overflow-y: auto;
  `;
  
  popup.innerHTML = `
    <div style="padding: 16px; border-bottom: 1px solid #e1e5e9; display: flex; justify-content: space-between; align-items: center;">
      <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #333;">${title}</h3>
      <button id="close-popup" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #666;">×</button>
    </div>
    <div style="padding: 16px;">
      ${content}
    </div>
  `;
  
  // Add close functionality
  popup.querySelector('#close-popup').addEventListener('click', () => {
    popup.remove();
  });
  
  // Close on background click
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.remove();
    }
  });
  
  return popup;
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
  if (button) {
    button.textContent = isVisible ? 'Show Highlights' : 'Hide Highlights';
    button.classList.toggle('active', !isVisible);
  }
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
    highlightBiases().then(() => {
      sendResponse({
        success: true,
        score: biasAnalysis.totalScore,
        breakdown: biasAnalysis.breakdown,
        llmAnalysis: biasAnalysis.llmAnalysis,
        articleSummary: biasAnalysis.articleSummary,
        biasReasons: biasAnalysis.biasReasons
      });
    });
    return true; // Keep message channel open for async response
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
