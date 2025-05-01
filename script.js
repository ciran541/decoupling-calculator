// Utility Functions
function formatMoney(amount) {
    return "$" + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }
  
  function calculateMonthlyInstallment(principal, rate, years) {
    const monthlyRate = rate / 12 / 100;
    const months = years * 12;
    if (monthlyRate === 0) return principal / months;
    return principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  }
  
  function calculateBSD(value) {
    let bsd = 0;
    if (value <= 180000) return value * 0.01;
    bsd += 180000 * 0.01;
    value -= 180000;
    if (value <= 180000) return bsd + value * 0.02;
    bsd += 180000 * 0.02;
    value -= 180000;
    if (value <= 640000) return bsd + value * 0.03;
    bsd += 640000 * 0.03;
    value -= 640000;
    if (value <= 500000) return bsd + value * 0.04;
    bsd += 500000 * 0.04;
    value -= 500000;
    if (value <= 1500000) return bsd + value * 0.05;
    bsd += 1500000 * 0.05;
    value -= 1500000;
    return bsd + value * 0.06;
  }
  
  function calculateABSD(value, residency) {
    switch (residency) {
      case 'Singaporean': return 0;
      case 'PR': return value * 0.05;
      case 'Foreigner': return value * 0.60;
      default: return 0;
    }
  }
  
  function calculateSSD(value, yearsOwned) {
    const rates = [0.12, 0.08, 0.04, 0];
    return value * rates[parseInt(yearsOwned)];
  }
  
  // Validation Functions
  function validatePropertyValuation(value) {
    if (!value || isNaN(value)) return "Please enter a valid valuation";
    if (value < 100000) return "Valuation must be at least S$100,000";
    return null;
  }
  
  function validateOutstandingLoan(value) {
    if (isNaN(value)) return "Please enter a valid loan amount";
    if (value < 0) return "Loan amount cannot be negative";
    return null;
  }
  
  function validateBuyerShare(value, sellerShare) {
    if (!value || isNaN(value)) return "Please enter a valid percentage";
    if (value < 1 || value > 99) return "Share must be between 1% and 99%";
    if (value + sellerShare !== 100) return "Buyer and Seller shares must total 100%";
    return null;
  }
  
  function validateBuyerAge(value) {
    if (!value || isNaN(value)) return "Please enter a valid age";
    if (value < 21) return "Age must be at least 21";
    if (value > 65) return "Age cannot exceed 65";
    return null;
  }
  
  function validateCPFUsage(value) {
    if (isNaN(value)) return "Please enter a valid amount";
    if (value < 0) return "CPF usage cannot be negative";
    return null;
  }
  
  // Main Logic
  document.addEventListener('DOMContentLoaded', function() {
    const inputs = {
      propertyValuation: document.getElementById('propertyValuation'),
      outstandingLoan: document.getElementById('outstandingLoan'),
      yearsSincePurchase: document.getElementById('yearsSincePurchase'),
      buyerShare: document.getElementById('buyerShare'),
      residency: document.querySelector('input[name="residency"]:checked'),
      buyerAge: document.getElementById('buyerAge'),
      sellerShare: document.getElementById('sellerShare'),
      cpfUsage: document.getElementById('cpfUsage')
    };
  
    const errors = {
      propertyValuation: document.getElementById('propertyValuationError'),
      outstandingLoan: document.getElementById('outstandingLoanError'),
      buyerShare: document.getElementById('buyerShareError'),
      buyerAge: document.getElementById('buyerAgeError'),
      sellerShare: document.getElementById('sellerShareError'),
      cpfUsage: document.getElementById('cpfUsageError')
    };
  
    const labels = {
      propertyValuation: document.querySelector('label[for="propertyValuation"]'),
      outstandingLoan: document.querySelector('label[for="outstandingLoan"]'),
      buyerShare: document.querySelector('label[for="buyerShare"]'),
      buyerAge: document.querySelector('label[for="buyerAge"]'),
      sellerShare: document.querySelector('label[for="sellerShare"]'),
      cpfUsage: document.querySelector('label[for="cpfUsage"]')
    };
  
    function updateSellerShare() {
      const buyerShare = parseFloat(inputs.buyerShare.value) || 0;
      inputs.sellerShare.value = (100 - buyerShare).toFixed(0);
    }
  
    function calculate() {
      const valuation = parseFloat(inputs.propertyValuation.value) || 0;
      const loan = parseFloat(inputs.outstandingLoan.value) || 0;
      const yearsOwned = inputs.yearsSincePurchase.value;
      const buyerShare = parseFloat(inputs.buyerShare.value) / 100 || 0;
      const sellerShare = parseFloat(inputs.sellerShare.value) / 100 || 0;
      const residency = document.querySelector('input[name="residency"]:checked').value;
      const age = parseFloat(inputs.buyerAge.value) || 0;
      const cpf = parseFloat(inputs.cpfUsage.value) || 0;
  
      // Validate inputs
      const validationErrors = [
        validatePropertyValuation(valuation),
        validateOutstandingLoan(loan),
        validateBuyerShare(buyerShare * 100, sellerShare * 100),
        validateBuyerAge(age),
        validateCPFUsage(cpf)
      ].filter(error => error);
  
      Object.keys(errors).forEach(key => {
        errors[key].style.display = 'none';
        labels[key].classList.remove('error');
      });
  
      if (validationErrors.length > 0) {
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').innerText = validationErrors.join(' | ');
        return;
      }
  
      document.getElementById('error').style.display = 'none';
  
      // Buyer Calculations
      const buyerPropertyShare = valuation * buyerShare;
      const buyerLoanLiability = loan * buyerShare;
      const purchasePrice = valuation * sellerShare;
      const cash5Percent = purchasePrice * 0.05;
      const cashCPF20Percent = purchasePrice * 0.20;
      const bankLoan75Percent = purchasePrice * 0.75;
      const newTotalLoan = buyerLoanLiability + bankLoan75Percent;
      const tenure = Math.min(25, 65 - age);
      const monthlyInstallment = calculateMonthlyInstallment(newTotalLoan, 2.5, tenure);
      const bsd = calculateBSD(purchasePrice);
      const absd = calculateABSD(purchasePrice, residency);
      const legalFees = 3000;
  
      // Seller Calculations
      const sellerPropertyShare = valuation * sellerShare;
      const sellerLoanLiability = loan * sellerShare;
      const sellingPrice = valuation * sellerShare;
      const ssd = calculateSSD(sellingPrice, yearsOwned);
      const sellerLegalFees = 3000;
      const cashProceeds = sellingPrice - sellerLoanLiability - cpf;
  
// Render Results with enhanced UI
const results = document.getElementById('results');
  
// Check if all required data is available
if (!valuation || valuation <= 0) {
  // Show initial message if calculation hasn't been done yet
  results.innerHTML = `
    <div class="results-header">
      <h2 class="section-title">Decoupling Results</h2>
      <p class="results-subtitle">Enter your property details above to see the breakdown</p>
    </div>
    
    <div class="initial-message">
      <div class="initial-message-icon">
        <img src="https://loan-eligibility.vercel.app/image/calculator_icon.png" alt="Calculator Icon">
      </div>
      <div class="initial-message-content">
        <div class="initial-message-title">Decoupling Calculator</div>
        <div class="initial-message-description">
          Enter the decoupling details above to estimate costs for both buyer and seller. Results will update automatically as you input values.
        </div>
      </div>
    </div>
  `;
  return;
}

// Otherwise, show full calculation results
results.innerHTML = `
  <div class="results-header">
    <h2 class="section-title">Decoupling Results</h2>
    <p class="results-subtitle">Based on your inputs - ${formatMoney(valuation)} property valuation</p>
  </div>
  
  <div class="results-container">
    <div class="result-card buyer-card">
      <div class="result-card-header">
        <div class="result-card-icon">
          <img src="https://loan-eligibility.vercel.app/image/TLC_Square.png" alt="Buyer Icon">
        </div>
        <h3 class="result-card-title">Buyer's Perspective</h3>
      </div>
      
      <div class="result-section">
        <h4 class="result-section-title">Property</h4>
        <div class="result-row">
          <span class="result-label">Property Share</span>
          <span class="result-value">${formatMoney(buyerPropertyShare)}</span>
        </div>
        <div class="result-row">
          <span class="result-label">Loan Liability</span>
          <span class="result-value">${formatMoney(buyerLoanLiability)}</span>
        </div>
        <div class="result-row highlight">
          <span class="result-label">Purchase Price</span>
          <span class="result-value primary">${formatMoney(purchasePrice)}</span>
        </div>
      </div>
      
      <div class="result-section">
        <h4 class="result-section-title">Financing</h4>
        <div class="result-row">
          <span class="result-label">5% Cash</span>
          <span class="result-value">${formatMoney(cash5Percent)}</span>
        </div>
        <div class="result-row">
          <span class="result-label">20% Cash/CPF</span>
          <span class="result-value">${formatMoney(cashCPF20Percent)}</span>
        </div>
        <div class="result-row">
          <span class="result-label">75% Bank Loan</span>
          <span class="result-value">${formatMoney(bankLoan75Percent)}</span>
        </div>
        <div class="result-row">
          <span class="result-label">New Total Loan</span>
          <span class="result-value">${formatMoney(newTotalLoan)}</span>
        </div>
        <div class="result-row">
          <span class="result-label">Tenure</span>
          <span class="result-value">${tenure} years</span>
        </div>
        <div class="result-row highlight">
          <span class="result-label">Monthly Installment</span>
          <span class="result-value important">${formatMoney(monthlyInstallment)}</span>
        </div>
      </div>
      
      <div class="result-section">
        <h4 class="result-section-title">Duties & Fees</h4>
        <div class="result-row">
          <span class="result-label">Buyer's Stamp Duty</span>
          <span class="result-value negative">${formatMoney(bsd)}</span>
        </div>
        <div class="result-row">
          <span class="result-label">Additional Buyer's Stamp Duty</span>
          <span class="result-value negative">${formatMoney(absd)}</span>
        </div>
        <div class="result-row">
          <span class="result-label">Legal Fees</span>
          <span class="result-value negative">${formatMoney(legalFees)} +/-</span>
        </div>
        
      </div>
    </div>
    
    <div class="result-card seller-card">
      <div class="result-card-header">
        <div class="result-card-icon">
          <img src="https://loan-eligibility.vercel.app/image/TLC_Square.png" alt="Seller Icon">
        </div>
        <h3 class="result-card-title">Seller's Perspective</h3>
      </div>
      
      <div class="result-section">
        <h4 class="result-section-title">Property</h4>
        <div class="result-row">
          <span class="result-label">Property Share</span>
          <span class="result-value">${formatMoney(sellerPropertyShare)}</span>
        </div>
        <div class="result-row">
          <span class="result-label">Loan Liability</span>
          <span class="result-value">${formatMoney(sellerLoanLiability)}</span>
        </div>
        <div class="result-row highlight">
          <span class="result-label">Selling Price</span>
          <span class="result-value primary">${formatMoney(sellingPrice)}</span>
        </div>
      </div>
      
      <div class="result-section">
        <h4 class="result-section-title">Liabilities</h4>
        <div class="result-row">
          <span class="result-label">Outstanding Loan</span>
          <span class="result-value negative">${formatMoney(sellerLoanLiability)}</span>
        </div>
        <div class="result-row">
          <span class="result-label">CPF Usage (Refund to OA)</span>
          <span class="result-value negative">${formatMoney(cpf)}</span>
        </div>
      </div>
      
      <div class="result-section">
        <h4 class="result-section-title">Duties & Fees</h4>
        <div class="result-row">
          <span class="result-label">Seller's Stamp Duty</span>
          <span class="result-value negative">${formatMoney(ssd)}</span>
        </div>
        <div class="result-row">
          <span class="result-label">Legal Fees</span>
          <span class="result-value negative">${formatMoney(sellerLegalFees)} +/-</span>
        </div>
        <div class="result-row highlight">
          <span class="result-label">Cash Proceeds</span>
          <span class="result-value important">${formatMoney(cashProceeds)}</span>
        </div>
      </div>
    </div>
  </div>
  
  <div class="disclaimer">
    <strong>Disclaimer from TLC:</strong> The approach illustrated above assumes that you intend to take financing for the part-purchase. 
    This is just one of several ways to structure a decoupling. Taking new financing is not mandatory — other alternatives such as an additional equity loan or tenure extension may also be available.
  </div>
`;
};
  
    // Event Listeners
    inputs.buyerShare.addEventListener('input', () => {
      updateSellerShare();
      calculate();
    });
  
    ['propertyValuation', 'outstandingLoan', 'yearsSincePurchase', 'buyerAge', 'cpfUsage'].forEach(id => {
      inputs[id].addEventListener('input', calculate);
    });
  
    document.querySelectorAll('input[name="residency"]').forEach(radio => {
      radio.addEventListener('change', calculate);
    });
  
    // Input Validation
    Object.keys(inputs).forEach(key => {
      if (key !== 'yearsSincePurchase' && key !== 'residency' && key !== 'sellerShare') {
        inputs[key].addEventListener('input', function() {
          const value = parseFloat(this.value);
          let error = null;
  
          switch (key) {
            case 'propertyValuation':
              error = validatePropertyValuation(value);
              break;
            case 'outstandingLoan':
              error = validateOutstandingLoan(value);
              break;
            case 'buyerShare':
              error = validateBuyerShare(value, parseFloat(inputs.sellerShare.value));
              break;
            case 'buyerAge':
              error = validateBuyerAge(value);
              break;
            case 'cpfUsage':
              error = validateCPFUsage(value);
              break;
          }
  
          if (error) {
            errors[key].textContent = error;
            errors[key].style.display = 'block';
            labels[key].classList.add('error');
          } else {
            errors[key].style.display = 'none';
            labels[key].classList.remove('error');
          }
        });
      }
    });
  
    // Initial calculation
    updateSellerShare();
    calculate();
  });