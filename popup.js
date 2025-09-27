// Advanced Bias Detection Popup Script
document.addEventListener('DOMContentLoaded', function() {
  const scoreNumber = document.getElementById('scoreNumber');
  const scoreIcon = document.getElementById('scoreIcon');
  const scoreLabel = document.getElementById('scoreLabel');
  const breakdown = document.getElementById('breakdown');
  const breakdownContent = document.getElementById('breakdownContent');
  const status = document.getElementById('status');
  const analyzeBtn = document.getElementById('analyze');
  const clearBtn = document.getElementById('clear');
  
  // Feature cards
  const summaryFeature = document.getElementById('summaryFeature');
  const biasFeature = document.getElementById('biasFeature');
  const highlightFeature = document.getElementById('highlightFeature');
  const scopeFeature = document.getElementById('scopeFeature');

  let currentAnalysis = null;

  // Update score display
  function updateScoreDisplay(score, breakdownData) {
    scoreNumber.textContent = score.toFixed(1);
    
    let level = 'Low Risk';
    let iconClass = 'score-low';
    let icon = '✓';
    
    if (score > 60) {
      level = 'High Risk';
      iconClass = 'score-high';
      icon = '⚠';
    } else if (score > 30) {
      level = 'Medium Risk';
      iconClass = 'score-medium';
      icon = '⚡';
    }
    
    scoreLabel.textContent = level;
    scoreIcon.className = `score-icon ${iconClass}`;
    scoreIcon.textContent = icon;
    
    // Update breakdown
    if (breakdownData && Object.keys(breakdownData).length > 0) {
      breakdownContent.innerHTML = Object.entries(breakdownData)
        .sort(([,a], [,b]) => b - a)
        .map(([type, value]) => `
          <div class="breakdown-item">
            <span class="breakdown-type">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            <span class="breakdown-value">${value.toFixed(1)}</span>
          </div>
        `).join('');
    }
  }

  // Analyze current page
  analyzeBtn.addEventListener('click', function() {
    status.textContent = 'Analyzing page...';
    analyzeBtn.disabled = true;
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'analyzeBias'}, function(response) {
        analyzeBtn.disabled = false;
        
        if (chrome.runtime.lastError) {
          status.textContent = 'Error: Could not analyze page. Make sure you\'re on a news website.';
          return;
        }
        
        if (response && response.success) {
          currentAnalysis = response;
          updateScoreDisplay(response.score, response.breakdown);
          
          // Show LLM analysis info if available
          if (response.llmAnalysis && response.llmAnalysis.length > 0) {
            status.textContent = `LLM Analysis complete! Found ${response.llmAnalysis.length} biased sections with detailed analysis.`;
            console.log('LLM Analysis Results:', response.llmAnalysis);
          } else {
            status.textContent = `Analysis complete! Found ${Object.keys(response.breakdown).length} bias types.`;
          }
          
          // Log summary and bias reasons
          if (response.articleSummary) {
            console.log('Article Summary:', response.articleSummary);
          }
          if (response.biasReasons && response.biasReasons.length > 0) {
            console.log('Bias Reasons:', response.biasReasons);
          }
          
          // Show breakdown if there's data
          if (Object.keys(response.breakdown).length > 0) {
            breakdown.style.display = 'block';
          }
        } else {
          status.textContent = 'No biases detected or analysis failed.';
        }
      });
    });
  });

  // Clear analysis
  clearBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'clearBias'}, function(response) {
        if (chrome.runtime.lastError) {
          status.textContent = 'Error: Could not clear analysis.';
          return;
        }
        
        // Reset UI
        scoreValue.textContent = '--';
        scoreLabel.textContent = 'Analyzing...';
        scoreValue.className = 'score-value';
        breakdown.style.display = 'none';
        currentAnalysis = null;
        status.textContent = 'Analysis cleared. Click "Analyze Page" to detect biases.';
      });
    });
  });

  // Feature card event listeners
  summaryFeature.addEventListener('click', function() {
    if (currentAnalysis && currentAnalysis.articleSummary) {
      alert(`Article Summary:\n\n${currentAnalysis.articleSummary}`);
    } else {
      alert('No summary available. Please analyze the page first.');
    }
  });
  
  biasFeature.addEventListener('click', function() {
    if (currentAnalysis && currentAnalysis.biasReasons) {
      const reasons = currentAnalysis.biasReasons.slice(0, 5).join('\n');
      alert(`Bias Analysis:\n\n${reasons}`);
    } else {
      alert('No bias analysis available. Please analyze the page first.');
    }
  });
  
  highlightFeature.addEventListener('click', function() {
    // Send message to content script to toggle highlights
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleHighlights'});
    });
  });
  
  scopeFeature.addEventListener('click', function() {
    if (currentAnalysis) {
      const scope = `Analysis Methods:\n• NLP + Bias Detection Models\n• Sentiment Analysis\n• Gender/Racial/Age Bias Detection\n• AI-Generated Content Detection\n\nEmotional Diet:\nPositive: ${currentAnalysis.emotionalDiet?.positive || 0}%\nNegative: ${currentAnalysis.emotionalDiet?.negative || 0}%\nNeutral: ${currentAnalysis.emotionalDiet?.neutral || 0}%`;
      alert(scope);
    } else {
      alert('No analysis data available. Please analyze the page first.');
    }
  });

  // Auto-analyze if page was already analyzed
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'getCurrentAnalysis'}, function(response) {
      if (response && response.success && response.score > 0) {
        currentAnalysis = response;
        updateScoreDisplay(response.score, response.breakdown);
        status.textContent = 'Previous analysis found. Click "Analyze Page" to refresh.';
        
        if (Object.keys(response.breakdown).length > 0) {
          breakdown.style.display = 'block';
        }
      }
    });
  });
});
