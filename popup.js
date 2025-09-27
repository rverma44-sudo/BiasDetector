// News Bias Detector Popup Script
document.addEventListener('DOMContentLoaded', function() {
  const scoreValue = document.getElementById('scoreValue');
  const scoreLabel = document.getElementById('scoreLabel');
  const breakdown = document.getElementById('breakdown');
  const breakdownContent = document.getElementById('breakdownContent');
  const status = document.getElementById('status');
  const analyzeBtn = document.getElementById('analyze');
  const clearBtn = document.getElementById('clear');
  const toggleBreakdownBtn = document.getElementById('toggleBreakdown');

  let currentAnalysis = null;

  // Update score display
  function updateScoreDisplay(score, breakdownData) {
    scoreValue.textContent = score.toFixed(1);
    
    let level = 'Low';
    let className = 'score-low';
    
    if (score > 20) {
      level = 'High';
      className = 'score-high';
    } else if (score > 10) {
      level = 'Medium';
      className = 'score-medium';
    }
    
    scoreLabel.textContent = `${level} Bias Detected`;
    scoreValue.className = `score-value ${className}`;
    
    // Update breakdown
    if (breakdownData && Object.keys(breakdownData).length > 0) {
      breakdownContent.innerHTML = Object.entries(breakdownData)
        .sort(([,a], [,b]) => b - a)
        .map(([type, value]) => `
          <div class="bias-item">
            <span class="bias-type">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            <span class="bias-value">${value.toFixed(1)}</span>
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
          status.textContent = `Analysis complete! Found ${Object.keys(response.breakdown).length} bias types.`;
          
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

  // Toggle breakdown visibility
  toggleBreakdownBtn.addEventListener('click', function() {
    if (breakdown.style.display === 'none') {
      breakdown.style.display = 'block';
      toggleBreakdownBtn.textContent = '📊 Hide Breakdown';
    } else {
      breakdown.style.display = 'none';
      toggleBreakdownBtn.textContent = '📊 Show Breakdown';
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
