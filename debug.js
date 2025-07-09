// Debug script to check for any issues
console.log('Debug script loaded');

// Check if we have a root element
console.log('Root element:', document.getElementById('root'));

// Check if React is loaded
console.log('React loaded:', typeof React !== 'undefined' ? 'Yes' : 'No');

// Check for environment variables
console.log('API_KEY available:', typeof process !== 'undefined' && process.env && process.env.API_KEY ? 'Yes' : 'No');
console.log('GEMINI_API_KEY available:', typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY ? 'Yes' : 'No');

// Check for any errors
window.onerror = function(message, source, lineno, colno, error) {
  console.error('JavaScript error:', message, 'at', source, ':', lineno, ':', colno);
  console.error('Error object:', error);
  
  // Display error on page for visibility
  const errorDiv = document.createElement('div');
  errorDiv.style.color = 'red';
  errorDiv.style.backgroundColor = 'black';
  errorDiv.style.padding = '20px';
  errorDiv.style.margin = '20px';
  errorDiv.style.borderRadius = '5px';
  errorDiv.style.fontFamily = 'monospace';
  errorDiv.innerHTML = `<h2>Error Detected</h2>
    <p><strong>Message:</strong> ${message}</p>
    <p><strong>Source:</strong> ${source}</p>
    <p><strong>Line:Column:</strong> ${lineno}:${colno}</p>
    <p><strong>Stack:</strong> ${error && error.stack ? error.stack.replace(/\n/g, '<br>') : 'Not available'}</p>`;
  
  document.body.prepend(errorDiv);
  
  return true; // Prevents the default error handler
};
